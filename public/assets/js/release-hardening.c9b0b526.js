/* ============================================================
   RELEASE HARDENING — header search entry point, footer social
   links (config-driven) and the partners pause control.
   ============================================================ */
(function(){
  /* ---- Search: header button, "/" shortcut, focus kept inside the panel ---- */
  const btn = document.getElementById('openSearchBtn');
  const panel = document.getElementById('searchPanel');
  if(btn && typeof openSearch === 'function') btn.addEventListener('click', ()=>openSearch(''));
  document.addEventListener('keydown', e=>{
    if(e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || typeof openSearch !== 'function') return;
    const t = e.target;
    if(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const mv = document.getElementById('mapView');
    if(document.querySelector('.modal-overlay.open') || (mv && !mv.hidden) || (panel && panel.classList.contains('open'))) return;
    e.preventDefault(); openSearch('');
  });
  if(panel) panel.addEventListener('keydown', e=>{
    if(!panel.classList.contains('open')) return;
    const items = Array.from(panel.querySelectorAll('.search-result-item[tabindex="0"]'));
    if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
      if(!items.length) return;
      const i = items.indexOf(document.activeElement);
      const next = e.key === 'ArrowDown' ? (i < 0 ? 0 : Math.min(items.length-1, i+1)) : (i <= 0 ? -1 : i-1);
      e.preventDefault();
      (next < 0 ? document.getElementById('searchInput') : items[next]).focus();
      return;
    }
    if(e.key !== 'Tab') return;
    const f = Array.from(panel.querySelectorAll('input,button,[tabindex="0"]')).filter(n=>n.offsetParent !== null);
    if(!f.length) return;
    const first = f[0], last = f[f.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });

  /* ---- Footer social links: add the real profile URLs here; empty entries stay hidden ---- */
  const SOCIAL_LINKS = VJData.socialLinks({ youtube:'', facebook:'', instagram:'', x:'' });
  const social = document.getElementById('footerSocial');
  if(social){
    let shown = 0;
    social.querySelectorAll('a[data-social]').forEach(a=>{
      let url = null;
      try{ const u = new URL(String(SOCIAL_LINKS[a.dataset.social] || '').trim()); if(u.protocol === 'https:') url = u.href; }catch(e){}
      if(url){ a.href = url; a.hidden = false; shown++; } else { a.remove(); }
    });
    social.hidden = !shown;
  }

})();
