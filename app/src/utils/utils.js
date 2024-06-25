"use strict";
import * as fs from "fs";

export function getDatesToScrape() {
  const checkDay = 5; // Friday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)

  const weekDays = [
    // getDateOfSpecificDay(-1, checkDay),
    getDateOfSpecificDay(0, checkDay),
    getDateOfSpecificDay(1, checkDay),
  ];

  const menuDays = weekDays.flatMap((day) => getWeekdaysFromMondayToFriday(new Date(day)));

  return menuDays;
}

export function getDateOfSpecificDay(weekOffset, dayOfWeek) {
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 (Sonntag) bis 6 (Samstag)
  const difference = dayOfWeek - currentDayOfWeek;
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
  // Tag und den Monat aus dem String
  const dateParts = dateString.match(/(\d{2})\.(\d{2})\./);
  if (!dateParts) {
    throw new Error("Invalid date format");
  }

  const day = dateParts[1];
  const month = dateParts[2];
  const currentYear = new Date().getFullYear();
  const date = new Date(`${currentYear}-${month}-${day}`);
  const isoDate = date.toISOString().split("T")[0];

  return isoDate;
}

export function getWeekdaysFromMondayToFriday(date) {
  const dayOfWeek = date.getDay(); // 0 (Sonntag) bis 6 (Samstag)
  const currentDate = date.getDate();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  // Berechnet den Montag dieser Woche
  const monday = new Date(date);
  monday.setDate(currentDate - (dayOfWeek - 1)); // (dayOfWeek - 1) gibt den Abstand zum Montag

  // Array der Wochentage von Montag bis Freitag
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

export function getDateDetail(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  function toTwoDigits(number) {
    return number.toString().length === 1 ? `0${number}` : number;
  }

  return { day: toTwoDigits(day), month: toTwoDigits(month), year };
}

export const log = (msg, level = "info") => {
  const date = new Date().toLocaleString();
  const logMessage = `${date} - ${level.toUpperCase()}: ${msg}\n`;

  fs.appendFile("./logs.txt", logMessage, function (err) {
    if (err) {
      return console.log(err);
    }
  });
};
