"use strict";
import puppeteer from "puppeteer";
import { extractDateAndFormatToISO } from "./utils/utils.js";

export const getMenus = async (days) => {
  try {
    const headless = process.env.SCRAPE_HEADLESS === "true" ? true : false;
    const baseUrl = process.env.SCRAPE_BASE_URL;
    const executablePath = process.env.CHROMIUM_PATH ?? puppeteer.executablePath();
    console.info(`Browser wird ${headless ? "im Headless Modus" : ""} gestartet`);

    const browser = await puppeteer.launch({
      headless,
      executablePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    const data = [];

    console.info(`Daten werden von der Webseite gesammelt...`);

    for (const day of days) {
      const menu = await getMenuForDate(`${baseUrl}${day}`, page, browser);

      if (!menu || !menu.length) {
        console.warn(`[ - WARN - ] Keine Einträge für den ${day} gefunden`);
        break;
      }

      data.push(...menu);
      console.info(`[ - OK - ] ${day}`);
    }

    console.info(`Scraping erfolgreich. Es wurden Daten von ${data.length} Menüs gesammelt.`);

    await browser.close();
    console.info("Browser wurde geschlossen");

    return data;
  } catch (error) {
    console.error("Ein Fehler ist aufgetreten:", error);
    await browser.close();
    process.exit(1); // Prozess mit Fehlercode beenden
  }
};

export const getMenuForDate = async (URL, page, browser) => {
  if (!URL) {
    throw new Error("Please provide a URL");
  }

  try {
    // Navigate to the URL
    await page.goto(URL, {
      waitUntil: "domcontentloaded",
    });

    // Wait for the menus container to be rendered
    await page.waitForSelector("div.category-grid.ng-star-inserted", {
      visible: true,
      timeout: 30000, // 30 seconds
    });

    // Fetch the dish container element
    const scrapedPageData = await page.evaluate(async () => {
      // Fetch the dish container element
      const dishes = document.querySelector("div.category-grid.ng-star-inserted");
      // Fetch the dish elements from the previously fetched dish container element
      const dishElements = dishes.querySelectorAll("app-category.grid-row.ng-star-inserted");

      const date = document.querySelector(
        "a.mat-tab-link.mat-focus-indicator.mat-tab-label-active"
      ).innerText;
      // Fetch the sub-elements from the previously fetched quote element
      return Array.from(dishElements).map((dish) => {
        const category = dish.querySelector("h3.category-header").innerText.trim();
        const card = dish.querySelector("mat-card.mat-card.product-card");
        const content = card.querySelector("mat-card-content.mat-card-content.product-content");
        const title = content.querySelector(".product-title").innerText.trim();
        const price = content.querySelector(".price.ng-star-inserted").innerText.trim();
        const labelContainer = content.querySelector("app-product-label-list");
        const labelElements = labelContainer.querySelectorAll("img.ng-star-inserted");
        const labels = Array.from(labelElements).map((allergen) => {
          return allergen.title ?? allergen.alt;
        });

        return { date, category, title, labels, price };
      });
    });

    // Format the date
    const menu = scrapedPageData.map((data) => {
      return { ...data, date: extractDateAndFormatToISO(data.date) };
    });

    return menu;
  } catch (error) {
    if (error.name === "TimeoutError") {
      console.error("INFO - Timeout: Klüh Daten-Elemente konnten nicht gefunden werden.");
    } else {
      console.error("Ein Fehler ist aufgetreten:", error);

      process.exit(1); // Prozess mit Fehlercode beenden
    }
  }
};
