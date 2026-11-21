/* ---------- DATA: Audio Guidance (one record per clip, both languages inside) ----------
   Shape matches the future Admin Panel row: swap AUDIO_GUIDANCE_FEED.url for an API
   that returns {"records":[…]} and nothing else changes.
   - sourceType 'tts'  : read by the device voice from language.xx.text
   - sourceType 'file' : play language.xx.audioUrl (voice → text fallback if it fails)
   - triggerType defaults to 'manual'. Drafts (published:false) show only with ?audio-preview.
   - {name} {short} {history} in a 'place' record are filled from ATTRACTIONS.
   - 'place-<placeId>' (e.g. place-fort) is that place's own clip; it replaces 'place' for that place (round 15). */
const AUDIO_GUIDANCE_FEED = {url:null};
const AUDIO_GUIDANCE = VJData.get('AUDIO_GUIDANCE', [
  {id:'intro', title:'Welcome to Jaisalmer Visit', page:'home', section:'site', triggerType:'first-visit', sourceType:'tts', order:0,
   language:{
     hi:{text:'नमस्कार! Jaisalmer Visit में आपका स्वागत है। Audio Guide आपको वेबसाइट explore करने और अलग-अलग सुविधाओं को समझने में मदद करेगा। आप इसे कभी भी बंद कर सकते हैं।', audioUrl:''},
     en:{text:'Welcome to Jaisalmer Visit. Your Audio Guide can help you explore places, services, maps and travel information. You can turn it off anytime.', audioUrl:''}}},
  {id:'home', title:'Using this website', page:'home', section:'top', triggerType:'help-request', sourceType:'tts', order:1,
   language:{
     hi:{text:'यह Jaisalmer Visit का मुख्य पेज है। ऊपर के menu से Explore, Plan a trip, Things to do, Getting around और Map खोलें। Tourist Mode में आप अपने आसपास की जगहें और सेवाएँ देख सकते हैं।', audioUrl:''},
     en:{text:'This is the Jaisalmer Visit home page. Use the menu at the top to open Explore, Plan a trip, Things to do, Getting around and the Map. Tourist Mode shows places and services near you.', audioUrl:''}}},
  {id:'explore', title:'Explore Jaisalmer', page:'home', section:'explore', triggerType:'section-open', sourceType:'tts', order:2,
   language:{
     hi:{text:'यहाँ आप जैसलमेर की अलग-अलग पर्यटन जगहों को खोज सकते हैं। किसी जगह को खोलकर उसकी जानकारी, location और उपलब्ध सुविधाएँ देखें। कई जगहों पर उनकी कहानी भी सुन सकते हैं।', audioUrl:''},
     en:{text:'Here you can discover Jaisalmer\'s main sights. Open any place to see its information, location and the services around it. Many places also have a history story you can listen to.', audioUrl:''}}},
  {id:'plan', title:'Plan your trip', page:'home', section:'plan', triggerType:'section-open', sourceType:'tts', order:3,
   language:{
     hi:{text:'यहाँ से आप अपने जैसलमेर trip को बेहतर तरीके से plan कर सकते हैं। एक tab चुनें और सुबह, दोपहर और शाम का सुझाया गया क्रम देखें।', audioUrl:''},
     en:{text:'Plan your Jaisalmer trip here. Pick a tab to see a realistic morning, afternoon and evening sequence.', audioUrl:''}}},
  {id:'things-to-do', title:'Things to do', page:'home', section:'things-to-do', triggerType:'section-open', sourceType:'tts', order:4,
   language:{
     hi:{text:'यहाँ आप जैसलमेर में करने वाली अलग-अलग activities और experiences खोज सकते हैं। किसी activity को खोलकर उसकी जानकारी और local operators देखें।', audioUrl:''},
     en:{text:'Here you can find activities and experiences around Jaisalmer. Open one to see what it involves and which local operators offer it.', audioUrl:''}}},
  {id:'transport', title:'Getting around', page:'home', section:'transport', triggerType:'service-help', sourceType:'tts', order:5,
   language:{
     hi:{text:'यहाँ आप auto, taxi, local driver, bike rental, scooty rental और अन्य transport options खोज सकते हैं। ऊपर से यात्रा का तरीका चुनें, फिर provider से Call या WhatsApp पर सीधे बात करें।', audioUrl:''},
     en:{text:'Find autos, taxis, local drivers, bike and scooty rentals and desert transfers here. Choose how you want to travel, then contact the provider directly by call or WhatsApp.', audioUrl:''}}},
  {id:'map', title:'Smart Tourist Map', page:'map', section:'map', triggerType:'map-help', sourceType:'tts', order:6,
   language:{
     hi:{text:'Smart Tourist Map से आप आसपास की attractions, services और important locations खोज सकते हैं। Map पर किसी location को चुनकर उसकी details देखें, या ऊपर के filters से category चुनें।', audioUrl:''},
     en:{text:'The Smart Tourist Map shows attractions, services and important locations around you. Select a location to see its details, or use the filters at the top to choose a category.', audioUrl:''}}},
  {id:'tourist-mode', title:'Tourist Mode', page:'home', section:'tourist-mode', triggerType:'tourist-mode', sourceType:'tts', order:7,
   language:{
     hi:{text:'Tourist Mode में बताइए कि आप कहाँ हैं, या अपनी location share करें। फिर आपको आसपास की जगहें और ज़रूरी सेवाएँ दिखेंगी। आगे क्या करना है, यह तय करने के लिए Guide Me चुनें।', audioUrl:''},
     en:{text:'In Tourist Mode, tell us roughly where you are, or share your location, to see nearby places and essential services. Choose Guide Me to decide what to do next.', audioUrl:''}}},
  {id:'place', title:'About this place', page:'place', section:'place', triggerType:'place-open', sourceType:'tts', order:8,
   language:{
     hi:{text:'{name}. नीचे दिए गए sections में इसकी location, घूमने का सही समय, entry की जानकारी और आसपास की जगहें हैं।{history}', audioUrl:'', history:' इसकी कहानी सुनने के लिए Listen to History चुनें।'},
     en:{text:'{name}. {short} Below you\'ll find its location, the best time to visit, entry details and nearby places.{history}', audioUrl:'', history:' To hear its story, choose Listen to History.'}}},
  {id:'go-explore', title:'Explore Places', page:'tourist-mode', section:'guide-me', triggerType:'tourist-mode', sourceType:'tts', order:20,
   language:{hi:{text:'आइए जैसलमेर की प्रमुख जगहों को explore करते हैं।', audioUrl:''}, en:{text:'Let\'s explore Jaisalmer\'s main sights.', audioUrl:''}}},
  {id:'go-desert', title:'Desert Experience', page:'tourist-mode', section:'guide-me', triggerType:'tourist-mode', sourceType:'tts', order:21,
   language:{hi:{text:'Camel safari, jeep safari, dunes पर sunset और रात के अनुभव Things to do में हैं।', audioUrl:''}, en:{text:'Camel and jeep safaris, sunset on the dunes and night experiences are all in Things to do.', audioUrl:''}}},
  {id:'go-transport', title:'Find Transport', page:'tourist-mode', section:'guide-me', triggerType:'tourist-mode', sourceType:'tts', order:22,
   language:{hi:{text:'यहाँ transport के सभी विकल्प हैं। अपनी ज़रूरत का तरीका चुनें।', audioUrl:''}, en:{text:'Here are all the ways to get around. Choose the one you need.', audioUrl:''}}},
  {id:'go-map', title:'Use Tourist Map', page:'tourist-mode', section:'guide-me', triggerType:'tourist-mode', sourceType:'tts', order:23,
   language:{hi:{text:'Smart Tourist Map खुल रहा है। किसी location को चुनकर उसकी details देखें।', audioUrl:''}, en:{text:'Opening the Smart Tourist Map. Select a location to see its details.', audioUrl:''}}},
  {id:'go-history', title:'Listen to History', page:'tourist-mode', section:'guide-me', triggerType:'tourist-mode', sourceType:'tts', order:24,
   language:{hi:{text:'किसी भी जगह को खोलें और Listen to History दबाएँ। कहानी तभी चलेगी जब आप उसे चुनेंगे।', audioUrl:''}, en:{text:'Open any place and press Listen to History. A story only plays when you choose it.', audioUrl:''}}},
  {id:'go-expert', title:'Find Local Expert', page:'tourist-mode', section:'guide-me', triggerType:'tourist-mode', sourceType:'tts', order:25,
   language:{hi:{text:'Map पर local guides दिख रहे हैं। Photographers देखने के लिए ऊपर का filter बदलें।', audioUrl:''}, en:{text:'The map now shows local guides. Switch the filter at the top to see photographers.', audioUrl:''}}},
  {id:'go-plan', title:'Plan My Trip', page:'tourist-mode', section:'guide-me', triggerType:'tourist-mode', sourceType:'tts', order:26,
   language:{hi:{text:'आइए आपके जैसलमेर trip का plan देखते हैं।', audioUrl:''}, en:{text:'Let\'s look at a plan for your Jaisalmer trip.', audioUrl:''}}},
  {id:'help', title:'Help', page:'any', section:'help', triggerType:'help-request', sourceType:'tts', order:27,
   language:{
     hi:{text:'किसी भी section में What can I do here दबाकर उसकी जानकारी सुनें। Audio रोकने के लिए player का close बटन दबाएँ। आपात स्थिति में 112 पर call करें।', audioUrl:''},
     en:{text:'Press What can I do here in any section to hear what it offers. Close the player anytime to stop the audio. In an emergency, call 112.', audioUrl:''}}}
]);

