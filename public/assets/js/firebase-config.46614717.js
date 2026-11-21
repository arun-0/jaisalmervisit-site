/* Firebase web config, shared by the website and the admin (plain script → window.VJ_FIREBASE).
   These values identify the project; they are not secrets. Access is enforced by
   firestore.rules / storage.rules, and the API key is restricted to the site's domains.
   On localhost the pages talk to the local emulators instead (firebase emulators:start). */
window.VJ_FIREBASE = (function(){
  var FIREBASE_CONFIG = {
    apiKey: 'AIzaSyCtINRYT2LJ7JxXFcw16NUTcCut92GGo1M',
    authDomain: 'visitjaisalmer-e3085.firebaseapp.com',
    projectId: 'visitjaisalmer-e3085',
    storageBucket: 'visitjaisalmer-e3085.firebasestorage.app',   // Cloud Storage (Blaze plan): admin uploads of images and audio
    messagingSenderId: '1090541521403',
    appId: '1:1090541521403:web:ba99657fc3c0abcc88235e',
    measurementId: 'G-5JKDNM7XMB'
  };
  // Local pages use the emulators; add ?prod-data to a local URL to read the live database instead.
  var USE_EMULATORS = ['localhost', '127.0.0.1'].indexOf(location.hostname) !== -1 && !/[?&]prod-data(?:[=&]|$)/.test(location.search);
  return {
    FIREBASE_CONFIG: FIREBASE_CONFIG,
    FIREBASE_SDK: 'https://www.gstatic.com/firebasejs/12.19.0',
    USE_EMULATORS: USE_EMULATORS,
    EMULATORS: { auth: 'http://127.0.0.1:9099', firestore: ['127.0.0.1', 8080], storage: ['127.0.0.1', 9199] },
    /* Bucket used for uploads: the real one, or a stand-in on the local Storage emulator. */
    STORAGE_BUCKET: FIREBASE_CONFIG.storageBucket || (USE_EMULATORS ? FIREBASE_CONFIG.projectId + '.appspot.com' : ''),
    /* Admin datasets (one Firestore collection each). The website reads the published
       snapshot of each one from published/{key}. Keep in sync with firestore.rules. */
    CONTENT_KEYS: ['places', 'landmarks', 'activities', 'transport', 'operators', 'experiences',
      'sponsors', 'houseAds', 'partners', 'historyAudio', 'guidance', 'settings', 'announcements', 'itineraries']
  };
})();
