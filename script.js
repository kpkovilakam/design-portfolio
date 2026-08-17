/* Krishnaprakash K — portfolio. Two pieces of state: which project overlay is
   open, and whether the resume overlay is open. No dependencies. */

var PROJECTS = [
  {
    slug: 'ripple',
    title: 'Ripple',
    meta: 'Android fundraising app · 2026',
    short: 'Android-based online fundraising experience designed to help donors stay connected, see their impact, and naturally share causes with others.',
    long: 'An online fundraising app that keeps donors close to the causes they fund. As a UX Design Intern at Experion Technologies, I spent three sprints on an in-house notification system, a personalised donor experience shaped by surveys and interviews, and campaign sharing that grows the community organically.',
    slides: 28,
    ext: 'webp',
    ratio: '3840 / 2160',
    link: {
      label: 'Open Figma file ↗',
      href: 'https://www.figma.com/design/QS2mavyiJ4iXSLzx1t19io/Ripple-Screens---Krishnaprakash-K--Team-B--Kochi-?node-id=340-6478&t=fCBLkE7kHQW1s0Gl-1'
    }
  },
  {
    slug: 'tinkerweb',
    title: 'TinkerWeb',
    meta: 'E-learning web app · 2025',
    short: 'Interactive learning platform designed to teach the basics of web design to teenagers through gamified challenges and feedback-driven tutorials.',
    long: 'An interactive platform that teaches the basics of web design to Class 11 and 12 students, built at DIVINE Lab, IIT Delhi for the Digital Marketing, Digital Design and Development course in Punjab government schools. Online lessons lose beginners to text-heavy, passive content, so the learning is delivered through short modules, hands-on activities and gamified progress. Grounded in 40+ survey responses, 10+ interviews and usability testing with students.',
    slides: 53,
    ext: 'webp',
    ratio: '2800 / 2160'
  },
  {
    slug: 'playaround',
    title: 'Play Around',
    meta: 'Mixed Reality experience · 2024',
    short: 'Simple and intuitive mixed reality sandbox experience for users new to Meta Quest 3.',
    long: 'A mixed-reality sandbox game for the Meta Quest, played with hand interactions instead of controllers. First-time XR users struggle with complex controls and cyber sickness, and most good MR content sits behind a paywall. So this is a free experience built around simple picking and throwing. Designed in Bezi, built in Unity with the Meta Interaction SDK.',
    slides: 22,
    ext: 'webp',
    ratio: '16 / 9'
  },
  {
    slug: 'a4alphabets',
    title: 'A4Alphabets',
    meta: 'Augmented Reality experience · 2023',
    short: 'AR based English alphabets learning experience for kindergarten students.',
    long: 'An augmented-reality learning aid for kindergarten and primary school children. Traditional alphabet teaching struggles to hold young attention, so each printed card triggers a 3D model and audio for its letter, pairing what children see with what they hear. Built in Meta Spark Studio and published as a shareable AR effect.',
    slides: 20,
    ext: 'webp',
    ratio: '16 / 9'
  }
];

var openProject = null;
var resumeOpen = false;
var projectEl = null;
var resumeEl = null;
var lockedY = 0;
var lockDepth = 0;
var navDepth = 0;

var IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

function slidePath(p, n) {
  return 'projects/' + p.slug + '/' + (n < 10 ? '0' + n : n) + '.' + (p.ext || 'webp');
}

/* position:fixed lock — plain overflow:hidden does not hold on iOS Safari. */
function lockScroll(on) {
  if (on) {
    lockDepth++;
    if (lockDepth > 1) return;
    lockedY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = (-lockedY) + 'px';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  } else {
    lockDepth = Math.max(0, lockDepth - 1);
    if (lockDepth > 0) return;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, lockedY);
  }
}

/* History — each overlay is a history entry with a hash, so case studies are
   linkable and the back button closes them. Closing is done DIRECTLY, never by
   delegating to history.back(): the entry behind the current one is not
   guaranteed to be a non-overlay entry, so a back() could land on a duplicate
   overlay state and leave the overlay open. We close, then replace the current
   entry so the URL matches whatever is still open. */

function overlayHash(kind, i) {
  return kind === 'resume' ? '#resume' : '#' + PROJECTS[i].slug;
}

