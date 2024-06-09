import { getDateOfSpecificDay, getWeekdaysFromMondayToFriday } from "./src/utils.js";
import { getMenus } from "./src/scraper.js";
import { saveDataToJsonFile } from "./src/saveData.js";
import { log } from "./src/logger.js";

const checkDay = 5; // Friday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)

// Die (Freitage) der aktuellen, nächsten und letzten Woche
const weekDays = [
  getDateOfSpecificDay(-1, checkDay),
  getDateOfSpecificDay(0, checkDay),
  // getDateOfSpecificDay(1, checkDay),
];

// Erstelle ein Array mit den Wochentagen von Montag bis Freitag
const menuDays = weekDays.flatMap((day) => getWeekdaysFromMondayToFriday(new Date(day)));

async function init() {
  // Daten sammeln
  console.info("Scraping gestartet");
  const data = await getMenus(menuDays);

  // Daten speichern
  if (!data.length) {
    console.warn("Keine Daten gefunden");
    log("No data found", "warning");
  } else {
    console.info(`${data.length} Daten werden als Json-Datei gespeichert...`);
    saveDataToJsonFile(data, "speiseplan");
    log(`Erfolgreich ${data.length} Menüs gespeichert`, "info");
  }

  console.info("Scraping beendet");
}

init();