const JMAudioGuide = (function(){
  'use strict';
  const doc = document, root = doc.documentElement;
  const PREVIEW = /[?&]audio-preview(?:[=&]|$)/.test(location.search);
  const ADMIN = /[?&]audio-admin(?:[=&]|$)/.test(location.search);
  const LANGS = {hi:'हिन्दी', en:'English'};
  const SPEEDS = [0.75, 1, 1.25];
  const SECTIONS = ['explore','plan','things-to-do','transport'];
  const TRIGGERS = ['first-visit','section-open','button-click','help-request','tourist-mode','place-open','map-help','service-help','manual'];
  const P_HISTORY = 1, P_USER = 2, P_GUIDEME = 3, P_CONTEXT = 4, P_AUTO = 5;

  /* ================= Store ================= */
  const K = {enabled:'vj_audio_guide_enabled', lang:'vj_audio_language', speed:'vj_audio_speed', intro:'vj_audio_intro_seen',
             auto:'vj_audio_auto_guidance', replay:'vj_audio_auto_replay', welcome:'vj_audio_welcome_seen'};
  const store = {
    get(k, d){ try{ const v = localStorage.getItem(k); return v===null ? d : v; }catch(e){ return d; } },
    set(k, v){ try{ localStorage.setItem(k, String(v)); }catch(e){} },
    del(k){ try{ localStorage.removeItem(k); }catch(e){} }
  };
  function browserLang(){ return (navigator.languages || [navigator.language || '']).some(x=>/^hi\b/i.test(x||'')) ? 'hi' : 'en'; }
  const prefs = {};
  function loadPrefs(){
    const l = store.get(K.lang, null), s = Number(store.get(K.speed, '1'));
    prefs.enabled = store.get(K.enabled, 'false')==='true';
    prefs.lang = LANGS[l] ? l : browserLang();
    prefs.speed = SPEEDS.indexOf(s)>=0 ? s : 1;
    prefs.auto = store.get(K.auto, 'false')==='true';
    prefs.replay = store.get(K.replay, 'false')==='true';
  }
  loadPrefs();

  function track(name, detail){          // same privacy-light jm:analytics channel as the rest of the site: event + ids only
    const d = Object.assign({event:name}, detail||{});
    try{ doc.dispatchEvent(new CustomEvent('jm:analytics', {detail:d})); if(Array.isArray(window.dataLayer)) window.dataLayer.push(d); }catch(e){}
  }

  /* ================= Content: validate + normalise (static now, Admin/API later) ================= */
  const records = new Map(), problems = new Map();
  function safeUrl(u){
    u = String(u||'').trim(); if(!u) return '';
    try{
      const url = new URL(u, doc.baseURI);
      if(!/^(https?:|blob:)$/.test(url.protocol) && url.protocol!==location.protocol) return '';
      if(!/\.(mp3|m4a|aac|ogg|oga|opus|webm|wav)(\?|#|$)/i.test(url.pathname) && url.protocol!=='blob:') return '';
      return url.href;
    }catch(e){ return ''; }
  }
  function ingest(raw){
    if(!raw || typeof raw!=='object') return false;
    const id = String(raw.id||'').trim().toLowerCase();
    if(!/^[a-z0-9][a-z0-9-]{0,59}$/.test(id)) return false;
    if(raw.deleted===true){ records.delete(id); problems.delete(id); return true; }
    const errs = [], language = {};
    const src = raw.language && typeof raw.language==='object' ? raw.language : {};
    Object.keys(src).forEach(l=>{
      if(!/^[a-z]{2,3}$/.test(l)) return;
      const x = src[l] || {}, url = String(x.audioUrl||'').trim(), ok = safeUrl(url);
      if(url && !ok) errs.push(l.toUpperCase()+': audio URL/format not supported');
      language[l] = {text:String(x.text||'').trim().slice(0,1200), audioUrl:ok, history:String(x.history||'').trim().slice(0,300)};
    });
    const r = {
      id, title:String(raw.title||'').trim().slice(0,90), page:String(raw.page||'').trim(), section:String(raw.section||'').trim(),
      description:String(raw.description||'').trim(),
      triggerType: TRIGGERS.indexOf(raw.triggerType)>=0 ? raw.triggerType : 'manual',
      sourceType: raw.sourceType==='file' ? 'file' : 'tts',
      duration: Number(raw.duration)>0 ? Number(raw.duration) : 0, fileSize: Number(raw.fileSize)>0 ? Number(raw.fileSize) : 0,
      enabled: raw.enabled!==false, published: raw.published!==false, order: Number(raw.order)||0,
      updatedAt:String(raw.updatedAt||''), language
    };
    if(!r.title) errs.push('Title missing');
    Object.keys(LANGS).forEach(l=>{ if(!language[l] || !language[l].text) errs.push(LANGS[l]+' text missing'); });
    if(r.sourceType==='file' && !Object.keys(language).some(l=>language[l].audioUrl)) errs.push('Audio file missing (falls back to voice/text)');
    if(raw.triggerType && TRIGGERS.indexOf(raw.triggerType)<0) errs.push('Unknown trigger type → Manual Only');
    records.set(id, r); problems.set(id, errs);
    return true;
  }
  function load(list){ let n = 0; (Array.isArray(list) ? list : []).forEach(r=>{ if(ingest(r)) n++; }); return n; }
  load(AUDIO_GUIDANCE);
  let feedLoaded = false;
  function loadFeed(){                          // no-op until AUDIO_GUIDANCE_FEED.url is set
    if(!AUDIO_GUIDANCE_FEED.url || feedLoaded || typeof fetch!=='function') return;
    feedLoaded = true;
    fetch(AUDIO_GUIDANCE_FEED.url, {credentials:'omit', headers:{'Accept':'application/json'}})
      .then(r=>{ if(!r.ok) throw new Error('http'); return r.json(); })
      .then(j=>load(j && j.records)).catch(()=>{ feedLoaded = false; });
  }
  function rec(id){ const r = records.get(id); return r && r.enabled && (r.published || PREVIEW || ADMIN) ? r : null; }

  function placeClip(place){ return place && rec('place-'+place.id) ? 'place-'+place.id : 'place'; }   // a place's own clip, else the shared one
  function places(){ return (typeof ATTRACTIONS!=='undefined' && Array.isArray(ATTRACTIONS)) ? ATTRACTIONS : []; }
  function hasHistory(id){ try{ return !!(window.JMHistoryAudio && JMHistoryAudio.get(id).length); }catch(e){ return false; } }

  /* Build a playable item {id,title,text,audioUrl,lang,kind} in the chosen language (falls back to English text). */
  function item(id, lang, place){
    const r = rec(id); if(!r) return null;
    lang = lang || prefs.lang;
    const L = (r.language[lang] && r.language[lang].text) ? lang : (r.language.en && r.language.en.text ? 'en' : Object.keys(r.language)[0]);
    if(!L) return null;
    const x = r.language[L];
    let text = x.text, title = r.title;
    if(place){
      text = text.replace(/\{name\}/g, place.name).replace(/\{short\}/g, place.short || '')
                 .replace(/\{history\}/g, hasHistory(place.id) && x.history ? ' '+x.history : '').replace(/\s{2,}/g,' ').trim();
      title = place.name;
    }
    return {id:r.id, title, text, audioUrl:x.audioUrl, lang:L, wanted:lang, kind:place ? 'place' : (r.section==='guide-me' ? 'guide-me' : r.id==='intro' ? 'intro' : 'section'), placeId:place ? place.id : null};
  }

  /* ================= Device voice ================= */
  const Voice = (function(){
    const ok = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance==='function';
    let list = [];
    function refresh(){ try{ list = window.speechSynthesis.getVoices() || []; }catch(e){ list = []; } }
    if(ok){ refresh(); try{ window.speechSynthesis.addEventListener('voiceschanged', refresh); }catch(e){} }
    function ready(){
      return new Promise(res=>{
        if(!ok || list.length) return res();
        const t0 = Date.now(), iv = setInterval(()=>{ refresh(); if(list.length || Date.now()-t0 > 1500){ clearInterval(iv); res(); } }, 100);
      });
    }
    function find(lang){
      const L = lang.toLowerCase(), n = v=>String(v.lang||'').toLowerCase().replace('_','-');
      return list.find(v=>n(v)===L+'-in') || list.find(v=>n(v).startsWith(L) && v.localService) || list.find(v=>n(v).startsWith(L)) || null;
    }
    // true = voice found · 'maybe' = device lists no voices but may still speak (some Android builds) · false = not for this language
    function supports(lang){ if(!ok) return false; if(!list.length) return 'maybe'; return !!find(lang); }
    return {ok, ready, find, supports};
  })();

  /* ================= Engine: one guide clip at a time ================= */
  const S = {item:null, prio:9, auto:false, state:'idle', mode:null, note:'', fix:null,
             chunks:[], starts:[], total:0, idx:0, pos:0, clockAt:0, run:0, ticker:0, watchdog:0, endTimer:0};
  let audioEl = null;
  function historyPlaying(){ try{ const s = window.JMHistoryAudio && JMHistoryAudio.snapshot(); return !!(s && s.playing); }catch(e){ return false; } }
  const WPM = {hi:140, en:165};
  function sentences(t){ return (String(t).match(/[^.!?।]+[.!?।]*/g) || []).map(s=>s.trim()).filter(s=>/[\p{L}\p{N}]/u.test(s)); }
  function est(s, lang){ return s.split(/\s+/).length / ((WPM[lang]||155) * prefs.speed / 60) + 0.35; }
  function timeline(){ S.starts = []; S.total = 0; S.chunks.forEach(c=>{ S.starts.push(S.total); S.total += est(c, S.item.lang); }); }
  function halt(){
    S.run++; clearInterval(S.ticker); clearTimeout(S.watchdog); S.ticker = S.watchdog = 0;
    if(S.mode==='tts'){ try{ window.speechSynthesis.cancel(); }catch(e){} }
  }
  function haltAll(){
    halt();
    if(audioEl){ try{ audioEl.pause(); }catch(e){} }
  }
  function now(){
    if(S.mode==='file' && audioEl) return audioEl.currentTime || 0;
    if(S.mode!=='tts') return 0;
    if(S.state!=='playing') return S.pos;
    const next = S.idx+1 < S.starts.length ? S.starts[S.idx+1] : S.total;
    return Math.min(S.pos + (Date.now()-S.clockAt)/1000, next);
  }
  function duration(){
    if(S.mode==='file' && audioEl && isFinite(audioEl.duration) && audioEl.duration>0) return audioEl.duration;
    return S.mode==='tts' ? S.total : 0;
  }
  function setState(s){ S.state = s; UI.player(); }

  /* request(): the only way a guide clip starts. Returns true if audio (or text) was shown. */
  function request(it, o){
    o = o || {};
    if(!it) return false;
    const prio = o.prio || P_USER, auto = prio >= P_CONTEXT;
    loadFeed();
    if(historyPlaying()){                           // Rule 4: a user-chosen history story is never interrupted
      if(auto) return false;
      begin(it, prio, auto); toText('A history story is playing. Here is the guide as text.', 'story');
      return true;
    }
    const busy = S.item && (S.state==='playing' || S.state==='loading');
    if(busy && auto) return false;                  // automatic guidance never cuts in
    if(busy && S.prio < prio && !o.force) return false;
    begin(it, prio, auto);
    start();
    return true;
  }
  function begin(it, prio, auto){
    haltAll(); clearTimeout(S.endTimer);
    S.item = it; S.prio = prio; S.auto = auto; S.note = ''; S.fix = null; S.mode = null; S.idx = 0; S.pos = 0;
    UI.showText(false);
  }
  function start(){
    const it = S.item; if(!it) return;
    if(it.lang!==it.wanted){ S.note = LANGS[it.wanted]+' text isn’t ready for this item yet — playing '+LANGS[it.lang]+'.'; }
    if(it.audioUrl) return startFile();
    startVoice();
  }
  function startFile(){
    const it = S.item;
    if(!audioEl){
      audioEl = new Audio(); audioEl.preload = 'none';               // nothing downloads until a clip is requested
      audioEl.addEventListener('playing', ()=>{ if(S.mode==='file') setState('playing'); });
      audioEl.addEventListener('waiting', ()=>{ if(S.mode==='file' && S.state==='playing') setState('loading'); });
      audioEl.addEventListener('timeupdate', ()=>{ if(S.mode==='file') UI.progress(); });
      audioEl.addEventListener('ended', ()=>{ if(S.mode==='file') finish(); });
      audioEl.addEventListener('error', ()=>{ if(S.mode==='file' && S.item){ S.item = Object.assign({}, S.item, {audioUrl:''}); startVoice(); } });
    }
    S.mode = 'file'; setState('loading');
    audioEl.src = it.audioUrl;
    try{ audioEl.defaultPlaybackRate = prefs.speed; audioEl.playbackRate = prefs.speed; }catch(e){}
    const p = audioEl.play();
    if(p && p.catch) p.catch(err=>{ if(err && err.name==='AbortError') return; if(S.mode==='file'){ S.item = Object.assign({}, S.item, {audioUrl:''}); startVoice(); } });
    track('audio_guide_played', {guideId:it.id, language:it.lang, source:'file'});
  }
  function startVoice(){
    const it = S.item;
    S.mode = 'tts'; setState('loading');
    const my = S.run;
    Voice.ready().then(()=>{
      if(S.item!==it || my!==S.run) return;
      const sup = Voice.supports(it.lang);
      if(!sup){
        const alt = Object.keys(LANGS).find(l=>l!==it.lang && Voice.supports(l)===true && rec(it.id) && rec(it.id).language[l] && rec(it.id).language[l].text);
        toText(Voice.ok ? LANGS[it.lang]+' voice isn’t available on this device. Read the guide below.' : 'Audio isn’t available on this device. Read the guide below.', alt ? 'lang:'+alt : null);
        return;
      }
      S.chunks = sentences(it.text); if(!S.chunks.length){ toText('Audio unavailable. Read the guide instead.'); return; }
      timeline(); speakFrom(0);
      track('audio_guide_played', {guideId:it.id, language:it.lang, source:'tts'});
    });
  }
  function speakFrom(i){
    halt(); S.mode = 'tts';
    const my = S.run, it = S.item;
    S.idx = i; S.pos = S.starts[i] || 0; S.clockAt = Date.now();
    const u = new SpeechSynthesisUtterance(S.chunks[i]);
    u.lang = it.lang==='hi' ? 'hi-IN' : it.lang==='en' ? 'en-IN' : it.lang;
    u.rate = prefs.speed;
    const v = Voice.find(it.lang); if(v) u.voice = v;
    u.onstart = ()=>{ if(my!==S.run) return; clearTimeout(S.watchdog); S.clockAt = Date.now(); S.pos = S.starts[i]; setState('playing'); };
    u.onend = ()=>{
      if(my!==S.run || S.state==='paused') return;
      if(S.idx+1 < S.chunks.length){ speakFrom(S.idx+1); return; }
      finish();
    };
    u.onerror = e=>{
      if(my!==S.run) return;
      if(e && (e.error==='interrupted' || e.error==='canceled')){ halt(); S.pos = S.starts[S.idx]||0; setState('paused'); return; }
      halt(); toText('Audio unavailable. Read the guide instead.');
    };
    S.watchdog = setTimeout(()=>{ if(my===S.run && S.state==='loading'){ halt(); toText('Audio unavailable. Read the guide instead.'); } }, 6000);
    S.ticker = setInterval(()=>UI.progress(), 250);
    try{ window.speechSynthesis.speak(u); }catch(err){ halt(); toText('Audio unavailable. Read the guide instead.'); }
  }
  function finish(){
    halt(); S.pos = S.total; setState('ended');
    if(S.item) track('audio_guide_completed', {guideId:S.item.id, language:S.item.lang});
    clearTimeout(S.endTimer);
    S.endTimer = setTimeout(()=>{ if(S.state==='ended' && !UI.busy()) stop(true); }, 9000);   // quietly tidy away a finished clip
  }
  function toText(msg, fix){
    haltAll(); S.mode = 'text'; S.note = msg || ''; S.fix = fix || null;
    UI.showText(true); setState('text');
    UI.launcherError(!Voice.ok);
    if(S.item) track('audio_guide_text_fallback', {guideId:S.item.id, language:S.item.lang});
  }
  function pause(){
    if(S.state!=='playing' && S.state!=='loading') return;
    if(S.mode==='file' && audioEl) audioEl.pause();
    else if(S.mode==='tts'){ S.pos = now(); halt(); }
    setState('paused');
    if(S.item) track('audio_guide_paused', {guideId:S.item.id});
  }
  function resume(){
    if(!S.item) return;
    if(historyPlaying()){ S.note = 'A history story is playing. Pause it to hear the guide.'; S.fix = 'story'; UI.showText(true); UI.player(); return; }
    if(S.state==='ended'){ replay(); return; }
    if(S.mode==='file' && audioEl){ setState('loading'); const p = audioEl.play(); if(p && p.catch) p.catch(()=>{}); return; }
    if(S.mode==='tts'){ speakFrom(S.idx); return; }
    start();
  }
  function replay(){
    if(!S.item) return;
    if(historyPlaying()){ resume(); return; }
    clearTimeout(S.endTimer);
    track('audio_guide_replayed', {guideId:S.item.id});
    if(S.mode==='file' && audioEl){ try{ audioEl.currentTime = 0; }catch(e){} setState('loading'); const p = audioEl.play(); if(p && p.catch) p.catch(()=>{}); return; }
    if(S.mode==='tts' && S.chunks.length){ speakFrom(0); return; }
    S.note = ''; S.fix = null; UI.showText(false); start();
  }
  function stop(quiet){
    const was = S.item;
    haltAll(); clearTimeout(S.endTimer);
    if(was && S.auto && !quiet) autoMuted = true;   // Rule 7: closing an automatic clip turns automatic guidance off for this visit
    S.item = null; S.mode = null; S.state = 'idle'; S.note = ''; S.fix = null;
    UI.player();
  }
  function setSpeed(v){
    if(SPEEDS.indexOf(v)<0) return;
    prefs.speed = v; store.set(K.speed, v);
    if(S.mode==='file' && audioEl){ try{ audioEl.playbackRate = v; }catch(e){} }
    if(S.mode==='tts' && S.chunks.length){ const was = S.state; timeline(); if(was==='playing') speakFrom(S.idx); else { S.pos = S.starts[S.idx]||0; UI.progress(); } }
    track('audio_speed_changed', {speed:v});
  }
  function setLang(l, from){
    if(!LANGS[l]) return;
    const changed = l!==prefs.lang;
    prefs.lang = l; store.set(K.lang, l);
    if(from!=='history'){ try{ window.JMHistoryAudio && JMHistoryAudio.setLang && JMHistoryAudio.setLang(l); }catch(e){} }
    UI.refresh();
    if(changed && S.item && (S.state==='playing' || S.state==='loading' || S.state==='text')){   // same clip, new language
      const pl = S.item.kind==='place' ? places().find(a=>a.id===S.item.placeId) : null;
      const it = pl ? item(placeClip(pl), l, pl) : item(S.item.id, l);
      if(it){ const p = S.prio; begin(it, p, S.auto); start(); }
    }
    if(changed) track('audio_language_changed', {language:l});
  }
  document.addEventListener('jm:history-audio', e=>{          // a history story starts → the guide steps aside
    const d = e.detail || {};
    if(d.type==='state' && d.playing && S.item && (S.state==='playing' || S.state==='loading')){ pause(); }
  });
  document.addEventListener('vj:audio-language', e=>{ const l = e.detail && e.detail.language; if(LANGS[l] && l!==prefs.lang) setLang(l, 'history'); });
  window.addEventListener('pagehide', ()=>haltAll());

  /* ================= ON / OFF ================= */
  let autoMuted = false;
  function setEnabled(on, why){
    prefs.enabled = !!on; store.set(K.enabled, prefs.enabled);
    root.classList.toggle('vjag-on', prefs.enabled);
    store.set(K.welcome, 'true'); UI.hideWelcome();
    if(prefs.enabled){
      track('audio_guide_enabled', {from:why||'panel'});
      if(store.get(K.intro,'false')!=='true'){ store.set(K.intro,'true'); request(item('intro'), {prio:P_USER, force:true}); }
    }else{
      stop(true); UI.hideNudge();
      track('audio_guide_disabled', {from:why||'panel'});
    }
    UI.refresh();
  }

  /* ================= Where is the visitor? ================= */
  let currentPlace = null;
  function isOpen(id, cls){ const el = doc.getElementById(id); return !!(el && el.classList.contains(cls)); }
  function overlayOpen(){
    const ga = doc.getElementById('gaSheetOverlay');
    return root.classList.contains('mv-open') || isOpen('modalOverlay','open') || isOpen('addServiceOverlay','open') ||
           isOpen('searchPanel','open') || !!(ga && !ga.hidden) || !!doc.querySelector('.vjag-admin');
  }
  function context(){
    if(root.classList.contains('mv-open')) return {id:'map'};
    if(isOpen('modalOverlay','open') && currentPlace) return {id:'place', place:currentPlace};
    const tm = doc.getElementById('touristModePanel');
    if(tm && tm.classList.contains('open')){ const r = tm.getBoundingClientRect(); if(r.bottom > 80 && r.top < innerHeight*0.6) return {id:'tourist-mode'}; }
    let best = null, area = 0;
    SECTIONS.forEach(id=>{
      const el = doc.getElementById(id); if(!el) return;
      const r = el.getBoundingClientRect(), vis = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
      if(vis > area){ area = vis; best = id; }
    });
    return {id: best && area > innerHeight*0.35 ? best : 'home'};
  }
  function itemForContext(c, lang){ return c.id==='place' ? item(placeClip(c.place), lang, c.place) : item(c.id, lang); }
  function playHere(c, prio){
    c = c || context();
    const it = itemForContext(c);
    if(it){ request(it, {prio:prio||P_USER, force:true}); track('what_can_i_do_here', {section:c.id}); }
  }

  /* ================= Guide Me ================= */
  const GO = [
    {k:'explore',   ic:'🏰', label:'Explore Places',     to:'#explore',       clip:'go-explore'},
    {k:'desert',    ic:'🏜️', label:'Desert Experience',  to:'#things-to-do',  clip:'go-desert'},
    {k:'transport', ic:'🚕', label:'Find Transport',     to:'#transport',     clip:'go-transport'},
    {k:'map',       ic:'🗺️', label:'Use Tourist Map',    to:'#map',           clip:'go-map'},
    {k:'history',   ic:'🎧', label:'Listen to History',  to:'#explore',       clip:'go-history'},
    {k:'expert',    ic:'👨‍🏫', label:'Find Local Expert',  to:'#map?cat=services&sub=Guides', clip:'go-expert'},
    {k:'plan',      ic:'🧭', label:'Plan My Trip',       to:'#plan',          clip:'go-plan'},
    {k:'help',      ic:'ℹ️', label:'Help',               to:null,             clip:'help'}
  ];
  let quietUntil = 0;
  function guideMe(k){
    const g = GO.find(x=>x.k===k); if(!g) return;
    track('guide_me_option_selected', {option:k});
    UI.closePanel(false);
    if(g.to){
      quietUntil = Date.now() + 4000;                 // the section's own auto-guidance must not talk over this answer
      const tmOpen = isOpen('touristModePanel','open'), btn = doc.getElementById('touristModeBtn');
      if(tmOpen && btn) btn.click();                  // leave Tourist Mode tidy behind us
      if(location.hash===g.to && g.to.charAt(1)!=='m'){ const el = doc.querySelector(g.to); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }
      else location.hash = g.to;
      if(g.to.indexOf('#map')!==0) setTimeout(()=>flash(doc.querySelector(g.to+' .section-head h2')), 450);
      if(k==='history') setTimeout(()=>flash(doc.getElementById('exploreRail')), 450);
    }
    // Audio only when the Audio Guide is on — except Help, which always answers (as text if audio is off).
    if(prefs.enabled) request(item(g.clip), {prio:P_GUIDEME, force:true});
    else if(k==='help'){ begin(item('help'), P_GUIDEME, false); toText(''); }
  }
  function flash(el){
    if(!el) return;
    el.classList.remove('vjag-flash'); void el.offsetWidth; el.classList.add('vjag-flash');
    setTimeout(()=>el.classList.remove('vjag-flash'), 2600);
  }

  /* ================= Context-aware guidance (intentional navigation only — never on scroll or load) ================= */
  const heard = new Set(), nudged = new Set();
  function entered(id){
    if(!prefs.enabled || Date.now() < quietUntil || !records.has(id)) return;
    if(heard.has(id) && !prefs.replay) return;
    if(prefs.auto && !autoMuted){
      if(request(item(id), {prio:P_AUTO})){ heard.add(id); track('audio_guide_auto', {section:id}); }
      return;
    }
    if(!nudged.has(id) && !overlayOpen() && !(S.item && S.state==='playing')){ nudged.add(id); UI.nudge(id); }
  }
  window.addEventListener('hashchange', ()=>{
    const h = location.hash;
    if(/^#map(?:[\/?]|$)/.test(h)) setTimeout(()=>entered('map'), 600);
    else if(SECTIONS.indexOf(h.slice(1))>=0) setTimeout(()=>entered(h.slice(1)), 500);
  });

  /* ================= UI ================= */
  function h(tag, cls, text){ const n = doc.createElement(tag); if(cls) n.className = cls; if(text!=null) n.textContent = text; return n; }
  function btn(cls, text, attrs){ const b = h('button', cls, text); b.type = 'button'; Object.keys(attrs||{}).forEach(k=>b.setAttribute(k, attrs[k])); return b; }
  function clock(s){ s = Math.max(0, Math.round(s||0)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
  function seg(label, opts, cur, onPick){
    const g = h('div','vjag-seg'); g.setAttribute('role','group'); g.setAttribute('aria-label', label);
    opts.forEach(o=>{
      const b = btn('', o.t, {'aria-pressed':String(o.v===cur)}); if(o.lang) b.setAttribute('lang', o.lang);
      b.addEventListener('click', ()=>{ onPick(o.v); g.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed', String(x===b))); });
      g.append(b);
    });
    return g;
  }
  function switchRow(label, sub, on, onToggle){
    const row = h('div','vjag-switchrow'), t = h('span', null, label);
    if(sub) t.append(h('small', null, sub));
    const sw = btn('vjag-switch', '', {role:'switch', 'aria-checked':String(on), 'aria-label':label});
    sw.addEventListener('click', ()=>{ const v = sw.getAttribute('aria-checked')!=='true'; sw.setAttribute('aria-checked', String(v)); onToggle(v); });
    const hit = h('span','vjag-switch-hit'); hit.append(sw);
    row.append(t, hit); return {row, sw};
  }
  function guideMeGrid(){
    const wrap = h('div');
    wrap.append(h('p','vjag-gm-q','How can I help you?'));
    const g = h('div','vjag-gm'); g.setAttribute('role','group'); g.setAttribute('aria-label','Guide Me options');
    GO.forEach(o=>{
      const b = btn('', null, {'data-vjag-go':o.k});
      const ic = h('span', null, o.ic); ic.setAttribute('aria-hidden','true');
      b.append(ic, h('span', null, o.label)); g.append(b);
    });
    wrap.append(g); return wrap;
  }

  const UI = (function(){
    const dock = h('div','vjag-dock'); dock.setAttribute('data-vjag','dock');
    const live = h('span','visually-hidden'); live.setAttribute('role','status'); live.setAttribute('aria-live','polite');

    /* launcher */
    const launch = btn('vjag-launch', null, {'aria-haspopup':'dialog', 'aria-expanded':'false', 'aria-controls':'vjagPanel'});
    const lIco = h('span','vjag-ico','🔊'); lIco.setAttribute('aria-hidden','true');
    const lTxt = h('span','vjag-txt','Audio Guide'); const lDot = h('span','vjag-dot'); lDot.setAttribute('aria-hidden','true');
    launch.append(lIco, lTxt, lDot);
    let errTimer = 0;
    function launcherLabel(){
      const err = launch.dataset.state==='error';
      const t = err ? 'Audio unavailable' : prefs.enabled ? 'Audio Guide ON' : 'Audio Guide';
      lIco.textContent = err ? '⚠' : '🔊';
      lTxt.textContent = t; launch.setAttribute('aria-label', t+(err ? '' : ' — open audio options'));
    }
    function launcherError(on){
      clearTimeout(errTimer);
      if(on){ launch.dataset.state = 'error'; errTimer = setTimeout(()=>{ delete launch.dataset.state; launcherLabel(); }, 6000); }
      else delete launch.dataset.state;
      launcherLabel();
    }

    /* panel */
    const panel = h('div','vjag-card vjag-panel'); panel.id = 'vjagPanel'; panel.hidden = true;
    panel.setAttribute('role','dialog'); panel.setAttribute('aria-labelledby','vjagPanelTitle');
    let panelOpen = false, lastFocus = null;
    let builtFor = null;
    function buildPanel(){
      builtFor = prefs.enabled;
      panel.textContent = '';
      const head = h('div','vjag-head'), t = h('h3', null, '🔊 Audio Guide'); t.id = 'vjagPanelTitle';
      const x = btn('vjag-x', '×', {'aria-label':'Close audio options'}); x.addEventListener('click', ()=>closePanel(true));
      head.append(t, x); panel.append(head);
      if(!prefs.enabled){
        panel.append(h('p', null, 'A short spoken guide to what each part of Jaisalmer Visit does. It stays quiet until you ask.'));
        const row = h('div','vjag-row'), on = btn('modal-act primary', '🔊 Turn on Audio Guide');
        on.addEventListener('click', ()=>{ setEnabled(true, 'panel'); focusFirst(); });
        row.append(on); panel.append(row);
        if(!Voice.ok) panel.append(h('p','vjag-note','This device can’t read aloud, so guides will appear as text.'));
        return;
      }
      const c = context(), it = itemForContext(c);
      panel.append(h('p', null, 'Need help exploring this page?'));
      const row = h('div','vjag-row');
      const here = btn('modal-act primary', '▶ What can I do here?', {'data-vjag-panel':'here'});
      const gm = btn('modal-act', '🎙️ Guide Me', {'aria-expanded':'false', 'aria-controls':'vjagPanelGm'});
      row.append(here, gm); panel.append(row);
      if(it) panel.append(h('p','vjag-note','About: '+it.title));
      const gmBox = h('div'); gmBox.id = 'vjagPanelGm'; gmBox.hidden = true; gmBox.append(guideMeGrid());
      panel.append(gmBox);
      here.addEventListener('click', ()=>{ closePanel(false); playHere(c); });
      gm.addEventListener('click', ()=>{ const o = gmBox.hidden; gmBox.hidden = !o; gm.setAttribute('aria-expanded', String(o)); if(o) track('guide_me_opened', {from:'panel'}); });

      const set = h('details','vjag-settings'); const sum = h('summary', null, '⚙ Audio Guide Settings'); set.append(sum);
      set.append(switchRow('Audio Guide', null, true, v=>{ if(!v){ setEnabled(false, 'settings'); closePanel(true); } }).row);
      set.append(switchRow('Auto guidance', 'Speak once when you open a section', prefs.auto, v=>{ prefs.auto = v; store.set(K.auto, v); autoMuted = false; track('audio_auto_guidance', {on:v}); }).row);
      set.append(switchRow('Replay guidance on revisit', 'Off: each section speaks once per visit', prefs.replay, v=>{ prefs.replay = v; store.set(K.replay, v); }).row);
      set.append(h('p','vjag-label','Playback speed'), seg('Playback speed', SPEEDS.map(v=>({v, t:v+'×'})), prefs.speed, setSpeed));
      const reset = btn('vjag-linkbtn', 'Reset audio preferences');
      reset.addEventListener('click', ()=>{ Object.keys(K).forEach(k=>store.del(K[k])); store.set(K.welcome,'true'); stop(true); loadPrefs(); root.classList.toggle('vjag-on', prefs.enabled); heard.clear(); nudged.clear(); autoMuted = false; closePanel(true); refresh(); live.textContent = 'Audio preferences reset.'; track('audio_preferences_reset'); });
      set.append(reset);
      panel.append(set);
    }
    // No language picker here (client, 28 Oct 2026): the guide follows the language chosen under History Audio (vj:audio-language).
    function focusFirst(){ const f = panel.querySelector('button.modal-act, button'); if(f) try{ f.focus(); }catch(e){} }
    function openPanel(){
      hideNudge(); hideWelcome();
      buildPanel(); panel.hidden = false; panelOpen = true; launch.setAttribute('aria-expanded','true');
      lastFocus = doc.activeElement; focusFirst();
    }
    function closePanel(restore){
      if(!panelOpen) return;
      panel.hidden = true; panelOpen = false; launch.setAttribute('aria-expanded','false');
      if(restore){ const t = (lastFocus && lastFocus.isConnected && lastFocus.offsetParent) ? lastFocus : launch; try{ t.focus(); }catch(e){} }
    }
    launch.addEventListener('click', ()=>{ if(panelOpen) closePanel(true); else openPanel(); });

    /* first-visit welcome */
    const welcome = h('div','vjag-card vjag-welcome'); welcome.hidden = true;
    welcome.setAttribute('role','dialog'); welcome.setAttribute('aria-labelledby','vjagWelcomeT');
    (function(){
      const t = h('h3', null, '👋 Welcome to Jaisalmer Visit'); t.id = 'vjagWelcomeT';
      const x = btn('vjag-x', '×', {'aria-label':'Dismiss'});
      const row = h('div','vjag-row'), on = btn('modal-act primary', '🔊 Turn on Audio Guide'), later = btn('modal-act', 'Maybe later');
      row.append(on, later);
      welcome.append(t, h('p', null, 'Need help exploring the website? A short spoken guide can explain each section — only when you ask.'), row, x);
      on.addEventListener('click', ()=>{ setEnabled(true, 'welcome'); try{ launch.focus(); }catch(e){} });
      const dismiss = ()=>{ store.set(K.welcome,'true'); hideWelcome(); track('audio_guide_welcome_dismissed'); };
      later.addEventListener('click', dismiss); x.addEventListener('click', dismiss);
    })();
    function hideWelcome(){ welcome.hidden = true; }

    /* contextual nudge */
    const nudgeEl = h('div','vjag-card vjag-nudge'); nudgeEl.hidden = true;
    const nGo = btn('vjag-nudge-go'), nX = btn('vjag-x', '×', {'aria-label':'Dismiss suggestion'});
    nudgeEl.append(nGo, nX);
    let nudgeTimer = 0, nudgeId = null;
    function nudge(id){
      const it = item(id); if(!it || panelOpen) return;
      nudgeId = id; nGo.textContent = '';
      nGo.append(doc.createTextNode('🔊 What can I do here?'), h('small', null, it.title));
      nGo.setAttribute('aria-label', 'Play the audio guide for '+it.title);
      nudgeEl.hidden = false; clearTimeout(nudgeTimer); nudgeTimer = setTimeout(hideNudge, 7000);
    }
    function hideNudge(){ clearTimeout(nudgeTimer); nudgeEl.hidden = true; }
    nGo.addEventListener('click', ()=>{ const id = nudgeId; hideNudge(); if(id){ heard.add(id); playHere({id}); } });
    nX.addEventListener('click', hideNudge);
    nudgeEl.addEventListener('mouseenter', ()=>clearTimeout(nudgeTimer));
    nudgeEl.addEventListener('focusin', ()=>clearTimeout(nudgeTimer));

    /* mini player */
    const pl = h('div','vjag-card vjag-player'); pl.hidden = true;
    pl.setAttribute('role','region'); pl.setAttribute('aria-label','Audio Guide player');
    const r1 = h('div','vjag-p-row'), r2 = h('div','vjag-p-row2');
    const pIcon = btn('vjag-ib bare', '🔊', {'aria-label':'Audio options', 'aria-controls':'vjagPanel'});
    const meta = h('div','vjag-p-meta'), kicker = h('span','vjag-p-kicker','Audio Guide'), title = h('span','vjag-p-title');
    meta.append(kicker, title);
    const pp = btn('vjag-ib primary', '▶'), close = btn('vjag-ib', '✕', {'aria-label':'Stop and close the audio guide'});
    r1.append(pIcon, meta, pp, close);
    const bar = h('div','vjag-p-bar'), fill = h('span'); bar.append(fill); bar.setAttribute('aria-hidden','true');
    const time = h('span','vjag-p-time'); time.setAttribute('aria-hidden','true');
    const rep = btn('vjag-p-small', '↻ Replay', {'aria-label':'Replay from the start'});
    const txtBtn = btn('vjag-p-small', 'Text', {'aria-expanded':'false', 'aria-controls':'vjagText', 'aria-label':'Show the guide as text'});
    r2.append(bar, time, rep, txtBtn);
    const msg = h('p','vjag-p-msg'); msg.setAttribute('role','status');
    const fixRow = h('div','vjag-p-fix'); fixRow.hidden = true;
    const text = h('div','vjag-p-text'); text.id = 'vjagText'; text.hidden = true;
    pl.append(r1, r2, msg, fixRow, text);
    let lastState = '';
    function showText(on){ text.hidden = !on; txtBtn.setAttribute('aria-expanded', String(on)); txtBtn.textContent = on ? 'Hide text' : 'Text'; }
    function renderPlayer(){
      const it = S.item;
      root.classList.toggle('vjag-has-player', !!it);
      if(!it){ pl.hidden = true; lastState = ''; return; }
      pl.hidden = false; pl.dataset.state = S.state;
      title.textContent = it.title;
      kicker.textContent = it.kind==='place' ? 'Audio Guide · this place' : it.kind==='guide-me' ? 'Guide Me' : 'Audio Guide';
      text.textContent = it.text; text.setAttribute('lang', it.lang);
      const st = S.state;
      const PP = {loading:['◌','Loading, tap to cancel'], playing:['❚❚','Pause'], paused:['▶','Resume'], ended:['↻','Replay'], text:['▶','Try playing audio'], idle:['▶','Play']}[st] || ['▶','Play'];
      pp.textContent = PP[0]; pp.setAttribute('aria-label', PP[1]+' — '+it.title);
      pp.disabled = st==='text' && !S.fix;
      pp.hidden = st==='text';
      rep.hidden = st==='text';
      msg.textContent = S.note || '';
      fixRow.textContent = ''; fixRow.hidden = !S.fix;
      if(S.fix==='story'){
        const b = btn('modal-act', '❚❚ Pause story & listen');
        b.addEventListener('click', ()=>{ try{ JMHistoryAudio.pause(); }catch(e){} S.note = ''; S.fix = null; showText(false); start(); });
        fixRow.append(b);
      }else if(S.fix && S.fix.indexOf('lang:')===0){
        const l = S.fix.slice(5), b = btn('modal-act', '🔊 Listen in '+LANGS[l]);
        b.addEventListener('click', ()=>{ const cur = S.item; const cp = cur.kind==='place' ? places().find(a=>a.id===cur.placeId) : null; const n = cp ? item(placeClip(cp), l, cp) : item(cur.id, l); if(n){ begin(n, S.prio, false); start(); } });
        fixRow.append(b);
      }
      if(st!==lastState){
        const say = {playing:'Playing: '+it.title, paused:'Paused', ended:'Finished', text:'Showing the guide as text'}[st];
        if(say) live.textContent = say;
        lastState = st;
      }
      progress();
    }
    function progress(){
      if(!S.item) return;
      const d = duration(), t = Math.min(now(), d || 0);
      fill.style.width = d ? Math.min(100, t/d*100)+'%' : '0%';
      time.textContent = d ? clock(t)+' / '+(S.mode==='tts' ? '~' : '')+clock(d) : '';
    }
    pp.addEventListener('click', ()=>{
      const st = S.state;
      if(st==='playing' || st==='loading') pause();
      else if(st==='ended') replay();
      else resume();
    });
    rep.addEventListener('click', replay);
    close.addEventListener('click', ()=>{ const it = S.item; stop(false); if(it) track('audio_guide_closed', {guideId:it.id}); try{ (overlayOpen() ? doc.body : launch).focus(); }catch(e){} });
    txtBtn.addEventListener('click', ()=>showText(text.hidden));
    pIcon.addEventListener('click', ()=>{ if(panelOpen) closePanel(true); else openPanel(); });
    function busy(){ return pl.matches(':hover') || pl.contains(doc.activeElement); }

    dock.append(panel, welcome, nudgeEl, pl, launch, live);

    function refresh(){
      root.classList.toggle('vjag-on', prefs.enabled);
      launcherLabel();
      if(panelOpen && builtFor!==prefs.enabled) buildPanel();   // language/speed buttons update themselves; keep focus
      doc.querySelectorAll('[data-vjag-tm="toggle"]').forEach(b=>{ b.setAttribute('aria-pressed', String(prefs.enabled)); b.lastChild.textContent = prefs.enabled ? ' Audio Guide ON' : ' Audio Guide'; });
    }
    return {dock, player:renderPlayer, progress, showText, refresh, launcherError, openPanel, closePanel, nudge, hideNudge, hideWelcome, busy,
            showWelcome(){ welcome.hidden = false; }, get panelOpen(){ return panelOpen; }, panel, welcome};
  })();

  /* ================= Hooks into the existing site (additive only) ================= */
  function hereBtn(id, label){
    const b = btn('vjag-here', null, {'data-vjag-here':id, 'aria-label':'What can I do here? Audio guide for '+label});
    const i = h('span', null, '🔊'); i.setAttribute('aria-hidden','true');
    b.append(i, doc.createTextNode(' What can I do here?'));
    return b;
  }
  function decorateSections(){
    SECTIONS.forEach(id=>{
      const head = doc.querySelector('#'+id+' .section-head'); if(!head || head.querySelector('.vjag-here')) return;
      const r = rec(id); if(r) head.append(hereBtn(id, r.title));
    });
  }
  function decorateTouristMode(){
    const panel = doc.getElementById('touristModePanel'); if(!panel || panel.querySelector('.vjag-tm')) return;
    const bar = h('div','vjag-tm');
    const tog = btn('vjag-tm-btn', null, {'data-vjag-tm':'toggle', 'aria-pressed':String(prefs.enabled)});
    const ti = h('span', null, '🔊'); ti.setAttribute('aria-hidden','true');
    tog.append(ti, doc.createTextNode(prefs.enabled ? ' Audio Guide ON' : ' Audio Guide'));
    const gm = btn('vjag-tm-btn', null, {'aria-expanded':'false', 'aria-controls':'vjagTmGm'});
    const gi = h('span', null, '🎙️'); gi.setAttribute('aria-hidden','true');
    gm.append(gi, doc.createTextNode(' Guide Me'));
    const box = h('div','vjag-tm-gm'); box.id = 'vjagTmGm'; box.hidden = true; box.append(guideMeGrid());
    bar.append(tog, gm, hereBtn('tourist-mode', 'Tourist Mode'), box);
    const head = panel.querySelector('.tmp-head');
    if(head) head.after(bar); else panel.prepend(bar);
    tog.addEventListener('click', ()=>setEnabled(!prefs.enabled, 'tourist_mode'));
    gm.addEventListener('click', ()=>{ const o = box.hidden; box.hidden = !o; gm.setAttribute('aria-expanded', String(o)); if(o) track('guide_me_opened', {from:'tourist_mode'}); });
    const tmb = doc.getElementById('touristModeBtn');
    if(tmb) tmb.addEventListener('click', ()=>setTimeout(()=>{ if(isOpen('touristModePanel','open')) entered('tourist-mode'); }, 700));
  }
  function decorateMap(){
    const end = doc.querySelector('#mapView .mv-bar-end'); if(!end || end.querySelector('.vjag-map-btn')) return;
    const b = btn('vjag-map-btn', '🔊', {'data-vjag-here':'map', 'aria-label':'What can I do here? Audio guide for the Smart Tourist Map'});
    end.prepend(b);
  }
  // Place pages: add "Listen to Guide" right before the History Audio slot (kept as two separate controls).
  // With the Audio Guide ON the visitor has already said yes to audio, so there is no button: the place's guide
  // plays by itself when the place is opened (client, 19 Oct 2026). Only after a tap — a place opened from a
  // link on page load stays quiet, because browsers refuse speech without one.
  function userActed(){ const u = navigator.userActivation; return !u || u.hasBeenActive; }
  function patchPlaces(){
    const H = window.JMHistoryAudio; if(!H || H.__vjag) return;
    const orig = H.mount;
    H.mount = function(slot, place){
      try{
        currentPlace = place || null;
        if(prefs.enabled && place && rec(placeClip(place))){
          if(userActed()) setTimeout(()=>{ if(currentPlace===place && isOpen('modalOverlay','open')) request(item(placeClip(place), null, place), {prio:P_USER, force:true}); }, 350);
        }else if(slot && place && slot.parentNode && rec(placeClip(place))){
          const wrap = h('div','vjag-place');
          const b = btn('modal-act', null, {'data-vjag-place':place.id, 'aria-label':'Listen to a short guide to the '+place.name+' page'});
          const i = h('span', null, '🔊'); i.setAttribute('aria-hidden','true');
          b.append(i, doc.createTextNode(' Listen to Guide'));
          wrap.append(b, h('span','vjag-place-note','Short, practical — not the history story'));
          slot.parentNode.insertBefore(wrap, slot);
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    H.__vjag = true;
  }

  doc.addEventListener('click', e=>{
    const t = e.target.closest && e.target.closest('[data-vjag-here],[data-vjag-go],[data-vjag-place]');
    if(!t) return;
    if(t.dataset.vjagGo) guideMe(t.dataset.vjagGo);
    else if(t.dataset.vjagPlace){ const p = places().find(a=>a.id===t.dataset.vjagPlace); if(p) playHere({id:'place', place:p}); }
    else if(t.dataset.vjagHere) playHere({id:t.dataset.vjagHere});
  });
  doc.addEventListener('keydown', e=>{
    if(e.key!=='Escape') return;
    const adm = doc.querySelector('.vjag-admin'); if(adm){ adm.remove(); return; }
    if(UI.panelOpen && UI.panel.contains(doc.activeElement)){ e.stopPropagation(); UI.closePanel(true); }
    else if(!UI.welcome.hidden && UI.welcome.contains(doc.activeElement)){ store.set(K.welcome,'true'); UI.hideWelcome(); }
  }, true);
  doc.addEventListener('click', e=>{              // click outside closes the panel (non-modal)
    const path = e.composedPath ? e.composedPath() : [e.target];
    if(UI.panelOpen && path.indexOf(UI.dock)<0 && !(e.target.closest && e.target.closest('[data-vjag-here]'))) UI.closePanel(false);
  });

  /* light housekeeping loop (no scroll listeners, no layout thrash) */
  let lastOv = false;
  function sync(){
    if(doc.hidden) return;                                      // nothing to keep in step while the tab is in the background
    const ov = overlayOpen();
    root.classList.toggle('vjag-overlay', ov);
    if(ov && !lastOv && UI.panelOpen) UI.closePanel(false);     // a sheet/map just opened over the panel
    lastOv = ov;
    if(!isOpen('modalOverlay','open') && currentPlace){
      currentPlace = null;
      if(S.item && S.item.kind==='place') stop(true);           // the page it described has closed
    }
    decorateMap();
  }

  function init(){
    doc.body.append(UI.dock);
    root.classList.toggle('vjag-on', prefs.enabled);
    UI.refresh();
    decorateSections(); decorateTouristMode(); patchPlaces();
    try{ window.JMHistoryAudio && JMHistoryAudio.setLang && JMHistoryAudio.setLang(prefs.lang); }catch(e){}
    setInterval(sync, 500); sync();
    // First visit only: a small, dismissible offer — never audio.
    if(store.get(K.welcome,'false')!=='true' && !prefs.enabled && !ADMIN){
      setTimeout(function tryShow(){
        if(store.get(K.welcome,'false')==='true' || prefs.enabled) return;
        if(overlayOpen() || UI.panelOpen){ setTimeout(tryShow, 3000); return; }
        UI.showWelcome(); track('audio_guide_welcome_shown');
      }, 4500);
    }
    if(ADMIN) setTimeout(Admin.open, 300);
  }

  /* ================= Content check (?audio-admin) — read-only, for editors ================= */
  const Admin = {
    open(){
      if(doc.querySelector('.vjag-admin')) return;
      const ov = h('div','vjag-admin'); ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-labelledby','vjagAdmT');
      const box = h('div','vjag-admin-box'); ov.append(box);
      const t = h('h2', null, 'Audio Guidance — content check'); t.id = 'vjagAdmT';
      box.append(t, h('p', null, 'Read-only view of the Audio Guidance and History Audio records this page is using, with validation. Uploading, processing (MP3 → web-optimised), publishing and file-security checks belong in the Admin Panel backend; it feeds the same record shapes through AUDIO_GUIDANCE_FEED and HISTORY_AUDIO_FEED.'));
      const all = [...records.values()].sort((a,b)=>a.order-b.order);
      const n = f=>all.filter(f).length;
      const stat = (v, l)=>{ const d = h('div'); d.append(h('b', null, String(v)), h('span', null, l)); return d; };
      const st = h('div','vjag-stats');
      st.append(stat(all.length,'Total guides'), stat(n(r=>r.published),'Published'), stat(n(r=>!r.published),'Draft'),
        stat(n(r=>r.language.hi && r.language.hi.text),'Hindi'), stat(n(r=>r.language.en && r.language.en.text),'English'),
        stat(n(r=>r.sourceType==='tts'),'TTS-enabled'), stat(n(r=>r.sourceType==='file' && !Object.keys(r.language).some(l=>r.language[l].audioUrl)),'Missing audio'),
        stat(n(r=>(problems.get(r.id)||[]).length),'With issues'));
      box.append(st, h('h3', null, 'Audio Guidance'));
      const tw = h('div','vjag-tablewrap'), tb = h('table','vjag-table');
      const hr = h('tr'); ['Title','Section','Trigger','Source','Preview','Status','Checks'].forEach(x=>hr.append(h('th', null, x)));
      const thead = h('thead'); thead.append(hr); tb.append(thead);
      const body = h('tbody');
      all.forEach(r=>{
        const tr = h('tr'), pv = h('td');
        Object.keys(LANGS).forEach(l=>{ if(r.language[l] && r.language[l].text){ const b = btn('', '▶ '+l.toUpperCase()); b.addEventListener('click', ()=>{ const pl = places()[0]; request(r.id==='place' ? item('place', l, pl) : /^place-/.test(r.id) ? item(r.id, l, places().find(a=>'place-'+a.id===r.id) || pl) : item(r.id, l), {prio:P_USER, force:true}); }); pv.append(b); } });
        const issues = problems.get(r.id) || [], ck = h('td', issues.length ? 'bad' : 'ok', issues.length ? issues.join(' · ') : 'OK');
        tr.append(h('td', null, r.title), h('td', null, r.section), h('td', null, r.triggerType), h('td', null, r.sourceType), pv,
                  h('td', null, (r.enabled ? '' : 'Inactive · ')+(r.published ? 'Published' : 'Draft')), ck);
        body.append(tr);
      });
      tb.append(body); tw.append(tb); box.append(tw);

      const hist = (typeof HISTORY_AUDIO!=='undefined' && Array.isArray(HISTORY_AUDIO)) ? HISTORY_AUDIO : [];
      box.append(h('h3', null, 'Audio Stories / History Guide ('+hist.length+')'),
                 h('p', null, 'Unpublished stories are read aloud by the device voice from the approved place text until their recording is published. Add Hindi as extra records with language:"hi" — the language switch appears on its own.'));
      const tw2 = h('div','vjag-tablewrap'), t2 = h('table','vjag-table'), h2r = h('tr');
      ['Place','Title','Language','Audio file','Transcript','Status'].forEach(x=>h2r.append(h('th', null, x)));
      const th2 = h('thead'); th2.append(h2r); t2.append(th2);
      const b2 = h('tbody');
      hist.forEach(r=>{
        const p = places().find(a=>a.id===r.attractionId), tr = h('tr');
        tr.append(h('td', p ? null : 'bad', p ? p.name : 'Unknown place: '+r.attractionId), h('td', r.title ? null : 'bad', r.title || 'Title missing'),
          h('td', null, r.language), h('td', null, r.audioUrl || '—'), h('td', r.transcript ? 'ok' : null, r.transcript ? 'Yes' : 'No'),
          h('td', r.published ? 'ok' : null, r.published ? 'Published' : 'Draft (voice fallback)'));
        b2.append(tr);
      });
      t2.append(b2); tw2.append(t2); box.append(tw2);

      const act = h('div','vjag-admin-actions'), cp = btn('', 'Copy guidance JSON'), cl = btn('ghost', 'Close');
      cp.addEventListener('click', ()=>{
        const json = JSON.stringify({records:all.map(r=>({id:r.id,title:r.title,page:r.page,section:r.section,triggerType:r.triggerType,sourceType:r.sourceType,
          language:r.language,duration:r.duration,fileSize:r.fileSize,enabled:r.enabled,published:r.published,order:r.order}))}, null, 2);
        const done = ()=>{ cp.textContent = 'Copied'; setTimeout(()=>cp.textContent = 'Copy guidance JSON', 1600); };
        if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(json).then(done, ()=>{});
      });
      cl.addEventListener('click', ()=>{ ov.remove(); });
      act.append(cp, cl); box.append(act);
      doc.body.append(ov); try{ cl.focus(); }catch(e){}
    }
  };

  if(doc.readyState==='loading') doc.addEventListener('DOMContentLoaded', init); else init();

  return {
    load(list){ const n = load(list); UI.refresh(); decorateSections(); return n; },
    enable:()=>setEnabled(true,'api'), disable:()=>setEnabled(false,'api'),
    play:(id, lang)=>request(item(id, lang), {prio:P_USER, force:true}),
    here:()=>playHere(), pause, resume, stop:()=>stop(true), setLanguage:l=>setLang(l), setSpeed,
    guideMe, prefs:()=>Object.assign({}, prefs), state:()=>({state:S.state, id:S.item && S.item.id, mode:S.mode, priority:S.prio}),
    validate:()=>{ const out = {}; problems.forEach((v,k)=>{ if(v.length) out[k] = v.slice(); }); return out; },
    admin:()=>Admin.open()
  };
})();
window.JMAudioGuide = JMAudioGuide;

/* Desert atmosphere: the sunlight drifts slowly as you scroll (one CSS variable, transform/opacity only). */
(function(){
  const atm = document.querySelector('.vj-atmosphere'); if(!atm) return;
  const conn = navigator.connection;
  if((conn && conn.saveData) || (navigator.hardwareConcurrency || 4) <= 2) return;   // very low-power devices keep the static light
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0;
  function paint(){
    raf = 0;
    if(still.matches){ atm.style.removeProperty('--vj-p'); return; }
    const max = document.documentElement.scrollHeight - innerHeight;
    atm.style.setProperty('--vj-p', max > 0 ? Math.min(1, Math.max(0, scrollY / max)).toFixed(4) : '0');
  }
  const queue = ()=>{ if(!raf) raf = requestAnimationFrame(paint); };
  addEventListener('scroll', queue, {passive:true});
  addEventListener('resize', queue, {passive:true});
  queue();
})();
