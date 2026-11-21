/* One-off (31 Oct 2026), live data. Dry run by default; --apply writes, in one commit refused if anything changed since read.
   - landmarks: Parking / Toilet / ATM pins the client filed under whatever category was at hand (ATM under services or
     shopping, toilets under services, parking under services or essential) with the spot's name typed into Sub-category.
     Each is re-filed as the pair the map uses — transport/Parking, essential/Toilet, essential/ATM — so it shows under
     the right map filter (and a car park as a blue P). Name, pin and everything else stay as they are.
   Needs the Firebase CLI logged in as jaisalmervisitin@gmail.com (scripts/firebase-token.cjs).
     node scripts/fix-round11-data.mjs           # dry run
     node scripts/fix-round11-data.mjs --apply   # write
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
const WHO = { stringValue: 'jaisalmervisitin@gmail.com' }, S = v => ({ stringValue: v });
const stamp = [{ fieldPath: '_updatedAt', setToServerValue: 'REQUEST_TIME' }, { fieldPath: '_publishedAt', setToServerValue: 'REQUEST_TIME' }];
const str = f => (f && f.stringValue) || '';

// Name or sub-category says what it is. Parking first ("Patwa Haweli Parking" sits under essential today).
function kind(f) {
  const t = str(f.name) + ' | ' + str(f.subcategory);
  if (/\bparking\b/i.test(t)) return ['transport', 'Parking'];
  if (/\btoilets?\b/i.test(t)) return ['essential', 'Toilet'];
  if (/\batm\b/i.test(t)) return ['essential', 'ATM'];
  return null;
}

const pub = await api(DB + '/published/landmarks'), items = pub.fields.items.arrayValue.values;
const writes = [];
let changed = 0;
for (const it of items) {
  const f = it.mapValue.fields, k = kind(f);
  if (!k || (str(f.category) === k[0] && str(f.subcategory) === k[1])) continue;
  const uid = str(f._uid), d = await api(DB + '/landmarks/' + uid);
  if (str(d.fields.category) !== str(f.category) || str(d.fields.subcategory) !== str(f.subcategory))
    throw new Error(uid + ' has unpublished edits — publish or discard them in the admin first');
  console.log(str(f.id).padEnd(26), str(f.name).padEnd(28), str(f.category) + ' / ' + str(f.subcategory), '→', k.join(' / '));
  writes.push({ update: { name: d.name, fields: { category: S(k[0]), subcategory: S(k[1]), _updatedBy: WHO } },
    updateMask: { fieldPaths: ['category', 'subcategory', '_updatedBy'] }, currentDocument: { updateTime: d.updateTime }, updateTransforms: stamp });
  f.category = S(k[0]); f.subcategory = S(k[1]); changed++;
}
if (!changed) { console.log('Nothing to change.'); process.exit(0); }
writes.push({ update: { name: pub.name, fields: { items: { arrayValue: { values: items } }, count: { integerValue: String(items.length) }, publishedBy: WHO } },
  updateMask: { fieldPaths: ['items', 'count', 'publishedBy'] }, currentDocument: { updateTime: pub.updateTime },
  updateTransforms: [{ fieldPath: 'publishedAt', setToServerValue: 'REQUEST_TIME' }] });

if (!apply) { console.log(changed + ' landmarks, ' + writes.length + ' writes. Dry run — add --apply to write.'); process.exit(0); }
const r = await api(DB + ':commit', { writes });
console.log('Committed', r.commitTime);
