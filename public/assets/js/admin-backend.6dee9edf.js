/* Jaisalmer Visit admin — Firebase adapter (Auth + Firestore + Storage).

   Data model
     {dataset}/{_uid}      working copy of one record (admins only). Record fields plus
                           _pos (list order), _published, _publishedAt, _updatedAt, _updatedBy.
                           (Underscored: some records already have their own `published` /
                           `updatedAt` fields, e.g. history audio "play the recording".)
     published/{dataset}   what the website shows: {items:[…records], count, publishedAt, publishedBy}.
                           Public read. One document per dataset keeps a page load to ~13 reads,
                           which matters on the free plan (50k reads/day).
     admins/{email}        presence = this Google account may use the admin.

   Saving changes only the working copy (a draft). Publishing copies records into
   published/{dataset} in the same transaction, so the site never sees half a publish. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, connectAuthEmulator, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut as fbSignOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { initializeFirestore, connectFirestoreEmulator, collection, doc, getDoc, setDoc, onSnapshot, runTransaction, serverTimestamp, query, orderBy, limit, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
// Config comes from firebase-config.js, loaded as a plain script before this module.
const { FIREBASE_CONFIG, FIREBASE_SDK, USE_EMULATORS, EMULATORS, STORAGE_BUCKET } = window.VJ_FIREBASE;

const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
if (USE_EMULATORS) {
  connectAuthEmulator(auth, EMULATORS.auth, { disableWarnings: true });
  connectFirestoreEmulator(db, ...EMULATORS.firestore);
}

export const META_KEYS = ['_pos', '_published', '_publishedAt', '_updatedAt', '_updatedBy'];
export const canUpload = !!STORAGE_BUCKET;
export const usingEmulators = USE_EMULATORS;

/* ---------- auth ---------- */
let user = null;
/** cb({state:'signedOut'|'notAdmin'|'admin', email}) */
export function onAuth(cb) {
  getRedirectResult(auth).catch(() => {});
  return onAuthStateChanged(auth, async u => {
    user = u;
    if (!u) return cb({ state: 'signedOut' });
    const email = (u.email || '').toLowerCase();
    let admin = false;
    try { admin = u.emailVerified && (await getDoc(doc(db, 'admins', email))).exists(); } catch (e) { admin = false; }
    cb({ state: admin ? 'admin' : 'notAdmin', email });
  });
}
export async function signIn() {
  const p = new GoogleAuthProvider();
  p.setCustomParameters({ prompt: 'select_account' });
  try { await signInWithPopup(auth, p); }
  catch (e) {
    if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) return signInWithRedirect(auth, p);
    if (e && (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request')) return;
    throw e;
  }
}
export const signOut = () => fbSignOut(auth);

/* ---------- reading ---------- */
const meta = {};   // meta[k][uid] = {publishedAt}
const tsIso = v => v && typeof v.toDate === 'function' ? v.toDate().toISOString() : (v || null);
export function stripMeta(r) { const o = {}; Object.keys(r).forEach(k => { if (!META_KEYS.includes(k)) o[k] = r[k]; }); return o; }

/** Live-subscribes every dataset. onData(k, records|null, savedAtIso) — null = collection empty.
    onLive(k, items|null, publishedAtIso). onError(err). Returns unsubscribe. */
export function watch(keys, { onData, onLive, onError }) {
  const unsubs = keys.map(k => onSnapshot(collection(db, k), snap => {
    const rows = snap.docs.map(d => d.data());
    meta[k] = {};
    let last = null;
    rows.forEach(r => {
      meta[k][r._uid] = { publishedAt: r._publishedAt || null };
      const u = tsIso(r._updatedAt); if (u && (!last || u > last)) last = u;
    });
    rows.sort((a, b) => (a._pos ?? 1e9) - (b._pos ?? 1e9));
    onData(k, rows.length ? rows.map(stripMeta) : null, last);
  }, onError));
  unsubs.push(onSnapshot(collection(db, 'published'), snap => {
    const seen = new Set();
    snap.docs.forEach(d => { seen.add(d.id); const v = d.data(); onLive(d.id, Array.isArray(v.items) ? v.items : [], tsIso(v.publishedAt)); });
    keys.forEach(k => { if (!seen.has(k)) onLive(k, null, null); });
  }, onError));
  return () => unsubs.forEach(u => u());
}

/* ---------- writing ---------- */
/** One atomic change to a dataset.
    current:   the full working list in display order, after the change (content only)
    upserts:   uids in `current` whose working copy should be written
    removes:   uids to delete (working copy and live copy)
    drops:     uids whose working copy is deleted but stays live until the next publish
    publish:   uids whose current content goes live
    unpublish: uids taken off the site (working copy kept as a draft) */
export async function commit(k, { current, upserts = [], removes = [], drops = [], publish = [], unpublish = [] }) {
  const by = new Map(current.map((r, i) => [r._uid, { r, i }]));
  const who = user && user.email ? user.email.toLowerCase() : null;
  const liveRef = doc(db, 'published', k);
  const pub = new Set(publish), unpub = new Set([...unpublish, ...removes]);
  return runTransaction(db, async tx => {
    const snap = await tx.get(liveRef);
    const had = snap.exists() ? (snap.data().items || []) : null;
    const live = new Map((had || []).map(r => [r._uid, r]));
    let liveChanged = false;
    pub.forEach(uid => { const x = by.get(uid); if (x) { live.set(uid, x.r); liveChanged = true; } });
    unpub.forEach(uid => { if (live.delete(uid)) liveChanged = true; });

    const now = serverTimestamp(), touched = new Set();
    upserts.forEach(uid => {
      const x = by.get(uid); if (!x) return;
      const m = (meta[k] && meta[k][uid]) || {};
      tx.set(doc(db, k, uid), Object.assign({}, x.r, {
        _uid: uid, _pos: x.i, _updatedAt: now, _updatedBy: who,
        _published: live.has(uid), _publishedAt: pub.has(uid) ? now : (live.has(uid) ? m.publishedAt || null : null),
      }));
      touched.add(uid);
    });
    pub.forEach(uid => { if (!touched.has(uid) && by.has(uid)) tx.update(doc(db, k, uid), { _published: true, _publishedAt: now }); });
    unpublish.forEach(uid => { if (!touched.has(uid) && by.has(uid)) tx.update(doc(db, k, uid), { _published: false, _publishedAt: null }); });
    removes.concat(drops).forEach(uid => tx.delete(doc(db, k, uid)));

    if (liveChanged) {
      const order = current.map(r => r._uid).filter(uid => live.has(uid));
      (had || []).forEach(r => { if (live.has(r._uid) && !order.includes(r._uid)) order.push(r._uid); });
      const items = order.map(uid => live.get(uid));
      tx.set(liveRef, { items, count: items.length, publishedAt: now, publishedBy: who });
    }
  });
}

/* ---------- inbox: Add Your Service submissions and newsletter signups ---------- */
/** cb(rows) with rows newest first; each row has its doc id as `id` and createdAt as an ISO string. */
export function watchInbox(coll, cb, onError, max = 500) {
  return onSnapshot(query(collection(db, coll), orderBy('createdAt', 'desc'), limit(max)),
    snap => cb(snap.docs.map(d => Object.assign({}, d.data(), { id: d.id, createdAt: tsIso(d.data().createdAt), reviewedAt: tsIso(d.data().reviewedAt) }))),
    onError);
}
export function reviewSubmission(id, status, listing) {
  return updateDoc(doc(db, 'serviceSubmissions', id), { status, reviewedAt: serverTimestamp(), reviewedBy: user && user.email ? user.email.toLowerCase() : null, listing: listing || null });
}
export const deleteInboxItem = (coll, id) => deleteDoc(doc(db, coll, id));

/* ---------- visitor reviews ----------
   reviews/{id}       one visitor review, status pending | approved | rejected (moderated here)
   published/reviews  {items:[{key:'transport:<id>', type, id, name, avg, count, recent:[…]}]} — what the site reads */
export function setReviewStatus(id, status) {
  return updateDoc(doc(db, 'reviews', id), { status, reviewedAt: serverTimestamp(), reviewedBy: user && user.email ? user.email.toLowerCase() : null });
}
export function publishReviews(items) {
  return setDoc(doc(db, 'published', 'reviews'), { items, count: items.length, publishedAt: serverTimestamp(), publishedBy: user && user.email ? user.email.toLowerCase() : null });
}

/* ---------- uploads ---------- */
let storageMod = null, storage = null;
const TYPE_BY_EXT = {
  audio: { mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', ogg: 'audio/ogg', oga: 'audio/ogg', opus: 'audio/ogg', wav: 'audio/wav', webm: 'audio/webm' },
  image: { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', svg: 'image/svg+xml', gif: 'image/gif' }
};
/** kind: 'image' | 'audio'. Returns the public download URL. */
export async function upload(file, kind, k, uid) {
  if (!canUpload) throw new Error('Storage is not set up for this project.');
  const limits = { image: [/^image\//, 5], audio: [/^audio\//, 30] }[kind];
  // Some Windows PCs report no type (or a video/ one) for .mp3 / .m4a files: go by the extension then.
  const type = limits[0].test(file.type) ? file.type : (TYPE_BY_EXT[kind][(file.name.split('.').pop() || '').toLowerCase()] || file.type);
  if (!limits[0].test(type)) throw new Error(kind === 'image' ? 'Choose an image file (JPG, PNG, WebP, SVG).' : 'Choose an audio file (MP3, M4A, OGG, WAV).');
  if (file.size > limits[1] * 1024 * 1024) throw new Error('File is larger than ' + limits[1] + ' MB.');
  if (!storageMod) {
    storageMod = await import(FIREBASE_SDK + '/firebase-storage.js');
    storage = storageMod.getStorage(app, 'gs://' + STORAGE_BUCKET);
    if (USE_EMULATORS) storageMod.connectStorageEmulator(storage, ...EMULATORS.storage);
  }
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '').slice(-60) || 'file';
  const path = (kind === 'audio' ? 'audio' : 'images') + '/' + k + '/' + uid + '/' + Date.now() + '-' + safe;
  const r = storageMod.ref(storage, path);
  await storageMod.uploadBytes(r, file, { contentType: type, cacheControl: 'public, max-age=31536000, immutable' });
  return storageMod.getDownloadURL(r);
}
