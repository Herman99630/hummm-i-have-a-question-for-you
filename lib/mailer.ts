import { Resend } from "resend";

export function getMailer() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is missing.");
  return new Resend(apiKey);
}

export function getEmailFrom() {
  return process.env.EMAIL_FROM || "Date Invitation <hello@notify.herman99.click>";
}

export function getAppUrl() {
  return (process.env.APP_URL || "https://herman99.click").replace(/\/$/, "");
}
