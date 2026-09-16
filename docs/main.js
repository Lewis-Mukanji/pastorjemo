/* ============================================================
   James Martin Okumu — shared JavaScript
   Loaded by every page.
   ============================================================ */

/* ---------- Mobile navigation ---------- */
(function () {
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    var isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ---------- Footer year ---------- */
(function () {
  var el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ---------- Countdown to the next 5:45 AM EAT gathering ----------
   Runs on any page that has an element with id="countdownBox".
   EAT is UTC+3 with no daylight saving, so the maths is fixed.
------------------------------------------------------------------ */
(function () {
  var box = document.getElementById('countdownBox');
  if (!box) return;

  function update() {
    var now = new Date();
    var nowEat = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 3 * 3600000);

    var start = new Date(nowEat); start.setHours(5, 45, 0, 0);
    var end = new Date(nowEat); end.setHours(7, 0, 0, 0);

    if (nowEat >= start && nowEat <= end) {
      box.innerHTML = '<strong>Live now</strong> — this morning\'s gathering is in progress.';
      return;
    }

    var target, label;
    if (nowEat < start) { target = start; label = 'today'; }
    else { target = new Date(start.getTime() + 86400000); label = 'tomorrow'; }

    var diff = target - nowEat;
    var h = Math.floor(diff / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);

    box.innerHTML = '<strong>' + h + 'h ' + m + 'm</strong> until ' + label + "'s gathering begins";
  }

  update();
  setInterval(update, 30000);
})();

/* ---------- Contact form ----------
   Opens the visitor's email app with the message pre-filled.
   TO CHANGE THE RECIPIENT: edit the address on the CONTACT_EMAIL line below.
------------------------------------------------------------------ */
(function () {
  var CONTACT_EMAIL = 'info@jamesmartinokumu.com'; // <-- replace with the real address

  var form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var message = document.getElementById('message').value;

    var subject = encodeURIComponent('Message from ' + name + ' via the website');
    var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');

    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
  });
})();

/* ---------- Hero slideshow (plays once, rests on the final image) ----------
   How it works:
   - Every image is preloaded first, so no slide ever flashes black.
   - It fades from the first slide to the last, one step at a time.
   - When it reaches the last slide it stops. It does NOT loop.

   TO CHANGE THE TIMING, edit these two numbers:
     HOLD_MS  how long each slide stays before the next fade begins
     Fade length is set in css/style.css (.hero-slide transition)
--------------------------------------------------------------------------- */
(function () {
  var HOLD_MS = 2600;

  var wrapEl = document.getElementById('heroSlides');
  if (!wrapEl) return;

  var slides = Array.prototype.slice.call(wrapEl.querySelectorAll('.hero-slide'));
  if (!slides.length) return;

  var ticksEl = document.getElementById('heroTicks');
  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* build the little progress ticks */
  if (ticksEl && slides.length > 1) {
    slides.forEach(function () { ticksEl.appendChild(document.createElement('i')); });
  }

  function markTick(i) {
    if (!ticksEl) return;
    var ticks = ticksEl.querySelectorAll('i');
    ticks.forEach(function (t, n) { t.classList.toggle('on', n === i); });
  }

  function show(i) {
    slides.forEach(function (s, n) { s.classList.toggle('is-visible', n === i); });
    markTick(i);
  }

  /* preload every image, then start */
  var loaded = 0;
  slides.forEach(function (slide) {
    var src = slide.getAttribute('data-src');
    var img = new Image();
    img.onload = img.onerror = function () {
      slide.style.backgroundImage = 'url("' + src + '")';
      loaded++;
      if (loaded === slides.length) start();
    };
    img.src = src;
  });

  function start() {
    /* reduced motion: skip straight to the final image */
    if (reduced) {
      slides.forEach(function (s) { s.classList.remove('is-visible'); });
      show(slides.length - 1);
      return;
    }

    show(0);

    var i = 0;
    var timer = setInterval(function () {
      i++;
      if (i >= slides.length) {     /* reached the last slide — stop here */
        clearInterval(timer);
        return;
      }
      show(i);
      if (i === slides.length - 1) clearInterval(timer);
    }, HOLD_MS);
  }
})();

/* ---------- Hide photo placeholder once a real image loads ---------- */
(function () {
  document.querySelectorAll('.photo img, .hero-photo img').forEach(function (img) {
    function hideNote() {
      var note = img.parentElement.querySelector('.ph-note');
      if (note) note.style.display = 'none';
    }
    function showBroken() {
      img.style.display = 'none';
    }
    if (img.complete && img.naturalWidth > 0) hideNote();
    img.addEventListener('load', hideNote);
    img.addEventListener('error', showBroken);
  });
})();