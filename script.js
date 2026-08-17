/* Krishnaprakash K — portfolio. Two pieces of state: which project overlay is
   open, and whether the resume overlay is open. No dependencies. */

var PROJECTS = [
  {
    slug: 'ripple',
    title: 'Ripple',
    meta: 'Android fundraising app · 2026',
    short: 'Android-based online fundraising experience designed to help donors stay connected, see their impact, and naturally share causes with others.',
    long: 'An online fundraising app where donors lost interest after giving and rarely shared the causes they supported. Across three sprints as UX Design Intern at Experion Technologies, I worked on an in-house notification ecosystem, a personalised donor experience built on survey and interview research, and a sharing flow timed to the moment after donating.',
    slides: 28,
    ratio: '3840 / 2160'
  },
  {
    slug: 'tinkerweb',
    title: 'TinkerWeb',
    meta: 'E-learning web app · 2025',
    short: 'Interactive learning platform designed to teach the basics of web design to teenagers through gamified challenges and feedback-driven tutorials.',
    long: 'An interactive platform that teaches the basics of web design to Class 11 and 12 students, built at DIVINE Lab, IIT Delhi for the Digital Marketing, Digital Design and Development course in Punjab government schools. Online lessons lose beginners to text-heavy, passive content, so the learning is delivered through short modules, hands-on activities and gamified progress. Grounded in 40+ survey responses, 10+ interviews and usability testing with students.',
    slides: 53,
    ext: 'jpg',
    ratio: '2800 / 2160'
  },
  {
    slug: 'playaround',
    title: 'Play Around',
    meta: 'Mixed Reality experience · 2024',
    short: 'Simple and intuitive mixed reality sandbox experience for users new to Meta Quest 3.',
    long: 'A mixed-reality sandbox game for the Meta Quest, played with hand interactions instead of controllers. First-time XR users struggle with complex controls and cyber sickness, and most good MR content sits behind a paywall, so this is a free, low-barrier experience built around simple picking and throwing. Designed in Bezi, built in Unity with the Meta Interaction SDK, and refined through user testing at Delhi Technological University.',
    slides: 22,
    ext: 'jpg',
    ratio: '16 / 9'
  },
  {
    slug: 'a4alphabets',
    title: 'A4Alphabets',
    meta: 'Augmented Reality experience · 2023',
    short: 'AR based English alphabets learning experience for kindergarten students.',
    long: 'An augmented-reality learning aid for kindergarten and primary school children. Traditional alphabet teaching struggles to hold young attention, so each printed card triggers a 3D model and audio for its letter — pairing what children see with what they hear. Built in Meta Spark Studio with 3D assets from Sketchfab, published as a shareable AR effect.',
    slides: 20,
    ext: 'jpg',
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
  return 'projects/' + p.slug + '/' + (n < 10 ? '0' + n : n) + '.' + (p.ext || 'png');
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

/* History — each overlay is a history entry, so the Android back button and the
   iOS edge-swipe close the overlay instead of leaving the site. Close buttons go
   through history.back() so the stack never grows stale entries. */

function pushOverlayState(kind, i) {
  navDepth++;
  try {
    history.pushState({ ov: kind, i: i, d: navDepth }, '');
  } catch (err) {
    navDepth--;
  }
}

function requestClose() {
  if (navDepth > 0) { history.back(); return; }
  hideResume();
  hideProject();
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
    img.src = 'projects/' + p.slug + '/thumb.jpg';
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

Array.prototype.forEach.call(document.querySelectorAll('[data-open-resume]'), function (btn) {
  btn.addEventListener('click', showResume);
});

document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  if (resumeOpen || openProject !== null) requestClose();
});