function pushOverlayState(kind, i) {
  navDepth++;
  try {
    history.pushState({ ov: kind, i: i, d: navDepth }, '', overlayHash(kind, i));
  } catch (err) {
    navDepth--;
  }
}

/* Point the current history entry at whatever overlay is still open. */
function syncUrl() {
  var state = null, hash = '';
  if (resumeOpen) {
    state = { ov: 'resume', i: null, d: navDepth };
    hash = '#resume';
  } else if (openProject !== null) {
    state = { ov: 'project', i: openProject, d: navDepth };
    hash = overlayHash('project', openProject);
  }
  try {
    history.replaceState(state, '', location.pathname + location.search + hash);
  } catch (err) {}
}

function requestClose() {
  if (resumeOpen) hideResume();
  else if (openProject !== null) hideProject();
  else return;
  navDepth = Math.max(0, navDepth - 1);
  syncUrl();
}

/* Swipe to go back — done in JS on purpose. The overlay is a fixed, non-root
   scroll container, and browsers will not fire their own back gesture from
   inside one, so the trackpad swipe never reached history. This reads the
   horizontal wheel/touch stream directly, drags the overlay, and closes past a
   threshold. Rightward only; vertical scrolling is left alone. */

function attachSwipeBack(el) {
  var THRESH = 110, MAX = 96;
  var acc = 0, last = 0, idle = 0;

  function paint() {
    el.style.transition = '';
    el.style.transform = acc > 6 ? 'translateX(' + Math.min(acc * 0.5, MAX) + 'px)' : '';
  }

  function settle() {
    acc = 0;
    el.style.transition = 'transform .18s ease-out';
    el.style.transform = '';
  }

  function fire() {
    acc = 0;
    clearTimeout(idle);
    el.style.transition = '';
    el.style.transform = '';
    requestClose();
  }

  el.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) * 1.2) return;
    var now = Date.now();
    if (now - last > 220) acc = 0;
    last = now;
    clearTimeout(idle);
    /* deltaX < 0 is a left-to-right (back) swipe. */
    if (e.deltaX >= 0) { if (acc) settle(); return; }
    acc += -e.deltaX;
    if (acc >= THRESH) { fire(); return; }
    paint();
    idle = setTimeout(settle, 200);
  }, { passive: true });

  var sx = 0, sy = 0, dragging = false, decided = false;
  el.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
    dragging = true;
    decided = false;
    acc = 0;
  }, { passive: true });

  el.addEventListener('touchmove', function (e) {
    if (!dragging) return;
    var dx = e.touches[0].clientX - sx;
    var dy = e.touches[0].clientY - sy;
    if (!decided) {
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
      decided = true;
      if (Math.abs(dy) > Math.abs(dx)) { dragging = false; return; }
    }
    acc = Math.max(0, dx);
    paint();
  }, { passive: true });

  function end() {
    if (!dragging) return;
    dragging = false;
    if (acc >= THRESH) fire(); else settle();
  }
  el.addEventListener('touchend', end, { passive: true });
  el.addEventListener('touchcancel', end, { passive: true });
}

window.addEventListener('popstate', function (e) {
  var s = e.state;
  navDepth = (s && s.d) ? s.d : 0;
  if (!s || !s.ov) {
    hideResume();
    hideProject();
    return;
  }
  if (s.ov === 'resume') {
    if (!resumeOpen) showResume(true);
    return;
  }
  hideResume();
  if (openProject !== s.i) {
    hideProject();
    showProject(s.i, true);
  }
});

/* Rows */

function buildRows() {
  var host = document.getElementById('projectRows');
  var tpl = document.getElementById('tpl-row');
  PROJECTS.forEach(function (p, i) {
    var row = tpl.content.firstElementChild.cloneNode(true);
    var img = row.querySelector('.row-thumb img');
    img.src = 'projects/' + p.slug + '/thumb.webp';
    img.alt = p.title + ' case study cover';
    img.onerror = (function (proj, node) {
      return function () { node.onerror = null; node.src = slidePath(proj, 1); };
    })(p, img);
    row.querySelector('.row-title').textContent = p.title;
    row.querySelector('.row-summary').textContent = p.short;
    row.querySelector('.row-meta').textContent = p.meta;
    row.setAttribute('aria-label', 'Open ' + p.title + ' case study');
    row.addEventListener('click', function () { showProject(i); });
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        showProject(i);
      }
    });
    host.appendChild(row);
  });
}

