#!/usr/bin/env node
/* Seed Firestore: admin allow-list and/or the admin panel's built-in DEFAULTS.
   No npm dependencies (Node 18+, Firestore REST API).

   Emulator (firebase emulators:start running):
     node scripts/seed.mjs --emulator --admin you@gmail.com --defaults

   Production (uses your gcloud login, or an access token in FIREBASE_ACCESS_TOKEN;
   the account needs Firestore write access on the project):
     node scripts/seed.mjs --project visitjaisalmer-e3085 --admin you@gmail.com

   --admin <email>   add an admin (repeatable)
   --remove-admin <email>
   --defaults        copy DEFAULTS from public/admin/index.html into every dataset that has
                     no records yet, and publish them (they are what the website shows today)
   --force           with --defaults: overwrite datasets that already have records
   --only a,b        with --defaults / --add-missing: just these datasets (e.g. --only settings)
   --add-missing     add only the DEFAULTS records whose ID isn't in the dataset yet (e.g. new built-in
                     parking spots) and publish them next to what's live. Existing records — and any
                     unpublished drafts — are left exactly as they are. */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const flag = f => args.includes(f);
const many = f => args.flatMap((a, i) => a === f && args[i + 1] ? [args[i + 1]] : []);
const root = fileURLToPath(new URL('..', import.meta.url));

const emulator = flag('--emulator');
const project = many('--project')[0] || JSON.parse(readFileSync(root + '.firebaserc', 'utf8')).projects.default;
const base = emulator ? 'http://127.0.0.1:8080' : 'https://firestore.googleapis.com';
const docs = `projects/${project}/databases/(default)/documents`;
const token = emulator ? 'owner' : process.env.FIREBASE_ACCESS_TOKEN || execFileSync('gcloud', ['auth', 'print-access-token'], { encoding: 'utf8' }).trim();
const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', ...(emulator ? {} : { 'x-goog-user-project': project }) };

const enc = v => {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  return { mapValue: { fields: fields(v) } };
};
const fields = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, enc(v)]));

async function api(method, path, body) {
  const r = await fetch(`${base}/v1/${path}`, { method, headers, body: body && JSON.stringify(body) });
  const t = await r.text();
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : {};
}
async function commit(writes) {
  for (let i = 0; i < writes.length; i += 400) await api('POST', `${docs}:commit`, { writes: writes.slice(i, i + 400) });
}
const upd = (path, data) => ({ update: { name: `${docs}/${path}`, fields: fields(data) } });

console.log(`Project ${project} ${emulator ? '(emulator)' : '(PRODUCTION)'}`);

const adds = many('--admin').map(e => e.toLowerCase()), rems = many('--remove-admin').map(e => e.toLowerCase());
if (adds.length) { await commit(adds.map(e => upd(`admins/${e}`, { email: e, addedAt: new Date(), addedBy: 'seed script' }))); console.log('Admins added:', adds.join(', ')); }
for (const e of rems) { await api('DELETE', `${docs}/admins/${e}`); console.log('Admin removed:', e); }

if (flag('--defaults')) {
  const html = readFileSync(root + 'public/admin/index.html', 'utf8');
  const m = html.match(/^const DEFAULTS = (.*);$/m);
  if (!m) throw new Error('DEFAULTS not found in public/admin/index.html');
  const D = JSON.parse(m[1]);
  const now = new Date();
  const only = (many('--only')[0] || '').split(',').filter(Boolean);
  for (const [k, items] of Object.entries(D)) {
    if (only.length && !only.includes(k)) continue;
    const existing = await api('GET', `${docs}/${k}?pageSize=1`);
    if (existing.documents && existing.documents.length && !flag('--force')) { console.log(`  ${k}: has records, skipped (use --force)`); continue; }
    if (!items.length) { console.log(`  ${k}: no defaults`); continue; }
    const writes = items.map((r, i) => upd(`${k}/${r._uid}`, { ...r, _pos: i, _published: true, _publishedAt: now, _updatedAt: now, _updatedBy: 'seed script' }));
    writes.push(upd(`published/${k}`, { items, count: items.length, publishedAt: now, publishedBy: 'seed script' }));
    await commit(writes);
    console.log(`  ${k}: ${items.length} records seeded and published`);
  }
}
if (flag('--add-missing')) {
  const html = readFileSync(root + 'public/admin/index.html', 'utf8');
  const m = html.match(/^const DEFAULTS = (.*);$/m);
  if (!m) throw new Error('DEFAULTS not found in public/admin/index.html');
  const D = JSON.parse(m[1]), KEY = { places: 'id', landmarks: 'id', activities: 'id', transport: 'id', houseAds: 'id', guidance: 'id' };
  const only = (many('--only')[0] || '').split(',').filter(Boolean);
  const dec = v => v == null ? null : 'stringValue' in v ? v.stringValue : 'integerValue' in v ? Number(v.integerValue) : 'doubleValue' in v ? v.doubleValue
    : 'booleanValue' in v ? v.booleanValue : 'nullValue' in v ? null : 'timestampValue' in v ? v.timestampValue
    : 'arrayValue' in v ? (v.arrayValue.values || []).map(dec) : 'mapValue' in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, dec(x)])) : null;
  const now = new Date();
  for (const [k, key] of Object.entries(KEY)) {
    if (only.length && !only.includes(k)) continue;
    const have = [];
    let page = '';
    do {
      const r = await api('GET', `${docs}/${k}?pageSize=300${page ? '&pageToken=' + encodeURIComponent(page) : ''}`);
      (r.documents || []).forEach(d => have.push(dec({ mapValue: { fields: d.fields } })));
      page = r.nextPageToken || '';
    } while (page);
    if (!have.length) { console.log(`  ${k}: no records yet — use --defaults instead`); continue; }
    const add = (D[k] || []).filter(r => !have.some(h => h[key] === r[key]));
    if (!add.length) { console.log(`  ${k}: nothing missing`); continue; }
    const live = await api('GET', `${docs}/published/${k}`).catch(() => null);
    const items = live && live.fields ? dec(live.fields.items) || [] : [];
    const pos = have.reduce((n, h) => Math.max(n, typeof h._pos === 'number' ? h._pos + 1 : n), have.length);
    const writes = add.map((r, i) => upd(`${k}/${r._uid}`, { ...r, _pos: pos + i, _published: true, _publishedAt: now, _updatedAt: now, _updatedBy: 'seed script' }));
    const next = items.concat(add);
    writes.push(upd(`published/${k}`, { items: next, count: next.length, publishedAt: now, publishedBy: 'seed script' }));
    await commit(writes);
    console.log(`  ${k}: added and published ${add.map(r => r[key]).join(', ')}`);
  }
}
if (!adds.length && !rems.length && !flag('--defaults') && !flag('--add-missing')) console.log('Nothing to do. See the header of scripts/seed.mjs for usage.');
