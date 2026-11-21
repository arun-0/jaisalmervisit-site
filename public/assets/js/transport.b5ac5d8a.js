(function(){
  'use strict';
  const root = document.getElementById('gaRoot');
  if(!root || typeof TRANSPORT_MODES==='undefined') return;

  /* ------------------------------------------------------------
     CONFIG
     ------------------------------------------------------------ */
  const CFG = {
    pageSize:5,               // rows per "page": a short top list, "Show more" for the rest (client, 28 Oct 2026)
    searchDebounceMs:180,
    ratingPriorReviews:20,    // "Recommended"/"Highest Rated" weigh a rating by review volume (see adjRating)
    fallbackMeanRating:4.0,   // prior mean used only until real ratings exist
    featuredPinned:false,     // future paid placement: when true, Featured listings are grouped first in
                              // "Recommended" — always labelled "Featured", never blended into the ranking
    farKm:100                 // beyond this the visitor is not in Jaisalmer; distances are still true, but we say so
  };
  const DESTS = [             // desert destinations — offered ONLY when real providers list them
    {id:'sam',    label:'Sam Dunes',    re:/\bsam\b/i},
    {id:'khuri',  label:'Khuri',        re:/\bkhuri\b/i},
    {id:'camps',  label:'Desert Camps', re:/desert camps?|\bcamps?\b/i},
    {id:'safari', label:'Safari Areas', re:/safari/i}
  ];
  const DESERT_RE = /desert|dune|\bsam\b|khuri|safari|\bcamps?\b/i;

  /* ------------------------------------------------------------
     SMALL HELPERS
     ------------------------------------------------------------ */
  const $ = id=>document.getElementById(id);
  const el = {quick:$('gaQuickRow'), search:$('gaSearch'), clear:$('gaClear'), sortWrap:$('gaSortWrap'), sort:$('gaSort'), chips:$('gaChips'),
    sub:$('gaSubRow'), notice:$('gaNotice'), count:$('gaCount'), mapAll:$('gaMapAll'), sortHint:$('gaSortHint'), legend:$('gaLegend'),
    guide:$('gaGuide'), results:$('gaResults'),
    sheetOv:$('gaSheetOverlay'), sheet:$('gaSheet'), sheetTitle:$('gaSheetTitle'), sheetSub:$('gaSheetSub'), sheetActs:$('gaSheetActions'), sheetClose:$('gaSheetClose')};
  const MODE = {}; TRANSPORT_MODES.forEach(m=>{ MODE[m.id] = m; });
  const txt = v=>(v==null ? '' : String(v)).trim();
  const num = v=>{ if(typeof v==='string' && v.trim()!=='') v = Number(v); return (typeof v==='number' && isFinite(v)) ? v : null; };
  const esc = s=>String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const list = v=>(Array.isArray(v) ? v : (typeof v==='string' ? v.split(',') : [])).map(txt).filter(Boolean);
  const plural = (n,one,many)=>n===1 ? one : many;
  const mqMobile = window.matchMedia('(max-width:899px)');
  const isMobile = ()=>mqMobile.matches;
  function haversine(a,b,c,d){ const R=6371, r=x=>x*Math.PI/180, dl=r(c-a), dg=r(d-b), h=Math.sin(dl/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(dg/2)**2; return R*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h)); }
  function fmtKm(km){ return km<1 ? (Math.max(1,Math.round(km*100))*10)+' m' : km.toFixed(1)+' km'; }
  function safeUrl(u){ const s = txt(u); if(!s) return null; if(/^(\/(?!\/)|#)/.test(s)) return s; try{ const x = new URL(s); return x.protocol==='https:' ? x.href : null; }catch(e){ return null; } }
  function safePhone(p){ const s = txt(p).replace(/[^\d+]/g,''); return /^\+?\d{7,15}$/.test(s) ? s : null; }
  // wa.me needs the country code. A bare 10-digit Indian mobile is completed with 91; anything else must already be international.
  function safeWhatsapp(v){ let d = txt(v).replace(/\D/g,''); if(d.length===10) d = '91'+d; return /^\d{11,15}$/.test(d) ? d : null; }
  const linkAttrs = u=>/^https?:/i.test(u) ? ' target="_blank" rel="noopener noreferrer"' : '';
  function track(name, detail){          // analytics-ready, privacy-light: an event name + ids only; no personal data
    const d = Object.assign({event:name}, detail||{});
    try{ document.dispatchEvent(new CustomEvent('jm:analytics', {detail:d})); if(Array.isArray(window.dataLayer)) window.dataLayer.push(d); }catch(e){}
  }

  /* ------------------------------------------------------------
     DATA — normalise + validate. Nothing is defaulted, guessed or invented.
     ------------------------------------------------------------ */
  const CAT_ALIAS = {};
  TRANSPORT_MODES.forEach(m=>{ [m.id, m.label, m.short].concat(m.aliases||[]).forEach(a=>{ CAT_ALIAS[norm(a)] = m.id; }); });
  const ID_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,80}$/;
  let providers = [], byId = {}, meanRating = CFG.fallbackMeanRating, pushedToMap = {};

  function normalize(raw){
    if(!raw || typeof raw!=='object') return null;
    const id = txt(raw.id!=null ? raw.id : raw.providerId);
    const name = txt(raw.businessName || raw.name);
    if(!ID_RE.test(id) || !name) return null;
    const sub = txt(raw.subcategory);
    // Only transport categories belong here. Guides, photographers and safari operators stay on the Smart Map (Local Services).
    const cat = CAT_ALIAS[norm(raw.category)] || CAT_ALIAS[norm(raw.serviceCategory)] || CAT_ALIAS[norm(sub)];
    if(!cat) return null;
    if(raw.active===false) return null;
    let lat = num(raw.latitude!=null ? raw.latitude : raw.lat), lng = num(raw.longitude!=null ? raw.longitude : raw.lng);
    if(lat==null || lng==null || lat<-90 || lat>90 || lng<-180 || lng>180){ lat = null; lng = null; }
    const rating = num(raw.rating), rc = num(raw.reviewCount);
    let created = raw.createdAt; created = typeof created==='number' ? created : Date.parse(created); if(!isFinite(created)) created = null;
    const p = {
      id:id, businessName:name, category:cat, subcategory:sub || null,
      description:txt(raw.description), shortDescription:txt(raw.shortDescription),
      latitude:lat, longitude:lng, serviceAreas:list(raw.serviceAreas), serviceTags:list(raw.serviceTags),
      rating:(rating!=null && rating>=0 && rating<=5) ? rating : null,
      reviewCount:(rc!=null && rc>=0) ? Math.floor(rc) : null,
      verified:raw.verified===true, featured:raw.featured===true,
      phone:safePhone(raw.phone), whatsapp:safeWhatsapp(raw.whatsapp),
      profileUrl:safeUrl(raw.profileUrl), navigationUrl:safeUrl(raw.navigationUrl),
      image:safeUrl(raw.image), logo:safeUrl(raw.logo),
      active:true, createdAt:created, order:num(raw.order)
    };
    // structured fields only — never names/descriptions — decide which destinations a provider serves
    const dtext = p.serviceAreas.concat(p.serviceTags, [p.subcategory||'']).join(' | ');
    p._dest = DESTS.filter(d=>d.re.test(dtext)).map(d=>d.id);
    if(DESERT_RE.test(dtext)) p._desert = true;
    p._w = indexProvider(p);
    return p;
  }

  /* ------------------------------------------------------------
     SEARCH — local, weighted, prefix + synonym aware, every word must match
     ------------------------------------------------------------ */
  const STOP = new Set(['near','in','at','the','a','an','around','nearby','me','to','for','of','and','from']);
  const SYN = {cab:['taxi'], rickshaw:['auto'], tuktuk:['auto'], scooter:['scooty'], motorbike:['bike'], motorcycle:['bike'],
    train:['railway'], flight:['airport'], pickup:['transfer'], drop:['transfer'], dunes:['dune']};
  const W = {name:10, cat:6, tag:6, area:5, desc:2};
  const stem = w=>(w.length>3 && w.slice(-1)==='s' && w.slice(-2,-1)!=='s') ? w.slice(0,-1) : w;
  const wordsOf = s=>norm(s).split(/[^a-z0-9]+/).filter(Boolean).map(stem);
  function indexProvider(p){
    const m = new Map(), m0 = MODE[p.category];
    const put = (t,w)=>wordsOf(t).forEach(x=>{ if((m.get(x)||0)<w) m.set(x,w); });
    put(p.businessName,W.name);
    put([m0.label,m0.short].concat(m0.synonyms||[]).join(' '),W.cat);
    put([p.subcategory||''].concat(p.serviceTags).join(' '),W.tag);
    put(p.serviceAreas.join(' '),W.area);
    put(p.shortDescription+' '+p.description,W.desc);
    if(p._desert) put('desert',W.tag);
    return m;
  }
  function queryPlan(q){
    const toks = norm(q).split(/[^a-z0-9]+/).filter(t=>t && !STOP.has(t)).map(stem);
    return toks.length ? toks.map(t=>[t].concat(SYN[t]||[])) : null;
  }
  function scoreWords(wmap, plan){          // 0 = no match; every query word must match somewhere
    let total = 0;
    for(let i=0;i<plan.length;i++){
      let best = 0;
      wmap.forEach((weight,w)=>{ for(let j=0;j<plan[i].length;j++){ if(w.indexOf(plan[i][j])===0){ const s = weight + (w===plan[i][0] ? 2 : 0); if(s>best) best = s; break; } } });
      if(!best) return 0;
      total += best;
    }
    return total;
  }

  /* ------------------------------------------------------------
     STATE — the single source of truth; every control derives from it
     ------------------------------------------------------------ */
  const state = {searchQuery:'', category:'all', serviceType:null, destination:null, sortBy:'recommended', userLocation:null, selectedProvider:null};
  let status = 'ready', shown = CFG.pageSize, results = [], loadSeq = 0, locDenied = false, searchTimer = null, sheetReturn = null, lastSort = 'recommended';

  /* ------------------------------------------------------------
     FILTER + SORT
     ------------------------------------------------------------ */
  function destMatches(p, d){ return d==='desert' ? !!p._desert : p._dest.indexOf(d)>=0; }
  function adjRating(p){                     // rating weighed by review volume: 5.0 from 3 reviews ≠ 4.9 from hundreds
    if(p.rating==null) return null;
    const n = p.reviewCount || 0, m = CFG.ratingPriorReviews;
    return (n/(n+m))*p.rating + (m/(n+m))*meanRating;
  }
  const cmpNum = (a,b,dir)=>{ if(a==null && b==null) return 0; if(a==null) return 1; if(b==null) return -1; return dir==='asc' ? a-b : b-a; };
  const byName = (a,b)=>a.businessName.localeCompare(b.businessName);
  const SORTERS = {
    // Recommended — transparent: verified first, then review-weighted rating, then review count, then curated `order`, then A–Z.
    // Never influenced by payment. (Featured only groups first if CFG.featuredPinned is switched on, and is always labelled.)
    recommended:(a,b)=>(CFG.featuredPinned ? (b.featured-a.featured) : 0) || (b.verified-a.verified) || cmpNum(adjRating(a),adjRating(b)) || cmpNum(a.reviewCount,b.reviewCount) || cmpNum(a.order,b.order,'asc') || byName(a,b),
    rated:(a,b)=>cmpNum(adjRating(a),adjRating(b)) || cmpNum(a.reviewCount,b.reviewCount) || byName(a,b),
    reviewed:(a,b)=>cmpNum(a.reviewCount,b.reviewCount) || cmpNum(adjRating(a),adjRating(b)) || byName(a,b),
    nearest:(a,b)=>cmpNum(a._d,b._d,'asc') || byName(a,b),
    recent:(a,b)=>cmpNum(a.createdAt,b.createdAt) || byName(a,b)
  };
  function compute(filter){
    filter = filter || state;
    const plan = queryPlan(filter.searchQuery);
    let out = providers.filter(p=>
      (filter.category==='all' || p.category===filter.category) &&
      (!filter.serviceType || p.subcategory===filter.serviceType) &&
      (!filter.destination || destMatches(p, filter.destination)));
    out.forEach(p=>{ p._s = 0; p._d = null; });
    if(plan) out = out.filter(p=>{ p._s = scoreWords(p._w, plan); return p._s>0; });
    if(state.userLocation) out.forEach(p=>{ if(p.latitude!=null) p._d = haversine(state.userLocation.lat, state.userLocation.lng, p.latitude, p.longitude); });
    const cmp = SORTERS[state.sortBy] || SORTERS.recommended;
    // a typed search ranks by relevance first when the sort is "Recommended"
    return out.slice().sort((a,b)=>(plan && state.sortBy==='recommended' && a._s!==b._s) ? b._s-a._s : cmp(a,b));
  }
  function activeFilters(){ return state.category!=='all' || !!state.serviceType || !!state.destination || !!state.searchQuery; }

  /* ------------------------------------------------------------
     MAP BRIDGE — the map derives its markers from these same records (ids: "prov-<id>")
     ------------------------------------------------------------ */
  const mapApi = ()=>window.JMMap || null;
  function toMapRecord(p){
    return {providerId:p.id, businessName:p.businessName, serviceCategory:MODE[p.category].mapSub, subcategory:p.subcategory,
      latitude:p.latitude, longitude:p.longitude, phone:p.phone, whatsapp:p.whatsapp, description:p.description, shortDescription:p.shortDescription,
      verified:p.verified, featured:p.featured, rating:p.rating, reviewCount:p.reviewCount, serviceAreas:p.serviceAreas, serviceTags:p.serviceTags,
      profileUrl:p.profileUrl, navigationUrl:p.navigationUrl, image:p.image, active:true};
  }
  function pushToMap(fresh){
    const api = mapApi(); if(!api || !api.addLocations) return;
    const batch = fresh.filter(p=>p.latitude!=null && !pushedToMap[p.id]).map(p=>{ pushedToMap[p.id] = 1; return toMapRecord(p); });
    if(batch.length) api.addLocations(batch, {providers:true});
  }
  const onMap = p=>{ const api = mapApi(); return !!(api && api.hasLocation && api.hasLocation('prov-'+p.id)); };

  /* ------------------------------------------------------------
     INGEST (sync inline list, or async feed)
     ------------------------------------------------------------ */
  function ingest(rawList){
    const fresh = [];
    (Array.isArray(rawList) ? rawList : []).forEach(raw=>{
      let p = null; try{ p = normalize(raw); }catch(e){}
      if(!p || byId[p.id]) return;
      byId[p.id] = p; providers.push(p); fresh.push(p);
    });
    const rated = providers.filter(p=>p.rating!=null);
    meanRating = rated.length ? rated.reduce((s,p)=>s+p.rating,0)/rated.length : CFG.fallbackMeanRating;
    pushToMap(fresh);
    injectJsonLd();
    return fresh.length;
  }
  function injectJsonLd(){                 // crawlable structured data from the same records — real fields only
    try{
      const items = providers.slice(0,100).map((p,i)=>{
        const it = {'@type':'LocalBusiness', name:p.businessName, areaServed:p.serviceAreas.length ? p.serviceAreas : 'Jaisalmer'};
        if(p.shortDescription || p.description) it.description = p.shortDescription || p.description;
        if(p.phone) it.telephone = p.phone;
        if(p.profileUrl) it.url = new URL(p.profileUrl, location.href).href;
        if(p.latitude!=null) it.geo = {'@type':'GeoCoordinates', latitude:p.latitude, longitude:p.longitude};
        return {'@type':'ListItem', position:i+1, item:it};
      });
      let s = document.getElementById('jm-ld-transport');
      if(!items.length){ if(s) s.remove(); return; }
      if(!s){ s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'jm-ld-transport'; document.head.appendChild(s); }
      s.textContent = JSON.stringify({'@context':'https://schema.org','@type':'ItemList', name:'Getting around Jaisalmer — local transport', itemListElement:items}).replace(/</g,'\\u003c');
    }catch(e){}
  }
  function load(){
    if(!TRANSPORT_FEED.url || typeof fetch!=='function'){ status = 'ready'; ingest(TRANSPORT_PROVIDERS); renderAll(); return; }
    const seq = ++loadSeq; status = 'loading'; renderAll();
    fetch(TRANSPORT_FEED.url, {credentials:'omit', headers:{'Accept':'application/json'}})
      .then(r=>{ if(!r.ok) throw new Error('http'); return r.json(); })
      .then(j=>{ if(seq!==loadSeq) return; ingest(TRANSPORT_PROVIDERS); ingest(j && j.providers); status = 'ready'; renderAll(); })
      .catch(()=>{ if(seq!==loadSeq) return; status = 'error'; renderAll(); });
  }

  /* ------------------------------------------------------------
     RENDER — controls (built once per data change, then only synced)
     ------------------------------------------------------------ */
  const hasData = ()=>providers.length>0;
  const ALWAYS_SHOWN = ['guide','auto'];   // client (29 Oct 2026): Hire a Guide and Take an Auto stay, even before a provider joins
  const emptyMode = ()=>!state.searchQuery && !state.destination && !state.serviceType && !!MODE[state.category] && !providers.some(p=>p.category===state.category);
  function visibleModes(){                 // no empty categories once real data exists; the full guide set while the directory is still opening up
    if(!hasData()) return TRANSPORT_MODES;
    return TRANSPORT_MODES.filter(m=>m.id===state.category || ALWAYS_SHOWN.indexOf(m.id)>=0 || providers.some(p=>p.category===m.id));
  }
  function desertVisible(){ return !hasData() || state.destination || providers.some(p=>p._desert); }
  function buildControls(){
    const modes = visibleModes();
    const quickIds = ['taxi','auto','bike','scooty','car','guide'];
    let q = modes.filter(m=>quickIds.indexOf(m.id)>=0).map(m=>
      '<button type="button" class="ga-quick-btn" data-quick="'+m.id+'" aria-pressed="false"><span class="ga-emoji" aria-hidden="true">'+m.emoji+'</span><span>'+esc(m.quick)+'</span></button>').join('');
    el.quick.innerHTML = q;
    el.chips.innerHTML = [{id:'all', short:'All'}].concat(modes).map(m=>
      '<button type="button" class="ga-chip" data-cat="'+m.id+'" aria-pressed="false">'+esc(m.short)+'</button>').join('');
    buildSort();
  }
  function buildSort(){
    const opts = [['recommended','Recommended']];
    if(providers.some(p=>p.rating!=null)) opts.push(['rated','Highest Rated']);
    if(providers.some(p=>p.reviewCount)) opts.push(['reviewed','Most Reviewed']);
    if(providers.some(p=>p.latitude!=null)) opts.push(['nearest','Nearest']);
    if(providers.some(p=>p.createdAt!=null)) opts.push(['recent','Recently Added']);
    if(!opts.some(o=>o[0]===state.sortBy)) state.sortBy = 'recommended';
    el.sort.innerHTML = opts.map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join('');
    el.sort.value = state.sortBy;
    el.sortWrap.hidden = !(providers.length>1 && opts.length>1);
  }
  function syncControls(){
    el.quick.querySelectorAll('[data-quick]').forEach(b=>{
      const k = b.dataset.quick, on = k==='desert' ? !!state.destination : state.category===k;
      b.setAttribute('aria-pressed', String(on));
    });
    el.chips.querySelectorAll('[data-cat]').forEach(b=>{
      const on = b.dataset.cat===state.category; b.setAttribute('aria-pressed', String(on));
      if(on && el.chips.scrollWidth>el.chips.clientWidth){ const bb = b.getBoundingClientRect(), cc = el.chips.getBoundingClientRect(); if(bb.left<cc.left || bb.right>cc.right) el.chips.scrollLeft += (bb.left+bb.width/2)-(cc.left+cc.width/2); }
    });
    el.sort.value = state.sortBy;
    if(el.search.value!==state.searchQuery && document.activeElement!==el.search) el.search.value = state.searchQuery;
    el.clear.hidden = !el.search.value;
  }
  function withFocus(fn){                  // re-render without dropping keyboard focus
    const a = document.activeElement, k = a && root.contains(a) ? a.getAttribute('data-k') : null;
    fn();
    if(k){ const n = root.querySelector('[data-k="'+k+'"]'); if(n) n.focus({preventScroll:true}); }
  }
  function renderSub(){
    let html = '';
    const types = state.category!=='all' ? Array.from(new Set(providers.filter(p=>p.category===state.category && p.subcategory).map(p=>p.subcategory))).sort() : [];
    if(types.length>=2){
      html += '<div role="group" aria-label="Service type"><div class="ga-subchips">'+
        ['All types'].concat(types).map((t,i)=>{ const v = i ? t : '', on = (state.serviceType||'')===v;
          return '<button type="button" class="ga-subchip" data-k="type-'+i+'" data-type="'+esc(v)+'" aria-pressed="'+on+'">'+esc(t)+'</button>'; }).join('')+'</div></div>';
    }
    if(state.destination){
      const present = DESTS.filter(d=>providers.some(p=>p._dest.indexOf(d.id)>=0));
      if(present.length){
        html += '<div role="group" aria-labelledby="gaDestLabel"><p class="ga-sublabel" id="gaDestLabel">Going to the desert?</p><div class="ga-subchips">'+
          present.map(d=>'<button type="button" class="ga-subchip" data-k="dest-'+d.id+'" data-dest="'+d.id+'" aria-pressed="'+(state.destination===d.id)+'">'+esc(d.label)+'</button>').join('')+'</div></div>';
      }
    }
    el.sub.innerHTML = html;
  }

  /* ------------------------------------------------------------
     RENDER — status, guide, cards, empty/loading/error states
     ------------------------------------------------------------ */
  function countText(n){
    if(status==='loading') return 'Loading services…';
    if(status==='error') return '';
    if(!hasData() || emptyMode()) return 'No providers listed yet';
    if(!n) return 'No matching services found';
    const m = MODE[state.category];
    let t = state.category==='all' ? n+' '+plural(n,'service','services')+' available' : n+' '+plural(n, m.one, m.many);
    if(state.serviceType) t += ' · '+state.serviceType;
    if(state.destination){ const d = DESTS.filter(x=>x.id===state.destination)[0]; t += ' · '+(d ? d.label : 'Desert'); }
    if(state.searchQuery) t += ' for “'+state.searchQuery+'”';
    return t;
  }
  function renderStatus(){
    el.count.textContent = countText(results.length);
    const api = mapApi(), m = MODE[state.category];
    let mapCount = 0;
    if(api && api.places){
      const opts = {category:m && m.mapCat ? m.mapCat : 'transport'}; if(m) opts.subcategories = [m.mapSub];
      mapCount = api.places(opts).length;
    }
    el.mapAll.hidden = !mapCount || status!=='ready';
    const sortHints = {recommended:'Recommended: verified providers first, then rating weighted by number of reviews.', rated:'Ratings are weighted by review count, so a few reviews don’t outrank hundreds.',
      reviewed:'', nearest:'Nearest: distance from your location to each provider.', recent:''};
    const hint = providers.length>1 ? (sortHints[state.sortBy]||'') : '';
    el.sortHint.textContent = hint; el.sortHint.hidden = !hint;
    el.legend.hidden = !results.some(p=>p.featured);
  }
  function renderGuide(){
    const m = MODE[state.category];
    if(!m){ el.guide.hidden = true; el.guide.innerHTML = ''; return; }
    el.guide.hidden = false;
    el.guide.innerHTML = '<strong>'+esc(m.label)+'</strong><span class="ga-guide-area">'+esc(m.area)+'</span><br>'+esc(m.note);
  }
  function ratingHtml(p){
    if(p.rating==null) return '<p class="ga-rating is-none">Not rated yet</p>';
    const cnt = p.reviewCount ? ' · '+p.reviewCount.toLocaleString('en-IN')+' '+plural(p.reviewCount,'review','reviews') : '';
    const label = 'Rated '+p.rating.toFixed(1)+' out of 5'+(p.reviewCount ? ' from '+p.reviewCount+' '+plural(p.reviewCount,'review','reviews') : '');
    return '<p class="ga-rating"><span class="visually-hidden">'+esc(label)+'</span><span aria-hidden="true"><span class="ga-star">★</span> <strong>'+p.rating.toFixed(1)+'</strong>'+esc(cnt)+'</span></p>';
  }
  function waUrl(p){ return 'https://wa.me/'+p.whatsapp+'?text='+encodeURIComponent('Hi, I found your '+MODE[p.category].label+' service on Jaisalmer Visit.'); }
  function actionsHtml(p, mobile){
    const id = esc(p.id), map = onMap(p), call = p.phone, wa = p.whatsapp;
    const A = {   // every button exists only when its data does
      map: map ? cls=>'<button type="button" class="ga-btn'+cls+'" data-act="map" data-id="'+id+'" data-k="map-'+id+'" aria-label="View '+esc(p.businessName)+' on map">View on Map</button>' : null,
      contact: (call && wa) ? cls=>'<button type="button" class="ga-btn'+cls+'" data-act="contact" data-id="'+id+'" data-k="contact-'+id+'" aria-haspopup="dialog" aria-label="Contact '+esc(p.businessName)+'">Contact</button>'
        : wa ? cls=>'<a class="ga-btn'+cls+'" data-act="whatsapp" data-id="'+id+'" href="'+esc(waUrl(p))+'" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp '+esc(p.businessName)+'">WhatsApp</a>'
        : call ? cls=>'<a class="ga-btn'+cls+'" data-act="call" data-id="'+id+'" href="tel:'+esc(call)+'" aria-label="Call '+esc(p.businessName)+'">Call</a>' : null
    };
    let btns, links = [];
    if(mobile){
      // Contact is the main intent on a phone: WhatsApp (when real) leads, then the map; a plain Call becomes a text link.
      if(wa){ btns = [cls=>'<a class="ga-btn'+cls+'" data-act="whatsapp" data-id="'+id+'" href="'+esc(waUrl(p))+'" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp '+esc(p.businessName)+'">WhatsApp</a>', A.map];
        if(call) links.push('<a class="ga-textlink" data-act="call" data-id="'+id+'" href="tel:'+esc(call)+'" aria-label="Call '+esc(p.businessName)+'">Call</a>'); }
      else btns = [A.contact, A.map];
    } else btns = [A.map, A.contact];
    btns = btns.filter(Boolean);
    if(p.profileUrl){
      const prof = cls=>'<a class="ga-'+(cls?'btn'+cls:'textlink')+'" data-act="profile" data-id="'+id+'" href="'+esc(p.profileUrl)+'"'+linkAttrs(p.profileUrl)+' aria-label="View profile of '+esc(p.businessName)+'">View Profile</a>';
      if(btns.length) links.push(prof('')); else btns.push(prof);
    }
    const row = btns.slice(0,2).map((b,i)=>b(i===0 ? ' primary' : '')).join('');
    const rate = window.JMReviews ? JMReviews.button('transport', p.id, p.businessName, 'ga-textlink ga-rate') : '';   // visitors rate the provider (moderated)
    if(!row && !links.length) return '<p class="ga-nocontact">Contact details not listed yet.</p>'+(rate ? '<div class="ga-actions-links">'+rate+'</div>' : '');
    if(rate) links.push(rate);
    return (row ? '<div class="ga-actions-row">'+row+'</div>' : '')+(links.length ? '<div class="ga-actions-links">'+links.join('')+'</div>' : '');
  }
  function articleHtml(p, mobile){
    const m = MODE[p.category], id = esc(p.id);
    const areas = p.serviceAreas.slice(0,3).join(' · ');
    let dist = ''; if(p._d!=null) dist = fmtKm(p._d)+' away';
    const area = [areas, dist].filter(Boolean).join(' · ');
    const tags = (p.serviceTags.length ? p.serviceTags : (p.subcategory ? [p.subcategory] : [])).slice(0,3);
    const badges = (p.featured ? '<span class="ga-badge featured">Featured</span>' : '')+(p.verified ? '<span class="ga-badge verified"><span aria-hidden="true">✓</span> Verified</span>' : '');
    const logo = p.logo || p.image;
    return '<article class="ga-card'+(state.selectedProvider===p.id?' is-selected':'')+'" data-id="'+id+'" tabindex="-1"'+(state.selectedProvider===p.id?' aria-current="true"':'')+'>'+
      '<div class="ga-card-top"><span class="ga-cat"><span aria-hidden="true">'+m.emoji+'</span> '+esc(m.label)+'</span>'+(badges ? '<span class="ga-badges">'+badges+'</span>' : '')+'</div>'+
      '<div class="ga-head">'+(logo ? '<img class="ga-logo" src="'+esc(logo)+'" alt="" width="44" height="44" loading="lazy" decoding="async">' : '')+'<h4 class="ga-name">'+esc(p.businessName)+'</h4></div>'+
      ratingHtml(p)+
      (area ? '<p class="ga-area"><span aria-hidden="true">📍</span> '+esc(area)+'</p>' : '')+
      (tags.length ? '<ul class="ga-tags" aria-label="Services">'+tags.map(t=>'<li class="ga-tag">'+esc(t)+'</li>').join('')+'</ul>' : '')+
      ((p.shortDescription||p.description) ? '<p class="ga-desc">'+esc(p.shortDescription||p.description)+'</p>' : '')+
      '<div class="ga-actions">'+actionsHtml(p, mobile)+'</div></article>';
  }
  /* Compact row (client, 28 Oct 2026: the full cards made a long list): name, type and rating; a tap opens the full card below it. */
  function rowHtml(p, mobile){
    const m = MODE[p.category], id = esc(p.id), open = state.selectedProvider===p.id;
    const rate = p.rating!=null
      ? '<span class="ga-row-rate"><span class="ga-star" aria-hidden="true">★</span> <strong>'+p.rating.toFixed(1)+'</strong>'+(p.reviewCount ? ' <span class="ga-row-cnt">('+p.reviewCount.toLocaleString('en-IN')+')</span>' : '')+'</span>'
      : '<span class="ga-row-rate is-none">Not rated yet</span>';
    const meta = [m.label, p.verified ? '✓ Verified' : '', p.featured ? 'Featured' : ''].filter(Boolean).join(' · ');
    return '<li class="ga-item'+(open?' is-open':'')+'"><button type="button" class="ga-row" data-act="details" data-id="'+id+'" data-k="row-'+id+'" aria-expanded="'+open+'" aria-controls="ga-d-'+id+'">'+
      '<span class="ga-row-emoji" aria-hidden="true">'+m.emoji+'</span><span class="ga-row-main"><span class="ga-row-name">'+esc(p.businessName)+'</span><span class="ga-row-meta">'+esc(meta)+'</span></span>'+
      rate+'<span class="ga-row-chev" aria-hidden="true"></span></button>'+
      '<div class="ga-row-detail" id="ga-d-'+id+'"'+(open?'':' hidden')+'>'+articleHtml(p, mobile)+'</div></li>';
  }
  function toggleRow(b){
    const li = b.closest('.ga-item'), d = li && li.querySelector('.ga-row-detail'); if(!d) return;
    const open = d.hidden; d.hidden = !open; b.setAttribute('aria-expanded', String(open)); li.classList.toggle('is-open', open);
    if(open){ const p = byId[b.dataset.id]; if(p) track('view_provider', {provider_id:p.id, category:p.category, source:'list'}); }
  }
  function stateHtml(title, body, actions){
    return '<div class="ga-state"><h3>'+title+'</h3>'+(body?'<p>'+body+'</p>':'')+(actions?'<div class="ga-state-actions">'+actions+'</div>':'')+'</div>';
  }
  const btn = (act, label, cls)=>'<button type="button" class="ga-btn'+(cls||'')+'" data-act="'+act+'" data-k="'+act+'">'+label+'</button>';
  function renderResults(){
    const mobile = isMobile();
    el.results.setAttribute('aria-busy', String(status==='loading'));
    if(status==='loading'){ el.results.innerHTML = '<ul class="ga-list" aria-hidden="true">'+'<li><div class="ga-skel is-row"></div></li>'.repeat(3)+'</ul>'; return; }
    if(status==='error'){ el.results.innerHTML = '<div role="alert">'+stateHtml('Transport services are temporarily unavailable.','Please try again.', btn('retry','Retry',' primary'))+'</div>'; return; }
    if(!results.length){
      if(!hasData() || emptyMode()){
        const m = MODE[state.category];
        const what = state.destination ? 'transport to the desert' : (m ? m.many : 'transport providers');
        el.results.innerHTML = stateHtml('No '+esc(what)+' listed yet',
          'We only list real, active local businesses — no placeholders. Until they join, '+(m ? 'use the guide above' : 'pick a travel type above for a quick guide')+'.',
          (activeFilters() ? btn('clear','View All') : ''));
        return;
      }
      // is there a match if the category / desert filter were lifted?
      let elsewhere = 0;
      if(state.searchQuery && (state.category!=='all' || state.serviceType || state.destination)) elsewhere = compute({searchQuery:state.searchQuery, category:'all', serviceType:null, destination:null}).length;
      el.results.innerHTML = stateHtml('No services found',
        'Try another category or search.'+(elsewhere ? ' There '+plural(elsewhere,'is 1 match','are '+elsewhere+' matches')+' for “'+esc(state.searchQuery)+'” in other categories.' : ''),
        btn('clear','Clear Filters',' primary')+btn('all','View All')+(elsewhere ? btn('search-all','Search all categories') : ''));
      return;
    }
    const page = results.slice(0, shown);
    let html = '<ul class="ga-list" id="gaGrid">'+page.map(p=>rowHtml(p,mobile)).join('')+'</ul>';
    if(results.length>shown) html += '<div class="ga-more">'+btn('more','Show more ('+(results.length-shown)+' more)')+'</div>';
    el.results.innerHTML = html;
  }
  function showMore(){
    const mobile = isMobile(), from = shown; shown += CFG.pageSize;
    const grid = $('gaGrid'); if(!grid) return;
    grid.insertAdjacentHTML('beforeend', results.slice(from, shown).map(p=>rowHtml(p,mobile)).join(''));
    const more = el.results.querySelector('.ga-more');
    if(results.length>shown){ more.innerHTML = btn('more','Show more ('+(results.length-shown)+' more)'); } else if(more){ more.remove(); }
    const first = grid.querySelectorAll('.ga-row')[from]; if(first) first.focus();
  }

  /* ------------------------------------------------------------
     RENDER — orchestrators
     ------------------------------------------------------------ */
  function update(opts){                    // state changed → derive everything
    opts = opts || {};
    results = status==='ready' ? compute() : [];
    if(!opts.keepPage) shown = CFG.pageSize;
    withFocus(()=>{ syncControls(); renderSub(); renderStatus(); renderGuide(); renderResults(); });
  }
  function renderAll(){ buildControls(); update(); }
  function setNotice(msg){ el.notice.textContent = msg||''; el.notice.hidden = !msg; }

  /* ------------------------------------------------------------
     ACTIONS
     ------------------------------------------------------------ */
  function flushSearch(){ if(searchTimer){ clearTimeout(searchTimer); searchTimer = null; state.searchQuery = txt(el.search.value).slice(0,60); } }
  function setCategory(c, opts){
    flushSearch();
    if(c!=='all' && !MODE[c]) c = 'all';
    state.category = c; state.serviceType = null; setNotice('');
    update(); if(!opts || !opts.silent) track('filter_category', {category:c});
  }
  function toggleQuick(k){
    flushSearch();
    if(k==='desert'){ state.destination = state.destination ? null : 'desert'; setNotice(''); update(); track('filter_category', {category:'desert', active:!!state.destination}); }
    else setCategory(state.category===k ? 'all' : k);
  }
  function clearFilters(){ clearTimeout(searchTimer); state.searchQuery = ''; state.category = 'all'; state.serviceType = null; state.destination = null; el.search.value = ''; setNotice(''); update(); }
  function applySearch(q){
    state.searchQuery = txt(q).slice(0,60); setNotice(''); update();
    if(state.searchQuery.length>=2) track('search_provider', {query_length:state.searchQuery.length, results:results.length});
  }
  function openMap(id){
    const p = byId[id]; if(!p) return;
    state.selectedProvider = id;
    root.querySelectorAll('.ga-card').forEach(c=>{ const on = c.dataset.id===id; c.classList.toggle('is-selected', on); if(on) c.setAttribute('aria-current','true'); else c.removeAttribute('aria-current'); });
    track('view_on_map', {provider_id:id, category:p.category});
    const api = mapApi(); if(!api) return;
    // the map opens on the same transport slice the visitor is looking at
    api.show('prov-'+id, {cat:state.category!=='all' && MODE[state.category].mapCat ? MODE[state.category].mapCat : 'transport', sub:state.category!=='all' ? MODE[state.category].mapSub : null});
  }
  function requestNearest(){
    if(state.userLocation){ state.sortBy = 'nearest'; update(); return; }
    const back = ()=>{ state.sortBy = lastSort; el.sort.value = lastSort; update(); };
    // Shared JMLocation: reuses a position the visitor already shared elsewhere on the page (no second GPS prompt).
    // After a refusal the browser won't re-prompt, so a retry simply explains how to enable it again.
    if(!window.JMLocation){ setNotice('Location isn’t available on this device.'); back(); return; }
    el.sort.setAttribute('aria-busy','true'); setNotice('Finding your location…');
    JMLocation.request({timeoutMs:8000}).then(pos=>{
      el.sort.removeAttribute('aria-busy');
      state.userLocation = {lat:pos.lat, lng:pos.lng};   // memory only — never stored or sent
      state.sortBy = 'nearest'; lastSort = 'nearest';
      const c = mapApi() && mapApi().center ? mapApi().center() : null;
      setNotice(c && haversine(c.lat,c.lng,state.userLocation.lat,state.userLocation.lng)>CFG.farKm ? 'You seem to be outside Jaisalmer, so distances are from where you are now.' : '');
      update();
    }, err=>{
      el.sort.removeAttribute('aria-busy');
      const c = err && err.code;
      if(c==='denied'){ locDenied = true; setNotice('Location access is blocked. Allow it in your browser settings to find nearby services.'); }
      else if(c==='insecure' || c==='unsupported') setNotice(err.message);
      else setNotice('Couldn’t get your location. Try again in a moment.');
      back();
    });
  }

  /* contact sheet */
  function openSheet(p, trigger){
    sheetReturn = trigger || document.activeElement;
    el.sheetTitle.textContent = 'Contact';
    el.sheetSub.textContent = p.businessName;
    el.sheetActs.innerHTML =
      (p.phone ? '<a class="ga-btn" data-act="call" data-id="'+esc(p.id)+'" href="tel:'+esc(p.phone)+'"><span aria-hidden="true">📞</span> Call <small>'+esc(p.phone)+'</small></a>' : '')+
      (p.whatsapp ? '<a class="ga-btn" data-act="whatsapp" data-id="'+esc(p.id)+'" href="'+esc(waUrl(p))+'" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">💬</span> WhatsApp</a>' : '');
    el.sheetOv.hidden = false;
    track('view_provider', {provider_id:p.id, category:p.category});
    const first = el.sheetActs.querySelector('a'); (first || el.sheetClose).focus();
  }
  function closeSheet(){
    if(el.sheetOv.hidden) return;
    el.sheetOv.hidden = true;
    const r = sheetReturn; sheetReturn = null;
    const k = r && r.getAttribute && r.getAttribute('data-k');
    const t = (r && document.contains(r)) ? r : (k ? root.querySelector('[data-k="'+k+'"]') : null);
    if(t) try{ t.focus({preventScroll:true}); }catch(e){}
  }
  el.sheetClose.addEventListener('click', closeSheet);
  el.sheetOv.addEventListener('click', e=>{ if(e.target===el.sheetOv) closeSheet(); });
  el.sheetActs.addEventListener('click', e=>{ const a = e.target.closest('[data-act]'); if(!a) return; const ev = {call:'call_provider', whatsapp:'whatsapp_provider', website:'view_profile', email:'email_provider'}[a.dataset.act]; if(ev) track(ev, {provider_id:a.dataset.id}); setTimeout(closeSheet, 0); });
  /* Same sheet for any business or place (Tourist Companion). Every action is built only from a valid value. */
  function openContact(o, trigger){
    o = o || {};
    const phone = safePhone(o.phone), wa = safeWhatsapp(o.whatsapp), web = safeUrl(o.website);
    const mail = /^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i.test(txt(o.email)) ? txt(o.email) : null;
    const waHref = wa ? ((typeof o.waUrl==='string' && o.waUrl.indexOf('https://wa.me/'+wa)===0) ? o.waUrl : 'https://wa.me/'+wa+'?text='+encodeURIComponent('Hi, I found you on Jaisalmer Visit.')) : null;
    if(!phone && !wa && !web && !mail) return false;
    const id = esc(txt(o.id));
    sheetReturn = trigger || document.activeElement;
    el.sheetTitle.textContent = 'Contact';
    el.sheetSub.textContent = txt(o.name);
    el.sheetActs.innerHTML =
      (phone ? '<a class="ga-btn" data-act="call" data-id="'+id+'" href="tel:'+esc(phone)+'"><span aria-hidden="true">📞</span> Call <small>'+esc(phone)+'</small></a>' : '')+
      (wa ? '<a class="ga-btn" data-act="whatsapp" data-id="'+id+'" href="'+esc(waHref)+'" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">💬</span> WhatsApp</a>' : '')+
      (web ? '<a class="ga-btn" data-act="website" data-id="'+id+'" href="'+esc(web)+'"'+linkAttrs(web)+'><span aria-hidden="true">🌐</span> Website</a>' : '')+
      (mail ? '<a class="ga-btn" data-act="email" data-id="'+id+'" href="mailto:'+esc(mail)+'"><span aria-hidden="true">📧</span> Email</a>' : '');
    el.sheetOv.hidden = false;
    track('view_provider', {provider_id:txt(o.id), source:txt(o.source)||'place'});
    const first = el.sheetActs.querySelector('a'); (first || el.sheetClose).focus();
    return true;
  }
  el.sheetOv.addEventListener('keydown', e=>{
    if(e.key==='Escape'){ e.stopPropagation(); closeSheet(); return; }
    if(e.key!=='Tab') return;
    const f = Array.from(el.sheet.querySelectorAll('a[href],button')).filter(x=>!x.disabled), i = f.indexOf(document.activeElement);
    if(!f.length) return;
    if(e.shiftKey && i<=0){ e.preventDefault(); f[f.length-1].focus(); } else if(!e.shiftKey && i===f.length-1){ e.preventDefault(); f[0].focus(); }
  });

  /* ------------------------------------------------------------
     EVENTS (delegated)
     ------------------------------------------------------------ */
  el.quick.addEventListener('click', e=>{ const b = e.target.closest('[data-quick]'); if(b) toggleQuick(b.dataset.quick); });
  el.chips.addEventListener('click', e=>{ const b = e.target.closest('[data-cat]'); if(b) setCategory(b.dataset.cat); });
  el.sub.addEventListener('click', e=>{
    const t = e.target.closest('[data-type]'), d = e.target.closest('[data-dest]');
    if(t){ state.serviceType = t.dataset.type || null; update(); track('filter_category', {category:state.category, service_type:state.serviceType||'all'}); }
    else if(d){ state.destination = state.destination===d.dataset.dest ? 'desert' : d.dataset.dest; update(); track('filter_category', {category:'desert', destination:state.destination}); }
  });
  el.search.addEventListener('input', ()=>{ el.clear.hidden = !el.search.value; clearTimeout(searchTimer); searchTimer = setTimeout(()=>applySearch(el.search.value), CFG.searchDebounceMs); });
  el.search.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); clearTimeout(searchTimer); applySearch(el.search.value); el.search.blur(); } });
  el.clear.addEventListener('click', ()=>{ clearTimeout(searchTimer); el.search.value = ''; el.clear.hidden = true; applySearch(''); el.search.focus(); });
  el.sort.addEventListener('change', ()=>{
    const v = el.sort.value; track('sort_provider', {sort:v});
    if(v==='nearest'){ requestNearest(); return; }
    state.sortBy = v; lastSort = v; setNotice(''); update();
  });
  el.mapAll.addEventListener('click', ()=>{ const api = mapApi(), m = MODE[state.category]; if(api) api.open({cat:m && m.mapCat ? m.mapCat : 'transport', sub:m ? m.mapSub : null}); track('view_on_map', {category:state.category, scope:'all'}); });
  el.results.addEventListener('click', e=>{
    const a = e.target.closest('[data-act]'); if(!a) return;
    const act = a.dataset.act, id = a.dataset.id, p = id ? byId[id] : null;
    if(act==='map' && p) openMap(id);
    else if(act==='details') toggleRow(a);
    else if(act==='contact' && p) openSheet(p, a);
    else if(act==='call') track('call_provider', {provider_id:id});
    else if(act==='whatsapp') track('whatsapp_provider', {provider_id:id});
    else if(act==='profile') track('view_profile', {provider_id:id});
    else if(act==='more') showMore();
    else if(act==='retry') load();
    else if(act==='clear' || act==='all') clearFilters();
    else if(act==='search-all'){ state.category = 'all'; state.serviceType = null; state.destination = null; update(); }
  });
  (mqMobile.addEventListener ? mqMobile.addEventListener.bind(mqMobile,'change') : mqMobile.addListener.bind(mqMobile))(()=>{ if(status==='ready') update({keepPage:true}); });

  /* ------------------------------------------------------------
     PUBLIC API — used by the header menu, site search, the Smart Tourist Map and future feeds
     ------------------------------------------------------------ */
  function scrollToSection(){
    const sec = document.getElementById('transport'), h = document.querySelector('.site-header');
    if(!sec) return;
    window.scrollTo({top: sec.getBoundingClientRect().top + window.scrollY - (h ? h.getBoundingClientRect().height : 0) - 8, behavior:'smooth'});
  }
  window.JMTransport = {
    open:function(o){ o = o || {};
      state.category = MODE[o.category] ? o.category : 'all'; state.serviceType = null; state.destination = o.destination || null;
      state.searchQuery = txt(o.q).slice(0,60); el.search.value = state.searchQuery; setNotice('');
      update(); scrollToSection(); },
    load:function(rawList){ status = 'ready'; const n = ingest(rawList); renderAll(); return n; },   // add providers at runtime (admin/API feed)
    providers:function(){ return providers.map(p=>({id:p.id, businessName:p.businessName, category:p.category, verified:p.verified, rating:p.rating, reviewCount:p.reviewCount})); },
    find:function(q){ const plan = queryPlan(q); if(!plan) return [];
      return providers.filter(p=>scoreWords(p._w, plan)>0).slice(0,5).map(p=>({id:p.id, name:p.businessName, meta:MODE[p.category].label})); },
    state:function(){ return Object.assign({}, state, {results:results.map(p=>p.id), status:status}); },
    // Read-only copies for the Tourist Companion — exactly what this directory lists (validated, active, nothing invented)
    list:function(category){ return providers.filter(p=>!category || p.category===category).map(p=>({id:p.id, businessName:p.businessName, category:p.category,
      subcategory:p.subcategory, shortDescription:p.shortDescription, description:p.description, latitude:p.latitude, longitude:p.longitude,
      serviceAreas:p.serviceAreas.slice(), verified:p.verified, featured:p.featured, rating:p.rating, reviewCount:p.reviewCount,
      phone:p.phone, whatsapp:p.whatsapp, profileUrl:p.profileUrl})); },
    contact:openContact,
    track:track
  };

  load();
})();
