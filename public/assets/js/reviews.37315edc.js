/* ============================================================
   VISITOR REVIEWS — JMReviews
   ------------------------------------------------------------
   Visitors rate the local service providers listed on the site:
     'transport'  Getting Around providers (taxi, auto, guide, rentals…) — record id
     'operator'   Things-to-do activity operators — providerId
   A review is written to Firestore reviews/{id} as "pending" (checked by
   firestore.rules). An admin approves it in the admin's Inbox → Reviews,
   which republishes published/reviews: one summary per provider (average,
   count, latest reviews). The site reads only that summary, through
   VJData.reviews() — nothing a visitor writes appears unchecked.

   Used by transport.js (cards), tourist-mode.js (provider detail) and the
   Things-to-do sheet (core.js). Any element with data-review-type /
   data-review-id / data-review-name opens the form (delegated, once).
   ============================================================ */
const JMReviews = (function(){
  'use strict';
  const DONE_KEY = 'vj_reviewed';            // {"transport:<id>": timestamp, _last: timestamp} on this device only
  const GAP_MS = 60*1000;                     // at most one review a minute from one device
  const TYPES = {transport:true, operator:true};
  const ID_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,80}$/;
  const WORDS = ['', 'Poor', 'Below average', 'Okay', 'Good', 'Excellent'];
  const esc = s=>String(s==null ? '' : s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const txt = v=>(v==null ? '' : String(v)).replace(/\s+/g, ' ').trim();

  function track(name, d){
    const x = Object.assign({event:name, source:'reviews'}, d||{});
    try{ document.dispatchEvent(new CustomEvent('jm:analytics', {detail:x})); if(Array.isArray(window.dataLayer)) window.dataLayer.push(x); }catch(e){}
  }
  function done(){ try{ const v = JSON.parse(localStorage.getItem(DONE_KEY) || '{}'); return v && typeof v==='object' ? v : {}; }catch(e){ return {}; } }
  function markDone(key){ try{ const v = done(), t = Date.now(); v[key] = t; v._last = t; localStorage.setItem(DONE_KEY, JSON.stringify(v)); }catch(e){} }
  const valid = (type, id)=>!!TYPES[type] && ID_RE.test(String(id || ''));
  function summary(type, id){ try{ return (window.VJData && VJData.reviews) ? VJData.reviews(type, id) : null; }catch(e){ return null; } }
  function stars(n){                          // ★★★★☆ — whole stars, the number is always shown next to it
    const k = Math.max(0, Math.min(5, Math.round(n)));
    return '<span class="vj-rv-stars-row" aria-hidden="true">'+'★'.repeat(k)+'<span class="vj-rv-off">'+'★'.repeat(5-k)+'</span></span>';
  }
  function when(d){
    const t = Date.parse(d || ''); if(!isFinite(t)) return '';
    try{ return new Date(t).toLocaleDateString('en-IN', {month:'short', year:'numeric'}); }catch(e){ return ''; }
  }

  /* ---------------- markup for other modules ---------------- */
  // A "Rate" control for a provider. cls: the host's own button/link class.
  function button(type, id, name, cls, label){
    if(!valid(type, id) || !txt(name)) return '';
    return '<button type="button" class="'+esc(cls || 'vj-rate-btn')+'" data-review-type="'+esc(type)+'" data-review-id="'+esc(id)+'" data-review-name="'+esc(txt(name))+'"'+
      ' aria-haspopup="dialog" aria-label="Rate '+esc(txt(name))+'"><span aria-hidden="true">☆</span> '+esc(label || 'Rate')+'</button>';
  }
  // "★ 4.3 · 7 reviews" or '' — short line for cards.
  function line(type, id){
    const s = summary(type, id); if(!s) return '';
    return '<span class="vj-rv-line"><span class="visually-hidden">Rated '+s.avg.toFixed(1)+' out of 5 by '+s.count+' visitor'+(s.count===1?'':'s')+'</span>'+
      '<span aria-hidden="true"><span class="vj-rv-star">★</span> <strong>'+s.avg.toFixed(1)+'</strong> · '+s.count+' review'+(s.count===1?'':'s')+'</span></span>';
  }
  // Rating summary + latest approved reviews + the Rate button, for a provider's detail view (inside .modal-sheet).
  function block(type, id, name){
    if(!valid(type, id)) return '';
    const s = summary(type, id);
    let h = '<div class="modal-section pd-sec vj-rv-block"><h5>Visitor reviews</h5>';
    if(s){
      h += '<p class="vj-rv-sum">'+stars(s.avg)+' <strong>'+s.avg.toFixed(1)+'</strong> out of 5 · '+s.count+' review'+(s.count===1?'':'s')+'</p>';
      const recent = s.recent.slice(0, 5);
      if(recent.length) h += '<ul class="vj-rv-list">'+recent.map(r=>'<li><p class="vj-rv-meta">'+stars(r.rating)+'<span class="visually-hidden">'+r.rating+' out of 5</span> <span>'+
        esc(txt(r.name) || 'Visitor')+(when(r.date) ? ' · '+esc(when(r.date)) : '')+'</span></p>'+(txt(r.text) ? '<p class="vj-rv-text">'+esc(txt(r.text))+'</p>' : '')+'</li>').join('')+'</ul>';
    } else {
      h += '<p class="vj-rv-none">No reviews yet. Used this service? Your rating helps the next visitor choose.</p>';
    }
    return h+'<div class="pd-acts">'+button(type, id, name, 'modal-act', 'Rate this service')+'</div></div>';
  }

  /* ---------------- the review form (one dialog, built on first use) ---------------- */
  let ov = null, form = null, ret = null, cur = null, prevOverflow = '';
  function build(){
    if(ov) return;
    ov = document.createElement('div');
    ov.className = 'modal-overlay vj-rv-overlay';
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'vjRvTitle');
    ov.innerHTML =
      '<div class="modal-sheet vj-rv-sheet">'+
        '<div class="modal-content">'+
          '<button type="button" class="modal-close vj-rv-close" data-rv="close" aria-label="Close">&times;</button>'+
          '<div class="card-tag">Rate a local service</div>'+
          '<h2 id="vjRvTitle" tabindex="-1"></h2>'+
          '<form class="vj-rv-form" novalidate>'+
            '<fieldset class="vj-rv-pickers"><legend>Your rating</legend><div class="vj-rv-starbar">'+
              [1,2,3,4,5].map(n=>'<input type="radio" name="vjRvStar" id="vjRvS'+n+'" value="'+n+'"><label for="vjRvS'+n+'" data-n="'+n+'" title="'+WORDS[n]+'">'+
                '<span aria-hidden="true">★</span><span class="visually-hidden">'+n+' star'+(n>1?'s':'')+' — '+WORDS[n]+'</span></label>').join('')+
            '</div><span class="vj-rv-word" aria-hidden="true"></span></fieldset>'+
            '<label class="vj-rv-field" for="vjRvText">What was it like? <small>Optional</small></label>'+
            '<textarea id="vjRvText" rows="3" maxlength="600" placeholder="Punctual? Fair price? Would you use them again?"></textarea>'+
            '<label class="vj-rv-field" for="vjRvName">Your name <small>Optional · shown with your review</small></label>'+
            '<input type="text" id="vjRvName" maxlength="60" autocomplete="given-name">'+
            '<div class="vj-rv-hp" aria-hidden="true"><label for="vjRvWeb">Leave this empty</label><input type="text" id="vjRvWeb" tabindex="-1" autocomplete="off"></div>'+
            '<p class="vj-rv-err" role="alert"></p>'+
            '<div class="pd-acts"><button type="submit" class="modal-act primary" data-rv="send">Send review</button><button type="button" class="modal-act" data-rv="close">Cancel</button></div>'+
            '<p class="pd-fine">Jaisalmer Visit checks every review before it appears, so fake or abusive ones don\'t. Please rate a service you actually used.</p>'+
          '</form>'+
          '<div class="vj-rv-done" hidden><p class="vj-rv-done-msg" tabindex="-1"></p><div class="pd-acts"><button type="button" class="modal-act primary" data-rv="close">Done</button></div></div>'+
        '</div>'+
      '</div>';
    document.body.appendChild(ov);
    form = ov.querySelector('form');
    const bar = ov.querySelector('.vj-rv-starbar'), word = ov.querySelector('.vj-rv-word');
    const paint = n=>{ bar.querySelectorAll('label').forEach(l=>l.classList.toggle('is-on', Number(l.dataset.n) <= n)); word.textContent = WORDS[n] || ''; };
    const chosen = ()=>Number((form.querySelector('input[name="vjRvStar"]:checked') || {}).value) || 0;
    bar.addEventListener('change', ()=>{ paint(chosen()); err(''); });
    bar.addEventListener('mouseover', e=>{ const l = e.target.closest('label'); if(l) paint(Number(l.dataset.n)); });
    bar.addEventListener('mouseleave', ()=>paint(chosen()));
    ov.addEventListener('click', e=>{ if(e.target===ov || e.target.closest('[data-rv="close"]')) close(); });
    ov.addEventListener('keydown', e=>{
      if(e.key==='Escape'){ e.stopPropagation(); close(); return; }     // the page's own Escape would close the sheet underneath
      if(e.key!=='Tab') return;
      const f = Array.from(ov.querySelectorAll('button,textarea,input:not([tabindex="-1"])')).filter(x=>!x.disabled && x.offsetParent!==null && (x.type!=='radio' || x.checked || !form.querySelector('input[name="vjRvStar"]:checked')));
      if(!f.length) return;
      const i = f.indexOf(document.activeElement);
      if(e.shiftKey && i<=0){ e.preventDefault(); f[f.length-1].focus(); } else if(!e.shiftKey && i===f.length-1){ e.preventDefault(); f[0].focus(); }
    });
    form.addEventListener('submit', e=>{ e.preventDefault(); send(chosen()); });
    ov._paint = paint;
  }
  function err(m){ const p = ov && ov.querySelector('.vj-rv-err'); if(p) p.textContent = m || ''; }
  function finish(msg){
    form.hidden = true;
    const d = ov.querySelector('.vj-rv-done'); d.hidden = false;
    const p = d.querySelector('.vj-rv-done-msg'); p.textContent = msg; p.focus({preventScroll:true});
  }
  function open(type, id, name, trigger){
    if(!valid(type, id) || !txt(name)) return false;
    build();
    cur = {type:type, id:String(id), name:txt(name).slice(0, 120), key:type+':'+id};
    ret = trigger || document.activeElement;
    ov.querySelector('#vjRvTitle').textContent = cur.name;
    form.reset(); form.hidden = false; ov._paint(0); err('');
    ov.querySelector('.vj-rv-done').hidden = true;
    const send = form.querySelector('[data-rv="send"]'); send.disabled = false; send.textContent = 'Send review';
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ov.classList.add('open');
    track('review_open', {targetType:type, targetId:cur.id});
    if(done()[cur.key]) finish('You\'ve already rated '+cur.name+' from this device — thank you. It shows on the site once it has been checked.');
    else { try{ ov.querySelector('#vjRvTitle').focus({preventScroll:true}); }catch(e){} }
    return true;
  }
  function close(){
    if(!ov || !ov.classList.contains('open')) return;
    ov.classList.remove('open');
    document.body.style.overflow = prevOverflow;
    const r = ret; ret = null; cur = null;
    if(r && r.isConnected && r.focus) try{ r.focus({preventScroll:true}); }catch(e){}
  }
  async function send(rating){
    if(!cur) return;
    if(!(rating>=1 && rating<=5)){ err('Choose from 1 to 5 stars.'); const f = form.querySelector('#vjRvS1'); if(f) f.focus(); return; }
    if(form.querySelector('#vjRvWeb').value){ finish('Thank you — your review has been sent.'); return; }   // honeypot: a bot filled the hidden field
    const d = done();
    if(d._last && Date.now()-d._last < GAP_MS){ err('Please wait a minute before sending another review.'); return; }
    if(!window.VJData || !VJData.submitReview){ err('Reviews can\'t be sent right now. Please try again later.'); return; }
    const btn = form.querySelector('[data-rv="send"]'); btn.disabled = true; btn.textContent = 'Sending…'; err('');
    const t = cur;
    const r = await VJData.submitReview({targetType:t.type, targetId:t.id, targetName:t.name, rating:rating,
      text:form.querySelector('#vjRvText').value, name:form.querySelector('#vjRvName').value});
    if(cur!==t) return;                       // closed meanwhile
    if(r && r.ok){
      markDone(t.key);
      track('review_submit', {targetType:t.type, targetId:t.id, rating:rating});
      finish('Thank you! Your '+rating+'-star review of '+t.name+' has been sent. It appears on the site once Jaisalmer Visit has checked it.');
    } else {
      btn.disabled = false; btn.textContent = 'Send review';
      err(r && r.status===0 ? 'Couldn\'t send — check your connection and try again.' : 'Couldn\'t send your review. Please try again in a moment.');
    }
  }

  // Any "Rate" control anywhere on the page opens the form.
  document.addEventListener('click', e=>{
    const b = e.target.closest && e.target.closest('[data-review-type][data-review-id]'); if(!b) return;
    e.preventDefault();
    open(b.getAttribute('data-review-type'), b.getAttribute('data-review-id'), b.getAttribute('data-review-name'), b);
  });

  return {button:button, line:line, block:block, summary:summary, open:open, close:close};
})();
window.JMReviews = JMReviews;
