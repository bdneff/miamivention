/* Shared 1997-grade JavaScript for every page. */
(function () {
  var T = null; // set once the trip data is unlocked
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Parse "2026-11-12T13:45" as Miami time.
  function miami(s) {
    return new Date(s + ":00" + T.utcOffset);
  }

  // ---------- the sunset, the grid, the palms ----------
  var PALM =
    '<svg class="palm PLACE" viewBox="0 0 220 420" aria-hidden="true">' +
    '<path d="M96 420c6-90 10-190 30-300l14 2c-16 110-20 210-26 298z"/>' +
    '<path d="M132 112c-30-40-80-52-128-30 44-6 86 6 126 36z"/>' +
    '<path d="M132 112c-44-8-92 14-118 62 34-34 74-50 116-54z"/>' +
    '<path d="M134 110c-8-44-40-80-86-96 38 24 62 58 80 100z"/>' +
    '<path d="M136 110c18-44 52-70 96-76-40 16-68 42-90 82z"/>' +
    '<path d="M136 112c40-22 80-18 116 14-38-16-74-16-112 -4z"/>' +
    '<path d="M136 114c34 10 60 38 70 82-18-34-42-58-74-74z"/>' +
    '<path d="M132 116c-22 18-34 48-30 86 8-34 20-60 36-80z"/>' +
    '<circle cx="128" cy="122" r="7"/><circle cx="140" cy="124" r="6"/>' +
    "</svg>";

  function scene() {
    var s = el("div", { class: "scene", "aria-hidden": "true" },
      '<div class="sun"></div><div class="mountains"></div><div class="horizon"></div>' +
      '<div class="floor-wrap"><div class="floor"></div></div>' +
      PALM.replace("PLACE", "left") + PALM.replace("PLACE", "right"));
    document.body.prepend(s);
    document.body.appendChild(el("div", { class: "scanlines", "aria-hidden": "true" }));
  }

  // ---------- VHS on-screen display ----------
  function osd() {
    var left = el("div", { class: "osd left", "aria-hidden": "true" }, '<span class="blink">▶</span> PLAY');
    var right = el("div", { class: "osd right", "aria-hidden": "true" });
    document.body.append(left, right);
    var t0 = Date.now();
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var s = Math.floor((Date.now() - t0) / 1000);
      right.textContent = "SP " + Math.floor(s / 3600) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60);
    }
    tick();
    setInterval(tick, 1000);
  }

  // ---------- Windows 95 taskbar + start menu ----------
  var here = /itinerary/.test(location.pathname) ? "itinerary" : "home";
  function taskbar() {
    var bar = el("nav", { class: "taskbar", "aria-label": "Site" },
      '<button class="btn start" aria-expanded="false" aria-controls="startmenu">🌴 Start</button>' +
      '<div class="tasks">' +
      '<a class="btn' + (here === "home" ? " here" : "") + '" href="index.html">🏠 Home</a>' +
      '<a class="btn' + (here === "itinerary" ? " here" : "") + '" href="itinerary.html">📅 Itinerary</a>' +
      "</div>" +
      '<div class="tray"><span title="Pooply™ is running in the background">💩</span><span>🔊</span><span class="tz">MIA</span><span class="clock"></span></div>');
    var menu = el("div", { class: "startmenu", id: "startmenu", hidden: "" },
      '<div class="side">Miamivention<b>95</b></div><ul>' +
      '<li><a href="index.html">🏠 Homepage</a></li>' +
      '<li><a href="index.html#showroom">🏎️ Showroom</a></li>' +
      '<li><a href="index.html#crew">💃 Supermodels</a></li>' +
      '<li><a href="index.html#vip">🍾 Bottle Service</a></li>' +
      '<li><a href="index.html#guestbook">📖 Guestbook</a></li>' +
      "<li><hr></li>" +
      '<li><a href="itinerary.html">📅 Itinerary</a></li>' +
      '<li><a href="itinerary.html#lodging">🏨 Lodging</a></li>' +
      '<li><a href="itinerary.html#flights">✈️ Flights</a></li>' +
      '<li><a href="itinerary.html#packing">🧳 Packing List</a></li>' +
      "<li><hr></li>" +
      '<li><button type="button" data-pooply>💩 Pooply™</button></li>' +
      '<li><button type="button" data-logoff>🔒 Log Off...</button></li>' +
      '<li><button type="button" data-shutdown>🔌 Shut Down...</button></li>' +
      "</ul>");
    document.body.append(menu, bar);

    var start = bar.querySelector(".start");
    function setOpen(open) {
      menu.hidden = !open;
      start.setAttribute("aria-expanded", open);
    }
    start.addEventListener("click", function (e) { e.stopPropagation(); setOpen(menu.hidden); });
    document.addEventListener("click", function (e) { if (!menu.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    menu.querySelector("[data-logoff]").addEventListener("click", function () {
      try { localStorage.removeItem(PASS_KEY); sessionStorage.removeItem(PASS_KEY); } catch (e) {}
      location.reload();
    });
    menu.querySelector("[data-pooply]").addEventListener("click", function () {
      setOpen(false);
      popup("Pooply™ AI has analyzed this website.\n\nPoop Score: 94. Bristol Type 4. Well hydrated.\n\nUnlike you.", "Pooply™");
    });
    menu.querySelector("[data-shutdown]").addEventListener("click", function () {
      setOpen(false);
      popup("It is now safe to turn off your vacation.\n\nJust kidding. It is never safe. You live here now.", "Shut Down Miamivention");
    });

    // Miami time in the system tray
    var clock = bar.querySelector(".clock");
    function tick() {
      clock.textContent = new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });
    }
    tick();
    setInterval(tick, 15000);
  }

  // Swap any broken image for a placeholder.
  function placeholder(img) {
    var ph = el("div", { class: "ph" });
    ph.innerHTML =
      '<div class="emoji">' + esc(img.dataset.emoji || "📼") + "</div>" +
      "<span>" + esc(img.dataset.missing || "IMAGE LOADING... PLEASE WAIT (56K)") + "</span>";
    img.replaceWith(ph);
  }
  function watchImages(root) {
    (root || document).querySelectorAll("img[data-missing]").forEach(function (img) {
      if (img.complete && img.naturalWidth === 0) placeholder(img);
      else img.addEventListener("error", function () { placeholder(img); });
    });
  }

  // Countdown to the trip.
  function countdown(node) {
    if (!node) return;
    var start = miami(T.start), end = miami(T.end);
    var label = node.querySelector(".label"), digits = node.querySelector(".digits");
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var now = new Date();
      if (now >= end) {
        label.textContent = "MIAMIVENTION HAS CONCLUDED";
        digits.textContent = "PLEASE CALL YOUR DOCTOR";
        return;
      }
      if (now >= start) {
        label.textContent = "STATUS";
        digits.textContent = "🌴 IN SESSION. GOD HELP US 🌴";
        return;
      }
      var s = Math.floor((start - now) / 1000);
      var d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
      label.textContent = "T-MINUS UNTIL MIAMIVENTION";
      digits.textContent = d + "d " + pad(h) + "h " + pad(m) + "m " + pad(s % 60) + "s";
    }
    tick();
    setInterval(tick, 1000);
  }

  // Hit counter: a big fake base number plus your own visits.
  function counter(node) {
    if (!node) return;
    var visits = 0;
    try {
      visits = parseInt(localStorage.getItem("mv-visits") || "0", 10) + 1;
      localStorage.setItem("mv-visits", visits);
    } catch (e) {}
    var n = String(1337420 + visits * 69);
    while (n.length < 8) n = "0" + n;
    node.innerHTML = n.split("").map(function (c) { return "<b>" + c + "</b>"; }).join("");
  }

  // Neon sparkle cursor trail.
  var glyphs = ["✦", "✧", "★", "✩", "◆"], colors = ["#ff71ce", "#01cdfe", "#05ffa1", "#b967ff", "#fffb96"], last = 0;
  function sparkle(x, y) {
    var now = Date.now();
    if (now - last < 40) return;
    last = now;
    var s = el("div", { class: "sparkle", "aria-hidden": "true" }, glyphs[Math.floor(Math.random() * glyphs.length)]);
    s.style.left = x + "px";
    s.style.top = y + "px";
    s.style.color = colors[Math.floor(Math.random() * colors.length)];
    document.body.appendChild(s);
    setTimeout(function () { s.remove(); }, 900);
  }

  // Make it rain.
  var loot = ["🐬", "🌴", "💿", "📼", "🍹", "💸", "💎", "🌺", "🕶️", "🍾", "💩"];
  function rain() {
    var d = el("div", { class: "rain", "aria-hidden": "true" }, loot[Math.floor(Math.random() * loot.length)]);
    d.style.left = Math.random() * 100 + "vw";
    d.style.fontSize = 18 + Math.random() * 20 + "px";
    d.style.animationDuration = 6 + Math.random() * 7 + "s";
    d.style.setProperty("--spin", (Math.random() * 720 - 360) + "deg");
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 13500);
  }

  // Burst wherever you click.
  var burst = ["🐬", "✨", "💸", "🌴", "💎", "💩"];
  function pop(x, y) {
    for (var i = 0; i < 12; i++) {
      var b = el("div", { class: "burst", "aria-hidden": "true" }, burst[i % burst.length]);
      var a = (Math.PI * 2 * i) / 12, r = 60 + Math.random() * 70;
      b.style.left = x + "px";
      b.style.top = y + "px";
      b.style.setProperty("--dx", Math.cos(a) * r + "px");
      b.style.setProperty("--dy", Math.sin(a) * r + "px");
      document.body.appendChild(b);
      setTimeout(function (n) { return function () { n.remove(); }; }(b), 900);
    }
  }

  // The blimp.
  function blimp() {
    document.body.appendChild(el("div", { class: "blimp", "aria-hidden": "true" },
      '<div class="blimp-body"><span>THE WORLD IS YOURS</span></div><div class="blimp-fin"></div><div class="blimp-car"></div>'));
  }

  // ---------- the jukebox (YouTube embed, Winamp costume) ----------
  var SONG = { id: "kTpZlpyiRKU", title: "POP DAT THANG (David Guetta Mix)", artist: "DaBaby" };
  var yt = null, ytReady = false, wantPlay = false, userPaused = false, jb = null;

  function jukebox() {
    var mini = false;
    var saved = null;
    try { saved = localStorage.getItem("mv-jb-mini"); } catch (e) {}
    mini = saved === null ? window.matchMedia("(max-width: 600px)").matches : saved === "1";
    jb = el("section", { class: "jukebox" + (mini ? " mini" : ""), "aria-label": "Music player" },
      '<div class="jb-bar"><span>🎵 WINAMP</span><button class="jb-min" type="button" aria-label="Show or hide video">' + (mini ? "□" : "_") + "</button></div>" +
      '<div class="jb-screen"><div class="jb-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
      '<div class="jb-marquee"><span>' + esc(SONG.artist + " — " + SONG.title) + " ✦ " + esc(SONG.artist + " — " + SONG.title) + " ✦ </span></div>" +
      '<button class="jb-play" type="button" aria-label="Play">▶</button></div>' +
      '<button class="jb-unmute" type="button">🔇 TAP ANYWHERE FOR SOUND</button>' +
      '<div class="jb-video"><div id="jb-yt"></div></div>' +
      '<a class="jb-link" href="https://www.youtube.com/watch?v=' + SONG.id + '" target="_blank" rel="noopener">Player blocked? Open on YouTube ↗</a>');
    document.body.appendChild(jb);
    document.body.classList.add("has-jukebox");

    jb.querySelector(".jb-min").addEventListener("click", function () {
      var m = jb.classList.toggle("mini");
      this.textContent = m ? "□" : "_";
      try { localStorage.setItem("mv-jb-mini", m ? "1" : "0"); } catch (e) {}
    });
    jb.querySelector(".jb-play").addEventListener("click", function (e) {
      e.stopPropagation();
      if (jb.classList.contains("playing") && !jb.classList.contains("muted")) { userPaused = true; if (yt) yt.pauseVideo(); }
      else { userPaused = false; play(); }
    });

    // Start the music on the first tap or keypress anywhere (browsers block sound until then).
    // Keeps listening until the sound is actually on (the player may still be loading).
    function firstTouch(e) {
      if (e.target.closest && e.target.closest(".jb-play")) return; // the play button handles itself
      if (!userPaused) play();
      if (ytReady && !yt.isMuted()) {
        document.removeEventListener("pointerdown", firstTouch, true);
        document.removeEventListener("keydown", firstTouch, true);
      }
    }
    document.addEventListener("pointerdown", firstTouch, true);
    document.addEventListener("keydown", firstTouch, true);

    window.onYouTubeIframeAPIReady = function () {
      yt = new YT.Player("jb-yt", {
        videoId: SONG.id,
        width: "100%",
        height: "100%",
        playerVars: { playsinline: 1, loop: 1, playlist: SONG.id, rel: 0, modestbranding: 1 },
        events: {
          onReady: function () {
            ytReady = true;
            play();
            // If the browser blocked sound, keep the party going muted until the first tap.
            setTimeout(function () {
              if (yt.getPlayerState() !== 1) { yt.mute(); yt.playVideo(); }
              if (yt.isMuted()) jb.classList.add("muted");
            }, 1200);
          },
          onStateChange: function (e) {
            var on = e.data === 1;
            jb.classList.toggle("playing", on);
            var b = jb.querySelector(".jb-play");
            b.textContent = on ? "❚❚" : "▶";
            b.setAttribute("aria-label", on ? "Pause" : "Play");
          },
          onError: function () { jb.classList.add("offline"); },
        },
      });
    };
    var tag = el("script", { src: "https://www.youtube.com/iframe_api" });
    tag.onerror = function () { jb.classList.add("offline"); };
    document.head.appendChild(tag);
    setTimeout(function () { if (!ytReady) jb.classList.add("offline"); }, 8000);
  }

  function play() {
    wantPlay = true;
    if (!ytReady) return;
    try { yt.unMute(); yt.setVolume(80); yt.playVideo(); jb.classList.remove("muted"); } catch (e) {}
  }

  window.toggleDisco = function (btn) {
    var on = document.documentElement.classList.toggle("disco");
    btn.textContent = on ? "🪩 DISCO MODE: ON" : "🪩 DISCO MODE";
  };

  // Windows 95 style dialog (real alert() is too modern)
  function popup(msg, title) {
    var back = el("div", { class: "dlg-back" });
    back.innerHTML = '<div class="dlg" role="alertdialog" aria-modal="true"><div class="dlg-title"><span>' +
      esc(title || "Miamivention.exe") + '</span><button class="dlg-x" aria-label="Close">×</button></div>' +
      '<div class="dlg-body"><span class="dlg-icon">⚠️</span><div>' + esc(msg).replace(/\n/g, "<br>") + "</div></div>" +
      '<div class="dlg-foot"><button class="btn dlg-ok">OK</button></div></div>';
    function close() { back.remove(); }
    back.addEventListener("click", function (e) {
      if (e.target === back || e.target.closest(".dlg-x, .dlg-ok")) close();
    });
    document.body.appendChild(back);
    back.querySelector(".dlg-ok").focus();
  }

  // ---------- password gate ----------
  // The trip data ships encrypted (data.enc.js). It is decrypted in the browser
  // with the password, so nobody can read it by viewing the source.
  var PASS_KEY = "mv-pass", queue = [], unlocked = false;

  function bytes(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  // Each password unlocks its own copy of the data key; try them all.
  function decrypt(pass) {
    var E = window.TRIP_ENC, subtle = window.crypto && crypto.subtle;
    if (!E || !subtle) return Promise.reject(new Error("unsupported"));
    function unwrap(slot) {
      return subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"])
        .then(function (km) {
          return subtle.deriveKey({ name: "PBKDF2", salt: bytes(slot.salt), iterations: E.iter, hash: "SHA-256" },
            km, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
        })
        .then(function (kek) { return subtle.decrypt({ name: "AES-GCM", iv: bytes(slot.iv) }, kek, bytes(slot.key)); });
    }
    var attempt = Promise.reject();
    E.keys.forEach(function (slot) { attempt = attempt.catch(function () { return unwrap(slot); }); });
    return attempt
      .then(function (raw) { return subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]); })
      .then(function (key) { return subtle.decrypt({ name: "AES-GCM", iv: bytes(E.iv) }, key, bytes(E.ct)); })
      .then(function (buf) { new Function(new TextDecoder().decode(buf))(); });
  }

  function login(done) {
    var back = el("div", { class: "gatekeeper" });
    back.innerHTML =
      '<form class="secret" autocomplete="off">' +
      '<p class="katakana">秘密のパスワード</p>' +
      '<label class="secret-title" for="mv-pass">Secret Password</label>' +
      '<div class="secret-row"><input id="mv-pass" type="password" autocomplete="current-password" required aria-describedby="mv-err">' +
      '<button class="secret-go" type="submit" aria-label="Enter">➜</button></div>' +
      '<p class="secret-hint">*hint* Brandon G\'s Favorite Thing</p>' +
      '<p class="secret-err" id="mv-err" role="alert"></p>' +
      "</form>";
    document.body.appendChild(back);
    var form = back.querySelector("form"), pass = back.querySelector("#mv-pass"), err = back.querySelector(".secret-err");
    var nope = ["ACCESS DENIED", "Nope. Ask the group chat.", "Wrong. Have you tried being cooler?", "Incorrect. Security has been notified (it's Miami Brandon, he's asleep).", "Still wrong. This is why you weren't in the first group chat.", "Wrong. That's a Pooply™-level failure."], tries = 0;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      err.textContent = "Verifying...";
      var entered = pass.value.trim().toLowerCase();
      decrypt(entered).then(function () {
        try { localStorage.setItem(PASS_KEY, entered); } catch (e2) {}
        back.classList.add("granted");
        setTimeout(function () { back.remove(); }, 600);
        done();
      }, function () {
        err.textContent = nope[tries++ % nope.length];
        form.classList.remove("shake");
        void form.offsetWidth;
        form.classList.add("shake");
        pass.select();
      });
    });
    pass.focus();
  }

  // Each person types the password once per device; after that it's remembered
  // (Start > Log Off forgets it).
  function gate(done) {
    if (window.TRIP) return done(); // plain data.js loaded (local editing)
    var saved = null;
    try { saved = localStorage.getItem(PASS_KEY) || sessionStorage.getItem(PASS_KEY); } catch (e) {}
    if (!saved) return login(done);
    decrypt(saved).then(function () {
      try { localStorage.setItem(PASS_KEY, saved); } catch (e) {}
      done();
    }, function () {
      try { localStorage.removeItem(PASS_KEY); sessionStorage.removeItem(PASS_KEY); } catch (e) {}
      login(done);
    });
  }

  function ready(fn) { if (unlocked) fn(); else queue.push(fn); }

  window.MV = { el: el, esc: esc, miami: miami, watchImages: watchImages, popup: popup, ready: ready };

  document.addEventListener("DOMContentLoaded", function () {
    scene();
    osd();
    taskbar();
    jukebox();
    gate(function () {
      T = window.TRIP;
      unlocked = true;
      var desk = document.querySelector(".desktop");
      if (desk) desk.hidden = false;
      countdown(document.querySelector(".countdown"));
      counter(document.querySelector(".counter"));
      queue.splice(0).forEach(function (fn) { fn(); });
      watchImages();
    });
    if (!calm) {
      blimp();
      for (var i = 0; i < 5; i++) setTimeout(rain, i * 400);
      setInterval(rain, window.matchMedia("(max-width: 600px)").matches ? 1600 : 800);
      document.addEventListener("mousemove", function (e) { sparkle(e.clientX, e.clientY); });
      document.addEventListener("touchmove", function (e) {
        var t = e.touches[0];
        if (t) sparkle(t.clientX, t.clientY);
      }, { passive: true });
      document.addEventListener("click", function (e) {
        if (!e.target.closest("a, button, input, label, .dlg-back, .startmenu")) pop(e.clientX, e.clientY);
      });
    }
  });
})();
