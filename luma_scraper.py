from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import json
import time

def extract_socials(links):
    socials = {}
    for href in links:
        if not href or "lu.ma" in href:
            continue  # skip invalid or internal Luma links
        if "linkedin.com/in/" in href:
            socials["LinkedIn"] = href
        elif "x.com" in href or "twitter.com" in href:
            socials["Twitter"] = href
        elif "warpcast.com" in href:
            socials["Warpcast"] = href
        elif "instagram.com" in href:
            socials["Instagram"] = href
        elif href.startswith("http"):
            socials.setdefault("Other", []).append(href)
    return socials


# Setup Chrome with visible window (can go headless later)
options = Options()
options.add_argument("--user-data-dir=/tmp/chrome-user-data")  # temp profile
driver = webdriver.Chrome(options=options)

# Open Luma so we can inject cookies
driver.get("https://lu.ma/")
time.sleep(3)

# Load cookies from file
with open("cookies.json", "r") as f:
    cookies = json.load(f)

for cookie in cookies:
    # Clean up fields Selenium doesn't like
    cookie.pop("sameSite", None)
    cookie.pop("storeId", None)
    cookie.pop("hostOnly", None)
    cookie.pop("session", None)
    driver.add_cookie(cookie)

# Reload event page with logged-in session
driver.get("https://lu.ma/9uxgw8l4?tk=b5jKIu")
print("Page title after login:", driver.title)
time.sleep(5)

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Step 1: Click on the full guest list trigger (text like "Qiming Liu, ... and X others")
wait = WebDriverWait(driver, 5)
guest_trigger = wait.until(EC.element_to_be_clickable((By.XPATH, "//div[contains(text(), 'others')]")))
guest_trigger.click()

# Step 2: Wait for the modal to appear
modal = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.CLASS_NAME, "lux-modal-body"))
)

# Scroll to load all visible guest blocks
for _ in range(8):  # increase if needed
    driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", modal)
    time.sleep(1)

# Step 4: Scrape all guests
max_users = 20
guest_blocks = driver.find_elements(By.XPATH, "//div[contains(@class, 'gap-2 spread')]")

for idx, guest in enumerate(guest_blocks):
    if idx >= max_users:
        break

    # Try to extract name
    try:
        name_elem = guest.find_element(By.CLASS_NAME, "name")
        name = name_elem.text.strip()
    except:
        name = "Unknown"

    # Try to extract profile URL
    try:
        profile_elem = guest.find_element(By.XPATH, ".//a[contains(@href, '/user/')]")
        profile_href = profile_elem.get_attribute("href")
        if profile_href.startswith("/user/"):
            full_profile_url = "https://lu.ma" + profile_href
        else:
            full_profile_url = profile_href
    except:
        full_profile_url = None

    print(f"\n[{idx+1}] Name: {name}")

    if full_profile_url:
        print(" → Visiting profile:", full_profile_url)
        driver.execute_script("window.open('');")
        driver.switch_to.window(driver.window_handles[1])
        driver.get(full_profile_url)
        time.sleep(2)

        raw_links = [l.get_attribute("href") for l in driver.find_elements(By.TAG_NAME, "a")]
        cleaned_links = list(set(raw_links))
        socials = extract_socials(cleaned_links)

        for platform, url in socials.items():
            if isinstance(url, list):
                for u in url:
                    print(f" - {platform}: {u}")
            else:
                print(f" - {platform}: {url}")

        driver.close()
        driver.switch_to.window(driver.window_handles[0])
        time.sleep(1)
    else:
        print(" → No profile URL found.")
    
# Close the driver
driver.quit()