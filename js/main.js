/* ============================================================================
   BitRetro — Base behaviour
   T02: Base HTML/CSS/JS Structure
   ----------------------------------------------------------------------------
   Foundational, dependency-free JS for the page shell: footer year, mobile nav
   toggle, and active-section highlighting. Live data wiring arrives in T03.
   ========================================================================== */
(function () {
  "use strict";

  /* Current year in the footer. */
  function setYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* Mobile navigation toggle (the button is shown via CSS in T04). */
  function initNavToggle() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("nav--open", !open);
    });

    /* Close the menu after following an in-page link. */
    nav.addEventListener("click", function (e) {
      if (e.target.closest(".nav__link")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("nav--open");
      }
    });
  }

  /* Highlight the nav link for the section currently in view. */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav .nav__link"));
    var sections = links
      .map(function (l) { return document.querySelector(l.getAttribute("href")); })
      .filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) {
          var match = l.getAttribute("href") === "#" + entry.target.id;
          if (match) l.setAttribute("aria-current", "page");
          else l.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (s) { observer.observe(s); });
  }

  function init() {
    setYear();
    initNavToggle();
    initScrollSpy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
