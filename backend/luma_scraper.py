# Refactored Luma scraper to send bundled user data to Clay

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json
import time
import requests
import sys

# --- Config ---
MAX_USERS = 50
CLAY_WEBHOOK = "https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-57e7800b-a201-4ef6-b06e-ad5ffe128c51"

# --- Input ---
if len(sys.argv) < 2:
    print("❌ Error: Missing event URL as argument.")
    sys.exit(1)

event_url = sys.argv[1]

# --- Helpers ---
def extract_socials(links):
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

def send_to_clay(user_data):
    headers = {"Content-Type": "application/json"}
    res = requests.post(CLAY_WEBHOOK, headers=headers, json=user_data)
    if res.status_code != 200:
        print("❌ Clay error:", res.status_code, res.text)
    else:
        print(f"✅ Sent to Clay: {user_data}")

# --- Setup Browser ---
options = Options()
options.add_argument("--user-data-dir=/tmp/chrome-user-data")
driver = webdriver.Chrome(options=options)

# --- Login via cookies ---
driver.get("https://lu.ma/")
time.sleep(3)

with open("cookies.json", "r") as f:
    cookies = json.load(f)

for cookie in cookies:
    for k in ["sameSite", "storeId", "hostOnly", "session"]:
        cookie.pop(k, None)
    driver.add_cookie(cookie)

# --- Visit Event Page ---
driver.get(event_url)
print("Page title after login:", driver.title)
time.sleep(5)

# --- Open Guest List Modal ---
wait = WebDriverWait(driver, 5)
guest_trigger = wait.until(EC.element_to_be_clickable((By.XPATH, "//div[contains(text(), 'others')]")))
guest_trigger.click()

modal = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.CLASS_NAME, "lux-modal-body"))
)

for _ in range(8):
    driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", modal)
    time.sleep(1)

# --- Scrape Guests ---
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

    # Scan visible social links only
    raw_links = [l.get_attribute("href") for l in guest.find_elements(By.TAG_NAME, "a")]
    cleaned_links = list(set(raw_links))
    socials = extract_socials(cleaned_links)

    user_data = {
        "name": name,
        "profile_url": profile_url,
        **socials
    }
    send_to_clay(user_data)

# --- Cleanup ---
driver.quit()
print("✅ Done scraping!")
