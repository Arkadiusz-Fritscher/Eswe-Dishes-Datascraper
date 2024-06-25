"use strict";
import * as fs from "fs";
import { log } from "../utils/utils.js";
const DB_FILE = "./app/src/db/db.json";

function initDb() {
  const db = {
    data: [],
  };

  writeJsonFileSync(DB_FILE, db);
}

export function readJsonFileSync(filepath) {
  try {
    const data = fs.readFileSync(filepath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    throw err;
  }
}

export function writeJsonFileSync(filepath, data) {
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf8");
    return { status: "success", message: "File written successfully" };
  } catch (err) {
    return { status: "error", message: err.message };
  }
}

function getDb() {
  try {
    const db = readJsonFileSync(DB_FILE);
    return db;
  } catch (err) {
    if (err.code === "ENOENT" || err.message === "Unexpected end of JSON input") {
      initDb();
      getDb();
    } else {
      throw err;
    }
  }
}

function setToDb(data) {
  const db = getDb();
  db.data.push({ ...data, id: db.data.at(-1)?.id + 1 || 1 });
  const status = writeJsonFileSync(DB_FILE, db);
  return { ...status, data: db.data.at(-1) };
}

export function setData(filepath, date) {
  const schema = {
    createdAt: new Date().toISOString(),
    filepath,
    timestamp: date,
    mailSent: false,
  };

  return setToDb(schema);
}

export function getLatestEntries(amount = 2) {
  return getDb().data?.slice(-Math.abs(amount)) || null;
}

export function changeMailStatus(id) {
  const db = getDb();
  const entry = db.data.find((entry) => entry.id === id);
  entry.mailSent = true;
  writeJsonFileSync(DB_FILE, db);
  log(`E-Mail status für DB-Eintrag mit der ID: ${id} geändert`, "info");
}
