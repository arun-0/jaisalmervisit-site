/* ============================================================
   DATA
   youtubeUrl (optional, per place): a link to the place's own YouTube video —
   https://www.youtube.com/watch?v=ID, https://youtu.be/ID or /shorts/ID.
   Leave '' for no video. When it holds a valid link, the place's image becomes
   a link that opens the video in a new tab, with a small play mark on it, and
   the place sheet shows a "Watch video" button next to Location.
   Invalid or placeholder links are ignored, so the image stays as it is.
   image (optional, per place, set in the admin): a photo shown on the Explore card
   and at the top of the place sheet instead of the drawn dunes.
   ============================================================ */
const ATTRACTIONS = VJData.get('ATTRACTIONS', [
  {id:'fort', name:'Jaisalmer Fort', tag:'Heritage · Living Fort', short:'A sandstone fort still lived in by thousands, rising straight out of the Thar.',
   youtubeUrl:'',   // set the real video in the admin: Places → Jaisalmer Fort → YouTube video
   why:'One of very few "living forts" left in the world — families, shops, guesthouses and temples still operate inside its walls, alongside a UNESCO-recognised hill fort site.',
   see:['The four massive gates along the entry ramp','Jain temples inside the fort walls, carved from the same sandstone','Raj Mahal, the former royal palace','Narrow inner lanes lined with carved havelis and craft shops'],
   bestTime:'Early morning or just before sunset, to avoid the midday heat and catch the stone turning gold.',
   location:'Central Jaisalmer, on Trikuta Hill',
   distance:'Walkable from most hotels in the old city',
   nearby:['Gadisar Lake','Patwon Ki Haveli','Gandhi Chowk market'],
   tips:'Wear shoes with grip — the ramp and inner lanes are uneven stone. Many havelis and shops inside are private homes; ask before photographing residents.'},
  {id:'patwon', name:'Patwon Ki Haveli', tag:'Heritage · Havelis', short:'A cluster of five ornately carved havelis built by a single merchant family.',
   youtubeUrl:'',
   why:'Considered the grandest haveli complex in Jaisalmer — the carved sandstone facades and jharokha balconies show off the city\'s stone-carving tradition at its peak.',
   see:['Intricately latticed stone windows (jharokhas)','Mirror and mural work inside select havelis','The narrow lane view looking up at all five facades together'],
   bestTime:'Mid-morning, when the lane is quieter and light hits the carvings well.',
   location:'Old city, a short walk from the fort',
   distance:'~10 minute walk from Jaisalmer Fort',
   nearby:['Nathmal Ki Haveli','Salim Singh Ki Haveli','Jaisalmer Fort'],
   tips:'Only part of the complex is open for a ticketed interior visit; the exterior can be appreciated for free from the lane.',
   ticket:{text:'Ticketed interior visit for part of the complex; the exterior is free to see from the lane.'}},
  {id:'salim', name:'Salim Singh Ki Haveli', tag:'Heritage · Havelis', short:'A haveli famous for its distinctive arched, ship-like upper structure.',
   youtubeUrl:'',
   why:'Built for a former prime minister of the state, its top floor flares outward and is often compared to a ship\'s stern or peacock — one of the more unusual silhouettes among Jaisalmer\'s havelis.',
   see:['The overhanging blue-tinged upper balcony','Carved brackets shaped like peacocks','Views back toward the fort from the rooftop'],
   bestTime:'Late afternoon light works well on the carved facade.',
   location:'Below the fort, old city',
   distance:'~12 minute walk from Jaisalmer Fort',
   nearby:['Patwon Ki Haveli','Nathmal Ki Haveli'],
   tips:'Smaller than Patwon Ki Haveli — pair it with the other two havelis in one loop rather than visiting alone.'},
  {id:'nathmal', name:'Nathmal Ki Haveli', tag:'Heritage · Havelis', short:'A former prime minister\'s residence, famously built by two brothers from opposite ends.',
   youtubeUrl:'',
   why:'Local lore holds that two brothers carved each half of the facade independently — the result is a building that is almost, but not quite, symmetrical.',
   see:['The two subtly different halves of the main facade','Detailed stone elephants flanking the entrance','Fine wall paintings in parts of the interior'],
   bestTime:'Morning, paired with Patwon and Salim Singh havelis.',
   location:'Old city, near Patwon Ki Haveli',
   distance:'~10 minute walk from Jaisalmer Fort',
   nearby:['Patwon Ki Haveli','Salim Singh Ki Haveli'],
   tips:'Look closely at the two halves of the facade to spot the asymmetry — it\'s easy to miss at a glance.'},
  {id:'gadisar', name:'Gadisar Lake', tag:'Nature · Lake', short:'A man-made lake that was once the city\'s main water source, ringed with small shrines.',
   youtubeUrl:'',
   why:'Built to store water for a desert city, the lake is now Jaisalmer\'s most relaxed public space — ghats, temples, and migratory birds in winter.',
   see:['The carved entrance gateway, Tilon Ki Pol','Small temples and chhatris along the banks','Migratory birds in the cooler months'],
   bestTime:'Sunset, for boating and the golden light on the water.',
   location:'Southeast edge of the old city',
   distance:'~15 minute walk from Jaisalmer Fort',
   nearby:['Jaisalmer Fort','Gandhi Chowk market'],
   tips:'Boat rides are available on the lake; agree the price and duration before boarding.'},
  {id:'sulidungri', name:'Suli Dungar Viewpoint', tag:'Nature · Sunset Viewpoint', short:'A small hilltop lookout on the west side of town, with a sweeping view of the fort and the Golden City.',
   youtubeUrl:'',
   why:'Often simply called "Sunset Point" by locals, this quiet platform above the city gives one of the best panoramas of Jaisalmer Fort — especially as the sandstone glows at sunset and the fort lights come on after dark.',
   see:['A full panorama of Jaisalmer Fort and the old city','Sunset colours spreading across the sandstone rooftops','The fort lit up after dusk','A small hilltop temple'],
   bestTime:'Arrive 30–40 minutes before sunset and stay until the fort lights come on.',
   location:'West side of the city, on the small hill above the Artist Colony, off Maka Pol',
   distance:'A short auto ride or uphill walk from the old city',
   nearby:['Jaisalmer Fort','Old city lanes and markets'],
   tips:'The last stretch is a short climb on uneven ground, so wear shoes with grip and carry a phone torch for the walk down after dark. There is a small temple on top, so be respectful of worshippers.'},
  {id:'badabagh', name:'Bada Bagh', tag:'Heritage · Cenotaphs', short:'Royal cenotaphs (chhatris) set on a hillside, built for generations of Jaisalmer\'s rulers.',
   youtubeUrl:'',
   why:'Each domed chhatri commemorates a former ruler, making the site a compact, visual timeline of the Bhati dynasty — especially striking against a sunset sky.',
   see:['Rows of carved cenotaphs on the hillside','Wind turbines and open desert views beyond the site','A small dam and garden below the chhatris'],
   bestTime:'Sunset — the site is oriented for it and gets busy right before dusk.',
   location:'A few kilometres north of the city',
   distance:'~15–20 minutes by taxi or auto from the fort',
   nearby:['Desert National Park route','Sam Sand Dunes route'],
   tips:'Combine with Kuldhara and Sam Dunes if you\'re hiring a taxi for the afternoon — they sit roughly along the same route.'},
  {id:'kuldhara', name:'Kuldhara', tag:'Heritage · Abandoned village', short:'A centuries-old village abandoned overnight, now preserved as a heritage site.',
   youtubeUrl:'',
   why:'Once home to Paliwal Brahmins, the village was deserted under disputed historical circumstances and has remained empty since — now conserved with walking paths through its ruined homes.',
   see:['Rows of abandoned stone houses','A small on-site museum and temple','Open desert views from the village edge'],
   bestTime:'Late afternoon, before heading toward Sam Dunes for sunset.',
   location:'Southwest of Jaisalmer city',
   distance:'~25–30 minutes by taxi from the fort',
   nearby:['Sam Sand Dunes','Desert National Park'],
   tips:'There is an entry ticket. It pairs naturally with a Sam Dunes sunset trip on the same route.',
   ticket:{text:'Entry ticket required.'}},
  {id:'warmuseum', name:'Jaisalmer War Museum', tag:'Heritage · War Museum', short:'An Indian Army museum honouring the soldiers of the 1965 and 1971 wars, including the Battle of Longewala.',
   youtubeUrl:'',
   why:'Built by the Indian Army\'s Desert Corps and opened in 2015, it tells the story of the 1971 Battle of Longewala — fought in the desert of this district — alongside the wider history of the Indian Army.',
   see:['Tanks, guns and military vehicles, including equipment captured in 1965 and 1971','The Hunter aircraft that attacked enemy tank columns at Longewala','Longewala Hall and Indian Army Hall, with models, maps and photographs','The Honour Wall with names of Param Vir Chakra and Maha Vir Chakra awardees'],
   bestTime:'Morning or late afternoon; stay into the evening if the light and sound show is running.',
   location:'Military Station, on the Jaisalmer–Jodhpur highway',
   distance:'~10 km from the city, about 20 minutes by taxi',
   nearby:['Gadisar Lake','Jaisalmer Fort'],
   tips:'Allow 1–2 hours, including the short film in the Audio-Visual Room. Entry charges and show timings can change, so confirm locally before you go. It sits on the Jodhpur highway, so it fits easily into your arrival or departure day.',
   ticket:{text:'Entry charges apply and can change — confirm locally.'}},
  {id:'tanot', name:'Tanot Mata Temple', tag:'Heritage · Border Temple', short:'A revered desert temple near the India–Pakistan border, cared for by the Border Security Force.',
   youtubeUrl:'',
   why:'During the 1965 war the area around the temple was heavily shelled, yet local belief holds that the shells missed or failed to explode. Since then the BSF has looked after the temple, and it has become a place of faith for soldiers and pilgrims alike.',
   see:['Unexploded shells from the 1965 war, displayed in the temple museum','The Vijay Stambh, a victory pillar built after the 1971 war','Daily aarti performed by BSF personnel','Wind farms and open dunes along the long drive out'],
   bestTime:'An early start from Jaisalmer, reaching by late morning; November to January is the most comfortable season.',
   location:'Tanot, near the India–Pakistan border in Jaisalmer district',
   distance:'~120 km from the city, about 2–2.5 hours by taxi',
   nearby:['Longewala War Memorial','Ghantiyali Mata Temple (on the way)'],
   tips:'Plan it as a full-day trip and carry water, snacks and ID, since facilities along the route are limited. It is a border area, so access can be restricted at times of tension; check before setting out. Pair it with Longewala on the same drive.'},
  {id:'dnp', name:'Desert National Park', tag:'Nature · Wildlife', short:'One of the largest protected desert ecosystems in the country, home to the great Indian bustard.',
   youtubeUrl:'',
   why:'A rare chance to see genuine desert wildlife and landscape — sand dunes, scrub, and salt flats — rather than just the tourist-facing dune fields.',
   see:['Great Indian bustard and other desert birds, seasonally','Rocky and sandy desert terrain','Salt water lakes within the park'],
   bestTime:'Early morning for wildlife spotting, and cooler temperatures.',
   location:'Southwest of Jaisalmer, toward Sam',
   distance:'~40 minutes by taxi from the fort',
   nearby:['Kuldhara','Sam Sand Dunes'],
   tips:'Wildlife sightings, especially the bustard, are not guaranteed — go with realistic expectations and a good guide.'},
  {id:'sam', name:'Sam Sand Dunes', tag:'Desert · Dunes', short:'The classic rolling sand dunes most people picture when they think of Jaisalmer.',
   youtubeUrl:'',
   why:'The most accessible large dune field near the city, and the main hub for camel and jeep safaris, sunset viewing, and desert camps.',
   see:['Rolling sand dunes stretching to the horizon','Sunset over the dune field','Camel and jeep safari operators along the access road'],
   bestTime:'Late afternoon into sunset — arrive with enough time before dusk.',
   location:'~40 km west of Jaisalmer city',
   distance:'~45–60 minutes by taxi from the fort',
   nearby:['Kuldhara','Desert National Park','Khuri'],
   tips:'This is the busiest dune site near the city. For a quieter dune experience, Khuri is a calmer alternative.'},
  {id:'khuri', name:'Khuri', tag:'Desert · Village', short:'A quieter desert village with its own dunes, popular for overnight desert camps.',
   youtubeUrl:'',
   why:'A calmer alternative to Sam — smaller crowds, traditional mud-and-thatch houses, and dunes right at the edge of the village.',
   see:['Traditional Rajasthani mud houses','Smaller, quieter sand dunes','Village life away from the main tourist strip'],
   bestTime:'Overnight, if you want a desert camp experience with fewer crowds than Sam.',
   location:'Southwest of Jaisalmer, near Sam',
   distance:'~50 minutes by taxi from the fort',
   nearby:['Sam Sand Dunes','Desert National Park'],
   tips:'Ask your camp or driver in advance about facilities — options are simpler here than at the larger Sam camps.'},
]);

/* ============================================================
   DATA: History Audio Guide (Explore Jaisalmer)
   One record per attraction + language, shaped like the future Admin
   Panel / database row, so a backend can return the same records.
   Attraction content itself stays in ATTRACTIONS (linked by attractionId).
   - Shown publicly only when enabled && published && audioUrl is set.
   - Replacing a narration = change audioUrl (and updatedAt); UI never
     derives filenames, so v2/v3 files need no code change.
   - Add Hindi etc. as extra records with language:'hi'; a language
     switch appears automatically when a place has 2+ published languages.
   - transcript: approved narration text only (blank line = new paragraph).
     Leave '' to hide "Read the story". Never add unverified history here.
   - duration (seconds) is optional; the real length is read from the
     file once it plays.
   All entries ship as drafts until the approved MP3s are uploaded. Until
   then each place is read aloud by the device voice from its existing page
   text (see HISTORY_AUDIO_VOICE). Add ?audio-preview to preview MP3 drafts.
   ============================================================ */
const HISTORY_AUDIO_FEED = {url:null};   // future: '/api/history-audio' → {"records":[…]}
const HISTORY_AUDIO = VJData.get('HISTORY_AUDIO', [
  {attractionId:'fort',     type:'history', language:'en', title:'History of Jaisalmer Fort',        audioUrl:'assets/audio/history/en/jaisalmer-fort.mp3',        duration:null, transcript:'', narrator:'', enabled:true, published:false, createdAt:'', updatedAt:''},
  {attractionId:'patwon',   type:'history', language:'en', title:'History of Patwon Ki Haveli',      audioUrl:'assets/audio/history/en/patwon-ki-haveli.mp3',      duration:null, transcript:'', narrator:'', enabled:true, published:false, createdAt:'', updatedAt:''},
  {attractionId:'salim',    type:'history', language:'en', title:'History of Salim Singh Ki Haveli', audioUrl:'assets/audio/history/en/salim-singh-ki-haveli.mp3', duration:null, transcript:'', narrator:'', enabled:true, published:false, createdAt:'', updatedAt:''},
  {attractionId:'nathmal',  type:'history', language:'en', title:'History of Nathmal Ki Haveli',     audioUrl:'assets/audio/history/en/nathmal-ki-haveli.mp3',     duration:null, transcript:'', narrator:'', enabled:true, published:false, createdAt:'', updatedAt:''},
  {attractionId:'gadisar',  type:'history', language:'en', title:'History of Gadisar Lake',          audioUrl:'assets/audio/history/en/gadisar-lake.mp3',          duration:null, transcript:'', narrator:'', enabled:true, published:false, createdAt:'', updatedAt:''},
  {attractionId:'sulidungri',type:'history', language:'en', title:'Story of Suli Dungar Viewpoint', audioUrl:'assets/audio/history/en/suli-dungri-viewpoint.mp3', duration:null, transcript:'', narrator:'', enabled:true, published:false, createdAt:'', updatedAt:''},
  {attractionId:'badabagh', type:'history', language:'en', title:'History of Bada Bagh',             audioUrl:'assets/audio/history/en/bada-bagh.mp3',             duration:null, transcript:'', narrator:'', enabled:true, published:false, createdAt:'', updatedAt:''},
  {attractionId:'kuldhara', type:'history', language:'en', title:'History of Kuldhara',              audioUrl:'assets/audio/history/en/kuldhara.mp3',              duration:null, transcript:'', narrator:'', enabled:true, published:false, createdAt:'', updatedAt:''},
  {attractionId:'warmuseum',type:'history', language:'en', title:'Story of the Jaisalmer War Museum', audioUrl:'assets/audio/history/en/jaisalmer-war-museum.mp3',  duration:null, transcript:'', narrator:'', enabled:true, published:false, createdAt:'', updatedAt:''},
  {attractionId:'tanot',    type:'history', language:'en', title:'Story of Tanot Mata Temple',      audioUrl:'assets/audio/history/en/tanot-mata-temple.mp3',     duration:null, transcript:'', narrator:'', enabled:true, published:false, createdAt:'', updatedAt:''},
  {attractionId:'dnp',      type:'history', language:'en', title:'Story of Desert National Park',    audioUrl:'assets/audio/history/en/desert-national-park.mp3',  duration:null, transcript:'', narrator:'', enabled:true, published:false, createdAt:'', updatedAt:''},
  {attractionId:'sam',      type:'history', language:'en', title:'Story of the Sam Sand Dunes',      audioUrl:'assets/audio/history/en/sam-sand-dunes.mp3',        duration:null, transcript:'', narrator:'', enabled:true, published:false, createdAt:'', updatedAt:''},
  {attractionId:'khuri',    type:'history', language:'en', title:'Story of Khuri',                   audioUrl:'assets/audio/history/en/khuri.mp3',                 duration:null, transcript:'', narrator:'', enabled:true, published:false, createdAt:'', updatedAt:''},
]);

/* id = activityId. Editorial detail lives in ACTIVITY_INFO; local operators in PROVIDERS / EXPERIENCES. */
const ACTIVITIES = VJData.get('ACTIVITIES', [
  {id:'camel-safari', name:'Camel Safari', cat:'Desert'}, {id:'jeep-safari', name:'Jeep Safari', cat:'Desert'},
  {id:'dune-bashing', name:'Dune Bashing', cat:'Desert'}, {id:'parasailing', name:'Parasailing', cat:'Adventure'}, {id:'paramotoring', name:'Paramotoring', cat:'Adventure'},
  {id:'rajasthani-cultural-evening', name:'Rajasthani Cultural Evening', cat:'Culture'},
  {id:'reel-photographer', name:'Reel Photographer', cat:'Photography'},
  {id:'stargazing', name:'Stargazing', cat:'Night'}, {id:'sunset-at-the-dunes', name:'Sunset at the Dunes', cat:'Night'},
  {id:'market-shopping', name:'Market Shopping', cat:'Shopping'}, {id:'handicrafts-textiles', name:'Handicrafts & Textiles', cat:'Shopping'}, {id:'rajasthani-thali', name:'Rajasthani Thali', cat:'Food'},
  {id:'village-visit', name:'Village Visit', cat:'Culture'}, {id:'lake-boating', name:'Lake Boating', cat:'Nature'},
]);

/* Trip plans: admin → Content → Plan a trip (published/itineraries), or these built-in ones. Keyed by plan ID, in tab order. */
const ITINERARIES = VJData.get('ITINERARIES', {
  '1day': {label:'1 Day', days:[
    {title:'Day 1 — Fort & lake, compact', morning:'Jaisalmer Fort and its inner lanes, including the Jain temples.', afternoon:'Patwon Ki Haveli, Nathmal Ki Haveli and Salim Singh Ki Haveli, all within walking distance of each other.', evening:'Gadisar Lake at sunset, with a short boat ride.', note:'A dune trip needs its own half-day — skip it if you only have one day, or swap the lake evening for a rushed Sam Dunes sunset if a taxi is arranged in advance.'}
  ]},
  '2day': {label:'2 Days', days:[
    {title:'Day 1 — The city', morning:'Jaisalmer Fort and inner lanes.', afternoon:'The three main havelis on foot.', evening:'Gandhi Chowk market, then Gadisar Lake for sunset.'},
    {title:'Day 2 — The desert', morning:'Kuldhara and Desert National Park.', afternoon:'Bada Bagh cenotaphs en route back.', evening:'Sam Sand Dunes for sunset and a camel or jeep safari.'}
  ]},
  '3day': {label:'3 Days', days:[
    {title:'Day 1 — The city', morning:'Jaisalmer Fort and inner lanes.', afternoon:'The three main havelis on foot.', evening:'Gadisar Lake at sunset.'},
    {title:'Day 2 — Desert day trip', morning:'Bada Bagh and Kuldhara.', afternoon:'Desert National Park.', evening:'Sam Sand Dunes for sunset, camel or jeep safari.'},
    {title:'Day 3 — Slow morning, quiet desert', morning:'Gandhi Chowk market for textiles and leatherwork.', afternoon:'Khuri village for a quieter dune walk.', evening:'Free evening — an overnight desert camp is a good add-on here.', note:'If you camped overnight at Sam or Khuri, use this day in reverse and return to the city by afternoon.'}
  ]},
  'weekend': {label:'Weekend', days:[
    {title:'Saturday', morning:'Jaisalmer Fort.', afternoon:'Havelis loop.', evening:'Gadisar Lake, then a Rajasthani cultural evening if one is on.'},
    {title:'Sunday', morning:'Bada Bagh and Kuldhara.', afternoon:'Return to the city, rest through the heat.', evening:'Sam Sand Dunes for sunset before heading back.'}
  ]},
  'desert': {label:'Desert-Focused', days:[
    {title:'Day 1 — Into the desert', morning:'Desert National Park, early for wildlife.', afternoon:'Kuldhara and Bada Bagh.', evening:'Sam Sand Dunes sunset and overnight desert camp.'},
    {title:'Day 2 — Quiet dunes', morning:'Sunrise over the dunes from camp.', afternoon:'Khuri village.', evening:'Return to the city.'}
  ]},
  'heritage': {label:'Heritage-Focused', days:[
    {title:'Day 1 — Fort and havelis', morning:'Jaisalmer Fort in depth, including its temples.', afternoon:'Patwon, Nathmal and Salim Singh havelis.', evening:'Gadisar Lake and its shrines.'},
    {title:'Day 2 — Beyond the walls', morning:'Bada Bagh cenotaphs.', afternoon:'Kuldhara abandoned village.', evening:'A heritage walk through the old city\'s lesser-known lanes.'}
  ]},
  'family': {label:'Family Trip', days:[
    {title:'Day 1 — Easy city pace', morning:'Jaisalmer Fort, at a relaxed pace with breaks.', afternoon:'Gadisar Lake boating.', evening:'Gandhi Chowk market for an early dinner.'},
    {title:'Day 2 — Desert, kept simple', morning:'Bada Bagh, a short and scenic stop.', afternoon:'Rest through the midday heat.', evening:'Sam Sand Dunes — a short camel ride and sunset, back before it gets late.'}
  ]},
  'couple': {label:'Couple Trip', days:[
    {title:'Day 1 — The city at your pace', morning:'Jaisalmer Fort, unhurried.', afternoon:'Havelis, with time for photographs.', evening:'Gadisar Lake at sunset, boat ride included.'},
    {title:'Day 2 — Desert evening', morning:'Kuldhara for a quiet, atmospheric stop.', afternoon:'Rest before the heat passes.', evening:'Sam Dunes sunset, with an overnight desert camp for stargazing.'}
  ]},
});

/* ============================================================
   GETTING AROUND JAISALMER — transport data
   ------------------------------------------------------------
   TRANSPORT_MODES  the six ways to get around. Editorial guide copy only —
                    NOT providers. `aliases` resolve a provider's category
                    label to a mode; `synonyms` are extra words a visitor may
                    search for the mode itself (never destinations).
   TRANSPORT_PROVIDERS  real, active local businesses ONLY. Deliberately empty:
                    nothing is invented. The directory, its search/sort/contact
                    actions and the Smart Tourist Map are all driven by this
                    one list (or by TRANSPORT_FEED.url once an API exists).
                    Record shape (all optional except id, businessName, category):
                    {id, businessName, category, subcategory, description,
                     shortDescription, latitude, longitude, serviceAreas[],
                     serviceTags[], rating, reviewCount, verified, featured,
                     phone, whatsapp, profileUrl, navigationUrl, image, logo,
                     active, createdAt, order}
                    category ∈ taxi | auto | bike | scooty | car | transfers | guide
   ============================================================ */
const TRANSPORT_MODES = [
  {id:'guide', label:'Tour Guide', short:'Guide', emoji:'🧭', quick:'Hire a Guide', one:'tour guide', many:'tour guides', mapSub:'Guides', mapCat:'services',
   area:'Fort, old city, havelis and day trips', note:'A local guide to show you the fort, havelis and temples and help you find your way. Agree the fee, hours and language first.',
   aliases:['guide','tour guide','local guide','heritage guide','city guide','desert guide','guided tour'], synonyms:['guide']},
  {id:'taxi', label:'Taxi & Cab', short:'Taxi', emoji:'🚕', quick:'Hire a Taxi', one:'taxi service', many:'taxi services', mapSub:'Taxi',
   area:'City, sightseeing and day trips', note:'Point-to-point rides, sightseeing and day trips, including runs out to Kuldhara and Sam.',
   aliases:['taxi','cab','taxi & cab','local driver','driver','sightseeing taxi'], synonyms:['cab']},
  {id:'auto', label:'Auto Rickshaw', short:'Auto', emoji:'🛺', quick:'Take an Auto', one:'auto service', many:'auto services', mapSub:'Auto',
   area:'Within the city and old town', note:'Quickest way to move between the fort, havelis and market short distances.',
   aliases:['auto','auto rickshaw','rickshaw','local auto','tuk tuk','tuktuk'], synonyms:['rickshaw','tuk tuk']},
  {id:'bike', label:'Bike Rental', short:'Rent a Bike', emoji:'🏍️', quick:'Rent a Bike', one:'bike rental', many:'bike rentals', mapSub:'Bike Rental',
   area:'City and nearby routes', note:'Useful for exploring at your own pace within the city and short outskirts trips.',
   aliases:['bike','bike rental','motorcycle','motorcycle rental','motorbike'], synonyms:['motorcycle','motorbike']},
  {id:'scooty', label:'Scooty Rental', short:'Rent a Scooty', emoji:'🛵', quick:'Rent a Scooty', one:'scooty rental', many:'scooty rentals', mapSub:'Scooty Rental',
   area:'City and desert-road day trips', note:'A common choice for visitors comfortable riding, for trips out toward Sam.',
   aliases:['scooty','scooty rental','scooter','scooter rental'], synonyms:['scooter']},
  {id:'car', label:'Car Rental', short:'Rent a Car', emoji:'🚗', quick:'Rent a Car', one:'car rental', many:'car rentals', mapSub:'Car Rental',
   area:'City and long day trips', note:'Only recommended for self-drive if you\'re confident driving unfamiliar desert roads.',
   aliases:['car','car rental','self-drive','self-drive car','chauffeur-driven car','private car'], synonyms:[]},
  {id:'transfers', label:'Transfers', short:'Transfers', emoji:'🧳', quick:'Transfers', one:'transfer service', many:'transfer services', mapSub:'Transfers',
   area:'Airport, railway station, bus stand, hotels and the desert', note:'Pre-arranged rides to or from the airport, railway station or bus stand, and transfers out to Sam Dunes and the desert.',
   aliases:['transfer','transfers','airport transfer','railway transfer','bus transfer','hotel transfer','sam dunes transfer','desert transfer','pickup','pick-up'], synonyms:['transfer','pickup']}
];
const TRANSPORT_PROVIDERS = VJData.get('TRANSPORT_PROVIDERS', []);
const TRANSPORT_FEED = {url:null};   // future: '/api/transport-providers' → {"providers":[…]}

/* ============================================================
   FEATURED BRANDS / PARTNERS — local marquee data
   ------------------------------------------------------------
   Placeholder / demo entries only. These are generic, descriptive
   placeholders (not real companies) until real partners are
   confirmed and added by an admin. Fields are shaped to match a
   future Admin Panel schema, so this array can later be swapped
   for an API response with no markup changes.
   - name:      display label (generic placeholder for now)
   - category:  one of the supported partner categories
   - logo:      image URL, or null to render a text wordmark
   - url:       external site, or null (non-clickable demo entry)
   - order:     display order
   - active:    include in the marquee
   - verified:  reserved for future "verified partner" badge
   - featured:  reserved for future highlighting/sorting
   ============================================================ */
/* placeholder:true = demo record, available for preview in the local emulator.
   Remove the flag (or the record) once a real partner is confirmed. */
