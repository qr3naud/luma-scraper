from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import json
import time

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
wait = WebDriverWait(driver, 10)
guest_trigger = wait.until(EC.element_to_be_clickable((By.XPATH, "//div[contains(text(), 'others')]")))
guest_trigger.click()

# Step 2: Wait for the modal to appear
wait.until(EC.presence_of_element_located((By.CLASS_NAME, "lux-modal-body")))

# Step 3: Scroll the modal to load more guests
modal = driver.find_element(By.CLASS_NAME, "lux-modal-body")
for _ in range(5):  # Scroll multiple times to load more guests
    driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", modal)
    time.sleep(1)

# Step 4: Scrape all guests
guests = driver.find_elements(By.XPATH, "//div[contains(@class, 'gap-2 spread')]")

for guest in guests:
    try:
        name = guest.find_element(By.CLASS_NAME, "name").text
        print("Name:", name)
    except:
        name = "Unknown"
        print("Name not found")

    # Find all <a> tags inside this guest block
    links = guest.find_elements(By.XPATH, ".//a[contains(@href, 'instagram.com') or contains(@href, 'linkedin.com') or contains(@href, 'twitter.com')]")

    if links:
        for link in links:
            print(" - Social:", link.get_attribute("href"))
    else:
        print(" - No social links")
    
# Close the driver
driver.quit()