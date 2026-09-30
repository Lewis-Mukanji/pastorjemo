/* ============================================================
   James Martin Okumu — shared JavaScript
   Loaded by every page.
   ============================================================ */

/* ---------- Mobile navigation (full-screen menu) ---------- */
(function () {
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  function setOpen(isOpen) {
    links.classList.toggle('open', isOpen);
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', isOpen);
  }

  toggle.addEventListener('click', function () {
    setOpen(!links.classList.contains('open'));
  });

  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  /* close the menu if the window grows back to desktop width */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 980) setOpen(false);
  });
})();

/* ---------- Navbar turns to frosted glass once you scroll ---------- */
(function () {
  var nav = document.querySelector('header.site-nav');
  if (!nav) return;
  function check() { nav.classList.toggle('scrolled', window.scrollY > 40); }
  check();
  window.addEventListener('scroll', check, { passive: true });
})();

/* ---------- Scroll reveal ----------
   Blocks fade up as they come into view. Nothing to edit in the HTML:
   the selectors below decide what animates.
------------------------------------------------------------------ */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var targets = document.querySelectorAll(
    'main section .section-head, main .split > *, main .grid-3 > .cell, main .grid-2 > .cell, ' +
    'main .video-frame, main .video-item, main .timeline li, main .gallery-grid .photo, ' +
    'main .testimony blockquote, main .schedule-card, main .live-banner, main .btn-row, ' +
    'main .contact-grid > *, main .statement .after'
  );

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (el) {
    if (el.closest('.video-item') && el.classList.contains('video-frame')) return;
    el.classList.add('reveal');
    /* stagger siblings in grids so they arrive one after another */
    var parent = el.parentElement;
    if (parent && /grid|timeline/.test(parent.className)) {
      var i = Array.prototype.indexOf.call(parent.children, el);
      el.style.transitionDelay = (i % 3) * 0.12 + 's';
    }
    io.observe(el);
  });
})();

/* ---------- Scroll-lit statement ----------
   Any element with class="lit-text" has its words brighten one by one
   as it scrolls up the screen. Words inside <em> keep their gold italic.
------------------------------------------------------------------ */
(function () {
  var blocks = document.querySelectorAll('.lit-text');
  if (!blocks.length) return;

  var words = [];
  blocks.forEach(function (block) {
    (function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span');
            s.className = 'w';
            s.textContent = part;
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          wrap(child);
        }
      });
    })(block);
  });

  function update() {
    blocks.forEach(function (block) {
      var r = block.getBoundingClientRect();
      var vh = window.innerHeight;
      /* 0 when the block's top is at 85% of the screen, 1 when its bottom reaches 40% */
      var progress = (vh * 0.85 - r.top) / (r.height + vh * 0.45);
      progress = Math.max(0, Math.min(1, progress));
      var ws = block.querySelectorAll('.w');
      var lit = Math.round(progress * ws.length);
      ws.forEach(function (w, n) { w.classList.toggle('on', n < lit); });
    });
  }
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
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