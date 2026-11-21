/* One-off (28 Oct 2026), live data. Dry run by default; --apply writes, in one commit refused if anything changed since read.
   - places: Patwon / Nathmal pins → the client's own on-site pins (Map landmarks), Salim Singh → OSM node 353703044
   - landmarks: delete the client's duplicate "Patwon Ki Haweli" / "Nathmal Ki Haweli" attraction pins (the places now sit there)
   - settings: Smart ads on, only the in-story card; the popup placements off
   APPLIED 28 Oct 2026 (commit 2026-10-27T23:53:19Z). Re-running refuses: the two landmarks are already deleted.
     node scripts/fix-round10-data.mjs           # dry run
     node scripts/fix-round10-data.mjs --apply   # write
*/
import { execFileSync } from 'node:child_process';
const apply = process.argv.includes('--apply');
const root = new URL('..', import.meta.url).pathname;
const token = execFileSync('node', [root + 'scripts/firebase-token.cjs'], { encoding: 'utf8' }).trim();
const DB = 'projects/visitjaisalmer-e3085/databases/(default)/documents';
const API = 'https://firestore.googleapis.com/v1/';
const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'x-goog-user-project': 'visitjaisalmer-e3085' };
async function api(path, body) {
  const r = await fetch(API + path, body ? { method: 'POST', headers, body: JSON.stringify(body) } : { headers });
  const j = await r.json(); if (!r.ok) throw new Error(path + ': ' + JSON.stringify(j.error || j)); return j;
}
const WHO = { stringValue: 'jaisalmervisitin@gmail.com' }, D = v => ({ doubleValue: v }), B = v => ({ booleanValue: v });
const PLACES = { r2d: ['patwon', 26.916325, 70.914331], r4d: ['nathmal', 26.915823, 70.912593], r3d: ['salim', 26.91368, 70.91602] };
const DROP = { rmvmfs4mcgr8no: 'patwon-ki-haweli', rmvmg88ampf7b5: 'nathmal-ki-haweli' };
const ADS = { adsEnabled: true, adDuringHistoryAudio: true, adPlaceExploration: false, adMapLocation: false, adItinerary: false, adHistoryAudio: false };
const writes = [], stamp = [{ fieldPath: '_updatedAt', setToServerValue: 'REQUEST_TIME' }, { fieldPath: '_publishedAt', setToServerValue: 'REQUEST_TIME' }];
const pubSet = (pub, items) => ({ update: { name: pub.name, fields: { items: { arrayValue: { values: items } }, count: { integerValue: String(items.length) }, publishedBy: WHO } },
  updateMask: { fieldPaths: ['items', 'count', 'publishedBy'] }, currentDocument: { updateTime: pub.updateTime }, updateTransforms: [{ fieldPath: 'publishedAt', setToServerValue: 'REQUEST_TIME' }] });

// places
let pub = await api(DB + '/published/places'), items = pub.fields.items.arrayValue.values;
for (const [uid, [id, lat, lng]] of Object.entries(PLACES)) {
  const d = await api(DB + '/places/' + uid);
  if (d.fields.id.stringValue !== id) throw new Error(uid + ' is ' + d.fields.id.stringValue);
  console.log('places/' + uid, id + ':', d.fields.lat.doubleValue ?? d.fields.lat.integerValue, d.fields.lng.doubleValue ?? d.fields.lng.integerValue, '→', lat, lng);
  writes.push({ update: { name: d.name, fields: { lat: D(lat), lng: D(lng), _updatedBy: WHO } }, updateMask: { fieldPaths: ['lat', 'lng', '_updatedBy'] }, currentDocument: { updateTime: d.updateTime }, updateTransforms: stamp });
  const it = items.find(x => x.mapValue.fields._uid.stringValue === uid); if (!it) throw new Error('published ' + uid + ' missing');
  it.mapValue.fields.lat = D(lat); it.mapValue.fields.lng = D(lng);
}
writes.push(pubSet(pub, items));

// landmarks
pub = await api(DB + '/published/landmarks'); items = pub.fields.items.arrayValue.values;
for (const [uid, id] of Object.entries(DROP)) {
  const d = await api(DB + '/landmarks/' + uid);
  if (d.fields.id.stringValue !== id) throw new Error(uid + ' is ' + d.fields.id.stringValue);
  console.log('landmarks/' + uid, id, 'deleted (was', d.fields.lat.doubleValue, d.fields.lng.doubleValue + ')');
  writes.push({ delete: d.name, currentDocument: { updateTime: d.updateTime } });
}
const kept = items.filter(x => !DROP[x.mapValue.fields._uid.stringValue]);
if (kept.length !== items.length - 2) throw new Error('published landmarks: expected to drop 2');
console.log('published/landmarks:', items.length, '→', kept.length);
writes.push(pubSet(pub, kept));

// settings
pub = await api(DB + '/published/settings'); items = pub.fields.items.arrayValue.values;
const sf = items[0].mapValue.fields, suid = sf._uid.stringValue, sd = await api(DB + '/settings/' + suid);
console.log('settings/' + suid + ':', Object.entries(ADS).map(([k, v]) => k + ' ' + (sf[k]?.booleanValue) + '→' + v).join(', '));
for (const [k, v] of Object.entries(ADS)) sf[k] = B(v);
writes.push({ update: { name: sd.name, fields: { ...Object.fromEntries(Object.entries(ADS).map(([k, v]) => [k, B(v)])), _updatedBy: WHO } },
  updateMask: { fieldPaths: [...Object.keys(ADS), '_updatedBy'] }, currentDocument: { updateTime: sd.updateTime }, updateTransforms: stamp });
writes.push(pubSet(pub, items));

if (!apply) { console.log(writes.length + ' writes. Dry run — add --apply to write.'); process.exit(0); }
const r = await api(DB + ':commit', { writes });
console.log('Committed', r.commitTime);
