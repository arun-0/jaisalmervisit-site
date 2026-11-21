/* One-off (5 Nov 2026), live data for round 15. Dry run by default; --apply writes the working copies and the published
   lists in one commit, refused if any of them changed since read.
   - guidance: the client's clip “explore-1” (rmw06m3amk0ejx: “Here Explore Jaisalmer fort with story…”) never played —
     the site only plays clips with its own IDs. It becomes Jaisalmer Fort's own clip, ID “place-fort” (played when the
     Fort opens, instead of the shared “About this place”).
   - guidance: “explore” (r1bd, the Explore Jaisalmer section clip) was deleted, so that section has no clip. Put back with
     the built-in text (taken from the admin's DEFAULTS). Skipped if a clip with ID “explore” exists again.
   - partners (Best Choice strip): the 5 real businesses the client typed over demo entries get the new categories
     (Restaurants / Fast Food / Desert Camps) and lose the “Demo entry” tick.
   APPLIED 5 Nov 2026 (commit 2026-11-05T00:12:49Z, 9 writes). Re-running finds nothing to change.
   Needs the Firebase CLI logged in as jaisalmervisitin@gmail.com (scripts/firebase-token.cjs).
     node scripts/fix-round15-data.mjs           # dry run
     node scripts/fix-round15-data.mjs --apply   # write
*/
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
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
const S = v => ({ stringValue: v }), WHO = S('jaisalmervisitin@gmail.com');
const str = f => (f && f.stringValue) || '';
const stamp = [{ fieldPath: '_updatedAt', setToServerValue: 'REQUEST_TIME' }, { fieldPath: '_publishedAt', setToServerValue: 'REQUEST_TIME' }];
function fs(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(fs) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fs(x)])) } };
}
// Firestore returns map keys in any order, so compare with keys sorted.
const canon = x => Array.isArray(x) ? x.map(canon) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k => [k, canon(x[k])])) : x;
const same = (a, b) => JSON.stringify(canon(a ?? null)) === JSON.stringify(canon(b ?? null));
const writes = [];
function publishWrite(pub, items) {
  writes.push({ update: { name: pub.name, fields: { items: { arrayValue: { values: items } }, count: { integerValue: String(items.length) }, publishedBy: WHO } },
    updateMask: { fieldPaths: ['items', 'count', 'publishedBy'] }, currentDocument: { updateTime: pub.updateTime },
    updateTransforms: [{ fieldPath: 'publishedAt', setToServerValue: 'REQUEST_TIME' }] });
}

