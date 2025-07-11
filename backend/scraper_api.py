from flask import Flask, request, jsonify
from flask_cors import CORS
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import json
import time
import requests
import os
import re
from urllib.parse import urljoin, urlparse

app = Flask(__name__)
CORS(app)  # Allow frontend to call this API

# Configuration
N8N_WEBHOOK = "https://qrenaud.app.n8n.cloud/webhook/user"
MAX_USERS = int(os.getenv("MAX_USERS", "20"))
PROFILE_SCRAPING_ENABLED = True  # Set to False to disable profile visiting

@app.route('/scrape', methods=['POST'])
def scrape_and_process():
    try:
        data = request.json
        event_url = data.get("event_url")
        user_intent = data.get("description", "")
        callback_url = data.get("callback_url")  # Optional callback URL
        
        if not event_url:
            return jsonify({"error": "Missing event_url"}), 400
            
        print(f"🔍 Scraping event: {event_url}")
        print(f"👤 User looking for: {user_intent}")
        
        # Scrape the event with enhanced profile data
        contacts = scrape_luma_event(event_url)
        
        # Send to n8n webhook
        n8n_payload = {
            "event_url": event_url,
            "user_intent": user_intent,
            "callback_url": callback_url,
            "contacts": contacts,
            "total_found": len(contacts),
            "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        send_to_n8n(n8n_payload)
        
        return jsonify({
            "status": "success", 
            "message": f"Scraped {len(contacts)} contacts with enhanced profile data and sent to n8n",
            "contacts_found": len(contacts),
            "enhanced_profiles": sum(1 for c in contacts if c.get("profile_scraped", False))
        }), 200
        
    except Exception as e:
        print(f"❌ Error in scrape_and_process: {str(e)}")
        return jsonify({"error": str(e)}), 500

def scrape_luma_event(event_url):
    """Scrape Luma event and return list of contacts with enhanced profile data"""
    contacts = []
    
    # Setup browser
    options = Options()
    options.add_argument("--headless")  # Run in headless mode for deployment
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--user-data-dir=/tmp/chrome-user-data")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    try:
        # Login via cookies
        driver.get("https://lu.ma/")
        time.sleep(3)

        with open("cookies.json", "r") as f:
            cookies = json.load(f)

        for cookie in cookies:
            for k in ["sameSite", "storeId", "hostOnly", "session"]:
                cookie.pop(k, None)
            driver.add_cookie(cookie)

        # Visit event page
        driver.get(event_url)
        print(f"📄 Page title after login: {driver.title}")
        time.sleep(5)

        # Open guest list modal
        wait = WebDriverWait(driver, 10)
        try:
            guest_trigger = wait.until(EC.element_to_be_clickable((By.XPATH, "//div[contains(text(), 'others')]")))
            guest_trigger.click()
        except TimeoutException:
            print("⚠️ Could not find guest list trigger, trying alternative selectors...")
            # Try alternative selectors for guest list
            guest_triggers = [
                "//div[contains(text(), 'guest')]",
                "//div[contains(text(), 'attendee')]",
                "//button[contains(text(), 'guest')]"
            ]
            for selector in guest_triggers:
                try:
                    guest_trigger = driver.find_element(By.XPATH, selector)
                    guest_trigger.click()
                    break
                except:
                    continue

        modal = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "lux-modal-body"))
        )

        # Scroll to load all guests
        print("📜 Loading all guests...")
        for i in range(8):
            driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", modal)
            time.sleep(1)
            print(f"   Scroll {i+1}/8")

        # Scrape guests from modal
        guest_blocks = driver.find_elements(By.XPATH, "//div[contains(@class, 'gap-2 spread')]")
        print(f"👥 Found {len(guest_blocks)} guests in modal")

        for idx, guest in enumerate(guest_blocks):
            if idx >= MAX_USERS:
                print(f"🚫 Reached max users limit ({MAX_USERS})")
                break

            try:
                name = guest.find_element(By.CLASS_NAME, "name").text.strip()
            except:
                name = "Unknown"

            try:
                profile_elem = guest.find_element(By.XPATH, ".//a[contains(@href, '/user/')]")
                profile_url = profile_elem.get_attribute("href")
                if profile_url.startswith("/user/"):
                    profile_url = "https://lu.ma" + profile_url
            except:
                profile_url = None

            print(f"👤 Processing {idx+1}/{min(len(guest_blocks), MAX_USERS)}: {name}")

            # Extract basic social links from modal
            raw_links = [l.get_attribute("href") for l in guest.find_elements(By.TAG_NAME, "a")]
            cleaned_links = list(set(raw_links))
            modal_socials = extract_socials(cleaned_links)

            contact = {
                "name": name,
                "profile_url": profile_url,
                "profile_scraped": False,
                **modal_socials
            }

            # Enhanced: Visit user profile for comprehensive social links
            if PROFILE_SCRAPING_ENABLED and profile_url:
                profile_data = scrape_user_profile(driver, profile_url)
                if profile_data:
                    contact.update(profile_data)
                    contact["profile_scraped"] = True
                    print(f"   ✅ Enhanced profile data collected")
                else:
                    print(f"   ⚠️ Could not scrape profile")
            else:
                print(f"   📋 Using modal data only")

            contacts.append(contact)

    finally:
        driver.quit()
    
    print(f"✅ Scraping complete: {len(contacts)} contacts collected")
    return contacts

