"use strict";

import { getDatesToScrape, log } from "./src/utils/utils.js";
import { getMenus } from "./src/scraper.js";
import { handleMailSending, getWeek } from "./src/handler/mailHandler.js";
import { saveDishesToJsonFile, checkIfScrapingIsNeeded } from "./src/handler/exportHandler.js";
import { setData } from "./src/handler/dbHandler.js";

const weekDays = getDatesToScrape();
const menuDays = weekDays;

const saveScapingData = (data) => {
  if (data?.length) {
    console.info(`${data.length} Daten werden als Json-Datei gespeichert...`);
    const { path, timestamp } = saveDishesToJsonFile(data);

    log(`Erfolgreich ${data.length} Menüs gespeichert`, "info");
    const { status, data: dbEntry } = setData(path, timestamp);

    handleMailSending(path.split("/").at(-1), path, dbEntry?.id);
    return true;
  }

  console.warn("Keine Daten gefunden");
  log("No data found", "warning");
  return false;
};

async function scrape() {
  console.info("Scraping gestartet");
  const data = await getMenus(menuDays);

  console.info("Scraping beendet");
  return data;
}

async function init() {
  const isScrapingNeeded = checkIfScrapingIsNeeded();

  if (!isScrapingNeeded) {
    log("Scraping not necessary", "info");
    return;
  }

  const data = await scrape();
  const isDataSaved = saveScapingData(data);
}

init();

// console.log(readJsonFileSync("./src/db.json"));
