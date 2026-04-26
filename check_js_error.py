from playwright.sync_api import sync_playwright
import os

html_path = 'file://' + os.path.abspath('V1/portfolio/index.html')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    errors = []
    page.on("pageerror", lambda err: errors.append(err.message))
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    
    page.goto(html_path)
    page.wait_for_timeout(2000)
    
    print("ERRORS:")
    for e in errors:
        print("-", e)
    
    browser.close()