def scrape_user_profile(driver, profile_url, max_retries=2):
    """Visit user profile and extract comprehensive social links and bio data"""
    if not profile_url:
        return {}
    
    for attempt in range(max_retries):
        try:
            print(f"   🔍 Visiting profile: {profile_url} (attempt {attempt+1})")
            
            # Visit profile page
            driver.get(profile_url)
            time.sleep(2)  # Rate limiting
            
            profile_data = {}
            
            # Extract bio/description
            try:
                bio_selectors = [
                    ".bio", ".description", ".about", 
                    "[data-testid='bio']", ".user-bio",
                    "//div[contains(@class, 'bio')]",
                    "//div[contains(@class, 'description')]"
                ]
                for selector in bio_selectors:
                    try:
                        if selector.startswith("//"):
                            bio_elem = driver.find_element(By.XPATH, selector)
                        else:
                            bio_elem = driver.find_element(By.CSS_SELECTOR, selector)
                        if bio_elem and bio_elem.text.strip():
                            profile_data["bio"] = bio_elem.text.strip()
                            break
                    except:
                        continue
            except:
                pass

            # Extract title/job
            try:
                title_selectors = [
                    ".title", ".job-title", ".position",
                    ".headline", ".user-title",
                    "//div[contains(@class, 'title')]",
                    "//div[contains(@class, 'job')]"
                ]
                for selector in title_selectors:
                    try:
                        if selector.startswith("//"):
                            title_elem = driver.find_element(By.XPATH, selector)
                        else:
                            title_elem = driver.find_element(By.CSS_SELECTOR, selector)
                        if title_elem and title_elem.text.strip():
                            profile_data["title"] = title_elem.text.strip()
                            break
                    except:
                        continue
            except:
                pass

            # Extract ALL links from profile page
            all_links = []
            try:
                link_elements = driver.find_elements(By.TAG_NAME, "a")
                all_links = [link.get_attribute("href") for link in link_elements if link.get_attribute("href")]
                
                # Also check for links in text (common pattern on Luma)
                text_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'http')]")
                for elem in text_elements:
                    text = elem.text
                    # Extract URLs from text using regex
                    urls = re.findall(r'https?://[^\s<>"]+', text)
                    all_links.extend(urls)
                    
            except Exception as e:
                print(f"   ⚠️ Error extracting links: {e}")

            # Enhanced social extraction
            if all_links:
                enhanced_socials = extract_enhanced_socials(all_links)
                profile_data.update(enhanced_socials)
                # Count non-empty social platforms
                social_count = len([v for v in enhanced_socials.values() if v and v != []])
                print(f"   📱 Found {social_count} social platforms")

            return profile_data

        except Exception as e:
            print(f"   ❌ Profile scraping attempt {attempt+1} failed: {e}")
            if attempt == max_retries - 1:
                return {}
            time.sleep(1)
    
    return {}

def extract_socials(links):
    """Extract social media links from a list of URLs (basic version)"""
    socials = {
        "linkedin_url": None,
        "twitter_url": None,
        "instagram_url": None,
        "other_links": []
    }
    for href in links:
        if not href or "lu.ma" in href:
            continue
        if "linkedin.com/in/" in href:
            socials["linkedin_url"] = href
        elif "x.com" in href or "twitter.com" in href:
            socials["twitter_url"] = href
        elif "instagram.com" in href:
            socials["instagram_url"] = href
        elif href.startswith("http"):
            socials["other_links"].append(href)
    return socials

