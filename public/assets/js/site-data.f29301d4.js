/* ============================================================
   SITE DATA — published content from Firestore, with the built-in data as fallback.
   ------------------------------------------------------------
   1. Fetches every published/{dataset} document in ONE request (Firestore REST API;
      no SDK on the public site — it only needs one read and two small writes).
   2. Starts the page scripts as soon as the data arrives, or after BOOT_TIMEOUT_MS
      with the last copy cached in this tab (sessionStorage), or with nothing.
   3. Each script asks VJData.get('ATTRACTIONS', [...built-in...]) for its data and gets the
      published version converted to the exact shape it already uses — or the built-in
      array when there is no published data. So the page never renders blank.
   Writes (newsletter, Add Your Service) go through VJData.create(), checked by firestore.rules.
   ============================================================ */
(function(root){
  'use strict';
  var BOOT_TIMEOUT_MS = 1500;
  var CACHE_KEY = 'vj_published_v1';

  /* ---------- converters: admin record → the shapes the page scripts use ---------- */
  function own(o){ var r = {}; for(var k in o) if(Object.prototype.hasOwnProperty.call(o, k) && k !== '_uid') r[k] = o[k]; return r; }
  function blank(v){ return v === '' || v == null || (Array.isArray(v) && !v.length); }
  function clean(o){ var r = own(o); for(var k in r) if(blank(r[k])) delete r[k]; return r; }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function str(v){ return typeof v === 'string' ? v : ''; }
  function num(v){ return typeof v === 'number' && isFinite(v); }
  function llOk(a, b){ return num(a) && num(b) && a >= -90 && a <= 90 && b >= -180 && b <= 180; }

  var C = {
    places: function(list){
      return list.filter(function(p){ return p && p.id && p.name; }).map(function(p){
        var a = {id:p.id, name:p.name, tag:str(p.tag), short:str(p.short), youtubeUrl:str(p.youtubeUrl), image:str(p.image), imageAlt:str(p.imageAlt), why:str(p.why), see:arr(p.see),
                 bestTime:str(p.bestTime), location:str(p.location), distance:str(p.distance), nearby:arr(p.nearby), tips:str(p.tips)};
        if(p.ticketText || p.ticketUrl) a.ticket = clean({text:p.ticketText, url:p.ticketUrl});
        if(p.timing) a.timing = p.timing;
        if(p.address) a.address = p.address;
        var c = clean({phone:p.phone, whatsapp:p.whatsapp, website:p.website, email:p.email});
        if(Object.keys(c).length) a.contact = c;
        if(arr(p.services).length) a.services = p.services;
        if(p.visible === false) a.visible = false;
        return a;
      });
    },
    placesGeo: function(list){
      var g = {};
      list.forEach(function(p){ if(p && p.id && llOk(p.lat, p.lng)) g[p.id] = {ll:[p.lat, p.lng], cat:p.mapCategory || 'attractions', sub:str(p.mapSub)}; });
      return g;
    },
    activities: function(list){ return list.filter(function(a){ return a && a.id && a.name; }).map(function(a){ return {id:a.id, name:a.name, cat:a.cat}; }); },
    activityInfo: function(list){
      var o = {};
      list.forEach(function(a){ if(!a || !a.id) return; var r = own(a); delete r.id; delete r.name; delete r.cat; o[a.id] = r; });
      return o;
    },
    landmarks: function(list){ return list.filter(function(r){ return r && r.id; }).map(clean); },
    // Approved visitor reviews (published/reviews) replace a hand-entered rating once a provider has any.
    transport: function(list){ return list.filter(function(r){ return r && r.active !== false; }).map(function(r){ return withReviews(clean(r), 'transport', r.id); }); },
    operators: function(list){ return list.map(function(r){ return withReviews(clean(r), 'operator', r && r.providerId); }); },
    experiences: function(list){
      return list.map(function(r){ var o = clean(r); if(r.pickupAvailable === true || r.pickupAvailable === false) o.pickupAvailable = r.pickupAvailable; return o; });
    },
    sponsors: function(list){ return list.map(clean); },
    historyAudio: function(list){ return list.map(function(r){ var o = own(r); o.type = 'history'; return o; }); },
    // Everything in published/guidance was published from the admin; an old in-record published:false (round 11) must not hide it.
    guidance: function(list){ return list.map(function(r){ var o = own(r); delete o.published; return o; }); },
    houseAds: function(list){ return list.map(own); },
    partners: function(list){ return list.map(own); },
    // Admin "Plan a trip" records {id, label, order, visible, day1..day5:{title,morning,afternoon,evening,note}}
    // → {id: {label, days:[…]}} in tab order; days left empty are skipped.
    itineraries: function(list){
      var out = {};
      list.filter(function(r){ return r && r.id && r.label && r.visible !== false; })
        .map(function(r, i){ return {r:r, i:i}; })
        .sort(function(a, b){ return ((num(a.r.order) ? a.r.order : 1e9) - (num(b.r.order) ? b.r.order : 1e9)) || a.i - b.i; })
        .forEach(function(x){
          var days = [];
          for(var n = 1; n <= 5; n++){
            var d = x.r['day' + n];
            if(!d || typeof d !== 'object') continue;
            var day = {title:str(d.title).trim(), morning:str(d.morning).trim(), afternoon:str(d.afternoon).trim(), evening:str(d.evening).trim(), note:str(d.note).trim()};
            if(day.morning || day.afternoon || day.evening) days.push(day);
          }
          if(days.length) out[x.r.id] = {label:x.r.label, days:days};
        });
      return out;
    }
  };

  /* Page constant → [dataset, converter, keep built-in data when the published list is empty]. */
  var MAP = {
    ATTRACTIONS:         ['places', C.places, true],
    ATTRACTION_GEO:      ['places', C.placesGeo, false],
    ACTIVITIES:          ['activities', C.activities, true],
    ACTIVITY_INFO:       ['activities', C.activityInfo, false],
    CURATED_PLACES:      ['landmarks', C.landmarks, false],
    TRANSPORT_PROVIDERS: ['transport', C.transport, false],
    PROVIDERS:           ['operators', C.operators, false],
    EXPERIENCES:         ['experiences', C.experiences, false],
    SPONSOR_ADS:         ['sponsors', C.sponsors, false],
    HISTORY_AUDIO:       ['historyAudio', C.historyAudio, true],
    AUDIO_GUIDANCE:      ['guidance', C.guidance, true],
    HOUSE_ADS:           ['houseAds', C.houseAds, false],
    FEATURED_BRANDS:     ['partners', C.partners, false],
    ITINERARIES:         ['itineraries', C.itineraries, true],
    ANNOUNCEMENTS:       ['announcements', function(list){ return list.map(function(a){ var o = own(a); o._uid = a._uid; return o; }); }, false]
  };

  /* ---------- visitor reviews (published/reviews: one summary per rated provider) ---------- */
  function reviewList(){ return data && Array.isArray(data.reviews) ? data.reviews : []; }
  function reviewFor(type, id){
    if(!type || !id) return null;
    var key = type + ':' + id, list = reviewList();
    for(var i = 0; i < list.length; i++){
      var r = list[i];
      if(r && r.key === key && num(r.avg) && num(r.count) && r.count > 0)
        return {avg: Math.max(1, Math.min(5, r.avg)), count: Math.floor(r.count), recent: arr(r.recent).filter(function(x){ return x && num(x.rating); })};
    }
    return null;
  }
  function withReviews(o, type, id){
    var rv = reviewFor(type, id);
    if(rv){ o.rating = Math.round(rv.avg * 10) / 10; o.reviewCount = rv.count; }
    return o;
  }

  /* ---------- Firestore REST ---------- */
  var F = root.VJ_FIREBASE || {};
  var CFG = F.FIREBASE_CONFIG || {};
  var DOCS = (F.USE_EMULATORS ? 'http://' + F.EMULATORS.firestore.join(':') : 'https://firestore.googleapis.com') +
             '/v1/projects/' + CFG.projectId + '/databases/%28default%29/documents';
  var KEY = F.USE_EMULATORS ? '' : 'key=' + encodeURIComponent(CFG.apiKey || '');
  function url(path, query){ var q = [query, KEY].filter(Boolean).join('&'); return DOCS + path + (q ? '?' + q : ''); }

  function dec(v){
    if(!v || typeof v !== 'object') return null;
    if('stringValue' in v) return v.stringValue;
    if('booleanValue' in v) return v.booleanValue;
    if('integerValue' in v) return Number(v.integerValue);
    if('doubleValue' in v) return Number(v.doubleValue);
    if('nullValue' in v) return null;
    if('timestampValue' in v) return v.timestampValue;
    if('arrayValue' in v) return (v.arrayValue.values || []).map(dec);
    if('mapValue' in v) return decFields(v.mapValue.fields);
    return null;
  }
  function decFields(f){ var o = {}; for(var k in (f || {})) o[k] = dec(f[k]); return o; }
  function enc(v){
    if(v == null) return {nullValue:null};
    if(typeof v === 'boolean') return {booleanValue:v};
    if(typeof v === 'number') return Number.isInteger(v) ? {integerValue:String(v)} : {doubleValue:v};
    if(Array.isArray(v)) return {arrayValue:{values:v.map(enc)}};
    if(typeof v === 'object'){ var f = {}; for(var k in v) f[k] = enc(v[k]); return {mapValue:{fields:f}}; }
    return {stringValue:String(v)};
  }

  function fetchPublished(){
    if(!CFG.projectId || typeof fetch !== 'function') return Promise.reject(new Error('no config'));
    return fetch(url('/published', 'pageSize=50'), {credentials:'omit', headers:{'Accept':'application/json'}})
      .then(function(r){ if(!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function(j){
        var out = {};
        (j.documents || []).forEach(function(d){
          var id = d.name.split('/').pop(), v = decFields(d.fields);
          if(Array.isArray(v.items)) out[id] = v.items;
        });
        return out;
      });
  }

  function readCache(){ try{ var c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null'); return c && c.data && typeof c.data === 'object' ? c.data : null; }catch(e){ return null; } }
  function writeCache(d){ try{ sessionStorage.setItem(CACHE_KEY, JSON.stringify({at:Date.now(), data:d})); }catch(e){} }

  /* ---------- state ---------- */
  var data = null, source = 'built-in';
  var live = fetchPublished().then(function(d){ writeCache(d); return d; });
  live.catch(function(){});

  function settings(){ var s = data && data.settings; return s && s[0] && typeof s[0] === 'object' ? s[0] : null; }

  var api = {
    /** Published version of a page constant, or the built-in value. */
    get: function(name, builtIn){
      var m = MAP[name], list = m && data && data[m[0]];
      if(!m || !Array.isArray(list)) return builtIn;
      try{
        var out = m[1](list);
        if(m[2] && (Array.isArray(out) ? !out.length : !Object.keys(out || {}).length)) return builtIn;
        return out;
      }catch(e){ return builtIn; }
    },
    /** Site settings from the admin, or null when none are published. */
    settings: settings,
    partnersConfig: function(builtIn){ var s = settings(); return s ? {showPlaceholders: s.showPlaceholders === true} : builtIn; },
    socialLinks: function(builtIn){
      var s = settings(); if(!s) return builtIn;
      return {youtube:str(s.socialYoutube), facebook:str(s.socialFacebook), instagram:str(s.socialInstagram), x:str(s.socialX)};
    },
    adConfig: function(cfg){
      var s = settings(); if(!s) return cfg;
      if(typeof s.adsEnabled === 'boolean') cfg.enabled = s.adsEnabled;
      if(num(s.maxAdsPerSession)) cfg.frequency.maxAdsPerSession = s.maxAdsPerSession;
      if(num(s.maxAdsPerDay)) cfg.frequency.maxAdsPerDay = s.maxAdsPerDay;
      if(num(s.globalCooldownMinutes)) cfg.frequency.globalCooldownMinutes = s.globalCooldownMinutes;
      if(typeof s.googleEnabled === 'boolean') cfg.providers.google.enabled = s.googleEnabled;
      if(s.googleAdUnitPath) cfg.providers.google.adUnitPath = s.googleAdUnitPath;
      // Where ads may appear (Settings → Advertising). Unset = the built-in default.
      var where = {adPlaceExploration:'place-exploration', adHistoryAudio:'audio-guide', adDuringHistoryAudio:'audio-inline', adMapLocation:'map-location', adItinerary:'itinerary'};
      for(var k in where) if(typeof s[k] === 'boolean' && cfg.triggers[where[k]]) cfg.triggers[where[k]].enabled = s[k];
      return cfg;
    },
    /** Map tile / routing provider and keys from Settings → Map (unknown ids fall back). */
    mapProviders: function(builtIn){
      var s = settings(), T = ['osm','stadia','maptiler','mapbox','selfhosted'], R = ['builtin','fossgis','stadia','osrm','mapbox','off'];
      if(!s) return builtIn;
      return {tiles: T.indexOf(s.tiles) !== -1 ? s.tiles : builtIn.tiles, routing: R.indexOf(s.routing) !== -1 ? s.routing : builtIn.routing,
              keys: {maptiler: str(s.maptilerKey).trim(), mapbox: str(s.mapboxToken).trim(), stadia: str(s.stadiaKey).trim()}};
    },
    /** Approved visitor reviews for one provider: {avg, count, recent:[{rating,text,name,date}]} or null.
        type: 'transport' (Getting Around record id) | 'operator' (activity operator providerId). */
    reviews: reviewFor,
    /** Send a visitor review. It shows on the site once an admin approves it. Resolves {ok, status}. */
    submitReview: function(o){
      var f = {targetType:String(o.targetType || ''), targetId:String(o.targetId || ''), targetName:String(o.targetName || '').slice(0, 120),
               rating:Math.round(Number(o.rating)), status:'pending', source:'website'};
      var t = String(o.text || '').trim().slice(0, 600), n = String(o.name || '').trim().slice(0, 60);
      if(t) f.text = t;
      if(n) f.name = n;
      return api.create('reviews', null, f);
    },
    /** 'live' | 'cache' | 'built-in' — where this page's content came from. */
    source: function(){ return source; },
    /** Create one document (public forms). docId null = random id. Resolves {ok, status}. */
    create: function(collection, docId, fields){
      var id = docId || (Date.now().toString(36) + Math.random().toString(36).slice(2, 12));
      var name = 'projects/' + CFG.projectId + '/databases/(default)/documents/' + collection + '/' + id;
      var body = {writes:[{update:{name:name, fields:enc(fields).mapValue.fields},
        updateTransforms:[{fieldPath:'createdAt', setToServerValue:'REQUEST_TIME'}], currentDocument:{exists:false}}]};
      var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
      var timer = ctrl && setTimeout(function(){ ctrl.abort(); }, 10000);
      return fetch(url(':commit'), {method:'POST', credentials:'omit', signal:ctrl && ctrl.signal,
        headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)})
        .then(function(r){ return {ok:r.ok, status:r.status}; }, function(){ return {ok:false, status:0}; })
        .then(function(r){ if(timer) clearTimeout(timer); return r; });
    },
    /** Start the page scripts (in order) once the data is in, or after the timeout. */
    boot: function(srcs){
      var started = false;
      function start(d, from){
        if(started) return; started = true;
        data = d; source = from;
        srcs.forEach(function(src){ var s = document.createElement('script'); s.src = src; s.async = false; document.body.appendChild(s); });
      }
      live.then(function(d){ start(d, 'live'); }, function(){ var c = readCache(); start(c, c ? 'cache' : 'built-in'); });
      setTimeout(function(){ var c = readCache(); start(c, c ? 'cache' : 'built-in'); }, BOOT_TIMEOUT_MS);
    },
    _convert: C   // used by scripts/check-site-data.mjs
  };
  root.VJData = api;
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
