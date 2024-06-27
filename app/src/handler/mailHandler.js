"use strict";
import nodemailer from "nodemailer";
import { getLatestEntries, changeMailStatus } from "./dbHandler.js";
import { log, getWeekNumber, getWeekdaysFromMondayToFriday } from "../utils/utils.js";

export function getWeek(string) {
  const day = string.split("_")[0];
  const month = string.split("_")[1];
  const year = new Date().getFullYear();
  const date = new Date(`${year}-${month}-${day}`);
  return {
    kw: getWeekNumber(date),
    start: new Date(getWeekdaysFromMondayToFriday(date)[0]).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    end: new Date(getWeekdaysFromMondayToFriday(date).at(-1)).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  };
}

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
    const startDates = getWeek(fileName.split("-")[1]);
    const endDates = getWeek(fileName.split("-")[2]);

    const options = {
      subject: `Neue Speiseplan-Daten für die KW${startDates?.kw} und KW${endDates?.kw}`,
      html: `
      <!DOCTYPE html>
          <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <style>
                    body {
                        font-family: HelveticaNeueLTStd-Roman, 'Helvetica Neue', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
                        background-color: #f8f9fa;
                        margin: 0;
                        padding: 24px;
                    }

                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }

                    h1,
                    h2,
                    h3 {
                        color: #141414;
                    }

                    code {
                        line-break: anywhere;
                        font-size: 0.9rem;
                    }

                    h1 {
                        font-size: 1.5rem;
                        margin-bottom: 1.5rem;
                    }

                    h2 {
                        font-size: 1.2rem;
                        margin-bottom: 1rem;
                    }

                    p,
                    a,
                    span {
                        font-size: 1rem;
                        line-height: 1.5;
                        color: #2f2f2f;
                    }

                    ul {
                        list-style-type: none;
                        margin-bottom: 1rem;
                    }

                    li {
                        margin-bottom: 0.5rem;
                    }
                </style>
            </head>

            <body>
                <div style="max-width: 600px; margin-inline: auto;">
                    <header>
                        <h1>Neue Speiseplan-Daten für KW${startDates.kw} und KW${endDates.kw} verfügbar</h1>
                        <h2>Sehr geehrte Damen und Herren,</h2>
                    </header>
                    <main style="margin-block: 1.5rem;">
                        <p>wir möchten Sie informieren, dass für die folgenden Kalenderwochen neue Speiseplan-Daten bereitstehen:</p><br>
                        <ul>
                            <li><strong>KW${startDates.kw} (${startDates.start} - ${startDates.end})</strong></li>
                            <li><strong>KW${endDates.kw} (${endDates.start} - ${endDates.end})</strong></li>
                        </ul>

                        <div
                            style="padding: 1rem; border:1px solid rgb(226, 226, 226); border-radius: 0.3rem; background-color: rgb(242, 242, 242); margin-block: 1.5rem">
                            <p>Bitte laden Sie die Daten aus dem Anhang dieser E-Mail herunter und speichern Sie die Datei als <code>'speiseplan.json'</code> ab.</p><br>
                            <p>Anschließend ersetzen Sie die bestehende Datei im Filesystem des Typo3 Intranets unter dem Pfad <code>'fileadmin/dishes/speiseplan.json'</code> mit der neuen Datei.</p>
                        </div>

                        <p>Vielen Dank für Ihre Kooperation und guten Appetit!</p>
                        <p style="margin-top: 1.5rem;"><strong>Mit freundlichen Grüßen,</strong></p>
                        <p>Ihr Team</p>
                    </main>
                    <footer style="border-top: 1px solid gray; padding-top: 1rem">
                        <p style="font-size: 0.75rem; ">Diese E-Mail wurde automatisch versendet. Bitte antworten Sie nicht auf diese Nachricht.</p>
                        <a href="mailto:arkadiusz.fritscher@eswe.com" style="font-size: 0.75rem; ">Kontakt</a>
                    </footer>
                </div>
            </body>
        </html>
      `,
      attachments: [
        {
          filename: fileName,
          path: filePath,
        },
      ],
    };
    sendMail(id, options);
  } else {
    console.info("Dieser Datensatz wurde bereits als E-Mail versendet. Es gibt keine aktuelleren Daten.");
    log(
      `Es wurde keine E-Mail für die ID: ${id} versendet. Die Daten sind nicht aktueller als die bereits versendeten Daten`,
      "info"
    );
  }
}
