#!/usr/bin/env node
/* Build the map's built-in road network (Settings → Map → Directions: "Built-in").
   No npm dependencies (Node 18+). Downloads Jaisalmer's roads from OpenStreetMap (Overpass API)
   and writes a compact graph the website routes on, in the visitor's browser:

     node scripts/build-roads.mjs                 # download + build
     node scripts/build-roads.mjs --input f.json  # build from a saved Overpass answer
     node scripts/build-roads.mjs --save f.json   # also keep the Overpass answer
     python3 scripts/rehash.py                    # then: new hash in the file name + references

   Re-run every few months to pick up new roads mapped in OpenStreetMap.
   Coverage: every drivable road and desert track in the district box (Sam, Kuldhara, Khuri, Tanot …),
   plus footpaths and steps around the city (walking routes in the old city and the fort).
   Data © OpenStreetMap contributors, ODbL 1.0 — the output file is ODbL too and says so.

   Output (public/assets/data/jaisalmer-roads.<hash>.json):
     kinds  road kind names; the website maps each to a speed
     scale  coordinates are integers of degrees × scale
     nodes  [lat0, lng0, Δlat1, Δlng1, …] (delta-coded)
     ways   [[kind, flags, node0, Δnode1, …], …] (node indices delta-coded)
            flags: 1 one-way, 2 one-way against the drawing direction, 4 no cars, 8 no walking */
import { readFileSync, writeFileSync, readdirSync, unlinkSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const root = fileURLToPath(new URL('..', import.meta.url));
const OUT_DIR = root + 'public/assets/data/';
const MAP_JS_DIR = root + 'public/assets/js/';

const DISTRICT = [26.55, 70.10, 27.95, 71.15];   // s, w, n, e — all drivable roads
const CITY = [26.85, 70.85, 26.97, 70.97];       // plus footpaths and steps
const bb = b => `(${b.join(',')})`;
const QUERY = `[out:json][timeout:180];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary)(_link)?$"]${bb(DISTRICT)};
  way["highway"~"^(unclassified|residential|living_street|service|track|road)$"]${bb(DISTRICT)};
  way["highway"~"^(pedestrian|footway|path|steps)$"]${bb(CITY)};
);
out body;
>;
out skel qt;`;

const KINDS = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'link', 'unclassified', 'residential',
  'living_street', 'service', 'track', 'foot', 'steps'];
function kindOf(t) {
  const h = t.highway;
  if (/_link$/.test(h)) return 'link';
  if (h === 'road') return 'unclassified';
  if (h === 'pedestrian' || h === 'footway' || h === 'path') return 'foot';
  return KINDS.includes(h) ? h : null;
}
function flagsOf(t, kind) {
  let f = 0;
  const ow = t.oneway || (t.junction === 'roundabout' || t.junction === 'circular' ? 'yes' : '');
  if (ow === 'yes' || ow === 'true' || ow === '1') f |= 1;
  if (ow === '-1' || ow === 'reverse') f |= 1 | 2;
  const closed = v => v === 'no' || v === 'private';
  const open = v => v === 'yes' || v === 'designated' || v === 'permissive' || v === 'destination';
  const mv = t.motorcar || t.motor_vehicle || t.vehicle;
  if (kind === 'foot' || kind === 'steps' || (closed(t.access) && !open(mv)) || closed(mv)) f |= 4;
  if (kind === 'motorway' || closed(t.foot) || (closed(t.access) && !open(t.foot))) f |= 8;
  return f;
}

async function overpass() {
  const r = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST', headers: { 'User-Agent': 'visit-jaisalmer-build-roads/1.0', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(QUERY)
  });
  if (!r.ok) throw new Error('Overpass answered HTTP ' + r.status + ': ' + (await r.text()).slice(0, 300));
  return r.json();
}

const raw = opt('--input') ? JSON.parse(readFileSync(opt('--input'), 'utf8')) : await overpass();
if (opt('--save')) writeFileSync(opt('--save'), JSON.stringify(raw));

const coords = new Map();
for (const e of raw.elements) if (e.type === 'node') coords.set(e.id, [e.lat, e.lon]);
const ways = [];
for (const e of raw.elements) {
  if (e.type !== 'way' || !e.tags || e.tags.area === 'yes') continue;
  const kind = kindOf(e.tags);
  if (!kind) continue;
  const flags = flagsOf(e.tags, kind);
  if ((flags & 12) === 12) continue;                         // nobody may use it
  const nodes = e.nodes.filter(n => coords.has(n));
  if (nodes.length >= 2) ways.push({ kind, flags, nodes });
}

// Keep only the largest connected network: a visitor snapped onto an island (a fenced compound's
// internal roads, an unconnected fragment) would otherwise get "no route".
const parent = new Map();
const find = x => { let r = x; while (parent.get(r) !== r) r = parent.get(r); while (parent.get(x) !== r) { const n = parent.get(x); parent.set(x, r); x = n; } return r; };
for (const w of ways) for (const n of w.nodes) if (!parent.has(n)) parent.set(n, n);
for (const w of ways) for (let i = 1; i < w.nodes.length; i++) { const a = find(w.nodes[0]), b = find(w.nodes[i]); if (a !== b) parent.set(a, b); }
const size = new Map();
for (const n of parent.keys()) { const r = find(n); size.set(r, (size.get(r) || 0) + 1); }
const main = [...size.entries()].sort((a, b) => b[1] - a[1])[0][0];
const kept = ways.filter(w => find(w.nodes[0]) === main);

// Number nodes in the order the ways use them, so index and coordinate deltas stay small.
const SCALE = 1e5, index = new Map(), nodeOut = [];
let pLat = 0, pLng = 0;
const wayOut = kept.map(w => {
  const row = [KINDS.indexOf(w.kind), w.flags];
  let prev = 0;
  w.nodes.forEach((n, k) => {
    if (!index.has(n)) {
      index.set(n, index.size);
      const [lat, lng] = coords.get(n), qLat = Math.round(lat * SCALE), qLng = Math.round(lng * SCALE);
      nodeOut.push(qLat - pLat, qLng - pLng); pLat = qLat; pLng = qLng;
    }
    const i = index.get(n);
    row.push(k ? i - prev : i); prev = i;
  });
  return row;
});

const out = JSON.stringify({
  v: 1,
  attribution: '© OpenStreetMap contributors — ODbL 1.0, https://www.openstreetmap.org/copyright',
  osmBase: (raw.osm3s && raw.osm3s.timestamp_osm_base) || null,
  bbox: DISTRICT, kinds: KINDS, scale: SCALE, nodes: nodeOut, ways: wayOut
});
mkdirSync(OUT_DIR, { recursive: true });
for (const f of readdirSync(OUT_DIR)) if (/^jaisalmer-roads\.[0-9a-f]{8}\.json$/.test(f)) unlinkSync(OUT_DIR + f);
const name = 'jaisalmer-roads.00000000.json';
writeFileSync(OUT_DIR + name, out);
for (const f of readdirSync(MAP_JS_DIR)) {
  if (!/^map\.[0-9a-f]{8}\.js$/.test(f)) continue;
  const t = readFileSync(MAP_JS_DIR + f, 'utf8'), n = t.replace(/jaisalmer-roads\.[0-9a-f]{8}\.json/g, name);
  if (n !== t) writeFileSync(MAP_JS_DIR + f, n);
}
console.log(`${kept.length} of ${ways.length} ways kept (largest network), ${index.size} nodes, ${(out.length / 1024).toFixed(0)} KB → public/assets/data/${name}`);
console.log('Now run: python3 scripts/rehash.py');
