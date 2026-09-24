#!/usr/bin/env node
/*
  Encrypts data.js -> data.enc.js with a password (AES-256-GCM, PBKDF2-SHA256).
  Crew photos in images/crew/ are baked into the encrypted file too, so they
  only show up after the password. data.js and the photos stay on your machine
  (they're in .gitignore); only data.enc.js is published.

  Usage:  node encrypt.js "the-password"
*/
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { webcrypto: crypto } = require("crypto");

const password = process.argv[2] || process.env.MV_PASSWORD;
if (!password) {
  console.error('Usage: node encrypt.js "the-password"');
  process.exit(1);
}

const ITERATIONS = 250000;
const b64 = (buf) => Buffer.from(buf).toString("base64");

(async () => {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "data.js"), "utf8"), sandbox);
  const trip = sandbox.window.TRIP;
  for (const c of trip.crew) {
    const file = path.join(__dirname, "images", "crew", c.photo || "");
    if (c.photo && fs.existsSync(file)) {
      c.photoData = "data:image/jpeg;base64," + fs.readFileSync(file).toString("base64");
      console.log("  + photo for " + c.name);
    }
  }
  const src = "window.TRIP = " + JSON.stringify(trip) + ";";
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(src));
  const out =
    "/* Encrypted trip data. Edit data.js, then run: node encrypt.js \"password\" */\n" +
    "window.TRIP_ENC = " + JSON.stringify({ iter: ITERATIONS, salt: b64(salt), iv: b64(iv), ct: b64(ct) }) + ";\n";
  fs.writeFileSync(path.join(__dirname, "data.enc.js"), out);
  console.log("Wrote data.enc.js (" + out.length + " bytes)");
})();
