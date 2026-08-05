/* Energimesteren AS — interaksjon
   Ingen eksterne avhengigheter: alt kjører på innebygde nettleser-API-er. */
(function () {
  'use strict';

  var doc = document;

  /* ---------- Årstall i footer ---------- */
  var year = doc.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Nav: hårstrek + skygge ved scroll ---------- */
  var nav = doc.getElementById('nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobilmeny ---------- */
  var toggle = doc.getElementById('navToggle');
  var links = doc.getElementById('navLinks');

  if (toggle && links) {
    var setMenu = function (open) {
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    };

    toggle.addEventListener('click', function () {
      setMenu(!links.classList.contains('open'));
    });

    // Lukk når man velger et menypunkt
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });

    // Lukk med Escape
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        setMenu(false);
        toggle.focus();
      }
    });

    // Rydd opp hvis vinduet utvides forbi mobil-breakpointet
    var desktop = window.matchMedia('(min-width: 861px)');
    var onBreakpoint = function (e) { if (e.matches) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
    else desktop.addListener(onBreakpoint);
  }

  /* ---------- Scroll-reveal ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = Array.prototype.slice.call(doc.querySelectorAll('[data-reveal]'));

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Liten forskyvning mellom søsken gir en rolig kaskade
        var el = entry.target;
        var siblings = el.parentElement ? el.parentElement.children : [el];
        var index = Array.prototype.indexOf.call(siblings, el);
        el.style.transitionDelay = Math.min(index, 5) * 70 + 'ms';
        el.classList.add('is-in');
        observer.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Kontaktskjema ----------
     Uten backend sendes henvendelsen via brukerens e-postprogram. Skjemaet
     har fortsatt en vanlig mailto-action som reserveløsning uten JS.
     Skal skjemaet sende automatisk, bytt action til en skjematjeneste
     (f.eks. Formspree eller Netlify Forms) og fjern denne handleren. */
  var form = doc.getElementById('kontaktSkjema');
  var note = doc.getElementById('formNote');

  if (form) {
    form.addEventListener('submit', function (e) {
      if (!form.checkValidity()) return; // la nettleseren vise valideringen
      e.preventDefault();

      var val = function (name) {
        var f = form.elements[name];
        return f && f.value ? f.value.trim() : '';
      };

      var bedrift = val('bedrift');
      var subject = 'Henvendelse fra nettsiden' + (bedrift ? ' — ' + bedrift : '');

      var body = [
        'Navn: ' + val('navn'),
        bedrift ? 'Bedrift: ' + bedrift : null,
        'E-post: ' + val('epost'),
        val('telefon') ? 'Telefon: ' + val('telefon') : null,
        '',
        val('melding')
      ].filter(Boolean).join('\n');

      window.location.href = 'mailto:tgs@energimesteren.no'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      if (note) {
        note.textContent = 'E-postprogrammet ditt åpnes med meldingen ferdig utfylt. Får du ikke opp noe, send til tgs@energimesteren.no.';
        note.classList.add('form__note--ok');
      }
    });
  }
})();
