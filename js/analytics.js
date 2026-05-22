/* ============================================================================
   BitRetro — Privacy-First Analytics (opt-in)
   T06: Final QA and Deployment Prep
   ----------------------------------------------------------------------------
   BitRetro ships with NO tracking by default. To enable cookieless, GDPR-
   friendly page-view analytics (Plausible-compatible), set the analytics
   domain in index.html:

       <meta name="bitretro:analytics-domain" content="yourdomain.com">

   When unset, this script is a no-op. It also honours the visitor's
   Do-Not-Track / Global-Privacy-Control signals and never sets cookies.
   ========================================================================== */
(function () {
  "use strict";

  function dntEnabled() {
    var dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    return dnt === "1" || dnt === "yes" || navigator.globalPrivacyControl === true;
  }

  function getDomain() {
    var meta = document.querySelector('meta[name="bitretro:analytics-domain"]');
    return meta && meta.content ? meta.content.trim() : "";
  }

  function init() {
    var domain = getDomain();
    if (!domain) return;          // not configured -> stay dark
    if (dntEnabled()) return;     // respect privacy signals

    // Load the cookieless Plausible script for the configured domain.
    var s = document.createElement("script");
    s.defer = true;
    s.setAttribute("data-domain", domain);
    s.src = "https://plausible.io/js/script.js";
    document.head.appendChild(s);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
