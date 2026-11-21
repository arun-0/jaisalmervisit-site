/* One-off (28 Oct 2026): Patwon history audio. rxd (Hindi) gets its Hindi recording back; the English recording
   becomes its own English story. Dry run by default; --apply writes (working copies + published/historyAudio in one
   commit, refused if any of them changed since read).
   APPLIED 28 Oct 2026 (commit 2026-10-27T22:24:07Z). Re-running refuses: rxd no longer holds the English file.
     node scripts/fix-round9-data.mjs            # dry run
     node scripts/fix-round9-data.mjs --apply    # write
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
const S = v => ({ stringValue: v }), WHO = S('jaisalmervisitin@gmail.com');
const BASE = 'https://firebasestorage.googleapis.com/v0/b/visitjaisalmer-e3085.firebasestorage.app/o/audio%2FhistoryAudio%2Frxd%2F';
const HI = BASE + '1792854400915-patwon-ki-haweli-cinematic-music-1-.m4a?alt=media&token=79523a31-a78c-4da4-ae55-360fddae874d';
const EN = BASE + '1792936723569-patwon-ki-haveli-english-elegant-cinematic-bgm.m4a?alt=media&token=a9fc692d-9a17-42a1-9687-4a86a18fa391';
const now = new Date().toISOString();

const rxd = await api(DB + '/historyAudio/rxd');
const f = rxd.fields;
if (f.attractionId.stringValue !== 'patwon' || f.language.stringValue !== 'hi' || f.audioUrl.stringValue !== EN) throw new Error('rxd is not in the expected state');
const all = await api(DB + '/historyAudio?pageSize=300');
if (all.documents.some(d => d.fields.attractionId.stringValue === 'patwon' && d.fields.language.stringValue === 'en')) throw new Error('Patwon already has an English story');
const pos = Math.max(...all.documents.map(d => +(d.fields._pos?.integerValue ?? 0))) + 1;
const uid = 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const hiRec = { ...f, audioUrl: S(HI), duration: { integerValue: '160' }, updatedAt: S(now) };
const enRec = { ...f, _uid: S(uid), language: S('en'), audioUrl: S(EN), duration: { integerValue: '163' }, updatedAt: S(now), createdAt: S(now), _pos: { integerValue: String(pos) } };
const strip = r => Object.fromEntries(Object.entries(r).filter(([k]) => k === '_uid' || !k.startsWith('_')));

const pub = await api(DB + '/published/historyAudio');
const items = pub.fields.items.arrayValue.values;
const i = items.findIndex(x => x.mapValue.fields._uid.stringValue === 'rxd');
if (i < 0 || items[i].mapValue.fields.audioUrl.stringValue !== EN) throw new Error('published rxd not in the expected state');
const newItems = items.slice(); newItems[i] = { mapValue: { fields: { ...items[i].mapValue.fields, audioUrl: S(HI), duration: { integerValue: '160' }, updatedAt: S(now) } } };
newItems.push({ mapValue: { fields: strip(enRec) } });

console.log('rxd (Hindi): audio → Hindi file, length 163 → 160');
console.log(uid + ' (English, new, _pos ' + pos + '): English file, length 163, published');
console.log('published/historyAudio: ' + items.length + ' → ' + newItems.length + ' items');
if (!apply) { console.log('Dry run — add --apply to write.'); process.exit(0); }

const stamp = [{ fieldPath: '_updatedAt', setToServerValue: 'REQUEST_TIME' }, { fieldPath: '_publishedAt', setToServerValue: 'REQUEST_TIME' }];
const writes = [
  { update: { name: rxd.name, fields: { audioUrl: hiRec.audioUrl, duration: hiRec.duration, updatedAt: hiRec.updatedAt, _updatedBy: WHO } },
    updateMask: { fieldPaths: ['audioUrl', 'duration', 'updatedAt', '_updatedBy'] }, currentDocument: { updateTime: rxd.updateTime }, updateTransforms: stamp },
  { update: { name: DB + '/historyAudio/' + uid, fields: { ...enRec, _published: { booleanValue: true }, _updatedBy: WHO } },
    currentDocument: { exists: false }, updateTransforms: stamp },
  { update: { name: pub.name, fields: { items: { arrayValue: { values: newItems } }, count: { integerValue: String(newItems.length) }, publishedBy: WHO } },
    updateMask: { fieldPaths: ['items', 'count', 'publishedBy'] }, currentDocument: { updateTime: pub.updateTime },
    updateTransforms: [{ fieldPath: 'publishedAt', setToServerValue: 'REQUEST_TIME' }] },
];
const r = await api(DB + ':commit', { writes });
console.log('Committed', r.commitTime);
