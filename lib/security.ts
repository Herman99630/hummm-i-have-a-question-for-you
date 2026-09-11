import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function safeHashEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createVerificationCode() {
  return String(randomInt(100000, 1000000));
}

export function createPublicCode() {
  return randomBytes(9).toString("base64url").toLowerCase();
}

export function createManageToken() {
  return randomBytes(32).toString("base64url");
}

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] ?? character);
}
