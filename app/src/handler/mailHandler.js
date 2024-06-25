"use strict";
import nodemailer from "nodemailer";
import { getLatestEntries, changeMailStatus } from "./dbHandler.js";
import { log } from "../utils/utils.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_FROM, // your email
    pass: process.env.MAIL_APP_KEY,
  },
});

const mailOptions = {
  from: process.env.MAIL_FROM, // your email
  to: process.env.MAIL_TO, // email you want to send to
  subject: "Aktuelle Speiseplan-Daten",
  text: "Daten sind im Anhang.",
};

export function sendMail(id, options) {
  if (!process.env.MAIL_FROM || !process.env.MAIL_APP_KEY || !process.env.MAIL_TO) {
    console.error("Please provide all email credentials in the .env file to activate email sending.");
    return;
  }

  transporter.sendMail({ ...mailOptions, ...options }, function (error, info) {
    if (error) {
      console.log(error);
      throw error;
    } else {
      if (info.response.includes("250 2.0.0 OK")) {
        console.info(`Daten wurden erfolgreich als E-Mail an ${process.env.MAIL_TO} versendet.`);
        log(`Daten wurden erfolgreich als E-Mail versendet`, "info");
        changeMailStatus(id);
      }
      return info.response;
    }
  });
}

function isEmailRequired() {
  const lastEntries = getLatestEntries(2);

  if (!lastEntries?.length || (lastEntries.length === 1 && !lastEntries.at(-1)?.mailSent)) {
    return true;
  }

  if (lastEntries.at(-1)?.timestamp > lastEntries.at(-2)?.timestamp && !lastEntries.at(-1)?.mailSent) {
    return true;
  }

  return false;
}

export async function handleMailSending(fileName, filePath, id) {
  if (isEmailRequired()) {
    const options = {
      attachments: [
        {
          filename: fileName,
          path: filePath,
        },
      ],
    };
    sendMail(id, options);
  } else {
    console.info("Die Daten wurden bereits per E-Mail versendet.");
    log(
      `Es wurde keine E-Mail für die ID: ${id} versendet. Die Daten sind nicht aktueller als die bereits versendeten Daten`,
      "info"
    );
  }
}
