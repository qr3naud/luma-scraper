from flask import Flask, request, jsonify
from flask_cors import CORS
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json
import time
import requests
import os

app = Flask(__name__)
CORS(app)  # Allow Lovable frontend to call this API

# Configuration
CLAY_WEBHOOK = os.getenv("CLAY_WEBHOOK_URL", "https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-57e7800b-a201-4ef6-b06e-ad5ffe128c51")
MAX_USERS = int(os.getenv("MAX_USERS", "5"))

@app.route('/scrape', methods=['POST'])
def scrape_and_process():
    try:
        data = request.json
        event_url = data.get("event_url")
        user_description = data.get("description", "")
        callback_url = data.get("callback_url")  # Where Clay should send results back
        
        if not event_url:
            return jsonify({"error": "Missing event_url"}), 400
            
        print(f"Scraping event: {event_url}")
        print(f"User looking for: {user_description}")
        
        # Scrape the event
        contacts = scrape_luma_event(event_url)
        
        # Send to Clay with user description and callback
        clay_payload = {
            "event_url": event_url,
            "user_description": user_description,
            "callback_url": callback_url,
            "contacts": contacts
        }
        
        send_to_clay(clay_payload)
        
        return jsonify({
            "status": "success", 
            "message": f"Scraped {len(contacts)} contacts and sent to Clay",
            "contacts_found": len(contacts)
        }), 200
        
    except Exception as e:
        print(f"Error in scrape_and_process: {str(e)}")
        return jsonify({"error": str(e)}), 500

def scrape_luma_event(event_url):
    """Scrape Luma event and return list of contacts"""
    contacts = []
    
    # Setup browser
    options = Options()
    options.add_argument("--headless")  # Run in headless mode for deployment
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--user-data-dir=/tmp/chrome-user-data")
    
    driver = webdriver.Chrome(options=options)
    
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
        print("Page title after login:", driver.title)
        time.sleep(5)

        # Open guest list modal
        wait = WebDriverWait(driver, 10)
        guest_trigger = wait.until(EC.element_to_be_clickable((By.XPATH, "//div[contains(text(), 'others')]")))
        guest_trigger.click()

        modal = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "lux-modal-body"))
        )

        # Scroll to load all guests
        for _ in range(8):
            driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", modal)
            time.sleep(1)

        # Scrape guests
        guest_blocks = driver.find_elements(By.XPATH, "//div[contains(@class, 'gap-2 spread')]")

        for idx, guest in enumerate(guest_blocks):
            if idx >= MAX_USERS:
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

            # Extract social links
            raw_links = [l.get_attribute("href") for l in guest.find_elements(By.TAG_NAME, "a")]
            cleaned_links = list(set(raw_links))
            socials = extract_socials(cleaned_links)

            contact = {
                "name": name,
                "profile_url": profile_url,
                **socials
            }
            contacts.append(contact)

    finally:
        driver.quit()
    
    return contacts

def extract_socials(links):
    """Extract social media links from a list of URLs"""
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

def send_to_clay(payload):
    """Send scraped data to Clay for processing"""
    headers = {"Content-Type": "application/json"}
    res = requests.post(CLAY_WEBHOOK, headers=headers, json=payload)
    if res.status_code != 200:
        print("❌ Clay error:", res.status_code, res.text)
        raise Exception(f"Clay webhook failed: {res.text}")
    else:
        print(f"✅ Sent to Clay: {len(payload.get('contacts', []))} contacts")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=True)
