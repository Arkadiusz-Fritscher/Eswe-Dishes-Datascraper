import puppeteer from "puppeteer";
import { extractDateAndFormatToISO } from "./utils.js";

const baseUrl = "https://www.speiseplan-portal.klueh.de/menu/05%20ESWE%20Versorgungs%20AG/Speiseplan/date/";

export const getMenus = async (days) => {
  try {
    const headless = true;
    console.info(`Browser wird ${headless ? "im Headless Modus" : ""} gestartet`);

    const browser = await puppeteer.launch({
      headless: headless,
      defaultViewport: null,
    });

    const page = await browser.newPage();

    const data = [];

    console.info(`Daten werden von der Webseite gesammelt...`);

    for (const day of days) {
      const menu = await getMenuForDate(`${baseUrl}${day}`, page);

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

export const getMenuForDate = async (URL, page) => {
  if (!URL) {
    throw new Error("Please provide a URL");
  }

  try {
    // const page = await browser.newPage();

    await page.goto(URL, {
      waitUntil: "domcontentloaded",
    });

    // Wait for the menus container to be rendered
    await page.waitForSelector("div.category-grid.ng-star-inserted", {
      visible: true,
      timeout: 30000, // 5 seconds
    });

    // Fetch the dish container element
    const getCurrentMenu = await page.evaluate(() => {
      // Fetch the dish container element
      const dishes = document.querySelector("div.category-grid.ng-star-inserted");
      // Fetch the dish elements from the previously fetched dish container element
      const dishElements = dishes.querySelectorAll("app-category.grid-row.ng-star-inserted");

      const date = document.querySelector(
        "a.mat-tab-link.mat-focus-indicator.mat-tab-label-active"
      ).innerText;

      // Fetch the sub-elements from the previously fetched quote element
      return Array.from(dishElements).map((dish) => {
        // Fetch the sub-elements from the previously fetched quote element
        // Get the displayed text and return it (`.innerText`)
        const category = dish.querySelector("h3.category-header").innerText.trim();
        const content = dish.querySelector("mat-card-content.mat-card-content.product-content");
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
    const dayMenu = getCurrentMenu.map((menu) => {
      return { ...menu, date: extractDateAndFormatToISO(menu.date), source: URL };
    });

    return dayMenu;
  } catch (error) {
    if (error.name === "TimeoutError") {
      console.error("INFO - Timeout: Klüh Daten-Elemente konnten nicht gefunden werden.");
    } else {
      console.error("Ein Fehler ist aufgetreten:", error);

      process.exit(1); // Prozess mit Fehlercode beenden
    }
  }
};
