/* One-off (31 Oct 2026), live data. Dry run by default; --apply writes, in one commit refused if anything changed since read.
   - places/r6d (Suli Dungar, id sulidungri): no pin, so its sheet offered "Find on Google Maps" while every other place opens
     the Smart Map. Pin = OpenStreetMap viewpoint node 2803462735 "Sunset point" (Dedansar Road), 26.91979, 70.91099:
     230 m from "Cafe The Kaku" (OSM node 4513393692), whose listings give its address as "Sun Set Point, Suli Dungar";
     the other OSM "Sunset Point" (node 7357196025, 500 m west) is beside the client's Vyas Chhatri pin. Not checked on the
     ground — the client can move it with Places → Pick on map.
     node scripts/fix-round12-data.mjs           # dry run
     node scripts/fix-round12-data.mjs --apply   # write
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
const WHO = { stringValue: 'jaisalmervisitin@gmail.com' }, D = v => ({ doubleValue: v });
const UID = 'r6d', ID = 'sulidungri', LAT = 26.91979, LNG = 70.91099;
const stamp = [{ fieldPath: '_updatedAt', setToServerValue: 'REQUEST_TIME' }, { fieldPath: '_publishedAt', setToServerValue: 'REQUEST_TIME' }];

const d = await api(DB + '/places/' + UID);
if (d.fields.id.stringValue !== ID) throw new Error(UID + ' is ' + d.fields.id.stringValue);
if (d.fields.lat && (d.fields.lat.doubleValue ?? d.fields.lat.integerValue) != null && !('nullValue' in d.fields.lat))
  throw new Error(UID + ' already has a pin: ' + JSON.stringify(d.fields.lat) + ' — leaving it');
const pub = await api(DB + '/published/places'), items = pub.fields.items.arrayValue.values;
const it = items.find(x => x.mapValue.fields._uid.stringValue === UID); if (!it) throw new Error('published ' + UID + ' missing');
it.mapValue.fields.lat = D(LAT); it.mapValue.fields.lng = D(LNG);
console.log('places/' + UID, ID + ': no pin →', LAT, LNG);
const writes = [
  { update: { name: d.name, fields: { lat: D(LAT), lng: D(LNG), _updatedBy: WHO } }, updateMask: { fieldPaths: ['lat', 'lng', '_updatedBy'] }, currentDocument: { updateTime: d.updateTime }, updateTransforms: stamp },
  { update: { name: pub.name, fields: { items: { arrayValue: { values: items } }, count: { integerValue: String(items.length) }, publishedBy: WHO } },
    updateMask: { fieldPaths: ['items', 'count', 'publishedBy'] }, currentDocument: { updateTime: pub.updateTime }, updateTransforms: [{ fieldPath: 'publishedAt', setToServerValue: 'REQUEST_TIME' }] }];
if (!apply) { console.log(writes.length + ' writes. Dry run — add --apply to write.'); process.exit(0); }
const r = await api(DB + ':commit', { writes });
console.log('Committed', r.commitTime);
