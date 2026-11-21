/* One-off live-data fix for round 6 (22 Oct 2026). Dry run by default; --apply writes.
     node scripts/fix-round6-data.mjs            # show what would change
     node scripts/fix-round6-data.mjs --apply    # write it
   - places/r6d: Place ID "sulidungar" back to "sulidungri" (stories, Tourist Mode area and services use it;
     the admin locks the ID once published, so it can't be changed there)
   - places/r9d: War Museum map pin from OpenStreetMap (node 4996347923, tourism=museum)
   - guidance/r19d, r1ad: "Visit Jaisalmer" → "Jaisalmer Visit"
   Each record changes in the working copy and in published/{dataset}, in one commit. The commit is refused
   if any of those documents changed since they were read (e.g. someone published from the admin). */
import { execFileSync } from 'node:child_process';

const apply = process.argv.includes('--apply');
const root = new URL('..', import.meta.url).pathname;
const token = execFileSync('node', [root + 'scripts/firebase-token.cjs'], { encoding: 'utf8' }).trim();
const DB = 'projects/visitjaisalmer-e3085/databases/(default)/documents';
const API = 'https://firestore.googleapis.com/v1/';
const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'x-goog-user-project': 'visitjaisalmer-e3085' };
const WHO = { stringValue: 'jaisalmervisitin@gmail.com' };

async function api(path, body) {
  const r = await fetch(API + path, body ? { method: 'POST', headers, body: JSON.stringify(body) } : { headers });
  const j = await r.json();
  if (!r.ok) throw new Error(path + ': ' + JSON.stringify(j.error || j));
  return j;
}
const rename = v => Array.isArray(v) ? v.map(rename)
  : v && typeof v === 'object' ? ('stringValue' in v ? { stringValue: v.stringValue.replaceAll('Visit Jaisalmer', 'Jaisalmer Visit') }
    : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, rename(x)]))) : v;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const FIXES = {
  places: {
    r6d: f => { if (f.id.stringValue !== 'sulidungar' && f.id.stringValue !== 'sulidungri') throw new Error('r6d id is ' + f.id.stringValue); return { ...f, id: { stringValue: 'sulidungri' } }; },
    r9d: f => { if (f.id.stringValue !== 'warmuseum') throw new Error('r9d id is ' + f.id.stringValue); return { ...f, lat: { doubleValue: 26.94081 }, lng: { doubleValue: 71.02652 } }; },
  },
  guidance: { r19d: rename, r1ad: rename },
};

const writes = [];
for (const [ds, fixes] of Object.entries(FIXES)) {
  for (const [uid, fix] of Object.entries(fixes)) {
    const d = await api(DB + '/' + ds + '/' + uid);
    const nf = fix(structuredClone(d.fields));
    const changed = Object.keys(nf).filter(k => !same(nf[k], d.fields[k]));
    console.log(ds + '/' + uid + ':', changed.length ? changed.map(k => k + ' ' + JSON.stringify(d.fields[k]) + ' → ' + JSON.stringify(nf[k])).join('\n    ') : 'already done');
    if (!changed.length) continue;
    writes.push({
      update: { name: d.name, fields: { ...Object.fromEntries(changed.map(k => [k, nf[k]])), _updatedBy: WHO } },
      updateMask: { fieldPaths: [...changed, '_updatedBy'] },
      currentDocument: { updateTime: d.updateTime },
      updateTransforms: [{ fieldPath: '_updatedAt', setToServerValue: 'REQUEST_TIME' }, { fieldPath: '_publishedAt', setToServerValue: 'REQUEST_TIME' }],
    });
  }
  const pub = await api(DB + '/published/' + ds);
  let n = 0;
  for (const it of pub.fields.items.arrayValue.values) {
    const f = it.mapValue.fields, fix = fixes[f._uid.stringValue];
    if (!fix) continue;
    const nf = fix(structuredClone(f));
    if (!same(nf, f)) { it.mapValue.fields = nf; n++; }
  }
  console.log('published/' + ds + ':', n + ' item(s) change');
  if (n) writes.push({
    update: { name: pub.name, fields: { items: pub.fields.items, publishedBy: WHO } },
    updateMask: { fieldPaths: ['items', 'publishedBy'] },
    currentDocument: { updateTime: pub.updateTime },
    updateTransforms: [{ fieldPath: 'publishedAt', setToServerValue: 'REQUEST_TIME' }],
  });
}

if (!writes.length) console.log('Nothing to do.');
else if (!apply) console.log('\nDry run: ' + writes.length + ' document(s) would change. Run again with --apply to write.');
else { await api(DB + ':commit', { writes }); console.log('\nDone: ' + writes.length + ' document(s) written in one commit.'); }
