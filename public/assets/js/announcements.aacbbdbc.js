/* ============================================================
   HEADER STRIP — admin-controlled announcements / ads in #announcementBar
   ------------------------------------------------------------
   Records come from the admin's "Header strip" (published/announcements):
     {text, linkText, linkMore, linkUrl ('#section', '/page' on this site or https://), activityId,
      startAt, endAt ('YYYY-MM-DD', inclusive), enabled, order, label ('' | 'Ad' | 'Sponsored'),
      theme (strip colour, see THEMES), logo (small image before the text)}
   - A message with a destination is ONE link: a tap anywhere on the strip opens it (linkText, if any, is
     shown underlined inside it). The strip takes the colour of the message on screen.
   - None active → the built-in line in the HTML stays as it is.
   - One active  → it replaces the built-in line (same markup, same look).
   - Several     → they share one spot and cross-fade every ROTATE_MS. Rotation pauses while
                   the bar is off screen or the tab is hidden (the existing is-paused class),
                   and on hover / keyboard focus. With prefers-reduced-motion there is no
                   rotation: each page load shows the next one in turn.
   - announcement_view / announcement_click go out on the usual jm:analytics / dataLayer channel.
   Clicks on activity links are handled by the existing #announcementBar listener in core.js.
   ============================================================ */
(function(){
  'use strict';
  var ROTATE_MS = 6000;
  var THEMES = ['lightblue', 'gold', 'green', 'orange', 'purple', 'dark'];
  var bar = document.getElementById('announcementBar');
  var inner = bar && bar.querySelector('.announcement-bar-inner');
  var list = VJData.get('ANNOUNCEMENTS', null);
  if(!inner || !Array.isArray(list)) return;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function day(v){ var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]).getTime() : null; }
  function safeUrl(u){ u = String(u || '').trim(); if(/^#[A-Za-z][\w-]*$/.test(u) || /^\/(?!\/)[^\s"'<>]*$/.test(u)) return u; try{ return new URL(u).protocol === 'https:' ? u : ''; }catch(e){ return ''; } }
  function themeOf(a){ return THEMES.indexOf(a && a.theme) >= 0 ? a.theme : ''; }
  function track(name, a){
    var d = {event:name, announcementId:a._uid || null, label:a.label || null, activityId:a.activityId || null};
    try{ document.dispatchEvent(new CustomEvent('jm:analytics', {detail:d})); if(Array.isArray(window.dataLayer)) window.dataLayer.push(d); }catch(e){}
  }

  var today = new Date(); today.setHours(0, 0, 0, 0); today = today.getTime();
  var active = list.filter(function(a){
    if(!a || a.enabled === false || !String(a.text || '').trim()) return false;
    var s = day(a.startAt), e = day(a.endAt);
    return (s == null || today >= s) && (e == null || today <= e);
  }).sort(function(a, b){ return (Number(a.order) || 0) - (Number(b.order) || 0); });
  if(!active.length) return;

  function itemHtml(a){
    var tag = a.label === 'Ad' || a.label === 'Sponsored' ? '<span class="announcement-tag">' + esc(a.label) + '</span> ' : '';
    var logo = safeUrl(a.logo), u = a.activityId ? '#things-to-do' : safeUrl(a.linkUrl);
    var img = logo && !/^#/.test(logo) ? '<img class="announcement-logo" src="' + esc(logo) + '" alt="" width="22" height="22" decoding="async">' : '';
    var body = img + tag + esc(a.text);
    if(!u) return body;
    var more = a.linkMore ? '<span class="announcement-long">' + esc(a.linkMore) + '</span>' : '';
    var cta = a.linkText ? ' <span class="announcement-link">' + esc(a.linkText) + more + ' →</span>' : ' <span class="announcement-go" aria-hidden="true">→</span>';
    var ext = /^https:/.test(u);
    return '<a class="announcement-whole" href="' + esc(u) + '"' + (a.activityId ? ' data-activity="' + esc(a.activityId) + '"' : '') +
      (ext ? ' target="_blank" rel="noopener' + (tag ? ' sponsored' : '') + '"' : '') + '>' + body + cta + '</a>';
  }

  // The link fills the centred column; a tap on the bar's outer margin (wide screens) opens the message on screen too.
  function currentLink(){ return inner.querySelector('.announcement-item.is-current a.announcement-whole') || inner.querySelector(':scope > a.announcement-whole'); }
  bar.addEventListener('click', function(e){ if(e.target.closest('a')) return; var l = currentLink(); if(l) l.click(); });

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = {};
  function viewed(a){ if(seen[a._uid]) return; seen[a._uid] = 1; track('announcement_view', a); }
  function clickOf(a){ return function(e){ if(e.target.closest('a')) track('announcement_click', a); }; }

  if(active.length === 1 || reduce){
    var pick = 0;
    if(active.length > 1){ try{ pick = (Number(sessionStorage.getItem('vj_ann_i')) || 0) % active.length; sessionStorage.setItem('vj_ann_i', String(pick + 1)); }catch(e){} }
    var one = active[pick];
    inner.innerHTML = itemHtml(one);
    if(themeOf(one)) bar.dataset.theme = themeOf(one);
    bar.classList.toggle('has-link', !!currentLink());
    inner.addEventListener('click', clickOf(one));
    viewed(one);
    return;
  }

  // Several: stack them in one grid cell so the bar keeps the height of the tallest (no layout shift).
  inner.innerHTML = '<div class="announcement-rotator" aria-live="off">' + active.map(function(a, i){
    return '<div class="announcement-item' + (i ? '' : ' is-current') + '"' + (i ? ' aria-hidden="true"' : '') + '>' + itemHtml(a) + '</div>';
  }).join('') + '</div>';
  var items = Array.prototype.slice.call(inner.querySelectorAll('.announcement-item'));
  items.forEach(function(el, i){
    el.addEventListener('click', clickOf(active[i]));
    if(i) el.querySelectorAll('a').forEach(function(l){ l.tabIndex = -1; });
  });
  var cur = 0, hold = false;
  viewed(active[0]);
  function paintTheme(){ var t = themeOf(active[cur]); if(t) bar.dataset.theme = t; else delete bar.dataset.theme; bar.classList.toggle('has-link', !!currentLink()); }
  paintTheme();
  function show(n){
    items[cur].classList.remove('is-current'); items[cur].setAttribute('aria-hidden', 'true');
    items[cur].querySelectorAll('a').forEach(function(l){ l.tabIndex = -1; });
    cur = n;
    items[cur].classList.add('is-current'); items[cur].removeAttribute('aria-hidden');
    items[cur].querySelectorAll('a').forEach(function(l){ l.removeAttribute('tabindex'); });
    paintTheme();
    viewed(active[cur]);
  }
  inner.addEventListener('mouseenter', function(){ hold = true; });
  inner.addEventListener('mouseleave', function(){ hold = false; });
  inner.addEventListener('focusin', function(){ hold = true; });
  inner.addEventListener('focusout', function(){ hold = false; });
  setInterval(function(){
    if(hold || document.hidden || bar.classList.contains('is-paused')) return;
    show((cur + 1) % items.length);
  }, ROTATE_MS);
})();
