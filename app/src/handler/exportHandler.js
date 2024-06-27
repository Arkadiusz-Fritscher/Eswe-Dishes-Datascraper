"use strict";
import * as fs from "fs";
import { getDatesToScrape, getDateDetail } from "../utils/utils.js";

const exportPath = process.env.DISHES_EXPERT_PATH;
const exportFileName = process.env.DISHES_EXPORT_FILE_NAME;

function formatFileName(firstDate, lastDate) {
  const firstDateParts = getDateDetail(firstDate);
  const lastDateParts = getDateDetail(lastDate);
  const lastDateTimestamp = new Date(lastDate).getTime();

  const dates = `${firstDateParts.day}_${firstDateParts.month}-${lastDateParts.day}_${lastDateParts.month}-${lastDateTimestamp}`;

  return { dates, timestamp: lastDateTimestamp };
}

export function checkIfScrapingIsNeeded(fileName = exportFileName) {
  // Check if the file exists
  if (!fs.existsSync(exportPath + fileName + ".json")) {
    // Check if folder exists, if not create it
    if (!fs.existsSync(exportPath)) {
      fs.mkdirSync(exportPath);
    }
    return true;
  }

  // Load the data from the JSON file
  const fileData = fs.readFileSync(exportPath + fileName + ".json", "utf8");
  const jsonData = JSON.parse(fileData);
  const { last_update, data } = jsonData;
  const availableDates = [...new Set(data.map((entry) => entry.date))];
  const requiredDates = getDatesToScrape();

  // Check if the required dates are available
  const isScrapingNeeded = requiredDates.some((date) => !availableDates.includes(date));

  if (isScrapingNeeded) {
    console.info(`New Data to scrape is available. Last update: ${last_update}`);
  } else {
    console.info(`Scraped data is up to date. Last update: ${last_update}`);
  }

  return isScrapingNeeded;
}

export function saveDishesToJsonFile(data, fileName = exportFileName) {
  const result = {
    last_update: new Date().toISOString(),
    data: data,
  };

  const jsonData = JSON.stringify(result, null, 2); // `null, 2` für formatierte JSON-Daten
  const { dates, timestamp } = formatFileName(data[0].date, data[data.length - 1].date);
  const path = `${exportPath}${fileName}-${dates}.json`;

  fs.writeFileSync(path, jsonData, "utf8", (err) => {
    if (err) {
      console.error("Fehler beim Schreiben der Datei:", err);
      throw err;
    }
  });

  console.info(`Erfolgreich ${data.length} Datensätze in "${path}" gespeichert`);
  return { path, timestamp };
}