const PARTNERS_CONFIG = VJData.partnersConfig({ showPlaceholders:false });
const FEATURED_BRANDS = VJData.get('FEATURED_BRANDS', [
  {name:'Golden Fort Heritage Walks', category:'Tour Operators', logo:null, url:null, order:1, active:true, verified:false, featured:false, placeholder:true},
  {name:'Desert Trail Camel Safaris', category:'Safari / Desert Experience Partners', logo:null, url:null, order:2, active:true, verified:false, featured:false, placeholder:true},
  {name:'Thar Dunes Camp', category:'Hotels', logo:null, url:null, order:3, active:true, verified:false, featured:false, placeholder:true},
  {name:'City Taxi Co-operative', category:'Transport Partners', logo:null, url:null, order:4, active:true, verified:false, featured:false, placeholder:true},
  {name:'Jaisalmer Craft Bazaar', category:'Local Businesses', logo:null, url:null, order:5, active:true, verified:false, featured:false, placeholder:true},
  {name:'Haveli Homestays Collective', category:'Hotels', logo:null, url:null, order:6, active:true, verified:false, featured:false, placeholder:true},
  {name:'Sunset Point Jeep Tours', category:'Safari / Desert Experience Partners', logo:null, url:null, order:7, active:true, verified:false, featured:false, placeholder:true},
  {name:'Old Town Auto Union', category:'Transport Partners', logo:null, url:null, order:8, active:true, verified:false, featured:false, placeholder:true},
  {name:'Rajasthan Roots Guides', category:'Tourism Partners', logo:null, url:null, order:9, active:true, verified:false, featured:false, placeholder:true},
  {name:'Local Handicrafts Cooperative', category:'Local Service Partners', logo:null, url:null, order:10, active:true, verified:false, featured:false, placeholder:true},
]);

const NEAR_ME_BY_AREA = {
  fort:['🏰 Attractions','🍽️ Food','🏧 ATM','🚻 Toilet','🅿️ Parking','⛽ Petrol','🚑 Hospital','💊 Pharmacy','🚕 Taxi','🛺 Auto'],
  gandhi:['🛍️ Shopping','🍽️ Food','🎟️ Haveli tickets','🏧 ATM','🚻 Toilet','🅿️ Parking','⛽ Petrol','🚑 Emergency','💊 Pharmacy','🛺 Auto'],
  gadisar:['🛶 Boating','🍽️ Food','📸 Photo spots','🏧 ATM','🚻 Toilet','🅿️ Parking','⛽ Petrol','🚑 Emergency','🚕 Taxi'],
  sulidungri:['🌅 Sunset view','📸 Photo spots','🛕 Temple','🚻 Toilet','🅿️ Parking','🚑 Emergency','🛺 Auto'],
  badabagh:['🌅 Sunset view','📸 Photo spots','🚻 Toilet','🅿️ Parking','🚑 Emergency','🚕 Taxi','🛺 Auto'],
  warmuseum:['🎖️ Museum halls','🎬 Film & evening show','☕ Cafeteria','🛍️ Souvenir shop','🚻 Toilet','🅿️ Parking','🚑 Emergency','🚕 Taxi'],
  kuldhara:['🎟️ Entry ticket','📸 Photo spots','🚻 Toilet','🅿️ Parking','🚑 Emergency','🚕 Taxi'],
  dnp:['🦅 Desert birds','🧭 Local guide','🚻 Toilet','🅿️ Parking','⛽ Petrol','🚑 Emergency','🚕 Taxi'],
  sam:['🐪 Camel Safari','🚙 Jeep Safari','⛺ Desert Camp','🍽️ Food','🏧 ATM','🚻 Toilet','🅿️ Parking','⛽ Petrol','🚑 Emergency'],
  khuri:['🐪 Camel Safari','⛺ Desert Camp','🍽️ Food','🏧 ATM','🚻 Toilet','🅿️ Parking','⛽ Petrol','🚑 Emergency','🚕 Taxi'],
  tanot:['🛕 Temple','🏛️ Temple museum','🍽️ Food','🏧 ATM','🚻 Toilet','🅿️ Parking','⛽ Petrol','🚑 Emergency','🚕 Full-day taxi'],
};

/* Tourist Mode areas ↔ Explore Jaisalmer places.
   places: ATTRACTIONS ids shown as "Places here" (they open the same detail view as Explore).
   ll:     verified approximate coordinates, used to pick the closest area from "Use my location".
           Left null where no verified point exists yet (Suli Dungar, War Museum) — those areas
           are still selectable, just not auto-detected or map-centred.
   note:   extra practical line for that area (only verified facts). */
const TM_AREAS = {
  fort:      {group:'city', places:['fort','salim'],       ll:[26.9124,70.9127]},
  gandhi:    {group:'city', places:['patwon','nathmal'],   ll:[26.9135,70.9146]},
  gadisar:   {group:'city', places:['gadisar'],            ll:[26.9080,70.9219]},
  sulidungri:{group:'city', places:['sulidungri'],         ll:null},
  badabagh:  {group:'out',  places:['badabagh'],           ll:[26.9583,70.8917]},
  warmuseum: {group:'out',  places:['warmuseum'],          ll:null},
  kuldhara:  {group:'out',  places:['kuldhara'],           ll:[26.8339,70.7864]},
  dnp:       {group:'out',  places:['dnp'],                ll:[26.8058,70.6294]},
  sam:       {group:'out',  places:['sam'],                ll:[26.9020,70.6197]},
  khuri:     {group:'out',  places:['khuri'],              ll:[26.7167,70.6167]},
  tanot:     {group:'out',  places:['tanot'],              ll:[27.7984,70.3545],
              note:'Visitors cannot go beyond the temple toward the border without prior permission from the district and military authorities.'},
};
// An area without a built-in point uses its place's map pin once one is published in the admin.
(function(){
  const geo = VJData.get('ATTRACTION_GEO', {});
  Object.keys(TM_AREAS).forEach(id=>{
    const a = TM_AREAS[id], g = a.ll ? null : a.places.map(p=>geo[p]).find(x=>x && x.ll);
    if(g) a.ll = g.ll;
  });
})();
const TM_PLACE_EMOJI = {fort:'🏰',salim:'🏛️',patwon:'🏛️',nathmal:'🏛️',gadisar:'🛶',sulidungri:'🌅',badabagh:'🕌',warmuseum:'🎖️',kuldhara:'🏚️',dnp:'🦅',sam:'🏜️',khuri:'⛺',tanot:'🛕'};

/* ============================================================
   RENDER: Explore rail
   ============================================================ */
const exploreRail = document.getElementById('exploreRail');
ATTRACTIONS.forEach(a=>{
  const card = document.createElement('div');
  const hasVideo = !!youtubeWatchUrl(a.youtubeUrl);
  card.className = 'card-attraction' + (hasVideo ? ' has-video' : '');
  card.innerHTML = `
    ${placeMediaHtml(a, duneSvg(a.id), 'card-media')}
    <div class="card-body">
      <div class="card-tag">${escHtml(a.tag)}</div>
      <h3>${escHtml(a.name)}</h3>
      <p>${escHtml(a.short)}</p>
      <div class="card-dist" data-dist-for="${a.id}" hidden></div>
    </div>`;
  // Without a video the whole card is the "view details" button, as before. With one, the image
  // is its own YouTube link, so the text area takes the button role (a link can't sit inside a button).
  const opener = hasVideo ? card.querySelector('.card-body') : card;
  opener.tabIndex = 0;
  opener.setAttribute('role','button');
  opener.setAttribute('aria-label','View details for '+a.name);
  card.addEventListener('click', e=>{ if(e.target.closest('.youtube-card')) return; openModal(a); });
  opener.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openModal(a); } });
  exploreRail.appendChild(card);
});
/* Personal distances on the Explore cards — only once the visitor has shared a location (any "My location" button
   on the page). Reuses the one shared position: no GPS request per card, nothing shown otherwise. */
function updateExploreDistances(){
  const P = window.JMPlace;
  exploreRail.querySelectorAll('[data-dist-for]').forEach(n=>{
    const km = (P && P.distanceKm) ? P.distanceKm(n.dataset.distFor) : null;
    if(km==null){ n.hidden = true; n.textContent = ''; return; }
    n.textContent = '📍 ' + JMLocation.formatDistance(km) + ' away · direct';
    n.hidden = false;
  });
}
document.addEventListener('jm:location', ()=>{
  updateExploreDistances();
  try{ if(typeof renderTmPlaces==='function') renderTmPlaces(currentArea); }catch(e){}
});

/* ============================================================
   YouTube videos on place images
   Uses ATTRACTIONS[].youtubeUrl. A plain link that opens in a new tab:
   no iframe, no player script — nothing from YouTube loads before a click.
   ============================================================ */
