(function(){
  'use strict';

  /* ------------------------------------------------------------
     CONFIG
     ------------------------------------------------------------ */
  /* ------------------------------------------------------------
     MAP PROVIDERS — the ONLY place a tile or routing vendor is named.
     To switch vendor: change ACTIVE_PROVIDERS, paste the key/URL into that preset, deploy.
     Nothing else in this file knows which vendor is in use.

     Keys: these are browser-visible *publishable* keys, never secrets. Lock every one to your
     domain in the vendor's dashboard (MapTiler: allowed origins · Mapbox: URL restrictions ·
     Stadia: domain authentication, which needs no key in the page at all).
     A value still containing a __PLACEHOLDER__ is treated as NOT configured: that layer is switched off
     (with a console error) rather than silently falling back to the free public OSM servers.
     The provider and keys are set in the admin (Settings → Map); the values below are only the
     built-in fallback when no settings are published.
     ------------------------------------------------------------ */
  const ACTIVE_PROVIDERS = VJData.mapProviders({tiles:'osm', routing:'builtin'});   // production: e.g. {tiles:'stadia', routing:'builtin'}
  const KEY = name=>(ACTIVE_PROVIDERS.keys||{})[name] || '';

  const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
  /* Tile preset fields (all optional except url/attribution):
       url, attribution, subdomains ({s}), maxNativeZoom, tileSize + zoomOffset (512px tiles: 512 / -1),
       preconnect (origin to warm up), referrerPolicy, needsReferer (true → no tiles on file:// pages),
       localPreview (alternative used only on file:// pages), billing (note for humans only). */
  const TILE_PROVIDERS = {
    // Public OSM tiles — light use only (https://operations.osmfoundation.org/policies/tiles/). NOT for production traffic.
    osm:{url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attribution:OSM_ATTR, maxNativeZoom:19,
      preconnect:'https://tile.openstreetmap.org', referrerPolicy:'strict-origin-when-cross-origin', needsReferer:true,
      localPreview:{url:null, attribution:'', subdomains:'abc', maxNativeZoom:19}},
    // Stadia Maps raster (Leaflet). Domain auth for the live site (register it in the Stadia dashboard → no key here);
    // for localhost/file previews add ?api_key=… . 1 credit per tile. Commercial use needs a paid plan.
    stadia:{url:'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png'+(KEY('stadia')?'?api_key='+encodeURIComponent(KEY('stadia')):''), maxNativeZoom:20,
      attribution:'&copy; <a href="https://stadiamaps.com/" target="_blank" rel="noopener">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> '+OSM_ATTR,
      preconnect:'https://tiles.stadiamaps.com', referrerPolicy:'strict-origin-when-cross-origin', needsReferer:true},
    // MapTiler raster XYZ, 256px tiles (= 1 billable request each; 512px tiles count as 4). Commercial use needs Flex or above.
    maptiler:{url:'https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}{r}.png?key='+(encodeURIComponent(KEY('maptiler'))||'__MAPTILER_KEY__'), maxNativeZoom:20,
      attribution:'<a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">&copy; MapTiler</a> '+OSM_ATTR,
      preconnect:'https://api.maptiler.com', referrerPolicy:'strict-origin-when-cross-origin', needsReferer:false},
    // Mapbox Static Tiles API, 512px tiles shown at the right scale with zoomOffset -1 (1 billable request per 512px tile).
    // Mapbox requires its wordmark logo as well as this text — see docs.mapbox.com/help/getting-started/attribution/.
    mapbox:{url:'https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}{r}?access_token='+(encodeURIComponent(KEY('mapbox'))||'__MAPBOX_PUBLIC_TOKEN__'),
      tileSize:512, zoomOffset:-1, maxNativeZoom:22,
      attribution:'&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">Mapbox</a> '+OSM_ATTR+' <a href="https://www.mapbox.com/map-feedback/" target="_blank" rel="noopener">Improve this map</a>',
      preconnect:'https://api.mapbox.com', referrerPolicy:'strict-origin-when-cross-origin', needsReferer:false},
    // Your own raster tile server (any XYZ endpoint rendering OSM data). Keep the ODbL attribution.
    selfhosted:{url:'https://tiles.__SELFHOSTED_DOMAIN__/{z}/{x}/{y}.png', attribution:OSM_ATTR, maxNativeZoom:19,
      preconnect:'https://tiles.__SELFHOSTED_DOMAIN__', referrerPolicy:'strict-origin-when-cross-origin', needsReferer:false}
  };
  /* Routing preset fields:
       format: 'osrm'     GET  <profile><lng,lat;lng,lat>?overview=full&geometries=geojson…  (OSRM, self-hosted OSRM, Mapbox Directions)
               'valhalla' POST <endpoint> {locations, costing, format:'osrm'}                 (Stadia Maps, self-hosted Valhalla)
               'local'    no request: <graphUrl> (static road file) is searched on the device  (built-in)
       profiles: mode → URL (osrm) or Valhalla costing name (valhalla); only modes listed are offered.
       endpoint (valhalla), query (extra URL params, e.g. a key), provider/aboutUrl (attribution link),
       dataLabel (named in the route notes), minIntervalMs (overrides the shared rate limit).
       local only: graphUrl, maxSnapM (farther from every road → straight line), carKmh per road kind, footKmh, stepsKmh. */
  const ROUTING_PROVIDERS = {
    // Built-in: the district's OpenStreetMap roads in one static file (scripts/build-roads.mjs, ~140 KB gzipped,
    // fetched on the first "Show route"), routed on the visitor's device. No account, key or request limit, and the
    // trip never leaves the device. A point farther than maxSnapM from every road gets the straight blue line.
    builtin:{enabled:true, format:'local', provider:'OpenStreetMap', aboutUrl:'https://www.openstreetmap.org/copyright', dataLabel:'OpenStreetMap',
      graphUrl:'/assets/data/jaisalmer-roads.c4f565b5.json', profiles:{driving:'car', walking:'foot', auto:'car'}, minIntervalMs:0, timeoutMs:30000,
      maxSnapM:5000, footKmh:5, stepsKmh:2,
      carKmh:{motorway:80, trunk:60, primary:50, secondary:45, tertiary:35, link:35, unclassified:30, residential:18, living_street:10, service:12, track:15}},
    // FOSSGIS public OSRM — free, best-effort, NON-COMMERCIAL, ≈1 req/s, requests are logged. NOT for production.
    fossgis:{enabled:true, format:'osrm', provider:'OSRM · FOSSGIS', aboutUrl:'https://routing.openstreetmap.de/about.html', dataLabel:'OpenStreetMap',
      profiles:{driving:'https://routing.openstreetmap.de/routed-car/route/v1/driving/', walking:'https://routing.openstreetmap.de/routed-foot/route/v1/foot/',
        auto:'https://routing.openstreetmap.de/routed-car/route/v1/driving/'}},       // auto-rickshaw: no public auto profile → car network
    // Stadia Maps standard routing (Valhalla). Domain auth on the live site; add query:{api_key:'…'} for local testing.
    stadia:{enabled:true, format:'valhalla', provider:'Stadia Maps', aboutUrl:'https://stadiamaps.com/', dataLabel:'OpenStreetMap',
      endpoint:'https://api.stadiamaps.com/route/v1', profiles:{driving:'auto', walking:'pedestrian', auto:'auto'}, minIntervalMs:250,
      query:KEY('stadia')?{api_key:KEY('stadia')}:undefined},
    // Your own OSRM server (same API as FOSSGIS — no other change needed).
    osrm:{enabled:true, format:'osrm', provider:'OSRM', aboutUrl:'https://project-osrm.org/', dataLabel:'OpenStreetMap',
      profiles:{driving:'https://route.__SELFHOSTED_DOMAIN__/route/v1/driving/', walking:'https://route-foot.__SELFHOSTED_DOMAIN__/route/v1/foot/',
        auto:'https://route.__SELFHOSTED_DOMAIN__/route/v1/driving/'}, minIntervalMs:0},
    // Mapbox Directions (OSRM-style API). Mapbox terms tie Directions results to a Mapbox map: pair ONLY with tiles:'mapbox'.
    mapbox:{enabled:true, format:'osrm', provider:'Mapbox', aboutUrl:'https://www.mapbox.com/about/maps/', dataLabel:'Mapbox',
      profiles:{driving:'https://api.mapbox.com/directions/v5/mapbox/driving/', walking:'https://api.mapbox.com/directions/v5/mapbox/walking/',
        auto:'https://api.mapbox.com/directions/v5/mapbox/driving/'}, query:{access_token:KEY('mapbox')||'__MAPBOX_PUBLIC_TOKEN__'}, minIntervalMs:250,
      cacheSize:0},                                 // Mapbox terms restrict storing Directions results → no reuse, even in memory
    off:{enabled:false, provider:'', aboutUrl:'', dataLabel:'', profiles:{}}      // direct distance + Google/Apple links only
  };
  const unconfigured = v=>/__[A-Z_]+__/.test(JSON.stringify(v||''));
  if(!TILE_PROVIDERS[ACTIVE_PROVIDERS.tiles] || !ROUTING_PROVIDERS[ACTIVE_PROVIDERS.routing]) throw new Error('MAP: unknown provider in ACTIVE_PROVIDERS');

  /* MAP_CONFIG — every environment-specific value lives here. Changing the tile provider,
     navigation link, data source or clustering behaviour never touches search, filtering,
     markers, popups or itinerary code. */
  const MAP_CONFIG = {
    center:{lat:26.9124, lng:70.9127},          // Jaisalmer Fort area
    defaultZoom:13, minZoom:10, maxZoom:19,
    tile:TILE_PROVIDERS[ACTIVE_PROVIDERS.tiles],
    navigation:{
      // Outbound hyperlinks built from stored coordinates. No API, key or SDK is involved.
      // Google requires the comma between the coordinates as %2C — a bare comma gives "Unsupported link" in some Maps app versions.
      urlTemplate:'https://www.google.com/maps/dir/?api=1&destination={lat}%2C{lng}',
      fallbackTemplate:'https://www.openstreetmap.org/?mlat={lat}&mlon={lng}#map=17/{lat}/{lng}',
      // Only for curated places that have NO verified coordinates yet: a plain name search, never a guessed pin.
      searchTemplate:'https://www.google.com/maps/search/?api=1&query={q}'
    },
    data:{
      url:null,                                  // future admin/API feed: {"locations":[…], "providers":[…]}
      requireVerifiedProviders:true              // providers appear on the map only when verified === true
    },
    cluster:{radius:50, disableAtZoom:16, chunkedAbove:300},
    list:{pageSize:40},
    nearMe:{farKm:100, timeoutMs:10000, maxAgeMs:5*60*1000, accuracyCircleMaxM:3000, approximateAboveM:500, staleMs:5*60*1000},
    distance:{radiiKm:[1,3,5,10]},                 // "Within …" filter steps (straight-line, from the active starting point)
    // The active router (ROUTING_PROVIDERS) plus behaviour shared by every router.
    routing:Object.assign({timeoutMs:12000, minIntervalMs:1100, cacheSize:30, snapWarnM:150}, ROUTING_PROVIDERS[ACTIVE_PROVIDERS.routing]),
    seo:{jsonLd:true}
  };
  const CENTER = MAP_CONFIG.center;
  const FAR_KM = MAP_CONFIG.nearMe.farKm;      // beyond this, "My Location" won't re-centre away from Jaisalmer
  // Third-party map SDK — fetched ONLY when the map view is opened. Pinned + integrity-checked.
  const VENDOR = {
    css:[
      {href:'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', integrity:'sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H'},
      {href:'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css', integrity:'sha384-pmjIAcz2bAn0xukfxADbZIb3t8oRT9Sv0rvO+BR5Csr6Dhqq+nZs59P0pPKQJkEV'}
    ],
    js:[
      {src:'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', integrity:'sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH'},
      {src:'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js', integrity:'sha384-eXVCORTRlv4FUUgS/xmOyr66XBVraen8ATNLMESp92FKXLAMiKkerixTiBvXriZr'}
    ]
  };

  /* ------------------------------------------------------------
     DATA — one centralised source, four stages:
       raw records → normalizeLocation() → validateLocation() → search index
     Attractions come from ATTRACTIONS (single source of truth for names, tags and
     copy) + verified coordinates below + a few independently verified essential
     landmarks. Nothing is invented: no phone numbers, ratings, hours or
     verification badges. Fields left null simply aren't shown.
     PROVIDERS is deliberately empty — a business appears here only when it
     really exists in the Jaisalmer Visit database.
     ------------------------------------------------------------ */
  const CATS = [
    {id:'attractions', label:'Attractions',    color:'#B86F3C'},
    {id:'experiences', label:'Experiences',    color:'#202522'},
    {id:'food',        label:'Food',           color:'#8A4B2A'},
    {id:'shopping',    label:'Shopping',       color:'#C9A45C'},
    {id:'transport',   label:'Transport',      color:'#33392E'},
    {id:'essential',   label:'Essential',      color:'#B23C2A'},
    {id:'services',    label:'Local Services', color:'#9C5B33'}
  ];
  const CAT_BY_ID = {}, CAT_RANK = {}; CATS.forEach((c,i)=>{ CAT_BY_ID[c.id]=c; CAT_RANK[c.id]=i; });
  const SUBS = {
    attractions:['Fort & Havelis','Monuments','Historic Places','Lakes','Temples','Museums','Viewpoints','Sunrise Spots','Sunset Spots'],
    experiences:['Desert & Safari','Camel Safari','Sunset','Cultural Experiences','Hidden Places','Local Experiences'],
    food:['Restaurants','Cafés','Local Food','Rooftop Dining'],
    shopping:['Markets','Handicrafts','Souvenirs','Textiles'],
    transport:['Taxi','Auto','Bike Rental','Scooty Rental','Car Rental','Transfers','Railway Station','Airport','Bus Stand','Parking'],
    essential:['ATM','Toilet','Petrol Pump','Hospital','Pharmacy','Police','Emergency'],
    services:['Guides','Photographers','Safari Providers','Tourist Assistance','Local Providers']
  };
  const AREAS = {
    fort:{label:'Fort area', lat:26.9124, lng:70.9127},
    gadisar:{label:'Gadisar Lake', lat:26.9080, lng:70.9219},
    gandhi:{label:'Gandhi Chowk', lat:26.9135, lng:70.9146},
    sam:{label:'Sam Dunes', lat:26.9020, lng:70.6197},
    khuri:{label:'Khuri', lat:26.7167, lng:70.6167},
    badabagh:{label:'Bada Bagh', lat:26.9583, lng:70.8917},
    kuldhara:{label:'Kuldhara', lat:26.8339, lng:70.7864},
    dnp:{label:'Desert National Park', lat:26.8058, lng:70.6294},
    tanot:{label:'Tanot', lat:27.7984, lng:70.3545}
  };

  // Verified approximate coordinates for existing ATTRACTIONS entries.
  const ATTRACTION_GEO = VJData.get('ATTRACTION_GEO', {
    fort:    {ll:[26.9124,70.9127], cat:'attractions', sub:'Fort & Havelis'},
    patwon:  {ll:[26.9147,70.9138], cat:'attractions', sub:'Fort & Havelis'},
    salim:   {ll:[26.9106,70.9145], cat:'attractions', sub:'Fort & Havelis'},
    nathmal: {ll:[26.9142,70.9127], cat:'attractions', sub:'Fort & Havelis'},
    gadisar: {ll:[26.9080,70.9219], cat:'attractions', sub:'Lakes'},
    badabagh:{ll:[26.9583,70.8917], cat:'attractions', sub:'Monuments'},
    kuldhara:{ll:[26.8339,70.7864], cat:'attractions', sub:'Monuments'},
    dnp:     {ll:[26.8058,70.6294], cat:'experiences', sub:'Desert & Safari'},
    tanot:   {ll:[27.7984,70.3545], cat:'attractions', sub:'Temples'},   // Wikipedia: 27°47′54″N 70°21′16″E
    sam:     {ll:[26.9020,70.6197], cat:'experiences', sub:'Desert & Safari'},
    khuri:   {ll:[26.7167,70.6167], cat:'experiences', sub:'Desert & Safari'}
  });
  // Tourist Mode areas with no built-in point: centred on the place's pin once the admin sets one.
  [['sulidungri','Suli Dungar'],['warmuseum','War Museum']].forEach(([id, label])=>{
    const g = ATTRACTION_GEO[id];
    if(g && g.ll) AREAS[id] = {label, lat:g.ll[0], lng:g.ll[1]};
  });

  // Independently verified landmarks that are not part of ATTRACTIONS.
  const CURATED_PLACES = VJData.get('CURATED_PLACES', [
    {id:'gandhi-chowk', slug:'gandhi-chowk', type:'place', name:'Gandhi Chowk Market', category:'shopping', subcategory:'Markets', lat:26.9135, lng:70.9146,
      tag:'Market · Old City', aliases:['Gandhi Chowk'], keywords:['shopping','bazaar','textiles','leather','silver','street food','food'],
      short:"Jaisalmer's central old-city market — textiles, leather goods, silver and street food, a short walk from the fort."},
    {id:'railway', slug:'railway', type:'place', name:'Jaisalmer Railway Station', category:'transport', subcategory:'Railway Station', lat:26.9152, lng:70.9269,
      tag:'Transport · Railway', keywords:['train','station','railway','autos','taxis'],
      short:"The city's railway station, on the Jodhpur–Jaisalmer line. Autos and taxis are usually available just outside."},
    {id:'airport', slug:'airport', type:'place', name:'Jaisalmer Airport (JSA)', category:'transport', subcategory:'Airport', lat:26.8803, lng:70.8550,
      tag:'Transport · Airport', keywords:['flight','airport','flights','jsa'],
      short:"Domestic airport about 12–13 km from the city centre, operating on an Indian Air Force base."},
    {id:'jawahir-hospital', slug:'jawahir-hospital', type:'place', name:'Shri Jawahir Hospital', category:'essential', subcategory:'Hospital', lat:26.9165, lng:70.9072,
      tag:'Health · Government hospital', keywords:['hospital','doctor','medical','emergency','health'],
      short:"The district's main government hospital, CVS Colony — general medicine, pediatrics, gynaecology and more."},
    // Car parks mapped on OpenStreetMap (amenity=parking). Shown as blue "P" dots; the Parking button on a place opens the nearest one.
    {id:'parking-fort', slug:'parking-fort', type:'place', name:'Fort area parking', category:'transport', subcategory:'Parking', lat:26.91259, lng:70.91496,
      tag:'Parking · near the fort entrance', keywords:['parking','car park','fort parking','gopa chowk'],
      short:'Car parking about 250 m from Jaisalmer Fort. Location from OpenStreetMap; fees and hours aren\'t listed.'},
    {id:'parking-gadisar', slug:'parking-gadisar', type:'place', name:'Gadisar Lake parking', category:'transport', subcategory:'Parking', lat:26.91010, lng:70.92028,
      tag:'Parking · paid', keywords:['parking','car park','gadisar parking','lake parking'],
      short:'Paid surface car park near Gadisar Lake. Location from OpenStreetMap.'},
    {id:'parking-old-city-north', slug:'parking-old-city-north', type:'place', name:'Old city parking (north-west)', category:'transport', subcategory:'Parking', lat:26.91654, lng:70.90991,
      tag:'Parking · old city', keywords:['parking','car park'],
      short:'Car parking north-west of the fort. Location from OpenStreetMap; fees and hours aren\'t listed.'}
  ]);

  // Provider records (real businesses only) come from the Getting Around directory (TRANSPORT_PROVIDERS / feed),
  // which hands them over through JMMap.addLocations(list,{providers:true}) — one record, one id ("prov-<id>").
  // Accepted shape: {providerId|id, businessName, serviceCategory, subcategory, latitude, longitude, phone, whatsapp, description,
  //   shortDescription, verified, featured, rating, reviewCount, serviceAreas[], serviceTags[], profileUrl, navigationUrl, image, active}
  const PROVIDERS = [];
  const PROVIDER_MAP = {
    'local guide':{c:'services',s:'Guides'}, 'guides':{c:'services',s:'Guides'}, 'tour guide':{c:'services',s:'Guides'}, 'heritage guide':{c:'services',s:'Guides'}, 'desert guide':{c:'services',s:'Guides'}, 'guide':{c:'services',s:'Guides'},
    'photographer':{c:'services',s:'Photographers'}, 'travel photographer':{c:'services',s:'Photographers'}, 'wedding photographer':{c:'services',s:'Photographers'}, 'photography':{c:'services',s:'Photographers'},
    'camel safari':{c:'services',s:'Safari Providers'}, 'jeep safari':{c:'services',s:'Safari Providers'}, 'desert camp':{c:'services',s:'Safari Providers'}, 'experience provider':{c:'services',s:'Local Providers'},
    'taxi':{c:'transport',s:'Taxi'}, 'cab':{c:'transport',s:'Taxi'}, 'taxi & cab':{c:'transport',s:'Taxi'},
    'auto':{c:'transport',s:'Auto'}, 'auto rickshaw':{c:'transport',s:'Auto'},
    'bike rental':{c:'transport',s:'Bike Rental'}, 'scooty rental':{c:'transport',s:'Scooty Rental'}, 'car rental':{c:'transport',s:'Car Rental'},
    'transfers':{c:'transport',s:'Transfers'}, 'transfer':{c:'transport',s:'Transfers'}
  };
  function fromProvider(p){
    p = p || {};
    const pid = p.providerId!=null ? p.providerId : p.id;
    const label = String(p.serviceCategory||p.category||'').trim(), m = PROVIDER_MAP[label.toLowerCase()] || (/photo/i.test(label) ? {c:'services', s:'Photographers'} : {c:'services', s:'Local Providers'});
    return {id:'prov-'+pid, slug:'prov-'+pid, type:'provider', name:p.businessName, category:m.c, subcategory:m.s,
      lat:p.latitude, lng:p.longitude, phone:p.phone, whatsapp:p.whatsapp, short:p.shortDescription||p.description, description:p.shortDescription ? p.description : '',
      tag:m.c==='transport' ? 'Transport · '+m.s : (label ? 'Local service · '+label : 'Local service'),
      keywords:[label, p.subcategory].concat(p.serviceTags||[], p.serviceAreas||[]).filter(Boolean),
      serviceAreas:p.serviceAreas, serviceTags:p.serviceTags, image:p.image, featured:p.featured,
      verified:p.verified, rating:p.rating, reviewCount:p.reviewCount, profileUrl:p.profileUrl, navigationUrl:p.navigationUrl, active:p.active};
  }

  /* ---- normalisation + validation: nothing reaches the map without passing both ---- */
  const ID_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,80}$/;
  const txt = v=>(v==null ? '' : String(v)).trim();
  const num = v=>{ if(typeof v==='string' && v.trim()!=='') v = Number(v); return (typeof v==='number' && isFinite(v)) ? v : null; };
  function safeUrl(u){
    const s = txt(u); if(!s) return null;
    if(/^(\/(?!\/)|#)/.test(s)) return s;                                   // same-site path or hash
    try{ const x = new URL(s); return x.protocol==='https:' ? x.href : null; }catch(e){ return null; }
  }
  function safePhone(p){ const s = txt(p).replace(/[^\d+]/g,''); return /^\+?\d{7,15}$/.test(s) ? s : null; }
  function safeWhatsapp(v){ let d = txt(v).replace(/\D/g,''); if(d.length===10) d = '91'+d; return /^\d{11,15}$/.test(d) ? d : null; }   // wa.me needs a country code; bare 10-digit Indian mobiles get 91
  const strList = v=>(Array.isArray(v) ? v : []).map(txt).filter(Boolean);
  function normalizeLocation(r){
    if(!r || typeof r!=='object') return null;
    const rating = num(r.rating), rc = num(r.reviewCount);
    return {
      id:txt(r.id), slug:txt(r.slug||r.id), type:txt(r.type)||'place', refId:r.refId ? txt(r.refId) : null,
      name:txt(r.name), category:txt(r.category), subcategory:txt(r.subcategory)||null,
      lat:num(r.lat!=null ? r.lat : r.latitude), lng:num(r.lng!=null ? r.lng : r.longitude),
      tag:txt(r.tag), short:txt(r.short), description:txt(r.description), body:txt(r.body),
      aliases:[].concat(r.aliases||[]).map(txt).filter(Boolean),
      keywords:[].concat(r.keywords||[], r.tags||[], r.aliases||[]).map(txt).filter(Boolean),
      whatsapp:safeWhatsapp(r.whatsapp), serviceAreas:strList(r.serviceAreas), serviceTags:strList(r.serviceTags),
      reviewCount:(rc!=null && rc>=0) ? Math.floor(rc) : null,
      address:txt(r.address)||null, phone:safePhone(r.phone), website:safeUrl(r.website), image:safeUrl(r.image),
      profileUrl:safeUrl(r.profileUrl), navigationUrl:safeUrl(r.navigationUrl),
      openingInfo:txt(r.openingInfo)||null, bestTime:txt(r.bestTime)||null, duration:txt(r.duration)||null,
      featured:r.featured===true, verified:r.verified===true,
      rating:(rating!=null && rating>=0 && rating<=5) ? rating : null,
      active:r.active!==false, visible:r.visible!==false
    };
  }
  function validateLocation(l){
    if(!l) return 'not a record';
    if(!ID_RE.test(l.id)) return 'invalid id';
    if(!ID_RE.test(l.slug)) return 'invalid slug';
    if(!l.name) return 'missing name';
    if(l.lat==null || l.lng==null || l.lat<-90 || l.lat>90 || l.lng<-180 || l.lng>180) return 'invalid coordinates';
    if(!CAT_BY_ID[l.category]) return 'unknown category';
    if(l.active===false || l.visible===false) return 'inactive';
    if(l.type==='provider' && MAP_CONFIG.data.requireVerifiedProviders && !l.verified) return 'unverified provider';
    return null;
  }

  /* ---- local search index: weighted words, prefix + typo tolerant, no network ---- */
  const STOP = new Set(['near','in','at','the','a','an','around','nearby','me','to','for','of','and']);
  const SYN = {cab:['taxi'], rickshaw:['auto'], tuktuk:['auto'], eat:['food','restaurant'], dining:['food','restaurant'], atm:['cash'],
    scooter:['scooty'], motorbike:['bike'], doctor:['hospital'], chemist:['pharmacy'], train:['railway'], flight:['airport'],
    bazaar:['market'], bazar:['market'], stay:['camp'],
    photography:['photographer'], photoshoot:['photographer'], camera:['photographer'], shoot:['photographer']};
  const W = {name:10, sub:6, tag:6, kw:5, cat:4, body:2};
  const VOCAB = new Map();                    // word → strongest field weight it appears in
  function stem(w){ return (w.length>3 && w.charAt(w.length-1)==='s' && w.charAt(w.length-2)!=='s') ? w.slice(0,-1) : w; }
  function wordsOf(s){ return norm(s).split(/[^a-z0-9]+/).filter(Boolean).map(stem); }
  function indexLocation(l){
    const m = new Map();
    const put = (text,w)=>wordsOf(text).forEach(x=>{ if((m.get(x)||0)<w) m.set(x,w); });
    put(l.name,W.name); put(l.subcategory||'',W.sub); put(l.tag,W.tag); put(l.keywords.join(' '),W.kw);
    put(CAT_BY_ID[l.category].label,W.cat); put([l.short,l.description,l.body].join(' '),W.body);
    l._w = m; m.forEach((v,x)=>{ if((VOCAB.get(x)||0)<v) VOCAB.set(x,v); });
  }
  // Optimal-string-alignment distance (counts a swap like "fotr"→"fort" as one edit).
  function editDist(a,b,max){
    if(Math.abs(a.length-b.length)>max) return max+1;
    let p2=null, p=[], c;
    for(let j=0;j<=b.length;j++) p[j]=j;
    for(let i=1;i<=a.length;i++){
      c=[i];
      for(let j=1;j<=b.length;j++){
        c[j] = Math.min(p[j]+1, c[j-1]+1, p[j-1]+(a.charCodeAt(i-1)===b.charCodeAt(j-1)?0:1));
        if(i>1 && j>1 && a.charCodeAt(i-1)===b.charCodeAt(j-2) && a.charCodeAt(i-2)===b.charCodeAt(j-1)) c[j] = Math.min(c[j], p2[j-2]+1);
      }
      p2=p; p=c;
    }
    return p[b.length];
  }
  function matchWords(a){                     // vocabulary words a query word can stand for
    const out = [];
    VOCAB.forEach((v,w)=>{ if(w.indexOf(a)===0) out.push(w); });
    if(out.length || a.length<4) return out;  // fuzzy only when nothing matches exactly, and never for very short words
    const k = a.length>=8 ? 2 : 1;
    let top = 0;
    VOCAB.forEach((v,w)=>{
      if(w.length<4 || (editDist(a,w,k)>k && editDist(a,w.slice(0,a.length),k)>k)) return;
      if(v>top){ top = v; out.length = 0; }    // prefer words from names/tags over words buried in descriptions
      if(v===top) out.push(w);
    });
    return out;
  }
  function queryPlan(q){
    const toks = norm(q).split(/[^a-z0-9]+/).filter(t=>t && !STOP.has(t)).map(stem);
    if(!toks.length) return null;
    return toks.map(t=>{
      const ws = [];
      [t].concat(SYN[t]||[]).forEach(a=>matchWords(a).forEach(w=>{ if(ws.indexOf(w)<0) ws.push(w); }));
      return {t:t, ws:ws};
    });
  }
  function scoreLoc(l, plan){                 // 0 = no match; every query word must match
    let total = 0;
    for(let i=0;i<plan.length;i++){
      let best = 0;
      for(let j=0;j<plan[i].ws.length;j++){
        const w = plan[i].ws[j], v = l._w.get(w);
        if(v){ const s = v + (w===plan[i].t ? 2 : 0); if(s>best) best = s; }
      }
      if(!best) return 0;
      total += best;
    }
    return total + (l.featured ? 1 : 0);
  }

  const LOCATIONS = [], BY_ID = {}, BY_SLUG = {}, dataIssues = [];
  function ingest(list){
    let added = 0;
    (Array.isArray(list) ? list : []).forEach(raw=>{
      let l = null, why = null;
      try{ l = normalizeLocation(raw); why = validateLocation(l); }catch(e){ why = 'malformed'; }
      if(!why && (BY_ID[l.id] || BY_SLUG[l.slug])) why = 'duplicate id';
      if(why){ dataIssues.push({id:raw && raw.id, reason:why}); return; }
      indexLocation(l); LOCATIONS.push(l); BY_ID[l.id]=l; BY_SLUG[l.slug]=l; added++;
    });
    return added;
  }
  (function boot(){
    const raw = [];
    (typeof ATTRACTIONS !== 'undefined' && Array.isArray(ATTRACTIONS) ? ATTRACTIONS : []).forEach(a=>{
      const g = ATTRACTION_GEO[a.id]; if(!g) return;
      raw.push({id:'attr-'+a.id, slug:a.id, type:'attraction', refId:a.id, name:a.name, category:g.cat, subcategory:g.sub,
        lat:g.ll[0], lng:g.ll[1], tag:a.tag, short:a.short, bestTime:a.bestTime,
        body:[a.why, (a.see||[]).join(' '), (a.nearby||[]).join(' '), a.location].join(' ')});
    });
    ingest(raw.concat(CURATED_PLACES, PROVIDERS.map(fromProvider)));
  })();

  /* ------------------------------------------------------------
     SMALL HELPERS
     ------------------------------------------------------------ */
  function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function haversine(lat1,lng1,lat2,lng2){
    const R=6371, r=d=>d*Math.PI/180, dLat=r(lat2-lat1), dLng=r(lng2-lng1);
    const a=Math.sin(dLat/2)**2 + Math.cos(r(lat1))*Math.cos(r(lat2))*Math.sin(dLng/2)**2;
    return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
  function ratingText(l){ return l.rating==null ? '' : '★ '+l.rating.toFixed(1)+(l.reviewCount ? ' · '+l.reviewCount.toLocaleString('en-IN')+' review'+(l.reviewCount===1?'':'s') : ''); }
  function waUrl(l){ return 'https://wa.me/'+l.whatsapp+'?text='+encodeURIComponent('Hi, I found you on Jaisalmer Visit.'); }
  function emit(name, l){ if(window.JMTransport && JMTransport.track) JMTransport.track(name, {provider_id:String(l.id).replace(/^prov-/,''), source:'map'}); }
  // One distance implementation for the whole site (JMLocation); the local versions are only a safety net.
  const LOC = window.JMLocation || null;
  function calculateStraightLineDistance(origin, destination){
    if(LOC) return LOC.calculateStraightLineDistance(origin, destination);
    return (origin && destination && isFinite(origin.lat) && isFinite(origin.lng) && isFinite(destination.lat) && isFinite(destination.lng))
      ? haversine(origin.lat, origin.lng, destination.lat, destination.lng) : null;
  }
  function fmtKm(km){ return LOC ? LOC.formatDistance(km) : (km<1 ? (Math.round(km*100)*10)+' m' : km.toFixed(1)+' km'); }
  function fillCoords(tpl,l){ return tpl.replace(/\{lat\}/g,l.lat).replace(/\{lng\}/g,l.lng); }
  function navUrl(l){ return l.navigationUrl || fillCoords(MAP_CONFIG.navigation.urlTemplate, l); }
  function osmUrl(l){ return fillCoords(MAP_CONFIG.navigation.fallbackTemplate, l); }
  function linkAttrs(u){ return /^https?:/i.test(u) ? ' target="_blank" rel="noopener"' : ''; }
  function iconHtml(cat,px){ return '<svg class="mv-ico" width="'+px+'" height="'+px+'" viewBox="6.5 6.5 17 17" aria-hidden="true" focusable="false">'+glyphFor(cat)+'</svg>'; }
  // Highlight matched word-starts in a name/tag (plain-text safe: every fragment is escaped).
  function hl(text, toks){
    const s = String(text||''); if(!toks || !toks.length) return esc(s);
    const n = norm(s); if(n.length!==s.length) return esc(s);
    const on = new Array(s.length).fill(false);
    toks.forEach(t=>{ const re = new RegExp('(?:^|[^a-z0-9])('+t+')','g'); let m; while((m = re.exec(n))){ const at = m.index + m[0].length - t.length; for(let i=at;i<at+t.length;i++) on[i]=true; } });
    let html = '', i = 0;
    while(i<s.length){ let j = i; while(j<s.length && on[j]===on[i]) j++; const part = esc(s.slice(i,j)); html += on[i] ? '<mark>'+part+'</mark>' : part; i = j; }
    return html;
  }
  const SAVED_KEY = 'jm_saved_places';   // unchanged so existing saved places carry over
  function getSaved(){ try{ return new Set(JSON.parse(localStorage.getItem(SAVED_KEY)) || []); }catch(e){ return new Set(); } }
  function setSaved(set){ try{ localStorage.setItem(SAVED_KEY, JSON.stringify([...set])); }catch(e){} }
  const mqMobile = window.matchMedia('(max-width:899px)');
  const isMobile = ()=>mqMobile.matches;

  /* ------------------------------------------------------------
     STATE
     ------------------------------------------------------------ */
  const state = {cat:'all', sub:null, q:'', savedOnly:false, selected:null, area:null, near:null, userLoc:null, filtered:[], listLimit:MAP_CONFIG.list.pageSize, error:false,
    radius:null, sort:'auto', originKind:'auto', staleWarned:false};   // originKind: auto | user | place | none
  // Directions panel state (memory only). from/to: a location id or 'me'.
  const R = {open:false, from:'', to:'', mode:'driving', result:null, loading:false, err:null, layer:null, collapsed:false};
  let staleTimer = null;
  let routeOnOpen = false;                     // JMMap.directions(…, {locate:true}) before the map was open
  let view=null, el={}, viewOpen=false, canGoBack=false, bootRoute=true, lastTrigger=null, prevTitle='', inerted=[];
  let map=null, clusterGroup=null, userMarker=null, userAccuracy=null, remoteLoaded=false, mapReady=false, mapLoading=false, mapFailed=false, tileWarned=false;
  const markers = new Map();
  let locDenied=false, searchTimer=null, bannerTimer=null, panelReturnFocus=null;

  /* ------------------------------------------------------------
     ROUTING  —  #map · #map/<place> · #map?cat=food&sub=…&q=…&area=…
     One history entry is pushed when the map opens; in-map changes use
     replaceState, so Back returns to the page the visitor came from.
     ------------------------------------------------------------ */
  function parseHash(){
    const h = location.hash;
    if(!/^#map(?:[\/?]|$)/.test(h)) return null;
    const qi = h.indexOf('?');
    const path = qi>=0 ? h.slice(1,qi) : h.slice(1);
    const params = new URLSearchParams(qi>=0 ? h.slice(qi+1) : '');
    let id = null;
    try{ id = decodeURIComponent(path.split('/')[1] || '') || null; }catch(e){}
    const cat = params.get('cat'), sub = params.get('sub'), area = params.get('area'), near = params.get('near');
    const rad = Number(params.get('r')), to = params.get('to'), from = params.get('from'), mode = params.get('mode');
    return {
      radius: MAP_CONFIG.distance.radiiKm.indexOf(rad)>=0 ? rad : null,
      to: (to && BY_SLUG[to]) ? to : null,
      from: from==='me' ? 'me' : ((from && BY_SLUG[from]) ? from : null),
      mode: (mode && ROUTE_MODES[mode]) ? mode : null,
      near: (near && BY_SLUG[near]) ? near : null,
      id: id,
      cat: CAT_BY_ID[cat] ? cat : 'all',
      sub: (CAT_BY_ID[cat] && SUBS[cat].indexOf(sub)>=0) ? sub : null,
      q: (params.get('q')||'').slice(0,60),
      area: AREAS[area] ? area : null
    };
  }
  function syncHash(){
    if(!viewOpen) return;
    const p = new URLSearchParams();
    if(state.cat!=='all') p.set('cat', state.cat);
    if(state.sub) p.set('sub', state.sub);
    if(state.q) p.set('q', state.q);
    if(state.area) p.set('area', state.area);
    if(state.near) p.set('near', state.near);
    if(state.radius && refPoint()) p.set('r', state.radius);
    if(R.open){                                  // never coordinates — only place slugs and the word "me"
      const t = R.to && BY_ID[R.to]; if(t) p.set('to', t.slug);
      if(R.from==='me') p.set('from', 'me'); else if(R.from && BY_ID[R.from]) p.set('from', BY_ID[R.from].slug);
      if(R.mode!=='driving') p.set('mode', R.mode);
    }
    let h = '#map';
    const sel = state.selected && BY_ID[state.selected];
    if(sel) h += '/'+encodeURIComponent(sel.slug);
    const qs = p.toString(); if(qs) h += '?'+qs;
    if(location.hash !== h){
      try{ history.replaceState(history.state, '', location.pathname+location.search+h); }catch(e){}
    }
  }
  function route(){
    const r = parseHash();
    if(r) openView(r); else if(viewOpen) closeView();
  }
  function goBack(){
    if(canGoBack){ history.back(); return; }
    try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){}
    closeView();
  }

  /* ------------------------------------------------------------
     VIEW: build (once, on first open) / open / close
     ------------------------------------------------------------ */
  function build(){
    if(view) return;
    const tpl = document.getElementById('mapViewTemplate');
    view = tpl.content.firstElementChild.cloneNode(true);
    document.body.appendChild(view);
    const $ = id=>view.querySelector('#'+id);
    el = {
      title:$('mvTitle'), back:$('mvBack'), share:$('mvShare'), pill:$('mvTouristPill'),
      search:$('mvSearch'), clear:$('mvClear'), near:$('mvNear'), filters:$('mvFilters'), subs:$('mvSubFilters'),
      results:$('mvResults'), head:$('mvHead'), handle:$('mvHandle'), handleLabel:$('mvHandleLabel'), summary:$('mvSummary'),
      scroll:$('mvScroll'), list:$('mvList'), empty:$('mvEmpty'),
      map:$('touristMap'), mapState:$('mvMapState'), mapStateText:$('mvMapStateText'), retry:$('mvRetry'),
      banner:$('mvBanner'), bannerTitle:$('mvBannerTitle'), bannerText:$('mvBannerText'), bannerAction:$('mvBannerAction'), bannerClose:$('mvBannerClose'),
      panelOverlay:$('mapPanelOverlay'), panel:$('mapPanel'),
      origin:$('mvOrigin'), radius:$('mvRadius'), sort:$('mvSort'), toolsNote:$('mvToolsNote'),
      routeBtn:$('mvRouteBtn'), route:$('mvRoute'), routeTitle:$('mvRouteTitle'), routeMin:$('mvRouteMin'), routeClose:$('mvRouteClose'),
      routeLine:$('mvRouteLine'), routeBody:$('mvRouteBody'), routeFrom:$('mvRouteFrom'), routeTo:$('mvRouteTo'), routeSwap:$('mvRouteSwap'),
      routeModes:$('mvRouteModes'), routeOut:$('mvRouteOut'), routeGo:$('mvRouteGo'), routeGmaps:$('mvRouteGmaps'), routeApple:$('mvRouteApple'),
      routeClear:$('mvRouteClear'), routeFine:$('mvRouteFine')
    };

    el.search.placeholder = isMobile() ? 'Search Jaisalmer' : 'Search Jaisalmer — Fort, Kuldhara, Hospital, Camel Safari…';
    el.back.addEventListener('click', goBack);
    el.share.addEventListener('click', shareView);
    el.near.addEventListener('click', ()=>nearMe());
    el.retry.addEventListener('click', ()=>{ mapFailed=false; loadPromise=null; ensureMap(); });
    $('mvZoomIn').addEventListener('click', ()=>{ if(mapReady) map.zoomIn(); });
    $('mvZoomOut').addEventListener('click', ()=>{ if(mapReady) map.zoomOut(); });
    el.bannerClose.addEventListener('click', hideBanner);

    // search (debounced, no page reload)
    el.search.addEventListener('input', ()=>{
      el.clear.hidden = !el.search.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(()=>{ state.q = el.search.value.trim(); state.selected=null; applyFilters({fit:true}); }, 180);
    });
    el.search.addEventListener('keydown', e=>{
      if(e.key==='Enter'){
        e.preventDefault(); clearTimeout(searchTimer);
        state.q = el.search.value.trim(); applyFilters({fit:true});
        el.search.blur();
        if(state.filtered.length) select(state.filtered[0].id, {fromList:true});
      }
    });
    el.clear.addEventListener('click', ()=>{ el.search.value=''; el.clear.hidden=true; state.q=''; applyFilters({fit:true}); el.search.focus(); });

    // category + sub-category filters
    el.filters.addEventListener('click', e=>{
      const b = e.target.closest('button'); if(!b) return;
      if(b.hasAttribute('data-saved')){ state.savedOnly = !state.savedOnly; }
      else { state.savedOnly=false; state.cat=b.dataset.cat; state.sub=null; }
      state.selected=null; applyFilters({fit:true});
    });
    el.subs.addEventListener('click', e=>{
      const b = e.target.closest('button'); if(!b) return;
      state.sub = b.dataset.sub || null; state.selected=null; applyFilters({fit:true});
    });

    // results list (event delegation)
    el.list.addEventListener('click', e=>{
      if(e.target.closest('[data-more]')){
        const before = state.listLimit; state.listLimit += MAP_CONFIG.list.pageSize; renderList();
        const c = el.list.querySelectorAll('.mv-card')[before]; if(c) c.querySelector('.mv-card-main').focus({preventScroll:false});
        return;
      }
      const li = e.target.closest('.mv-card'); if(!li) return;
      const id = li.dataset.id;
      const act = e.target.closest('[data-act]');
      if(!act){ if(e.target.closest('.mv-card-main')) select(id,{fromList:true}); return; }
      if(act.dataset.act==='details') viewDetails(id);
      else if(act.dataset.act==='route') openRoute({to:id, auto:true});
      else if(act.dataset.act==='save') toggleSave(id, act);
    });
    el.empty.addEventListener('click', e=>{
      const b = e.target.closest('[data-empty]'); if(!b) return;
      if(b.dataset.empty==='all'){ resetFilters(); applyFilters({fit:true}); }
      else if(b.dataset.empty==='add'){ const f=document.getElementById('footerAddServiceBtn'); if(f) f.click(); }
      else if(b.dataset.empty==='reload'){ location.reload(); }
      else if(b.dataset.empty==='radius'){ state.radius = Number(b.dataset.r) || null; applyFilters({fitRef:true}); }
    });

    // list: phones get a bottom sheet (tap or swipe the handle area); computers a side panel, closed by default
    // so the whole map shows, opened and closed with the Show list / Hide list button
    let y0=null;
    el.head.addEventListener('click', e=>{ if(isMobile() || e.target.closest('#mvHandle')) setSheet(el.results.dataset.state==='open' ? 'peek' : 'open'); });
    el.head.addEventListener('touchstart', e=>{ y0 = e.touches[0].clientY; }, {passive:true});
    el.head.addEventListener('touchend', e=>{
      if(y0==null) return; const dy = e.changedTouches[0].clientY - y0; y0=null;
      if(dy<-24) setSheet('open'); else if(dy>24) setSheet('peek');
    }, {passive:true});
    mqMobile.addEventListener && mqMobile.addEventListener('change', ()=>{ if(mapReady) requestAnimationFrame(()=>map.invalidateSize()); });

    // details sheet dismiss
    el.panelOverlay.addEventListener('click', e=>{ if(e.target===el.panelOverlay) closePanel(); });

    // distance tools: starting point, radius, sort
    el.origin.addEventListener('change', ()=>{
      const v = el.origin.value;
      state.selected = null;
      if(v==='me'){
        state.originKind = 'user';
        if(state.userLoc){ applyFilters({fitRef:true}); return; }
        renderTools(); nearMe(); return;
      }
      if(v===''){ state.originKind = 'none'; state.near = null; }
      else if(v==='area'){ state.originKind = 'auto'; }
      else if(BY_ID[v]){ state.originKind = 'place'; state.near = BY_ID[v].slug; }
      applyFilters({fitRef:true});
    });
    el.radius.addEventListener('change', ()=>{ state.radius = Number(el.radius.value) || null; state.selected = null; applyFilters({fitRef:true}); });
    el.sort.addEventListener('change', ()=>{ state.sort = el.sort.value || 'auto'; applyFilters({}); });

    // directions panel
    const C = MAP_CONFIG.routing;
    el.routeModes.innerHTML = routeModesAvailable().map(m=>'<button type="button" class="mv-route-mode" data-mode="'+m+'" aria-pressed="false"><span aria-hidden="true">'+ROUTE_MODES[m].icon+'</span>'+esc(ROUTE_MODES[m].label)+'</button>').join('');
    el.routeModes.hidden = !routeModesAvailable().length;
    el.routeFine.innerHTML = (routeModesAvailable().length && C.format==='local')
      ? 'Routes are worked out on your device from <a href="'+esc(C.aboutUrl)+'" target="_blank" rel="noopener">OpenStreetMap</a> road data (© OpenStreetMap contributors). Your start and destination aren\'t sent anywhere.'
      : routeModesAvailable().length
      ? 'Routes by <a href="'+esc(C.aboutUrl)+'" target="_blank" rel="noopener">'+esc(C.provider)+'</a>'+(C.dataLabel ? ' using '+esc(C.dataLabel)+' data' : '')+'. “Show route” sends the start and end points to that service; Jaisalmer Visit doesn\'t store them.'
      : 'Distances and the blue direction line are worked out on your device. Use Google Maps or Apple Maps for turn-by-turn directions.';
    el.routeBtn.addEventListener('click', ()=>{ if(R.open) closeRoute(); else openRoute({}); });
    el.routeClose.addEventListener('click', ()=>closeRoute());
    el.routeMin.addEventListener('click', ()=>setRouteCollapsed(!R.collapsed));
    el.routeLine.addEventListener('click', ()=>setRouteCollapsed(false));
    const onEnd = which=>()=>{
      const v = (which==='from' ? el.routeFrom : el.routeTo).value;
      R[which] = v; R.err = null;
      if(R.layer) clearRouteLayer();
      if(v==='me' && !state.userLoc){
        renderRoute();
        nearMe({keepView:true}).then(ok=>{ if(!ok && R[which]==='me') R[which] = ''; renderRoute(); syncHash(); });
        return;
      }
      renderRoute(); syncHash();
    };
    el.routeFrom.addEventListener('change', onEnd('from'));
    el.routeTo.addEventListener('change', onEnd('to'));
    el.routeSwap.addEventListener('click', ()=>{
      const had = !!R.layer, t = R.from; R.from = R.to; R.to = t; R.err = null;
      if(had) clearRouteLayer(true);
      renderRoute(); syncHash();
      if(had && R.from && R.to) computeRoute();
    });
    el.routeModes.addEventListener('click', e=>{
      const b = e.target.closest('[data-mode]'); if(!b || b.dataset.mode===R.mode) return;
      const had = !!R.layer; R.mode = b.dataset.mode; R.err = null;
      if(had) clearRouteLayer(true);
      renderRoute(); syncHash();
      if(had) computeRoute();                    // a route was on screen: replace it with the new mode's route
    });
    el.routeGo.addEventListener('click', ()=>computeRoute());
    el.routeClear.addEventListener('click', ()=>{ clearRouteLayer(); R.result = null; R.err = null; renderRoute(); });
  }

  function touristModeOn(){ const b=document.getElementById('touristModeBtn'); return !!(b && b.classList.contains('active')); }
  function setInert(on){
    if(on){
      inerted = [...document.body.children].filter(n=>
        n!==view && n.tagName!=='SCRIPT' && n.tagName!=='TEMPLATE' && n.tagName!=='LINK' &&
        n.id!=='modalOverlay' && n.id!=='addServiceOverlay' && n.id!=='gaSheetOverlay' && !n.hasAttribute('inert'));
      inerted.forEach(n=>n.setAttribute('inert',''));
    } else { inerted.forEach(n=>n.removeAttribute('inert')); inerted=[]; }
  }

  function openView(r){
    const wasOpen = viewOpen;
    if(!wasOpen){ lastTrigger = document.activeElement; canGoBack = !bootRoute; prevTitle = document.title; }
    build();
    if(!wasOpen) loadRemoteData();
    viewOpen = true;
    view.hidden = false;
    document.documentElement.classList.add('mv-open');
    document.title = 'Smart Tourist Map — Jaisalmer Visit';
    if(!wasOpen) setInert(true);
    el.pill.hidden = !touristModeOn();

    // apply route state
    state.cat = r.cat; state.sub = r.sub; state.q = r.q; state.savedOnly = false; state.selected = null;
    state.area = r.area; state.near = r.near; state.radius = r.radius; state.originKind = 'auto';
    el.search.value = r.q; el.clear.hidden = !r.q;
    // Reuse a position the visitor already shared (on this page, or on this device in the last half hour) instead of
    // asking again — labelled with its age. When they've allowed location for this site it's refreshed silently.
    let reused = null;
    const granted = !!(LOC && LOC.permission && LOC.permission()==='granted');
    if(!wasOpen && !state.userLoc && LOC){
      const u = LOC.get();
      if(u && LOC.age() <= (LOC.REMEMBER_MS || MAP_CONFIG.nearMe.staleMs) && haversine(CENTER.lat,CENTER.lng,u.lat,u.lng) <= FAR_KM){ applyUserLoc(u); reused = u; }
    }
    applyFilters({fit:false, quiet:true});
    if(r.id && (BY_SLUG[r.id] || BY_ID[r.id])) select(r.id, {fromList:true, quiet:true});
    else if(mapReady) applyMapView();
    if(r.id && !(BY_SLUG[r.id] || BY_ID[r.id])){        // stale / unknown link: say so instead of silently showing the default view
      showBanner({title:'Location unavailable', text:'That place isn\'t on the map. Showing all places instead.', autoHide:6000});
      syncHash();
    }
    const go = routeOnOpen; routeOnOpen = false;
    if(r.to) openRoute({to:BY_SLUG[r.to].id, from:r.from==='me' ? 'me' : (r.from ? BY_SLUG[r.from].id : ''), mode:r.mode, quiet:true, auto:go, locate:go});
    else if(R.open) closeRoute(true);
    if(!wasOpen && granted && (!reused || LOC.age() > 60000)) nearMe({quiet:true, keepView:true});   // no prompt: already allowed
    else if(reused && granted) startLiveLocation();
    if(reused && !(granted && LOC.age() > 60000)){
      const mins = Math.round(LOC.age()/60000);
      showBanner({text:'Using the location you shared '+(mins<1 ? 'just now' : mins+' min ago')+'.', action:'Update', onAction:()=>nearMe({force:true}), autoHide:6000});
    }
    if(!wasOpen){ clearInterval(staleTimer); staleTimer = setInterval(checkStale, 30000); }

    if(!wasOpen){
      if(isMobile()) setSheet('peek');
      ensureMap();
      try{ el.title.focus({preventScroll:true}); }catch(e){}
    } else if(mapReady){ map.invalidateSize(); }
  }

  function closeView(){
    if(!viewOpen) return;
    viewOpen = false;
    clearTimeout(searchTimer); clearTimeout(bannerTimer); clearInterval(staleTimer); staleTimer = null;
    closePanel(true);
    closeRoute(true);                           // stops any route request in flight and removes the route line
    stopLiveLocation();
    if(mapReady) map.closePopup();
    view.hidden = true;
    document.documentElement.classList.remove('mv-open');
    document.title = prevTitle || document.title;
    setInert(false);
    state.selected = null;
    state.userLoc = null;                       // the map's copy; JMLocation keeps the shared one
    if(el.near) el.near.classList.remove('is-on');
    if(mapReady){ if(userMarker){ map.removeLayer(userMarker); userMarker=null; } if(userAccuracy){ map.removeLayer(userAccuracy); userAccuracy=null; } }
    if(lastTrigger && document.contains(lastTrigger) && lastTrigger.focus){ try{ lastTrigger.focus({preventScroll:true}); }catch(e){} }
    lastTrigger = null;
  }

  /* ------------------------------------------------------------
     FILTERING + RENDERING
     ------------------------------------------------------------ */
  function hasActiveFilter(){ return state.cat!=='all' || !!state.sub || !!state.q || state.savedOnly || !!(state.radius && refPoint()); }
  function resetFilters(){
    state.cat='all'; state.sub=null; state.q=''; state.savedOnly=false; state.radius=null;
    if(el.search){ el.search.value=''; el.clear.hidden=true; }
  }
  // The active starting point for every distance in the list, cards, popups and the "Within" filter.
  // Never substituted: with no location and no chosen place there is simply no distance.
  function refPoint(){
    const k = state.originKind;
    if(k==='none') return null;
    if(state.userLoc && k!=='place') return {lat:state.userLoc.lat, lng:state.userLoc.lng, kind:'user', label:'your location'};
    if(k==='user') return null;
    if(state.near && BY_SLUG[state.near]){ const n = BY_SLUG[state.near]; return {lat:n.lat, lng:n.lng, kind:'place', label:n.name, id:n.id}; }
    if(k==='auto' && state.area && AREAS[state.area]) return {lat:AREAS[state.area].lat, lng:AREAS[state.area].lng, kind:'area', label:AREAS[state.area].label};
    return null;
  }
  // Straight-line distance label — always marked "direct" so it is never mistaken for a road distance.
  function distText(l){
    const ref = refPoint(); if(!ref) return '';
    const d = calculateStraightLineDistance(ref, l);
    if(d==null || d<0.05) return '';         // don't say "0 m from" the place itself
    return fmtKm(d) + (ref.kind==='user' ? ' away' : ' from '+ref.label) + ' · direct';
  }
  function computeFiltered(){
    const plan = queryPlan(state.q), saved = state.savedOnly ? getSaved() : null;
    let list = LOCATIONS.filter(l=>l.visible!==false);
    if(saved) list = list.filter(l=>saved.has(l.id));
    if(state.cat!=='all') list = list.filter(l=>l.category===state.cat);
    if(state.sub) list = list.filter(l=>l.subcategory===state.sub);
    if(plan) list = list.filter(l=>{ l._s = scoreLoc(l, plan); return l._s>0; });
    else list.forEach(l=>{ l._s = 0; });
    const ref = refPoint(), tourist = touristModeOn();
    list.forEach(l=>{ l._d = ref ? haversine(ref.lat, ref.lng, l.lat, l.lng) : null; });   // local maths only — no network
    if(ref && state.radius) list = list.filter(l=>l._d <= state.radius);
    const sort = (!ref && (state.sort==='near' || state.sort==='far')) ? 'auto' : state.sort;
    const byName = (a,b)=>a.name.localeCompare(b.name);
    // Order: explicit sort choice, else relevance (when searching) → distance (when a reference point exists) → Tourist Mode priority.
    return list.slice().sort((a,b)=>{
      if(sort==='name') return byName(a,b);
      if(sort==='cat') return (CAT_RANK[a.category]-CAT_RANK[b.category]) || (ref ? a._d-b._d : byName(a,b));
      if(sort==='near') return (a._d-b._d) || byName(a,b);
      if(sort==='far') return (b._d-a._d) || byName(a,b);
      if(plan && a._s!==b._s) return b._s-a._s;
      if(ref && a._d!==b._d) return a._d-b._d;
      if(tourist && !ref && CAT_RANK[a.category]!==CAT_RANK[b.category]) return CAT_RANK[a.category]-CAT_RANK[b.category];
      return 0;
    });
  }

  function applyFilters(opts){
    opts = opts || {};
    state.error = false;
    try{ state.filtered = computeFiltered(); }catch(err){ state.filtered = []; state.error = true; }
    state.listLimit = MAP_CONFIG.list.pageSize;
    renderFilters(); renderSubs(); renderTools(); renderList();
    if(mapReady){
      try{ syncMarkers(); if(opts.fitRef) fitToRef(); else if(opts.fit) fitToResults(false); }catch(err){}
    }
    if(!opts.quiet) syncHash();
  }

  function renderFilters(){
    const savedSet = getSaved(), sl = el.filters.scrollLeft, saved = LOCATIONS.filter(l=>savedSet.has(l.id)).length;
    const chips = [{id:'all', label:'All', emoji:''}].concat(CATS).map(c=>{
      const on = !state.savedOnly && state.cat===c.id;
      return '<button type="button" class="mv-chip'+(on?' is-active':'')+'" data-cat="'+c.id+'" aria-pressed="'+on+'">'+
        (c.id!=='all'?iconHtml(c.id,18):'')+esc(c.label)+'</button>';
    });
    chips.push('<button type="button" class="mv-chip'+(state.savedOnly?' is-active':'')+'" data-saved="1" aria-pressed="'+state.savedOnly+'"><span aria-hidden="true">'+(state.savedOnly?'♥':'♡')+'</span>Saved'+(saved?' ('+saved+')':'')+'</button>');
    el.filters.innerHTML = chips.join('');
    el.filters.scrollLeft = sl;
    const active = el.filters.querySelector('.is-active');
    if(active && (el.filters.scrollWidth > el.filters.clientWidth)){
      const b = active.getBoundingClientRect(), c = el.filters.getBoundingClientRect();
      if(b.left < c.left || b.right > c.right) el.filters.scrollLeft += (b.left + b.width/2) - (c.left + c.width/2);
    }
  }
  function renderSubs(){
    const show = !state.savedOnly && state.cat!=='all';
    const subs = show ? SUBS[state.cat].filter(s=>LOCATIONS.some(l=>l.visible!==false && l.category===state.cat && l.subcategory===s)) : [];
    if(subs.length<2){ el.subs.hidden = true; el.subs.innerHTML=''; return; }
    el.subs.hidden = false;
    const sl = el.subs.scrollLeft;
    el.subs.innerHTML = ['All '+CAT_BY_ID[state.cat].label].concat(subs).map((s,i)=>{
      const val = i===0 ? '' : s, on = (state.sub||'')===val;
      return '<button type="button" class="mv-subchip'+(on?' is-active':'')+'" data-sub="'+esc(val)+'" aria-pressed="'+on+'">'+esc(s)+'</button>';
    }).join('');
    el.subs.scrollLeft = sl;
    const active = el.subs.querySelector('.is-active');               // e.g. "Parking", opened from a place: keep it in sight
    if(active && el.subs.scrollWidth > el.subs.clientWidth){
      const b = active.getBoundingClientRect(), c = el.subs.getBoundingClientRect();
      if(b.left < c.left || b.right > c.right) el.subs.scrollLeft += (b.left + b.width/2) - (c.left + c.width/2);
    }
  }

  function cardHtml(l, saved, toks){
    const cat = CAT_BY_ID[l.category], sel = l.id===state.selected, isSaved = saved.has(l.id), d = distText(l), id = esc(l.id);
    const primary = (l.type==='provider' && l.profileUrl)
      ? '<a class="mv-act primary" data-act="profile" href="'+esc(l.profileUrl)+'"'+linkAttrs(l.profileUrl)+' aria-label="View profile of '+esc(l.name)+'">View Profile</a>'
      : '<button type="button" class="mv-act primary" data-act="details" aria-label="View details for '+esc(l.name)+'">View Details</button>';
    return '<li class="mv-card'+(sel?' is-selected':'')+'" data-id="'+id+'" style="--pin:'+cat.color+'">'+
      '<button type="button" class="mv-card-main"'+(sel?' aria-current="true"':'')+' aria-label="Show '+esc(l.name)+' on the map">'+
        '<span class="mv-card-ico" aria-hidden="true">'+iconHtml(l.category,24)+'</span>'+
        '<span class="mv-card-body">'+
          '<span class="mv-card-tag">'+hl(l.tag||cat.label, toks)+(l.verified?'<span class="mv-verified">Verified</span>':'')+'</span>'+
          '<span class="mv-card-name">'+hl(l.name, toks)+'</span>'+
          (l.short?'<span class="mv-card-short">'+esc(l.short)+'</span>':'')+
          ((d||l.rating!=null)?'<span class="mv-card-dist">'+(l.rating!=null?esc(ratingText(l))+(d?' · ':''):'')+esc(d)+'</span>':'')+
        '</span></button>'+
      '<div class="mv-card-actions">'+primary+
        '<button type="button" class="mv-act" data-act="route" aria-label="Directions to '+esc(l.name)+'">Directions</button>'+
        '<a class="mv-act" data-act="dir" href="'+esc(navUrl(l))+'" target="_blank" rel="noopener" aria-label="Navigate to '+esc(l.name)+'">Navigate</a>'+
        (l.phone?'<a class="mv-act" data-act="call" href="tel:'+esc(l.phone)+'" aria-label="Call '+esc(l.name)+'">Call</a>':'')+
        (l.whatsapp?'<a class="mv-act" data-act="whatsapp" href="'+esc(waUrl(l))+'" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp '+esc(l.name)+'">WhatsApp</a>':'')+
        '<button type="button" class="mv-act save" data-act="save" aria-pressed="'+isSaved+'" aria-label="Save '+esc(l.name)+'">'+(isSaved?'♥ Saved':'♡ Save')+'</button>'+
      '</div></li>';
  }

  function renderList(){
    const list = state.filtered, n = list.length;
    let ctx = '';
    if(state.savedOnly) ctx = 'Saved';
    else if(state.sub) ctx = state.sub;
    else if(state.cat!=='all') ctx = CAT_BY_ID[state.cat].label;
    if(state.q) ctx += (ctx?' · ':'')+'“'+state.q+'”';
    const ref = refPoint(), SORT_TXT = {near:'nearest first', far:'farthest first', name:'A–Z', cat:'by category'};
    const sk = state.sort==='auto' ? (ref ? 'near' : null) : ((!ref && (state.sort==='near' || state.sort==='far')) ? null : state.sort);
    const tail = (ref && state.radius ? ' · within '+state.radius+' km' : '') + (sk ? ' · '+SORT_TXT[sk] : '');
    el.summary.textContent = n+' '+(n===1?'place':'places')+(ctx?' · '+ctx:'')+tail;

    const saved = getSaved();     // read storage once per render, not once per card
    const toks = norm(state.q).split(/[^a-z0-9]+/).filter(x=>x.length>1 && !STOP.has(x));
    const hlToks = toks.concat(toks.map(stem)).filter((x,i,a)=>a.indexOf(x)===i);
    const shown = list.slice(0, state.listLimit);
    let html = shown.map(l=>cardHtml(l, saved, hlToks)).join('');
    if(n>shown.length) html += '<li class="mv-more"><button type="button" class="mv-act" data-more>Show more places ('+(n-shown.length)+' left)</button></li>';
    el.list.innerHTML = html;
    el.list.hidden = !n;
    if(n){ el.empty.hidden = true; el.empty.innerHTML=''; return; }

    // graceful empty / error states
    let out;
    if(state.error){
      out = '<strong>Search isn\'t working right now.</strong>Clear the search or pick another category.'+
        '<div class="mv-empty-actions"><button type="button" class="mv-act primary" data-empty="all">Show all places</button></div>';
    } else if(!LOCATIONS.length){
      out = '<strong>Place data couldn\'t be loaded.</strong>Check your connection and refresh the page.'+
        '<div class="mv-empty-actions"><button type="button" class="mv-act primary" data-empty="reload">Refresh</button></div>';
    } else if(state.savedOnly){
      out = '<strong>No saved places yet.</strong>Tap ♡ Save on any place and it will appear here — stored on this device only.'+
        '<div class="mv-empty-actions"><button type="button" class="mv-act primary" data-empty="all">Explore all</button></div>';
    } else if(refPoint() && state.radius){
      const ref = refPoint(), wider = MAP_CONFIG.distance.radiiKm.filter(r=>r>state.radius)[0];
      out = '<strong>Nothing within '+state.radius+' km '+(ref.kind==='user' ? 'of you' : 'of '+esc(ref.label))+' in this selection.</strong>'+
        'This list covers places listed on Jaisalmer Visit, not every business in the area.'+
        '<div class="mv-empty-actions">'+(wider ? '<button type="button" class="mv-act primary" data-empty="radius" data-r="'+wider+'">Within '+wider+' km</button>' : '')+
        '<button type="button" class="mv-act'+(wider?'':' primary')+'" data-empty="radius" data-r="">Any distance</button></div>';
    } else {
      const q = norm(state.q);
      let help = '';
      if(/taxi|auto|rickshaw|bike|scooty|rental|car|driver|cab/.test(q) || (state.cat==='transport'))
        help = '<a class="mv-act" href="#transport">Getting around guide</a>';
      else if(/camel|jeep|safari|camp|sunset|dune/.test(q))
        help = '<a class="mv-act" href="#things-to-do">Things to do</a>';
      const providerish = state.cat==='services' || /photo|camera|taxi|auto|rickshaw|guide|camel|jeep|safari|camp|rental|bike|scooty|driver|cab|car/.test(q);
      out = '<strong>No matching places found.</strong>Try another search or category.'+
        '<div class="mv-empty-actions"><button type="button" class="mv-act primary" data-empty="all">Explore all</button>'+
        (providerish ? '<button type="button" class="mv-act" data-empty="add">Add your service</button>' : '')+help+'</div>';
    }
    el.empty.innerHTML = out; el.empty.hidden = false;
  }

  function markSelected(scroll){
    el.list.querySelectorAll('.mv-card').forEach(li=>{
      const on = li.dataset.id===state.selected;
      li.classList.toggle('is-selected', on);
      const b = li.querySelector('.mv-card-main');
      if(on) b.setAttribute('aria-current','true'); else b.removeAttribute('aria-current');
      if(on && scroll && !isMobile()) li.scrollIntoView({block:'nearest'});
    });
  }

  function toggleSave(id, btn){
    const set = getSaved(); const name = BY_ID[id].name;
    if(set.has(id)) set.delete(id); else set.add(id);
    setSaved(set);
    const on = set.has(id);
    btn.setAttribute('aria-pressed', String(on)); btn.textContent = on ? '♥ Saved' : (btn.id==='mapPanelSave' ? '♡ Save Place' : '♡ Save');
    if(state.savedOnly && !on){ applyFilters({}); } else { renderFilters(); }
  }

  /* ------------------------------------------------------------
     SELECTION, DETAILS, POPUP
     ------------------------------------------------------------ */
  function select(idOrSlug, opts){
    opts = opts || {};
    const loc = BY_ID[idOrSlug] || BY_SLUG[idOrSlug]; if(!loc) return;
    if(!state.filtered.some(l=>l.id===loc.id)){ resetFilters(); state.filtered = computeFiltered(); state.listLimit = MAP_CONFIG.list.pageSize; renderFilters(); renderSubs(); renderList(); if(mapReady) syncMarkers(); }
    state.selected = loc.id;
    const at = state.filtered.findIndex(l=>l.id===loc.id);
    if(at >= state.listLimit){ state.listLimit = at+1; renderList(); }   // make sure the card exists in the list
    markSelected(true);
    if(isMobile()) setSheet('peek');
    if(mapReady) focusMarker(loc);
    if(!opts.quiet) syncHash();
  }
  function focusMarker(loc){
    const m = markerFor(loc);
    map.invalidateSize();
    if(!clusterGroup.hasLayer(m)) clusterGroup.addLayer(m);
    // Jump straight to a zoom at which this marker is drawn on its own. (The cluster plugin's animated
    // zoomToShowLayer() can leave the marker detached, so no popup ever opened when a list card was tapped.)
    const parentZoom = m.__parent && typeof m.__parent._zoom==='number' ? m.__parent._zoom : MAP_CONFIG.cluster.disableAtZoom-1;
    const z = Math.min(map.getMaxZoom(), Math.max(map.getZoom(), 14, parentZoom+1));
    map.setView([loc.lat,loc.lng], z, {animate:false});
    openPopupWhenShown(m, 25);
  }
  // openPopup() silently does nothing until the marker is attached to the map, and the cluster plugin
  // attaches markers a moment after a zoom — so wait (briefly, bounded) for it.
  function openPopupWhenShown(m, tries){
    if(!mapReady || (state.selected && markers.get(state.selected)!==m)) return;   // selection moved on
    if(m._map){ m.openPopup(); return; }
    if(tries>0) setTimeout(()=>openPopupWhenShown(m, tries-1), 60);
  }
  function deselect(){
    state.selected = null; markSelected(false);
    if(mapReady) map.closePopup();
    syncHash();
  }
  function viewDetails(id){
    const loc = BY_ID[id]; if(!loc) return;
    if(loc.refId && typeof ATTRACTIONS !== 'undefined' && typeof openModal === 'function'){
      const a = ATTRACTIONS.find(x=>x.id===loc.refId);
      if(a){ closePanel(true); openModal(a); return; }
    }
    if(state.selected!==loc.id) select(loc.id, {fromList:true});
    openPanel(loc);
  }

  function buildPopup(loc){
    const cat = CAT_BY_ID[loc.category], box = document.createElement('div'), prov = loc.type==='provider';
    box.className = 'mv-pop';
    const facts = [];
    if(loc.openingInfo) facts.push('Hours: '+loc.openingInfo);
    if(loc.duration) facts.push('Duration: '+loc.duration);
    if(!prov && loc.rating!=null) facts.push('★ '+loc.rating.toFixed(1));
    const park = isParking(loc);
    const primary = (prov && loc.profileUrl)
      ? '<a class="mv-pop-btn primary" data-pop="profile" href="'+esc(loc.profileUrl)+'"'+linkAttrs(loc.profileUrl)+'>View Profile</a>'
      : (prov || park ? '' : '<button type="button" class="mv-pop-btn primary" data-pop="details">View Details</button>');
    const nav = '<a class="mv-pop-btn" data-pop="nav" href="'+esc(navUrl(loc))+'" target="_blank" rel="noopener">Navigate</a>';
    const routeB = park ? '<button type="button" class="mv-pop-btn primary" data-pop="route"><span aria-hidden="true">🧭</span> Directions</button>'
                        : '<button type="button" class="mv-pop-btn" data-pop="route">Directions</button>';
    const dist = distText(loc);
    const callA = loc.phone ? '<a class="mv-pop-btn" data-pop="call" href="tel:'+esc(loc.phone)+'">Call</a>' : '';
    const waA = loc.whatsapp ? '<a class="mv-pop-btn" data-pop="whatsapp" href="'+esc(waUrl(loc))+'" target="_blank" rel="noopener noreferrer">WhatsApp</a>' : '';
    let contact = '', contactRow = '';
    if(prov && callA && waA){
      contact = '<button type="button" class="mv-pop-btn" data-pop="contact" aria-expanded="false">Contact</button>';
      contactRow = '<div class="mv-pop-actions mv-pop-contact" hidden>'+callA+waA+'</div>';
    } else contact = callA || waA;
    box.innerHTML =
      '<div class="mv-pop-tag">'+esc(loc.tag||cat.label)+(loc.verified?'<span class="mv-verified">✓ Verified</span>':'')+'</div>'+
      '<div class="mv-pop-name">'+esc(loc.name)+'</div>'+
      (prov && loc.rating!=null ? '<p class="mv-pop-facts">'+esc(ratingText(loc))+'</p>' : '')+
      (prov && loc.serviceAreas.length ? '<p class="mv-pop-facts">📍 '+esc(loc.serviceAreas.slice(0,3).join(' · '))+'</p>' : '')+
      (loc.short?'<p class="mv-pop-short">'+esc(loc.short)+'</p>':'')+
      (facts.length?'<p class="mv-pop-facts">'+facts.map(esc).join(' · ')+'</p>':'')+
      (dist?'<p class="mv-pop-facts mv-pop-dist">📍 '+esc(dist)+'</p>':'')+
      '<div class="mv-pop-actions">'+primary+routeB+(prov ? nav+contact : contact+nav)+'</div>'+contactRow;
    const b = box.querySelector('[data-pop="details"]'); if(b) b.addEventListener('click', ()=>viewDetails(loc.id));
    // Parking: always from where the visitor is now (asks for location on this tap), drawn as the blue line.
    box.querySelector('[data-pop="route"]').addEventListener('click', ()=>openRoute(park ? {to:loc.id, from:'me', auto:true, locate:true} : {to:loc.id, auto:true}));
    const cb = box.querySelector('[data-pop="contact"]');
    if(cb) cb.addEventListener('click', ()=>{
      const row = box.querySelector('.mv-pop-contact'), open = row.hidden;
      row.hidden = !open; cb.setAttribute('aria-expanded', String(open));
    });
    if(prov) box.addEventListener('click', e=>{
      const a = e.target.closest('[data-pop]'); if(!a) return;
      const ev = {call:'call_provider', whatsapp:'whatsapp_provider', nav:'navigate_provider', profile:'view_profile', contact:'view_provider'}[a.dataset.pop];
      if(ev) emit(ev, loc);
    });
    return box;
  }

  /* place details sheet — for places without a destination page (and "What's nearby") */
  function openPanel(loc){
    if(!panelReturnFocus) panelReturnFocus = document.activeElement;
    const saved = getSaved().has(loc.id);
    const nearby = LOCATIONS.filter(l=>l.id!==loc.id && l.visible!==false)
      .map(l=>({l:l, d:haversine(loc.lat,loc.lng,l.lat,l.lng)})).filter(x=>x.d<=6).sort((a,b)=>a.d-b.d).slice(0,5);
    const d = distText(loc);
    const facts = [['Hours',loc.openingInfo],['Best time',loc.bestTime],['Duration',loc.duration],
      ['Rating',ratingText(loc)||null],['Service area',(loc.serviceAreas && loc.serviceAreas.length) ? loc.serviceAreas.join(' · ') : null],['Status',loc.verified ? 'Verified by Jaisalmer Visit' : null]].filter(f=>f[1]);
    const coords = loc.lat.toFixed(5)+', '+loc.lng.toFixed(5);
    el.panel.innerHTML =
      '<button class="map-panel-close" id="mapPanelClose" type="button" aria-label="Close details">&times;</button>'+
      '<div class="map-panel-tag">'+esc(loc.tag||CAT_BY_ID[loc.category].label)+'</div>'+
      '<h3>'+esc(loc.name)+'</h3>'+
      (d?'<div class="map-panel-meta">📍 '+esc(d)+'</div>':'')+
      (loc.short?'<p class="map-panel-desc">'+esc(loc.short)+'</p>':'')+
      (loc.description?'<p class="map-panel-desc">'+esc(loc.description)+'</p>':'')+
      (loc.address?'<p class="map-panel-desc">'+esc(loc.address)+'</p>':'')+
      (facts.length?'<dl class="map-panel-facts">'+facts.map(f=>'<div><dt>'+esc(f[0])+'</dt><dd>'+esc(f[1])+'</dd></div>').join('')+'</dl>':'')+
      '<div class="map-panel-actions">'+
        '<a class="map-btn primary" href="'+esc(navUrl(loc))+'" target="_blank" rel="noopener">Navigate</a>'+
        '<button type="button" class="map-btn secondary" id="mapPanelRoute">Directions</button>'+
        (loc.phone?'<a class="map-btn secondary" href="tel:'+esc(loc.phone)+'">Call</a>':'')+
        (loc.whatsapp?'<a class="map-btn secondary" href="'+esc(waUrl(loc))+'" target="_blank" rel="noopener noreferrer">WhatsApp</a>':'')+
        ((loc.type==='provider' && loc.profileUrl)?'<a class="map-btn secondary" href="'+esc(loc.profileUrl)+'"'+linkAttrs(loc.profileUrl)+'>View Profile</a>':'')+
        '<button type="button" class="map-btn secondary'+(saved?' is-saved':'')+'" id="mapPanelSave">'+(saved?'♥ Saved':'♡ Save Place')+'</button>'+
        '<button type="button" class="map-btn secondary" id="mapPanelShare">Share</button>'+
        (loc.refId?'<button type="button" class="map-btn secondary" id="mapPanelDetails">View Details</button>':'')+
      '</div>'+
      '<p class="map-panel-coords"><span>'+esc(coords)+'</span><a href="'+esc(osmUrl(loc))+'" target="_blank" rel="noopener">Open in OpenStreetMap</a><button type="button" id="mapPanelCopy">Copy coordinates</button></p>'+
      (nearby.length?'<div class="map-panel-nearby"><h5>What\'s Nearby?</h5>'+nearby.map(x=>
        '<button type="button" class="map-nearby-row" data-id="'+esc(x.l.id)+'"><span>'+esc(x.l.name)+'</span><span class="meta">'+fmtKm(x.d)+'</span></button>').join('')+'</div>':'');
    el.panel.querySelector('#mapPanelClose').addEventListener('click', ()=>closePanel());
    el.panel.querySelector('#mapPanelSave').addEventListener('click', e=>{ toggleSave(loc.id, e.currentTarget); e.currentTarget.classList.toggle('is-saved', getSaved().has(loc.id)); });
    el.panel.querySelector('#mapPanelShare').addEventListener('click', ()=>shareView());
    el.panel.querySelector('#mapPanelRoute').addEventListener('click', ()=>{ closePanel(true); openRoute({to:loc.id, auto:true}); });
    el.panel.querySelector('#mapPanelCopy').addEventListener('click', e=>{
      const b = e.currentTarget, text = loc.lat+', '+loc.lng;
      const done = ()=>{ b.textContent = 'Copied'; setTimeout(()=>{ b.textContent = 'Copy coordinates'; }, 1800); };
      if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, ()=>window.prompt('Copy coordinates', text));
      else window.prompt('Copy coordinates', text);
    });
    const dt = el.panel.querySelector('#mapPanelDetails'); if(dt) dt.addEventListener('click', ()=>viewDetails(loc.id));
    el.panel.querySelectorAll('.map-nearby-row').forEach(row=>row.addEventListener('click', ()=>{
      const n = BY_ID[row.dataset.id]; if(n){ select(n.id,{fromList:true}); openPanel(n); }
    }));
    el.panelOverlay.classList.add('open');
    el.panel.querySelector('#mapPanelClose').focus();
  }
  function closePanel(silent){
    if(!el.panelOverlay || !el.panelOverlay.classList.contains('open')) { panelReturnFocus=null; return; }
    el.panelOverlay.classList.remove('open');
    if(!silent && panelReturnFocus && document.contains(panelReturnFocus)){ try{ panelReturnFocus.focus({preventScroll:true}); }catch(e){} }
    panelReturnFocus = null;
  }

  /* ------------------------------------------------------------
     LIST: bottom sheet on phones, side panel on computers ('peek' = closed)
     ------------------------------------------------------------ */
  function setSheet(s){
    el.results.dataset.state = s;
    el.handle.setAttribute('aria-expanded', String(s==='open'));
    el.handleLabel.textContent = s==='open' ? 'Hide list' : 'Show list';
    if(mapReady) map.invalidateSize();   // map area resizes as the sheet opens/closes
  }

  /* ------------------------------------------------------------
     MAP — loaded on demand (Leaflet + OSM tiles, no API key)
     ------------------------------------------------------------ */
  function glyphFor(cat){
    const s='stroke="#202522" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"';
    switch(cat){
      case 'attractions': return '<path d="M8 18l4-6 3 4 2-3 5 5H8Z" '+s+'/><circle cx="18" cy="9" r="1.5" fill="#202522"/>';
      case 'experiences': return '<path d="M7 16c2-3 5-3 7 0s5 3 7 0" '+s+'/>';
      case 'food':        return '<path d="M11 8v5a2 2 0 0 0 4 0V8M13 8v11M19 8c-2 1-3 3-3 6h3v5" '+s+'/>';
      case 'shopping':    return '<path d="M9 12h12l-1.6 7a1 1 0 0 1-1 .8H11.6a1 1 0 0 1-1-.8L9 12Z" '+s+'/><path d="M11.5 12l1.5-3M18.5 12L17 9" '+s+'/>';
      case 'transport':   return '<path d="M15 8l3.4 8-3.4-2.2L11.6 16 15 8Z" fill="#202522"/>';
      case 'essential':   return '<path d="M15 9v11M9.5 14.5h11" stroke="#202522" stroke-width="2.1" stroke-linecap="round"/>';
      case 'services':    return '<circle cx="15" cy="11" r="2.1" fill="#202C2A"/><path d="M9.5 20c0-3.2 2.6-4.8 5.5-4.8s5.5 1.6 5.5 4.8" '+s+'/>';
      default:            return '<circle cx="15" cy="14" r="2" fill="#202C2A"/>';
    }
  }
  function pinHtml(cat){
    return '<div class="jm-pin"><svg viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
      '<path d="M15 0C6.7 0 0 6.6 0 14.7 0 25 15 38 15 38S30 25 30 14.7C30 6.6 23.3 0 15 0Z" fill="'+CAT_BY_ID[cat].color+'"/>'+
      '<circle cx="15" cy="14.5" r="9.2" fill="rgba(255,255,255,0.95)"/>'+glyphFor(cat)+'</svg></div>';
  }
  // Parking: the familiar blue "P" sign as a dot; the selected one pulses so it's found at a glance.
  const isParking = l=>!!l && /parking/i.test(l.subcategory || '');
  const parkingPinHtml = '<div class="jm-pin is-parking"><span class="jm-park-ring" aria-hidden="true"></span><svg viewBox="0 0 30 30" aria-hidden="true">'+
    '<circle cx="15" cy="15" r="12.5" fill="'+'#1A73E8'+'" stroke="#fff" stroke-width="3"/>'+
    '<path d="M12 21.5V8.5h4.1a3.9 3.9 0 0 1 0 7.8H12" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
  const userPinHtml = '<div class="jm-pin is-user"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="#2E7BD6" stroke="#fff" stroke-width="2.5"/></svg></div>';

  let loadPromise = null;
  function loadVendor(){
    const cssReady = ()=>VENDOR.css.every(v=>{ const l = document.querySelector('link[href="'+v.href+'"]'); return !!(l && l.dataset.jmLoaded==='1'); });
    if(window.L && L.markerClusterGroup && cssReady()) return Promise.resolve();
    if(loadPromise) return loadPromise;
    const css = VENDOR.css.map(v=>new Promise((res,rej)=>{
      // Only a stylesheet that actually loaded counts. A failed <link> is removed (below), so "Try again"
      // re-requests it instead of mistaking it for loaded and drawing the map without Leaflet's CSS.
      const have = document.querySelector('link[href="'+v.href+'"]');
      if(have && have.dataset.jmLoaded==='1') return res();
      if(have) have.remove();
      const l = document.createElement('link');
      l.rel='stylesheet'; l.href=v.href; l.integrity=v.integrity; l.crossOrigin='anonymous';
      l.onload=()=>{ l.dataset.jmLoaded='1'; res(); }; l.onerror=()=>{ l.remove(); rej(new Error('css')); };
      document.head.appendChild(l);
    }));
    const script = src=>new Promise((res,rej)=>{
      const s = document.createElement('script');
      s.src=src.src; s.integrity=src.integrity; s.crossOrigin='anonymous';
      s.onload=res; s.onerror=()=>{ s.remove(); rej(new Error('js')); };
      document.body.appendChild(s);
    });
    // Leaflet first, then the cluster plugin (which needs the L global). On a retry after a partial
    // failure, Leaflet itself is not downloaded and executed a second time.
    const js = (window.L ? Promise.resolve() : script(VENDOR.js[0])).then(()=>(window.L && L.markerClusterGroup) ? null : script(VENDOR.js[1]));
    loadPromise = Promise.all(css.concat([js])).then(()=>{});
    loadPromise.catch(()=>{ loadPromise=null; });
    return loadPromise;
  }

  const IS_LOCAL_FILE = location.protocol==='file:';   // no Referer possible → referer-checked providers (OSM, Stadia domain auth) refuse tiles
  const TILE_BLOCKED_LOCALLY = IS_LOCAL_FILE && MAP_CONFIG.tile.needsReferer!==false;
  function addPreconnect(){       // warm up the tile host while the map library downloads
    const u = (TILE_BLOCKED_LOCALLY || unconfigured(MAP_CONFIG.tile.url)) ? null : MAP_CONFIG.tile.preconnect; if(!u || document.querySelector('link[rel="preconnect"][href="'+u+'"]')) return;
    const l = document.createElement('link'); l.rel = 'preconnect'; l.href = u; l.crossOrigin = ''; document.head.appendChild(l);
  }
  function setMapState(s){
    if(s==='ready'){ el.mapState.hidden = true; return; }
    el.mapState.hidden = false;
    el.mapState.classList.toggle('is-error', s==='error');
    el.retry.hidden = s!=='error';
    el.mapStateText.textContent = s==='error'
      ? 'Map unavailable right now. You can still browse locations from the list.'
      : 'Loading Jaisalmer map…';
  }

  function ensureMap(){
    if(mapReady || mapLoading || mapFailed) return;
    mapLoading = true; setMapState('loading'); addPreconnect();
    loadVendor().then(()=>{ mapLoading=false; createMap(); }).catch(()=>{
      mapLoading=false; mapFailed=true; setMapState('error');
      setSheet('open');   // make the fallback list immediately visible
    });
  }

  function makeMarker(loc){
    const park = isParking(loc);
    const m = L.marker([loc.lat,loc.lng], {
      icon:park ? L.divIcon({html:parkingPinHtml, className:'', iconSize:[30,30], iconAnchor:[15,15], popupAnchor:[0,-14]})
                : L.divIcon({html:pinHtml(loc.category), className:'', iconSize:[30,38], iconAnchor:[15,38], popupAnchor:[0,-34]}),
      title:loc.name, alt:loc.name, riseOnHover:true, zIndexOffset:park ? 400 : 0
    });
    m.bindPopup(()=>buildPopup(loc), {minWidth:210, maxWidth:260, autoPanPaddingTopLeft:[16,16], autoPanPaddingBottomRight:[72,16]});   // popup DOM is built only when opened
    m.on('add', ()=>{ const n=m.getElement(); if(n) n.setAttribute('aria-label', loc.name+', '+(loc.tag||CAT_BY_ID[loc.category].label)); });
    m.on('popupopen', ()=>{ const n=m.getElement(); if(n) n.classList.add('is-selected'); });
    m.on('popupclose', ()=>{ const n=m.getElement(); if(n) n.classList.remove('is-selected'); });
    m.on('click', ()=>{ state.selected=loc.id; markSelected(true); if(isMobile()) setSheet('peek'); syncHash(); });
    m._jmId = loc.id;
    return m;
  }
  function markerFor(loc){                  // markers are created lazily, only for places that are actually shown
    let m = markers.get(loc.id);
    if(!m){ m = makeMarker(loc); markers.set(loc.id, m); }
    return m;
  }

  function createMap(){
    try{
      const T = MAP_CONFIG.tile, C = MAP_CONFIG.cluster;
      map = L.map(el.map, {zoomControl:false, minZoom:MAP_CONFIG.minZoom, maxZoom:MAP_CONFIG.maxZoom})
        .setView([CENTER.lat,CENTER.lng], MAP_CONFIG.defaultZoom);
      const LP = T.localPreview || {};
      const missingKey = unconfigured(T.url);
      if(missingKey) console.error('MAP: tile provider "'+ACTIVE_PROVIDERS.tiles+'" has no key/URL configured — set it in the admin under Settings → Map — map background disabled.');
      const src = missingKey ? null : (!TILE_BLOCKED_LOCALLY ? T : (LP.url ? LP : null));
      if(src){
        const opt = {maxZoom:MAP_CONFIG.maxZoom, maxNativeZoom:src.maxNativeZoom || 19, subdomains:src.subdomains || 'abc',
          attribution:src.attribution || T.attribution, referrerPolicy:T.referrerPolicy || 'strict-origin-when-cross-origin'};
        if(src.tileSize){ opt.tileSize = src.tileSize; opt.zoomOffset = src.zoomOffset || 0; }   // e.g. 512px tiles: tileSize 512, zoomOffset -1
        const tiles = L.tileLayer(src.url, opt).addTo(map);
        tiles.on('tileerror', ()=>{
          if(tileWarned) return; tileWarned = true;
          showBanner({title:'Map tiles couldn\'t load', text:'Check your connection — the list below still works.'});
        });
        if(src===T) checkTileAccess(tiles, opt);
      } else {
        // Opened from disk: no background tiles (they would all read "Access blocked"). Places, your location,
        // routes and distances still work on the plain sand background.
        el.map.classList.add('is-local-file');
        map.attributionControl.addAttribution(T.attribution);
        showBanner(missingKey
          ? {title:'Map background isn\'t configured', text:'Places, distances and routes still work. (Site owner: add the tile provider key in MAP_CONFIG.)'}
          : {title:'Map background is off in local preview',
             text:'This page was opened directly from your computer (file://), and the map tile provider only serves tiles to pages opened from a web address. Open it from your website or a local server (e.g. http://localhost) and the map appears. Places, distances and routes still work here.'});
      }
      clusterGroup = L.markerClusterGroup({
        maxClusterRadius:C.radius, disableClusteringAtZoom:C.disableAtZoom, showCoverageOnHover:false,
        iconCreateFunction:c=>L.divIcon({html:'<div class="jm-cluster">'+c.getChildCount()+'</div>', className:'', iconSize:[38,38], iconAnchor:[19,19]})
      });
      map.addLayer(clusterGroup);
      map.on('popupclose', e=>{
        const src = e.popup && e.popup._source, id = src && src._jmId;
        if(id && state.selected===id){ state.selected=null; markSelected(false); syncHash(); }
      });
      mapReady = true;
      setMapState('ready');
      map.invalidateSize();
      syncUserMarker(); syncMarkers(); applyMapView();
      if(R.open && R.result){ const a = endpoint(R.from), b = endpoint(R.to); if(a && b) drawRoute(R.result, a, b); }   // worked out before the map was ready
      if(!navigator.onLine) showBanner({text:"You're offline — map tiles may not load, but the list still works."});
    }catch(err){
      mapFailed = true; setMapState('error');
      setSheet('open');
    }
  }

  /* A provider that refuses this site (key missing/wrong, domain not registered) still answers every tile with an
     image — "401 Error · Invalid Authentication" — which Leaflet can't tell from a real tile. Ask for one tile
     first; on 401/403 switch to OpenStreetMap so visitors always see a usable map. */
  function checkTileAccess(layer, opt){
    if(ACTIVE_PROVIDERS.tiles==='osm' || typeof fetch!=='function') return;
    try{
      const T = MAP_CONFIG.tile, z = Math.round(map.getZoom()) + (opt.zoomOffset || 0), n = Math.pow(2, z), r = CENTER.lat*Math.PI/180;
      const url = L.Util.template(T.url, {s:String(opt.subdomains || 'a').charAt(0), z:z, r:'',
        x:Math.floor((CENTER.lng+180)/360*n), y:Math.floor((1 - Math.log(Math.tan(r) + 1/Math.cos(r))/Math.PI)/2*n)});
      fetch(url, {mode:'cors', credentials:'omit', referrerPolicy:opt.referrerPolicy}).then(res=>{
        if(res.status!==401 && res.status!==403) return;
        console.error('MAP: tile provider "'+ACTIVE_PROVIDERS.tiles+'" refused this site (HTTP '+res.status+') — showing OpenStreetMap tiles instead. '+
          'Fix it in the admin (Settings → Map): register this domain with the provider or paste a valid key.');
        if(!map || !map.hasLayer(layer)) return;
        const O = TILE_PROVIDERS.osm;
        map.removeLayer(layer);
        L.tileLayer(O.url, {maxZoom:MAP_CONFIG.maxZoom, maxNativeZoom:O.maxNativeZoom, attribution:O.attribution, referrerPolicy:O.referrerPolicy}).addTo(map);
      }).catch(()=>{});                          // offline / blocked: nothing to decide
    }catch(e){}
  }

  function syncMarkers(){
    if(!mapReady) return;
    clusterGroup.options.chunkedLoading = state.filtered.length > MAP_CONFIG.cluster.chunkedAbove;   // keeps the UI responsive with hundreds of places
    clusterGroup.clearLayers();
    clusterGroup.addLayers(state.filtered.map(l=>markerFor(l)));
  }
  // Preserve the current position/zoom when results are already in view; only move when they aren't.
  function fitToResults(force){
    if(!mapReady || !state.filtered.length) return;
    map.invalidateSize();
    const b = map.getBounds();
    if(force || !state.filtered.some(l=>b.contains([l.lat,l.lng]))){
      map.fitBounds(L.latLngBounds(state.filtered.map(l=>[l.lat,l.lng])), {padding:[50,50], maxZoom:15, animate:false});
    }
  }
  function applyMapView(){
    if(!mapReady) return;
    map.invalidateSize();
    const sel = state.selected && BY_ID[state.selected];
    if(sel){ focusMarker(sel); return; }
    if(state.near && !state.userLoc && BY_SLUG[state.near]){          // opened from a place: stay centred on it, include the nearest results
      const n = BY_SLUG[state.near];
      const close = state.filtered.filter(l=>l.id!==n.id).slice(0, 8);   // already sorted nearest-first by refPoint()
      if(hasActiveFilter() && close.length) map.fitBounds(L.latLngBounds([[n.lat,n.lng]].concat(close.map(l=>[l.lat,l.lng]))), {padding:[50,50], maxZoom:16, animate:false});
      else map.setView([n.lat,n.lng], 15, {animate:false});
      return;
    }
    if(state.area && !state.userLoc){ const a=AREAS[state.area]; map.setView([a.lat,a.lng], 14, {animate:false}); return; }
    if(hasActiveFilter()) fitToResults(true);
  }

  /* ------------------------------------------------------------
     NEAR ME — only ever requested from an explicit tap; coordinates
     stay in memory, are never shown, stored, or sent anywhere.
     ------------------------------------------------------------ */
  function syncUserMarker(){
    if(!mapReady) return;
    const u0 = state.userLoc, showAcc = !!(u0 && u0.acc && u0.acc <= MAP_CONFIG.nearMe.accuracyCircleMaxM);
    if(u0 && userMarker && (!!userAccuracy)===showAcc){            // live update: just move the blue dot
      userMarker.setLatLng([u0.lat,u0.lng]);
      if(userAccuracy){ userAccuracy.setLatLng([u0.lat,u0.lng]); userAccuracy.setRadius(u0.acc); }
      return;
    }
    if(userMarker){ map.removeLayer(userMarker); userMarker=null; }
    if(userAccuracy){ map.removeLayer(userAccuracy); userAccuracy=null; }
    if(state.userLoc){
      const u = state.userLoc;
      if(u.acc && u.acc <= MAP_CONFIG.nearMe.accuracyCircleMaxM){
        userAccuracy = L.circle([u.lat,u.lng], {radius:u.acc, color:'#2E7BD6', weight:1, fillColor:'#2E7BD6', fillOpacity:0.12, interactive:false}).addTo(map);
      }
      userMarker = L.marker([u.lat,u.lng], {
        icon:L.divIcon({html:userPinHtml, className:'', iconSize:[22,22], iconAnchor:[11,11]}),
        interactive:false, keyboard:false, zIndexOffset:1000
      }).addTo(map);
    }
  }
  function applyUserLoc(u){
    state.userLoc = {lat:u.lat, lng:u.lng, acc:(u.acc!=null && isFinite(u.acc)) ? u.acc : null, ts:(u.ts && isFinite(u.ts)) ? u.ts : Date.now()};
    state.staleWarned = false;
    el.near.classList.add('is-on');
    syncUserMarker();
  }
  // "My Location": one explicit, one-time request through the shared JMLocation (no watchPosition, no tracking).
  // opts.force → ignore a recent fix; opts.keepView → don't move the map or the list (used by Directions).
  // Resolves true when a usable position is in place, false otherwise.
  // opts.quiet → no banners and no sheet change (the silent refresh when the map opens and location is already allowed).
  function nearMe(opts){
    opts = opts || {};
    const N = MAP_CONFIG.nearMe;
    if(!LOC){ if(!opts.quiet) showLocationError({code:'unsupported'}); return Promise.resolve(false); }
    el.near.setAttribute('aria-busy','true');
    if(!opts.quiet) showBanner({text:'Finding your location…'});
    return LOC.request({maxAgeMs:opts.force ? 0 : N.maxAgeMs, timeoutMs:N.timeoutMs}).then(u=>{
      el.near.removeAttribute('aria-busy');
      if(!viewOpen) return false;
      if(haversine(CENTER.lat,CENTER.lng,u.lat,u.lng) > FAR_KM){
        state.userLoc = null; el.near.classList.remove('is-on'); syncUserMarker();
        if(state.originKind==='user') state.originKind = 'auto';
        applyFilters({}); renderRoute();
        if(!opts.quiet) showBanner({title:'You seem to be outside Jaisalmer', text:'Distances from where you are wouldn\'t help here, so the map stays on the city. Choose a starting place under “Distances from” instead.'});
        return false;
      }
      applyUserLoc(u);
      startLiveLocation();
      if(opts.quiet){                            // list distances only: markers and an open popup stay put
        const keep = state.selected;
        state.filtered = computeFiltered(); renderTools(); renderList();
        if(keep){ state.selected = keep; markSelected(false); }
        renderRoute();
        return true;
      }
      state.originKind = 'user';
      applyFilters({});
      renderRoute();
      const acc = state.userLoc.acc;
      if(mapReady && !opts.keepView && !R.open) map.setView([u.lat,u.lng], (acc!=null && acc>1000) ? 13 : 14, {animate:false});
      if(isMobile() && !opts.keepView && !R.open) setSheet('open');
      if(acc!=null && acc > N.approximateAboveM){
        showBanner({title:'Your location accuracy is limited', text:'Your device reports about '+fmtKm(acc/1000)+' of accuracy, so distances may be approximate.', autoHide:7000});
      } else {
        showBanner({text:'Showing distances from your location'+(acc!=null ? ' (accurate to about '+fmtKm(acc/1000)+')' : '')+'.', autoHide:3500});
      }
      return true;
    }, err=>{
      el.near.removeAttribute('aria-busy');
      if(viewOpen && !opts.quiet){
        if(state.originKind==='user' && !state.userLoc){ state.originKind = 'auto'; applyFilters({}); }
        showLocationError(err); renderTools(); renderRoute();
      }
      return false;
    });
  }
  // While the map is open and the visitor has allowed location, keep the blue dot (and a straight direction line
  // from "me") following them — no new prompts, no network. Stops when the map closes.
  let stopLive = null, liveFiltered = null;
  function startLiveLocation(){
    if(stopLive || !LOC || !LOC.watch) return;
    stopLive = LOC.watch(u=>{
      if(!viewOpen || haversine(CENTER.lat,CENTER.lng,u.lat,u.lng) > FAR_KM) return;
      applyUserLoc(u);
      // list distances only (markers and an open popup stay as they are)
      const moved = liveFiltered ? haversine(liveFiltered.lat, liveFiltered.lng, u.lat, u.lng) : Infinity;
      if(moved > 0.15){ liveFiltered = u; renderList(); renderTools(); }
      if(R.open && R.result && R.result.straight && (R.from==='me' || R.to==='me')){
        const a = endpoint(R.from), b = endpoint(R.to);
        if(a && b){ R.result = Object.assign({}, R.result, {key:routeKey(a, b, R.mode), distanceKm:calculateStraightLineDistance(a, b), geometry:[[a.lat,a.lng],[b.lat,b.lng]]});
          drawRoute(R.result, a, b, true); }
        renderRoute();
      } else if(R.open && R.result && MAP_CONFIG.routing.format==='local' && (R.from==='me' || R.to==='me')){
        // built-in routes are worked out on the device at no cost: keep the road route starting at the blue dot
        const a = endpoint(R.from), b = endpoint(R.to), mode = R.mode;
        if(a && b) getRouteInformation(a, b, mode).then(info=>{
          if(!R.open || !R.result || R.result.straight || R.mode!==mode || routeKey(endpoint(R.from), endpoint(R.to), mode)!==info.key) return;
          R.result = info; drawRoute(info, a, b, true); renderRoute();
        }, ()=>renderRoute());
      } else if(R.open) renderRoute();
    });
  }
  function stopLiveLocation(){ if(stopLive){ stopLive(); stopLive = null; } liveFiltered = null; }
  function showLocationError(err){
    const code = err && err.code;
    const M = {
      denied:{title:'Location access is blocked', text:(LOC && LOC.blockedHelp ? LOC.blockedHelp(LOC.permission()) : 'Tap the icon left of the web address → Permissions (or Site settings) → Location → Allow, then reload the page.')+' You can still choose a starting place under “Distances from”.'},
      unavailable:{title:'We couldn\'t detect your location', text:'Please try again — outdoors or with Wi-Fi on usually helps.'},
      timeout:{title:'Finding your location took too long', text:'Please try again.'},
      unsupported:{title:'Location isn\'t available', text:'This browser can\'t share a location. Choose a starting place under “Distances from” instead.'},
      insecure:{title:'Location needs a secure connection', text:'Location access generally requires HTTPS or localhost. Choose a starting place under “Distances from” instead.'}
    }[code] || {title:'We couldn\'t detect your location', text:'Please try again.'};
    const retry = code!=='unsupported' && code!=='insecure';
    showBanner({title:M.title, text:M.text, action:retry ? 'Try again' : null, onAction:retry ? ()=>nearMe({force:true}) : null});
  }
  // A position is only "current" for a few minutes — after that it is labelled as last known, with a one-tap refresh.
  function checkStale(){
    if(!viewOpen || !state.userLoc || state.staleWarned) return;
    const age = Date.now() - state.userLoc.ts;
    if(age <= MAP_CONFIG.nearMe.staleMs) return;
    state.staleWarned = true;
    showBanner({title:'Your location may be out of date', text:'It was found '+Math.round(age/60000)+' min ago, so distances may have changed.', action:'Update', onAction:()=>nearMe({force:true})});
    renderTools(); renderRoute();
  }

  /* ------------------------------------------------------------
     DISTANCE TOOLS — starting point, "Within" radius, sort (all local)
     ------------------------------------------------------------ */
  let optCache = {n:-1, html:''};
  function placeOptionsHtml(){                   // every mapped place, grouped by category (no geocoding needed)
    if(optCache.n===LOCATIONS.length) return optCache.html;
    const html = CATS.map(c=>{
      const items = LOCATIONS.filter(l=>l.visible!==false && l.category===c.id).sort((a,b)=>a.name.localeCompare(b.name));
      return items.length ? '<optgroup label="'+esc(c.label)+'">'+items.map(l=>'<option value="'+esc(l.id)+'">'+esc(l.name)+'</option>').join('')+'</optgroup>' : '';
    }).join('');
    optCache = {n:LOCATIONS.length, html:html};
    return html;
  }
  function renderTools(){
    if(!el.origin) return;
    const ref = refPoint();
    const key = LOCATIONS.length+'|'+(state.area||'')+'|'+(state.userLoc ? 1 : 0);
    if(el.origin.dataset.key!==key){
      el.origin.innerHTML = '<option value="">Not set</option><option value="me">'+(state.userLoc ? '📍 My location' : '📍 Use my location')+'</option>'+
        (state.area && AREAS[state.area] ? '<option value="area">'+esc('Area: '+AREAS[state.area].label)+'</option>' : '')+placeOptionsHtml();
      el.origin.dataset.key = key;
    }
    el.origin.value = !ref ? '' : ref.kind==='user' ? 'me' : ref.kind==='area' ? 'area' : (ref.id || '');
    el.radius.value = state.radius ? String(state.radius) : '';
    el.radius.disabled = !ref;
    el.radius.title = ref ? '' : 'Choose a starting point first';
    [].forEach.call(el.sort.options, o=>{ if(o.value==='near' || o.value==='far') o.disabled = !ref; });
    el.sort.value = (!ref && (state.sort==='near' || state.sort==='far')) ? 'auto' : state.sort;
    el.toolsNote.hidden = !ref;
    if(ref){
      const u = ref.kind==='user' ? state.userLoc : null, age = u ? Date.now()-u.ts : 0;
      el.toolsNote.textContent = 'Distances are straight-line (direct) — roads are usually longer; use Directions for a route.'+
        (u && u.acc!=null && u.acc>MAP_CONFIG.nearMe.approximateAboveM ? ' Your location is approximate (about '+fmtKm(u.acc/1000)+').' : '')+
        (u && age>MAP_CONFIG.nearMe.staleMs ? ' Your location was found '+Math.round(age/60000)+' min ago.' : '');
    }
  }
  function fitToRef(){
    const ref = refPoint();
    if(!mapReady) return;
    if(!ref) return fitToResults(false);
    map.invalidateSize();
    const pts = [[ref.lat,ref.lng]].concat(state.filtered.slice(0, 60).map(l=>[l.lat,l.lng]));
    if(pts.length===1) map.setView(pts[0], 15, {animate:false});
    else map.fitBounds(L.latLngBounds(pts), {padding:[50,50], maxZoom:16, animate:false});
  }

  /* ------------------------------------------------------------
     DIRECTIONS — direct distance (on device) · road/path route (routing
     provider, only on "Show route") · external navigation (Google / Apple).
     ------------------------------------------------------------ */
  const ROUTE_BLUE = '#1A73E8';               // the blue line visitors know from phone maps
  const ARRIVED_KM = 0.04;                    // "You've arrived" when the blue dot is this close to the destination
  const ROUTE_MODES = {
    driving:{label:'Drive', icon:'🚗', verb:'driving', road:'Road distance',    gmaps:'driving',   apple:'d',  color:ROUTE_BLUE, roadBased:true},
    walking:{label:'Walk',  icon:'🚶', verb:'walking', road:'Walking distance', gmaps:'walking',   apple:'w',  color:ROUTE_BLUE},
    auto:   {label:'Auto',  icon:'🛺', verb:'auto-rickshaw', road:'Road distance', gmaps:'driving', apple:'d', color:ROUTE_BLUE, roadBased:true}
  };
  const ROUTING_READY = (()=>{ const C = MAP_CONFIG.routing; if(!C.enabled) return false;
    if(unconfigured([C.profiles, C.endpoint, C.query])){ console.error('MAP: routing provider "'+ACTIVE_PROVIDERS.routing+'" has no key/URL configured — set it in the admin under Settings → Map — route drawing disabled; direct distance and Google/Apple links still work.'); return false; }
    return true; })();
  function routeModesAvailable(){ const C = MAP_CONFIG.routing; return ROUTING_READY ? Object.keys(ROUTE_MODES).filter(m=>!!C.profiles[m]) : []; }
  // Encoded polyline → [[lng,lat],…] (Valhalla/Stadia use precision 6; OSRM "polyline" uses 5).
  function decodePolyline(str, precision){
    const f = Math.pow(10, precision || 6), out = []; let i = 0, lat = 0, lng = 0;
    while(i < str.length){
      let b, sh = 0, r = 0; do{ b = str.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; }while(b >= 32 && i <= str.length); lat += (r & 1) ? ~(r >> 1) : (r >> 1);
      sh = 0; r = 0;        do{ b = str.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; }while(b >= 32 && i <= str.length); lng += (r & 1) ? ~(r >> 1) : (r >> 1);
      out.push([lng / f, lat / f]);
    }
    return out;
  }
  function qs(o){ const p = new URLSearchParams(); Object.keys(o||{}).forEach(k=>{ if(o[k]!=null && o[k]!=='') p.set(k, o[k]); }); return p.toString(); }
  // One request builder per API family. Both return {url, init} for fetch().
  function buildRouteRequest(C, mode, origin, destination, signal){
    const base = {signal:signal, credentials:'omit', headers:{'Accept':'application/json'}};
    if(C.format==='valhalla'){
      const extra = qs(C.query);
      return {url:C.endpoint+(extra ? (C.endpoint.indexOf('?')>=0 ? '&' : '?')+extra : ''),
        init:Object.assign(base, {method:'POST', headers:{'Accept':'application/json','Content-Type':'application/json'},
          body:JSON.stringify({locations:[origin, destination].map(p=>({lat:+p.lat.toFixed(6), lon:+p.lng.toFixed(6)})),
            costing:C.profiles[mode], format:'osrm', units:'kilometers', directions_type:'none'})})};
    }
    const params = Object.assign({overview:'full', geometries:'geojson', alternatives:'false', steps:'false'}, C.query||{});
    return {url:C.profiles[mode] + [origin, destination].map(p=>p.lng.toFixed(6)+','+p.lat.toFixed(6)).join(';') + '?' + qs(params), init:base};
  }
  // Route geometry in either GeoJSON or encoded-polyline form → [[lng,lat],…]
  function routeCoords(geom){
    if(geom && Array.isArray(geom.coordinates)) return geom.coordinates;
    if(typeof geom==='string'){ try{ return decodePolyline(geom, MAP_CONFIG.routing.polylinePrecision || 6); }catch(e){ return null; } }
    return null;
  }
  const routeCache = new Map();                // memory only, cleared on reload; ≤ cacheSize entries
  let routeInflight = null, lastRouteAt = 0, routeAttrOn = false;
  const IS_APPLE = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent || '');
  function routeAttribution(){ const C = MAP_CONFIG.routing; return 'Routes: <a href="'+esc(C.aboutUrl)+'" target="_blank" rel="noopener">'+esc(C.provider)+'</a>'; }
  function routeErr(code, message){ const e = new Error(message); e.code = code; return e; }
  function routeKey(a, b, mode){ return (a && b) ? mode+'|'+[a.lat,a.lng,b.lat,b.lng].map(v=>Number(v).toFixed(5)).join(',') : null; }

  /* Built-in router (format 'local'). The road file (scripts/build-roads.mjs) is loaded once, turned into an
     adjacency list + a snapping grid, and searched with A* (car: fastest by road-kind speed, one-way streets
     respected; walking: shortest). Answers in OSRM's response shape so getRouteInformation treats it like any
     other provider. Turn restrictions and live traffic aren't modelled. */
  const localRouter = (()=>{
    const RAD = Math.PI/180, M_PER_DEG = 111320, CELL = 0.01;   // snapping grid cell, degrees (≈1 km)
    let graph = null, loading = null;
    const metres = (lat1, lng1, lat2, lng2)=>{ const kx = Math.cos((lat1+lat2)/2*RAD)*M_PER_DEG; return Math.hypot((lng2-lng1)*kx, (lat2-lat1)*M_PER_DEG); };
    function build(d){
      const n = d.nodes.length/2, lat = new Float64Array(n), lng = new Float64Array(n);
      for(let i=0, a=0, b=0; i<n; i++){ a += d.nodes[2*i]; b += d.nodes[2*i+1]; lat[i] = a/d.scale; lng[i] = b/d.scale; }
      const sa = [], sb = [], sk = [], sf = [];
      d.ways.forEach(w=>{ for(let k=3, p=w[2]; k<w.length; k++){ const c = p+w[k]; if(c!==p){ sa.push(p); sb.push(c); sk.push(w[0]); sf.push(w[1]); } p = c; } });
      const m = sa.length, len = new Float32Array(m);
      for(let s=0; s<m; s++) len[s] = metres(lat[sa[s]], lng[sa[s]], lat[sb[s]], lng[sb[s]]);
      // each segment is listed at both of its ends; which way it may be travelled is checked during the search
      const off = new Int32Array(n+1);
      for(let s=0; s<m; s++){ off[sa[s]+1]++; off[sb[s]+1]++; }
      for(let i=0; i<n; i++) off[i+1] += off[i];
      const adj = new Int32Array(2*m), fill = off.slice(0, n);
      for(let s=0; s<m; s++){ adj[fill[sa[s]]++] = s; adj[fill[sb[s]]++] = s; }
      const w0 = d.bbox[1], s0 = d.bbox[0], grid = new Map();
      for(let s=0; s<m; s++){
        const x1 = Math.floor((Math.min(lng[sa[s]], lng[sb[s]])-w0)/CELL), x2 = Math.floor((Math.max(lng[sa[s]], lng[sb[s]])-w0)/CELL);
        const y1 = Math.floor((Math.min(lat[sa[s]], lat[sb[s]])-s0)/CELL), y2 = Math.floor((Math.max(lat[sa[s]], lat[sb[s]])-s0)/CELL);
        for(let x=x1; x<=x2; x++) for(let y=y1; y<=y2; y++){ const k = x*10000+y; if(!grid.has(k)) grid.set(k, []); grid.get(k).push(s); }
      }
      return {n, lat, lng, sa:Int32Array.from(sa), sb:Int32Array.from(sb), sk:Uint8Array.from(sk), sf:Uint8Array.from(sf), len, off, adj, grid, w0, s0, kinds:d.kinds};
    }
    function load(url){
      if(graph) return Promise.resolve(graph);
      if(!loading) loading = fetch(url, {credentials:'omit'})
        .then(r=>{ if(!r.ok) throw routeErr('provider', 'Couldn\'t load the road map. Please try again, or open the trip in Google Maps.'); return r.json(); })
        .then(d=>(graph = build(d)), e=>{ loading = null; throw e; });
      return loading;
    }
    // flags (build-roads.mjs): 1 one-way, 2 one-way against the drawing direction, 4 no cars, 8 no walking
    function can(g, s, from, car){
      const f = g.sf[s];
      if(f & (car ? 4 : 8)) return false;
      if(!car || !(f & 1)) return true;
      return (from===g.sa[s]) !== !!(f & 2);
    }
    // nearest point on a usable road: {s, t (0 at sa … 1 at sb), lat, lng, d (metres)} or null
    function snap(g, p, car, maxM){
      const cx = Math.floor((p.lng-g.w0)/CELL), cy = Math.floor((p.lat-g.s0)/CELL), kx = Math.cos(p.lat*RAD)*M_PER_DEG;
      const cellM = CELL*Math.min(kx, M_PER_DEG), rings = Math.ceil(maxM/cellM)+1;
      let best = null;
      for(let r=0; r<=rings; r++){
        for(let x=cx-r; x<=cx+r; x++) for(let y=cy-r; y<=cy+r; y++){
          if(Math.max(Math.abs(x-cx), Math.abs(y-cy))!==r) continue;
          const list = g.grid.get(x*10000+y); if(!list) continue;
          for(const s of list){
            if(!can(g, s, g.sa[s], car) && !can(g, s, g.sb[s], car)) continue;
            const ax = (g.lng[g.sa[s]]-p.lng)*kx, ay = (g.lat[g.sa[s]]-p.lat)*M_PER_DEG, bx = (g.lng[g.sb[s]]-p.lng)*kx, by = (g.lat[g.sb[s]]-p.lat)*M_PER_DEG;
            const dx = bx-ax, dy = by-ay, l2 = dx*dx+dy*dy, t = l2 ? Math.max(0, Math.min(1, -(ax*dx+ay*dy)/l2)) : 0;
            const d = Math.hypot(ax+t*dx, ay+t*dy);
            if(!best || d<best.d) best = {s, t, d};
          }
        }
        if(best && best.d <= r*cellM) break;          // nothing in a farther ring can be closer
      }
      if(!best || best.d>maxM) return null;
      const s = best.s;
      return Object.assign(best, {lat:g.lat[g.sa[s]]+best.t*(g.lat[g.sb[s]]-g.lat[g.sa[s]]), lng:g.lng[g.sa[s]]+best.t*(g.lng[g.sb[s]]-g.lng[g.sa[s]])});
    }
    function search(C, g, A, B, car){
      const kmh = s=>car ? (C.carKmh[g.kinds[g.sk[s]]] || 20) : (g.kinds[g.sk[s]]==='steps' ? C.stepsKmh : C.footKmh);
      const secs = (s, m)=>m/(kmh(s)/3.6);
      const vmax = (car ? Math.max.apply(null, Object.keys(C.carKmh).map(k=>C.carKmh[k])) : C.footKmh)/3.6;
      const cost = new Float64Array(g.n).fill(Infinity), via = new Int32Array(g.n).fill(-1), done = new Uint8Array(g.n);
      const heapN = [], heapF = [];
      const push = (i, f)=>{ let k = heapN.length; heapN.push(i); heapF.push(f);
        while(k){ const p = (k-1)>>1; if(heapF[p]<=f) break; heapN[k] = heapN[p]; heapF[k] = heapF[p]; k = p; } heapN[k] = i; heapF[k] = f; };
      const pop = ()=>{ const top = heapN[0], ln = heapN.pop(), lf = heapF.pop(), size = heapN.length;
        if(size){ let k = 0; for(;;){ let c = 2*k+1; if(c>=size) break; if(c+1<size && heapF[c+1]<heapF[c]) c++; if(heapF[c]>=lf) break; heapN[k] = heapN[c]; heapF[k] = heapF[c]; k = c; } heapN[k] = ln; heapF[k] = lf; }
        return top; };
      const h = i=>metres(g.lat[i], g.lng[i], B.lat, B.lng)/vmax;
      const sA = A.s, sB = B.s, lA = g.len[sA], lB = g.len[sB];
      // leave the start point along its segment (towards sa = travelling sb→sa); arrive at the end point the same way
      [[g.sa[sA], g.sb[sA], A.t], [g.sb[sA], g.sa[sA], 1-A.t]].forEach(([to, from, frac])=>{
        if(can(g, sA, from, car)){ cost[to] = secs(sA, frac*lA); push(to, cost[to]+h(to)); } });
      const arrive = i=>(i===g.sa[sB] && can(g, sB, i, car)) ? secs(sB, B.t*lB) : (i===g.sb[sB] && can(g, sB, i, car)) ? secs(sB, (1-B.t)*lB) : null;
      let best = Infinity, bestEnd = -1;
      if(sA===sB && can(g, sA, B.t>=A.t ? g.sa[sA] : g.sb[sA], car)) best = secs(sA, Math.abs(B.t-A.t)*lA);   // both on one segment
      while(heapN.length){
        if(heapF[0]>=best) break;
        const u = pop(); if(done[u]) continue; done[u] = 1;
        const e = arrive(u); if(e!=null && cost[u]+e<best){ best = cost[u]+e; bestEnd = u; }
        for(let k=g.off[u]; k<g.off[u+1]; k++){
          const s = g.adj[k], v = g.sa[s]===u ? g.sb[s] : g.sa[s];
          if(done[v] || !can(g, s, u, car)) continue;
          const c = cost[u]+secs(s, g.len[s]);
          if(c<cost[v]){ cost[v] = c; via[v] = s; push(v, c+h(v)); }
        }
      }
      if(best===Infinity) return null;
      const pts = [[B.lng, B.lat]];
      let dist;
      if(bestEnd<0) dist = Math.abs(B.t-A.t)*lA;
      else {
        dist = bestEnd===g.sa[sB] ? B.t*lB : (1-B.t)*lB;
        let u = bestEnd;
        for(;;){ pts.push([g.lng[u], g.lat[u]]); const s = via[u]; if(s<0) break; dist += g.len[s]; u = g.sa[s]===u ? g.sb[s] : g.sa[s]; }
        dist += u===g.sa[sA] ? A.t*lA : (1-A.t)*lA;
      }
      pts.push([A.lng, A.lat]);
      return {coordinates:pts.reverse(), distance:dist, duration:best};
    }
    function route(C, mode, origin, destination, signal){
      return new Promise((resolve, reject)=>{
        if(signal) signal.addEventListener('abort', ()=>reject(new Error('aborted')));
        load(C.graphUrl).then(g=>{
          const car = C.profiles[mode]==='car', A = snap(g, origin, car, C.maxSnapM), B = snap(g, destination, car, C.maxSnapM);
          if(!A || !B) throw routeErr('outside', 'Road routes cover the Jaisalmer area only.');
          const r = search(C, g, A, B, car);
          resolve(r ? {code:'Ok', routes:[{geometry:{type:'LineString', coordinates:r.coordinates}, distance:r.distance, duration:r.duration}], waypoints:[{distance:A.d}, {distance:B.d}]}
                    : {code:'NoRoute'});
        }).catch(reject);
      });
    }
    return {route, ready:()=>!!graph};
  })();

  /* getRouteInformation(origin, destination, mode) → Promise<{key, mode, distanceKm, durationMin|null,
       geometry:[[lat,lng],…], snapM:[start,end] (metres from each point to the routable network), provider, source, fetchedAt}>
     origin/destination: {lat,lng}; mode: one of routeModesAvailable().
     Rejects with err.code: disabled | mode | coords | same | offline | timeout | busy | noroute | outside | provider | superseded */
  function getRouteInformation(origin, destination, mode){
    const C = MAP_CONFIG.routing;
    if(!C.enabled) return Promise.reject(routeErr('disabled', 'Route planning isn\'t available right now.'));
    if(!ROUTE_MODES[mode] || !C.profiles[mode] || routeModesAvailable().indexOf(mode)<0) return Promise.reject(routeErr('mode', 'This travel mode isn\'t supported here.'));
    const okPt = p=>LOC ? LOC.isValidPoint(p) : !!(p && isFinite(p.lat) && isFinite(p.lng));
    if(!okPt(origin) || !okPt(destination)) return Promise.reject(routeErr('coords', 'One of the points has no valid location.'));
    const direct = calculateStraightLineDistance(origin, destination);
    if(direct!=null && direct < 0.02) return Promise.reject(routeErr('same', 'Start and destination are the same place.'));
    if(navigator.onLine===false && !(C.format==='local' && localRouter.ready())) return Promise.reject(routeErr('offline', 'You\'re offline. Routes need a connection — the direct distance still works.'));
    const key = routeKey(origin, destination, mode);
    if(routeCache.has(key)){ const hit = routeCache.get(key); routeCache.delete(key); routeCache.set(key, hit); return Promise.resolve(hit); }
    if(routeInflight && routeInflight.key===key) return routeInflight.p;            // same request already on its way
    if(routeInflight){ routeInflight.superseded = true; routeInflight.ctrl.abort(); }  // a newer request replaces an older one
    const ctrl = typeof AbortController==='function' ? new AbortController() : null;
    const job = {key:key, ctrl:ctrl || {abort:function(){}}, superseded:false, timedOut:false, p:null};
    const wait = Math.max(0, (C.minIntervalMs||0) - (Date.now()-lastRouteAt));            // stay within the provider's request rate
    job.p = new Promise(res=>setTimeout(res, wait)).then(()=>{
      if(job.superseded) throw routeErr('superseded', '');
      lastRouteAt = Date.now();
      const timer = setTimeout(()=>{ job.timedOut = true; job.ctrl.abort(); }, C.timeoutMs);
      if(C.format==='local') return localRouter.route(C, mode, origin, destination, ctrl ? ctrl.signal : undefined).finally(()=>clearTimeout(timer));
      const req = buildRouteRequest(C, mode, origin, destination, ctrl ? ctrl.signal : undefined);
      return fetch(req.url, req.init)
        .then(r=>{
          if(r.status===429) throw routeErr('busy', 'The routing service is busy. Please try again in a minute.');
          if(r.status===401 || r.status===403) throw routeErr('provider', 'Route planning isn\'t available right now. Please use Google Maps for directions.');
          return r.json().catch(()=>{ throw routeErr('provider', 'The routing service sent an answer we couldn\'t read. Please try again.'); });
        })
        .finally(()=>clearTimeout(timer));
    }).then(j=>{
      // "No route": OSRM/Mapbox say code NoRoute; Valhalla says error_code 442/443 (no path) or 170/171 (no road near a point).
      if(j && (j.code==='NoRoute' || j.code==='NoSegment' || [170,171,442,443].indexOf(j.error_code)>=0)) throw routeErr('noroute', 'No '+ROUTE_MODES[mode].verb+' route was found between these points on mapped roads and paths.');
      const rt = (j && j.code==='Ok' && Array.isArray(j.routes)) ? j.routes[0] : null;
      const raw = rt ? routeCoords(rt.geometry) : null;
      const g = raw ? raw.filter(c=>Array.isArray(c) && isFinite(c[0]) && isFinite(c[1])) : null;
      if(!rt || !g || g.length<2 || !isFinite(rt.distance) || rt.distance<0) throw routeErr('provider', 'Couldn\'t get a route right now. Please try again, or open the trip in Google Maps.');
      const wp = Array.isArray(j.waypoints) ? j.waypoints : [];
      const snap = w=>(w && isFinite(w.distance) && w.distance>=0) ? w.distance : null;
      const info = {key:key, mode:mode, distanceKm:rt.distance/1000,
        durationMin:(isFinite(rt.duration) && rt.duration>=0) ? rt.duration/60 : null,
        geometry:g.map(c=>[c[1], c[0]]), snapM:[snap(wp[0]), snap(wp[wp.length-1])],
        provider:C.provider, source:C.format || 'osrm', fetchedAt:Date.now()};
      routeCache.set(key, info);
      while(routeCache.size > C.cacheSize) routeCache.delete(routeCache.keys().next().value);
      return info;
    }).catch(e=>{
      if(job.superseded) throw routeErr('superseded', '');
      if(job.timedOut) throw routeErr('timeout', 'The routing service took too long to answer. Please try again.');
      if(e && e.code) throw e;
      if(navigator.onLine===false) throw routeErr('offline', 'You\'re offline. Routes need a connection — the direct distance still works.');
      throw routeErr('provider', 'Couldn\'t reach the routing service. Please try again, or open the trip in Google Maps.');
    }).finally(()=>{ if(routeInflight===job) routeInflight = null; });
    routeInflight = job;
    return job.p;
  }

  function endpoint(v){
    if(v==='me') return state.userLoc ? {id:'me', me:true, lat:state.userLoc.lat, lng:state.userLoc.lng, label:'Your location'} : null;
    const l = v && BY_ID[v];
    return l ? {id:l.id, lat:l.lat, lng:l.lng, label:l.name, loc:l} : null;
  }
  function fmtDuration(min){
    if(min==null || !isFinite(min) || min<0) return '';
    if(min<1) return 'under 1 min';
    if(min<60) return Math.round(min)+' min';
    const t = min<120 ? Math.round(min) : Math.round(min/5)*5, h = Math.floor(t/60), m = t%60;
    return h+' h'+(m ? ' '+m+' min' : '');
  }
  const llStr = p=>Number(p.lat).toFixed(6)+','+Number(p.lng).toFixed(6);
  // Google Maps directions URL (documented api=1 pattern). With "My location" as the start, origin is left out so the
  // app uses the device's own live position — the visitor's coordinates aren't put into the link.
  function gmapsDirUrl(a, b, mode){
    const ll = p=>encodeURIComponent(llStr(p));     // "lat,lng" → "lat%2Clng", as Google's Maps URLs require
    return 'https://www.google.com/maps/dir/?api=1'+((a && !a.me) ? '&origin='+ll(a) : '')+'&destination='+ll(b)+'&travelmode='+ROUTE_MODES[mode].gmaps;
  }
  function appleDirUrl(a, b, mode){
    const f = ROUTE_MODES[mode].apple;
    return 'https://maps.apple.com/?'+((a && !a.me) ? 'saddr='+llStr(a)+'&' : '')+'daddr='+llStr(b)+(f ? '&dirflg='+f : '');
  }
  const isDesert = p=>!!(p && p.loc && /desert|safari/i.test((p.loc.subcategory||'')+' '+(p.loc.tag||'')));

  function defaultFrom(toId){
    if(state.userLoc) return 'me';
    const ref = refPoint();
    return (ref && ref.kind==='place' && ref.id && ref.id!==toId) ? ref.id : '';
  }
  function openRoute(o){
    o = o || {};
    if(!el.route) return;
    const toLoc = o.to && (BY_ID[o.to] || BY_SLUG[o.to]);
    const prevKey = R.from+'>'+R.to+'>'+R.mode;
    if(toLoc) R.to = toLoc.id;
    if(o.from) R.from = o.from;
    else if(!R.from || R.from===R.to) R.from = defaultFrom(R.to);
    if(R.from && R.from===R.to) R.from = '';
    if(o.mode && ROUTE_MODES[o.mode] && routeModesAvailable().indexOf(o.mode)>=0) R.mode = o.mode;
    else if(routeModesAvailable().indexOf(R.mode)<0 && routeModesAvailable().length) R.mode = routeModesAvailable()[0];
    if(prevKey !== R.from+'>'+R.to+'>'+R.mode){ R.err = null; if(R.layer) clearRouteLayer(true); }
    const wasOpen = R.open;
    R.open = true;
    el.route.hidden = false;
    if(!el.near.hasAttribute('aria-busy')) hideBanner();   // an old message shouldn't sit on top of the new panel
    el.routeBtn.setAttribute('aria-expanded','true'); el.routeBtn.classList.add('is-on');
    setRouteCollapsed(false);
    if(mapReady) map.closePopup();
    if(isMobile()) setSheet('peek');
    renderRoute();
    if(!o.quiet) syncHash();
    // o.locate: the tap that opened this (e.g. Directions to a parking spot) may ask for the visitor's location right away.
    if(o.auto && R.from && R.to && (R.from!=='me' || state.userLoc || o.locate)) computeRoute();
    if(!wasOpen && !o.quiet){
      const target = !R.to ? el.routeTo : (!R.from ? el.routeFrom : el.routeTitle);
      try{ target.focus({preventScroll:true}); }catch(e){}
    }
  }
  function closeRoute(silent){
    if(!R.open) return;
    R.open = false; R.loading = false; R.result = null; R.err = null;
    if(routeInflight){ routeInflight.superseded = true; routeInflight.ctrl.abort(); routeInflight = null; }
    clearRouteLayer();
    el.route.hidden = true;
    el.routeBtn.setAttribute('aria-expanded','false'); el.routeBtn.classList.remove('is-on');
    if(!silent){ syncHash(); try{ el.routeBtn.focus({preventScroll:true}); }catch(e){} }
  }
  function setRouteCollapsed(c){
    R.collapsed = !!c;
    el.routeBody.hidden = R.collapsed;
    el.routeLine.hidden = !R.collapsed;
    el.routeMin.textContent = R.collapsed ? 'Edit' : 'Hide';
    el.routeMin.setAttribute('aria-expanded', String(!R.collapsed));
  }
  function clearRouteLayer(keepAttribution){
    if(R.layer && map){ map.removeLayer(R.layer); }
    R.layer = null;
    if(!keepAttribution && routeAttrOn && map && map.attributionControl){ map.attributionControl.removeAttribution(routeAttribution()); routeAttrOn = false; }
  }
  function computeRoute(){
    if((R.from==='me' || R.to==='me') && !state.userLoc){
      return nearMe({keepView:true}).then(ok=>{ if(ok && state.userLoc && R.open) return computeRoute(); renderRoute(); });
    }
    const a = endpoint(R.from), b = endpoint(R.to);
    if(!a || !b){ R.err = routeErr('missing', 'Choose a starting point and a destination.'); renderRoute(); return Promise.resolve(); }
    const key = routeKey(a, b, R.mode);
    // No road-routing service is switched on (admin → Settings → Map → Directions), or a point is off the built-in
    // road map: draw the direction as a straight blue line, worked out on the device, and leave turn-by-turn to Google / Apple Maps.
    const straight = outside=>{
      R.loading = false; R.err = null;
      R.result = {straight:true, outside:!!outside, key:key, mode:R.mode, distanceKm:calculateStraightLineDistance(a, b), durationMin:null,
        geometry:[[a.lat,a.lng],[b.lat,b.lng]], snapM:[null,null]};
      if(isMobile()) setRouteCollapsed(true);
      drawRoute(R.result, a, b);
      renderRoute();
    };
    if(!routeModesAvailable().length){ straight(false); return Promise.resolve(); }
    R.loading = true; R.err = null; renderRoute();
    return getRouteInformation(a, b, R.mode).then(info=>{
      if(!R.open || routeKey(endpoint(R.from), endpoint(R.to), R.mode)!==key) return;   // endpoints changed meanwhile
      R.loading = false; R.result = info;
      if(isMobile()) setRouteCollapsed(true);      // give the map back to the route on small screens
      drawRoute(info, a, b);
      renderRoute();
    }, err=>{
      if(err && err.code==='superseded') return;
      if(!R.open) return;
      if(err && err.code==='outside' && routeKey(endpoint(R.from), endpoint(R.to), R.mode)===key) return straight(true);
      R.loading = false; R.err = err; R.result = null;
      renderRoute();
    });
  }
  function drawRoute(info, a, b, keepView){
    if(!mapReady) return;                        // map failed to load: the panel still shows distance + time
    clearRouteLayer(true);
    const M = ROUTE_MODES[info.mode], g = info.geometry;
    R.layer = L.layerGroup();
    L.polyline(g, {color:'#FFFFFF', weight:9, opacity:0.9, interactive:false}).addTo(R.layer);
    L.polyline(g, {color:M.color, weight:5, opacity:0.95, lineCap:'round', lineJoin:'round',
      dashArray:info.straight ? '12 10' : (info.mode==='walking' ? '1 10' : null), interactive:false}).addTo(R.layer);
    // where a point is off the routable network (dunes, camps, large compounds) show the unrouted gap honestly
    const gap = {color:'#5C5850', weight:2, opacity:0.85, dashArray:'4 6', interactive:false};
    if(info.snapM[0]!=null && info.snapM[0]>25) L.polyline([[a.lat,a.lng], g[0]], gap).addTo(R.layer);
    if(info.snapM[1]!=null && info.snapM[1]>25) L.polyline([g[g.length-1], [b.lat,b.lng]], gap).addTo(R.layer);
    if(!a.me) L.circleMarker([a.lat,a.lng], {radius:7, color:'#202522', weight:3, fillColor:'#FFFFFF', fillOpacity:1}).bindTooltip('Start: '+esc(a.label)).addTo(R.layer);
    if(!b.me) L.circleMarker([b.lat,b.lng], {radius:8, color:'#FFFFFF', weight:3, fillColor:'#202522', fillOpacity:1}).bindTooltip('Destination: '+esc(b.label)).addTo(R.layer);
    R.layer.addTo(map);
    if(!info.straight && !routeAttrOn && map.attributionControl){ map.attributionControl.addAttribution(routeAttribution()); routeAttrOn = true; }
    if(!keepView) fitRoute(g.concat([[a.lat,a.lng],[b.lat,b.lng]]));
  }
  function fitRoute(points){
    map.invalidateSize();
    const mr = el.map.getBoundingClientRect(), pr = el.route.hidden ? null : el.route.getBoundingClientRect();
    const tl = [24,24], br = [64,24];
    if(pr && pr.width && mr.width){              // keep the route clear of the directions panel
      if(pr.width > mr.width*0.6) br[1] = Math.max(24, mr.bottom - pr.top + 16);
      else tl[0] = Math.max(24, pr.right - mr.left + 16);
    }
    if(tl[0]+br[0] > mr.width-80) tl[0] = 24;
    if(tl[1]+br[1] > mr.height-80) br[1] = 24;
    map.fitBounds(L.latLngBounds(points), {paddingTopLeft:tl, paddingBottomRight:br, maxZoom:16, animate:false});
  }
  function renderRoute(){
    if(!el.route || !R.open) return;
    const k = LOCATIONS.length+'|'+(state.userLoc ? 1 : 0);
    if(el.routeFrom.dataset.key!==k){
      const opts = placeOptionsHtml(), me = '<option value="me">'+(state.userLoc ? '📍 My location' : '📍 Use my location')+'</option>';
      el.routeFrom.innerHTML = '<option value="">Choose a starting point</option>'+me+opts;
      el.routeTo.innerHTML = '<option value="">Choose a destination</option>'+me+opts;
      el.routeFrom.dataset.key = k;
    }
    el.routeFrom.value = R.from || ''; if(el.routeFrom.value!==(R.from || '')){ R.from = ''; el.routeFrom.value = ''; }
    el.routeTo.value = R.to || '';     if(el.routeTo.value!==(R.to || '')){ R.to = ''; el.routeTo.value = ''; }
    el.routeModes.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.mode===R.mode)));

    const canRoute = routeModesAvailable().length>0, M = ROUTE_MODES[R.mode];
    const a = endpoint(R.from), b = endpoint(R.to);
    const res = (R.result && a && b && R.result.key===routeKey(a, b, R.mode)) ? R.result : null;
    const direct = (a && b) ? calculateStraightLineDistance(a, b) : null;
    const rows = [];
    if(direct!=null) rows.push(['📍 Direct distance', fmtKm(direct)]);
    if(res && !res.straight) rows.push([M.icon+' '+M.road, fmtKm(res.distanceKm)]);
    if(res && !res.straight && res.durationMin!=null) rows.push(['⏱ Estimated '+M.verb+' time', fmtDuration(res.durationMin)]);
    let html = rows.length ? '<dl class="mv-route-facts">'+rows.map(r=>'<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>').join('')+'</dl>' : '';
    if(R.loading) html += '<p class="mv-route-status"><span class="mv-spinner is-small" aria-hidden="true"></span>Finding the '+esc(M.verb)+' route…</p>';
    else if(R.err && R.err.code!=='missing') html += '<p class="mv-route-status is-error">'+esc(R.err.message)+'</p>';
    const notes = [];
    if(!a || !b){
      if(R.from==='me' && !state.userLoc && b) notes.push('Share your location, or choose a place to start from.');
      else notes.push(!a && !b ? 'Choose where you\'re starting from and where you want to go.' : !a ? 'Choose a starting point — your location or any place on the map.' : 'Choose a destination.');
    } else if(a.me!==b.me && direct!=null && direct < ARRIVED_KM){
      notes.push('You\'ve arrived at '+(b.me ? a.label : b.label)+'.');
    } else if(res && res.straight && res.outside){
      notes.push('Road routes on this map cover the Jaisalmer area, so the blue line points straight to '+(b.me ? 'you' : b.label)+'. Tap Google Maps'+(IS_APPLE ? ' or Apple Maps' : '')+' for directions by road.');
    } else if(res && res.straight){
      notes.push('The blue line points straight to '+(b.me ? 'you' : b.label)+' — the way by road is longer. Tap Google Maps'+(IS_APPLE ? ' or Apple Maps' : '')+' for turn-by-turn directions.');
    } else if(res){
      notes.push(R.mode==='auto' ? 'Auto-rickshaw time is estimated from the car road route — autos are often a little slower, and live traffic isn\'t included. Agree the fare with the driver before you start.'
        : M.roadBased ? 'Estimate from '+(MAP_CONFIG.routing.dataLabel||'map')+' road data — live traffic isn\'t included.' : 'Estimate from '+(MAP_CONFIG.routing.dataLabel||'map')+' path data at an average '+M.verb+' pace.');
      const far = Math.max(res.snapM[0] || 0, res.snapM[1] || 0);
      if(far > MAP_CONFIG.routing.snapWarnM) notes.push('The route stops about '+fmtKm(far/1000)+' short of a selected point (dashed line) — that stretch isn\'t on a mapped road or path.');
      if(isDesert(a) || isDesert(b)) notes.push('Dunes, camps and safari tracks aren\'t routed — confirm the last stretch with your driver or camp.');
    } else if(!R.loading && !R.err && direct!=null){
      notes.push(canRoute ? 'Direct distance is a straight line; the '+(M.roadBased ? 'road' : 'path')+' distance is usually longer. Tap “Show route” for it and the travel time.'
                          : 'Direct distance is a straight line; the actual travel distance will be longer. Tap “Show route” to see the direction on the map.');
    }
    if(((a && a.me) || (b && b.me)) && state.userLoc){
      const u = state.userLoc, age = Date.now()-u.ts;
      if(u.acc!=null && u.acc>MAP_CONFIG.nearMe.approximateAboveM) notes.push('Your location is approximate (about '+fmtKm(u.acc/1000)+'), so distances may be off.');
      if(age>MAP_CONFIG.nearMe.staleMs) notes.push('Your location was found '+Math.round(age/60000)+' min ago.');
    }
    html += notes.map(n=>'<p class="mv-route-note">'+esc(n)+'</p>').join('');
    el.routeOut.innerHTML = html;

    el.routeGo.hidden = !!res;
    el.routeGo.disabled = R.loading || !R.from || !R.to;
    el.routeGo.textContent = (R.err && R.err.code!=='missing' && R.err.code!=='same') ? 'Try again' : 'Show route';
    el.routeClear.hidden = !R.layer;
    if(b){ el.routeGmaps.href = gmapsDirUrl(a, b, R.mode); el.routeGmaps.hidden = false; } else { el.routeGmaps.hidden = true; el.routeGmaps.removeAttribute('href'); }
    if(b && IS_APPLE){ el.routeApple.href = appleDirUrl(a, b, R.mode); el.routeApple.hidden = false; } else { el.routeApple.hidden = true; el.routeApple.removeAttribute('href'); }
    el.routeLine.textContent = (a ? a.label : 'Choose a start')+' → '+(b ? b.label : 'choose a destination')+
      ((res && !res.straight) ? ' · '+fmtKm(res.distanceKm)+(res.durationMin!=null ? ' · ~'+fmtDuration(res.durationMin) : '') : (direct!=null ? ' · '+fmtKm(direct)+' direct' : ''));
    el.routeLine.setAttribute('aria-label', 'Edit directions: '+el.routeLine.textContent);
  }

  /* ------------------------------------------------------------
     BANNER + SHARE
     ------------------------------------------------------------ */
  function showBanner(o){
    clearTimeout(bannerTimer);
    el.bannerTitle.textContent = o.title || '';
    el.bannerText.textContent = o.text || '';
    if(o.action){ el.bannerAction.hidden=false; el.bannerAction.textContent=o.action; el.bannerAction.onclick=o.onAction; }
    else { el.bannerAction.hidden=true; el.bannerAction.onclick=null; }
    el.banner.hidden = false;
    if(o.autoHide) bannerTimer = setTimeout(hideBanner, o.autoHide);
  }
  function hideBanner(){ if(el.banner) el.banner.hidden = true; }

  function shareView(){
    syncHash();
    const url = location.href, sel = state.selected && BY_ID[state.selected];
    const title = sel ? sel.name+' — Jaisalmer Visit' : 'Smart Tourist Map — Jaisalmer Visit';
    if(navigator.share){ navigator.share({title:title, url:url}).catch(()=>{}); }
    else if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(()=>showBanner({text:'Link copied to clipboard.', autoHide:2500}), ()=>window.prompt('Copy this link', url));
    } else window.prompt('Copy this link', url);
  }

  /* ------------------------------------------------------------
     GLOBAL WIRING
     ------------------------------------------------------------ */
  // Escape: details sheet → deselect → close. (Capture phase so it runs before the site's other Escape handlers.)
  document.addEventListener('keydown', e=>{
    if(e.key!=='Escape' || !viewOpen) return;
    if(el.panelOverlay.classList.contains('open')){ closePanel(); e.stopPropagation(); return; }
    if(R.open && el.route.contains(document.activeElement)){ closeRoute(); e.stopPropagation(); return; }
    const m = document.getElementById('modalOverlay'), a = document.getElementById('addServiceOverlay');
    if((m && m.classList.contains('open')) || (a && a.classList.contains('open'))) return;   // those close themselves
    e.stopPropagation();
    if(state.selected) deselect(); else if(R.open) closeRoute(); else goBack();
  }, true);
  window.addEventListener('offline', ()=>{ if(viewOpen) showBanner({text:"You're offline — map tiles may not load, but the list still works."}); });
  window.addEventListener('online', ()=>{ if(viewOpen) hideBanner(); });
  window.addEventListener('hashchange', route);

  /* ------------------------------------------------------------
     DATA REFRESH, FUTURE API FEED, SEO
     ------------------------------------------------------------ */
  function refreshAfterData(){
    injectJsonLd();
    if(viewOpen){ applyFilters({quiet:true}); renderRoute(); }
  }
  function loadRemoteData(){                // no-op until MAP_CONFIG.data.url is set
    const url = MAP_CONFIG.data.url;
    if(!url || remoteLoaded || typeof fetch!=='function') return;
    remoteLoaded = true;
    fetch(url, {credentials:'omit', headers:{'Accept':'application/json'}})
      .then(r=>{ if(!r.ok) throw new Error('http'); return r.json(); })
      .then(j=>{ ingest(j && j.locations); ingest(((j && j.providers)||[]).map(fromProvider)); refreshAfterData(); })
      .catch(()=>{ remoteLoaded = false; if(viewOpen) showBanner({title:'Some places couldn\'t load', text:'Showing the places already on this device.', autoHide:5000}); });
  }
  function injectJsonLd(){                  // crawlable structured data generated from the same dataset
    if(!MAP_CONFIG.seo.jsonLd) return;
    try{
      const items = LOCATIONS.filter(l=>l.type==='attraction' && l.visible!==false).map((l,i)=>({
        '@type':'ListItem', position:i+1,
        item:{'@type':'TouristAttraction', name:l.name, description:l.short,
          geo:{'@type':'GeoCoordinates', latitude:l.lat, longitude:l.lng}, containedInPlace:{'@type':'City', name:'Jaisalmer'}}}));
      if(!items.length) return;
      let s = document.getElementById('jm-ld-places');
      if(!s){ s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'jm-ld-places'; document.head.appendChild(s); }
      s.textContent = JSON.stringify({'@context':'https://schema.org','@type':'ItemList', name:'Places to visit in Jaisalmer', itemListElement:items}).replace(/</g,'\\u003c');
    }catch(e){}
  }
  // Which known places does a piece of text mention? (used to link itinerary days to the map)
  function findInText(text){
    const t = norm(text), out = [];
    LOCATIONS.forEach(l=>{
      if(l.visible===false) return;
      let at = -1;
      [l.name].concat(l.aliases).forEach(nm=>{
        const n = norm(nm), i = t.indexOf(n);
        if(i>=0 && !/[a-z0-9]/.test(t.charAt(i-1)||' ') && !/[a-z0-9]/.test(t.charAt(i+n.length)||' ') && (at<0 || i<at)) at = i;
      });
      if(at>=0) out.push({slug:l.slug, name:l.name, at:at});
    });
    return out.sort((a,b)=>a.at-b.at);
  }

  function hashParams(o){
    const p = new URLSearchParams();
    if(o.cat && CAT_BY_ID[o.cat]){ p.set('cat', o.cat); if(o.sub && SUBS[o.cat].indexOf(o.sub)>=0) p.set('sub', o.sub); }
    if(o.q) p.set('q', String(o.q).slice(0,60));
    if(o.area && AREAS[o.area]) p.set('area', o.area);
    if(o.near && BY_SLUG[o.near]) p.set('near', o.near);
    if(o.to && BY_SLUG[o.to]) p.set('to', o.to);
    if(o.from==='me' || (o.from && BY_SLUG[o.from])) p.set('from', o.from);
    if(o.mode && ROUTE_MODES[o.mode] && o.mode!=='driving') p.set('mode', o.mode);
    const qs = p.toString(); return qs ? '?'+qs : '';
  }
  function publicView(l){
    return {id:l.id, slug:l.slug, name:l.name, tag:l.tag, short:l.short, type:l.type, category:l.category, subcategory:l.subcategory, lat:l.lat, lng:l.lng, navigationUrl:navUrl(l),
      // already validated by normalizeLocation(); null when unknown — callers must not substitute anything
      address:l.address, phone:l.phone, whatsapp:l.whatsapp, website:l.website, profileUrl:l.profileUrl,
      verified:l.verified, featured:l.featured, rating:l.rating, reviewCount:l.reviewCount,
      serviceAreas:l.serviceAreas.slice(), tags:l.keywords.concat(l.serviceTags)};
  }

  // Public API used by destination modals ("View on Map"), the itinerary and future data feeds.
  window.JMMap = {
    has: refId=>LOCATIONS.some(l=>l.refId===refId && l.visible!==false),
    navigationUrl: refId=>{ const l=LOCATIONS.find(x=>x.refId===refId); return l?navUrl(l):'#'; },
    show: (slug, o)=>{
      o = o || {};
      const extra = hashParams(o), h = '#map/'+encodeURIComponent(slug)+extra;
      if(viewOpen){
        if(!extra){ select(slug, {fromList:true}); return; }
        try{ history.replaceState(history.state, '', location.pathname+location.search+h); }catch(e){}   // no extra history entry
        route(); return;
      }
      location.hash = h;
    },
    // Name search for a curated place that exists but has no verified coordinates (null otherwise).
    placeSearchUrl: refId=>{
      if(typeof ATTRACTIONS==='undefined') return null;
      const a = ATTRACTIONS.find(x=>x.id===refId && x.visible!==false); if(!a || !a.name) return null;
      return MAP_CONFIG.navigation.searchTemplate.replace('{q}', encodeURIComponent(a.name+', Jaisalmer, Rajasthan'));
    },
    open: o=>{ location.hash = '#map'+hashParams(o||{}); },          // open the map on a category / sub-category slice
    hasLocation: id=>!!(BY_ID[id] && BY_ID[id].visible!==false),
    get: id=>{ const l = BY_ID[id] || BY_SLUG[id]; return l ? publicView(l) : null; },
    places: o=>{ o = o || {}; return LOCATIONS.filter(l=>l.visible!==false && (!o.type || l.type===o.type) && (!o.category || l.category===o.category) &&
      (!o.subcategories || o.subcategories.indexOf(l.subcategory)>=0)).map(publicView); },
    center: ()=>({lat:CENTER.lat, lng:CENTER.lng}),
    search: q=>{ const plan = queryPlan(q); return plan ? LOCATIONS.filter(l=>l.visible!==false && scoreLoc(l, plan)>0).map(publicView) : []; },   // same index as the map search box
    navigationUrlFor: (lat,lng)=>{ lat = num(lat); lng = num(lng); return (lat==null || lng==null) ? null : fillCoords(MAP_CONFIG.navigation.urlTemplate, {lat:lat, lng:lng}); },
    findInText: findInText,
    addLocations: (list, opts)=>{ const n = ingest(opts && opts.providers ? (list||[]).map(fromProvider) : list); refreshAfterData(); return n; },
    diagnostics: ()=>({loaded:LOCATIONS.length, rejected:dataIssues.slice()}),
    // Directions: open the map's route planner to a place (from the visitor's location when they've shared it).
    directions: (slug, o)=>{
      o = o || {}; const l = BY_SLUG[slug] || BY_ID[slug]; if(!l) return false;
      const f = o.from==='me' ? {id:'me', slug:'me'} : (o.from && (BY_SLUG[o.from] || BY_ID[o.from])) || null;   // accept a slug or an id
      // o.locate (with from:'me'): ask for the visitor's location on this tap and draw the route straight away
      if(viewOpen){ openRoute({to:l.id, from:f ? f.id : undefined, mode:o.mode, auto:true, locate:!!o.locate}); return true; }
      routeOnOpen = !!o.locate;
      location.hash = '#map'+hashParams(Object.assign({}, o, {to:l.slug, from:f ? f.slug : undefined})); return true;
    },
    getRouteInformation: getRouteInformation,                     // (origin, destination, mode) → Promise — see above
    calculateStraightLineDistance: calculateStraightLineDistance, // ({lat,lng}, {lat,lng}) → km | null
    formatDistance: fmtKm
  };
  window.JMMap.directionsUrl = window.JMMap.navigationUrl;   // kept for older callers

  // Deep link / refresh: open straight into the map when the URL says so. Otherwise: do nothing at all.
  injectJsonLd();
  route();
  bootRoute = false;
  // The itinerary was rendered before the map module existed — render it again so its days can link to map places.
  try{ if(typeof renderItinerary==='function') renderItinerary(); }catch(e){}
})();
