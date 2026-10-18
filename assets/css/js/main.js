/* ==========================================================================
   FerranTech Birthday Experience — behaviour
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var STORAGE = {
    intro: "ft-birthday-intro-seen",
    letter: "ft-birthday-letter",
    wishes: "ft-birthday-wishes"
  };

  /* ================= HELPERS ================= */
  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }

  function escapeHTML(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function readStore(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeStore(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  /* ================= INTRO ================= */
  var intro = $("#intro");
  var introEnter = $("#intro-enter");
  var introSkip = $("#intro-skip");
  var replayIntro = $("#replay-intro");

  function dismissIntro() {
    if (!intro) return;
    intro.classList.add("is-done");
    doc.body.classList.remove("is-locked");
    try { sessionStorage.setItem(STORAGE.intro, "1"); } catch (e) {}
    window.setTimeout(function () {
      if (intro) intro.setAttribute("hidden", "");
    }, 750);
  }

  function showIntro() {
    if (!intro) return;
    intro.removeAttribute("hidden");
    intro.classList.remove("is-done");
    doc.body.classList.add("is-locked");
    if (introEnter) introEnter.focus();
  }

  if (intro) {
    var seen = false;
    try { seen = sessionStorage.getItem(STORAGE.intro) === "1"; } catch (e) {}

    if (seen || reduceMotion.matches) {
      intro.setAttribute("hidden", "");
      intro.classList.add("is-done");
    } else {
      doc.body.classList.add("is-locked");
      window.setTimeout(function () {
        if (introEnter) introEnter.focus();
      }, 300);
    }

    if (introEnter) introEnter.addEventListener("click", dismissIntro);
    if (introSkip) introSkip.addEventListener("click", dismissIntro);

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !intro.hasAttribute("hidden")) dismissIntro();
    });
  }

  if (replayIntro) {
    replayIntro.addEventListener("click", function () {
      try { sessionStorage.removeItem(STORAGE.intro); } catch (e) {}
      showIntro();
    });
  }

  /* ================= HEADER + PROGRESS ================= */
  var header = $("#site-header");
  var progressBar = $("#progress-bar");

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);

    if (progressBar) {
      var docEl = doc.documentElement;
      var max = docEl.scrollHeight - docEl.clientHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      progressBar.style.width = Math.min(100, Math.max(0, pct)) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ================= MOBILE MENU ================= */
  var menuToggle = $("#menu-toggle");
  var mobileMenu = $("#mobile-menu");

  function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.classList.toggle("is-open", open);
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
    });
    mobileMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuToggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 900) setMenu(false);
    });
  }

  /* ================= ACTIVE NAV ================= */
  var navLinks = $$(".nav-desktop a[href^='#']");
  var sections = navLinks
    .map(function (link) { return doc.getElementById(link.getAttribute("href").slice(1)); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          if (link.getAttribute("href") === "#" + entry.target.id) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* ================= REVEALS ================= */
  var revealNodes = $$("[data-reveal]");
  if (!("IntersectionObserver" in window) || reduceMotion.matches) {
    revealNodes.forEach(function (n) { n.classList.add("is-in"); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    revealNodes.forEach(function (n) { revealObs.observe(n); });
  }

  /* ================= PORTRAIT LOAD ================= */
  var portraitImg = $("#portrait-img");
  if (portraitImg) {
    if (portraitImg.complete && portraitImg.naturalWidth > 0) {
      portraitImg.classList.add("is-loaded");
    } else {
      portraitImg.addEventListener("load", function () { portraitImg.classList.add("is-loaded"); });
      portraitImg.addEventListener("error", function () {
        portraitImg.style.display = "none";
      });
    }
  }

  /* ================= COUNTDOWN ================= */
  var countdownEl = $("#countdown");
  var cfg = typeof BIRTHDAY_CONFIG !== "undefined" ? BIRTHDAY_CONFIG : null;

  if (countdownEl && cfg) {
    var y = cfg.date.year, m = cfg.date.month, d = cfg.date.day;
    // Local-time window: birthday day and the day after
    var start = new Date(y, m, d, 0, 0, 0, 0);
    var end   = new Date(y, m, d + 1, 0, 0, 0, 0);

    function pad(n) { return n < 10 ? "0" + n : String(n); }

    function units(ms) {
      var s = Math.max(0, Math.floor(ms / 1000));
      return {
        days: Math.floor(s / 86400),
        hours: Math.floor((s % 86400) / 3600),
        minutes: Math.floor((s % 3600) / 60),
        seconds: s % 60
      };
    }

    function render() {
      var now = new Date();

      if (now < start) {
        var u = units(start - now);
        countdownEl.innerHTML =
          '<div class="cd-unit"><span class="cd-num">' + u.days + '</span><span class="cd-label">Days</span></div>' +
          '<div class="cd-unit"><span class="cd-num">' + pad(u.hours) + '</span><span class="cd-label">Hours</span></div>' +
          '<div class="cd-unit"><span class="cd-num">' + pad(u.minutes) + '</span><span class="cd-label">Minutes</span></div>' +
          '<div class="cd-unit"><span class="cd-num">' + pad(u.seconds) + '</span><span class="cd-label">Seconds</span></div>';
      } else if (now < end) {
        countdownEl.innerHTML =
          '<div><p class="cd-state">Happy birthday.</p>' +
          '<p class="cd-sub">Today is the day. Thank you for being part of the story.</p></div>';
      } else {
        countdownEl.innerHTML =
          '<div><p class="cd-state">The celebration continues.</p>' +
          '<p class="cd-sub">Another year in progress — and grateful for every day of it.</p></div>';
      }
    }

    render();
    window.setInterval(render, 1000);
  }

  /* ================= PRAYER MODAL ================= */
  var prayerModal = $("#prayer-modal");
  var prayerOpen = $("#prayer-open");
  var prayerClose = $("#prayer-close");

  if (prayerModal && prayerOpen) {
    prayerOpen.addEventListener("click", function () {
      if (typeof prayerModal.showModal === "function") prayerModal.showModal();
      else prayerModal.setAttribute("open", "");
      if (prayerClose) prayerClose.focus();
    });
    if (prayerClose) prayerClose.addEventListener("click", function () {
      if (typeof prayerModal.close === "function") prayerModal.close();
      else prayerModal.removeAttribute("open");
    });
    prayerModal.addEventListener("click", function (e) {
      if (e.target === prayerModal) {
        if (typeof prayerModal.close === "function") prayerModal.close();
        else prayerModal.removeAttribute("open");
      }
    });
  }

  /* ================= JOURNEY ================= */
  var journalEl = $("#journal");
  if (journalEl && typeof JOURNEY_PANELS !== "undefined") {
    journalEl.innerHTML = JOURNEY_PANELS.map(function (panel, i) {
      return (
        '<li class="j-panel" data-reveal>' +
          '<span class="j-index">' + pad2(i + 1) + '</span>' +
          '<div class="j-content">' +
            '<h3>' + escapeHTML(panel.title) + '</h3>' +
            '<p>' + escapeHTML(panel.body) + '</p>' +
          '</div>' +
        '</li>'
      );
    }).join("");

    $$("[data-reveal]", journalEl).forEach(function (n) {
      if (!("IntersectionObserver" in window) || reduceMotion.matches) n.classList.add("is-in");
      else {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add("is-in"); obs.unobserve(e.target); }
          });
        }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
        obs.observe(n);
      }
    });
  }
  function pad2(n) { return n < 10 ? "0" + n : String(n); }

  /* ================= PILLARS ================= */
  var pillarsEl = $("#pillars");
  if (pillarsEl && typeof PILLARS !== "undefined") {
    pillarsEl.innerHTML = PILLARS.map(function (p) {
      return (
        '<article class="pillar" data-reveal>' +
          '<p class="pillar-label">' + escapeHTML(p.label) + '</p>' +
          '<h3>' + escapeHTML(p.title) + '</h3>' +
          '<p>' + escapeHTML(p.body) + '</p>' +
        '</article>'
      );
    }).join("");
  }

  /* ================= PROJECTS ================= */
  var PROJECT_ART = {
    csc:
      '<svg viewBox="0 0 400 250" aria-hidden="true">' +
        '<rect x="42" y="34" width="316" height="182" rx="10" fill="none" stroke="rgba(247,244,238,0.18)" stroke-width="1.4"/>' +
        '<line x1="42" y1="70" x2="358" y2="70" stroke="rgba(247,244,238,0.18)" stroke-width="1.4"/>' +
        '<circle cx="60" cy="52" r="3.2" fill="#D8B77A"/>' +
        '<rect x="62" y="90" width="118" height="10" rx="5" fill="#D8B77A" opacity="0.85"/>' +
        '<rect x="62" y="112" width="88" height="6" rx="3" fill="rgba(247,244,238,0.25)"/>' +
        '<rect x="62" y="126" width="106" height="6" rx="3" fill="rgba(247,244,238,0.25)"/>' +
        '<rect x="62" y="152" width="70" height="40" rx="6" fill="none" stroke="rgba(247,244,238,0.2)" stroke-width="1.4"/>' +
        '<rect x="142" y="152" width="70" height="40" rx="6" fill="none" stroke="rgba(247,244,238,0.2)" stroke-width="1.4"/>' +
        '<rect x="222" y="152" width="70" height="40" rx="6" fill="none" stroke="rgba(247,244,238,0.2)" stroke-width="1.4"/>' +
        '<rect x="222" y="90" width="112" height="46" rx="8" fill="none" stroke="rgba(247,244,238,0.2)" stroke-width="1.4"/>' +
      '</svg>',
    sos:
      '<svg viewBox="0 0 400 250" aria-hidden="true">' +
        '<circle cx="200" cy="125" r="26" fill="none" stroke="#D8B77A" stroke-width="1.8"/>' +
        '<circle cx="200" cy="125" r="56" fill="none" stroke="rgba(247,244,238,0.2)" stroke-width="1.4"/>' +
        '<circle cx="200" cy="125" r="86" fill="none" stroke="rgba(247,244,238,0.12)" stroke-width="1.4"/>' +
        '<circle cx="200" cy="125" r="5.5" fill="#D8B77A"/>' +
        '<line x1="200" y1="22" x2="200" y2="48" stroke="#83D8FF" stroke-width="1.6"/>' +
        '<line x1="200" y1="202" x2="200" y2="228" stroke="#83D8FF" stroke-width="1.6"/>' +
        '<line x1="97" y1="125" x2="123" y2="125" stroke="#83D8FF" stroke-width="1.6"/>' +
        '<line x1="277" y1="125" x2="303" y2="125" stroke="#83D8FF" stroke-width="1.6"/>' +
      '</svg>',
    results:
      '<svg viewBox="0 0 400 250" aria-hidden="true">' +
        '<line x1="55" y1="196" x2="345" y2="196" stroke="rgba(247,244,238,0.2)" stroke-width="1.4"/>' +
        '<line x1="55" y1="88" x2="345" y2="88" stroke="rgba(247,244,238,0.12)" stroke-width="1.2" stroke-dasharray="4 6"/>' +
        '<rect x="66" y="156" width="24" height="40" rx="4" fill="none" stroke="rgba(247,244,238,0.25)" stroke-width="1.4"/>' +
        '<rect x="110" y="134" width="24" height="62" rx="4" fill="none" stroke="rgba(247,244,238,0.25)" stroke-width="1.4"/>' +
        '<rect x="154" y="144" width="24" height="52" rx="4" fill="none" stroke="rgba(247,244,238,0.25)" stroke-width="1.4"/>' +
        '<rect x="198" y="112" width="24" height="84" rx="4" fill="none" stroke="rgba(247,244,238,0.25)" stroke-width="1.4"/>' +
        '<rect x="242" y="126" width="24" height="70" rx="4" fill="none" stroke="rgba(247,244,238,0.25)" stroke-width="1.4"/>' +
        '<rect x="286" y="96" width="24" height="100" rx="4" fill="#D8B77A" opacity="0.9"/>' +
        '<circle cx="298" cy="86" r="4" fill="none" stroke="#D8B77A" stroke-width="1.6"/>' +
      '</svg>',
    pchops:
      '<svg viewBox="0 0 400 250" aria-hidden="true">' +
        '<rect x="48" y="46" width="96" height="72" rx="9" fill="none" stroke="rgba(247,244,238,0.22)" stroke-width="1.4"/>' +
        '<rect x="152" y="46" width="96" height="72" rx="9" fill="#D8B77A" opacity="0.85"/>' +
        '<rect x="256" y="46" width="96" height="72" rx="9" fill="none" stroke="rgba(247,244,238,0.22)" stroke-width="1.4"/>' +
        '<rect x="48" y="130" width="96" height="72" rx="9" fill="none" stroke="rgba(247,244,238,0.22)" stroke-width="1.4"/>' +
        '<rect x="152" y="130" width="96" height="72" rx="9" fill="none" stroke="rgba(247,244,238,0.22)" stroke-width="1.4"/>' +
        '<rect x="256" y="130" width="96" height="72" rx="9" fill="none" stroke="rgba(247,244,238,0.22)" stroke-width="1.4"/>' +
      '</svg>'
  };

  var projectsEl = $("#projects");
  if (projectsEl && typeof PROJECTS !== "undefined") {
    projectsEl.innerHTML = PROJECTS.map(function (p) {
      var links = "";
      if (p.live) {
        links +=
          '<a class="link-btn" href="' + escapeHTML(p.live) + '" target="_blank" rel="noopener noreferrer">' +
            'Live site' +
            '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>' +
          '</a>';
      } else {
        links += '<span class="placeholder-chip">No public link yet</span>';
      }
      if (p.source) {
        links +=
          '<a class="link-btn" href="' + escapeHTML(p.source) + '" target="_blank" rel="noopener noreferrer">Source code</a>';
      }
      return (
        '<article class="project" data-reveal>' +
          '<div class="project-art" aria-hidden="true">' + (PROJECT_ART[p.art] || PROJECT_ART.csc) + '</div>' +
          '<div class="project-body">' +
            '<h4 class="project-title">' + escapeHTML(p.title) + '</h4>' +
            '<p class="project-desc">' + escapeHTML(p.description) + '</p>' +
            '<div class="project-links">' + links + '</div>' +
          '</div>' +
        '</article>'
      );
    }).join("");

    $$("[data-reveal]", projectsEl).forEach(function (n) {
      if (!("IntersectionObserver" in window) || reduceMotion.matches) { n.classList.add("is-in"); return; }
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-in"); obs.unobserve(e.target); }
        });
      }, { threshold: 0.1 });
      obs.observe(n);
    });
  }

  /* ================= WISH FORM ================= */
  var form = $("#wish-form");
  var nameInput = $("#w-name");
  var relInput = $("#w-relationship");
  var msgInput = $("#w-message");
  var consentInput = $("#w-consent");
  var feedback = $("#wish-feedback");
  var nameErr = $("#w-name-err");
  var msgErr = $("#w-message-err");
  var msgCount = $("#w-message-count");
  var previewMessage = $("#preview-message");
  var previewSign = $("#preview-sign");
  var previewMood = $("#preview-mood");

  function currentMood() {
    var checked = form ? form.querySelector('input[name="mood"]:checked') : null;
    return checked ? checked.value : "Heartfelt";
  }
  function currentMethod() {
    var checked = form ? form.querySelector('input[name="method"]:checked') : null;
    return checked ? checked.value : "whatsapp";
  }

  function updatePreview() {
    if (!msgInput) return;
    var msg = msgInput.value.trim();
    if (previewMessage) {
      previewMessage.textContent = msg || "Your birthday message will appear here as you type.";
    }
    if (previewSign) {
      var n = nameInput ? nameInput.value.trim() : "";
      previewSign.textContent = "— " + (n || "A well-wisher");
    }
    if (previewMood) previewMood.textContent = currentMood();
    if (msgCount) msgCount.textContent = msgInput.value.length + " / 600";
  }

  function setFeedback(message, kind) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.remove("is-error", "is-ok");
    if (kind) feedback.classList.add("is-" + kind);
  }

  function clearErrors() {
    if (nameErr) nameErr.hidden = true;
    if (msgErr) msgErr.hidden = true;
    if (nameInput) nameInput.removeAttribute("aria-invalid");
    if (msgInput) msgInput.removeAttribute("aria-invalid");
  }

  function validate() {
    clearErrors();
    var ok = true;
    if (!nameInput || !nameInput.value.trim()) {
      if (nameErr) nameErr.hidden = false;
      if (nameInput) nameInput.setAttribute("aria-invalid", "true");
      ok = false;
    }
    if (!msgInput || !msgInput.value.trim()) {
      if (msgErr) msgErr.hidden = false;
      if (msgInput) msgInput.setAttribute("aria-invalid", "true");
      ok = false;
    }
    if (!ok) setFeedback("Please fill in your name and message.", "error");
    return ok;
  }

  function buildMessage() {
    var name = nameInput.value.trim();
    var rel = relInput ? relInput.value.trim() : "";
    var msg = msgInput.value.trim();
    var mood = currentMood();

    var lines = [];
    lines.push("Happy Birthday, Ayoola Enoch Oluwaferanmi!");
    lines.push("");
    lines.push(msg);
    lines.push("");
    lines.push("— " + name + (rel ? " (" + rel + ")" : ""));
    lines.push("Mood: " + mood);
    return lines.join("\n");
  }

  function saveLocalWish(entry) {
    var list = readStore(STORAGE.wishes, []);
    if (!Array.isArray(list)) list = [];
    list.unshift(entry);
    writeStore(STORAGE.wishes, list.slice(0, 20));
  }

  if (form) {
    ["input", "change"].forEach(function (evt) {
      form.addEventListener(evt, updatePreview);
    });
    updatePreview();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;

      var method = currentMethod();
      var message = buildMessage();

      if (method === "whatsapp") {
        var wa = "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(message);
        window.open(wa, "_blank", "noopener,noreferrer");
        setFeedback("WhatsApp opened in a new tab with your message ready. Press Send inside WhatsApp to deliver it.", "ok");
      } else {
        var subject = encodeURIComponent("A Birthday Wish for Ayoola");
        var body = encodeURIComponent(message);
        window.location.href = "mailto:" + cfg.email + "?subject=" + subject + "&body=" + body;
        setFeedback("Your email app is opening with the message ready. Confirm Send there to deliver it.", "ok");
      }

      if (consentInput && consentInput.checked) {
        saveLocalWish({
          text: msgInput.value.trim(),
          from: nameInput.value.trim(),
          mood: currentMood(),
          sample: false,
          local: true,
          date: new Date().toISOString()
        });
        renderWall();
      }
    });
  }

  /* ================= WALL ================= */
  var wallGrid = $("#wall-grid");
  var wallEmpty = $("#wall-empty");

  function wishCard(wish) {
    var badgeClass = wish.sample ? "wish-badge wish-badge--sample" : "wish-badge wish-badge--yours";
    var badgeText = wish.sample ? "Sample note" : "Your note · this device";
    return (
      '<article class="wish-note-card' + (wish.sample ? " wish-note-card--sample" : "") + '">' +
        '<span class="' + badgeClass + '">' + escapeHTML(badgeText) + '</span>' +
        '<p class="wish-text">' + escapeHTML(wish.text) + '</p>' +
        '<p class="wish-from">' + escapeHTML(wish.from) +
          (wish.mood ? " · " + escapeHTML(wish.mood) : "") +
        '</p>' +
      '</article>'
    );
  }

  function renderWall() {
    if (!wallGrid) return;
    var local = readStore(STORAGE.wishes, []);
    if (!Array.isArray(local)) local = [];

    var all = local.concat(typeof SAMPLE_WISHES !== "undefined" ? SAMPLE_WISHES : []);
    wallGrid.innerHTML = all.map(wishCard).join("");

    if (wallEmpty) wallEmpty.hidden = all.length > 0;
  }
  renderWall();

  /* ================= GALLERY ================= */
  var featuredWrap = $("#featured-photo");
  var galleryGrid = $("#gallery-grid");
  var lightbox = $("#lightbox");
  var lbArt = $("#lb-art");
  var lbCaption = $("#lb-caption");
  var lbCount = $("#lb-count");
  var lbPrev = $("#lb-prev");
  var lbNext = $("#lb-next");
  var lbClose = $("#lb-close");

  var galIndex = 0;
  var lastTrigger = null;
  var galleryItems = [];

  function placeholderMarkup(item, featured) {
    return (
      '<div class="photo-placeholder">' +
        '<p>' + (featured ? "Featured photograph" : "Photograph") +
        '<br><span style="color:var(--muted)">' + escapeHTML(item.note || "") + '</span></p>' +
      '</div>'
    );
  }

  function photoInner(item, featured) {
    if (item.src && !item.placeholder) {
      return '<img src="' + escapeHTML(item.src) + '" alt="' + escapeHTML(item.alt) + '" loading="lazy" decoding="async">' +
        '<span class="photo-caption">' + escapeHTML(item.caption || "") + '</span>';
    }
    return placeholderMarkup(item, featured);
  }

  if (typeof GALLERY !== "undefined") {
    galleryItems = GALLERY.slice();

    var featured = GALLERY.filter(function (g) { return g.layout === "featured"; })[0] || GALLERY[0];

    if (featuredWrap && featured) {
      featuredWrap.innerHTML =
        '<button class="photo-frame" type="button" data-gal="' + GALLERY.indexOf(featured) + '" ' +
          'aria-label="View larger: ' + escapeHTML(featured.caption || "Featured photograph") + '">' +
          photoInner(featured, true) +
        '</button>';
    }

    if (galleryGrid) {
      galleryGrid.innerHTML = GALLERY
        .filter(function (g) { return g !== featured; })
        .map(function (g) {
          var idx = GALLERY.indexOf(g);
          var cls = "photo-item";
          if (g.layout === "wide") cls += " photo-item--wide";
          if (g.layout === "tall") cls += " photo-item--tall";
          return (
            '<div class="' + cls + '">' +
              '<button class="photo-frame" type="button" data-gal="' + idx + '" ' +
                'aria-label="View larger: ' + escapeHTML(g.caption || "Photograph") + '">' +
                photoInner(g, false) +
              '</button>' +
            '</div>'
          );
        }).join("");
    }
  }

  function paintLightbox() {
    var item = galleryItems[galIndex];
    if (!item || !lbArt) return;

    if (item.src && !item.placeholder) {
      lbArt.innerHTML = '<img src="' + escapeHTML(item.src) + '" alt="' + escapeHTML(item.alt) + '">';
    } else {
      lbArt.innerHTML = placeholderMarkup(item, true);
    }

    if (lbCaption) lbCaption.textContent = item.caption || "";
    if (lbCount) lbCount.textContent = (galIndex + 1) + " / " + galleryItems.length;

    var single = galleryItems.length < 2;
    if (lbPrev) lbPrev.disabled = single;
    if (lbNext) lbNext.disabled = single;
  }

  function openLb(index, trigger) {
    if (!lightbox) return;
    galIndex = index;
    lastTrigger = trigger || null;
    paintLightbox();
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else lightbox.setAttribute("open", "");
    if (lbClose) lbClose.focus();
  }

  function closeLb() {
    if (!lightbox) return;
    if (typeof lightbox.close === "function") lightbox.close();
    else lightbox.removeAttribute("open");
  }

  function stepLb(delta) {
    if (galleryItems.length < 2) return;
    galIndex = (galIndex + delta + galleryItems.length) % galleryItems.length;
    paintLightbox();
  }

  ["#featured-photo", "#gallery-grid"].forEach(function (sel) {
    var root = $(sel);
    if (!root) return;
    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-gal]");
      if (!btn) return;
      openLb(Number(btn.dataset.gal), btn);
    });
  });

  if (lightbox) {
    if (lbClose) lbClose.addEventListener("click", closeLb);
    if (lbPrev) lbPrev.addEventListener("click", function () { stepLb(-1); });
    if (lbNext) lbNext.addEventListener("click", function () { stepLb(1); });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLb();
    });

    lightbox.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); stepLb(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); stepLb(1); }
    });

    lightbox.addEventListener("close", function () {
      if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
    });
  }

  /* ================= LETTER ================= */
  var letterInput = $("#letter-input");
  var letterStatus = $("#letter-status");
  var writerSheet = $("#writer-sheet");
  var sealedBox = $("#sealed");
  var sealBtn = $("#letter-seal");
  var unsealBtn = $("#letter-unseal");
  var saveBtn = $("#letter-save");
  var downloadBtn = $("#letter-download");

  function letterAnnounce(msg) {
    if (!letterStatus) return;
    letterStatus.textContent = msg;
    window.setTimeout(function () { letterStatus.textContent = ""; }, 3500);
  }

  if (letterInput) {
    var stored = readStore(STORAGE.letter, null);
    if (stored && typeof stored.text === "string") {
      letterInput.value = stored.text;
      if (stored.sealed && sealedBox && writerSheet) {
        writerSheet.hidden = true;
        sealedBox.hidden = false;
      }
    }

    letterInput.addEventListener("input", function () {
      // Debounced autosave
      window.clearTimeout(letterInput._t);
      letterInput._t = window.setTimeout(function () {
        var prev = readStore(STORAGE.letter, {}) || {};
        prev.text = letterInput.value;
        writeStore(STORAGE.letter, prev);
      }, 500);
    });
  }

  if (saveBtn && letterInput) {
    saveBtn.addEventListener("click", function () {
      var ok = writeStore(STORAGE.letter, {
        text: letterInput.value,
        sealed: !!(sealedBox && !sealedBox.hidden)
      });
      letterAnnounce(ok ? "Saved on this device." : "Could not save — storage may be blocked.");
    });
  }

  if (downloadBtn && letterInput) {
    downloadBtn.addEventListener("click", function () {
      var text = letterInput.value.trim();
      if (!text) { letterAnnounce("Write something first."); return; }
      var header =
        "Dear Future Me —\nAyoola Enoch Oluwaferanmi · FerranTech\n\n";
      var blob = new Blob([header + text + "\n"], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = doc.createElement("a");
      a.href = url;
      a.download = "dear-future-me.txt";
      doc.body.appendChild(a);
      a.click();
      doc.body.removeChild(a);
      URL.revokeObjectURL(url);
      letterAnnounce("Downloaded.");
    });
  }

  if (sealBtn && writerSheet && sealedBox && letterInput) {
    sealBtn.addEventListener("click", function () {
      if (!letterInput.value.trim()) { letterAnnounce("Write something before sealing."); return; }
      writeStore(STORAGE.letter, { text: letterInput.value, sealed: true });
      writerSheet.hidden = true;
      sealedBox.hidden = false;
      var focusBtn = $("#letter-unseal");
      if (focusBtn) focusBtn.focus();
    });
  }

  if (unsealBtn && writerSheet && sealedBox) {
    unsealBtn.addEventListener("click", function () {
      sealedBox.hidden = true;
      writerSheet.hidden = false;
      if (letterInput) letterInput.focus();
      writeStore(STORAGE.letter, { text: letterInput ? letterInput.value : "", sealed: false });
    });
  }

  /* ================= EMBLEM ================= */
  var emblem = $("#emblem");
  if (emblem) {
    emblem.addEventListener("click", function () {
      emblem.classList.toggle("is-open");
    });
  }

  /* ================= CANVAS: hero ambient ================= */
  function setupCanvas(canvas, opts) {
    if (!canvas) return null;
    var ctx = canvas.getContext("2d");
    if (!ctx) return null;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var running = true;
    var count = opts.count || 40;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      particles = [];
      var rect = canvas.getBoundingClientRect();
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          r: 0.6 + Math.random() * 1.6,
          vx: (Math.random() - 0.5) * 0.18,
          vy: -0.12 - Math.random() * 0.28,
          a: 0.15 + Math.random() * 0.5
        });
      }
    }

    function frame() {
      if (!running) return;
      var rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = rect.height + 10; p.x = Math.random() * rect.width; }
        if (p.x < -10) p.x = rect.width + 10;
        if (p.x > rect.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = opts.color(p.a);
        ctx.fill();
      });

      requestAnimationFrame(frame);
    }

    resize();
    seed();
    if (!reduceMotion.matches) frame();

    window.addEventListener("resize", function () {
      resize();
      seed();
    });

    return {
      stop: function () { running = false; },
      burst: function (n) {
        var rect = canvas.getBoundingClientRect();
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        for (var i = 0; i < n; i++) {
          var angle = Math.random() * Math.PI * 2;
          var speed = 1.5 + Math.random() * 4;
          particles.push({
            x: cx,
            y: cy,
            r: 1 + Math.random() * 2.4,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            a: 0.6 + Math.random() * 0.4,
            life: 1
          });
        }
        // remove burst particles after a while
        window.setTimeout(function () {
          particles = particles.filter(function (p) { return p.life === undefined; });
        }, 3000);
      }
    };
  }

  var heroCanvas = $("#hero-canvas");
  var heroParticles = setupCanvas(heroCanvas, {
    count: 34,
    color: function (a) { return "rgba(216,183,122," + a * 0.6 + ")"; }
  });

  var finaleCanvas = $("#finale-canvas");
  var finaleParticles = setupCanvas(finaleCanvas, {
    count: 22,
    color: function (a) { return "rgba(131,216,255," + a * 0.35 + ")"; }
  });

  /* ================= FINALE ================= */
  var celebrateBtn = $("#celebrate");
  var finaleMessage = $("#finale-message");
  var shareBtn = $("#share");
  var shareStatus = $("#share-status");

  if (celebrateBtn) {
    celebrateBtn.addEventListener("click", function () {
      if (finaleParticles) finaleParticles.burst(120);
      if (heroParticles) heroParticles.burst(60);
      if (finaleMessage) finaleMessage.hidden = false;
      celebrateBtn.textContent = "Celebrated ✓";
      celebrateBtn.disabled = true;
      if (finaleMessage) {
        finaleMessage.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
      }
    });
  }

  function announceShare(msg) {
    if (!shareStatus) return;
    shareStatus.textContent = msg;
    window.setTimeout(function () { shareStatus.textContent = ""; }, 3500);
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var shareData = {
        title: "Ayoola Enoch Oluwaferanmi · 19 October 2026",
        text: "Another year. Another chapter. All thanks to God.",
        url: window.location.href
      };
      if (navigator.share) {
        navigator.share(shareData).catch(function () { /* user cancelled */ });
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href).then(
          function () { announceShare("Link copied to clipboard."); },
          function () { announceShare("Could not copy — copy the address bar manually."); }
        );
      } else {
        announceShare("Copy the address bar manually — your browser doesn't support clipboard access.");
      }
    });
  }

  /* ================= YEAR ================= */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();