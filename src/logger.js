import * as fs from "fs";

export const log = (msg, level = "info") => {
  const date = new Date().toLocaleString();

  const logMessage = `[${date}] [${level.toUpperCase()}] ${msg}\n`;

  fs.appendFile("./logs.txt", logMessage, function (err) {
    if (err) {
      return console.log(err);
    }
  });
};
