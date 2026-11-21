/* ============================================================
   ANALYTICS — GA4 with Consent Mode v2, loaded only after the visitor accepts.
   ------------------------------------------------------------
   - The <head> sets every consent type to 'denied' before anything else runs.
   - Nothing is sent and gtag.js is not even downloaded until "Accept" (basic consent mode).
   - Choice is kept for 12 months (localStorage vj_consent); "Cookie settings" in the footer reopens it.
   - The site's own events (jm:analytics, e.g. place_detail_open, call_click, announcement_view)
     are forwarded to GA4 as events of the same name. Page views come from GA4 itself.
   - Off on localhost unless the URL has ?ga-debug (then events go to GA4 DebugView).
   ============================================================ */
(function(){
  'use strict';
  var F = window.VJ_FIREBASE || {}, ID = (F.FIREBASE_CONFIG || {}).measurementId;
  var LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname), DEBUG = /[?&]ga-debug(?:[=&]|$)/.test(location.search);
  var KEY = 'vj_consent', MAX_AGE = 365 * 24 * 3600 * 1000;
  /* Internal ad-engine bookkeeping — useful in the console, noise in GA4. */
  var SKIP = {ad_not_eligible:1, ad_eligible:1, ad_requested:1, ad_triggered:1, invalid_transition:1, not_safe_yet:1, opportunity_dropped:1};
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  function read(){ try{ var c = JSON.parse(localStorage.getItem(KEY) || 'null'); return c && Date.now() - c.at < MAX_AGE ? c.v : null; }catch(e){ return null; } }
  function save(v){ try{ localStorage.setItem(KEY, JSON.stringify({v:v, at:Date.now()})); }catch(e){} }

  var loaded = false;
  function load(){
    if(!ID || (LOCAL && !DEBUG)) return;
    gtag('consent', 'update', {analytics_storage:'granted'});   // ads stay denied: no ad personalisation
    if(loaded) return;
    loaded = true;
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', ID, DEBUG ? {debug_mode:true} : {});
  }
  function forward(e){
    if(!loaded || read() !== 'granted' || !e.detail || !e.detail.event) return;
    var d = e.detail, name = String(d.event).replace(/[^A-Za-z0-9_]/g, '_').slice(0, 40), p = {};
    if(SKIP[name]) return;
    Object.keys(d).forEach(function(k){
      var v = d[k]; if(k === 'event' || v == null || v === '') return;
      if(typeof v === 'string') v = v.slice(0, 100); else if(typeof v !== 'number' && typeof v !== 'boolean') return;
      if(Object.keys(p).length < 20) p[(k === 'source' ? 'interaction_source' : k).replace(/[^A-Za-z0-9_]/g, '_').slice(0, 40)] = v;
    });
    gtag('event', name, p);
  }
  document.addEventListener('jm:analytics', forward);

  /* ---------- notice ---------- */
  var box = null;
  function close(){ if(box){ box.remove(); box = null; } }
  function choose(v){ save(v); close(); if(v === 'granted') load(); else if(loaded){ gtag('consent', 'update', {analytics_storage:'denied'}); } }
  function show(){
    if(box) return;
    box = document.createElement('section');
    box.className = 'consent';
    box.setAttribute('aria-label', 'Cookie choice');
    box.innerHTML = '<p class="consent-text">Jaisalmer Visit shows Google ads (not personalised). With your OK we also use Google Analytics cookies to see which parts of the site are useful. We never sell your data. <a href="/privacy">Privacy policy</a></p>' +
      '<div class="consent-actions"><button type="button" class="consent-btn consent-btn--ghost" data-consent="denied">Decline</button>' +
      '<button type="button" class="consent-btn" data-consent="granted">Accept</button></div>';
    box.addEventListener('click', function(e){ var b = e.target.closest('[data-consent]'); if(b) choose(b.getAttribute('data-consent')); });
    document.body.appendChild(box);
  }
  window.VJConsent = {open: show};
  document.addEventListener('click', function(e){ if(e.target.closest('[data-cookie-settings]')){ e.preventDefault(); show(); } });

  if(!ID) return;
  var c = read();
  if(c === 'granted') load();
  else if(c !== 'denied') show();
})();
