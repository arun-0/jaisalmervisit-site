/* ------------------------------------------------------------
   DISCOVER → UNDERSTAND → LOCATE → NAVIGATE → USE SERVICES → CONTACT → SAVE

   Extends existing systems — it adds no modal, map, audio player or database:
     modal     the one #modalOverlay/#modalSheet (showModalShell / closeModal).
               Views swap inside it (place → service → provider), never stack.
     map       JMMap.show / open / get / places / search / navigationUrl.
               The Leaflet SDK still loads only when the map is actually opened.
     audio     JMHistoryAudio.mount — same player, languages and states as before.
     providers JMActivities.experiences()  approved operators (never badged "Verified")
               JMTransport.list()          the Getting Around directory's records
               JMMap.places({type:'provider'})  verified-only (requireVerifiedProviders)
     contact   JMTransport.contact() — the existing Call / WhatsApp sheet
     saved     the Smart Map's 'jm_saved_places' store with the map's ids ('attr-<id>'),
               so a place saved here appears under the map's "Saved" filter.

   Optional, backward-compatible ATTRACTIONS fields (all may be omitted):
     services:['camel-safari',…]   overrides the area list in NEAR_ME_BY_AREA
     contact:{phone, whatsapp, website, email}
     ticket:{text, url}   timing:'…'   address:'…'   visible:false
   Hidden unless present. Nothing here fabricates a phone number, price, rating,
   address, timing, ticket price, URL or coordinate.

   Routes (Back button closes the current layer; refresh / shared links reopen it):
     #place/<placeId> · #place/<placeId>/<serviceId> · #tourist/<areaId>/<serviceId>
   ------------------------------------------------------------ */

/* Service model. type: 'provider' → provider list/detail (or honest empty state)
                        'facility' → mapped places nearby + the Smart Map filtered to them.
   Labels in NEAR_ME_BY_AREA that match nothing here stay non-interactive "good to know" notes.
   map:{cat,sub}  = Smart Tourist Map filter · query = map text search (no category exists yet)
   activityId     = Things to do entry (editorial copy + approved experiences)
   transport      = Getting Around mode id · keywords = narrows shared map subcategories */
const TM_SERVICE_CATALOG = [
  {id:'camel-safari', label:'Camel Safari',  icon:'🐪', type:'provider', category:'desert',     match:['Camel Safari'], activityId:'camel-safari', map:{cat:'services', sub:'Safari Providers'}, keywords:['camel'], providerSupported:true},
  {id:'jeep-safari',  label:'Jeep Safari',   icon:'🚙', type:'provider', category:'desert',     match:['Jeep Safari'],  activityId:'jeep-safari',  map:{cat:'services', sub:'Safari Providers'}, keywords:['jeep'],  providerSupported:true},
  {id:'desert-camp',  label:'Desert Camp',   icon:'⛺', type:'provider', category:'desert',     match:['Desert Camp'], map:{cat:'services', sub:'Safari Providers'}, keywords:['camp'], providerSupported:true,
   blurb:'Overnight desert camps are part of the Sam and Khuri experience. Ask about facilities before you book — options vary from camp to camp.'},
  {id:'boating',      label:'Lake Boating',  icon:'🛶', type:'provider', category:'activities', match:['Boating'], activityId:'lake-boating', providerSupported:true},
  {id:'taxi',         label:'Taxi',          icon:'🚕', type:'provider', category:'transport',  match:['Taxi','Full-day taxi'], transport:'taxi', map:{cat:'transport', sub:'Taxi'}, providerSupported:true},
  {id:'auto',         label:'Auto Rickshaw', icon:'🛺', type:'provider', category:'transport',  match:['Auto'], transport:'auto', map:{cat:'transport', sub:'Auto'}, providerSupported:true},
  {id:'guide',        label:'Local Guide',   icon:'🧭', type:'provider', category:'services',   match:['Local guide'], transport:'guide', map:{cat:'services', sub:'Guides'}, providerSupported:true},
  {id:'food',         label:'Food',          icon:'🍽️', type:'facility', category:'food',       match:['Food','Cafeteria'], map:{cat:'food'}},
  {id:'shopping',     label:'Shopping',      icon:'🛍️', type:'facility', category:'shopping',   match:['Shopping','Souvenir shop'], map:{cat:'shopping'}},
  {id:'atm',          label:'ATM',           icon:'🏧', type:'facility', category:'essential',  match:['ATM'], map:{cat:'essential', sub:'ATM'}},
  {id:'toilet',       label:'Toilet',        icon:'🚻', type:'facility', category:'essential',  match:['Toilet'], query:'toilet'},
  {id:'parking',      label:'Parking',       icon:'🅿️', type:'facility', category:'parking',    match:['Parking'], map:{cat:'transport', sub:'Parking'}, direct:true},
  {id:'petrol',       label:'Petrol',        icon:'⛽', type:'facility', category:'essential',  match:['Petrol'], map:{cat:'essential', sub:'Petrol Pump'}},
  {id:'hospital',     label:'Hospital',      icon:'🚑', type:'facility', category:'emergency',  match:['Hospital'], map:{cat:'essential', sub:'Hospital'}, emergency:true},
  {id:'emergency',    label:'Emergency',     icon:'🚑', type:'facility', category:'emergency',  match:['Emergency'], map:{cat:'essential'}, emergency:true},
  {id:'pharmacy',     label:'Pharmacy',      icon:'💊', type:'facility', category:'emergency',  match:['Pharmacy'], map:{cat:'essential', sub:'Pharmacy'}},
  {id:'attractions',  label:'Attractions',   icon:'🏰', type:'facility', category:'attractions',match:['Attractions'], map:{cat:'attractions'}}
];

