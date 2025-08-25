import time
import re
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Listen for console events and print them
    page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

    try:
        # 1. Navigate to the app
        page.goto("http://localhost:9002", timeout=60000)

        # 2. Wait for initial weather data to load
        current_weather_card = page.locator("#current-weather")
        expect(current_weather_card).to_be_visible(timeout=30000)

        # Take a screenshot after initial load
        page.screenshot(path="jules-scratch/verification/01_initial_load.png")

        # 3. Search for a new city
        placeholder_regex = re.compile("Search for a city...|Buscar una ciudad...")
        search_input = page.get_by_placeholder(placeholder_regex)
        expect(search_input).to_be_visible()
        search_input.fill("London")

        # Click the first suggestion
        suggestion = page.locator("div[role='button']", has_text="London")
        expect(suggestion).to_be_visible()
        suggestion.click()

        # 4. Wait for the weather to update for the new city
        location_header = page.locator("#current-weather h2")
        expect(location_header).to_have_text("London, GB", timeout=15000)

        # Take a screenshot after searching
        page.screenshot(path="jules-scratch/verification/02_searched_city.png")

        # 5. Click on a forecast day
        forecast_card = page.locator("#forecast")
        # Click the first button within the forecast card that is not "Today"
        forecast_day_button = forecast_card.locator("button").nth(1)
        forecast_day_text = forecast_day_button.text_content()
        forecast_day_button.click()

        time.sleep(2) # Wait for animations
        page.screenshot(path="jules-scratch/verification/03_forecast_day.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

with sync_playwright() as p:
    run_verification(p)