// Valid YouTube link → clean https watch URL; anything else (empty, placeholder, other site) → null.
function youtubeWatchUrl(raw){
  let u;
  try{ u = new URL(String(raw || '').trim()); }catch(e){ return null; }
  if(u.protocol!=='https:' && u.protocol!=='http:') return null;
  const host = u.hostname.toLowerCase().replace(/^(www|m)\./, '');
  let id = '';
  if(host==='youtu.be') id = u.pathname.split('/')[1];
  else if(host==='youtube.com'){
    if(u.pathname==='/watch') id = u.searchParams.get('v');
    else { const m = /^\/(shorts|live|embed)\/([^/?#]+)/.exec(u.pathname); if(m) id = m[2]; }
  }
  if(!/^[A-Za-z0-9_-]{11}$/.test(id || '')) return null;
  const t = u.searchParams.get('t');
  return 'https://www.youtube.com/watch?v=' + id + (t && /^\d+s?$/.test(t) ? '&t=' + t : '');
}
// A place photo from the admin: an https:// link (Firebase Storage upload) or a file on this site (/…); anything else → null.
function placePhotoUrl(raw){
  const s = String(raw || '').trim();
  if(/^\/[\w\-./%]+$/.test(s) && !s.startsWith('//')) return s;
  try{ const u = new URL(s); return u.protocol==='https:' ? u.href : null; }catch(e){ return null; }
}
// The place image: the admin's photo (or the drawn dunes), wrapped in a YouTube link with a play mark when the place has a video.
// cls = classes of the image wrapper; with no cls and no video the artwork is returned bare.
function placeMediaHtml(a, art, cls){
  const photo = placePhotoUrl(a.image);
  if(photo) art = `<img class="place-photo" src="${escHtml(photo)}" alt="${escHtml(a.imageAlt || a.name)}" loading="lazy" decoding="async" onerror="this.remove()">`;
  const url = youtubeWatchUrl(a.youtubeUrl);
  if(!url) return cls ? `<div class="${cls}">${art}</div>` : art;
  return `<a class="${cls ? cls + ' ' : ''}youtube-card" href="${escHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="Watch ${escHtml(a.name)} video on YouTube (opens in a new tab)">${art}<span class="youtube-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" focusable="false"><path d="M8.5 5.8v12.4a.8.8 0 0 0 1.2.7l9.7-6.2a.8.8 0 0 0 0-1.4L9.7 5.1a.8.8 0 0 0-1.2.7z" fill="currentColor"/></svg></span></a>`;
}

function duneSvg(seed){
  // simple deterministic abstract dune illustration per card, no external images
  const hues = ['#E6D5BA','#B86F3C','#C9A45C'];   // soft sand · copper · muted gold (copper lands most often)
  const h = hues[seed.length % hues.length];
  return `<svg width="100%" height="100%" viewBox="0 0 250 140" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="250" height="140" fill="#172B2A"/>
    <circle cx="205" cy="30" r="16" fill="${h}" opacity="0.55"/>
    <path d="M0 95 Q60 70 130 92 T250 85 V140 H0 Z" fill="${h}" opacity="0.5"/>
    <path d="M0 120 Q80 100 160 118 T250 112 V140 H0 Z" fill="${h}" opacity="0.3"/>
  </svg>`;
}

/* ============================================================
   RENDER: Activities grid
   ============================================================ */
const activitiesGrid = document.getElementById('activitiesGrid');
ACTIVITIES.forEach(act=>{
  const el = document.createElement('div');
  el.className = 'activity-tile';
  el.innerHTML = `<h3><button type="button" class="at-btn" data-activity="${escHtml(act.id)}" aria-haspopup="dialog" aria-label="${escHtml(act.name)}: view details and local options">${escHtml(act.name)}</button></h3>
    <div class="at-foot"><span>${escHtml(act.cat)}</span><svg class="at-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
  activitiesGrid.appendChild(el);
});

/* ============================================================
   RENDER: Trip tabs + itinerary
   ============================================================ */
const tripTabs = document.getElementById('tripTabs');
const itineraryDays = document.getElementById('itineraryDays');
let activeTrip = ITINERARIES['1day'] ? '1day' : Object.keys(ITINERARIES)[0];

Object.keys(ITINERARIES).forEach(key=>{
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'trip-tab' + (key===activeTrip ? ' is-active' : '');
  btn.setAttribute('aria-pressed', String(key===activeTrip));
  btn.textContent = ITINERARIES[key].label;
  btn.dataset.tripId = key;
  btn.addEventListener('click', ()=>{
    activeTrip = key;
    document.querySelectorAll('.trip-tab').forEach(b=>{ b.classList.remove('is-active'); b.setAttribute('aria-pressed','false'); });
    btn.classList.add('is-active'); btn.setAttribute('aria-pressed','true');
    renderItinerary();
  });
  tripTabs.appendChild(btn);
});

function renderItinerary(){
  itineraryDays.innerHTML = '';
  if(!ITINERARIES[activeTrip]) return;
  ITINERARIES[activeTrip].days.forEach(d=>{
    const card = document.createElement('div');
    card.className = 'day-card';
    const slot = (t, v)=> v ? `<div class="day-slot"><div class="slot-time">${t}</div><div class="slot-text">${escHtml(v)}</div></div>` : '';
    card.innerHTML = `
      ${d.title ? `<h3>${escHtml(d.title)}</h3>` : ''}
      ${slot('Morning', d.morning)}${slot('Afternoon', d.afternoon)}${slot('Evening', d.evening)}
      ${d.note ? `<div class="day-note">${escHtml(d.note)}</div>` : ''}`;
    // Link the places this day mentions to the Smart Tourist Map (only places that really have map data).
    const spots = window.JMMap ? window.JMMap.findInText([d.morning, d.afternoon, d.evening].join(' ')) : [];
    if(spots.length){
      const row = document.createElement('div');
      row.className = 'day-places';
      const label = document.createElement('span');
      label.className = 'day-places-label'; label.textContent = 'On the map';
      row.appendChild(label);
      spots.forEach(p=>{
        const a = document.createElement('a');
        a.className = 'day-place'; a.href = '#map/' + encodeURIComponent(p.slug); a.textContent = p.name;
        a.setAttribute('aria-label', 'Show ' + p.name + ' on the map');
        row.appendChild(a);
      });
      card.appendChild(row);
    }
    itineraryDays.appendChild(card);
  });
}
renderItinerary();

/* ============================================================
   RENDER: Featured brands / local partners marquee
   ============================================================ */
const PARTNER_CATEGORY_SHORT = {
  'Tourism Partners':'Tourism',
  'Local Businesses':'Local',
  'Hotels':'Stay',
  'Restaurants':'Restaurant',
  'Fast Food':'Fast Food',
  'Desert Camps':'Desert Camp',
  'Tour Operators':'Tours',
  'Transport Partners':'Transport',
  'Safari / Desert Experience Partners':'Safari',
  'Media Partners':'Media',
  'Local Service Partners':'Service',
};

/* Only absolute http(s) URLs are ever used as link targets or image sources. */
function safeHttpUrl(raw){
  try{ const u = new URL(String(raw || '').trim()); return (u.protocol==='https:' || u.protocol==='http:') ? u.href : null; }
  catch(e){ return null; }
}
/* A partner's link: a page on this site ('/workneed', '#plan' — same tab) or an http(s) site (new tab). */
function partnerLink(raw){
  const v = String(raw || '').trim();
  if(/^\/(?!\/)[^\s]*$|^#[A-Za-z][\w-]*$/.test(v)) return {href:v, external:false};
  const u = safeHttpUrl(v);
  return u ? {href:u, external:true} : null;
}
/* Name colours the admin can pick for Best Choice (light tints that stay readable on the dark strip). */
const PARTNER_COLORS = ['gold','orange','green','blue','purple','pink','red','white'];
function renderPartners(){
  const list = document.getElementById('partnerList');
  if(!list) return;
  const demoNames = new Set(['service provider ltd', 'workneed app']);
  const demoPreview = window.VJ_FIREBASE?.USE_EMULATORS && PARTNERS_CONFIG.showPlaceholders;
  const items = FEATURED_BRANDS.filter(b => {
    const name = String(b.name || '').trim().toLowerCase();
    return b.active && name && (demoPreview || (!b.placeholder && !demoNames.has(name)));
  }).sort((a, b) => a.order - b.order);

  list.closest('section').hidden = items.length === 0;
  items.forEach(b => {
    const row = document.createElement('li');
    const link = partnerLink(b.url), logo = safeHttpUrl(b.logo);
    const item = document.createElement(link ? 'a' : 'span');
    item.className = 'marquee-item';
    if(link){
      item.href = link.href;
      if(link.external){ item.target = '_blank'; item.rel = 'noopener noreferrer'; }
    }
    if(PARTNER_COLORS.includes(b.color)) item.dataset.color = b.color;
    if(logo){
      const image = document.createElement('img');
      image.className = 'marquee-logo-img';
      image.src = logo;
      image.alt = b.name;
      image.loading = 'lazy';
      image.width = 140;
      image.height = 30;
      item.append(image);
    } else {
      const category = document.createElement('span');
      category.className = 'marquee-cat';
      category.textContent = PARTNER_CATEGORY_SHORT[b.category] || b.category || '';
      const name = document.createElement('span');
      name.className = 'marquee-logo-text';
      name.textContent = b.name;
      item.append(category, name);
    }
    row.append(item);
    list.append(row);
  });
}
renderPartners();

/* ============================================================
   TOURIST MODE
   ============================================================ */
const touristModeBtn = document.getElementById('touristModeBtn');
const touristModePanel = document.getElementById('touristModePanel');
const tmpStatus = document.getElementById('tmpStatus');
const nearMeGrid = document.getElementById('nearMeGrid');
const areaSelect = document.getElementById('areaSelect');
let currentArea = 'fort';
let tmUserLoc = null;   // {lat,lng,acc,ts} — the visitor's shared position (see JMLocation); never sent anywhere

/* ============================================================
   SHARED VISITOR LOCATION — JMLocation
   One position for the whole page, so Tourist Mode, the place sheet, the
   transport directory and the Smart Tourist Map never ask the device twice
   for the same thing.
   • the device is asked ONLY from an explicit tap — never on page load
     (except a silent refresh when the visitor has already allowed this site)
   • kept in memory (tmUserLoc) and, for REMEMBER_MS, in this browser's
     localStorage, so a reload or a second visit soon after doesn't ask
     again. It is never sent anywhere.
   • one request at a time; a recent fix (≤ maxAgeMs) is reused, with its age
   • permission "denied" is known up front (Permissions API) → no prompt loop
   ============================================================ */
const JMLocation = (function(){
  const EARTH_RADIUS_KM = 6371;            // mean Earth radius — the one constant every distance on the site uses
  const STALE_MS = 5*60*1000;              // older than this, a fix is "last known", not "where you are now"
  const REMEMBER_MS = 30*60*1000;          // a shared position is remembered on this device for this long
  const STORE_KEY = 'vj_last_location';
  let inflight = null, perm = 'unknown', watchId = null, watchers = [], lastAnnounce = null;
  const isNum = v=>typeof v==='number' && isFinite(v);
  function isValidPoint(p){ return !!p && isNum(p.lat) && isNum(p.lng) && p.lat>=-90 && p.lat<=90 && p.lng>=-180 && p.lng<=180; }

  /* calculateStraightLineDistance(origin, destination) → KILOMETRES (Haversine great-circle distance).
     origin/destination: {lat, lng} in decimal degrees. Identical points → 0.
     Missing or invalid coordinates → null (never NaN, never a guess). */
  function calculateStraightLineDistance(origin, destination){
    if(!isValidPoint(origin) || !isValidPoint(destination)) return null;
    if(origin.lat===destination.lat && origin.lng===destination.lng) return 0;
    const r = Math.PI/180, dLat = (destination.lat-origin.lat)*r, dLng = (destination.lng-origin.lng)*r;
    const h = Math.sin(dLat/2)**2 + Math.cos(origin.lat*r)*Math.cos(destination.lat*r)*Math.sin(dLng/2)**2;
    const km = 2*EARTH_RADIUS_KM*Math.asin(Math.min(1, Math.sqrt(h)));
    return isFinite(km) ? km : null;
  }
  /* Readable, deliberately rounded: "under 10 m", "650 m", "2.4 km", "18.7 km", "142 km". */
  function formatDistance(km){
    if(!isNum(km) || km<0) return '';
    const m = km*1000;
    if(m<10) return 'under 10 m';
    if(m<995) return (Math.round(m/10)*10)+' m';
    return (km<99.95 ? (Math.round(km*10)/10).toFixed(1) : String(Math.round(km)))+' km';
  }

  function get(){ return isValidPoint(tmUserLoc) ? Object.assign({}, tmUserLoc) : null; }
  function age(){ const u = get(); return (u && isNum(u.ts)) ? Math.max(0, Date.now()-u.ts) : Infinity; }
  function isStale(){ return age() > STALE_MS; }
  function announce(){ lastAnnounce = get(); try{ document.dispatchEvent(new CustomEvent('jm:location', {detail:{available:!!lastAnnounce}})); }catch(e){} }
  function remember(p){ try{ if(p) localStorage.setItem(STORE_KEY, JSON.stringify(p)); else localStorage.removeItem(STORE_KEY); }catch(e){} }
  function set(lat, lng, acc, ts){
    const now = Date.now();
    const p = {lat:lat, lng:lng, acc:(isNum(acc) && acc>=0) ? acc : null,
      ts:(isNum(ts) && ts<=now+1000 && ts>now-86400000) ? Math.min(ts, now) : now};
    if(!isValidPoint(p)) return null;
    tmUserLoc = p; remember(p);
    // Live updates (watch) arrive every few seconds: tell the page only when the visitor has really moved.
    const prev = lastAnnounce, moved = prev ? calculateStraightLineDistance(prev, p) : null;
    if(!prev || moved==null || moved > 0.03 || p.ts - prev.ts > 60000) announce();
    return Object.assign({}, p);
  }
  function clear(){ tmUserLoc = null; remember(null); announce(); }
  // A position shared on this device in the last REMEMBER_MS comes back after a reload — no new prompt.
  (function restore(){
    let v = null;
    try{ v = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); }catch(e){}
    if(!v || !isValidPoint(v) || !isNum(v.ts) || Date.now()-v.ts > REMEMBER_MS || v.ts > Date.now()+1000){ if(v) remember(null); return; }
    tmUserLoc = {lat:v.lat, lng:v.lng, acc:isNum(v.acc) ? v.acc : null, ts:v.ts};
    setTimeout(announce, 0);                 // after the page scripts have attached their listeners
  })();

  // Permission state, so a site the visitor has blocked isn't asked again and again,
  // and a site they've allowed can refresh the position without any prompt.
  try{
    if(navigator.permissions && navigator.permissions.query){
      navigator.permissions.query({name:'geolocation'}).then(st=>{
        perm = st.state;
        st.onchange = ()=>{ perm = st.state; if(perm==='denied') stopWatch(); };
      }, ()=>{});
    }
  }catch(e){}
  function permission(){ return perm; }     // 'granted' | 'denied' | 'prompt' | 'unknown'
  // What to tap to unblock location, named for the browser and phone in hand. 'denied' = the site was
  // blocked in the browser; any other state with a "blocked" error = the phone's Location is off or the browser app has no permission.
  function blockedHelp(state){
    const ua = navigator.userAgent || '';
    const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1), android = /Android/.test(ua);
    const app = navigator.brave ? 'Brave' : /SamsungBrowser/.test(ua) ? 'Samsung Internet' : /EdgA|EdgiOS|Edg\//.test(ua) ? 'Edge'
      : /OPR\/|Opera/.test(ua) ? 'Opera' : /Firefox|FxiOS/.test(ua) ? 'Firefox' : /CriOS|Chrome/.test(ua) ? 'Chrome' : ios ? 'Safari' : 'this browser';
    const site = ios && app==='Safari' ? 'In Safari tap “aA” left of the web address → Website Settings → Location → Allow, then reload.'
      : 'Tap the icon left of the web address → Permissions (or Site settings) → Location → Allow, then reload.';
    const phone = ios ? 'iPhone Settings → Privacy & Security → Location Services → On, then '+(app==='Safari' ? 'Safari Websites' : app)+' → While Using the App.'
      : android ? 'the phone’s Location switch (swipe down from the top → Location) must be on; then phone Settings → Apps → '+app+' → Permissions → Location → Allow only while using the app.'
      : 'the computer’s privacy settings → Location → allow '+app+'.';
    return (state==='granted' || state==='prompt') ? app+' can’t get the '+(ios || android ? 'phone' : 'computer')+'’s location: '+phone
      : app+' has blocked location for this website. '+site+' If it already says Allow: '+phone;
  }

  const MESSAGES = {
    unsupported:'Location isn\'t available in this browser.',
    insecure:'Location access generally requires HTTPS or localhost.',
    denied:'Location access is blocked for this site.',
    unavailable:'We couldn\'t detect your location. Please try again.',
    timeout:'Finding your location took too long. Please try again.'
  };
  function fail(code){ const e = new Error(MESSAGES[code]); e.code = code; return e; }

  /* request({maxAgeMs, timeoutMs}) → Promise<{lat,lng,acc,ts,reused}>
     Call ONLY from a user action. One-time getCurrentPosition() — no watchPosition, no background tracking.
     Rejects with err.code: unsupported | insecure | denied | unavailable | timeout */
  function request(o){
    o = o || {};
    const maxAge = isNum(o.maxAgeMs) ? o.maxAgeMs : 60000;
    const cur = get();
    if(cur && age() <= maxAge) return Promise.resolve(Object.assign(cur, {reused:true}));
    if(window.isSecureContext===false) return Promise.reject(fail('insecure'));
    if(!('geolocation' in navigator) || !navigator.geolocation) return Promise.reject(fail('unsupported'));
    if(perm==='denied') return Promise.reject(fail('denied'));   // blocked in the browser: asking again can't succeed
    if(inflight) return inflight;
    inflight = new Promise((resolve, reject)=>{
      try{
        navigator.geolocation.getCurrentPosition(pos=>{
          const c = pos && pos.coords, p = c ? set(c.latitude, c.longitude, c.accuracy, pos.timestamp) : null;
          if(p){ if(perm==='unknown') perm = 'granted'; resolve(Object.assign(p, {reused:false})); } else reject(fail('unavailable'));
        }, err=>{
          if(err && err.code===1 && perm==='unknown') perm = 'denied';
          reject(fail(err && err.code===1 ? 'denied' : (err && err.code===3 ? 'timeout' : 'unavailable')));
        }, {enableHighAccuracy:true, timeout:isNum(o.timeoutMs) ? o.timeoutMs : 10000, maximumAge:Math.min(maxAge, STALE_MS)});
      }catch(e){ reject(fail('unavailable')); }
    }).finally(()=>{ inflight = null; });
    return inflight;
  }

  /* watch(cb) → stop(). Live position while a view needs it (the map, on the way to a parking spot).
     Starts only once the visitor has allowed location for this site, so it never causes a prompt by itself. */
  function watch(cb){
    if(typeof cb!=='function' || perm!=='granted' || !navigator.geolocation || !navigator.geolocation.watchPosition) return ()=>{};
    watchers.push(cb);
    if(watchId==null){
      try{
        watchId = navigator.geolocation.watchPosition(pos=>{
          const c = pos && pos.coords, p = c ? set(c.latitude, c.longitude, c.accuracy, pos.timestamp) : null;
          if(p) watchers.slice().forEach(f=>{ try{ f(Object.assign({}, p)); }catch(e){} });
        }, err=>{ if(err && err.code===1){ perm = 'denied'; stopWatch(); } }, {enableHighAccuracy:true, maximumAge:15000, timeout:30000});
      }catch(e){ watchId = null; }
    }
    return ()=>{ watchers = watchers.filter(f=>f!==cb); if(!watchers.length) stopWatch(); };
  }
  function stopWatch(){
    if(watchId!=null){ try{ navigator.geolocation.clearWatch(watchId); }catch(e){} }
    watchId = null; watchers = [];
  }

  return {request:request, get:get, set:set, clear:clear, age:age, isStale:isStale, isValidPoint:isValidPoint,
    watch:watch, permission:permission, blockedHelp:blockedHelp,
    calculateStraightLineDistance:calculateStraightLineDistance, formatDistance:formatDistance,
    STALE_MS:STALE_MS, REMEMBER_MS:REMEMBER_MS, EARTH_RADIUS_KM:EARTH_RADIUS_KM, messages:MESSAGES};
})();
window.JMLocation = JMLocation;

touristModeBtn.addEventListener('click', ()=>{
  const open = touristModePanel.classList.toggle('open');
  touristModeBtn.classList.toggle('active', open);
  touristModeBtn.setAttribute('aria-expanded', String(open));
  touristModeBtn.setAttribute('aria-pressed', String(open));
  touristModeBtn.title = 'Tourist Mode: ' + (open ? 'ON' : 'OFF');
  if(open){
    renderNearMe(currentArea);
    /* ── Smooth-scroll to Tourist Mode panel, same mechanism as
       CSS scroll-behavior:smooth used by the Explore / other anchor
       links in the chip row and footer.
       Offset = sticky header height, so the panel lands flush below
       the header — exactly as scroll-padding-top would do for an
       anchor target.  We read the header height live so it works on
       every breakpoint without a hard-coded magic number.          ── */
    const header = document.querySelector('.site-header');
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const panelTop = touristModePanel.getBoundingClientRect().top + window.scrollY;
    /* 4px gap matches the visual breathing room anchor links leave  */
    window.scrollTo({ top: panelTop - headerH - 4, behavior: 'smooth' });
  }
});

function selectArea(area, statusText){
  const btn = areaSelect.querySelector('.area-btn[data-area="'+area+'"]');
  if(!btn) return;
  document.querySelectorAll('.area-btn').forEach(b=>{ b.classList.remove('is-active'); b.setAttribute('aria-pressed','false'); });
  btn.classList.add('is-active'); btn.setAttribute('aria-pressed','true');
  currentArea = area;
  tmpStatus.textContent = statusText || ('Showing what\'s nearby for: ' + btn.textContent);
  renderNearMe(currentArea);
  // Tourist Help -> map, centred on this area (only where the map knows the area's position)
  const mapLink = document.getElementById('tmpMapLink');
  const info = TM_AREAS[area] || {};
  mapLink.hidden = !info.ll;
  if(info.ll) mapLink.href = '#map?area=' + area;
}
areaSelect.addEventListener('click', e=>{
  const btn = e.target.closest('.area-btn');
  if(!btn) return;
  selectArea(btn.dataset.area);
});
function tmDistanceKm(a, b){
  const R=6371, r=Math.PI/180, dLat=(b[0]-a[0])*r, dLng=(b[1]-a[1])*r;
  const h=Math.sin(dLat/2)**2 + Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}
function tmNearestArea(ll){
  let best=null;
  Object.keys(TM_AREAS).forEach(id=>{
    const a=TM_AREAS[id]; if(!a.ll) return;
    const d=tmDistanceKm(ll, a.ll);
    if(!best || d<best.d) best={id, d};
  });
  return best;
}

document.getElementById('useLocationBtn').addEventListener('click', ()=>{
  tmpStatus.textContent = 'Finding your location…';
  JMLocation.request({timeoutMs:10000}).then(
    u=>{
      const here=[u.lat, u.lng];
      const near=tmNearestArea(here);
      const fromCity=tmDistanceKm(here, TM_AREAS.fort.ll);
      const approx = (u.acc!=null && u.acc>500) ? ' Your location is approximate (about '+JMLocation.formatDistance(u.acc/1000)+'), so distances may be off.' : '';
      if(near && near.d <= 15){
        const label=areaSelect.querySelector('.area-btn[data-area="'+near.id+'"]').textContent;
        selectArea(near.id, 'Location found — you\'re closest to ' + label + (near.d < 1 ? ' (under 1 km away, straight line).' : ' (about ' + Math.round(near.d) + ' km, straight line).') + approx);
      } else if(fromCity <= 200){
        tmpStatus.textContent = 'Location found — you\'re about ' + Math.round(fromCity) + ' km from Jaisalmer city (straight line), not close to one of these areas. Pick where you\'re heading below.';
      } else {
        tmpStatus.textContent = 'You don\'t seem to be near Jaisalmer right now — pick an area below to preview it.';
      }
    },
    err=>{
      const c = err && err.code;
      tmpStatus.textContent = c==='denied' ? 'Location access is blocked — allow it in your browser settings and try again, or pick an area below.'
        : c==='insecure' ? 'Location access generally requires HTTPS or localhost — pick an area below instead.'
        : c==='unsupported' ? 'Location isn\'t available on this device — pick an area below instead.'
        : 'We couldn\'t detect your location — try again, or pick an area below.';
    }
  );
});

const NEAR_ME_ACTIVITY = {'Camel Safari':'camel-safari', 'Jeep Safari':'jeep-safari', 'Boating':'lake-boating'};
function renderTmPlaces(area){
  const box = document.getElementById('tmpPlaces');
  const note = document.getElementById('tmpNote');
  const info = TM_AREAS[area] || {places:[]};
  box.innerHTML = '';
  info.places.forEach(id=>{
    const a = ATTRACTIONS.find(x=>x.id===id && x.visible!==false);
    if(!a) return;
    const P = window.JMPlace;
    const dist = (P && P.distanceLabel(id)) || a.distance;          // "2.4 km from you" only after an explicit location tap
    const saved = !!(P && P.isSaved(id));
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'tmp-place';
    b.setAttribute('aria-label', a.name + (saved ? ' (saved)' : '') + ': view details');
    b.innerHTML = '<span class="tp-emoji" aria-hidden="true">'+(TM_PLACE_EMOJI[id]||'📍')+'</span>'+
      '<span class="tp-text"><strong>'+escHtml(a.name)+'</strong><small>'+escHtml(dist)+'</small></span>'+
      (saved ? '<span class="tp-saved" aria-hidden="true">♥</span>' : '')+
      '<span class="tp-go" aria-hidden="true">Details →</span>';
    b.addEventListener('click', ()=>openModal(a));
    box.appendChild(b);
  });
  box.hidden = !box.children.length;
  note.hidden = !info.note;
  note.textContent = info.note || '';
}
function renderNearMe(area){
  renderTmPlaces(area);
  if(!nearMeGrid) return;            // Nearby services section removed from Tourist Mode
  nearMeGrid.innerHTML = '';
  (NEAR_ME_BY_AREA[area] || []).forEach(entry=>{
    const [emoji, ...rest] = entry.split(' ');
    const label = rest.join(' ');
    const P = window.JMPlace;
    const svc = P ? P.service(P.serviceIdFor(label)) : null;   // Tourist Companion service model (see TM_SERVICE_CATALOG)
    const actId = NEAR_ME_ACTIVITY[label];            // only exact matches to a real Things to do activity become links
    const el = document.createElement((svc || actId) ? 'button' : 'div');
    el.className = 'near-me-item' + ((svc || actId) ? '' : ' is-info');
    el.innerHTML = `<span class="emoji" aria-hidden="true">${emoji}</span>${label}` +
      ((svc || actId) ? `<span class="nm-go" aria-hidden="true">${svc && svc.type==='facility' ? 'Find' : 'Options'}</span>` : '');
    if(svc){
      const areaName = (areaSelect.querySelector('.area-btn[data-area="'+area+'"]')||{}).textContent || '';
      el.type = 'button';
      el.setAttribute('aria-label', label + (areaName ? ' around ' + areaName : '') + ': ' + (svc.type==='facility' ? 'find nearby' : 'see options'));
      el.addEventListener('click', ()=>P.openService(svc.id, {areaId:area}));
    } else if(actId){
      el.type = 'button';
      el.setAttribute('aria-label', label + ': view details and local options');
      el.addEventListener('click', ()=>openActivityModal(actId));
    }
    nearMeGrid.appendChild(el);
  });
}

/* ============================================================
   LOCATION DETAIL MODAL
   ============================================================ */
const modalOverlay = document.getElementById('modalOverlay');
const modalSheet = document.getElementById('modalSheet');

/* openModal(a) is the single entry point every place card, search result, mega-menu link and map
   "View Details" already uses. It now opens the Tourist Companion place sheet (JMPlace, loaded at the
   end of the page); openModalBasic() is the original sheet, kept as a safe fallback. */
function openModal(a, opts){
  if(window.JMPlace && a && JMPlace.open(a.id || a, opts)) return;
  openModalBasic(a);
}
function openModalBasic(a){
  modalSheet.classList.remove('is-activity','is-place');
  modalSheet.innerHTML = `
    <div class="modal-hero">${placeMediaHtml(a, duneSvg(a.id+'x'), '')}<button class="modal-close" id="modalCloseBtn" aria-label="Close">&times;</button></div>
    <div class="modal-content">
      <div class="card-tag">${a.tag}</div>
      <h2 id="modalTitle">${a.name}</h2>
      <p class="modal-lede">${a.short}</p>
      <div data-history-audio-slot></div>
      <div class="modal-section"><h5>Why visit</h5><p>${a.why}</p></div>
      <div class="modal-section"><h5>Things to see</h5><ul>${a.see.map(s=>`<li>${s}</li>`).join('')}</ul></div>
      <div class="modal-meta-row">
        <div><span>Best time</span>${a.bestTime}</div>
        <div><span>Location</span>${a.location}</div>
        <div><span>Distance</span>${a.distance}</div>
      </div>
      <div class="modal-section"><h5>Nearby</h5>${a.nearby.map(n=>`<span class="nearby-chip">${n}</span>`).join('')}</div>
      <div class="modal-section"><h5>Useful tips</h5><p>${a.tips}</p></div>
      ${mapActionsHtml(a)}
    </div>`;
  JMHistoryAudio.mount(modalSheet.querySelector('[data-history-audio-slot]'), a);
  if(window.SmartAdManager) SmartAdManager.notify('place-open', {placeId:a.id});   // Smart Ads: counts only meaningful, unique visits   // History Audio Guide (hidden when the place has none)
  showModalShell();
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  const mapBtn = modalSheet.querySelector('[data-view-on-map]');
  if(mapBtn) mapBtn.addEventListener('click', ()=>{ closeModal(); window.JMMap.show(a.id); });
}
/* Website -> Map deep link. Only rendered for places that actually have map coordinates. */
function mapActionsHtml(a){
  if(!(a && window.JMMap && window.JMMap.has(a.id))) return '';
  const n = escHtml(a.name);
  return `<div class="modal-actions">
        <button type="button" class="modal-act primary" data-view-on-map aria-label="View ${n} on map"><span aria-hidden="true">📍</span> View on Map</button>
        <a class="modal-act" href="${escHtml(window.JMMap.navigationUrl(a.id))}" target="_blank" rel="noopener" aria-label="Navigate to ${n} (opens Google Maps)">Navigate</a>
      </div>`;
}
/* Shared shell behaviour for every modal that uses #modalOverlay: focus, scroll lock, restore. */
let modalLastFocus = null;
function showModalShell(){
  if(!modalOverlay.classList.contains('open')) modalLastFocus = document.activeElement;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';               // no background scrolling while open
  modalSheet.scrollTop = 0;
  const c = document.getElementById('modalCloseBtn');
  (c || modalSheet).focus({preventScroll:true});
}
function closeModal(opts){
  if(window.JMHistoryAudio) JMHistoryAudio.stop();         // History Audio Guide: never keep narrating behind a closed modal
  if(!modalOverlay.classList.contains('open')) return;    // Escape calls this on every press — stay idempotent
  modalOverlay.classList.remove('open');
  if(window.JMPlace) JMPlace._afterClose(!!(opts && opts.silent));   // #place/… history entry: Back-button parity
  const as = document.getElementById('addServiceOverlay');
  if(!(as && as.classList.contains('open'))) document.body.style.overflow = '';
  const f = modalLastFocus; modalLastFocus = null;
  if(f && f.isConnected && typeof f.focus==='function'){ try{ f.focus({preventScroll:true}); }catch(e){} }
  if(window.SmartAdManager) SmartAdManager.notify('modal-closed');   // Smart Ads: a natural pause, never during the modal
}
modalOverlay.addEventListener('click', e=>{ if(e.target===modalOverlay) closeModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeModal(); closeSearch(); }});

/* ============================================================
   Jaisalmer Visit — History Audio Guide
   Records → registry → renderHistoryAudio(place) → one active "engine" → modal.
   Two engines share the same interface (play/pause/currentTime/events):
   - file:  a single HTMLAudioElement for an uploaded, published MP3
            (preload="none"; it gets its src only when Play is pressed).
   - voice: the device's built-in speech voice reading this attraction's
            existing, approved page text (no download at all). Used for any
            place without a published MP3, and as a fallback if an MP3 fails.
   Only one engine can sound at a time. Clean-up is central: closeModal()
   calls stop(); any swap of the modal's content pauses via an observer.
   ============================================================ */
/* English read by the device voice for places without an English recording. Off unless Settings → Audio switches it on
   (client, 19 Oct 2026: only the uploaded Hindi stories for now; English comes back with real English recordings). */
const HISTORY_AUDIO_VOICE = {enabled:!!(VJData.settings() && VJData.settings().historyVoice===true), language:'en', rate:0.95};

const JMHistoryAudio = (function(){
  const LANG_NAMES = {en:'English', hi:'हिन्दी'};
  const ERROR_TEXT = 'Audio unavailable right now. Please try again.';
  const PREVIEW = /[?&]audio-preview(?:[=&]|$)/.test(location.search);   // content-manager preview of drafts
  const attractionIds = new Set(ATTRACTIONS.map(a=>a.id));
  const records = new Map();               // 'attractionId|language' → normalised MP3 record
  const brokenFiles = new Set();           // MP3s that failed this session → voice takes over
  let prefLang = (function(){                                          // shared with the Audio Guide (vj_audio_language)
    try{ const v = localStorage.getItem('vj_audio_language'); if(v && /^[a-z]{2,3}$/.test(v)) return v; }catch(e){}
    return (document.documentElement.lang || 'en').slice(0,2).toLowerCase();
  })();

  /* ---------- analytics-ready (same jm:analytics channel as the rest of the site) ---------- */
  function track(name, detail){
    const d = Object.assign({event:name}, detail||{});
    try{ document.dispatchEvent(new CustomEvent('jm:analytics', {detail:d})); if(Array.isArray(window.dataLayer)) window.dataLayer.push(d); }catch(e){}
  }

  /* ---------- data: validate + normalise (static records now, admin/API feed later) ---------- */
  function safeUrl(u){
    u = String(u||'').trim(); if(!u) return '';
    try{
      const url = new URL(u, document.baseURI);
      const ok = url.protocol==='https:' || url.protocol==='http:' || url.protocol==='blob:' || url.protocol===location.protocol;
      return ok ? url.href : '';
    }catch(e){ return ''; }
  }
  function ingest(r){
    if(!r || typeof r!=='object') return false;
    const id = String(r.attractionId||'');
    if(!attractionIds.has(id) || (r.type||'history')!=='history') return false;
    const lang = String(r.language||'en').toLowerCase();
    if(!/^[a-z]{2,3}(-[a-z0-9]{2,8})?$/.test(lang)) return false;
    const key = id+'|'+lang;
    if(r.deleted===true){ records.delete(key); return true; }        // admin "remove audio"
    const tx = r.transcript && typeof r.transcript==='object'
      ? (r.transcript.enabled===false ? '' : r.transcript.text) : r.transcript;
    const dur = Number(r.duration);
    records.set(key, {                                                // newest record for a place+language replaces the old one
      key, source:'file', attractionId:id, language:lang,
      title:String(r.title||'').trim(),
      audioUrl:safeUrl(r.audioUrl),
      duration:(isFinite(dur) && dur>0) ? dur : null,
      transcript:String(tx||'').trim(),
      narrator:String(r.narrator||'').trim(),
      enabled:r.enabled!==false,
      published:r.published===true,
      updatedAt:String(r.updatedAt||'')
    });
    brokenFiles.delete(key);
    return true;
  }
  function load(list){ let n = 0; (Array.isArray(list)?list:[]).forEach(r=>{ if(ingest(r)) n++; }); refresh(); return n; }
  HISTORY_AUDIO.forEach(ingest);

  let feedLoaded = false;
  function loadFeed(){                                                // no-op until HISTORY_AUDIO_FEED.url is set
    if(!HISTORY_AUDIO_FEED.url || feedLoaded || typeof fetch!=='function') return;
    feedLoaded = true;
    fetch(HISTORY_AUDIO_FEED.url, {credentials:'omit', headers:{'Accept':'application/json'}})
      .then(r=>{ if(!r.ok) throw new Error('http'); return r.json(); })
      .then(j=>load(j && j.records))
      .catch(()=>{ feedLoaded = false; });
  }

  /* ---------- voice narration: built only from the attraction's own approved text ---------- */
  const canSpeak = ()=> HISTORY_AUDIO_VOICE.enabled && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance==='function';
  const WPM = 160;
  function narrationText(p){
    const parts = [p.name+'.', p.short, p.why];
    if(p.see && p.see.length) parts.push('Things to see here: '+p.see.join('; ')+'.');
    if(p.bestTime) parts.push('Best time to visit: '+p.bestTime);
    if(p.tips) parts.push('A useful tip: '+p.tips);
    return parts.filter(Boolean).join(' ');
  }
  function sentences(text){ return (String(text).match(/[^.!?;]+[.!?;]*/g) || []).map(s=>s.trim()).filter(s=>/[a-z0-9]/i.test(s)); }
  function estimate(s){ return s.split(/\s+/).length / (WPM * HISTORY_AUDIO_VOICE.rate / 60) + 0.4; }
  function voiceRecord(place){
    const lang = HISTORY_AUDIO_VOICE.language;
    const chunks = sentences(narrationText(place));
    return {key:place.id+'|'+lang+'|voice', source:'voice', attractionId:place.id, language:lang,
      title:'History of '+place.name, chunks, duration:chunks.reduce((t,c)=>t+estimate(c),0),
      transcript:'', narrator:'', enabled:true, published:true};
  }

  /* What a visitor can play for one attraction: published MP3s (drafts too in
     ?audio-preview); the site-language slot falls back to the device voice.
     enabled:false on a place+language record switches that language off entirely. */
  function available(id){
    const out = [], off = new Set();
    records.forEach(r=>{
      if(r.attractionId!==id) return;
      if(!r.enabled){ off.add(r.language); return; }
      if(r.audioUrl && (r.published || PREVIEW) && !brokenFiles.has(r.key)) out.push(r);
    });
    const vl = HISTORY_AUDIO_VOICE.language, place = ATTRACTIONS.find(a=>a.id===id);
    if(place && canSpeak() && !off.has(vl) && !out.some(r=>r.language===vl)) out.push(voiceRecord(place));
    return out.sort((a,b)=>a.language==='en' ? -1 : b.language==='en' ? 1 : a.language.localeCompare(b.language));
  }
  function pick(list){ return list.find(r=>r.language===prefLang) || list.find(r=>r.language==='en') || list[0]; }

  /* ---------- formatting ---------- */
  function clock(s){ s = Math.max(0, Math.floor(s||0)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
  function spoken(s){
    s = Math.round(s||0); const m = Math.floor(s/60), r = s%60;
    return (m ? m+' min' : '') + (m && r ? ' ' : '') + (r || !m ? r+' sec' : '');
  }
  function lengthText(rec){
    if(!rec.duration) return '';
    if(rec.source==='voice'){ const m = Math.max(1, Math.round(rec.duration/60)); return ' · about '+m+' min'; }
    return ' · '+spoken(rec.duration);
  }

  /* ---------- engine 1: one HTMLAudioElement for every uploaded MP3 ---------- */
  let fileEngine = null;
  function getFile(){
    if(fileEngine) return fileEngine;
    fileEngine = new Audio();
    fileEngine.preload = 'none';
    wire(fileEngine);
    return fileEngine;
  }

  /* ---------- engine 2: device voice, sentence by sentence (seek = jump to sentence) ---------- */
  let voiceEngine = null;
  function getVoice(){
    if(voiceEngine) return voiceEngine;
    const synth = window.speechSynthesis, bus = document.createElement('i');
    let chunks = [], starts = [], total = 0, idx = 0, pos = 0, clockAt = 0, run = 0, ticker = null, watchdog = null, lang = 'en', key = '';
    const emit = t=>bus.dispatchEvent(new Event(t));
    const nextStart = ()=> idx+1 < starts.length ? starts[idx+1] : total;
    function pickVoice(){
      const vs = synth.getVoices ? synth.getVoices() : [];
      return vs.find(v=>v.lang && v.lang.toLowerCase()===lang+'-in')
          || vs.find(v=>v.lang && v.lang.toLowerCase().startsWith(lang) && v.localService)
          || vs.find(v=>v.lang && v.lang.toLowerCase().startsWith(lang)) || null;
    }
    function halt(){ run++; clearInterval(ticker); clearTimeout(watchdog); ticker = watchdog = null; try{ synth.cancel(); }catch(e){} }
    function speakFrom(i){
      halt();
      const my = run;
      idx = i; pos = starts[i] || 0; clockAt = Date.now();
      const u = new SpeechSynthesisUtterance(chunks[i]);
      u.lang = lang==='en' ? 'en-IN' : lang; u.rate = HISTORY_AUDIO_VOICE.rate;
      const v = pickVoice(); if(v) u.voice = v;
      u.onstart = ()=>{ if(my!==run) return; clearTimeout(watchdog); clockAt = Date.now(); pos = starts[i]; emit('playing'); };
      u.onend = ()=>{
        if(my!==run || self.paused) return;
        if(idx+1 < chunks.length){ speakFrom(idx+1); emit('boundary'); return; }   // boundary = natural pause between sentences
        halt(); pos = total; self.paused = true; self.ended = true; emit('timeupdate'); emit('pause'); emit('ended');
      };
      u.onerror = e=>{
        if(my!==run || self.paused || (e && (e.error==='interrupted' || e.error==='canceled'))) return;
        halt(); self.paused = true; emit('error');
      };
      // A device without a working speech engine never starts: report it instead of loading forever.
      watchdog = setTimeout(()=>{ if(my===run && !self.paused){ halt(); self.paused = true; emit('error'); } }, 6000);
      ticker = setInterval(()=>emit('timeupdate'), 250);
      try{ synth.speak(u); }catch(e){ halt(); self.paused = true; emit('error'); }
    }
    const self = {
      paused:true, ended:false, seekable:{length:1},
      get duration(){ return total || NaN; },
      get currentTime(){ return self.paused ? pos : Math.min(pos + (Date.now()-clockAt)/1000*1, nextStart()); },
      set currentTime(v){
        v = Math.max(0, Math.min(Number(v)||0, total));
        let i = 0; while(i+1 < starts.length && starts[i+1] <= v + 0.01) i++;
        self.ended = false;
        if(!self.paused) speakFrom(i); else { idx = i; pos = starts[i] || 0; }
        emit('timeupdate'); emit('seeked');
      },
      addEventListener:(t,f)=>bus.addEventListener(t,f),
      setRecord(rec){
        if(rec.key===key) return;
        halt(); key = rec.key; lang = rec.language; chunks = rec.chunks.slice();
        starts = []; total = 0; chunks.forEach(c=>{ starts.push(total); total += estimate(c); });
        idx = 0; pos = 0; self.ended = false; self.paused = true;
        emit('loadedmetadata');
      },
      play(){
        if(!chunks.length) return Promise.reject(new Error('empty'));
        if(self.ended){ idx = 0; pos = 0; self.ended = false; }
        self.paused = false; speakFrom(idx);
        return Promise.resolve();
      },
      pause(){ if(self.paused) return; pos = self.currentTime; self.paused = true; halt(); emit('pause'); }
    };
    if(synth.getVoices) synth.getVoices();                            // warms the voice list (it loads async in Chrome)
    voiceEngine = self;
    wire(self);
    return self;
  }

  /* ---------- the manager ---------- */
  let media = null;            // the engine currently in charge
  let loadedKey = '';          // record attached to that engine
  let state = 'idle';          // idle | loading | playing | paused | completed | error
  let ui = null;               // the player currently in the modal
  let dragging = false;

  function wire(eng){          // every engine reports through the same handlers; a background engine is ignored
    const mine = f => function(){ if(eng===media) f(); };
    eng.addEventListener('playing', mine(()=>setState('playing')));
    eng.addEventListener('waiting', mine(()=>{ if(!media.paused) setState('loading'); }));
    eng.addEventListener('pause', mine(()=>{
      if(media.ended || state==='error') return;
      setState(state==='playing' || media.currentTime > 0.2 ? 'paused' : 'idle');   // cancelled while still loading → back to start
    }));
    eng.addEventListener('ended', mine(()=>{ setState('completed'); const r = current(); track('history_audio_complete', {attractionId:r.attractionId, language:r.language, source:r.source}); }));
    ['timeupdate','loadedmetadata','durationchange','seeked'].forEach(t=>eng.addEventListener(t, mine(paint)));
    eng.addEventListener('timeupdate', mine(()=>{ const t = now(); if(t-lastProgressAt >= 1000){ lastProgressAt = t; announce('progress'); } }));
    eng.addEventListener('boundary', mine(()=>announce('boundary')));
    eng.addEventListener('error', mine(fail));
  }
  let loadedRec = null;
  const current = ()=> loadedRec || {};

  function fail(){
    if(!loadedKey) return;
    const r = current();
    track('history_audio_error', {attractionId:r.attractionId, language:r.language, source:r.source});
    // A missing/broken MP3 quietly hands over to the device voice when that is possible.
    if(r.source==='file' && ui && ui.rec.key===loadedKey && canSpeak() && r.language===HISTORY_AUDIO_VOICE.language){
      brokenFiles.add(r.key); state = 'idle'; loadedKey = ''; loadedRec = null;
      refresh(); if(ui && ui.rec.source==='voice'){ play(); return; }
    }
    setState('error');                                                // one plain sentence, never the browser error
  }
  function realDuration(){
    const d = media && media.duration;
    if(ui && ui.rec.key===loadedKey && isFinite(d) && d>0) return d;
    return ui ? (ui.rec.duration || 0) : 0;
  }

  function play(){
    if(!ui) return;
    const rec = ui.rec;
    const eng = rec.source==='voice' ? getVoice() : getFile();
    if(media && media!==eng && !media.paused) media.pause();          // one narration at a time, across engines
    if(loadedKey!==rec.key || state==='error' || media!==eng){
      media = eng; loadedKey = rec.key; loadedRec = rec; state = 'idle';
      if(rec.source==='voice') eng.setRecord(rec);
      else { eng.src = rec.audioUrl; mediaSession(rec); }             // ← an MP3 starts downloading here, not before
    }else if(state==='completed'){
      try{ eng.currentTime = 0; }catch(e){}
    }
    if(rec.source==='file'){                                          // playback speed shared with the Audio Guide settings
      try{ const sp = Number(localStorage.getItem('vj_audio_speed')); const r = [0.75,1,1.25].indexOf(sp)>=0 ? sp : 1; eng.defaultPlaybackRate = r; eng.playbackRate = r; }catch(e){}
    }
    setState('loading');
    let p;
    try{ p = eng.play(); }catch(e){ fail(); return; }
    if(p && typeof p.catch==='function') p.catch(err=>{ if(err && err.name==='AbortError') return; fail(); });
    track('history_audio_play', {attractionId:rec.attractionId, language:rec.language, source:rec.source});
  }
  function pause(){ if(media && !media.paused) media.pause(); }
  function toggle(){
    if(!ui) return;
    const own = ui.rec.key===loadedKey;
    if(own && (state==='playing' || state==='loading')) pause();
    else play();
  }
  function seekTo(t){
    if(!media || !ui || ui.rec.key!==loadedKey) return;
    const d = realDuration(); if(!d) return;
    try{ media.currentTime = Math.min(Math.max(0, t), d - 0.05); }catch(e){}
    if(state==='completed') setState('paused');
    paint();
  }
  function stop(){ pause(); }                                         // position kept, so reopening the place offers "Resume"

  function mediaSession(rec){
    if(!('mediaSession' in navigator) || typeof MediaMetadata!=='function') return;
    try{
      const place = ATTRACTIONS.find(a=>a.id===rec.attractionId);
      navigator.mediaSession.metadata = new MediaMetadata({title:rec.title || ('History of '+(place ? place.name : 'Jaisalmer')), artist:'Jaisalmer Visit', album:'History Audio'});
    }catch(e){}
  }

  /* ---------- UI state ---------- */
  const LABELS = {
    idle:      {ic:'▶', text:'Listen to History', aria:'Play'},
    loading:   {ic:'◌', text:'Loading audio…',    aria:'Cancel loading'},
    playing:   {ic:'❚❚', text:'Pause',            aria:'Pause'},
    paused:    {ic:'▶', text:'Resume',            aria:'Resume'},
    completed: {ic:'↻', text:'Listen Again',      aria:'Replay'},
    error:     {ic:'▶', text:'Try again',         aria:'Try again:'}
  };
  const ANNOUNCE = {loading:'Loading audio…', playing:'Playing', paused:'Paused', completed:'Finished', error:''};

  function setState(s){
    const changed = s!==state; state = s;
    if(changed) announce('state');
    if(ui && ui.rec.key===loadedKey){ render(s, changed); paint(); }
  }
  function render(s, announce){
    const L = LABELS[s], n = ui;
    n.root.dataset.state = s;
    n.ic.textContent = L.ic;
    n.lbl.textContent = L.text;
    n.len.textContent = s==='idle' ? lengthText(n.rec) : '';
    n.btn.setAttribute('aria-label', L.aria+' '+n.place.name+' history audio');
    n.msg.textContent = s==='error' ? ERROR_TEXT : '';
    if(announce && ANNOUNCE[s]) n.live.textContent = ANNOUNCE[s];
  }
  function paint(){
    if(!ui) return;
    const own = !!media && ui.rec.key===loadedKey;
    const d = realDuration();
    const t = own ? media.currentTime : 0;
    if(!dragging){
      ui.seek.max = d ? String(Math.round(d*10)/10) : '0';
      ui.seek.value = String(Math.min(t, d || 0));
    }
    const shown = dragging ? Number(ui.seek.value) : t;
    const pct = d ? Math.min(100, shown/d*100) : 0;
    ui.seek.style.setProperty('--ha-pct', pct+'%');
    ui.seek.disabled = !(own && isFinite(media.duration) && media.duration>0 && media.seekable && media.seekable.length>0);   // host without byte-range support can't seek
    ui.seek.setAttribute('aria-valuetext', clock(shown)+' of '+(d ? clock(d) : 'unknown length'));
    ui.cur.textContent = clock(shown);
    ui.dur.textContent = d ? clock(d) : '–:––';
  }

  /* ---------- renderer (safe DOM APIs only: record text never becomes HTML) ---------- */
  function h(tag, cls, text){ const n = document.createElement(tag); if(cls) n.className = cls; if(text!=null) n.textContent = text; return n; }

  function renderHistoryAudio(place){
    const list = place ? available(place.id) : [];
    if(!list.length) return null;                                     // no audio → no section at all
    const rec = pick(list);
    const uid = 'ha-'+place.id.replace(/[^a-z0-9_-]/gi,'');

    const root = h('section','ha'); root.setAttribute('aria-labelledby', uid+'-h');
    const top = h('div','ha-top');
    const head = h('div','ha-head');
    const title = h('h5','ha-title'); title.id = uid+'-h';
    title.append(h('span',null,'🎧'), document.createTextNode(' History Audio'));
    title.firstChild.setAttribute('aria-hidden','true');
    if(rec.source==='file' && !rec.published) title.append(h('span','ha-draft','Draft preview'));
    head.append(title, h('p','ha-sub','Listen to the story of this place'));
    const btn = h('button','modal-act primary ha-play'); btn.type = 'button'; btn.dataset.ha = 'toggle';
    const ic = h('span','ha-ic'); ic.setAttribute('aria-hidden','true');
    const lbl = h('span','ha-lbl'); const len = h('span','ha-len');
    btn.append(ic, lbl, len);
    top.append(head, btn);
    root.append(top);

    if(list.length > 1){                                              // only when there is a real choice
      const g = h('div','ha-langs'); g.setAttribute('role','group'); g.setAttribute('aria-label','Audio language');
      g.append(h('span','ha-langs-label','Audio language'));
      g.firstChild.setAttribute('aria-hidden','true');
      list.forEach(r=>{
        const b = h('button','ha-lang', LANG_NAMES[r.language] || r.language.toUpperCase());
        b.type = 'button'; b.dataset.ha = 'lang'; b.dataset.lang = r.language;
        b.setAttribute('lang', r.language);
        b.setAttribute('aria-pressed', String(r===rec));
        g.append(b);
      });
      root.append(g);
    }

    const prog = h('div','ha-progress');
    const cur = h('time',null,'0:00'); cur.setAttribute('aria-hidden','true');
    const seek = h('input','ha-seek'); seek.type = 'range'; seek.min = '0'; seek.step = '0.1'; seek.value = '0';
    seek.setAttribute('aria-label','Seek '+place.name+' history audio');
    const dur = h('time',null,'–:––'); dur.setAttribute('aria-hidden','true');
    prog.append(cur, seek, dur);
    const msg = h('p','ha-msg'); msg.setAttribute('role','alert');
    const live = h('span','visually-hidden'); live.setAttribute('role','status'); live.setAttribute('aria-live','polite');
    root.append(prog, msg, live);
    if(rec.source==='voice') root.append(h('p','ha-note','Read aloud by your device’s voice — no download needed.'));
    else if(rec.narrator && !rec.transcript) root.append(h('p','ha-note','Narrated by '+rec.narrator));

    if(rec.transcript){
      const tid = uid+'-tx';
      const tb = h('button','ha-tx-toggle'); tb.type = 'button'; tb.dataset.ha = 'transcript';
      tb.setAttribute('aria-expanded','false'); tb.setAttribute('aria-controls', tid);
      const caret = h('span','ha-caret','▾'); caret.setAttribute('aria-hidden','true');
      tb.append(document.createTextNode('Read the story'), caret);
      const tx = h('div','ha-tx'); tx.id = tid; tx.hidden = true;
      if(rec.language!==(document.documentElement.lang||'en').slice(0,2)) tx.setAttribute('lang', rec.language);
      rec.transcript.split(/\n\s*\n/).forEach(p=>{ if(p.trim()) tx.append(h('p',null,p.trim())); });
      if(rec.narrator) tx.append(h('p','ha-narr','Narrated by '+rec.narrator));
      root.append(tb, tx);
    }

    ui = {root, rec, place, btn, ic, lbl, len, seek, cur, dur, msg, live};
    // Returning to the same place keeps its position ("Resume"); anything else starts idle.
    const own = !!media && rec.key===loadedKey;
    render(own && state!=='error' ? state : 'idle', false);
    paint();
    return root;
  }

  /* Replace a placeholder in the modal with the player (or remove it). */
  function mount(slot, place){
    stop();                                                           // a new place is on screen: the previous narration pauses
    ui = null; dragging = false;
    if(!slot) return;
    loadFeed();
    const node = renderHistoryAudio(place);
    if(node) slot.replaceWith(node); else slot.remove();
  }
  function refresh(){                                                 // new/changed records arrived (feed, admin preview, fallback)
    if(!ui || !ui.root.isConnected) return;
    const place = ui.place, old = ui.root;
    if(ui.rec.key===loadedKey && state==='playing') return;          // never interrupt a narration mid-sentence
    ui = null;
    const node = renderHistoryAudio(place);
    if(node) old.replaceWith(node); else old.remove();
  }

  /* ---------- one delegated set of listeners for every player ---------- */
  const sheet = document.getElementById('modalSheet');
  const inPlayer = t => ui && ui.root.isConnected && ui.root.contains(t);
  sheet.addEventListener('click', e=>{
    const t = e.target.closest('[data-ha]'); if(!t || !inPlayer(t)) return;
    const act = t.dataset.ha;
    if(act==='toggle') toggle();
    else if(act==='transcript'){
      const open = t.getAttribute('aria-expanded')!=='true';
      t.setAttribute('aria-expanded', String(open));
      const tx = document.getElementById(t.getAttribute('aria-controls')); if(tx) tx.hidden = !open;
    }else if(act==='lang'){
      const lang = t.dataset.lang; if(!lang || lang===ui.rec.language) return;
      prefLang = lang;
      try{ localStorage.setItem('vj_audio_language', lang); }catch(e){}
      try{ document.dispatchEvent(new CustomEvent('vj:audio-language', {detail:{language:lang}})); }catch(e){}
      if(ui.rec.key===loadedKey) pause();
      track('history_audio_language_selected', {attractionId:ui.place.id, language:lang});
      refresh();
      const again = ui && ui.root.querySelector('[data-lang="'+lang+'"]'); if(again) again.focus();
    }
  });
  sheet.addEventListener('input', e=>{
    if(!e.target.classList.contains('ha-seek') || !inPlayer(e.target)) return;
    dragging = true; paint();
  });
  sheet.addEventListener('change', e=>{
    if(!e.target.classList.contains('ha-seek') || !inPlayer(e.target)) return;
    dragging = false; seekTo(Number(e.target.value));
  });
  sheet.addEventListener('keydown', e=>{                              // arrows jump 5 s — 0.1 s steps are too fine for a keyboard
    if(!e.target.classList.contains('ha-seek') || !inPlayer(e.target) || !media) return;
    const k = e.key, step = (k==='ArrowRight'||k==='ArrowUp') ? 5 : (k==='ArrowLeft'||k==='ArrowDown') ? -5 : 0;
    if(!step) return;
    e.preventDefault(); seekTo(media.currentTime + step);
  });
  // Modal content swapped (another attraction, an activity, rebuilt sheet) → the old narration must not keep playing.
  if('MutationObserver' in window){
    new MutationObserver(()=>{ if(ui && !ui.root.isConnected){ ui = null; dragging = false; stop(); } })
      .observe(sheet, {childList:true});
  }
  window.addEventListener('pagehide', stop);

  /* ---------- outward events + controls for other modules (e.g. SmartAdManager) ---------- */
  function now(){ return Date.now(); }
  let lastProgressAt = 0;
  function snapshot(){
    const r = current();
    return {key:loadedKey, audioId:loadedKey, attractionId:r.attractionId||null, source:r.source||null, state,
      playing:state==='playing' || state==='loading', currentTime:media ? (media.currentTime||0) : 0,
      volume:(media && typeof media.volume==='number') ? media.volume : 1};
  }
  function announce(type){
    try{ document.dispatchEvent(new CustomEvent('jm:history-audio', {detail:Object.assign({type}, snapshot())})); }catch(e){}
  }
  function resume(){                                                  // continue where it stopped — never from zero
    if(ui && ui.root.isConnected && ui.rec.key===loadedKey && state==='paused') play();
  }

  function setLang(l){ if(!l || l===prefLang) return; prefLang = String(l).toLowerCase(); refresh(); }   // Audio Guide language picker
  return {render:renderHistoryAudio, mount, stop, load, get:id=>available(id), preview:PREVIEW, snapshot, pause, resume, setLang};
})();
window.JMHistoryAudio = JMHistoryAudio;
function renderHistoryAudio(place){ return JMHistoryAudio.render(place); }

/* ============================================================
   Jaisalmer Visit — Smart Ad Manager (hidden / triggered advertising)
   ------------------------------------------------------------
   SmartAdManager
   ├── TriggerEngine        meaningful actions → opportunities (never "show now")
   ├── EligibilityEngine    enabled, suspensions, first-session rules
   ├── FrequencyController  session / day / global / per-ad / per-placement limits
   ├── AdStateMachine       HIDDEN → ELIGIBLE → TRIGGERED → LOADING → VISIBLE → … → HIDDEN → COOLDOWN
   ├── Providers            Sponsor (direct, local) · House (Jaisalmer Visit) · Google (GPT, off) · Mock (dev only)
   ├── AudioIntegration     save → pause → restore the History Audio Guide
   ├── OverlayController    mounted only while an ad is visible; removed afterwards
   ├── AnalyticsAdapter     same jm:analytics / dataLayer channel as the rest of the site
   ├── ConsentAdapter       external providers only run with window.JM_CONSENT.ads === true
   └── StorageAdapter       session + daily counters only; survives blocked storage
   Nothing is shown, reserved or downloaded until an eligible opportunity
   meets a safe moment. If no ad exists, nothing happens at all.
   ============================================================ */
const SMART_AD_CONFIG = VJData.adConfig({
  enabled: true,
  debug: false,                                 // dev panel + MockAdProvider (also ?ads-debug, localhost/file only)
  providerPriority: ['sponsor', 'house', 'google'],   // first provider with a valid ad wins
  frequency: {
    maxAdsPerSession: 3,
    maxAdsPerDay: 6,
    globalCooldownMinutes: 10,
    perAdCooldownMinutes: 60,
    perPlacementCooldownMinutes: 30,
    minimumSessionAgeSeconds: 30,
    minimumInteractionsBeforeAd: 2
  },
  triggers: {
    'place-exploration': {enabled:true, priority:2, placeTriggerCount:3, minDwellSeconds:4},
    'audio-guide':       {enabled:true, priority:3, audioMinimumPlaybackSeconds:20, interruptAtNaturalPause:false},
    'audio-inline':      {enabled:true, afterSeconds:1},   // small silent card under a playing story, shown as it starts (see Inline below)
    'itinerary':         {enabled:true, priority:1, minItems:2},
    'map-location':      {enabled:true, priority:2, minDwellSeconds:5}
  },
  safety: {settleMs:1200, criticalSuspendMinutes:3, typingQuietMs:4000, retryMs:5000, maxRetries:3, opportunityTtlMinutes:10, ctaGuardMs:600},
  audioSponsoredMessages: false,                // reserved: sponsor line inside narration. Off; nothing reads it until built.
  providers: {
    sponsor: {enabled:true, feedUrl:null},      // future: '/api/sponsors' → {"sponsors":[…]}
    house:   {enabled:true},
    google:  {enabled:false, adUnitPath:'', sizes:[[300,250],[336,280]], requiresConsent:true}
  },
  analytics: {enabled:true, includeSessionId:false},
  loadTimeoutMs: 8000
});

/* Jaisalmer Visit's own promotions. Shown as "From Jaisalmer Visit", never as paid content. */
const HOUSE_ADS = VJData.get('HOUSE_ADS', [
  {id:'house-itinerary', title:'Planning a few days here?', ctaText:'See the itineraries', target:'#plan',
   description:'Ready-made Jaisalmer plans from one day to a desert-focused trip, morning to evening, with the stops linked to the Smart Tourist Map.',
   placements:['place-exploration','audio-guide','map-location']},
  {id:'house-map', title:'Everything nearby, on one map', ctaText:'Open the map', target:'#map',
   description:'Attractions, food, transport and essentials around you, with walking and driving directions.',
   placements:['place-exploration','audio-guide','itinerary']}
]);

/* Direct local sponsors. Empty until a real, paid sponsor is agreed. Record shape (Admin Panel / API):
   {id:'sp-001', title:'Sunset Desert Safari', description:'…', image:'https://…', logo:'https://…',
    category:'desert-safari', location:'Sam Sand Dunes', ctaText:'Explore', destinationUrl:'https://…',
    sponsoredLabel:'Sponsored', startDate:'2026-10-01', endDate:'2026-12-31', status:'active', priority:5,
    placements:['place-exploration','audio-guide']}                                                        */
const SPONSOR_ADS = VJData.get('SPONSOR_ADS', []);

const SmartAdManager = (function(){
  const CFG = SMART_AD_CONFIG;
  const MIN = 60000;
  const now = ()=>Date.now();
  const LOCAL_DEV = location.protocol==='file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const DEBUG = CFG.debug===true || (LOCAL_DEV && /[?&]ads-debug(?:[=&]|$)/.test(location.search));
  const PLACEMENTS = ['place-exploration','audio-guide','itinerary','map-location'];

  /* ---------- StorageAdapter: tiny counters only; never throws ---------- */
  const StorageAdapter = (function(){
    const mem = {};
    function area(name){
      return {
        get(k, fallback){ try{ const v = window[name].getItem(k); return v==null ? fallback : JSON.parse(v); }
                          catch(e){ return mem[name+k]!==undefined ? mem[name+k] : fallback; } },
        set(k, v){ mem[name+k] = v; try{ window[name].setItem(k, JSON.stringify(v)); }catch(e){} },
        remove(k){ delete mem[name+k]; try{ window[name].removeItem(k); }catch(e){} }
      };
    }
    return {session:area('sessionStorage'), local:area('localStorage')};
  })();
  const S_KEY = 'jm_ads_session', D_KEY = 'jm_ads_daily';
  function freshSession(){ return {startedAt:now(), count:0, lastAt:0, interactions:0, perAd:{}, perPlacement:{}, places:[], sid:Math.random().toString(36).slice(2,10)}; }
  let session = Object.assign(freshSession(), StorageAdapter.session.get(S_KEY, {}) || {});
  const saveSession = ()=>StorageAdapter.session.set(S_KEY, session);
  saveSession();
  function dayKey(){ const d = new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
  function daily(){ const d = StorageAdapter.local.get(D_KEY, null); return (d && d.day===dayKey()) ? d : {day:dayKey(), count:0, lastAt:0}; }

  /* ---------- AnalyticsAdapter + AdAnalyticsRepository (in-memory summary for a future Admin Panel) ---------- */
  const device = ()=>{ try{ return matchMedia('(max-width:767px)').matches ? 'mobile' : matchMedia('(max-width:1099px)').matches ? 'tablet' : 'desktop'; }catch(e){ return 'unknown'; } };
  const AdAnalyticsRepository = (function(){
    const rows = {};                              // adId → counters
    const COUNT = {ad_viewed:'impressions', ad_clicked:'clicks', ad_closed:'closes', ad_completed:'completions', ad_skipped:'skips', ad_failed:'failures'};
    return {
      endpoint: null,                             // future: POST aggregated counters here
      record(e){
        const k = COUNT[e.event]; if(!k || !e.adId) return;
        const r = rows[e.adId] || (rows[e.adId] = {adId:e.adId, provider:e.provider, impressions:0, clicks:0, closes:0, completions:0, skips:0, failures:0, byTrigger:{}, byDevice:{}});
        r[k]++;
        if(k==='impressions'){ r.byTrigger[e.trigger] = (r.byTrigger[e.trigger]||0)+1; r.byDevice[e.device] = (r.byDevice[e.device]||0)+1; }
      },
      summary(){ return Object.keys(rows).map(id=>{ const r = rows[id];
        return Object.assign({}, r, {ctr:r.impressions ? r.clicks/r.impressions : 0, closeRate:r.impressions ? r.closes/r.impressions : 0,
          completionRate:r.impressions ? r.completions/r.impressions : 0}); }); }
    };
  })();
  function track(name, d){
    d = d || {};
    const detail = {event:name, adId:d.adId||null, placement:d.placement||null, trigger:d.trigger||null,
      provider:d.provider||null, reason:d.reason||null, timestamp:new Date().toISOString(), device:device()};
    if(CFG.analytics.includeSessionId) detail.sessionId = session.sid;
    try{ AdAnalyticsRepository.record(detail); }catch(e){}
    if(CFG.analytics.enabled){
      try{ document.dispatchEvent(new CustomEvent('jm:analytics', {detail})); if(Array.isArray(window.dataLayer)) window.dataLayer.push(detail); }catch(e){}
    }
    lastDecision = name + (detail.reason ? ' ('+detail.reason+')' : '');
    Debug.log(detail);
  }

  /* ---------- ConsentAdapter: wire your consent tool to window.JM_CONSENT = {ads:true} ---------- */
  const ConsentAdapter = {ads(){ const c = window.JM_CONSENT; return !!(c && c.ads===true); }};

  /* ---------- AdStateMachine ---------- */
  const NEXT = {
    HIDDEN:['ELIGIBLE','COOLDOWN','DISABLED'], ELIGIBLE:['TRIGGERED','HIDDEN','DISABLED'], TRIGGERED:['LOADING','HIDDEN','DISABLED'],
    LOADING:['VISIBLE','HIDDEN','ERROR'], VISIBLE:['PLAYING','COMPLETED','CLOSED','SKIPPED','ERROR'], PLAYING:['COMPLETED','CLOSED','SKIPPED','ERROR'],
    COMPLETED:['HIDDEN'], CLOSED:['HIDDEN'], SKIPPED:['HIDDEN'], ERROR:['HIDDEN'], COOLDOWN:['ELIGIBLE','HIDDEN','DISABLED'], DISABLED:['HIDDEN']
  };
  let state = 'HIDDEN', lastDecision = '', lastTrigger = '', lastProvider = '';
  function go(next){
    if(next===state) return true;
    if((NEXT[state]||[]).indexOf(next)<0){ Debug.log({event:'invalid_transition', reason:state+'→'+next}); return false; }
    state = next; Debug.render(); return true;
  }
  const ACTIVE = ['TRIGGERED','LOADING','VISIBLE','PLAYING'];

  /* ---------- FrequencyController ---------- */
  const Frequency = {
    block(placement){
      const f = CFG.frequency, t = now(), d = daily();
      if(session.count >= f.maxAdsPerSession) return {kind:'frequency', reason:'session_limit'};
      if(d.count >= f.maxAdsPerDay) return {kind:'frequency', reason:'daily_limit'};
      const last = Math.max(session.lastAt||0, d.lastAt||0);
      if(last && t-last < f.globalCooldownMinutes*MIN) return {kind:'cooldown', reason:'global_cooldown'};
      const p = session.perPlacement[placement];
      if(p && t-p < f.perPlacementCooldownMinutes*MIN) return {kind:'cooldown', reason:'placement_cooldown'};
      return null;
    },
    adAllowed(id){ const t = session.perAd[id]; return !t || now()-t >= CFG.frequency.perAdCooldownMinutes*MIN; },
    cooldownLeft(){ const last = Math.max(session.lastAt||0, daily().lastAt||0); return last ? Math.max(0, last + CFG.frequency.globalCooldownMinutes*MIN - now()) : 0; },
    record(adId, placement){
      const t = now();
      session.count++; session.lastAt = t; session.perPlacement[placement] = t; session.perAd[adId] = t; saveSession();
      const d = daily(); d.count++; d.lastAt = t; StorageAdapter.local.set(D_KEY, d);
    }
  };

  /* ---------- Suspensions (critical actions) ---------- */
  const suspensions = {};                         // reason → until (0 = until resume())
  function suspend(reason, ms){
    reason = String(reason||'manual');
    suspensions[reason] = ms ? now()+ms : 0;
    dropPending('suspended');
    if(state==='LOADING' || state==='TRIGGERED') abortLoading();
    Debug.render();
  }
  function resume(reason){ delete suspensions[String(reason||'manual')]; Debug.render(); }
  function suspended(){
    const t = now();
    for(const k in suspensions){ if(suspensions[k] && suspensions[k] <= t) delete suspensions[k]; else return k; }
    return null;
  }

  /* ---------- EligibilityEngine ---------- */
  function eligibility(opp){
    if(!CFG.enabled) return {kind:'eligibility', reason:'disabled'};
    const s = suspended(); if(s) return {kind:'eligibility', reason:'suspended:'+s};
    const fb = Frequency.block(opp.placement); if(fb) return fb;
    if(opp.force && DEBUG) return null;
    const f = CFG.frequency;
    if(now()-session.startedAt < f.minimumSessionAgeSeconds*1000) return {kind:'gate', reason:'session_too_new'};
    if((session.interactions||0) < f.minimumInteractionsBeforeAd) return {kind:'gate', reason:'too_few_interactions'};
    return null;
  }

  /* ---------- current user state: is this a safe moment? ---------- */
  const input = {lastKeyAt:0, clicks:[], rapidUntil:0, lastScrollY:window.scrollY||0, lastScrollAt:0, fastScrollAt:0};
  const isOpen = (id, cls)=>{ const el = document.getElementById(id); return !!(el && el.classList.contains(cls)); };
  function unsafeReason(opp){
    if(document.visibilityState && document.visibilityState!=='visible') return 'tab_hidden';
    const s = suspended(); if(s) return 'suspended:'+s;
    const ae = document.activeElement;
    if(ae && ae.matches && ae.matches('input:not([type=button]):not([type=submit]):not([type=checkbox]):not([type=radio]),textarea,select,[contenteditable=""],[contenteditable="true"]')) return 'typing';
    if(now()-input.lastKeyAt < CFG.safety.typingQuietMs) return 'typing';
    if(now() < input.rapidUntil) return 'rapid_clicking';
    if(now()-input.fastScrollAt < 800) return 'fast_scroll';
    const overModal = opp.trigger==='audio-guide' && opp.ctx.interrupt===true;
    if(!overModal && isOpen('modalOverlay','open')) return 'modal_open';
    if(isOpen('addServiceOverlay','open')) return 'form_open';
    if(isOpen('searchPanel','open')) return 'search_open';
    if(isOpen('megaLayer','is-open')) return 'menu_open';
    if(isOpen('touristModePanel','open')) return 'tourist_mode';
    if(document.documentElement.classList.contains('mv-open')) return 'map_open';
    return null;
  }

  /* ---------- TriggerEngine ---------- */
  let pending = null, settleTimer = 0, retryTimer = 0;
  function cleanCtx(ctx){
    const out = {};
    if(ctx && typeof ctx==='object') ['placeId','section','itemCount','audioId','interrupt','immediate','force'].forEach(k=>{
      const v = ctx[k]; if(typeof v==='boolean' || typeof v==='number') out[k] = v; else if(typeof v==='string') out[k] = v.slice(0,80);
    });
    return out;
  }
  function dropPending(reason){
    if(!pending) return;
    pending = null; clearTimeout(settleTimer); clearTimeout(retryTimer);
    if(state==='ELIGIBLE') go('HIDDEN');
    Debug.log({event:'opportunity_dropped', reason});
  }
  function requestAdOpportunity(trigger, ctx){
    trigger = String(trigger||''); ctx = cleanCtx(ctx);
    const tc = CFG.triggers[trigger];
    lastTrigger = trigger;
    const base = {trigger, placement:trigger};
    track('ad_triggered', base);
    if(!CFG.enabled || !tc || !tc.enabled){ track('ad_not_eligible', Object.assign({reason:'trigger_disabled'}, base)); return false; }
    if(state==='DISABLED'){ track('ad_not_eligible', Object.assign({reason:'disabled'}, base)); return false; }
    if(ACTIVE.indexOf(state)>=0){ track('ad_not_eligible', Object.assign({reason:'ad_active'}, base)); return false; }   // one ad at a time
    const opp = {trigger, placement:trigger, priority:tc.priority||1, ctx, at:now(), retries:0, force:!!ctx.force};
    const b = eligibility(opp);
    if(b && b.kind!=='gate'){
      track(b.kind==='cooldown' ? 'ad_cooldown_blocked' : b.kind==='frequency' ? 'ad_frequency_blocked' : 'ad_not_eligible', Object.assign({reason:b.reason}, base));
      if(b.reason==='session_limit' || b.reason==='daily_limit'){ dropPending(b.reason); if(state==='HIDDEN' || state==='COOLDOWN') go('DISABLED'); }
      return false;
    }
    if(pending && pending.priority >= opp.priority){                        // queue of one: keep the stronger request
      pending.ctx = Object.assign({}, opp.ctx, pending.ctx);
      track('ad_not_eligible', Object.assign({reason:'merged_into_'+pending.trigger}, base));
      return true;
    }
    pending = opp;
    if(state==='HIDDEN' || state==='COOLDOWN') go('ELIGIBLE');
    track('ad_eligible', base);
    if(ctx.interrupt || ctx.immediate) moment('trigger');
    return true;
  }
  function moment(kind){
    if(!pending || state!=='ELIGIBLE') return;
    if(now()-pending.at > CFG.safety.opportunityTtlMinutes*MIN){ dropPending('expired'); return; }
    clearTimeout(settleTimer); clearTimeout(retryTimer);
    settleTimer = setTimeout(evaluate, (kind==='trigger' || kind==='audio-pause') ? 0 : CFG.safety.settleMs);   // let the user land first; a narration pause is used at once
  }
  function evaluate(){
    const opp = pending; if(!opp || state!=='ELIGIBLE') return;
    const base = {trigger:opp.trigger, placement:opp.placement};
    const b = eligibility(opp);
    if(b){
      if(b.kind==='gate'){ track('ad_not_eligible', Object.assign({reason:b.reason}, base)); return; }        // may qualify later
      track(b.kind==='cooldown' ? 'ad_cooldown_blocked' : b.kind==='frequency' ? 'ad_frequency_blocked' : 'ad_not_eligible', Object.assign({reason:b.reason}, base));
      dropPending(b.reason); return;
    }
    const u = unsafeReason(opp);
    if(u){
      Debug.log({event:'not_safe_yet', reason:u});
      if(opp.retries < CFG.safety.maxRetries && /^(typing|rapid_clicking|fast_scroll)$/.test(u)){ opp.retries++; retryTimer = setTimeout(evaluate, CFG.safety.retryMs); }
      return;                                                               // otherwise wait for the next natural moment
    }
    pending = null;
    if(go('TRIGGERED')) show(opp);
  }

  /* ---------- AudioIntegration: the narration never loses its place ---------- */
  const AudioIntegration = {
    snap:null,
    before(){
      this.snap = null;
      try{ const A = window.JMHistoryAudio; if(!A || !A.snapshot) return;
        const s = A.snapshot(); if(s && s.key){ this.snap = s; if(s.playing) A.pause(); } }catch(e){}
    },
    after(){
      const s = this.snap; this.snap = null;
      if(!s || !s.playing) return;                                          // it was paused before the ad: leave it paused
      try{ const A = window.JMHistoryAudio; const n = A.snapshot(); if(n.key===s.key && n.state==='paused') A.resume(); }catch(e){}
    }
  };

  /* ---------- helpers ---------- */
  function h(tag, cls, text){ const n = document.createElement(tag); if(cls) n.className = cls; if(text!=null) n.textContent = text; return n; }
  const str = (v, max)=>String(v==null ? '' : v).replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0, max||200);
  function httpsUrl(u){
    u = String(u||'').trim(); if(!u) return '';
    try{ const url = new URL(u, document.baseURI); return url.protocol==='https:' ? url.href : ''; }catch(e){ return ''; }
  }
  function imageUrl(u){
    u = String(u||'').trim();
    if(/^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(u)) return u;
    return httpsUrl(u);
  }
  function withTimeout(p, ms){
    return new Promise((res, rej)=>{ const t = setTimeout(()=>rej(new Error('timeout')), ms);
      Promise.resolve(p).then(v=>{ clearTimeout(t); res(v); }, e=>{ clearTimeout(t); rej(e); }); });
  }
  function leastRecent(list){ return list.sort((a,b)=>(b.priority||0)-(a.priority||0) || (session.perAd[a.id]||0)-(session.perAd[b.id]||0))[0] || null; }

  /* ---------- SponsorRepository (direct local sponsors; Admin Panel / API ready) ---------- */
  const STATUSES = ['draft','scheduled','active','paused','expired'];
  const SponsorRepository = (function(){
    let list = [];
    function day(v){ const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v||'')); return m ? new Date(+m[1], +m[2]-1, +m[3]).getTime() : null; }
    function validate(r){
      if(!r || typeof r!=='object') return null;
      const id = str(r.id, 60), title = str(r.title, 80), url = httpsUrl(r.destinationUrl);
      if(!id || !title || !url) return null;                                // no id, title or safe https link → rejected
      const status = STATUSES.indexOf(r.status)>=0 ? r.status : 'draft';
      return {id, title, description:str(r.description, 240), image:imageUrl(r.image), logo:imageUrl(r.logo),
        category:str(r.category, 40), location:str(r.location, 60), ctaText:str(r.ctaText, 28) || 'Learn more', destinationUrl:url,
        sponsoredLabel:r.sponsoredLabel==='Advertisement' ? 'Advertisement' : 'Sponsored',
        start:day(r.startDate), end:day(r.endDate), status, priority:Number(r.priority)||0,
        placements:Array.isArray(r.placements) ? r.placements.filter(p=>PLACEMENTS.indexOf(p)>=0) : PLACEMENTS.slice()};
    }
    function effectiveStatus(s){
      if(s.status!=='active' && s.status!=='scheduled') return s.status;
      const t = now();
      if(s.start && t < s.start) return 'scheduled';
      if(s.end && t >= s.end + 86400000) return 'expired';
      return 'active';
    }
    let feedLoaded = false;
    return {
      load(records){ list = (Array.isArray(records) ? records : []).map(validate).filter(Boolean); return list.length; },
      loadFeed(){
        const u = CFG.providers.sponsor.feedUrl; if(!u || feedLoaded || typeof fetch!=='function') return;
        feedLoaded = true;
        fetch(u, {credentials:'omit', headers:{'Accept':'application/json'}}).then(r=>{ if(!r.ok) throw new Error('http'); return r.json(); })
          .then(j=>this.load(j && j.sponsors)).catch(()=>{ feedLoaded = false; });
      },
      active(placement){ return list.filter(s=>effectiveStatus(s)==='active' && s.placements.indexOf(placement)>=0); },
      all(){ return list.map(s=>Object.assign({effectiveStatus:effectiveStatus(s)}, s)); }
    };
  })();
  SponsorRepository.load(SPONSOR_ADS);

  /* ---------- AdRepository: future remote config (whitelisted keys only) ---------- */
  function merge(target, src){
    Object.keys(src||{}).forEach(k=>{
      if(!(k in target)) return;
      const v = src[k];
      if(v && typeof v==='object' && !Array.isArray(v) && target[k] && typeof target[k]==='object' && !Array.isArray(target[k])) merge(target[k], v);
      else if(typeof v===typeof target[k] || target[k]===null) target[k] = v;
    });
  }
  const AdRepository = {configure(partial){ merge(CFG, partial); Debug.render(); return CFG; }};

  /* ---------- Card renderer shared by house / sponsor / mock (text only, no HTML injection) ---------- */
  function renderCard(slot, ad, life, titleId){
    if(ad.image){
      const m = h('div','sa-media'); const img = new Image(); img.alt = ''; img.decoding = 'async';
      img.onerror = ()=>m.remove(); img.src = ad.image; m.appendChild(img); slot.appendChild(m);
    }
    if(ad.logo || ad.meta){
      const b = h('div','sa-brand');
      if(ad.logo){ const l = new Image(); l.className = 'sa-logo'; l.alt = ''; l.onerror = ()=>l.remove(); l.src = ad.logo; b.appendChild(l); }
      if(ad.meta) b.appendChild(h('span','sa-meta', ad.meta));
      slot.appendChild(b);
    }
    const t = h('h2','sa-title', ad.title); t.id = titleId; slot.appendChild(t);
    if(ad.description) slot.appendChild(h('p','sa-desc', ad.description));
    if(ad.note) slot.appendChild(h('p','sa-note', ad.note));
    const actions = h('div','sa-actions');
    let cta;
    if(ad.destinationUrl){
      cta = h('a','modal-act primary', ad.ctaText); cta.href = ad.destinationUrl; cta.target = '_blank'; cta.rel = 'sponsored noopener noreferrer';
    }else{ cta = h('button','modal-act primary', ad.ctaText); cta.type = 'button'; }
    cta.addEventListener('click', e=>{
      if(!Overlay.ready()){ e.preventDefault(); return; }                  // guard against the tap that was already in flight
      life.onClick();
      if(ad.target){ e.preventDefault(); life.onClose('cta'); goInternal(ad.target); }
      else life.onClose('cta');
    });
    actions.appendChild(cta);
    slot.appendChild(actions);
  }
  function goInternal(target){
    setTimeout(()=>{
      if(/^#map/.test(target)){ location.hash = target; return; }
      const el = document.querySelector(target);
      if(location.hash!==target){ location.hash = target; } else if(el){ el.scrollIntoView({behavior:'smooth', block:'start'}); }
    }, 0);
  }

  /* ---------- Providers (normalized: isAvailable / load / render(slot, ad, life) / destroy) ---------- */
  const SponsorProvider = {
    id:'sponsor',
    isAvailable:()=>CFG.providers.sponsor.enabled,
    load(req){
      SponsorRepository.loadFeed();
      const s = leastRecent(SponsorRepository.active(req.placement).filter(x=>Frequency.adAllowed(x.id)));
      if(!s) return null;
      return {id:s.id, label:s.sponsoredLabel, title:s.title, description:s.description, image:s.image, logo:s.logo,
        meta:[s.category.replace(/-/g,' '), s.location].filter(Boolean).join(' · '), ctaText:s.ctaText, destinationUrl:s.destinationUrl};
    },
    render(slot, ad, life, titleId){ renderCard(slot, ad, life, titleId); life.onLoad(); },
    destroy(){}
  };
  const HouseProvider = {
    id:'house',
    isAvailable:()=>CFG.providers.house.enabled && HOUSE_ADS.length>0,
    load(req){
      const a = leastRecent(HOUSE_ADS.filter(x=>x && x.id && x.title && /^#[a-z][\w-]*$/.test(x.target||'') &&
        (!x.placements || x.placements.indexOf(req.placement)>=0) && Frequency.adAllowed(x.id)).map(x=>Object.assign({priority:0}, x)));
      if(!a) return null;
      return {id:a.id, label:'From Jaisalmer Visit', title:str(a.title,80), description:str(a.description,240), ctaText:str(a.ctaText,28), target:a.target};
    },
    render(slot, ad, life, titleId){ renderCard(slot, ad, life, titleId); life.onLoad(); },
    destroy(){}
  };
  /* Google Publisher Tag display slot inside our overlay. Loads only when configured AND consented.
     GPT reports render + viewability; it has no "completed" event, so none is ever sent. */
  const GoogleProvider = (function(){
    let lib = null, slot = null, life = null, wired = false;
    const c = ()=>CFG.providers.google;
    function available(){ return c().enabled && /^\/\d+\/\S+$/.test(c().adUnitPath||'') && (!c().requiresConsent || ConsentAdapter.ads()); }
    function loadLib(){
      if(window.googletag && window.googletag.apiReady) return Promise.resolve();
      if(lib) return lib;
      lib = new Promise((res, rej)=>{ const s = document.createElement('script'); s.async = true;
        s.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js'; s.onload = ()=>res(); s.onerror = ()=>{ lib = null; rej(new Error('blocked')); };
        document.head.appendChild(s); });
      return lib;
    }
    return {
      id:'google', reportsView:true,
      isAvailable:available,
      load(){ if(!available()) return null; return loadLib().then(()=>({id:'gpt:'+c().adUnitPath, label:'Advertisement', title:'Advertisement', provider:'google'})); },
      render(container, ad, lf){
        life = lf;
        const div = h('div','sa-slot'); div.id = 'sa-gpt-'+now(); container.appendChild(div);
        const g = window.googletag = window.googletag || {cmd:[]};
        g.cmd.push(()=>{ try{
          const pub = g.pubads();
          if(!wired){ wired = true;
            pub.addEventListener('slotRenderEnded', e=>{ if(life && e.slot===slot){ e.isEmpty ? life.onNoFill() : life.onLoad(); } });
            pub.addEventListener('impressionViewable', e=>{ if(life && e.slot===slot) life.onView(); }); }
          slot = g.defineSlot(c().adUnitPath, c().sizes, div.id);
          if(!slot){ life.onError(); return; }
          slot.addService(pub); g.enableServices(); g.display(div.id);
        }catch(e){ life && life.onError(); } });
      },
      destroy(){ try{ if(slot && window.googletag && googletag.destroySlots) googletag.destroySlots([slot]); }catch(e){} slot = null; life = null; }
    };
  })();
  /* DEVELOPMENT ONLY — never registered unless debug is on. Simulates a short video ad that reports completion. */
  const MockProvider = {
    id:'mock', mode:'ok', durationMs:5000, timer:0,
    isAvailable:()=>DEBUG,
    load(){
      if(this.mode==='empty') return null;
      if(this.mode==='fail') return Promise.reject(new Error('mock failure'));
      const ad = {id:'mock-video', label:'Advertisement', title:'Mock video advertisement', ctaText:'Mock call to action',
        description:'Stands in for a provider video so the lifecycle can be tested.', note:'DEVELOPMENT ONLY. This never appears in production.'};
      return this.mode==='slow' ? new Promise(r=>setTimeout(()=>r(ad), 60000)) : ad;
    },
    render(slot, ad, life, titleId){
      renderCard(slot, ad, life, titleId);
      const bar = h('div','sa-progress'); const fill = h('span'); bar.appendChild(fill); slot.appendChild(bar);
      life.onLoad(); life.onPlay();
      const start = now(), dur = this.durationMs;
      const tick = ()=>{ const p = Math.min(1, (now()-start)/dur); fill.style.width = (p*100)+'%';
        if(p>=1) life.onComplete(); else this.timer = setTimeout(tick, 100); };
      tick();
    },
    destroy(){ clearTimeout(this.timer); }
  };
  const PROVIDERS = {sponsor:SponsorProvider, house:HouseProvider, google:GoogleProvider, mock:MockProvider};
  function providerChain(){
    const order = CFG.providerPriority.slice();
    if(DEBUG && MockProvider.mode!=='off') order.unshift('mock');
    return order.map(k=>PROVIDERS[k]).filter(p=>{ try{ return p && p.isAvailable(); }catch(e){ return false; } });
  }
  function loadFrom(list, i, req){
    if(i>=list.length) return Promise.resolve(null);
    const p = list[i];
    let pr; try{ pr = withTimeout(p.load(req), CFG.loadTimeoutMs); }catch(e){ pr = Promise.reject(e); }
    return pr.then(ad=>ad ? {provider:p, ad} : loadFrom(list, i+1, req),
      ()=>{ track('ad_failed', {trigger:req.trigger, placement:req.placement, provider:p.id, reason:'provider_error'}); return loadFrom(list, i+1, req); });
  }

  /* ---------- OverlayController: exists in the DOM only while an ad is loading or visible ---------- */
  const Overlay = (function(){
    let root = null, card = null, shownAt = 0, prevFocus = null, lock = null, onKey = null;
    function lockScroll(){
      const b = document.body;
      lock = {overflow:b.style.overflow, pr:b.style.paddingRight};
      if(getComputedStyle(b).overflow!=='hidden'){
        const sw = window.innerWidth - document.documentElement.clientWidth;
        b.style.overflow = 'hidden';
        if(sw>0) b.style.paddingRight = sw+'px';                            // no layout shift when the scrollbar disappears
      }
    }
    function unlockScroll(){ if(!lock) return; document.body.style.overflow = lock.overflow; document.body.style.paddingRight = lock.pr; lock = null; }
    return {
      mount(label){
        this.remove();
        root = h('div','sa-overlay is-loading'); root.setAttribute('data-smart-ad','');
        card = h('div','sa-card'); card.setAttribute('role','dialog'); card.setAttribute('aria-modal','true'); card.tabIndex = -1;
        const top = h('div','sa-top');
        const lab = h('span','sa-label', label); lab.id = 'saLabel';
        const close = h('button','sa-close'); close.type = 'button'; close.setAttribute('aria-label','Close');
        close.appendChild(h('span', null, '×')).setAttribute('aria-hidden','true');
        top.appendChild(lab); top.appendChild(close);
        const body = h('div','sa-body');
        card.appendChild(top); card.appendChild(body); root.appendChild(card);
        document.body.appendChild(root);
        return {root, card, body, close, label:lab};
      },
      reveal(titleId){
        if(!root) return;
        card.setAttribute('aria-labelledby', titleId && document.getElementById(titleId) ? 'saLabel '+titleId : 'saLabel');
        prevFocus = document.activeElement;
        lockScroll();
        root.classList.remove('is-loading');
        shownAt = now();
        const c = card.querySelector('.sa-close'); try{ (c || card).focus({preventScroll:true}); }catch(e){}
      },
      ready(){ return root && !root.classList.contains('is-loading') && now()-shownAt >= CFG.safety.ctaGuardMs; },
      keys(handler){ onKey = e=>{ if(root && !root.classList.contains('is-loading')) handler(e, card); }; window.addEventListener('keydown', onKey, true); },
      remove(){
        if(onKey){ window.removeEventListener('keydown', onKey, true); onKey = null; }
        const wasVisible = root && !root.classList.contains('is-loading');
        if(root && root.parentNode) root.parentNode.removeChild(root);
        root = card = null;
        unlockScroll();
        if(wasVisible){ const f = prevFocus; prevFocus = null;
          if(f && f.isConnected && typeof f.focus==='function'){ try{ f.focus({preventScroll:true}); }catch(e){} } }
      }
    };
  })();

  /* ---------- show → lifecycle → teardown ---------- */
  let active = null, token = 0, cooldownTimer = 0;
  function show(opp){
    if(!go('LOADING')) return;
    const my = ++token;
    const req = {trigger:opp.trigger, placement:opp.placement, context:opp.ctx};
    track('ad_requested', {trigger:req.trigger, placement:req.placement});
    AudioIntegration.before();
    const watchdog = setTimeout(()=>{ if(my===token && state==='LOADING') fail('load_timeout'); }, CFG.loadTimeoutMs*1.5);
    active = {opp, req, provider:null, ad:null, watchdog, viewTimer:0, viewed:false};
    loadFrom(providerChain(), 0, req).then(hit=>{
      if(my!==token || state!=='LOADING') return;
      if(!hit){ nothing('no_fill'); return; }
      active.provider = hit.provider; active.ad = hit.ad; lastProvider = hit.provider.id;
      const ui = Overlay.mount(hit.ad.label || 'Advertisement');
      const titleId = 'saTitle'+my;
      const life = lifecycle(my, titleId);
      ui.close.addEventListener('click', ()=>life.onClose('close'));
      ui.root.addEventListener('click', e=>{ if(e.target===ui.root && Overlay.ready()) life.onClose('backdrop'); });
      Overlay.keys((e, card)=>{
        if(e.key==='Escape'){ e.preventDefault(); e.stopImmediatePropagation(); life.onClose('escape'); return; }
        if(e.key==='Tab'){                                                  // keep focus inside the dialog while it is open
          const f = [].slice.call(card.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(x=>x.offsetParent!==null);
          if(!f.length){ e.preventDefault(); return; }
          const first = f[0], last = f[f.length-1];
          if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
          else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
          else if(!card.contains(document.activeElement)){ e.preventDefault(); first.focus(); }
        }
      });
      try{ hit.provider.render(ui.body, hit.ad, life, titleId); }catch(e){ life.onError(); }
    }, ()=>{ if(my===token) fail('provider_error'); });
  }
  function lifecycle(my, titleId){
    const live = ()=>my===token && active;
    const base = ()=>({adId:active.ad.id, trigger:active.opp.trigger, placement:active.opp.placement, provider:active.provider.id});
    return {
      onLoad(){
        if(!live() || state!=='LOADING') return;
        clearTimeout(active.watchdog);
        go('VISIBLE'); Overlay.reveal(titleId);
        Frequency.record(active.ad.id, active.opp.placement);
        track('ad_loaded', base());
        if(!active.provider.reportsView) armView();
      },
      onView(){ if(live() && !active.viewed){ active.viewed = true; track('ad_viewed', base()); } },
      onPlay(){ if(live() && state==='VISIBLE') go('PLAYING'); },
      onClick(){ if(live()) track('ad_clicked', base()); },
      onClose(){ if(live()) end('CLOSED', 'ad_closed'); },
      onComplete(){ if(live()) end('COMPLETED', 'ad_completed'); },     // only providers that really report completion call this
      onSkip(){ if(live()) end('SKIPPED', 'ad_skipped'); },
      onNoFill(){ if(live() && state==='LOADING') nothing('no_fill'); },
      onError(){ if(live()) fail('render_error'); }
    };
  }
  function armView(){                                                    // an impression = visible for 1 s in a visible tab
    const a = active; clearTimeout(a.viewTimer);
    a.viewTimer = setTimeout(()=>{ if(active===a && document.visibilityState==='visible' && (state==='VISIBLE' || state==='PLAYING') && !a.viewed){
      a.viewed = true; track('ad_viewed', {adId:a.ad.id, trigger:a.opp.trigger, placement:a.opp.placement, provider:a.provider.id}); } }, 1000);
  }
  function end(endState, evt){
    const a = active; if(!a || !go(endState)) return;
    track(evt, {adId:a.ad.id, trigger:a.opp.trigger, placement:a.opp.placement, provider:a.provider.id});
    teardown(); go('HIDDEN'); afterAd();
  }
  function fail(reason){
    const a = active; if(!a) return;
    const shown = state==='VISIBLE' || state==='PLAYING';
    if(!go('ERROR')) return;
    track('ad_failed', {adId:a.ad ? a.ad.id : null, trigger:a.opp.trigger, placement:a.opp.placement, provider:a.provider ? a.provider.id : null, reason});
    teardown(); go('HIDDEN');
    if(shown) afterAd();
  }
  function nothing(reason){                                              // no ad available: the visitor never knows
    const a = active; if(!a) return;
    track('ad_not_eligible', {trigger:a.opp.trigger, placement:a.opp.placement, reason});
    teardown(); go('HIDDEN');
  }
  function abortLoading(){
    if(state==='TRIGGERED'){ go('HIDDEN'); return; }
    if(state==='LOADING'){ token++; teardown(); go('HIDDEN'); }
  }
  function teardown(){                                                   // always leaves the page exactly as it was
    const a = active; active = null; token++;
    if(a){ clearTimeout(a.watchdog); clearTimeout(a.viewTimer); try{ a.provider && a.provider.destroy(); }catch(e){} }
    try{ Overlay.remove(); }catch(e){ document.body.style.overflow = ''; }
    try{ AudioIntegration.after(); }catch(e){}
    Debug.render();
  }
  function afterAd(){
    clearTimeout(cooldownTimer);
    if(session.count >= CFG.frequency.maxAdsPerSession){ go('DISABLED'); return; }
    if(go('COOLDOWN')) cooldownTimer = setTimeout(()=>{ if(state==='COOLDOWN') go('HIDDEN'); }, Frequency.cooldownLeft()+50);
  }

  /* ---------- listeners: interactions, critical actions, safe moments ---------- */
  const CRITICAL_SEL = 'a[href^="tel:"],a[href^="sms:"],a[href^="geo:"],a[href*="wa.me/"],a[href*="whatsapp"],a[href*="google.com/maps"],' +
    'a[href*="maps.google"],a[href*="maps.apple"],[data-view-on-map],[data-act="call"],[data-act="wa"],[data-act="whatsapp"],[data-act="dir"],' +
    '[data-act="contact"],[data-pd="map"],[data-pd="dir"],[data-pop="call"],[data-pop="nav"],[data-pop="whatsapp"],[data-pop="contact"],#useLocationBtn,#mvNear,#touristModeBtn';
  const CRITICAL_TEXT = /\b(emergency|hospital|police|ambulance|directions?|navigate|navigation|call|whatsapp|my location)\b/i;
  const CRITICAL_MAP = ['essential','transport'];                        // hospitals, police, railway, airport, bus
  document.addEventListener('click', e=>{
    const t = e.target;
    if(!t || !t.closest || t.closest('[data-smart-ad]')) return;
    const c = t.closest('a,button,[role="button"]');
    if(c && (c.matches(CRITICAL_SEL) || (c.textContent && c.textContent.length<40 && CRITICAL_TEXT.test(c.textContent)))){
      suspend('critical-action', CFG.safety.criticalSuspendMinutes*MIN); return;
    }
    if(c || t.closest('.card-attraction,.activity-tile,.near-me-item')){
      session.interactions = (session.interactions||0)+1; saveSession();
      const n = now(); input.clicks = input.clicks.filter(x=>n-x<2000); input.clicks.push(n);
      if(input.clicks.length>=5) input.rapidUntil = n+4000;              // 5 taps in 2 s = frantic, not reading
    }
    const tab = t.closest('.trip-tab, [data-act="save"]');                 // itinerary planning and saved places
    if(tab) Trigger.itineraryItem(tab.classList.contains('trip-tab') ? 'tab:'+tab.textContent : 'save:'+now());
    if(t.closest('#mapView')) setTimeout(Trigger.mapHash, 60);
  }, true);
  document.addEventListener('submit', ()=>suspend('form-submit', CFG.safety.criticalSuspendMinutes*MIN), true);
  document.addEventListener('keydown', e=>{
    const el = e.target;
    if(el && el.matches && el.matches('input,textarea,select,[contenteditable=""],[contenteditable="true"]')) input.lastKeyAt = now();
  }, true);
  window.addEventListener('scroll', ()=>{
    const t = now(), y = window.scrollY||0, dt = t-input.lastScrollAt;
    if(dt>0 && dt<200 && Math.abs(y-input.lastScrollY)/dt > 2.5) input.fastScrollAt = t;
    input.lastScrollY = y; input.lastScrollAt = t;
  }, {passive:true});
  window.addEventListener('hashchange', ()=>{ if(state==='VISIBLE' || state==='PLAYING'){ const a = active; if(a) end('CLOSED','ad_closed'); } });
  window.addEventListener('popstate', ()=>{ if(state==='VISIBLE' || state==='PLAYING'){ const a = active; if(a) end('CLOSED','ad_closed'); } });
  document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible' && active && !active.viewed && (state==='VISIBLE' || state==='PLAYING') && !active.provider.reportsView) armView(); });
  window.addEventListener('pagehide', ()=>{ if(active) teardown(); });

  const Trigger = {
    place:null, seen:new Set(session.places||[]), audio:{key:null, last:0, listened:0, fired:{}}, itinerary:new Set(), itineraryFired:false,
    map:{slug:null, at:0, critical:false},
    placeOpened(id){ this.placeClosed(); this.place = {id:String(id), at:now()}; },
    placeClosed(){
      const p = this.place; this.place = null;
      const tc = CFG.triggers['place-exploration'];
      if(!p || now()-p.at < tc.minDwellSeconds*1000 || this.seen.has(p.id)) return;   // accidental taps and repeats don't count
      this.seen.add(p.id); session.places = Array.from(this.seen).slice(-30); saveSession();
      if(this.seen.size % tc.placeTriggerCount===0) requestAdOpportunity('place-exploration', {placeId:p.id, section:'explore', itemCount:this.seen.size});
    },
    itineraryItem(key){
      this.itinerary.add(key);
      if(!this.itineraryFired && this.itinerary.size >= CFG.triggers.itinerary.minItems){ this.itineraryFired = true;
        requestAdOpportunity('itinerary', {itemCount:this.itinerary.size, section:'plan'}); }
    },
    mapHash(){
      const m = /^#map\/([^?&]+)/.exec(location.hash||''); if(!m || !window.JMMap || !JMMap.get) return;
      let loc = null; try{ loc = JMMap.get(decodeURIComponent(m[1])); }catch(e){}
      if(!loc) return;
      if(CRITICAL_MAP.indexOf(loc.category)>=0){ Trigger.map.critical = true; suspend('critical-place', CFG.safety.criticalSuspendMinutes*MIN); return; }
      if(Trigger.map.slug!==loc.slug) Trigger.map = {slug:loc.slug, at:now(), critical:Trigger.map.critical};
    },
    mapClosed(){
      const m = this.map; this.map = {slug:null, at:0, critical:false};
      if(!m.slug || m.critical || now()-m.at < CFG.triggers['map-location'].minDwellSeconds*1000) return;
      requestAdOpportunity('map-location', {placeId:m.slug, section:'map'});
    }
  };
  window.addEventListener('hashchange', ()=>setTimeout(Trigger.mapHash, 30));
  new MutationObserver(()=>{                                             // Smart Map opened / closed
    const open = document.documentElement.classList.contains('mv-open');
    if(open===mapOpen) return; mapOpen = open;
    if(!open){ Trigger.mapClosed(); moment('map-closed'); }
  }).observe(document.documentElement, {attributes:true, attributeFilter:['class']});
  let mapOpen = document.documentElement.classList.contains('mv-open');
  if('IntersectionObserver' in window){                                  // quiet section transitions are natural pauses too
    let current = '';
    const io = new IntersectionObserver(entries=>{ entries.forEach(en=>{ if(en.isIntersecting && en.target.id!==current){ current = en.target.id; moment('section-change'); } }); }, {threshold:0.4});
    ['explore','things-to-do','transport','plan'].forEach(id=>{ const el = document.getElementById(id); if(el) io.observe(el); });
  }
  /* In-story card (client, 19 Oct 2026): while a history story plays, a small card sits under the player and goes
     away when the story ends. Paid sponsors for the "audio-guide" placement first, else Jaisalmer Visit's own promos.
     Text + small image only, never sound or video — so it is never a Google ad (their video ads can't be muted
     from the page). It doesn't pause the story, isn't a popup and doesn't use up the popup limits; a story
     that showed one gets no popup after it. */
  const Inline = (function(){
    let card = null, cardKey = '', turn = 0;
    function pick(){
      SponsorRepository.loadFeed();
      const sp = SponsorRepository.active('audio-guide');
      const pool = sp.length
        ? sp.map(x=>({id:x.id, provider:'sponsor', label:x.sponsoredLabel, title:x.title, description:x.description, image:x.logo || x.image, ctaText:x.ctaText, destinationUrl:x.destinationUrl}))
        : HOUSE_ADS.filter(x=>x && x.id && x.title && /^#[a-z][\w-]*$/.test(x.target||'') && (!x.placements || x.placements.indexOf('audio-guide')>=0))
            .map(x=>({id:x.id, provider:'house', label:'From Jaisalmer Visit', title:str(x.title,80), description:str(x.description,160), ctaText:str(x.ctaText,28) || 'Open', target:x.target}));
      return pool.length ? pool[(turn++) % pool.length] : null;
    }
    function show(key){
      const root = document.querySelector('#modalSheet .ha'), ad = root && pick();
      if(!ad) return false;
      hide(true);
      const ctx = {adId:ad.id, placement:'audio-inline', trigger:'audio-inline', provider:ad.provider};
      card = h('aside','ha-ad'); card.setAttribute('aria-label', ad.label); cardKey = key;
      if(ad.image){ const img = new Image(); img.className = 'ha-ad-img'; img.alt = ''; img.decoding = 'async'; img.width = 56; img.height = 56; img.onerror = ()=>img.remove(); img.src = ad.image; card.appendChild(img); }
      const body = h('div','ha-ad-body');
      body.appendChild(h('span','ha-ad-label', ad.label));
      body.appendChild(h('strong','ha-ad-title', ad.title));
      if(ad.description) body.appendChild(h('span','ha-ad-desc', ad.description));
      card.appendChild(body);
      const cta = h('a','ha-ad-cta', ad.ctaText + ' →');
      if(ad.destinationUrl){ cta.href = ad.destinationUrl; cta.target = '_blank'; cta.rel = 'sponsored noopener noreferrer'; }
      else cta.href = ad.target;
      cta.addEventListener('click', ev=>{
        track('ad_clicked', ctx);
        if(ad.target){ ev.preventDefault(); if(typeof closeModal==='function') closeModal(); goInternal(ad.target); }
      });
      card.appendChild(cta);
      const before = root.querySelector('.ha-tx-toggle');
      root.insertBefore(card, before || null);
      requestAnimationFrame(()=>{ if(card) card.classList.add('is-in'); });
      track('ad_viewed', ctx);
      return true;
    }
    function hide(now){
      const c = card; card = null; cardKey = '';
      if(!c) return;
      if(now || !c.isConnected){ c.remove(); return; }
      c.classList.remove('is-in'); setTimeout(()=>c.remove(), 350);
    }
    return {show, hide, get key(){ return card && card.isConnected ? cardKey : ''; }};
  })();
  document.addEventListener('jm:history-audio', e=>{
    const d = e.detail || {}, tc = CFG.triggers['audio-guide'], A = Trigger.audio, ic = CFG.triggers['audio-inline'];
    if(d.type==='state' && (d.state==='completed' || d.state==='idle' || d.state==='error')) Inline.hide();
    if(d.type==='progress' && d.playing && d.key){
      if(A.key!==d.key){ A.key = d.key; A.last = d.currentTime; A.listened = 0; Inline.hide(true); }
      else { const dt = d.currentTime - A.last; if(dt>0 && dt<2.5) A.listened += dt; A.last = d.currentTime; }
      if(CFG.enabled && ic && ic.enabled && !Inline.key && A.listened >= ic.afterSeconds){
        if(Inline.show(d.key)) A.fired[d.key] = true;                   // no popup after a story that carried a card
      }
      if(!A.fired[d.key] && A.listened >= tc.audioMinimumPlaybackSeconds){ A.fired[d.key] = true;
        requestAdOpportunity('audio-guide', {placeId:d.attractionId||'', audioId:d.key, interrupt:!!tc.interruptAtNaturalPause}); }
    }
    if(d.type==='boundary' && pending && pending.trigger==='audio-guide' && pending.ctx.interrupt) moment('audio-pause');
  });

  /* ---------- hooks called by the site (openModal / closeModal) ---------- */
  function notify(kind, ctx){
    if(kind==='place-open'){ Trigger.placeOpened(ctx && ctx.placeId); return; }
    if(kind==='modal-closed'){ Inline.hide(true); Trigger.placeClosed(); moment('modal-closed'); return; }
    moment(kind);
  }

  /* ---------- Debug panel (dev only) ---------- */
  const Debug = (function(){
    let panel = null, logBox = null, timer = 0;
    const lines = [];
    function fmt(ms){ const s = Math.ceil(ms/1000); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
    function build(){
      if(!DEBUG || panel || !document.body) return;
      panel = h('div','sa-debug'); panel.setAttribute('data-smart-ad','');
      panel.appendChild(h('div','sa-debug-out'));
      const row = h('div','sa-debug-row');
      [['Force opportunity', ()=>{ requestAdOpportunity('place-exploration', {force:true, immediate:true}); }],
       ['Mock: ok', function(){ const m = ['ok','empty','fail','slow','off']; MockProvider.mode = m[(m.indexOf(MockProvider.mode)+1)%m.length]; this.textContent = 'Mock: '+MockProvider.mode; }],
       ['Reset limits', ()=>{ session = Object.assign(freshSession(), {startedAt:0, interactions:99}); saveSession(); StorageAdapter.local.remove(D_KEY);
          clearTimeout(cooldownTimer); if(state==='COOLDOWN' || state==='DISABLED') go('HIDDEN'); for(const k in suspensions) delete suspensions[k]; render(); }]
      ].forEach(([t, fn])=>{ const b = h('button', null, t); b.type = 'button'; b.addEventListener('click', fn); row.appendChild(b); });
      panel.appendChild(row);
      logBox = h('div','sa-debug-log'); panel.appendChild(logBox);
      document.body.appendChild(panel);
      timer = setInterval(render, 1000);
    }
    function render(){
      if(!DEBUG) return; build(); if(!panel) return;
      const d = daily();
      panel.firstChild.textContent = 'SmartAdManager\nState: '+state+'\nTrigger: '+(lastTrigger||'—')+'\nPending: '+(pending ? pending.trigger : '—')+
        '\nSession ads: '+session.count+'/'+CFG.frequency.maxAdsPerSession+'   Today: '+d.count+'/'+CFG.frequency.maxAdsPerDay+
        '\nCooldown: '+fmt(Frequency.cooldownLeft())+'\nSession age: '+fmt(now()-session.startedAt)+'   Interactions: '+(session.interactions||0)+
        '\nProvider: '+(lastProvider||'—')+'   Suspended: '+(suspended()||'no')+'\nDecision: '+(lastDecision||'—');
      logBox.textContent = lines.slice(-6).join('\n');
    }
    return {
      log(d){ if(!DEBUG) return; lines.push(new Date().toLocaleTimeString()+' '+d.event+(d.reason ? ' '+d.reason : '')+(d.provider ? ' ['+d.provider+']' : '')); render(); },
      render, enabled:DEBUG
    };
  })();
  if(DEBUG){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', Debug.render); else Debug.render(); }

  return {
    request:requestAdOpportunity, requestAdOpportunity, notify, suspend, resume,
    configure:AdRepository.configure, getState:()=>state,
    status:()=>({state, pending:pending ? pending.trigger : null, sessionAds:session.count, todayAds:daily().count,
      cooldownMs:Frequency.cooldownLeft(), suspended:suspended(), provider:lastProvider, lastDecision}),
    sponsors:SponsorRepository, analytics:AdAnalyticsRepository,
    providers:{register(id, p){ if(id && p && typeof p.load==='function' && typeof p.render==='function' && !PROVIDERS[id]){ PROVIDERS[id] = p; return true; } return false; }},
    _mock:DEBUG ? MockProvider : undefined
  };
})();
window.SmartAdManager = SmartAdManager;

/* ============================================================
   THINGS TO DO → ACTIVITY → EXPERIENCE → LOCAL PROVIDER → ENQUIRY
   ------------------------------------------------------------
   Three separate layers, joined only by ids:
     ACTIVITIES (+ ACTIVITY_INFO)  editorial: what the activity is      (Camel Safari)
     EXPERIENCES                   a specific offer under an activity   (Sunset Camel Safari)
     PROVIDERS                     the local operator who runs it       (Operator A)

   Nothing is invented. PROVIDERS and EXPERIENCES are deliberately EMPTY until real,
   approved local operators are added — every activity then shows an honest empty state.

   Add a provider + experience (static, or later from an admin panel / API via
   ACTIVITY_FEED.url or JMActivities.addListings):

   PROVIDERS.push({
     providerId:'op-001', providerName:'Business or person name',
     phone:'98xxxxxx00', whatsapp:'98xxxxxx00',      // any of: 9876543210, +91 98765-43210, 09876543210
     location:'Sam', verificationStatus:'approved'    // only 'approved' is ever shown publicly
   });
   EXPERIENCES.push({
     experienceId:'exp-001', activityId:'camel-safari', providerId:'op-001',
     title:'Sunset Camel Safari', description:'Short plain-text description',
     price:1200, priceUnit:'person',                  // omit price → "Price on enquiry"
     duration:'1–2 hrs', location:'Sam Sand Dunes',
     pickupAvailable:true, privateOption:false,
     availableDays:['Daily'], availableTimes:['Sunset'],
     mapRef:'sam'                                     // optional: an ATTRACTIONS id → "View on map"
   });

   Activity field mapping (spec model → existing data):
     activityId=id · title=name · category=cat · description · duration · bestTime ·
     suitableFor · experiencePoints (all in ACTIVITY_INFO, keyed by id)

   The record-level verificationStatus is stored but NEVER rendered as a "Verified" badge —
   the site has no verification process yet. Provider ranking / featured placement is not
   implemented; cards render in the order they are listed.
   ============================================================ */
const ACTIVITY_INFO = VJData.get('ACTIVITY_INFO', {
  'camel-safari':{
    description:'Experience the Thar on camelback, from short desert rides to sunset experiences.',
    duration:'Typically 1–2 hrs', location:'Sam / Khuri', bestTime:'Best at sunset',
    suitableFor:['Couples','Families','Photography','Solo'],
    experiencePoints:['Camel ride across the dunes','Golden dunes','Sunset views','Photography'],
    mapRefs:['sam','khuri'], areas:['sam','khuri'], keywords:['safari','camel ride','desert','dunes']},
  'jeep-safari':{
    description:'Cover more of the desert by jeep — dune tracks, open sand and wide desert views beyond the main viewpoint.',
    location:'Sam / Khuri dunes', bestTime:'Late afternoon into sunset',
    suitableFor:['Families','Groups','Adventure','Photography'],
    experiencePoints:['Jeep ride over desert tracks','Open desert landscapes','Photo stops','Sunset from the sand'],
    mapRefs:['sam','khuri'], areas:['sam','khuri'], keywords:['safari','jeep','4x4','desert']},
  'dune-bashing':{
    description:'Fast, bumpy 4x4 rides over the dunes — an adrenaline-led add-on to a desert evening. Ask the operator about seat belts and driver experience before you go.',
    location:'Sam dunes', bestTime:'Late afternoon',
    suitableFor:['Adventure','Groups'],
    experiencePoints:['4x4 drive over sand dunes','Steep dune climbs and drops','Group fun'],
    mapRefs:['sam'], areas:['sam'], keywords:['jeep','4x4','adrenaline','desert','dunes']},
  'parasailing':{
    description:'Rise above the dunes under a parasail for a short flight and wide views of the desert. Age, weight and weather limits vary by operator — ask about safety gear before you book.',
    location:'Sam dunes', bestTime:'Morning or late afternoon, in calm weather',
    suitableFor:['Adventure','Couples','Groups','Photography'],
    experiencePoints:['A short flight over the dunes','Wide desert views from the air','Photos and video from above'],
    mapRefs:['sam'], areas:['sam'], keywords:['adventure','parasail','parasailing','flying','air','sports','dunes']},
  'paramotoring':{
    description:'Fly over the Thar in a motorised paraglider, usually as a tandem flight with a pilot. Ask the operator about pilot experience, safety gear and weather cancellations.',
    location:'Sam dunes', bestTime:'Morning or late afternoon, in calm weather',
    suitableFor:['Adventure','Couples','Photography'],
    experiencePoints:['Bird\'s-eye view of the dunes','Motorised paraglider flight','Aerial photos and video'],
    mapRefs:['sam'], areas:['sam'], keywords:['adventure','paramotor','paramotoring','paraglider','paragliding','flying','air','sports','dunes']},
  'rajasthani-cultural-evening':{
    description:'An evening of Rajasthani folk music and traditional dance — live songs, instruments and performances, often at desert camps and cultural venues.',
    duration:'An evening', location:'Desert camps and city venues', bestTime:'After sunset',
    suitableFor:['Families','Couples','Groups','Photography'],
    experiencePoints:['Live folk music','Traditional dance, including Kalbeliya','Traditional costume and instruments','An evening out under the stars'],
    mapRefs:[], areas:['sam','khuri','fort'], keywords:['music','folk','live music','dance','kalbeliya','culture','cultural','evening','show']},
  'stargazing':{
    description:'Watch the night sky from the desert, well away from the city lights.',
    location:'Sam / Khuri', bestTime:'Clear, moonless nights',
    suitableFor:['Couples','Families','Solo','Photography'],
    experiencePoints:['Dark desert skies','Stars and constellations','Night photography','Often paired with a desert camp'],
    mapRefs:['sam','khuri'], areas:['sam','khuri'], keywords:['stars','night sky','astronomy','night','camp']},
  'sunset-at-the-dunes':{
    description:'Watch the light change over the dunes as the sun goes down — the classic Jaisalmer evening.',
    location:'Sam / Khuri', bestTime:'An hour or so before sunset',
    suitableFor:['Couples','Families','Photography','Solo'],
    experiencePoints:['Golden light on the dunes','Photography','Easy to pair with a camel or jeep ride'],
    mapRefs:['sam','khuri'], areas:['sam','khuri'], keywords:['sunset','dunes','sam','khuri','golden hour','night']},
  'market-shopping':{
    description:'Wander the old-city bazaars and the lanes around Gandhi Chowk for souvenirs, gifts and everyday local life.',
    location:'Gandhi Chowk and old-city bazaars', bestTime:'Late afternoon, when it is cooler',
    suitableFor:['Families','Couples','Solo','Groups'],
    experiencePoints:['Lively bazaar lanes','Souvenirs and gifts','Browsing and bargaining'],
    mapRefs:[], areas:['gandhi','fort'], keywords:['shopping','bazaar','gandhi chowk','souvenirs','gifts']},
  'handicrafts-textiles':{
    description:'Look for locally made Rajasthani crafts and fabrics — embroidery, mirror-work, patchwork and leather goods — in craft shops and old-city lanes.',
    location:'Old-city lanes, Gandhi Chowk and fort-area shops', bestTime:'Late afternoon, when it is cooler',
    suitableFor:['Families','Couples','Solo','Groups'],
    experiencePoints:['Embroidery and mirror-work','Patchwork and textiles','Leather goods','Local craft shops'],
    mapRefs:[], areas:['gandhi','fort'], keywords:['handicrafts','handicraft','textiles','textile','embroidery','mirror work','patchwork','leather','crafts','shopping','fabric']},
  'rajasthani-thali':{
    description:'Sit down to a Rajasthani thali — regional dishes, breads and sweets served together in one meal.',
    location:'Restaurants across the old city', bestTime:'Lunch or dinner',
    suitableFor:['Families','Couples','Solo','Groups'],
    experiencePoints:['A full meal served on one platter','Regional Rajasthani flavours','Dal, breads and sweets'],
    mapRefs:[], areas:['fort','gandhi'], keywords:['food','dinner','lunch','restaurant','thali','eat']},
  'village-visit':{
    description:'Visit a desert village to see everyday life, local crafts and the surrounding landscape at a slower pace. Ask before photographing people.',
    location:'Khuri and nearby villages', bestTime:'Morning or late afternoon',
    suitableFor:['Families','Solo','Couples','Photography'],
    experiencePoints:['Traditional village homes','Local crafts and daily life','Quiet desert landscape'],
    mapRefs:['khuri'], areas:['khuri'], keywords:['khuri','rural','village','culture']},
  'lake-boating':{
    description:'Take a slow boat ride on Gadisar Lake, ringed with small shrines.',
    location:'Gadisar Lake', bestTime:'Early morning or around sunset',
    suitableFor:['Families','Couples','Solo','Photography'],
    experiencePoints:['Boat ride on the lake','Shrines along the shore','Soft light on the water'],
    mapRefs:['gadisar'], areas:['gadisar'], keywords:['gadisar','boat','boating','lake','nature']},
  'reel-photographer':{
    description:'Hire a local photographer to film short vertical videos of you against Jaisalmer\'s golden backdrops, ready for Instagram Reels or YouTube Shorts.',
    location:'Fort, havelis, Gadisar Lake and the dunes', bestTime:'Early morning or the hour before sunset',
    suitableFor:['Couples','Solo','Families','Groups','Photography'],
    experiencePoints:['Short vertical videos for Reels and Shorts','Help with poses, walks and transitions','Fort lanes, havelis, lake and dunes as backdrops','Edited clips, often with music'],
    mapRefs:['fort','patwon','gadisar','sam'], areas:['fort','gadisar','sam'],
    keywords:['reel','reels','reel photographer','photographer','photo','photography','instagram','video','videographer','shorts','shoot'],
    optionsTitle:'Before you book',
    options:[
      {id:'find-reel-photographer', name:'Find a reel photographer',
       summary:'Agree the price, shoot length, locations, number of edited reels and delivery time before you start.',
       note:'Many havelis are homes or ticketed, so check the rules before filming inside or filming residents.',
       cta:'Find photographers on the map', map:{cat:'services', sub:'Photographers'}}
    ]}
});
const PROVIDERS = VJData.get('PROVIDERS', []);
const EXPERIENCES = VJData.get('EXPERIENCES', []);
const ACTIVITY_FEED = {url:null};   // future: '/api/activity-listings' → {"providers":[…],"experiences":[…]}

const JMActivities = (function(){
  const MAX_VISIBLE = 6;                 // experiences rendered up-front; the rest load on demand
  const ID_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,80}$/;
  const TIMES = ['Morning','Afternoon','Sunset','Evening','Night','Flexible'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const txt = (v, max) => (v==null ? '' : String(v)).replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0, max||300);
  const infoOf = a => ACTIVITY_INFO[a.id] || {};
  const actById = id => ACTIVITIES.find(a=>a.id===id) || null;

  /* ---------------- analytics-ready (same event channel as Getting Around) ---------------- */
  function track(name, detail){          // event name + ids only — never personal data
    const d = Object.assign({event:name}, detail||{});
    try{ document.dispatchEvent(new CustomEvent('jm:analytics', {detail:d})); if(Array.isArray(window.dataLayer)) window.dataLayer.push(d); }catch(e){}
  }

  /* ---------------- phone / WhatsApp normalisation ---------------- */
  function normalizeNumber(raw){         // → digits with country code, or null
    const s = txt(raw, 40); if(!s) return null;
    const hadPlus = s.charAt(0)==='+';
    let d = s.replace(/\D/g,'');
    if(!hadPlus && d.slice(0,2)==='00') d = d.slice(2);                      // 0091…
    else if(!hadPlus && d.length===11 && d.charAt(0)==='0') d = d.slice(1);  // 09876543210
    if(d.length===10) d = '91'+d;                                            // local 10-digit → India
    return /^\d{11,15}$/.test(d) ? d : null;
  }
  const waNumber  = raw => { const d = normalizeNumber(raw); return d && (d.slice(0,2)!=='91' || /^91[6-9]\d{9}$/.test(d)) ? d : null; };
  const telNumber = raw => normalizeNumber(raw);
  const showNumber = d => (d.length===12 && d.slice(0,2)==='91') ? '+91 '+d.slice(2,7)+' '+d.slice(7) : '+'+d;

  /* ---------------- data ingest: validated, approved-only, never defaulted ---------------- */
  const providersById = {};
  const experiencesById = {};
  const byActivity = {};

  /* An operator is listed under the activities ticked on its record (admin “Shown under”), or — for records
     saved before that field existed — the one its service type names. */
  const SERVICE_ACTIVITY = {'camel safari provider':'camel-safari', 'jeep safari provider':'jeep-safari', 'photographer':'reel-photographer'};
  function ingestProvider(p){
    if(!p || !ID_RE.test(txt(p.providerId)) || !txt(p.providerName)) return false;
    if(txt(p.verificationStatus).toLowerCase() !== 'approved') return false;   // pending / rejected / missing → never public
    const st = SERVICE_ACTIVITY[txt(p.serviceType).toLowerCase()];
    providersById[p.providerId] = {
      providerId:p.providerId, name:txt(p.providerName, 80), location:txt(p.location, 80),
      wa:waNumber(p.whatsapp), tel:telNumber(p.phone), about:txt(p.description, 240),
      activities:(Array.isArray(p.activities) ? p.activities : (st ? [st] : [])).map(a=>txt(a, 80)).filter(actById)
    };
    return true;
  }
  /* Client (29 Oct 2026): an operator added under Jeep Safari must show there even before an offer is written for
     it. Each operator without its own offer under one of its activities gets a plain card: its name, about text,
     contact and “Price on enquiry” — after the real offers. Rebuilt on every ingest. */
  function linkOperators(){
    Object.keys(experiencesById).forEach(id=>{
      const e = experiencesById[id]; if(!e.general) return;
      const arr = byActivity[e.activityId]; arr.splice(arr.indexOf(e), 1); delete experiencesById[id];
    });
    Object.keys(providersById).forEach(pid=>{
      const p = providersById[pid];
      p.activities.forEach(aid=>{
        if((byActivity[aid]||[]).some(e=>e.providerId===pid)) return;
        const e = {experienceId:'op.'+pid+'.'+aid, activityId:aid, providerId:pid, general:true,
          title:p.name, description:p.about, price:null, priceUnit:'', duration:'', location:p.location,
          pickupAvailable:null, privateOption:false, availableDays:[], availableTimes:[], mapRef:''};
        experiencesById[e.experienceId] = e;
        (byActivity[aid] = byActivity[aid] || []).push(e);
      });
    });
  }
  function ingestExperience(x){
    if(!x || !ID_RE.test(txt(x.experienceId)) || !actById(x.activityId) || !providersById[x.providerId] || !txt(x.title)) return false;
    const price = Number(x.price);
    const list = v => (Array.isArray(v) ? v : []).map(s=>txt(s, 30)).filter(Boolean).slice(0, 8);
    const e = {
      experienceId:x.experienceId, activityId:x.activityId, providerId:x.providerId,
      title:txt(x.title, 90), description:txt(x.description, 240),
      price:(isFinite(price) && price>0) ? Math.round(price) : null, priceUnit:txt(x.priceUnit, 20),
      duration:txt(x.duration, 40), location:txt(x.location, 80),
      pickupAvailable:x.pickupAvailable===true ? true : (x.pickupAvailable===false ? false : null),
      privateOption:x.privateOption===true,
      availableDays:list(x.availableDays), availableTimes:list(x.availableTimes),
      mapRef:txt(x.mapRef, 40)
    };
    if(experiencesById[e.experienceId]){                                   // re-ingest replaces, never duplicates
      const old = experiencesById[e.experienceId];
      const arr = byActivity[old.activityId]; arr.splice(arr.indexOf(old), 1);
    }
    experiencesById[e.experienceId] = e;
    const arr = byActivity[e.activityId] = byActivity[e.activityId] || [];
    const g = arr.findIndex(o=>o.general);                                   // real offers stay ahead of operator-only cards
    if(g>=0) arr.splice(g, 0, e); else arr.push(e);
    return true;
  }
  function ingest(providers, experiences){
    let p = 0, x = 0;
    (providers||[]).forEach(r=>{ if(ingestProvider(r)) p++; });
    (experiences||[]).forEach(r=>{ if(ingestExperience(r)) x++; });
    linkOperators();
    return {providers:p, experiences:x};
  }
  ingest(PROVIDERS, EXPERIENCES);

  let feedLoaded = false;
  function loadFeed(){                    // no-op until ACTIVITY_FEED.url is set
    if(!ACTIVITY_FEED.url || feedLoaded || typeof fetch!=='function') return;
    feedLoaded = true;
    fetch(ACTIVITY_FEED.url, {credentials:'omit', headers:{'Accept':'application/json'}})
      .then(r=>{ if(!r.ok) throw new Error('http'); return r.json(); })
      .then(j=>{ ingest(j && j.providers, j && j.experiences); if(isOpen()) rerender(); })
      .catch(()=>{ feedLoaded = false; });
  }

  /* ---------------- formatting helpers ---------------- */
  const rupee = n => '₹'+Number(n).toLocaleString('en-IN');
  function priceText(e){
    if(!e.price) return null;
    return 'From '+rupee(e.price)+(e.priceUnit ? ' / '+e.priceUnit : '');
  }
  function fmtDate(iso){
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||''); if(!m) return '';
    const d = new Date(+m[1], +m[2]-1, +m[3]);
    if(d.getFullYear()!==+m[1] || d.getMonth()!==+m[2]-1 || d.getDate()!==+m[3]) return '';
    return (+m[3])+' '+MONTHS[+m[2]-1]+' '+m[1];
  }
  function todayIso(){ const d = new Date(); const p = n=>String(n).padStart(2,'0'); return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); }

  /* ---------------- trip / enquiry context (entered once, reused for every message) ---------------- */
  const trip = {date:'', guests:'', time:'', pickup:'', name:'', note:''};
  function setTripContext(c){             // public: Plan a Trip / Tourist Mode can feed known values in later
    c = c || {};
    if('date' in c)   trip.date   = fmtDate(c.date) ? c.date : '';
    if('guests' in c) { const g = parseInt(c.guests, 10); trip.guests = (g>=1 && g<=50) ? String(g) : ''; }
    if('time' in c)   trip.time   = TIMES.indexOf(c.time)>=0 ? c.time : '';
    if('pickup' in c) trip.pickup = (c.pickup==='yes' || c.pickup==='no') ? c.pickup : '';
    if('name' in c)   trip.name   = txt(c.name, 40);
    if('note' in c)   trip.note   = txt(c.note, 200);
    if(isOpen()) refreshLinks();
  }
  const tripHasValues = () => !!(trip.date || trip.guests || trip.time || trip.pickup || trip.name || trip.note);

  function buildWhatsAppMessage(activity, exp, ctx){
    const L = ['Hello, I want to enquire about the following experience in Jaisalmer:', ''];
    L.push('Activity: '+activity.name);
    if(exp && exp.title && !exp.general) L.push('Experience: '+exp.title);
    const date = fmtDate(ctx.date);
    if(date) L.push('Date: '+date);
    if(ctx.guests) L.push('Guests: '+ctx.guests);
    if(ctx.time) L.push('Preferred time: '+ctx.time);
    if(ctx.pickup==='yes') L.push('Pickup: Needed from my hotel in Jaisalmer');
    else if(ctx.pickup==='no') L.push('Pickup: Not needed');
    if(ctx.name) L.push('Name: '+txt(ctx.name, 40));
    if(ctx.note) L.push('Note: '+txt(ctx.note, 200));
    L.push('', 'Please share current availability and price.');
    return L.join('\n');
  }
  function whatsAppUrl(exp){
    const p = providersById[exp.providerId], a = actById(exp.activityId);
    if(!p || !p.wa || !a) return '';
    return 'https://wa.me/'+p.wa+'?text='+encodeURIComponent(buildWhatsAppMessage(a, exp, trip));
  }

  /* ---------------- rendering ---------------- */
  const esc = escHtml;
  const activityExperiences = id => byActivity[id] || [];

  function factsHtml(a, list){
    const info = infoOf(a), f = [];
    if(info.duration) f.push(['Duration', info.duration]);
    if(info.location) f.push(['Location', info.location]);
    if(info.bestTime) f.push(['Best time', info.bestTime]);

    const priced = list.filter(e=>e.price);
    let price = 'Price on enquiry';
    if(priced.length){
      const units = Array.from(new Set(priced.map(e=>e.priceUnit)));
      price = units.length===1 ? 'From '+rupee(Math.min.apply(null, priced.map(e=>e.price)))+(units[0] ? ' / '+units[0] : '') : 'Varies by experience';
    }
    f.push(['Price', price]);

    const pk = list.filter(e=>e.pickupAvailable===true).length;
    f.push(['Pickup', list.length && pk===list.length ? 'Pickup available' : (pk ? 'Available with some providers' : 'Ask provider about pickup')]);

    return '<div class="modal-meta-row ax-facts">'+f.map(x=>'<div><span>'+esc(x[0])+'</span>'+esc(x[1])+'</div>').join('')+'</div>';
  }

  function mapLinksHtml(refs){
    const ok = (refs||[]).filter(id=>window.JMMap && JMMap.has(id));
    return ok.length ? '<div class="ax-maps">'+ok.map(id=>{
      const at = ATTRACTIONS.find(x=>x.id===id);
      return at ? '<button type="button" class="ax-link" data-act="map" data-ref="'+esc(id)+'"><span aria-hidden="true">📍</span> '+esc(at.name)+' on map</button>' : '';
    }).join('')+'</div>' : '';
  }

  function tripFormHtml(){
    const opts = ['<option value="">Any time</option>'].concat(TIMES.map(t=>'<option value="'+t+'"'+(trip.time===t?' selected':'')+'>'+t+'</option>')).join('');
    return '<details class="ax-trip"'+(tripHasValues()?' open':'')+'>'+
      '<summary>Add trip details to your message <em>(optional)</em></summary>'+
      '<p class="ax-hint">Add them once — they go into every WhatsApp enquiry below. Nothing is sent until you tap WhatsApp.</p>'+
      '<div class="ax-trip-grid">'+
        '<label>Date<input type="date" data-trip="date" min="'+todayIso()+'" value="'+esc(trip.date)+'"></label>'+
        '<label>Guests<input type="number" inputmode="numeric" min="1" max="50" data-trip="guests" value="'+esc(trip.guests)+'"></label>'+
        '<label>Preferred time<select data-trip="time">'+opts+'</select></label>'+
        '<label>Pickup<select data-trip="pickup">'+
          '<option value=""'+(trip.pickup===''?' selected':'')+'>Not sure yet</option>'+
          '<option value="yes"'+(trip.pickup==='yes'?' selected':'')+'>Need pickup</option>'+
          '<option value="no"'+(trip.pickup==='no'?' selected':'')+'>No pickup</option></select></label>'+
        '<label>Your name<input type="text" maxlength="40" autocomplete="given-name" data-trip="name" value="'+esc(trip.name)+'"></label>'+
        '<label class="ax-wide">Note<textarea rows="2" maxlength="200" data-trip="note">'+esc(trip.note)+'</textarea></label>'+
      '</div></details>';
  }

  function renderProviderCard(exp){
    const p = providersById[exp.providerId];
    const meta = [exp.location || (p && p.location), exp.duration, exp.pickupAvailable===true ? 'Pickup available' : '', exp.privateOption ? 'Private option' : '']
      .filter(Boolean).map(s=>'<span>'+esc(s)+'</span>').join('');
    const sched = [exp.availableDays.length ? 'Days: '+exp.availableDays.join(', ') : '', exp.availableTimes.length ? 'Times: '+exp.availableTimes.join(', ') : ''].filter(Boolean).join('  ');
    const price = priceText(exp);
    const actions = [];
    if(p && p.wa)  actions.push('<a class="modal-act primary" data-act="wa" data-exp="'+esc(exp.experienceId)+'" href="'+esc(whatsAppUrl(exp))+'" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp '+esc(p.name)+' about '+esc(exp.title)+'">WhatsApp</a>');
    if(p && p.tel) actions.push('<a class="modal-act" data-act="call" data-exp="'+esc(exp.experienceId)+'" href="tel:+'+p.tel+'" aria-label="Call '+esc(p.name)+' about '+esc(exp.title)+'">Call</a>');
    if(exp.mapRef && window.JMMap && JMMap.has(exp.mapRef)) actions.push('<button type="button" class="ax-link" data-act="map" data-ref="'+esc(exp.mapRef)+'"><span aria-hidden="true">📍</span> View on map</button>');
    return '<li class="ax-exp" data-exp-id="'+esc(exp.experienceId)+'" tabindex="-1">'+
      '<h6 class="ax-exp-title">'+esc(exp.title)+'</h6>'+
      (meta ? '<p class="ax-exp-meta">'+meta+'</p>' : '')+
      (exp.description ? '<p class="ax-exp-desc">'+esc(exp.description)+'</p>' : '')+
      (sched ? '<p class="ax-exp-sched">'+esc(sched)+'</p>' : '')+
      '<p class="ax-exp-price'+(price?'':' is-enquiry')+'">'+esc(price || 'Price on enquiry')+'</p>'+
      (p && p.name && !exp.general ? '<p class="ax-exp-prov">Arranged by '+esc(p.name)+(window.JMReviews && JMReviews.line('operator', exp.providerId) ? ' · '+JMReviews.line('operator', exp.providerId) : '')+'</p>' : '')+
      (exp.general && window.JMReviews && JMReviews.line('operator', exp.providerId) ? '<p class="ax-exp-prov">'+JMReviews.line('operator', exp.providerId)+'</p>' : '')+
      (actions.length ? '<div class="ax-actions">'+actions.join('')+'</div>' : '<p class="ax-exp-prov">Contact details not listed yet.</p>')+
      (p && p.name && window.JMReviews ? '<div class="ax-actions ax-rate">'+JMReviews.button('operator', exp.providerId, p.name, 'ax-link', 'Rate '+p.name)+'</div>' : '')+
      (p && p.tel ? '<p class="ax-num" hidden>Call '+esc(showNumber(p.tel))+'</p>' : '')+
    '</li>';
  }

  function renderExperiences(a){
    const list = activityExperiences(a.id);
    const touristOn = !!(touristModeBtn && touristModeBtn.classList.contains('active'));
    if(!list.length){
      return '<div class="modal-section ax-section"><h5>Available experiences</h5>'+
        '<div class="ax-empty"><h6>No local experiences listed yet</h6>'+
        '<p>Explore this activity and contact a local operator for current options. Price and availability may vary.</p></div></div>';
    }
    const shown = list.slice(0, MAX_VISIBLE), rest = list.length - shown.length;
    return '<div class="modal-section ax-section"><h5>Available experiences</h5>'+
      '<p class="ax-note">'+(touristOn ? 'Tourist Mode: ask the provider about today\'s availability and pickup.' : 'Details are provided by each local operator. Contact the provider for current availability.')+'</p>'+
      (list.some(e=>{ const p = providersById[e.providerId]; return p && p.wa; }) ? tripFormHtml() : '')+
      '<ul class="ax-list" id="axList">'+shown.map(renderProviderCard).join('')+'</ul>'+
      (rest>0 ? '<button type="button" class="modal-act ax-more" data-act="more">Show '+rest+' more experience'+(rest>1?'s':'')+'</button>' : '')+
    '</div>';
  }

  /* Service options inside an activity: add an `options` list to any ACTIVITY_INFO entry */
  function renderOptions(info){
    const list = (info.options||[]).filter(o=>o && o.id && o.name);
    if(!list.length) return '';
    return '<div class="modal-section ax-section"><h5>'+esc(info.optionsTitle||'Options')+'</h5><ul class="ax-list">'+list.map(o=>
      '<li class="ax-exp ax-option" id="ax-opt-'+esc(o.id)+'">'+
        '<h6 class="ax-exp-title"><span aria-hidden="true">🎬</span> '+esc(o.name)+'</h6>'+
        (o.summary ? '<p class="ax-exp-desc">'+esc(o.summary)+'</p>' : '')+
        ((o.points||[]).length ? '<ul class="ax-points ax-opt-points">'+o.points.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul>' : '')+
        (o.note ? '<p class="ax-exp-sched">'+esc(o.note)+'</p>' : '')+
        (o.map && window.JMMap ? '<div class="ax-actions"><button type="button" class="modal-act primary" data-act="option-map" data-opt="'+esc(o.id)+'" data-cat="'+esc(o.map.cat)+'" data-sub="'+esc(o.map.sub||'')+'">'+esc(o.cta||'Find on the map')+'</button></div>' : '')+
      '</li>').join('')+'</ul></div>';
  }

  function renderActivityDetails(a){
    const info = infoOf(a), list = activityExperiences(a.id);
    const touristOn = !!(touristModeBtn && touristModeBtn.classList.contains('active'));
    let areaNote = '';
    if(touristOn && (info.areas||[]).indexOf(currentArea)>=0){
      const btn = areaSelect.querySelector('[data-area="'+currentArea+'"]');
      if(btn) areaNote = '<p class="ax-note ax-area">This happens near your Tourist Mode area: '+esc(btn.textContent)+'.</p>';
    }
    return '<div class="ax-bar"><button type="button" class="modal-close ax-close" id="modalCloseBtn" data-act="close" aria-label="Close">&times;</button></div>'+
      '<div class="modal-hero ax-hero">'+duneSvg(a.id+'x')+'</div>'+
      '<div class="modal-content">'+
        '<div class="card-tag">'+esc(a.cat)+'</div>'+
        '<h2 id="modalTitle">'+esc(a.name)+'</h2>'+
        (info.description ? '<p class="modal-lede">'+esc(info.description)+'</p>' : '')+
        areaNote+
        factsHtml(a, list)+
        mapLinksHtml(info.mapRefs)+
        ((info.experiencePoints||[]).length ? '<div class="modal-section"><h5>What you\'ll experience</h5><ul class="ax-points">'+info.experiencePoints.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul></div>' : '')+
        ((info.suitableFor||[]).length ? '<div class="modal-section"><h5>Best for</h5>'+info.suitableFor.map(s=>'<span class="nearby-chip">'+esc(s)+'</span>').join('')+'</div>' : '')+
        renderOptions(info)+
        renderExperiences(a)+
      '</div>';
  }

  /* ---------------- open / close / re-render ---------------- */
  let currentId = null, tracked = false;
  const isOpen = () => modalOverlay.classList.contains('open') && modalSheet.classList.contains('is-activity');

  function openActivityModal(activityId){
    const a = actById(activityId); if(!a) return;
    currentId = a.id; tracked = false;
    modalSheet.classList.add('is-activity');
    modalSheet.innerHTML = renderActivityDetails(a);
    showModalShell();
    track('activity_open', {activityId:a.id});
    activityExperiences(a.id).slice(0, MAX_VISIBLE).forEach(e=>{
      track('experience_view', {activityId:a.id, experienceId:e.experienceId});
      track('provider_view', {activityId:a.id, experienceId:e.experienceId, providerId:e.providerId});
    });
    loadFeed();
  }
  function rerender(){ const a = actById(currentId); if(a && isOpen()){ const top = modalSheet.scrollTop; modalSheet.innerHTML = renderActivityDetails(a); modalSheet.scrollTop = top; } }
  function refreshLinks(){
    modalSheet.querySelectorAll('a[data-act="wa"]').forEach(l=>{
      const e = experiencesById[l.getAttribute('data-exp')]; if(e){ const u = whatsAppUrl(e); if(u) l.href = u; }
    });
  }

  /* ---------------- events: attached ONCE, delegated ---------------- */
  modalSheet.addEventListener('click', e=>{
    const t = e.target.closest('[data-act]'); if(!t || !modalSheet.contains(t) || !modalSheet.classList.contains('is-activity')) return;
    const act = t.getAttribute('data-act'), exp = experiencesById[t.getAttribute('data-exp')];
    if(act==='close'){ closeModal(); }
    else if(act==='wa' && exp){
      const u = whatsAppUrl(exp); if(u) t.href = u;                      // always the latest trip details
      track('whatsapp_click', {activityId:exp.activityId, experienceId:exp.experienceId, providerId:exp.providerId});
      track('enquiry_submit', {activityId:exp.activityId, experienceId:exp.experienceId, channel:'whatsapp'});
    }
    else if(act==='call' && exp){
      track('call_click', {activityId:exp.activityId, experienceId:exp.experienceId, providerId:exp.providerId});
      if(window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches){   // desktop: tel: may do nothing — show the number too
        const n = t.closest('.ax-exp').querySelector('.ax-num'); if(n) n.hidden = false;
      }
    }
    else if(act==='option-map'){
      track('option_click', {activityId:currentId, optionId:t.getAttribute('data-opt')});
      const o = {cat:t.getAttribute('data-cat')}; if(t.getAttribute('data-sub')) o.sub = t.getAttribute('data-sub');
      closeModal(); if(window.JMMap) JMMap.open(o);
    }
    else if(act==='map'){
      e.preventDefault(); const ref = t.getAttribute('data-ref');
      track('map_click', {activityId:currentId, ref:ref});
      closeModal(); if(window.JMMap) JMMap.show(ref);
    }
    else if(act==='more'){
      const a = actById(currentId), list = activityExperiences(currentId), box = document.getElementById('axList');
      if(!a || !box) return;
      const from = box.children.length, rest = list.slice(from);
      box.insertAdjacentHTML('beforeend', rest.map(renderProviderCard).join(''));
      rest.forEach(x=>{ track('experience_view', {activityId:a.id, experienceId:x.experienceId}); track('provider_view', {activityId:a.id, experienceId:x.experienceId, providerId:x.providerId}); });
      t.remove();
      const first = box.children[from]; if(first) first.focus({preventScroll:false});
    }
  });
  modalSheet.addEventListener('input', e=>{
    const f = e.target.closest('[data-trip]'); if(!f || !modalSheet.classList.contains('is-activity')) return;
    const k = f.getAttribute('data-trip'), o = {}; o[k] = f.value; setTripContext(o);
    if(!tracked){ tracked = true; track('enquiry_start', {activityId:currentId}); }
  });
  modalOverlay.addEventListener('keydown', e=>{         // keep Tab inside the dialog
    if(e.key!=='Tab' || !modalOverlay.classList.contains('open')) return;
    const f = Array.from(modalSheet.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')).filter(n=>n.offsetParent!==null);
    if(!f.length) return;
    const first = f[0], last = f[f.length-1];
    if(e.shiftKey && (document.activeElement===first || document.activeElement===modalSheet)){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  });

  /* Things to do grid: one delegated listener, tiles are real buttons */
  activitiesGrid.addEventListener('click', e=>{ const b = e.target.closest('[data-activity]'); if(b) openActivityModal(b.getAttribute('data-activity')); });
  const announce = document.getElementById('announcementBar');
  if(announce) announce.addEventListener('click', e=>{ const l = e.target.closest('[data-activity]'); if(l){ e.preventDefault(); openActivityModal(l.getAttribute('data-activity')); } });

  /* search: name, category and a few plain-language keywords */
  function find(q){
    q = String(q||'').trim().toLowerCase(); if(!q) return [];
    return ACTIVITIES.filter(a=>[a.name, a.cat].concat(infoOf(a).keywords||[]).join(' ').toLowerCase().indexOf(q)>=0);
  }

  return {
    open:openActivityModal, find:find, setTripContext:setTripContext,
    // Approved experiences for one activity, joined to their operator's validated contact numbers.
    // Never adds a "verified" flag — approval is not verification (see note above).
    experiences:function(activityId){
      return activityExperiences(activityId).map(e=>{
        const p = providersById[e.providerId] || {};
        return Object.assign({}, e, {providerName:p.name||'', providerLocation:p.location||'',
          phone:p.tel||null, whatsapp:p.wa||null, waUrl:whatsAppUrl(e)||null, priceText:priceText(e)});
      });
    },
    buildWhatsAppMessage:buildWhatsAppMessage, normalizeNumber:normalizeNumber,
    addListings:function(o){ o = o || {}; const r = ingest(o.providers, o.experiences); if(isOpen()) rerender(); return r; }
  };
})();
function openActivityModal(id){ JMActivities.open(id); }

// Guide pages link back to the corresponding planner tab or activity in the live directory.
function followGuideLink(){
  const [section, query] = location.hash.slice(1).split('?');
  if(!query) return;
  const params = new URLSearchParams(query);
  if(section === 'plan'){
    const button = Array.from(tripTabs.children).find(tab => tab.dataset.tripId === params.get('trip'));
    if(button){ button.click(); document.getElementById('plan').scrollIntoView(); }
  } else if(section === 'things-to-do'){
    const id = params.get('activity');
    if(ACTIVITIES.some(activity => activity.id === id)){
      document.getElementById('things-to-do').scrollIntoView();
      openActivityModal(id);
    }
  }
}
window.addEventListener('hashchange', followGuideLink);
// Run after declarations used by the activity sheet have been initialized.
queueMicrotask(followGuideLink);

/* ============================================================
   SMART SEARCH
   ============================================================ */
const searchPanel = document.getElementById('searchPanel');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

let searchLastFocus = null;
function openSearch(prefill){
  if(!searchPanel.classList.contains('open')) searchLastFocus = document.activeElement;
  searchPanel.classList.add('open');
  document.body.style.overflow = 'hidden';
  const b = document.getElementById('openSearchBtn'); if(b) b.setAttribute('aria-expanded','true');
  searchInput.value = prefill || '';
  searchInput.focus();
  runSearch(searchInput.value);
}
function closeSearch(){
  if(!searchPanel.classList.contains('open')) return;     // Escape calls this on every press — stay idempotent
  searchPanel.classList.remove('open');
  const b = document.getElementById('openSearchBtn'); if(b) b.setAttribute('aria-expanded','false');
  const other = ['modalOverlay','addServiceOverlay'].some(id=>{ const n = document.getElementById(id); return n && n.classList.contains('open'); });
  if(!other) document.body.style.overflow = '';
  const f = searchLastFocus; searchLastFocus = null;
  if(f && f.isConnected && typeof f.focus==='function'){ try{ f.focus({preventScroll:true}); }catch(e){} }
}

document.getElementById('closeSearchBtn').addEventListener('click', closeSearch);

/* ============================================================
   ADD YOUR SERVICE — MOBILE OTP VERIFICATION FLOW
   ------------------------------------------------------------
   This project has no existing backend/SMS provider wired up, so
   this block implements a self-contained mock OTP "API" (see
   asMockSendOtp / asMockVerifyOtp) with the exact request/response
   shape a real server-side endpoint would have. Swap those two
   functions for real fetch() calls to your OTP backend (Firebase
   Phone Auth, MSG91, Twilio Verify, etc.) and the rest of this flow
   — validation, state machine, error handling, resend cooldown,
   rate limiting — needs no changes.

   Never generate or check OTPs in real client JS, and never ship an
   SMS provider secret key in frontend code — that logic belongs on
   a server. The "demo OTP" shown in this file only exists because
   there is no live backend to deliver a real SMS yet.
   ============================================================ */
(function(){
  const AS_OTP_TTL_MS = 5 * 60 * 1000;   // OTP expires after 5 minutes
  const AS_RESEND_COOLDOWN_S = 30;        // resend cooldown
  const AS_MAX_ATTEMPTS = 5;              // brute-force protection
  /* OTP_ENABLED=false: no SMS step — the number is checked by the team when they review the listing.
     Keep the OTP code below for when a real SMS provider (Firebase Phone Auth / MSG91 + DLT) is added:
     asMockSendOtp / asMockVerifyOtp must then become real server calls before this is switched on. */
  const OTP_ENABLED = false;
  /* Submissions are saved to Firestore serviceSubmissions/{id} as status 'pending' (see firestore.rules)
     and reviewed in the admin under Submissions. */
  const AS_MIN_GAP_MS = 60 * 1000;        // one submission per minute from this browser

  // In-memory mock "server" store: { [mobile]: { code, expiresAt, attempts, used } }
  const asOtpStore = {};

  function asMockSendOtp(mobile){
    return new Promise(resolve=>{
      setTimeout(()=>{
        const code = String(Math.floor(100000 + Math.random() * 900000));
        asOtpStore[mobile] = { code, expiresAt: Date.now() + AS_OTP_TTL_MS, attempts: 0, used: false };
        resolve({ ok: true, demoCode: code }); // demoCode exists only for this offline demo
      }, 350);
    });
  }

  function asMockVerifyOtp(mobile, code){
    return new Promise(resolve=>{
      setTimeout(()=>{
        const entry = asOtpStore[mobile];
        if(!entry) return resolve({ ok:false, reason:'expired' });
        if(entry.used) return resolve({ ok:false, reason:'already_verified' });
        if(Date.now() > entry.expiresAt) return resolve({ ok:false, reason:'expired' });
        if(entry.attempts >= AS_MAX_ATTEMPTS) return resolve({ ok:false, reason:'too_many' });
        entry.attempts++;
        if(code !== entry.code) return resolve({ ok:false, reason:'invalid' });
        entry.used = true; // single-use: invalidate immediately on success
        resolve({ ok:true });
      }, 350);
    });
  }

  const overlay = document.getElementById('addServiceOverlay');
  const stepDetails = document.getElementById('asStepDetails');
  const stepOtp = document.getElementById('asStepOtp');
  const stepFinal = document.getElementById('asStepFinal');
  const stepSuccess = document.getElementById('asStepSuccess');
  const allSteps = [stepDetails, stepOtp, stepFinal, stepSuccess];

  const nameInput = document.getElementById('asName');
  const nameError = document.getElementById('asNameError');
  const serviceTypeSelect = document.getElementById('asServiceType');
  const serviceTypeError = document.getElementById('asServiceTypeError');
  const mobileInput = document.getElementById('asMobile');
  const mobileError = document.getElementById('asMobileError');
  const verifiedPill = document.getElementById('asVerifiedPill');
  const sendOtpBtn = document.getElementById('asSendOtpBtn');

  const otpMobileDisplay = document.getElementById('asOtpMobileDisplay');
  const otpBoxes = Array.from(document.querySelectorAll('.as-otp-box'));
  const otpStatus = document.getElementById('asOtpStatus');
  const verifyOtpBtn = document.getElementById('asVerifyOtpBtn');
  const changeNumberBtn = document.getElementById('asChangeNumberBtn');
  const resendBtn = document.getElementById('asResendOtpBtn');
  const demoNote = document.getElementById('asDemoNote');

  const descriptionInput = document.getElementById('asDescription');
  const descriptionError = document.getElementById('asDescriptionError');
  const doneBtn = document.getElementById('asDoneBtn');

  let verifiedMobile = null;  // only ever set after a genuine successful verify response
  let asLastFocus = null, asSubmitting = false;
  const submitBtn = document.getElementById('asSubmitBtn');
  const submitError = document.getElementById('asSubmitError');
  const notLive = document.getElementById('asNotLive');
  if(notLive) notLive.hidden = true;
  if(!OTP_ENABLED){
    // Same steps without the SMS code: details → description → submitted.
    const lede = stepDetails.querySelector('.as-modal-lede');
    if(lede) lede.textContent = 'List your local service on Jaisalmer Visit. We\u2019ll review your listing before it goes live.';
    const hint = document.getElementById('asMobileHint');
    if(hint) hint.textContent = 'We\u2019ll call or WhatsApp this number if we need to check anything.';
    sendOtpBtn.textContent = 'Continue';
    stepFinal.querySelectorAll('.as-verified-pill').forEach(p => { p.hidden = true; });
  }
  // Honeypot: invisible to people, often filled in by bots. A filled-in form is dropped quietly.
  const honeypot = document.createElement('div');
  honeypot.setAttribute('aria-hidden', 'true');
  honeypot.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden';
  honeypot.innerHTML = '<label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label>';
  stepFinal.appendChild(honeypot);
  const honeypotInput = honeypot.querySelector('input');
  function setResult(sent){
    const icon = document.getElementById('asSuccessIcon'), title = document.getElementById('asSuccessTitle'), text = document.getElementById('asSuccessText');
    if(icon) icon.textContent = sent ? '✓' : 'i';
    if(title) title.textContent = sent ? 'Service submitted' : "Online listings aren't open yet";
    if(text) text.textContent = sent
      ? "Your service details have been received. We'll review them before publishing."
      : 'Your details were checked on this device but have not been sent anywhere. Please come back once online listing requests open.';
  }
  let pendingMobile = null;
  let resendTimer = null;

  // ---- Custom "Service type" dropdown (visual layer over the native <select>) ----
  (function initServiceTypeDropdown(){
    const wrap = document.getElementById('asServiceTypeWrap');
    const trigger = document.getElementById('asServiceTypeTrigger');
    const valueEl = document.getElementById('asServiceTypeValue');
    const listbox = document.getElementById('asServiceTypeListbox');
    if(!wrap || !trigger || !listbox || !serviceTypeSelect) return;

    let activeIndex = -1;

    // Build listbox options straight from the native <select> — single source of truth,
    // so the options list never has to be maintained in two places.
    Array.from(serviceTypeSelect.options).forEach((opt, i) => {
      if(!opt.value) return; // skip the disabled "Select a service" placeholder
      const li = document.createElement('li');
      li.className = 'as-select-option';
      li.id = 'asServiceTypeOpt-' + i;
      li.setAttribute('role', 'option');
      li.dataset.index = i;
      li.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
      li.textContent = opt.textContent;
      listbox.appendChild(li);
    });
    const optionEls = Array.from(listbox.querySelectorAll('.as-select-option'));

    function syncTriggerText(){
      const opt = serviceTypeSelect.options[serviceTypeSelect.selectedIndex];
      const hasValue = !!(opt && opt.value);
      valueEl.textContent = hasValue ? opt.textContent : 'Select a service';
      valueEl.classList.toggle('is-placeholder', !hasValue);
    }

    function setActive(index){
      optionEls.forEach(li => li.classList.remove('is-active'));
      activeIndex = index;
      if(index >= 0){
        const li = optionEls[index];
        li.classList.add('is-active');
        li.scrollIntoView({ block: 'nearest' });
        listbox.setAttribute('aria-activedescendant', li.id);
      }
    }

    function openListbox(){
      listbox.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      const selected = optionEls.findIndex(li => Number(li.dataset.index) === serviceTypeSelect.selectedIndex);
      setActive(selected >= 0 ? selected : 0);
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onListKeydown);
    }

    function closeListbox(returnFocus){
      listbox.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      listbox.removeAttribute('aria-activedescendant');
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onListKeydown);
      if(returnFocus) trigger.focus();
    }

    function selectByOptionIndex(index){
      const li = optionEls[index];
      if(!li) return;
      serviceTypeSelect.selectedIndex = Number(li.dataset.index);
      optionEls.forEach(o => o.setAttribute('aria-selected', o === li ? 'true' : 'false'));
      syncTriggerText();
      serviceTypeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function onDocClick(e){
      if(!wrap.contains(e.target)) closeListbox(false);
    }

    function onListKeydown(e){
      switch(e.key){
        case 'ArrowDown': e.preventDefault(); setActive(Math.min(activeIndex + 1, optionEls.length - 1)); break;
        case 'ArrowUp':   e.preventDefault(); setActive(Math.max(activeIndex - 1, 0)); break;
        case 'Home':      e.preventDefault(); setActive(0); break;
        case 'End':       e.preventDefault(); setActive(optionEls.length - 1); break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if(activeIndex >= 0){ selectByOptionIndex(activeIndex); closeListbox(true); }
          break;
        case 'Escape': e.preventDefault(); e.stopPropagation(); closeListbox(true); break;
        case 'Tab': closeListbox(false); break;
      }
    }

    trigger.addEventListener('click', () => { listbox.hidden ? openListbox() : closeListbox(true); });

    trigger.addEventListener('keydown', (e) => {
      if(listbox.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')){
        e.preventDefault();
        openListbox();
      }
    });

    optionEls.forEach((li, i) => {
      li.addEventListener('click', () => { selectByOptionIndex(i); closeListbox(true); });
      li.addEventListener('mouseenter', () => setActive(i));
    });

    // Mirror the native select's `is-invalid` class (toggled by existing validation code below)
    // onto the visible trigger, without needing to touch that validation logic at all.
    new MutationObserver(() => {
      trigger.classList.toggle('is-invalid', serviceTypeSelect.classList.contains('is-invalid'));
    }).observe(serviceTypeSelect, { attributes: true, attributeFilter: ['class'] });

    syncTriggerText();

    // Keep the visible trigger in step with the native <select> when it is set from code
    // (or cleared by form.reset() on re-open).
    const syncAll = () => {
      syncTriggerText();
      optionEls.forEach(li => li.setAttribute('aria-selected', Number(li.dataset.index) === serviceTypeSelect.selectedIndex ? 'true' : 'false'));
    };
    serviceTypeSelect.addEventListener('change', syncAll);
    stepDetails.addEventListener('reset', () => setTimeout(syncAll, 0));
  })();

  function showStep(step){
    allSteps.forEach(s => s.classList.toggle('is-active', s === step));
  }

  function clearFieldErrors(){
    [nameError, serviceTypeError, mobileError, descriptionError].forEach(e => e.classList.remove('is-visible'));
    [nameInput, serviceTypeSelect, mobileInput, descriptionInput].forEach(e => e.classList.remove('is-invalid'));
  }

  function setOtpStatus(text, state){
    otpStatus.textContent = text || '';
    otpStatus.dataset.state = state || 'info';
  }

  function stopResendCountdown(){
    if(resendTimer){ clearInterval(resendTimer); resendTimer = null; }
  }

  function startResendCountdown(){
    let remaining = AS_RESEND_COOLDOWN_S;
    resendBtn.disabled = true;
    resendBtn.innerHTML = `Resend OTP in <span>${remaining}</span>s`;
    stopResendCountdown();
    resendTimer = setInterval(()=>{
      remaining--;
      if(remaining <= 0){
        stopResendCountdown();
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend OTP';
      } else {
        resendBtn.innerHTML = `Resend OTP in <span>${remaining}</span>s`;
      }
    }, 1000);
  }

  function resetAddServiceForm(){
    stepDetails.reset();
    stepFinal.reset();
    verifiedMobile = null;
    pendingMobile = null;
    verifiedPill.hidden = true;
    clearFieldErrors();
    otpBoxes.forEach(b => b.value = '');
    setOtpStatus('', 'info');
    demoNote.textContent = '';
    stopResendCountdown();
    showStep(stepDetails);
  }

  function openAddService(){
    if(!overlay.classList.contains('open')) asLastFocus = document.activeElement;
    resetAddServiceForm();
    if(submitError){ submitError.textContent = ''; submitError.classList.remove('is-visible'); }
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(()=> nameInput.focus(), 60);
  }
  function closeAddService(){
    if(!overlay.classList.contains('open')) return;
    overlay.classList.remove('open');
    if(!modalOverlay.classList.contains('open')) document.body.style.overflow = '';
    stopResendCountdown();
    const f = asLastFocus; asLastFocus = null;
    if(f && f.isConnected && typeof f.focus==='function'){ try{ f.focus({preventScroll:true}); }catch(e){} }
  }

  document.getElementById('footerAddServiceBtn').addEventListener('click', openAddService);

  /* ---- Footer newsletter signup (email only) ----
     Saved to Firestore newsletter/{lowercased email}, so each address is stored once
     (firestore.rules allow create only — a repeat signup is refused, and shown as subscribed).
     Sending emails is not part of this site; the admin exports the list as CSV. */
  (function(){
    const form = document.getElementById('nlForm');
    if(!form) return;
    const input = document.getElementById('nlEmail');
    const btn   = document.getElementById('nlBtn');
    const msg   = document.getElementById('nlMsg');
    const body  = document.getElementById('nlBody');
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    let busy = false;

    function say(text, kind){
      msg.textContent = text || '';
      msg.classList.toggle('is-error', kind === 'error');
      msg.classList.toggle('is-success', kind === 'success');
    }
    function flag(on){ input.setAttribute('aria-invalid', on ? 'true' : 'false'); }
    function fail(text, refocus){ flag(true); say(text, 'error'); if(refocus) input.focus(); }

    input.addEventListener('input', () => { if(input.getAttribute('aria-invalid') === 'true'){ flag(false); say(''); } });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if(busy) return;
      const email = input.value.trim();
      if(!email) return fail('Please enter your email address.', true);
      if(!EMAIL_RE.test(email) || input.validity.typeMismatch || email.length > 254) return fail('Please enter a valid email address.', true);
      flag(false); say('');

      busy = true;
      const w = btn.offsetWidth;                    // keep the button the same size while loading
      btn.style.minWidth = w + 'px';
      btn.disabled = true; btn.textContent = 'Subscribing\u2026'; form.setAttribute('aria-busy', 'true');
      try{
        const id = email.toLowerCase();
        const res = await VJData.create('newsletter', id, { email: id, source: 'footer' });
        // 403/409 here means this address is already on the list — same happy result for the visitor.
        if(!res.ok && res.status !== 403 && res.status !== 409) throw new Error('HTTP ' + res.status);
        body.style.minHeight = body.offsetHeight + 'px'; // avoid layout jump; the thank-you line sits centred in that space
        body.classList.add('is-done');
        form.hidden = true;
        input.value = '';
        say("You're subscribed! Jaisalmer travel tips are on their way.", 'success');
      }catch(err){
        fail('Something went wrong. Please try again.', false);
      }finally{
        busy = false;
        btn.disabled = false; btn.textContent = 'Subscribe'; btn.style.minWidth = '';
        form.removeAttribute('aria-busy');
      }
    });
  })();

  /* ---- Newsletter: gentle 3-layer scroll drift (sky slowest, fort photo medium, glass card opposite) ---- */
  (function(){
    var sec = document.querySelector('.newsletter-sec');
    var sky = document.querySelector('.nl-bg-sky'), art = document.querySelector('.nl-bg-art'), card = document.querySelector('.newsletter-panel');
    if(!sec || !sky || !art || !card) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var cur = null, ticking = false;
    function target(){
      var r = sec.getBoundingClientRect(), vh = window.innerHeight || 800;
      var p = (r.top + r.height/2 - vh/2) / (vh/2 + r.height/2);   // +1 entering from below … -1 leaving at the top
      return Math.max(-1, Math.min(1, p));
    }
    function paint(p){
      var k = window.innerWidth <= 680 ? 0.5 : 1;                   // even gentler on phones
      sky.style.transform  = 'translate3d(0,' + (-p*120*k).toFixed(1) + 'px,0)';
      art.style.transform  = 'translate3d(0,' + (-p*180*k).toFixed(1) + 'px,0) scale(1.04)';  // ±180px travel, inside the 180px overscan
      card.style.transform = 'translate3d(0,' + (p*75*k).toFixed(1) + 'px,0)';                       // card drifts the other way → reads as separate from the photo
    }
    function frame(){
      ticking = false;
      if(reduce.matches) return;
      var r = sec.getBoundingClientRect();
      if(r.bottom < -150 || r.top > (window.innerHeight||800) + 150) return;
      var t = target();
      cur = (cur === null) ? t : cur + (t - cur) * 0.16;
      paint(cur);
      if(Math.abs(t - cur) > 0.002){ ticking = true; requestAnimationFrame(frame); }
    }
    function req(){ if(!ticking){ ticking = true; requestAnimationFrame(frame); } }
    window.addEventListener('scroll', req, {passive:true});
    window.addEventListener('resize', req);
    req();
  })();
  document.getElementById('asCloseBtn').addEventListener('click', closeAddService);
  overlay.addEventListener('click', e => { if(e.target === overlay) closeAddService(); });
  overlay.addEventListener('keydown', e => {             // keep Tab inside the dialog
    if(e.key !== 'Tab' || !overlay.classList.contains('open')) return;
    const f = Array.from(overlay.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'))
      .filter(n => n.offsetParent !== null && n.getAttribute('aria-hidden') !== 'true');
    if(!f.length) return;
    const first = f[0], last = f[f.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });
  document.addEventListener('keydown', e => {
    if(e.key !== 'Escape' || !overlay.classList.contains('open')) return;
    const lb = document.getElementById('asServiceTypeListbox');
    if(lb && !lb.hidden) return;                       // the open dropdown takes this Escape first
    closeAddService();
  });

  // digits-only mobile input, no spaces or other characters
  mobileInput.addEventListener('input', ()=>{
    mobileInput.value = mobileInput.value.replace(/\D/g, '').slice(0, 10);
    mobileInput.classList.remove('is-invalid');
    mobileError.classList.remove('is-visible');
  });

  // ---- STEP 1: validate details, request OTP ----
  stepDetails.addEventListener('submit', async e => {
    e.preventDefault();
    clearFieldErrors();
    let valid = true;

    if(!nameInput.value.trim()){
      nameInput.classList.add('is-invalid'); nameError.classList.add('is-visible'); valid = false;
    }
    if(!serviceTypeSelect.value){
      serviceTypeSelect.classList.add('is-invalid'); serviceTypeError.classList.add('is-visible'); valid = false;
    }
    const mobile = mobileInput.value.replace(/\D/g, '');
    if(!/^[6-9]\d{9}$/.test(mobile)){
      mobileInput.classList.add('is-invalid'); mobileError.classList.add('is-visible'); valid = false;
    }
    if(!valid) return;

    if(!OTP_ENABLED){
      verifiedMobile = mobile;    // not verified by SMS — the team checks it during review
      showStep(stepFinal);
      setTimeout(()=> descriptionInput.focus(), 60);
      return;
    }
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = 'Sending…';
    try{
      const res = await asMockSendOtp(mobile);
      pendingMobile = mobile;
      otpMobileDisplay.textContent = 'X'.repeat(7) + mobile.slice(-3);
      otpBoxes.forEach(b => b.value = '');
      setOtpStatus('', 'info');
      demoNote.textContent = `Demo mode — no live SMS backend is connected yet, so here's your test code: ${res.demoCode}`;
      showStep(stepOtp);
      startResendCountdown();
      setTimeout(()=> otpBoxes[0].focus(), 60);
    }catch(err){
      setOtpStatus("Couldn't send OTP. Please try again.", 'error');
    }finally{
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = 'Send OTP';
    }
  });

  // ---- OTP boxes: auto-advance, backspace nav, paste support ----
  otpBoxes.forEach((box, idx) => {
    box.addEventListener('input', ()=>{
      box.value = box.value.replace(/\D/g, '').slice(0, 1);
      if(box.value && idx < otpBoxes.length - 1) otpBoxes[idx + 1].focus();
    });
    box.addEventListener('keydown', e => {
      if(e.key === 'Backspace' && !box.value && idx > 0) otpBoxes[idx - 1].focus();
    });
    box.addEventListener('paste', e => {
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      if(!text) return;
      e.preventDefault();
      text.slice(0, 6).split('').forEach((ch, i) => { if(otpBoxes[i]) otpBoxes[i].value = ch; });
      const nextEmpty = otpBoxes.findIndex(b => !b.value);
      otpBoxes[nextEmpty === -1 ? otpBoxes.length - 1 : nextEmpty].focus();
    });
  });

  // ---- Verify OTP ----
  verifyOtpBtn.addEventListener('click', async ()=>{
    const code = otpBoxes.map(b => b.value).join('');
    if(code.length !== 6){
      setOtpStatus('Enter all 6 digits.', 'error');
      return;
    }
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = 'Verifying…';
    try{
      const res = await asMockVerifyOtp(pendingMobile, code);
      if(res.ok){
        verifiedMobile = pendingMobile;
        setOtpStatus('Mobile Number Verified ✓', 'success');
        verifiedPill.hidden = false;
        stopResendCountdown();
        setTimeout(()=>{ showStep(stepFinal); descriptionInput.focus(); }, 500);
      } else {
        otpBoxes.forEach(b => b.value = '');
        otpBoxes[0].focus();
        const messages = {
          expired: 'This OTP has expired. Please request a new OTP.',
          too_many: 'Too many attempts. Please request a new OTP.',
          already_verified: 'Mobile number already verified.',
          invalid: 'Incorrect OTP. Please try again.'
        };
        setOtpStatus(messages[res.reason] || 'Incorrect OTP. Please try again.', 'error');
      }
    }catch(err){
      setOtpStatus('Connection problem. Please check your internet and try again.', 'error');
    }finally{
      verifyOtpBtn.disabled = false;
      verifyOtpBtn.textContent = 'Verify OTP';
    }
  });

  // ---- Resend OTP ----
  resendBtn.addEventListener('click', async ()=>{
    if(resendBtn.disabled || !pendingMobile) return;
    resendBtn.disabled = true;
    try{
      const res = await asMockSendOtp(pendingMobile);
      otpBoxes.forEach(b => b.value = '');
      otpBoxes[0].focus();
      setOtpStatus('A new OTP has been sent.', 'info');
      demoNote.textContent = `Demo mode — no live SMS backend is connected yet, so here's your test code: ${res.demoCode}`;
      startResendCountdown();
    }catch(err){
      setOtpStatus('Unable to send OTP. Please try again.', 'error');
      resendBtn.disabled = false;
    }
  });

  // ---- Change mobile number: invalidate old OTP, reset verification state ----
  changeNumberBtn.addEventListener('click', ()=>{
    if(pendingMobile) delete asOtpStore[pendingMobile];
    pendingMobile = null;
    verifiedMobile = null;
    verifiedPill.hidden = true;
    otpBoxes.forEach(b => b.value = '');
    setOtpStatus('', 'info');
    demoNote.textContent = '';
    stopResendCountdown();
    showStep(stepDetails);
    mobileInput.focus();
    mobileInput.select();
  });

  // ---- STEP 3: final submission — never trust client-side verified state alone ----
  stepFinal.addEventListener('submit', async e => {
    e.preventDefault();
    if(asSubmitting) return;                              // no double submits
    clearFieldErrors();
    if(submitError){ submitError.textContent = ''; submitError.classList.remove('is-visible'); }

    if(!verifiedMobile){
      // Safety net: the UI shouldn't allow reaching this step unverified,
      // but a real backend must independently re-check mobile_verified
      // server-side before persisting the record regardless.
      showStep(stepOtp);
      return;
    }
    if(!descriptionInput.value.trim()){
      descriptionInput.classList.add('is-invalid');
      descriptionError.classList.add('is-visible');
      return;
    }

    const payload = {
      name: nameInput.value.trim().slice(0, 80),
      serviceType: serviceTypeSelect.value,
      mobile: verifiedMobile,
      description: descriptionInput.value.trim().slice(0, 1000),
      status: 'pending',
      source: 'website'
    };
    if(honeypotInput.value){ setResult(true); showStep(stepSuccess); return; }   // bot: pretend it worked
    let last = 0; try{ last = Number(localStorage.getItem('vj_as_last')) || 0; }catch(e){}
    if(Date.now() - last < AS_MIN_GAP_MS){
      if(submitError){ submitError.textContent = 'You\u2019ve just sent a listing. Please wait a minute before sending another.'; submitError.classList.add('is-visible'); }
      return;
    }
    asSubmitting = true; submitBtn.disabled = true; submitBtn.textContent = 'Submitting\u2026';
    try{
      const res = await VJData.create('serviceSubmissions', null, payload);
      if(!res.ok) throw new Error('HTTP ' + res.status);
      try{ localStorage.setItem('vj_as_last', String(Date.now())); }catch(e){}
      setResult(true); showStep(stepSuccess);
    }catch(err){
      if(submitError){ submitError.textContent = 'Your details could not be sent. Check your connection and try again.'; submitError.classList.add('is-visible'); }
    }finally{
      asSubmitting = false; submitBtn.disabled = false; submitBtn.textContent = 'Submit Service';
    }
  });

  doneBtn.addEventListener('click', closeAddService);
})();
searchPanel.addEventListener('click', e=>{ if(e.target===searchPanel) closeSearch(); });
searchInput.addEventListener('input', ()=>runSearch(searchInput.value));