const JMPlace = (function(){
  'use strict';
  const overlay = document.getElementById('modalOverlay'), sheet = document.getElementById('modalSheet');
  if(!overlay || !sheet || typeof ATTRACTIONS==='undefined') return null;

  const CITY = {lat:26.9124, lng:70.9127};           // Jaisalmer Fort — same centre as MAP_CONFIG
  const RADIUS_KM = {city:3, out:15};                 // "nearby" for city areas vs. out-of-town sites
  const PARKING_KM = {city:1, out:2};                 // a car park counts as this place's own only this close to it
  const NEAR_CITY_KM = 150;                           // beyond this a visitor's position isn't useful for distances
  const MAX_ROWS = 8;                                 // mapped facilities listed before "View on Map"
  const CAT_UI = [['attractions','🏰','Attractions'],['experiences','🐪','Experiences'],['food','🍽️','Food'],['shopping','🛍️','Shopping'],
                  ['transport','🚉','Transport'],['essential','🏥','Essentials'],['services','🧭','Local services']];

  const esc = escHtml;
  const txt = v=>(v==null ? '' : String(v)).replace(/\s+/g,' ').trim();
  const norm = s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const SVC = {}, LABEL_TO_SVC = {};
  TM_SERVICE_CATALOG.forEach(s=>{ SVC[s.id] = s; (s.match||[]).forEach(m=>{ LABEL_TO_SVC[m.toLowerCase()] = s.id; }); });
  const CHEV = '<svg class="pd-chev" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function track(name, d){                            // same privacy-light jm:analytics channel (ids only) — lead-gen ready
    const x = Object.assign({event:name, source:'tourist_companion'}, d||{});
    try{ document.dispatchEvent(new CustomEvent('jm:analytics', {detail:x})); if(Array.isArray(window.dataLayer)) window.dataLayer.push(x); }catch(e){}
  }
  function km(a, b, c, d){ const R=6371, r=x=>x*Math.PI/180, dl=r(c-a), dg=r(d-b); const h=Math.sin(dl/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(dg/2)**2; return 2*R*Math.asin(Math.sqrt(h)); }
  function fmtKm(k){ return k<1 ? (Math.max(1, Math.round(k*100))*10)+' m' : (k<10 ? k.toFixed(1) : Math.round(k))+' km'; }
  const hasLL = o=>!!o && typeof o.lat==='number' && typeof o.lng==='number' && isFinite(o.lat) && isFinite(o.lng);

  /* ---------------- validation (remote/admin data is never trusted) ---------------- */
  function safeTel(v){ const s = txt(v).replace(/[^\d+]/g,''); return /^\+?\d{7,15}$/.test(s) ? s : null; }
  function safeWa(v){ let d = txt(v).replace(/\D/g,''); if(d.length===10) d = '91'+d; return /^\d{11,15}$/.test(d) ? d : null; }
  function safeWeb(v){ try{ const u = new URL(txt(v)); return u.protocol==='https:' ? u.href : null; }catch(e){ return null; } }
  function safeMail(v){ const s = txt(v); return /^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i.test(s) ? s : null; }
  function contactOf(c){
    c = c && typeof c==='object' ? c : {};
    const o = {phone:safeTel(c.phone), whatsapp:safeWa(c.whatsapp), website:safeWeb(c.website), email:safeMail(c.email)};
    o.count = [o.phone, o.whatsapp, o.website, o.email].filter(Boolean).length;
    return o;
  }

  /* ---------------- data adapters ---------------- */
  const mapApi = ()=>window.JMMap || null;
  const place = id=>ATTRACTIONS.find(a=>a.id===id && a.visible!==false) || null;
  function areaOf(placeId){ for(const k in TM_AREAS){ if((TM_AREAS[k].places||[]).indexOf(placeId)>=0) return k; } return null; }
  function areaLabel(areaId){ const b = document.querySelector('.area-btn[data-area="'+areaId+'"]'); return b ? txt(b.textContent) : ''; }
  function geo(placeId){                              // verified coordinates only — null when the map has none
    const m = mapApi(); if(!m || !m.has(placeId)) return null;
    const g = m.get(placeId); return hasLL(g) ? g : null;
  }
  function user(){                                    // the visitor's position, only if they shared it and they're near Jaisalmer
    const u = (typeof tmUserLoc!=='undefined') ? tmUserLoc : null;
    return (hasLL(u) && km(u.lat, u.lng, CITY.lat, CITY.lng) <= NEAR_CITY_KM) ? u : null;
  }
  function originOf(ctx){
    if(ctx && ctx.placeId){
      const a = place(ctx.placeId); if(!a) return null;
      const g = geo(a.id), ar = areaOf(a.id);
      return {kind:'place', id:a.id, name:a.name, lat:g?g.lat:null, lng:g?g.lng:null, slug:g?a.id:null, areaId:ar,
        city:!!(ar && TM_AREAS[ar].group==='city')};
    }
    if(ctx && ctx.areaId && TM_AREAS[ctx.areaId]){
      const ar = TM_AREAS[ctx.areaId], ll = ar.ll;
      return {kind:'area', id:ctx.areaId, name:areaLabel(ctx.areaId) || ctx.areaId, lat:ll?ll[0]:null, lng:ll?ll[1]:null, slug:null,
        areaId:ctx.areaId, city:ar.group==='city'};
    }
    return null;
  }
  const radius = o=>o.city ? RADIUS_KM.city : RADIUS_KM.out;
  function mapCtx(o){ return o.slug ? {near:o.slug} : {area:o.areaId}; }   // JMMap drops anything it can't place
  function refPoint(o){                               // distances: "from you" beats "from <place>"
    const u = user(); if(u) return {lat:u.lat, lng:u.lng, label:'from you'};
    return hasLL(o) ? {lat:o.lat, lng:o.lng, label:'from '+o.name} : null;
  }

  function entriesFor(a, areaId){                     // what "Services at this place" shows
    if(Array.isArray(a.services) && a.services.length)
      return a.services.map(id=>SVC[id]).filter(Boolean).map(s=>({emoji:s.icon, label:s.label, svc:s}));
    return (NEAR_ME_BY_AREA[areaId]||[]).map(e=>{
      const i = e.indexOf(' '), label = e.slice(i+1), id = LABEL_TO_SVC[label.toLowerCase()];
      return {emoji:e.slice(0,i), label:label, svc:id ? SVC[id] : null};
    });
  }
  function resolveNearby(label, self){                // "Nearby" strings → a place sheet, a map place, or plain text
    const n = norm(label);
    const hit = ATTRACTIONS.find(x=>x.id!==self && x.visible!==false && (n.indexOf(norm(x.name))>=0 || norm(x.name).indexOf(n)>=0));
    if(hit) return {kind:'place', a:hit};
    const m = mapApi(), f = m && m.findInText ? m.findInText(label)[0] : null;
    if(f && f.slug!==self) return {kind:'map', slug:f.slug, name:f.name};
    return {kind:'text'};
  }
  function mapCounts(o){                              // real mapped places around a point, per map category
    const m = mapApi(); if(!m || !hasLL(o)) return [];
    const R = radius(o), acc = {};
    m.places().forEach(l=>{
      if(l.slug===o.slug) return;
      const d = km(o.lat, o.lng, l.lat, l.lng); if(d > R) return;
      const c = acc[l.category] || (acc[l.category] = {n:0, d:Infinity}); c.n++; if(d<c.d) c.d = d;
    });
    return CAT_UI.filter(c=>acc[c[0]]).map(c=>({cat:c[0], icon:c[1], label:c[2], n:acc[c[0]].n, d:acc[c[0]].d}));
  }
  function mappedFor(svc, o){                         // facilities: mapped (non-provider) places for this service near the origin
    const m = mapApi(); if(!m) return [];
    let list = svc.query ? (m.search ? m.search(svc.query) : [])
             : svc.map ? m.places({category:svc.map.cat, subcategories:svc.map.sub ? [svc.map.sub] : undefined}) : [];
    list = list.filter(l=>l.type!=='provider' && l.slug!==o.slug);
    const ref = refPoint(o);
    list.forEach(l=>{ l._d = ref ? km(ref.lat, ref.lng, l.lat, l.lng) : null; l._o = hasLL(o) ? km(o.lat, o.lng, l.lat, l.lng) : null; });
    if(hasLL(o)) list = list.filter(l=>l._o <= radius(o));
    return list.sort((a,b)=>(a._d==null ? 0 : a._d) - (b._d==null ? 0 : b._d));
  }
  /* Parking (svc.direct): the place's own car parks — nearest to the place, not to the visitor — so one tap can
     open the map on it (blue "P" dot) with Directions from the visitor's location. */
  function parkingFor(o){
    let list = mappedFor(SVC.parking, o);
    if(hasLL(o)) list = list.filter(l=>l._o <= parkingRadius(o)).sort((a,b)=>a._o-b._o);
    return list;
  }
  const parkingRadius = o=>o.city ? PARKING_KM.city : PARKING_KM.out;
  function openParking(o){
    const list = parkingFor(o); if(!list.length) return false;
    const p = list[0];
    track('parking_open', {placeId:o.kind==='place' ? o.id : null, areaId:o.areaId, slug:p.slug, count:list.length});
    openOnMap(m=>m.show(p.slug, Object.assign({cat:'transport', sub:'Parking'}, o.slug ? {near:o.slug} : (o.areaId ? {area:o.areaId} : {}))));
    return true;
  }
  function waLink(n, label){ return 'https://wa.me/'+n+'?text='+encodeURIComponent('Hi, I found your '+label+' service on Jaisalmer Visit.'); }
  function providersFor(svc, o){                      // one normalised view of every real provider source
    const out = [], seen = new Set(), m = mapApi();
    if(svc.activityId && typeof JMActivities!=='undefined' && JMActivities.experiences){
      JMActivities.experiences(svc.activityId).forEach(e=>{
        const g = e.mapRef ? geo(e.mapRef) : null;
        out.push({key:'exp:'+e.experienceId, source:'experience', name:e.providerName || e.title, offer:e.title,
          description:e.description, location:e.location || e.providerLocation, priceText:e.priceText || null,
          duration:e.duration, days:(e.availableDays||[]).join(', '), times:(e.availableTimes||[]).join(', '),
          phone:e.phone ? '+'+e.phone : null, whatsapp:e.whatsapp, waUrl:e.waUrl,
          verified:false, featured:false, rating:null, reviewCount:null,          // approval is not verification — no badge
          reviewType:'operator', reviewId:e.providerId,
          lat:g?g.lat:null, lng:g?g.lng:null, mapSlug:g?e.mapRef:null});
      });
    }
    if(svc.transport && window.JMTransport && JMTransport.list){
      JMTransport.list(svc.transport).forEach(p=>{
        const mid = 'prov-'+p.id, onMap = !!(m && m.get(mid)); seen.add(mid);
        out.push({key:'tr:'+p.id, source:'transport', name:p.businessName, description:p.shortDescription || p.description,
          location:(p.serviceAreas||[]).slice(0,3).join(' · '), phone:p.phone, whatsapp:p.whatsapp,
          waUrl:p.whatsapp ? waLink(p.whatsapp, svc.label) : null, website:p.profileUrl,
          verified:p.verified===true, featured:p.featured===true, rating:p.rating, reviewCount:p.reviewCount,
          reviewType:'transport', reviewId:p.id,
          lat:p.latitude, lng:p.longitude, mapSlug:onMap ? mid : null});
      });
    }
    if(svc.map && m){
      m.places({type:'provider', category:svc.map.cat, subcategories:svc.map.sub ? [svc.map.sub] : undefined}).forEach(l=>{
        if(seen.has(l.id)) return;
        if(svc.keywords && !svc.keywords.some(k=>norm([l.name, l.short].concat(l.tags||[]).join(' ')).indexOf(k)>=0)) return;
        out.push({key:'map:'+l.id, source:'map', name:l.name, description:l.short, location:(l.serviceAreas||[]).slice(0,3).join(' · ') || l.address,
          phone:l.phone, whatsapp:l.whatsapp, waUrl:l.whatsapp ? waLink(l.whatsapp, svc.label) : null, website:l.website || l.profileUrl,
          verified:l.verified===true, featured:l.featured===true, rating:l.rating, reviewCount:l.reviewCount,
          reviewType:/^prov-/.test(l.id) ? 'transport' : null, reviewId:/^prov-/.test(l.id) ? l.id.slice(5) : null,
          lat:l.lat, lng:l.lng, mapSlug:l.slug});
      });
    }
    const ref = refPoint(o);
    out.forEach(p=>{
      p.phone = safeTel(p.phone); p.whatsapp = safeWa(p.whatsapp); p.website = safeWeb(p.website);
      if(!(typeof p.waUrl==='string' && p.whatsapp && p.waUrl.indexOf('https://wa.me/'+p.whatsapp)===0)) p.waUrl = p.whatsapp ? waLink(p.whatsapp, svc.label) : null;
      const rv = (p.reviewType && window.JMReviews) ? JMReviews.summary(p.reviewType, p.reviewId) : null;   // approved visitor reviews win
      if(rv){ p.rating = Math.round(rv.avg*10)/10; p.reviewCount = rv.count; }
      p.rating = (typeof p.rating==='number' && p.rating>=0 && p.rating<=5) ? p.rating : null;
      p.reviewCount = (typeof p.reviewCount==='number' && p.reviewCount>=0) ? Math.floor(p.reviewCount) : null;
      p._d = (ref && hasLL(p)) ? km(ref.lat, ref.lng, p.lat, p.lng) : null;
    });
    return out;
  }

  /* ---------------- saved places (localStorage now; swap the adapter for an account later) ---------------- */
  const Saved = (function(){
    const KEY = 'jm_saved_places';                    // shared with the Smart Tourist Map's "Saved" filter
    let adapter = {
      read:()=>{ try{ const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; }catch(e){ return []; } },
      write:list=>{ try{ localStorage.setItem(KEY, JSON.stringify(list)); return true; }catch(e){ return false; } }
    };
    const idOf = placeId=>'attr-'+placeId;            // same id the map uses for attraction records
    return {
      has:placeId=>adapter.read().indexOf(idOf(placeId))>=0,
      toggle:placeId=>{
        const list = adapter.read(), id = idOf(placeId), i = list.indexOf(id);
        if(i>=0) list.splice(i,1); else list.push(id);
        const ok = adapter.write(list);
        try{ document.dispatchEvent(new CustomEvent('jm:saved-change', {detail:{placeId:placeId, saved:i<0}})); }catch(e){}
        return ok ? i<0 : null;                       // null → storage unavailable (private mode, quota)
      },
      list:()=>adapter.read().filter(x=>/^attr-/.test(x)).map(x=>x.slice(5)).filter(place),   // future: My Places / My Trip
      setAdapter:a=>{ if(a && typeof a.read==='function' && typeof a.write==='function') adapter = a; }
    };
  })();

  /* ---------------- view state (one layer; content swaps) ---------------- */
  let cur = null;          // {kind:'place'|'service'|'provider'|'activity', placeId, origin, svcId, key}
  let owned = false;       // the open modal belongs to this flow
  let trail = [];          // places visited through "Nearby" — lets "‹ Previous" step back without stacking modals
  let provCache = [], provUi = {q:'', sort:'nearest'};
  let stickyObs = null;
  const isOpen = ()=>overlay.classList.contains('open');
  const mapIsOpen = ()=>document.documentElement.classList.contains('mv-open') || /^#map(?:[\/?]|$)/.test(location.hash);

  /* ---------------- routing ---------------- */
  const ROUTE_RE = /^#(place|tourist)\/([A-Za-z0-9_-]{1,40})(?:\/([A-Za-z0-9_-]{1,40}))?$/;
  function parse(h){ const m = ROUTE_RE.exec(h==null ? location.hash : h); return m ? {kind:m[1], id:m[2], svc:m[3]||null} : null; }
  function setRoute(hash){
    if(mapIsOpen() || location.hash===hash) return;   // never disturb the map's own #map routing
    const url = location.pathname + location.search + hash;
    try{ if(parse()) history.replaceState(history.state, '', url); else history.pushState({jmPlace:true}, '', url); }catch(e){}
  }
  function applyRoute(r){
    if(r.kind==='place'){
      const a = place(r.id); if(!a) return false;
      if(r.svc && SVC[r.svc]){ if(!(cur && cur.kind==='service' && cur.svcId===r.svc && cur.origin.id===a.id && isOpen())) showService(r.svc, {placeId:a.id}, {route:false}); }
      else if(!(cur && cur.kind==='place' && cur.placeId===a.id && isOpen())) showPlace(a, {route:false});
      return true;
    }
    if(r.kind==='tourist' && TM_AREAS[r.id] && SVC[r.svc]){
      if(typeof selectArea==='function' && typeof touristModePanel!=='undefined' && touristModePanel.classList.contains('open')) selectArea(r.id);
      showService(r.svc, {areaId:r.id}, {route:false});
      return true;
    }
    return false;
  }
  window.addEventListener('hashchange', ()=>{
    const r = parse();
    if(r && !mapIsOpen()){ if(!applyRoute(r) && owned && isOpen()) closeModal({silent:true}); return; }
    if(!r && owned && isOpen() && !mapIsOpen()) closeModal({silent:true});   // Back from a #place entry closes the sheet
  });

  /* ---------------- shared render bits ---------------- */
  function closeBtn(label){ return '<div class="ax-bar"><button type="button" class="modal-close ax-close" id="modalCloseBtn" data-pd="close" aria-label="'+esc(label)+'">&times;</button></div>'; }
  function tile(attrs, icon, name, sub, tail){
    return '<button type="button" class="pd-tile" '+attrs+'><span class="pd-tile-ico" aria-hidden="true">'+icon+'</span>'+
      '<span class="pd-tile-name">'+esc(name)+(sub ? '<small>'+esc(sub)+'</small>' : '')+'</span>'+(tail||'')+CHEV+'</button>';
  }
  function ratingText(p){ return p.rating==null ? '' : '★ '+p.rating.toFixed(1)+(p.reviewCount ? ' · '+p.reviewCount.toLocaleString('en-IN')+' review'+(p.reviewCount===1?'':'s') : ''); }
  function distHtml(a, g){
    const u = user();
    if(u && g) return esc(fmtKm(km(u.lat, u.lng, g.lat, g.lng))+' from your location (straight line)')+'<small>'+esc(a.distance)+'</small>';
    const canLocate = g && 'geolocation' in navigator;
    return esc(a.distance)+(canLocate ? '<button type="button" class="pd-mini" data-pd="locate">📍 Distance from me</button><span class="pd-msg" data-pd-locmsg role="status" aria-live="polite"></span>' : '');
  }
  function swap(html, cls){
    const wasOpen = isOpen();
    sheet.classList.remove('is-activity', 'pd-view');
    sheet.classList.add('is-place');
    if(cls) sheet.classList.add(cls);
    sheet.innerHTML = html;
    owned = true;
    if(!wasOpen) showModalShell();                    // focus → Close, scroll lock, restore-focus bookkeeping
    else { sheet.scrollTop = 0; const t = sheet.querySelector('#modalTitle'); if(t) try{ t.focus({preventScroll:true}); }catch(e){} }
    wireSticky();
  }
  function wireSticky(){
    if(stickyObs){ stickyObs.disconnect(); stickyObs = null; }
    const bar = sheet.querySelector('[data-pd-sticky]'), anchor = sheet.querySelector('[data-pd-primary]');
    if(!bar || !anchor || !('IntersectionObserver' in window)) return;
    stickyObs = new IntersectionObserver(es=>es.forEach(en=>{
      const past = !en.isIntersecting && en.rootBounds && en.boundingClientRect.top < en.rootBounds.top;
      bar.classList.toggle('is-shown', !!past);
    }), {root:sheet, threshold:0});
    stickyObs.observe(anchor);
  }

  /* ================= VIEW 1 — PLACE DETAIL ================= */
  function placeHtml(a){
    const g = geo(a.id), areaId = areaOf(a.id), area = areaId ? TM_AREAS[areaId] : null, aName = areaId ? areaLabel(areaId) : '';
    const saved = Saved.has(a.id), c = contactOf(a.contact), prev = trail.length ? place(trail[trail.length-1]) : null;
    const nav = g ? (mapApi().navigationUrl(a.id)) : null;
    // Place → View on Map (in-site, OSM map via JMMap). The map's own directions panel has the route and the
    // Google / Apple Maps hand-off, so the sheet no longer repeats a "Get Directions" link (client, 19 Oct 2026).
    // A place without verified coordinates gets no pin and no "directions" claim — only an honest name search.
    const mapBtns = cls=>'<button type="button" class="modal-act primary" data-pd="map" aria-label="View '+esc(a.name)+' on map"><span aria-hidden="true">📍</span> View on Map</button>';
    const search = !g && mapApi() && mapApi().placeSearchUrl ? mapApi().placeSearchUrl(a.id) : null;
    const primary = (g && nav)
      ? '<div class="pd-primary" data-pd-primary>'+mapBtns()+'</div>'
      : (search ? '<div class="pd-acts"><a class="modal-act" data-pd="dir" href="'+esc(search)+'" target="_blank" rel="noopener" aria-label="Search for '+esc(a.name)+' on Google Maps"><span aria-hidden="true">🔎</span> Find on Google Maps</a></div>'+
          '<p class="pd-fine">This place isn\'t pinned on the Jaisalmer Visit map yet, because its exact location hasn\'t been verified.</p>' : '');
    const sticky = (g && nav) ? '<div class="pd-sticky" data-pd-sticky>'+mapBtns()+'</div>' : '';

    const info = [];
    // the place's YouTube video (admin: Places → YouTube video) sits beside Location, in the row's free space
    const yt = typeof youtubeWatchUrl==='function' ? youtubeWatchUrl(a.youtubeUrl) : null;
    const ytBtn = yt ? '<a class="pd-yt" data-pd="youtube" href="'+esc(yt)+'" target="_blank" rel="noopener noreferrer" aria-label="Watch '+esc(a.name)+' video on YouTube (opens in a new tab)">'+
      '<svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true" focusable="false"><rect width="28" height="20" rx="5" fill="#FF0000"/><path d="M11 5.5v9l7.5-4.5z" fill="#fff"/></svg><span>Watch video</span></a>' : '';
    info.push(['📍','Location', esc(txt(a.address) || a.location) + (aName ? '<small>Tourist Mode area: '+esc(aName)+'</small>' : ''), true, ytBtn]);
    if(a.distance || g) info.push(['📏','Distance', '<span data-pd-dist>'+distHtml(a, g)+'</span>']);
    if(a.bestTime) info.push(['🕐','Best time', esc(a.bestTime)]);
    const tk = a.ticket && typeof a.ticket==='object' ? a.ticket : null, tkUrl = tk ? safeWeb(tk.url) : null;
    if(tk && (txt(tk.text) || tkUrl)) info.push(['🎟','Entry', esc(txt(tk.text) || 'Tickets available online')+(tkUrl ? '<a class="pd-mini" href="'+esc(tkUrl)+'" target="_blank" rel="noopener noreferrer">Buy tickets</a>' : '')]);
    if(txt(a.timing)) info.push(['⏰','Timing', esc(txt(a.timing))]);

    const entries = entriesFor(a, areaId), act = entries.filter(e=>e.svc), rest = entries.filter(e=>!e.svc);
    const where = aName || a.name;
    const services = entries.length ? '<div class="modal-section pd-sec"><h5>Services around '+esc(where)+'</h5>'+
      (act.length ? '<div class="pd-tiles">'+act.map(e=>tile('data-pd="svc" data-svc="'+esc(e.svc.id)+'" aria-label="'+esc(e.label)+' around '+esc(where)+': '+(e.svc.type==='facility'?'find nearby':'see options')+'"',
        e.emoji, e.label, e.svc.direct ? 'Show on map' : e.svc.type==='facility' ? 'Find nearby' : 'See options', '')).join('')+'</div>' : '')+
      (rest.length ? '<p class="pd-also">Also here: '+rest.map(e=>'<span><span aria-hidden="true">'+e.emoji+'</span> '+esc(e.label)+'</span>').join(' ')+'</p>' : '')+
      '</div>' : '';

    const near = (a.nearby||[]).map(n=>{
      const r = resolveNearby(n, a.id);
      if(r.kind==='place'){
        const g2 = geo(r.a.id), d = (g && g2) ? fmtKm(km(g.lat, g.lng, g2.lat, g2.lng)) : '';
        return '<button type="button" class="pd-near-btn" data-pd="place" data-id="'+esc(r.a.id)+'" aria-label="Open '+esc(r.a.name)+(d?', '+d+' away':'')+'"><span>'+esc(n)+'</span>'+(d?'<small>'+esc(d)+'</small>':'')+'</button>';
      }
      if(r.kind==='map') return '<button type="button" class="pd-near-btn" data-pd="mapslug" data-slug="'+esc(r.slug)+'" aria-label="Show '+esc(r.name)+' on the map"><span>'+esc(n)+'</span><small>on map</small></button>';
      return '<span class="pd-near-static">'+esc(n)+'</span>';
    }).join('');

    const counts = mapCounts({lat:g&&g.lat, lng:g&&g.lng, slug:g?a.id:null, city:!!(area && area.group==='city')});
    const countsHtml = counts.length ? '<div class="modal-section pd-sec"><h5>On the map near '+esc(a.name)+'</h5><div class="pd-tiles">'+
      counts.map(x=>tile('data-pd="mapcat" data-cat="'+x.cat+'" aria-label="'+x.n+' '+esc(x.label)+' near '+esc(a.name)+', nearest '+fmtKm(x.d)+': show on map"',
        x.icon, x.label, 'Nearest '+fmtKm(x.d), '<span class="pd-tile-n">'+x.n+'</span>')).join('')+'</div></div>' : '';

    let contact = '';
    if(c.count){
      const acts = [];
      if(c.phone && c.whatsapp) acts.push('<button type="button" class="modal-act" data-pd="contact-place"><span aria-hidden="true">📞</span> Call or WhatsApp</button>');
      else if(c.phone) acts.push('<a class="modal-act" data-pd="call" href="tel:'+esc(c.phone)+'"><span aria-hidden="true">📞</span> Call</a>');
      else if(c.whatsapp) acts.push('<a class="modal-act" data-pd="wa" href="https://wa.me/'+esc(c.whatsapp)+'" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">💬</span> WhatsApp</a>');
      if(c.website) acts.push('<a class="modal-act" data-pd="web" href="'+esc(c.website)+'" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">🌐</span> Official website</a>');
      if(c.email) acts.push('<a class="modal-act" data-pd="mail" href="mailto:'+esc(c.email)+'"><span aria-hidden="true">📧</span> Email</a>');
      contact = '<div class="modal-section pd-sec"><h5>Contact &amp; official information</h5><div class="pd-contact">'+acts.join('')+'</div></div>';
    }

    return closeBtn('Close '+a.name)+
      '<span class="pd-grip" aria-hidden="true"></span>'+
      placeMediaHtml(a, duneSvg(a.id+'x'), 'modal-hero pd-hero')+
      '<div class="modal-content">'+
        (prev ? '<button type="button" class="pd-back" data-pd="trail" aria-label="Back to '+esc(prev.name)+'"><span aria-hidden="true">‹</span> '+esc(prev.name)+'</button>' : '')+
        '<div class="card-tag">'+esc(a.tag)+'</div>'+
        '<div class="pd-titlerow"><h2 id="modalTitle" tabindex="-1">'+esc(a.name)+'</h2>'+
          '<button type="button" class="pd-save" data-pd="save" aria-pressed="'+saved+'" aria-label="'+(saved?'Saved: ':'Save ')+esc(a.name)+'">'+(saved?'♥ Saved':'♡ Save')+'</button></div>'+
        '<p class="modal-lede">'+esc(a.short)+'</p>'+
        '<div data-history-audio-slot></div>'+
        (area && area.note ? '<p class="pd-note">'+esc(area.note)+'</p>' : '')+
        '<div class="modal-section pd-sec"><h5>Visitor information</h5><dl class="pd-info">'+
          info.map(r=>'<div'+(r[3]?' class="pd-wide'+(r[4]?' pd-has-yt':'')+'"':'')+'><dt><span aria-hidden="true">'+r[0]+'</span>'+esc(r[1])+'</dt><dd>'+r[2]+'</dd>'+(r[4]||'')+'</div>').join('')+
        '</dl></div>'+
        (a.why ? '<div class="modal-section"><h5>Why visit</h5><p>'+esc(a.why)+'</p></div>' : '')+
        ((a.see||[]).length ? '<div class="modal-section"><h5>Things to see</h5><ul>'+a.see.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div>' : '')+
        services+
        (near ? '<div class="modal-section pd-sec"><h5>Nearby</h5><div class="pd-near">'+near+'</div></div>' : '')+
        countsHtml+
        contact+
        (a.tips ? '<div class="modal-section pd-sec"><h5>Useful tips</h5><p>'+esc(a.tips)+'</p></div>' : '')+
        primary+
      '</div>';
  }
  function showPlace(a, opts){
    opts = opts || {};
    if(!a) return false;
    if(!opts.keepTrail) trail = [];
    cur = {kind:'place', placeId:a.id};
    swap(placeHtml(a));
    JMHistoryAudio.mount(sheet.querySelector('[data-history-audio-slot]'), a);    // hides itself when a place has no audio
    if(window.SmartAdManager) SmartAdManager.notify('place-open', {placeId:a.id});
    if(opts.route!==false) setRoute('#place/'+a.id);
    track('place_detail_open', {placeId:a.id});
    return true;
  }

  /* ================= VIEW 2 — SERVICE AT A PLACE ================= */
  function serviceHtml(svc, o){
    const back = o.kind==='place' ? '<button type="button" class="pd-back" data-pd="back" aria-label="Back to '+esc(o.name)+'"><span aria-hidden="true">‹</span> '+esc(o.name)+'</button>' : '';
    const ai = svc.activityId && typeof ACTIVITY_INFO!=='undefined' ? ACTIVITY_INFO[svc.activityId] : null;
    const mode = svc.transport && typeof TRANSPORT_MODES!=='undefined' ? TRANSPORT_MODES.find(m=>m.id===svc.transport) : null;
    const where = o.kind==='place' ? 'near '+o.name : 'around '+o.name;
    let body = '', lede = (ai && ai.description) || (mode && mode.note) || svc.blurb || '';
    const mapBtn = (svc.map || svc.query) && mapApi() ? '<button type="button" class="modal-act primary" data-pd="svcmap"><span aria-hidden="true">🗺</span> View on Map</button>' : '';

    if(svc.type==='provider'){
      provCache = providersFor(svc, o); provUi = {q:'', sort:'nearest'};
      body = '<div class="modal-section pd-sec"><h5>Available providers</h5><div data-pd-provlist>'+provListHtml(svc, o)+'</div></div>';
      const extra = [];
      if(mapBtn) extra.push(mapBtn);
      if(svc.activityId) extra.push('<button type="button" class="modal-act" data-pd="activity">Full '+esc(svc.label.toLowerCase())+' guide</button>');
      if(mode) extra.push('<button type="button" class="modal-act" data-pd="transport">Getting Around directory</button>');
      body += extra.length ? '<div class="pd-acts">'+extra.join('')+'</div>' : '';
    } else {
      const list = svc.direct ? parkingFor(o) : mappedFor(svc, o), shown = list.slice(0, MAX_ROWS), ref = refPoint(o);
      const within = svc.direct ? parkingRadius(o) : radius(o);
      // no car park mapped at this place: one tap still gets the visitor on their way (road route to the place itself)
      const toPlace = svc.direct && o.kind==='place' && o.slug && mapApi() && mapApi().directions
        ? '<div class="pd-acts"><button type="button" class="modal-act primary" data-pd="placeroute"><span aria-hidden="true">🧭</span> Directions to '+esc(o.name)+'</button></div>' : '';
      body = '<div class="modal-section pd-sec"><h5>'+esc(svc.label)+' '+esc(where)+'</h5>'+
        (list.length ?
          '<p class="pd-count">'+list.length+' mapped'+(hasLL(o) ? ' within '+within+' km' : '')+(ref ? ' · nearest first' : '')+'</p>'+
          '<ul class="pd-rows">'+shown.map(l=>{
            const nav = l.navigationUrl;
            return '<li class="pd-row"><div class="pd-row-text"><strong>'+esc(l.name)+'</strong><small>'+esc(l.tag || '')+(l._d!=null ? ' · '+esc(fmtKm(l._d)+' '+ref.label) : '')+'</small></div>'+
              (l.type==='attraction' && place(l.slug) ? '<button type="button" class="modal-act" data-pd="place" data-id="'+esc(l.slug)+'" aria-label="Open '+esc(l.name)+'">Details</button>' : '')+
              '<button type="button" class="modal-act" data-pd="mapslug" data-slug="'+esc(l.slug)+'" aria-label="Show '+esc(l.name)+' on the map">Map</button>'+
              // client (31 Oct 2026): Directions draws the route on the Smart Map, not Google Maps
              (l.slug && mapApi() && mapApi().directions ? '<button type="button" class="modal-act" data-pd="route" data-slug="'+esc(l.slug)+'" aria-label="Directions to '+esc(l.name)+'">Directions</button>'
               : nav ? '<a class="modal-act" data-pd="dir" href="'+esc(nav)+'" target="_blank" rel="noopener noreferrer" aria-label="Directions to '+esc(l.name)+'">Directions</a>' : '')+'</li>';
          }).join('')+'</ul>'+
          (list.length>shown.length ? '<p class="pd-count" style="margin-top:10px">'+(list.length-shown.length)+' more on the map.</p>' : '')
        : toPlace ? '<div class="ax-empty"><h6>Parking at '+esc(o.name)+' isn\'t on the map yet</h6>'+
          '<p>Get directions to '+esc(o.name)+' itself, and ask locally where to park.</p>'+toPlace+'</div>'
        : '<div class="ax-empty"><h6>No '+esc(svc.label.toLowerCase())+' locations are mapped '+esc(where)+' yet</h6>'+
          '<p>'+(svc.query ? 'You can still search the Smart Tourist Map, or ask locally.' : 'Browse the Smart Tourist Map for what is listed, or ask locally.')+'</p></div>')+
        (svc.emergency ? '<div class="pd-emergency"><p><strong>In an emergency</strong> dial 112 — India\'s national emergency number for police, ambulance or fire.</p><a class="modal-act primary" href="tel:112" data-pd="call112">📞 Call 112</a></div>' : '')+
        '</div>'+
        (mapBtn ? '<div class="pd-acts">'+(toPlace && !list.length ? mapBtn.replace(' primary', '') : mapBtn)+'</div>' : '');   // one primary button
    }
    return closeBtn('Close '+svc.label)+
      '<span class="pd-grip" aria-hidden="true"></span>'+
      '<div class="modal-content">'+back+
        '<div class="card-tag">'+esc(o.kind==='place' ? 'Service · near '+o.name : 'Tourist Mode · '+o.name)+'</div>'+
        '<h2 id="modalTitle" tabindex="-1"><span aria-hidden="true">'+svc.icon+'</span> '+esc(svc.label)+'</h2>'+
        (lede ? '<p class="modal-lede">'+esc(lede)+'</p>' : '')+
        body+
      '</div>';
  }
  function provListHtml(svc, o){
    const all = provCache;
    if(!all.length){
      return '<div class="ax-empty"><h6>No local providers listed yet</h6>'+
        '<p>Explore '+esc(svc.label.toLowerCase())+' options '+esc(o.kind==='place' ? 'around '+o.name : 'in '+o.name)+
          ([svc.map && mapApi() ? 'on the map' : '', svc.activityId ? 'in the full guide' : '', svc.transport ? 'in the Getting Around directory' : ''].filter(Boolean).reduce((t,w,i,a)=>t+(i===0?' ':(i===a.length-1?' or ':', '))+w, ''))+
          '. Providers appear here only once they are listed with Jaisalmer Visit.</p>'+
        '<div class="pd-acts"><button type="button" class="modal-act" data-pd="add">+ Add your service</button></div></div>';
    }
    const q = norm(provUi.q), anyD = all.some(p=>p._d!=null), anyR = all.some(p=>p.rating!=null);
    let list = q ? all.filter(p=>norm([p.name, p.offer, p.description, p.location].join(' ')).indexOf(q)>=0) : all.slice();
    if(provUi.sort==='rating' && anyR) list.sort((a,b)=>(b.rating==null?-1:b.rating)-(a.rating==null?-1:a.rating));
    else if(anyD) list.sort((a,b)=>(a._d==null?Infinity:a._d)-(b._d==null?Infinity:b._d));   // featured is labelled, never boosted
    const ref = refPoint(o);
    const tools = all.length>1 && (all.length>8 || anyR) ? '<div class="pd-tools">'+
      (all.length>8 ? '<label class="visually-hidden" for="pdProvQ">Search providers</label><input type="search" id="pdProvQ" data-pd-q placeholder="Search providers" value="'+esc(provUi.q)+'" maxlength="60" autocomplete="off">' : '')+
      (anyR ? '<label class="visually-hidden" for="pdProvSort">Sort providers</label><select id="pdProvSort" data-pd-sort>'+
        (anyD ? '<option value="nearest"'+(provUi.sort!=='rating'?' selected':'')+'>Nearest</option>' : '<option value="nearest">Listed order</option>')+
        '<option value="rating"'+(provUi.sort==='rating'?' selected':'')+'>Highest rated</option></select>' : '')+
      '</div>' : '';
    const cards = list.map(p=>{
      const meta = [p.offer && p.offer!==p.name ? p.offer : '', ratingText(p), p._d!=null && ref ? fmtKm(p._d)+' '+ref.label : '', p.location].filter(Boolean);
      const cta = [];
      cta.push('<button type="button" class="modal-act primary" data-pd="prov" data-key="'+esc(p.key)+'" aria-label="View details for '+esc(p.name)+'">View details</button>');
      const n = [p.phone, p.whatsapp, p.website].filter(Boolean).length;
      if(n>1) cta.push('<button type="button" class="modal-act" data-pd="contact" data-key="'+esc(p.key)+'" aria-label="Contact '+esc(p.name)+'">Contact</button>');
      else if(p.phone) cta.push('<a class="modal-act" data-pd="call" data-key="'+esc(p.key)+'" href="tel:'+esc(p.phone)+'" aria-label="Call '+esc(p.name)+'">Call</a>');
      else if(p.whatsapp) cta.push('<a class="modal-act" data-pd="wa" data-key="'+esc(p.key)+'" href="'+esc(p.waUrl)+'" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp '+esc(p.name)+'">WhatsApp</a>');
      if(p.mapSlug) cta.push('<button type="button" class="ax-link" data-pd="mapslug" data-slug="'+esc(p.mapSlug)+'" aria-label="Show '+esc(p.name)+' on the map"><span aria-hidden="true">📍</span> Map</button>');
      return '<li class="ax-exp"><h6 class="ax-exp-title">'+esc(p.name)+
          (p.verified ? '<span class="pd-badge is-verified">✓ Verified</span>' : '')+(p.featured ? '<span class="pd-badge is-featured">Featured</span>' : '')+'</h6>'+
        (meta.length ? '<p class="ax-exp-meta">'+meta.map(m=>'<span>'+esc(m)+'</span>').join('')+'</p>' : '')+
        (p.description ? '<p class="ax-exp-desc">'+esc(p.description)+'</p>' : '')+
        (p.priceText ? '<p class="ax-exp-price">'+esc(p.priceText)+'</p>' : '')+
        '<div class="ax-actions">'+cta.join('')+'</div></li>';
    }).join('');
    return tools+'<p class="pd-count" role="status">'+list.length+' '+(list.length===1?'provider':'providers')+(q ? ' matching “'+esc(provUi.q)+'”' : '')+
      (all.some(p=>p.featured) ? ' · Featured listings are marked and don\'t change the order' : '')+'</p>'+
      (list.length ? '<ul class="ax-list">'+cards+'</ul>' : '<div class="ax-empty"><p>No providers match that search.</p></div>');
  }
  function showService(svcId, ctx, opts){
    opts = opts || {};
    const svc = SVC[svcId], o = originOf(ctx); if(!svc || !o) return false;
    cur = {kind:'service', svcId:svc.id, origin:o, placeId:o.kind==='place' ? o.id : null};
    swap(serviceHtml(svc, o), 'pd-view');
    if(opts.route!==false) setRoute(o.kind==='place' ? '#place/'+o.id+'/'+svc.id : '#tourist/'+o.id+'/'+svc.id);
    track('service_open', {serviceId:svc.id, placeId:o.kind==='place' ? o.id : null, areaId:o.areaId, type:svc.type, providers:svc.type==='provider' ? provCache.length : null});
    return true;
  }
  function redrawProviders(focusSel){
    const box = sheet.querySelector('[data-pd-provlist]'); if(!box || !cur || cur.kind!=='service') return;
    const pos = focusSel ? (sheet.querySelector(focusSel)||{}).selectionStart : null;
    box.innerHTML = provListHtml(SVC[cur.svcId], cur.origin);
    if(focusSel){ const f = sheet.querySelector(focusSel); if(f){ f.focus(); if(pos!=null && f.setSelectionRange) try{ f.setSelectionRange(pos,pos); }catch(e){} } }
  }

  /* ================= VIEW 3 — PROVIDER DETAIL ================= */
  function providerHtml(p, svc, o){
    const ref = refPoint(o), rows = [];
    if(p.offer && p.offer!==p.name) rows.push(['Offer', p.offer]);
    if(p.location) rows.push(['Location', p.location]);
    if(p._d!=null && ref) rows.push(['Distance', fmtKm(p._d)+' '+ref.label]);
    if(p.priceText) rows.push(['Price', p.priceText]);                 // shown only when the operator listed one
    if(p.duration) rows.push(['Duration', p.duration]);
    if(p.days) rows.push(['Days', p.days]);
    if(p.times) rows.push(['Times', p.times]);
    const nav = hasLL(p) && mapApi() && mapApi().navigationUrlFor ? mapApi().navigationUrlFor(p.lat, p.lng) : null;
    const acts = [];
    if(p.phone) acts.push('<a class="modal-act primary" data-pd="call" data-key="'+esc(p.key)+'" href="tel:'+esc(p.phone)+'"><span aria-hidden="true">📞</span> Call</a>');
    if(p.whatsapp) acts.push('<a class="modal-act'+(p.phone?'':' primary')+'" data-pd="wa" data-key="'+esc(p.key)+'" href="'+esc(p.waUrl)+'" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">💬</span> WhatsApp</a>');
    if(p.website) acts.push('<a class="modal-act" data-pd="web" data-key="'+esc(p.key)+'" href="'+esc(p.website)+'" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">🌐</span> Website</a>');
    if(p.mapSlug) acts.push('<button type="button" class="modal-act" data-pd="mapslug" data-slug="'+esc(p.mapSlug)+'"><span aria-hidden="true">🗺</span> View on Map</button>');
    if(p.mapSlug && mapApi() && mapApi().directions) acts.push('<button type="button" class="modal-act" data-pd="route" data-slug="'+esc(p.mapSlug)+'"><span aria-hidden="true">🧭</span> Directions</button>');
    else if(nav) acts.push('<a class="modal-act" data-pd="dir" href="'+esc(nav)+'" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">🧭</span> Directions</a>');
    return closeBtn('Close '+p.name)+
      '<span class="pd-grip" aria-hidden="true"></span>'+
      '<div class="modal-content">'+
        '<button type="button" class="pd-back" data-pd="back" aria-label="Back to '+esc(svc.label)+'"><span aria-hidden="true">‹</span> '+esc(svc.label)+'</button>'+
        '<div class="card-tag">'+esc(svc.label+' · '+(o.kind==='place' ? 'near ' : '')+o.name)+'</div>'+
        '<h2 id="modalTitle" tabindex="-1">'+esc(p.name)+'</h2>'+
        ((p.verified || p.featured) ? '<p style="margin-top:8px">'+(p.verified ? '<span class="pd-badge is-verified" style="margin-left:0">✓ Verified</span>' : '')+(p.featured ? '<span class="pd-badge is-featured"'+(p.verified?'':' style="margin-left:0"')+'>Featured</span>' : '')+'</p>' : '')+
        (ratingText(p) ? '<p class="modal-lede">'+esc(ratingText(p))+'</p>' : '')+
        (p.description ? '<p class="modal-lede">'+esc(p.description)+'</p>' : '')+
        (rows.length ? '<div class="modal-section pd-sec"><dl class="pd-info">'+rows.map(r=>'<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>').join('')+'</dl></div>' : '')+
        (acts.length ? '<div class="pd-acts">'+acts.join('')+'</div>' : '<p class="pd-fine">Contact details aren\'t listed for this provider yet.</p>')+
        (p.reviewType && window.JMReviews ? JMReviews.block(p.reviewType, p.reviewId, p.name) : '')+
        '<p class="pd-fine">Details are provided by the business. Confirm price, timings and availability directly before you go.</p>'+
      '</div>';
  }
  function showProvider(key){
    if(!cur || cur.kind!=='service') return;
    const p = provCache.find(x=>x.key===key), svc = SVC[cur.svcId]; if(!p) return;
    cur = {kind:'provider', svcId:svc.id, origin:cur.origin, placeId:cur.placeId, key:key};
    swap(providerHtml(p, svc, cur.origin), 'pd-view');
    track('provider_open', {serviceId:svc.id, providerKey:key, source:p.source});
  }

  /* ---------------- navigation inside the one sheet ---------------- */
  function goBack(){
    if(!cur) return;
    if(cur.kind==='provider' || cur.kind==='activity'){
      const svcId = cur.svcId, o = cur.origin, key = cur.key;
      showService(svcId, o.kind==='place' ? {placeId:o.id} : {areaId:o.id}, {route:false});
      if(key){ const k = (window.CSS && CSS.escape) ? CSS.escape(key) : key; const b = sheet.querySelector('[data-pd="prov"][data-key="'+k+'"]'); if(b) b.focus(); }
      return;
    }
    if(cur.kind==='service' && cur.origin.kind==='place'){
      const svcId = cur.svcId;
      showPlace(place(cur.origin.id), {keepTrail:true});
      const b = sheet.querySelector('[data-pd="svc"][data-svc="'+svcId+'"]'); if(b) b.focus();
      return;
    }
    closeModal();
  }
  function openOnMap(fn){                             // keep the #place entry so Back from the map reopens this sheet
    closeModal({silent:true});
    const m = mapApi(); if(m) fn(m);
  }

  /* ---------------- events: attached once, delegated ---------------- */
  sheet.addEventListener('click', e=>{
    const t = e.target.closest('[data-pd]'); if(!t || !sheet.contains(t)) return;
    const act = t.getAttribute('data-pd'), svc = cur && cur.svcId ? SVC[cur.svcId] : null;
    const prov = t.hasAttribute('data-key') ? provCache.find(x=>x.key===t.getAttribute('data-key')) : null;
    switch(act){
      case 'close': closeModal(); break;
      case 'map': {
        const id = cur && cur.placeId; if(!id) break;
        track('place_map_click', {placeId:id});
        openOnMap(m=>m.show(id));
        break;
      }
      case 'dir': track('directions_click', {placeId:cur && cur.placeId, serviceId:cur && cur.svcId}); break;
      case 'save': {
        const id = cur && cur.placeId; if(!id) break;
        const on = Saved.toggle(id);
        if(on===null){ t.textContent = 'Can\'t save on this device'; break; }
        sheet.querySelectorAll('[data-pd="save"]').forEach(b=>{ b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '♥ Saved' : '♡ Save';
          b.setAttribute('aria-label', (on?'Saved: ':'Save ')+(place(id)||{}).name); });
        track(on ? 'place_saved' : 'place_unsaved', {placeId:id});
        if(typeof renderTmPlaces==='function' && typeof currentArea!=='undefined') renderTmPlaces(currentArea);
        break;
      }
      case 'locate': locate(t); break;
      case 'svc': {
        if(!cur || !cur.placeId) break;
        const id = t.getAttribute('data-svc');
        if(SVC[id] && SVC[id].direct && openParking(originOf({placeId:cur.placeId}))) break;   // no mapped parking → the usual list
        showService(id, {placeId:cur.placeId});
        break;
      }
      case 'place': {
        const a = place(t.getAttribute('data-id')); if(!a) break;
        if(cur && cur.placeId){ trail.push(cur.placeId); if(trail.length>6) trail.shift(); }
        showPlace(a, {keepTrail:true});
        break;
      }
      case 'trail': { const prev = place(trail.pop()); if(prev) showPlace(prev, {keepTrail:true}); break; }
      case 'placeroute': {
        const o = cur && cur.origin; if(!o || !o.slug) break;
        track('parking_fallback_directions', {placeId:o.id});
        openOnMap(m=>m.directions(o.slug, {from:'me', locate:true}));
        break;
      }
      case 'route': {
        const slug = t.getAttribute('data-slug'); if(!slug) break;
        track('directions_click', {placeId:cur && cur.placeId, serviceId:cur && cur.svcId, slug:slug, target:'smart_map'});
        openOnMap(m=>m.directions(slug, {from:'me', locate:true}));
        break;
      }
      case 'mapslug': { const slug = t.getAttribute('data-slug'); track('map_click', {slug:slug}); openOnMap(m=>m.show(slug)); break; }
      case 'mapcat': {
        const o = originOf({placeId:cur && cur.placeId}); if(!o) break;
        const cat = t.getAttribute('data-cat'); track('nearby_category_map', {placeId:o.id, category:cat});
        openOnMap(m=>m.open(Object.assign({cat:cat}, mapCtx(o))));
        break;
      }
      case 'svcmap': {
        if(!svc || !cur.origin) break;
        const o = cur.origin; track('service_map_click', {serviceId:svc.id, placeId:o.kind==='place'?o.id:null});
        openOnMap(m=>m.open(Object.assign(svc.query ? {q:svc.query} : {cat:svc.map.cat, sub:svc.map.sub}, mapCtx(o))));
        break;
      }
      case 'back': goBack(); break;
      case 'prov': showProvider(t.getAttribute('data-key')); break;
      case 'contact': {
        if(!prov) break;
        track('provider_contact_open', {serviceId:svc && svc.id, providerKey:prov.key});
        if(window.JMTransport && JMTransport.contact) JMTransport.contact({id:prov.key, name:prov.name, phone:prov.phone, whatsapp:prov.whatsapp, waUrl:prov.waUrl, website:prov.website, source:'tourist_companion'}, t);
        break;
      }
      case 'contact-place': {
        const a = cur && place(cur.placeId), c = a ? contactOf(a.contact) : null; if(!c) break;
        if(window.JMTransport && JMTransport.contact) JMTransport.contact({id:a.id, name:a.name, phone:c.phone, whatsapp:c.whatsapp, source:'place'}, t);
        break;
      }
      case 'youtube':
        track('place_video_open', {placeId:cur && cur.placeId});
        break;
      case 'call': case 'wa': case 'web': case 'mail': case 'call112':
        track({call:'call_click', wa:'whatsapp_click', web:'website_click', mail:'email_click', call112:'emergency_call_click'}[act],
          {serviceId:svc && svc.id, providerKey:prov ? prov.key : (cur && cur.key) || null, placeId:cur && cur.placeId});
        break;
      case 'activity': {
        if(!svc || !svc.activityId || typeof JMActivities==='undefined') break;
        const back = cur;
        sheet.classList.remove('is-place', 'pd-view');
        JMActivities.open(svc.activityId);                    // the existing Things to do sheet (enquiry form, experiences)
        cur = {kind:'activity', svcId:back.svcId, origin:back.origin, placeId:back.placeId};
        const box = sheet.querySelector('.modal-content');
        if(box) box.insertAdjacentHTML('afterbegin', '<button type="button" class="pd-back" data-pd="back" aria-label="Back to '+esc(svc.label)+' '+(back.origin.kind==='place'?'near ':'in ')+esc(back.origin.name)+'"><span aria-hidden="true">‹</span> '+esc(svc.label)+' '+(back.origin.kind==='place'?'near ':'in ')+esc(back.origin.name)+'</button>');
        break;
      }
      case 'transport': {
        const mode = svc && svc.transport; track('transport_directory_click', {serviceId:svc && svc.id});
        leaveTo(()=>{ if(window.JMTransport) JMTransport.open({category:mode}); });
        break;
      }
      case 'add': { track('add_service_click', {serviceId:svc && svc.id}); leaveTo(()=>{ const f = document.getElementById('footerAddServiceBtn'); if(f) f.click(); }); break; }
    }
  });
  sheet.addEventListener('input', e=>{
    if(!e.target.hasAttribute('data-pd-q')) return;
    provUi.q = e.target.value.slice(0,60); redrawProviders('[data-pd-q]');
  });
  sheet.addEventListener('change', e=>{
    if(!e.target.hasAttribute('data-pd-sort')) return;
    provUi.sort = e.target.value==='rating' ? 'rating' : 'nearest'; redrawProviders('[data-pd-sort]');
  });
  // Escape steps back one layer inside the sheet (provider → service → place); on the place itself it closes.
  overlay.addEventListener('keydown', e=>{
    if(e.key!=='Escape' || !owned || !cur || !isOpen()) return;
    if(cur.kind==='provider' || cur.kind==='activity' || (cur.kind==='service' && cur.origin.kind==='place')){ e.stopPropagation(); goBack(); }
  });

  /* ---------------- "Distance from me" — only on an explicit tap ---------------- */
  function locate(btn){
    const msg = sheet.querySelector('[data-pd-locmsg]'), a = cur && place(cur.placeId), g = a && geo(a.id);
    const say = s=>{ if(msg) msg.textContent = s; };
    if(!window.JMLocation || !a || !g){ say('Location access isn\'t available. You can still browse places manually.'); return; }
    btn.disabled = true; btn.textContent = 'Finding you…';
    JMLocation.request({timeoutMs:8000}).then(()=>{                                         // shared, memory-only position
      if(!cur || cur.placeId!==a.id) return;
      const box = sheet.querySelector('[data-pd-dist]');
      if(user()){ if(box) box.innerHTML = distHtml(a, g); track('distance_from_me', {placeId:a.id}); }
      else { btn.remove(); say('You don\'t seem to be near Jaisalmer right now, so the distance is from the city.'); }
      if(typeof renderTmPlaces==='function' && typeof currentArea!=='undefined') renderTmPlaces(currentArea);
    }, err=>{
      btn.disabled = false; btn.textContent = '📍 Distance from me';
      const c = err && err.code;
      say(c==='denied' ? 'Location access is blocked. Allow it in your browser settings, or keep browsing places manually.'
        : (c==='insecure' || c==='unsupported') ? err.message+' You can still browse places manually.'
        : 'Couldn\'t get your location. Try again in a moment.');
    });
  }

  /* ---------------- called by closeModal() ---------------- */
  function afterClose(silent){
    if(stickyObs){ stickyObs.disconnect(); stickyObs = null; }
    sheet.classList.remove('is-place', 'pd-view');
    if(!owned) return;
    owned = false; cur = null; trail = []; provCache = [];
    if(silent || !parse()) return;
    // Deferred one tick: a caller that closes and then navigates straight away (e.g. the activity sheet's
    // "View on map" sets #map/…) keeps our entry underneath, so Back from the map reopens this place.
    const h = location.hash;
    setTimeout(()=>{
      if(location.hash!==h || isOpen()) return;
      if(history.state && history.state.jmPlace){ try{ history.back(); }catch(e){} }         // our pushed entry → step back over it
      else { try{ history.replaceState(null, '', location.pathname + location.search); }catch(e){} }   // opened from a shared link
    }, 0);
  }
  function leaveTo(fn){                               // close and go elsewhere on the page without a Back-scroll jump
    closeModal({silent:true});
    if(parse()) try{ history.replaceState(null, '', location.pathname + location.search); }catch(e){}
    fn();
  }

  /* ---------------- boot: a shared/refreshed #place or #tourist link reopens its sheet ---------------- */
  const boot = parse();
  if(boot && !mapIsOpen()) applyRoute(boot);

  return {
    open:(idOrPlace, opts)=>{ const a = place(typeof idOrPlace==='string' ? idOrPlace : (idOrPlace && idOrPlace.id)); return a ? showPlace(a, opts) : false; },
    openService:(svcId, ctx)=>{ const s = SVC[svcId], o = originOf(ctx||{}); if(s && s.direct && o && openParking(o)) return true; return showService(svcId, ctx); },
    openProvider:showProvider,
    service:id=>(id && SVC[id]) ? Object.assign({}, SVC[id]) : null,
    serviceIdFor:label=>LABEL_TO_SVC[String(label||'').toLowerCase()] || null,
    isSaved:Saved.has, toggleSave:Saved.toggle, savedPlaces:Saved.list, setSavedAdapter:Saved.setAdapter,
    distanceLabel:id=>{ const u = user(), g = geo(id); return (u && g) ? fmtKm(km(u.lat, u.lng, g.lat, g.lng))+' from you' : null; },
    distanceKm:id=>{ const u = user(), g = geo(id); return (u && g) ? km(u.lat, u.lng, g.lat, g.lng) : null; },   // straight-line km, or null
    providers:(svcId, ctx)=>{ const s = SVC[svcId], o = originOf(ctx||{}); return (s && o) ? providersFor(s, o) : []; },
    _afterClose:afterClose
  };
})();
window.JMPlace = JMPlace;