/* ---------- guidance ---------- */
{
  const pub = await api(DB + '/published/guidance'), items = pub.fields.items.arrayValue.values.slice();
  const all = (await api(DB + '/guidance?pageSize=300')).documents || [];
  const ids = new Set(all.map(d => str(d.fields.id)).concat(items.map(x => str(x.mapValue.fields.id))));
  let changed = false;

  // explore-1 → place-fort
  const UID = 'rmw06m3amk0ejx';
  const i = items.findIndex(x => str(x.mapValue.fields._uid) === UID);
  const wc = all.find(d => d.name.endsWith('/guidance/' + UID));
  if (i < 0 || !wc || str(items[i].mapValue.fields.id) !== 'explore-1') console.log('guidance ' + UID + ': not “explore-1” any more — skipped');
  else if (ids.has('place-fort')) throw new Error('a clip “place-fort” already exists — sort it out in the admin');
  else {
    if (!same(wc.fields.language, items[i].mapValue.fields.language) || str(wc.fields.id) !== 'explore-1')
      throw new Error(UID + ' has unpublished edits — publish or discard them in the admin first');
    const set = { id: S('place-fort'), title: S('Jaisalmer Fort'), page: S('place'), section: S('place'), triggerType: S('place-open') };
    console.log('guidance ' + UID + ': id explore-1 → place-fort (Jaisalmer Fort’s own clip), title “' + str(wc.fields.title) + '” → “Jaisalmer Fort”');
    writes.push({ update: { name: wc.name, fields: { ...set, _updatedBy: WHO } }, updateMask: { fieldPaths: [...Object.keys(set), '_updatedBy'] },
      currentDocument: { updateTime: wc.updateTime }, updateTransforms: stamp });
    items[i] = { mapValue: { fields: { ...items[i].mapValue.fields, ...set } } };
    changed = true;
  }

  // explore back from the built-in defaults
  if (ids.has('explore')) console.log('guidance: a clip “explore” exists — not restored');
  else {
    const html = readFileSync(root + 'public/admin/index.html', 'utf8');
    const D = JSON.parse(html.match(/const DEFAULTS = (\{.*?\});\n/s)[1]);
    const rec = D.guidance.find(r => r.id === 'explore'); if (!rec) throw new Error('no built-in explore clip');
    if (all.some(d => d.name.endsWith('/guidance/' + rec._uid))) throw new Error('guidance/' + rec._uid + ' exists with another ID');
    delete rec.published;
    const pos = Math.max(0, ...all.map(d => +(d.fields._pos?.integerValue ?? 0))) + 1;
    console.log('guidance ' + rec._uid + ': “explore” (Explore Jaisalmer section) put back — hi: ' + rec.language.hi.text.slice(0, 50) + '…');
    writes.push({ update: { name: DB + '/guidance/' + rec._uid, fields: { ...fs(rec).mapValue.fields, _pos: { integerValue: String(pos) }, _published: { booleanValue: true }, _updatedBy: WHO } },
      currentDocument: { exists: false }, updateTransforms: stamp });
    const at = items.findIndex(x => str(x.mapValue.fields.id) === 'home');
    items.splice(at < 0 ? items.length : at + 1, 0, fs(rec));
    changed = true;
  }
  if (changed) publishWrite(pub, items);
}

/* ---------- partners (Best Choice) ---------- */
{
  const CAT = { r1sd: 'Restaurants', r1td: 'Restaurants', r1ud: 'Fast Food', r1vd: 'Desert Camps', r1xd: 'Desert Camps' };
  const NAME = { r1sd: /pol haveli/i, r1td: /shahi palace/i, r1ud: /baba fast food/i, r1vd: /david desert camp/i, r1xd: /kohinoor desert camp/i };
  const pub = await api(DB + '/published/partners'), items = pub.fields.items.arrayValue.values.slice();
  let n = 0;
  for (const [uid, cat] of Object.entries(CAT)) {
    const i = items.findIndex(x => str(x.mapValue.fields._uid) === uid);
    if (i < 0) { console.log('partners ' + uid + ': not published — skipped'); continue; }
    const f = items[i].mapValue.fields;
    if (!NAME[uid].test(str(f.name))) { console.log('partners ' + uid + ': now “' + str(f.name) + '” — skipped'); continue; }
    if (str(f.category) === cat && f.placeholder?.booleanValue !== true) continue;
    const wc = await api(DB + '/partners/' + uid);
    if (str(wc.fields.category) !== str(f.category) || !same(wc.fields.placeholder, f.placeholder) || str(wc.fields.name) !== str(f.name))
      throw new Error(uid + ' has unpublished edits — publish or discard them in the admin first');
    console.log('partners ' + uid + ': ' + str(f.name).padEnd(36) + str(f.category) + ' → ' + cat + (f.placeholder?.booleanValue ? ', Demo entry off' : ''));
    const set = { category: S(cat), placeholder: { booleanValue: false } };
    writes.push({ update: { name: wc.name, fields: { ...set, _updatedBy: WHO } }, updateMask: { fieldPaths: ['category', 'placeholder', '_updatedBy'] },
      currentDocument: { updateTime: wc.updateTime }, updateTransforms: stamp });
    items[i] = { mapValue: { fields: { ...f, ...set } } };
    n++;
  }
  if (n) publishWrite(pub, items);
}

if (!writes.length) { console.log('Nothing to change.'); process.exit(0); }
if (!apply) { console.log(writes.length + ' writes. Dry run — add --apply to write.'); process.exit(0); }
const r = await api(DB + ':commit', { writes });
console.log('Committed', r.commitTime);