function runSearch(qRaw){
  const q = qRaw.trim().toLowerCase();
  if(!q){ searchResults.innerHTML = '<div class="search-empty">Start typing to search attractions, activities and transport.</div>'; return; }

  const places = ATTRACTIONS.filter(a => a.name.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q));
  const experiences = JMActivities.find(q);
  const services = TRANSPORT_MODES.filter(m => [m.label, m.short, m.area].concat(m.aliases, m.synonyms).join(' ').toLowerCase().includes(q));
  const providerHits = (window.JMTransport && JMTransport.find) ? JMTransport.find(q) : [];

  let html = '';
  if(experiences.length) html += group('Experiences', experiences.map(e=>`<div class="search-result-item" role="button" tabindex="0" data-activity="${escHtml(e.id)}"><span>${escHtml(e.name)}</span><span class="meta">${escHtml(e.cat)}</span></div>`));
  if(places.length) html += group('Places', places.map(p=>row(p.name, p.tag, ()=>openModal(p))));
  if(services.length || providerHits.length) html += group('Getting around',
    services.map(m=>`<div class="search-result-item" role="button" tabindex="0" data-ga-cat="${escHtml(m.id)}"><span>${escHtml(m.label)}</span><span class="meta">${escHtml(m.area)}</span></div>`)
      .concat(providerHits.map(p=>`<div class="search-result-item" role="button" tabindex="0" data-ga-q="${escHtml(p.name)}"><span>${escHtml(p.name)}</span><span class="meta">${escHtml(p.meta)}</span></div>`)));

  searchResults.innerHTML = html || '<div class="search-empty">No matches yet — try “fort”, “camel”, “taxi” or “hospital”.</div>';

  const go = (node, fn)=>{ node.addEventListener('click', fn); node.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); fn(); } }); };
  searchResults.querySelectorAll('[data-open]').forEach(n=>go(n, ()=>{
    const a = ATTRACTIONS.find(x=>x.id===n.dataset.open);
    if(a){ closeSearch(); openModal(a); }
  }));
  searchResults.querySelectorAll('[data-activity]').forEach(n=>go(n, ()=>{ closeSearch(); openActivityModal(n.dataset.activity); }));
  searchResults.querySelectorAll('[data-ga-cat]').forEach(n=>go(n, ()=>{ closeSearch(); if(window.JMTransport) JMTransport.open({category:n.dataset.gaCat}); }));
  searchResults.querySelectorAll('[data-ga-q]').forEach(n=>go(n, ()=>{ closeSearch(); if(window.JMTransport) JMTransport.open({q:n.dataset.gaQ}); }));
  searchResults.querySelectorAll('[data-hash]').forEach(n=>go(n, ()=>{ closeSearch(); location.hash = n.dataset.hash; }));
}
function escHtml(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function group(title, rowsHtml){
  return `<div class="search-group" role="group" aria-label="${escHtml(title)}"><h3 class="search-group-title">${escHtml(title)}</h3>${rowsHtml.join('')}</div>`;
}
function row(title, meta, onClickPlace){
  const openAttr = onClickPlace ? ` data-open="${escHtml(ATTRACTIONS.find(a=>a.name===title)?.id || '')}"` : '';
  return `<div class="search-result-item" role="button" tabindex="0"${openAttr}><span>${escHtml(title)}</span><span class="meta">${escHtml(meta)}</span></div>`;
}

/* ============================================================
   HEADER CHIP ACTIVE STATE ON SCROLL
   ============================================================ */
const chips = document.querySelectorAll('#headerChips .chip');
const sectionIds = ['explore','plan','things-to-do','transport'];
const sections = sectionIds.map(id=>document.getElementById(id)).filter(Boolean);
let chipFrame = 0;
function updateActiveChip(){
  chipFrame = 0;
  let current = sectionIds[0];
  const y = window.scrollY;
  sections.forEach(sec=>{ if(y >= sec.offsetTop - 140) current = sec.id; });
  chips.forEach(c=>{
    const on = c.getAttribute('href') === '#'+current;
    c.classList.toggle('is-active', on);
    if(on) c.setAttribute('aria-current','location'); else c.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', ()=>{ if(!chipFrame) chipFrame = requestAnimationFrame(updateActiveChip); }, {passive:true});

/* ============================================================
   MOBILE HELPERS — header height for anchor offsets, and keep the
   active section link visible in the swipeable header row.
   ============================================================ */
(function(){
  const header = document.querySelector('.site-header'), row = document.getElementById('headerChips');
  if(!header) return;
  const setH = ()=>document.documentElement.style.setProperty('--jm-header-h', Math.round(header.getBoundingClientRect().height)+'px');
  setH();
  if('ResizeObserver' in window) new ResizeObserver(setH).observe(header); else window.addEventListener('resize', setH);
  if(!row) return;
  let last = null, ticking = false;
  window.addEventListener('scroll', ()=>{
    if(ticking) return; ticking = true;
    requestAnimationFrame(()=>{
      ticking = false;
      const a = row.querySelector('.chip.is-active');
      if(!a || a===last) return; last = a;
      if(row.scrollWidth <= row.clientWidth + 2) return;
      const item = a.closest('.nav-item') || a;
      row.scrollTo({left:Math.max(0, item.offsetLeft - 16), behavior:'smooth'});
    });
  }, {passive:true});
})();

/* ============================================================
   MEGA NAVIGATION — desktop (>=1024px) hover/focus menus
   ------------------------------------------------------------
   Progressive enhancement only. Every chip is already a working
   <a href="#section"> link (see header markup), so if this script
   never runs, or the viewport is <1024px, navigation still works
   exactly as before. Content is derived live from the existing
   ATTRACTIONS / ACTIVITIES / TRANSPORT / ITINERARIES data — no
   new destinations, copy or routes are invented here.
   ============================================================ */
(function(){
  const HOVER_OPEN_DELAY = 140;   // ms — avoids opening on an incidental pass-over
  const CLOSE_DELAY = 220;        // ms — lets the cursor travel to the panel

  const megaLayer = document.getElementById('megaLayer');
  const megaPanel = document.getElementById('megaPanel');
  const navItems = Array.from(document.querySelectorAll('.nav-item.has-mega'));
  if(!megaLayer || !megaPanel || !navItems.length) return;

  const desktopMQ = window.matchMedia('(min-width:1024px)');
  let openTimer = null, closeTimer = null, activeKey = null, suppressFocusOpen = false;

  /* ---- build panel content from real page data, on demand ---- */
  function attractionsByCategory(){
    const groups = {};
    ATTRACTIONS.forEach(a=>{
      const cat = (a.tag.split('·')[0] || 'More').trim();
      (groups[cat] = groups[cat] || []).push(a);
    });
    return groups;
  }
  function activitiesByCategory(){
    const groups = {};
    ACTIVITIES.forEach(act=>{ (groups[act.cat] = groups[act.cat] || []).push(act); });
    return groups;
  }

  function linkList(items, hrefFn, labelFn, extraAttrFn){
    return `<ul class="mega-links">${items.map(it=>
      `<li><a href="${hrefFn(it)}"${extraAttrFn?extraAttrFn(it):''}>${labelFn(it)}</a></li>`
    ).join('')}</ul>`;
  }

  function featuredCard(a){
    if(!a) return '';
    return `
      <a class="mega-featured" href="#explore" data-open="${a.id}">
        <div class="mega-featured-media">${duneSvg(a.id+'-mega')}</div>
        <div class="mega-featured-body">
          <div class="mega-featured-eyebrow">Featured</div>
          <h6>${a.name}</h6>
          <p>${a.short}</p>
          <div class="mega-featured-cta">Explore →</div>
        </div>
      </a>`;
  }

  function buildExplore(){
    const groups = attractionsByCategory();
    const order = Object.keys(groups); // preserves first-appearance order in ATTRACTIONS
    const cols = order.map(cat=>`
      <div class="mega-col">
        <h5>${cat}</h5>
        ${linkList(groups[cat], a=>'#explore', a=>a.name, a=>` data-open="${a.id}"`)}
      </div>`).join('');
    const sam = ATTRACTIONS.find(a=>a.id==='sam');
    return `<div class="mega-grid">${cols}${featuredCard(sam)}</div>`;
  }

  function buildThingsToDo(){
    const groups = activitiesByCategory();
    const mainCats = Object.keys(groups).filter(c=>groups[c].length>=2);
    const singleCats = Object.keys(groups).filter(c=>groups[c].length<2);
    const cols = mainCats.map(cat=>`
      <div class="mega-col"><h5>${cat}</h5>${linkList(groups[cat], ()=>'#things-to-do', a=>a.name, a=>` data-activity="${a.id}"`)}</div>`);
    if(singleCats.length){
      const singles = singleCats.map(c=>groups[c][0]);
      cols.push(`<div class="mega-col"><h5>Also worth doing</h5>${linkList(singles, ()=>'#things-to-do', a=>a.name, a=>` data-activity="${a.id}"`)}</div>`);
    }
    return `<div class="mega-grid">${cols.join('')}</div>`;
  }

  function buildPlan(){
    const keys = Object.keys(ITINERARIES);
    const byLength = keys.filter(k=>/day|weekend/i.test(k));
    const byStyle = keys.filter(k=>!byLength.includes(k));
    const col = (title, ks)=>`
      <div class="mega-col"><h5>${title}</h5>
        <ul class="mega-links">${ks.map(k=>`<li><a href="#plan" data-trip="${escHtml(k)}">${escHtml(ITINERARIES[k].label)}</a></li>`).join('')}</ul>
      </div>`;
    return `<div class="mega-grid">${col('By length', byLength)}${col('By style', byStyle)}</div>`;
  }

  function buildTransport(){
    const col = `<div class="mega-col"><h5>Transport options</h5>${linkList(TRANSPORT_MODES, ()=>'#transport', m=>m.label, m=>` data-ga-cat="${m.id}"`)}</div>`;
    const featured = `
      <a class="mega-featured" href="#map?cat=transport">
        <div class="mega-featured-media">${duneSvg('map-mega')}</div>
        <div class="mega-featured-body">
          <div class="mega-featured-eyebrow">Smart Tourist Map</div>
          <h6>Find transport on the map</h6>
          <p>The railway station, the airport and every listed transport provider.</p>
          <div class="mega-featured-cta">Open map →</div>
        </div>
      </a>`;
    return `<div class="mega-grid">${col}${featured}</div>`;
  }

  const BUILDERS = {
    'explore': buildExplore,
    'things-to-do': buildThingsToDo,
    'plan': buildPlan,
    'transport': buildTransport,
  };

  /* ---- click delegation inside the panel: reuse existing app logic ---- */
  megaPanel.addEventListener('click', e=>{
    const gaEl = e.target.closest('[data-ga-cat]');
    if(gaEl){
      e.preventDefault(); closeMega();
      if(window.JMTransport) JMTransport.open({category:gaEl.getAttribute('data-ga-cat')});
      else document.getElementById('transport').scrollIntoView({behavior:'smooth', block:'start'});
      return;
    }
    const actEl = e.target.closest('[data-activity]');
    if(actEl){ e.preventDefault(); closeMega(); openActivityModal(actEl.getAttribute('data-activity')); return; }
    const openEl = e.target.closest('[data-open]');
    if(openEl){
      const a = ATTRACTIONS.find(x=>x.id===openEl.getAttribute('data-open'));
      if(a){ e.preventDefault(); closeMega(); openModal(a); }
      return;
    }
    const tripEl = e.target.closest('[data-trip]');
    if(tripEl){
      e.preventDefault();
      const key = tripEl.getAttribute('data-trip');
      const btn = Array.from(document.querySelectorAll('.trip-tab'))
        .find(b=>b.textContent===ITINERARIES[key].label);
      if(btn) btn.click();
      closeMega();
      document.getElementById('plan').scrollIntoView({behavior:'smooth', block:'start'});
    }
  });

  /* ---- open / close / switch ---- */
  function renderMega(key){
    if(!BUILDERS[key]) return;
    megaPanel.innerHTML = BUILDERS[key]();
  }
  function openMega(key){
    if(!desktopMQ.matches) return;
    clearTimeout(closeTimer);
    renderMega(key);
    activeKey = key;
    megaLayer.classList.add('is-open');
    navItems.forEach(item=>{
      const isActive = item.getAttribute('data-mega')===key;
      item.classList.toggle('is-open', isActive);
      const trigger = item.querySelector('.chip');
      if(trigger) trigger.setAttribute('aria-expanded', String(isActive));
    });
  }
  function closeMega(){
    clearTimeout(openTimer); clearTimeout(closeTimer);
    megaLayer.classList.remove('is-open');
    activeKey = null;
    navItems.forEach(item=>{
      item.classList.remove('is-open');
      const trigger = item.querySelector('.chip');
      if(trigger) trigger.setAttribute('aria-expanded','false');
    });
  }
  function scheduleClose(){
    clearTimeout(closeTimer);
    closeTimer = setTimeout(closeMega, CLOSE_DELAY);
  }

  navItems.forEach(item=>{
    const key = item.getAttribute('data-mega');
    const trigger = item.querySelector('.chip');

    item.addEventListener('mouseenter', ()=>{
      if(!desktopMQ.matches) return;
      clearTimeout(closeTimer);
      clearTimeout(openTimer);
      if(activeKey && activeKey!==key){
        openMega(key); // menu already open elsewhere -> switch instantly, no re-close/reopen flicker
      } else {
        openTimer = setTimeout(()=>openMega(key), HOVER_OPEN_DELAY);
      }
    });
    item.addEventListener('mouseleave', ()=>{
      clearTimeout(openTimer);
      scheduleClose();
    });
    trigger.addEventListener('focus', ()=>{ if(desktopMQ.matches && !suppressFocusOpen) openMega(key); });
    trigger.addEventListener('keydown', e=>{
      if(e.key==='ArrowDown' && desktopMQ.matches){
        e.preventDefault();
        openMega(key);
        const firstLink = megaPanel.querySelector('a');
        if(firstLink) firstLink.focus();
      } else if(e.key==='Escape'){
        closeMega();
        trigger.focus();
      }
    });
  });

  megaLayer.addEventListener('mouseenter', ()=>{ clearTimeout(closeTimer); });
  megaLayer.addEventListener('mouseleave', scheduleClose);
  megaPanel.addEventListener('keydown', e=>{
    if(e.key==='Escape'){
      const item = navItems.find(i=>i.getAttribute('data-mega')===activeKey);
      closeMega();
      const trigger = item && item.querySelector('.chip');
      if(trigger){ suppressFocusOpen = true; trigger.focus(); suppressFocusOpen = false; }
    }
  });

  /* close on outside click/focus, and whenever focus leaves the whole nav+panel */
  document.addEventListener('click', e=>{
    if(activeKey && !e.target.closest('.nav-item.has-mega') && !e.target.closest('.mega-layer')){
      closeMega();
    }
  });
  document.addEventListener('focusin', e=>{
    if(activeKey && !e.target.closest('.nav-item.has-mega') && !e.target.closest('.mega-layer')){
      closeMega();
    }
  });
  window.addEventListener('resize', ()=>{ if(!desktopMQ.matches) closeMega(); });
})();

