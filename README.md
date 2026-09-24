# MIAMIVENTION 🌴

The official homepage. Plain HTML/CSS/JS, no build step, hosted on GitHub Pages.

## The password

All trip details (names, flights, the Airbnb, crew photos) live in `data.enc.js`, encrypted with AES-256. The page decrypts them in the browser after someone enters the secret password. Nothing private is readable in the repo or by viewing the page source.

`data.js` (the readable version) and `images/crew/*.jpg` are in `.gitignore` and never get pushed.

## Editing the trip

1. Edit **`data.js`**: dates, crew, flights, lodging, itinerary, to-dos, packing list.
2. Crew photos go in `images/crew/` using the filenames in `data.js`.
3. Re-encrypt:
   ```sh
   node encrypt.js "first-password" "second-password"
   ```
4. Commit and push `data.enc.js`. The site updates in about a minute.

Flight landings and takeoffs at MIA/FLL are added to the day-by-day itinerary automatically, so only list the plans in `days`.

Every password listed in step 3 unlocks the site. To add, change or drop one, rerun step 3 with the new list. The site asks for the password once per visit; it's forgotten when the browser tab is closed.

## Other bits

- **Timezone:** `utcOffset` in `data.js` is `-04:00` (Mar to Nov) or `-05:00` (Nov to Mar).
- **Photo credits:** `credits.js` holds the Wikimedia Commons attributions. The licenses require them.
- **Music:** the Winamp player embeds the official YouTube video (`SONG` in `site.js`). Browsers mute it until the first tap.

## Run locally

Open `index.html` in a browser and enter the password.
