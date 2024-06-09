import * as fs from "fs";

export function saveDataToJsonFile(data, filePath = "scrapedDataExport") {
  // Konvertiere das Daten-Objekt in einen JSON-String

  const exportPath = "./export/";
  const result = {
    last_update: new Date().toISOString(),
    data: data,
  };

  const jsonData = JSON.stringify(result, null, 2); // `null, 2` für formatierte JSON-Daten

  // Schreibe den JSON-String in die Datei
  fs.writeFile(exportPath + filePath + ".json", jsonData, "utf8", (err) => {
    if (err) {
      console.error("Fehler beim Schreiben der Datei:", err);
      return;
    }
    console.info(
      `Es wurden erfolgreich ${data.length} Datensätze in ${exportPath}${filePath}.json geschrieben`
    );
  });
}
