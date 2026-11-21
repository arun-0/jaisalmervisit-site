#!/usr/bin/env node
/* Security-rules tests against the local emulators (no npm dependencies).
   Start the emulators first:  firebase emulators:start
   Then:                       node scripts/test-rules.mjs
   Creates throwaway users/data in the emulator only. Exit code 1 if any check fails. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const project = JSON.parse(readFileSync(root + '.firebaserc', 'utf8')).projects.default;
const cfg = readFileSync(root + 'public/assets/js/' + (await import('node:fs')).readdirSync(root + 'public/assets/js').find(f => f.startsWith('firebase-config.')), 'utf8');
const bucket = cfg.match(/storageBucket:\s*'([^']*)'/)[1] || project + '.appspot.com';
const FS = `http://127.0.0.1:8080/v1/projects/${project}/databases/(default)/documents`;
const AUTH = 'http://127.0.0.1:9099';
const ST = 'http://127.0.0.1:9199';

const enc = v => v === null ? { nullValue: null } : typeof v === 'boolean' ? { booleanValue: v }
  : typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
  : typeof v === 'string' ? { stringValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(enc) } }
  : { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
const fields = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, enc(v)]));
const hdr = tok => ({ 'Content-Type': 'application/json', ...(tok ? { Authorization: 'Bearer ' + tok } : {}) });

async function user(email, verified = true) {
  const r = await (await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x`, { method: 'POST', headers: hdr(), body: JSON.stringify({ email, password: 'secret123', returnSecureToken: true }) })).json();
  if (verified) await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${project}/accounts:update`, { method: 'POST', headers: hdr('owner'), body: JSON.stringify({ localId: r.localId, emailVerified: true }) });
  const s = await (await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=x`, { method: 'POST', headers: hdr(), body: JSON.stringify({ email, password: 'secret123', returnSecureToken: true }) })).json();
  return s.idToken;
}
/* Writes go through :commit so createdAt can be the server's request time. */
async function write(tok, path, data, { serverTime = [] } = {}) {
  const w = { update: { name: `projects/${project}/databases/(default)/documents/${path}`, fields: fields(data) } };
  if (serverTime.length) w.updateTransforms = serverTime.map(f => ({ fieldPath: f, setToServerValue: 'REQUEST_TIME' }));
  return (await fetch(`${FS}:commit`, { method: 'POST', headers: hdr(tok), body: JSON.stringify({ writes: [w] }) })).status;
}
const read = async (tok, path) => (await fetch(`${FS}/${path}`, { headers: hdr(tok) })).status;
const del = async (tok, path) => (await fetch(`${FS}/${path}`, { method: 'DELETE', headers: hdr(tok) })).status;
const list = async (tok, coll) => (await fetch(`${FS}/${coll}`, { headers: hdr(tok) })).status;
/* Multipart upload with metadata, the same request the Firebase JS SDK sends. */
async function upload(tok, path, type, bytes = 100) {
  const b = 'vjtest' + Math.random().toString(36).slice(2);
  const head = `--${b}\r\nContent-Type: application/json; charset=utf-8\r\n\r\n${JSON.stringify({ name: path, contentType: type })}\r\n--${b}\r\nContent-Type: ${type}\r\n\r\n`;
  const body = Buffer.concat([Buffer.from(head), Buffer.alloc(bytes), Buffer.from(`\r\n--${b}--`)]);
  return (await fetch(`${ST}/v0/b/${bucket}/o?name=${encodeURIComponent(path)}`, { method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${b}`, 'X-Goog-Upload-Protocol': 'multipart', ...(tok ? { Authorization: 'Firebase ' + tok } : {}) }, body })).status;
}
const getFile = async path => (await fetch(`${ST}/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`)).status;

let fail = 0;
const ok = s => s >= 200 && s < 300;
function check(name, status, expectAllowed) {
  const pass = ok(status) === expectAllowed;
  if (!pass) fail++;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${expectAllowed ? 'allow' : 'deny '}  ${name}  (${status})`);
}

const run = Date.now().toString(36);
const adminEmail = `admin-${run}@example.com`, userEmail = `user-${run}@example.com`, unverifiedAdmin = `unv-${run}@example.com`;
await write('owner', `admins/${adminEmail}`, { email: adminEmail });
await write('owner', `admins/${unverifiedAdmin}`, { email: unverifiedAdmin });
// Tests write to published/announcements and published/reviews; keep whatever was there and put it back at the end.
const savedLive = await fetch(`${FS}/published/announcements`, { headers: hdr('owner') }).then(r => r.ok ? r.json() : null);
const savedReviews = await fetch(`${FS}/published/reviews`, { headers: hdr('owner') }).then(r => r.ok ? r.json() : null);
await write('owner', `published/announcements`, { items: [], count: 0 });
const ADMIN = await user(adminEmail), USER = await user(userEmail), UNV = await user(unverifiedAdmin, false);
const rec = uid => ({ _uid: uid, name: 'Test', _published: false });

console.log('\n— Published content (website) —');
check('anonymous reads published/announcements', await read(null, 'published/announcements'), true);
check('anonymous lists the published collection (one query for the website)', await list(null, 'published'), true);
check('admin writes published/unknownKey', await write(ADMIN, 'published/secrets', { items: [], count: 0 }), false);
check('anonymous writes published/announcements', await write(null, 'published/announcements', { items: [], count: 0 }), false);
check('signed-in non-admin writes published/announcements', await write(USER, 'published/announcements', { items: [], count: 0 }), false);
check('admin writes published/announcements', await write(ADMIN, 'published/announcements', { items: [], count: 0 }), true);
check('admin writes published/announcements with wrong count', await write(ADMIN, 'published/announcements', { items: [], count: 3 }), false);

console.log('\n— Admin working copies (drafts) —');
check('admin creates places/t1', await write(ADMIN, `places/t1-${run}`, rec(`t1-${run}`)), true);
check('admin reads places/t1', await read(ADMIN, `places/t1-${run}`), true);
check('admin creates record whose _uid ≠ doc id', await write(ADMIN, `places/t2-${run}`, rec('other')), false);
check('anonymous reads a draft', await read(null, `places/t1-${run}`), false);
check('anonymous lists drafts', await list(null, 'places'), false);
check('non-admin reads a draft', await read(USER, `places/t1-${run}`), false);
check('non-admin writes a draft', await write(USER, `places/t3-${run}`, rec(`t3-${run}`)), false);
check('non-admin deletes a draft', await del(USER, `places/t1-${run}`), false);
check('unverified account with admin email writes', await write(UNV, `places/t4-${run}`, rec(`t4-${run}`)), false);
check('admin writes to an unknown collection', await write(ADMIN, `random/x`, { a: 1 }), false);
check('admin deletes places/t1', await del(ADMIN, `places/t1-${run}`), true);
check('admin creates itineraries/t5 (Plan a trip)', await write(ADMIN, `itineraries/t5-${run}`, rec(`t5-${run}`)), true);
check('non-admin writes itineraries', await write(USER, `itineraries/t6-${run}`, rec(`t6-${run}`)), false);
check('admin deletes itineraries/t5', await del(ADMIN, `itineraries/t5-${run}`), true);

console.log('\n— Admin allow-list —');
check('user checks own admin doc (allowed; 404 = not an admin)', (await read(USER, `admins/${userEmail}`)) === 404 ? 200 : 403, true);
check('user reads someone else’s admin doc', await read(USER, `admins/${adminEmail}`), false);
check('non-admin makes self admin', await write(USER, `admins/${userEmail}`, { email: userEmail }), false);
check('admin adds another admin (console/script only)', await write(ADMIN, `admins/x-${run}@example.com`, { email: 'x' }), false);

console.log('\n— Newsletter —');
const em = `reader-${run}@example.com`;
check('anonymous subscribes', await write(null, `newsletter/${em}`, { email: em, source: 'footer' }, { serverTime: ['createdAt'] }), true);
check('same email again (duplicate)', await write(null, `newsletter/${em}`, { email: em, source: 'footer' }, { serverTime: ['createdAt'] }), false);
check('doc id ≠ email', await write(null, `newsletter/a-${run}@example.com`, { email: em }, { serverTime: ['createdAt'] }), false);
check('uppercase email', await write(null, `newsletter/UP-${run}@EXAMPLE.COM`, { email: `UP-${run}@EXAMPLE.COM` }, { serverTime: ['createdAt'] }), false);
check('not an email', await write(null, `newsletter/nope-${run}`, { email: `nope-${run}` }, { serverTime: ['createdAt'] }), false);
check('extra field', await write(null, `newsletter/x-${run}@example.com`, { email: `x-${run}@example.com`, admin: true }, { serverTime: ['createdAt'] }), false);
check('client-chosen createdAt', await write(null, `newsletter/y-${run}@example.com`, { email: `y-${run}@example.com`, createdAt: '2020-01-01' }), false);
check('anonymous reads newsletter', await read(null, `newsletter/${em}`), false);
check('anonymous lists newsletter', await list(null, 'newsletter'), false);
check('non-admin lists newsletter', await list(USER, 'newsletter'), false);
check('admin lists newsletter', await list(ADMIN, 'newsletter'), true);

console.log('\n— Add Your Service submissions —');
const sub = { name: 'Ramesh Taxi', serviceType: 'Taxi Driver', mobile: '9876543210', description: 'AC taxi, fort area and Sam.', status: 'pending', source: 'website' };
check('anonymous submits', await write(null, `serviceSubmissions/s1-${run}`, sub, { serverTime: ['createdAt'] }), true);
check('status approved', await write(null, `serviceSubmissions/s2-${run}`, { ...sub, status: 'approved' }, { serverTime: ['createdAt'] }), false);
check('bad mobile', await write(null, `serviceSubmissions/s3-${run}`, { ...sub, mobile: '12345' }, { serverTime: ['createdAt'] }), false);
check('unknown service type', await write(null, `serviceSubmissions/s4-${run}`, { ...sub, serviceType: 'Hacker' }, { serverTime: ['createdAt'] }), false);
check('name too long', await write(null, `serviceSubmissions/s5-${run}`, { ...sub, name: 'x'.repeat(81) }, { serverTime: ['createdAt'] }), false);
check('empty description', await write(null, `serviceSubmissions/s6-${run}`, { ...sub, description: '' }, { serverTime: ['createdAt'] }), false);
check('extra field (mobile_verified)', await write(null, `serviceSubmissions/s7-${run}`, { ...sub, mobile_verified: true }, { serverTime: ['createdAt'] }), false);
check('anonymous overwrites a submission', await write(null, `serviceSubmissions/s1-${run}`, sub, { serverTime: ['createdAt'] }), false);
check('anonymous reads submissions', await read(null, `serviceSubmissions/s1-${run}`), false);
check('non-admin reads submissions', await read(USER, `serviceSubmissions/s1-${run}`), false);
check('admin reads submissions', await read(ADMIN, `serviceSubmissions/s1-${run}`), true);
check('admin updates a submission', await write(ADMIN, `serviceSubmissions/s1-${run}`, { ...sub, status: 'approved' }), true);

console.log('\n— Visitor reviews —');
const rv = { targetType: 'transport', targetId: 'taxi-ramesh', targetName: 'Ramesh Taxi', rating: 4, text: 'On time, fair price.', name: 'Asha', status: 'pending', source: 'website' };
check('anonymous reviews a provider', await write(null, `reviews/r1-${run}`, rv, { serverTime: ['createdAt'] }), true);
check('review without text or name', await write(null, `reviews/r2-${run}`, { targetType: 'operator', targetId: 'op-001', targetName: 'Desert Trail', rating: 5, status: 'pending' }, { serverTime: ['createdAt'] }), true);
check('review already approved', await write(null, `reviews/r3-${run}`, { ...rv, status: 'approved' }, { serverTime: ['createdAt'] }), false);
check('rating 6', await write(null, `reviews/r4-${run}`, { ...rv, rating: 6 }, { serverTime: ['createdAt'] }), false);
check('rating 0', await write(null, `reviews/r5-${run}`, { ...rv, rating: 0 }, { serverTime: ['createdAt'] }), false);
check('rating 4.5 (not whole stars)', await write(null, `reviews/r6-${run}`, { ...rv, rating: 4.5 }, { serverTime: ['createdAt'] }), false);
check('unknown target type', await write(null, `reviews/r7-${run}`, { ...rv, targetType: 'website' }, { serverTime: ['createdAt'] }), false);
check('bad target id', await write(null, `reviews/r8-${run}`, { ...rv, targetId: '../admins' }, { serverTime: ['createdAt'] }), false);
check('text too long', await write(null, `reviews/r9-${run}`, { ...rv, text: 'x'.repeat(601) }, { serverTime: ['createdAt'] }), false);
check('extra field', await write(null, `reviews/r10-${run}`, { ...rv, verified: true }, { serverTime: ['createdAt'] }), false);
check('client-chosen createdAt', await write(null, `reviews/r11-${run}`, { ...rv, createdAt: '2020-01-01' }), false);
check('anonymous overwrites a review', await write(null, `reviews/r1-${run}`, rv, { serverTime: ['createdAt'] }), false);
check('anonymous reads reviews', await read(null, `reviews/r1-${run}`), false);
check('non-admin lists reviews', await list(USER, 'reviews'), false);
check('admin lists reviews', await list(ADMIN, 'reviews'), true);
check('admin approves a review', await write(ADMIN, `reviews/r1-${run}`, { ...rv, status: 'approved' }), true);
check('admin publishes review summaries', await write(ADMIN, 'published/reviews', { items: [], count: 0 }), true);
check('non-admin publishes review summaries', await write(USER, 'published/reviews', { items: [], count: 0 }), false);
check('admin deletes a review', await del(ADMIN, `reviews/r2-${run}`), true);

console.log('\n— Storage —');
check('admin uploads image', await upload(ADMIN, `images/test/${run}.png`, 'image/png'), true);
check('admin uploads audio', await upload(ADMIN, `audio/test/${run}.mp3`, 'audio/mpeg'), true);
check('admin uploads non-image to /images', await upload(ADMIN, `images/test/${run}.html`, 'text/html'), false);
check('admin uploads 6 MB image', await upload(ADMIN, `images/test/${run}-big.png`, 'image/png', 6 * 1024 * 1024), false);
check('admin uploads outside images/audio', await upload(ADMIN, `other/${run}.png`, 'image/png'), false);
check('non-admin uploads image', await upload(USER, `images/test/${run}-u.png`, 'image/png'), false);
check('anonymous uploads image', await upload(null, `images/test/${run}-a.png`, 'image/png'), false);
check('anonymous downloads image', await getFile(`images/test/${run}.png`), true);

if (savedLive) await fetch(`${FS}:commit`, { method: 'POST', headers: hdr('owner'), body: JSON.stringify({ writes: [{ update: { name: savedLive.name, fields: savedLive.fields } }] }) });
else await del('owner', 'published/announcements');
if (savedReviews) await fetch(`${FS}:commit`, { method: 'POST', headers: hdr('owner'), body: JSON.stringify({ writes: [{ update: { name: savedReviews.name, fields: savedReviews.fields } }] }) });
else await del('owner', 'published/reviews');

console.log(fail ? `\n${fail} check(s) FAILED` : '\nAll checks passed');
process.exit(fail ? 1 : 0);