def extract_enhanced_socials(links):
    """Enhanced social media extraction with more platforms and better detection"""
    socials = {
        "linkedin_url": None,
        "twitter_url": None,
        "instagram_url": None,
        "github_url": None,
        "youtube_url": None,
        "tiktok_url": None,
        "facebook_url": None,
        "medium_url": None,
        "website_url": None,
        "other_social_links": []
    }
    
    # Clean and deduplicate links
    clean_links = []
    for href in links:
        if not href or not isinstance(href, str):
            continue
        href = href.strip()
        if href.startswith("http") and "lu.ma" not in href:
            clean_links.append(href)
    
    clean_links = list(set(clean_links))  # Remove duplicates
    
    # Social platform patterns
    patterns = {
        "linkedin_url": [r"linkedin\.com/in/", r"linkedin\.com/company/"],
        "twitter_url": [r"(?:twitter\.com|x\.com)/", r"t\.co/"],
        "instagram_url": [r"instagram\.com/"],
        "github_url": [r"github\.com/"],
        "youtube_url": [r"youtube\.com/", r"youtu\.be/"],
        "tiktok_url": [r"tiktok\.com/"],
        "facebook_url": [r"facebook\.com/", r"fb\.com/"],
        "medium_url": [r"medium\.com/", r".*\.medium\.com"],
    }
    
    # Categorize links
    for href in clean_links:
        categorized = False
        
        # Check against social patterns
        for social_key, platform_patterns in patterns.items():
            for pattern in platform_patterns:
                if re.search(pattern, href, re.IGNORECASE):
                    if not socials[social_key]:  # Only set if not already found
                        socials[social_key] = href
                    categorized = True
                    break
            if categorized:
                break
        
        # If not a recognized social platform, check if it's a personal website
        if not categorized:
            domain = urlparse(href).netloc.lower()
            # Skip common non-personal domains
            skip_domains = [
                'google.com', 'gmail.com', 'outlook.com', 'yahoo.com',
                'zoom.us', 'calendly.com', 'eventbrite.com',
                'amazon.com', 'apple.com', 'microsoft.com'
            ]
            if not any(skip in domain for skip in skip_domains):
                if not socials["website_url"]:  # Use first non-social link as website
                    socials["website_url"] = href
                else:
                    socials["other_social_links"].append(href)
    
    return socials

def send_to_n8n(payload):
    """Send scraped data to n8n webhook for AI processing"""
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Luma-Scraper/1.0"
    }
    
    try:
        print(f"🚀 Sending {len(payload.get('contacts', []))} contacts to n8n...")
        res = requests.post(N8N_WEBHOOK, headers=headers, json=payload, timeout=30)
        
        if res.status_code == 200:
            print(f"✅ Successfully sent to n8n: {len(payload.get('contacts', []))} contacts")
        else:
            print(f"❌ n8n webhook error: {res.status_code} - {res.text}")
            raise Exception(f"n8n webhook failed: HTTP {res.status_code}")
            
    except requests.exceptions.Timeout:
        print("❌ n8n webhook timeout after 30 seconds")
        raise Exception("n8n webhook timeout")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to n8n webhook")
        raise Exception("n8n webhook connection failed")
    except Exception as e:
        print(f"❌ n8n webhook error: {e}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "n8n_webhook": N8N_WEBHOOK,
        "max_users": MAX_USERS,
        "profile_scraping": PROFILE_SCRAPING_ENABLED
    }), 200

@app.route('/config', methods=['GET'])
def get_config():
    return jsonify({
        "n8n_webhook": N8N_WEBHOOK,
        "max_users": MAX_USERS,
        "profile_scraping_enabled": PROFILE_SCRAPING_ENABLED
    }), 200

if __name__ == "__main__":
    print(f"🚀 Starting Enhanced Luma Scraper API")
    print(f"📡 n8n Webhook: {N8N_WEBHOOK}")
    print(f"👥 Max Users: {MAX_USERS}")
    print(f"🔍 Profile Scraping: {'Enabled' if PROFILE_SCRAPING_ENABLED else 'Disabled'}")
    app.run(host="0.0.0.0", port=10000, debug=True)
