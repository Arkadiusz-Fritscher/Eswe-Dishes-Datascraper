export function getDateOfSpecificDay(weekOffset, dayOfWeek) {
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 (Sonntag) bis 6 (Samstag)

  // Berechne den Unterschied zum gewünschten Tag dieser Woche
  const difference = dayOfWeek - currentDayOfWeek;

  // Berechne das Datum des gewünschten Tages mit dem Offset für die Woche
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + difference + weekOffset * 7);

  return targetDate;
}

export function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Monate sind 0-basiert
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function extractDateAndFormatToISO(dateString) {
  // Extrahiere den Tag und den Monat aus dem String
  const dateParts = dateString.match(/(\d{2})\.(\d{2})\./);
  if (!dateParts) {
    throw new Error("Invalid date format");
  }

  const day = dateParts[1];
  const month = dateParts[2];

  // Hole das aktuelle Jahr
  const currentYear = new Date().getFullYear();

  // Erstelle ein Date-Objekt
  const date = new Date(`${currentYear}-${month}-${day}`);

  // Formatiere das Datum im ISO-Format (YYYY-MM-DD)
  const isoDate = date.toISOString().split("T")[0];

  return isoDate;
}

export function getWeekdaysFromMondayToFriday(date) {
  const dayOfWeek = date.getDay(); // 0 (Sonntag) bis 6 (Samstag)
  const currentDate = date.getDate();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  // Berechne den Montag dieser Woche
  const monday = new Date(date);
  monday.setDate(currentDate - (dayOfWeek - 1)); // (dayOfWeek - 1) gibt den Abstand zum Montag

  // Erstelle ein Array für die Wochentage von Montag bis Freitag
  const weekdays = [];
  for (let i = 0; i < 5; i++) {
    // 5 Tage von Montag bis Freitag
    const weekday = new Date(monday);
    weekday.setDate(monday.getDate() + i);
    weekdays.push(weekday.toISOString().split("T")[0]); // Im ISO-Format
  }

  return weekdays;
}

export function getWeekNumber(d) {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  // Return array of year and week number
  return [d.getUTCFullYear(), weekNo];
}