/* Project overlay */

function showProject(i, fromPop) {
  if (openProject !== null) return;
  if (!fromPop) pushOverlayState('project', i);
  var p = PROJECTS[i];
  var el = document.getElementById('tpl-project').content.firstElementChild.cloneNode(true);
  el.setAttribute('aria-label', p.title + ' case study');
  el.querySelector('.ov-bar-title').textContent = p.title;
  el.querySelector('.ov-title').textContent = p.title;
  el.querySelector('.ov-meta').textContent = p.meta;
  el.querySelector('.ov-summary').textContent = p.long;

  var links = el.querySelector('.ov-links');
  if (p.link) {
    var a = document.createElement('a');
    a.className = 'btn-outline btn-lg';
    a.href = p.link.href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = p.link.label;
    links.appendChild(a);
  } else {
    links.remove();
  }

  var slides = el.querySelector('.ov-slides');
  for (var n = 1; n <= p.slides; n++) {
    var wrap = document.createElement('div');
    wrap.className = 'slide';
    wrap.style.setProperty('--slide-ratio', p.ratio);
    var img = document.createElement('img');
    img.src = slidePath(p, n);
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    wrap.appendChild(img);
    slides.appendChild(wrap);
  }

  Array.prototype.forEach.call(el.querySelectorAll('.ov-close'), function (btn) {
    btn.addEventListener('click', requestClose);
  });
  attachSwipeBack(el);

  lockScroll(true);
  document.body.appendChild(el);
  projectEl = el;
  openProject = i;
  el.scrollTop = 0;
  var close = el.querySelector('.ov-close');
  if (close) close.focus();
}

function hideProject() {
  if (openProject === null) return;
  if (projectEl) projectEl.remove();
  projectEl = null;
  openProject = null;
  lockScroll(false);
}

/* Resume overlay */

function showResume(fromPop) {
  if (resumeOpen) return;
  if (!fromPop) pushOverlayState('resume');
  var el = document.getElementById('tpl-resume').content.firstElementChild.cloneNode(true);

  /* Mobile browsers refuse to render PDFs in <object>/<iframe> — they show a
     blank pane rather than falling back, so swap in the fallback card up front. */
  var view = el.querySelector('.resume-view');
  if (view && (IS_MOBILE || window.innerWidth < 820)) {
    var fb = view.querySelector('.resume-fallback');
    var host = document.createElement('div');
    host.className = 'resume-view resume-view-static';
    if (fb) host.appendChild(fb);
    view.parentNode.replaceChild(host, view);
  }

  Array.prototype.forEach.call(el.querySelectorAll('.ov-close'), function (btn) {
    btn.addEventListener('click', requestClose);
  });
  attachSwipeBack(el);
  lockScroll(true);
  document.body.appendChild(el);
  resumeEl = el;
  resumeOpen = true;
  var close = el.querySelector('.ov-close');
  if (close) close.focus();
}

function hideResume() {
  if (!resumeOpen) return;
  if (resumeEl) resumeEl.remove();
  resumeEl = null;
  resumeOpen = false;
  lockScroll(false);
}

/* Wiring */

buildRows();

/* Deep link: /#ripple opens that case study on load. */
(function () {
  var h = (location.hash || '').replace('#', '');
  if (!h) return;
  if (h === 'resume') { showResume(true); return; }
  for (var i = 0; i < PROJECTS.length; i++) {
    if (PROJECTS[i].slug === h) { showProject(i, true); return; }
  }
})();

Array.prototype.forEach.call(document.querySelectorAll('[data-open-resume]'), function (btn) {
  btn.addEventListener('click', function () { showResume(); });
});

/* Name in the top bar = home: close whatever is open and return to the top.
   Delegated, because the resume bar's copy is cloned from a <template> after
   load. The href="./" is the no-JS fallback. */
document.addEventListener('click', function (e) {
  var t = e.target;
  var home = t && t.closest ? t.closest('[data-home]') : null;
  if (!home) return;
  e.preventDefault();
  var wasOpen = resumeOpen || openProject !== null;
  lockedY = 0;
  hideResume();
  hideProject();
  lockDepth = 0;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  navDepth = 0;
  syncUrl();
  window.scrollTo({ top: 0, behavior: wasOpen ? 'auto' : 'smooth' });
});

document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  if (resumeOpen || openProject !== null) requestClose();
});
