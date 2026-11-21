# Visit Jaisalmer

Tourism website + admin panel, hosted on Firebase (Spark / free plan).

| Path | What |
|---|---|
| `public/index.html` | Public website |
| `public/admin/index.html` | Admin panel (served at `/admin`, `noindex`) |
| `public/assets/css`, `public/assets/js`, `public/assets/img`, `public/assets/data` | Website CSS/JS/images and the map's road file — content-hashed file names, cached 1 year |
| `public/assets/audio` | Audio clips (cached 1 day) |
| `firestore.rules`, `storage.rules`, `firestore.indexes.json` | Database / storage security rules and indexes |
| `scripts/` | Maintenance scripts (see below) |
| `originals/` | The approved single-file designs the project was built from — reference only, not deployed |

## Requirements

- Node 18+ and the Firebase CLI: `npm i -g firebase-tools`
- Java 11+ (for the Firestore / Storage emulators)
- Python 3 (for `scripts/rehash.py`)
- Google Cloud CLI (`gcloud auth login`) — only to run `scripts/seed.mjs` against production

## Run locally

```bash
firebase emulators:start
```

- Website: http://127.0.0.1:5002/
- Admin: http://127.0.0.1:5002/admin (sign in with the emulator's fake Google account picker;
  first run `node scripts/seed.mjs --emulator --admin you@gmail.com`)
- Emulator UI (Firestore, Auth, Storage data): http://127.0.0.1:4000/

Port 5002 is used instead of 5000 because macOS reserves 5000 for AirPlay.

To keep emulator data between runs:

```bash
firebase emulators:start --import=./emulator-data --export-on-exit
```

## Data model (Firestore)

| Path | Who | What |
|---|---|---|
| `{dataset}/{_uid}` | admins | Working copy of one record (drafts included). One collection per admin section: `places`, `landmarks`, `activities`, `transport`, `operators`, `experiences`, `sponsors`, `houseAds`, `partners`, `historyAudio`, `guidance`, `settings`, `announcements`, `itineraries` (Plan a trip). Metadata fields are underscored: `_pos`, `_published`, `_publishedAt`, `_updatedAt`, `_updatedBy`. |
| `published/{dataset}` | public read, admin write | What the website shows: `{items:[…], count, publishedAt, publishedBy}`. One document per dataset keeps a page load to ~13 reads (free plan: 50k reads/day). |
| `admins/{email}` | script / console only | Admin allow-list (lowercased Google email). |
| `serviceSubmissions/{id}` | public create (validated), admin read | "Add Your Service" form. |
| `newsletter/{email}` | public create (validated), admin read | Newsletter signups; the doc ID is the lowercased email, so each address is stored once. |
| `reviews/{id}` | public create (validated, always `pending`), admin read/moderate | Visitors' 1–5 star ratings of transport providers (`targetType: transport`, record `id`) and activity operators (`operator`, `providerId`). Approving one in *Inbox → Reviews* rewrites `published/reviews` (average, count, latest 5 per provider) — the only part the website reads. |

In the admin, **Save draft** changes only the working copy; **Save & publish** / **Publish**
copies records into `published/{dataset}` in one transaction. Sections that aren't in the
database yet show the website's built-in content and are copied in (as published) on first save.

## How the website gets its content

`public/assets/js/site-data.*.js` fetches every `published/{dataset}` document in one request
(Firestore REST API — the public site loads no Firebase SDK), then starts the page scripts in
their original order. Each script asks `VJData.get('ATTRACTIONS', [...built-in...])` and gets the
published data converted to the shape it already uses, or its built-in data when nothing is published.

- Waits at most **1.5 s** for Firestore; after that it uses the copy cached in this tab
  (`sessionStorage`), or the built-in data. The site never renders blank.
- Locally the pages use the emulators. Add `?prod-data` to a local URL to read the live database.
- Forms: **Add Your Service** → `serviceSubmissions` (status `pending`, honeypot + 1 per minute
  per browser); **newsletter** → `newsletter/{email}`; **Rate** (`reviews.*.js`, on Getting Around
  cards, provider pages and Things to do) → `reviews` (honeypot, one review per provider per browser,
  1 per minute). All are handled in the admin under *Inbox*. An approved rating replaces the
  hand-entered `rating` / `reviewCount` of a transport provider.
- **Audio** (history stories, audio-guide clips): uploaded in the admin to Cloud Storage
  (`audio/…`, up to 30 MB) or linked by URL. The player has `preload="none"` and gets its `src`
  only on Play, so nothing is downloaded until a visitor presses it.
- The SMS step of Add Your Service is off (`OTP_ENABLED = false` in `core.*.js`). Turning it on
  needs a real SMS provider first (Firebase Phone Auth, or MSG91 + DLT registration).

## Analytics, map, SEO

- **GA4** (`G-5JKDNM7XMB`, from `measurementId` in `firebase-config.*.js`) with Consent Mode v2:
  nothing loads until the visitor clicks *Accept* in the cookie notice; *Cookie settings* in the
  footer reopens it. The site's `jm:analytics` events are forwarded as GA4 events of the same name.
  Off on localhost unless the URL has `?ga-debug`.
- **AdSense** (publisher `ca-pub-9028150722368329`): the AdSense code is in `index.html`'s `<head>`, right
  after the Consent Mode defaults, so Google serves non-personalised ads (the cookie notice grants analytics only).
  `public/ads.txt` authorises the publisher. Ads appear only once AdSense approves the site; the in-page ad slots
  (`SmartAdManager`) still use Ad Manager/GPT until they're switched (see HANDOFF open item 16).
- **Privacy policy** at `/privacy` (`public/privacy.html`, linked from the footer and the cookie notice): AdSense
  requires it. Keep it in step with what the site collects, and with any change to ad / analytics consent.
- **Map provider** is chosen in the admin: *Settings → Map* (tiles, routing, keys). Default is public
  OSM tiles with in-app routing **off** (FOSSGIS is non-commercial). For production pick Stadia Maps
  (register the domain in the Stadia dashboard; commercial use needs a paid plan), MapTiler (paste the
  key, restrict it to the domain) or Mapbox (tiles + directions, public token restricted to the domain).
  The admin tests the chosen provider from the page and refuses to publish one that rejects the site;
  the website also checks one tile and falls back to OSM tiles on HTTP 401/403.
- **Directions** are drawn in blue. With routing **off**, "Show route" draws a straight dashed blue line
  (worked out on the device) and Google / Apple Maps do turn-by-turn; with a provider, a road route.
- **Parking**: map landmarks with sub-category `Parking` are blue "P" dots. A place's *Parking* button
  opens the map on the car park nearest that place; its *Directions* asks for the visitor's location
  and draws the line from there. Three car parks from OpenStreetMap are built in.
- **Visitor location** (`JMLocation` in `core.*.js`): asked only from a tap, kept for 30 minutes in
  the visitor's own `localStorage` (`vj_last_location`) so a reload doesn't ask again, never sent
  anywhere. If the browser already allows location, the map refreshes it silently and follows the
  visitor while open; if it's blocked, the site explains instead of asking again.
- **Domain**: canonical / Open Graph / robots / sitemap use `https://jaisalmervisit.com`.
  After connecting the custom domain: `python3 scripts/set-domain.py https://your-domain` and deploy.
- `404.html`, `privacy.html`, `ads.txt`, `robots.txt`, `sitemap.xml`, favicons and `og-image.jpg` live in `public/`.

## Admins

Admins sign in with Google. Add or remove one (emulator or production):

```bash
node scripts/seed.mjs --emulator --admin someone@gmail.com
node scripts/seed.mjs --project visitjaisalmer-e3085 --admin someone@gmail.com      # uses your gcloud login
node scripts/seed.mjs --project visitjaisalmer-e3085 --remove-admin someone@gmail.com
```

Or in the Firebase console: Firestore → `admins` → add a document whose ID is the email.

## Seeding content

```bash
node scripts/seed.mjs --emulator --defaults               # local
node scripts/seed.mjs --project visitjaisalmer-e3085 --defaults   # production, once
```

Copies the admin panel's built-in `DEFAULTS` into every empty section and publishes them.
The admin's **Overview → Copy into database** button does the same while signed in.

## Testing the security rules

With the emulators running:

```bash
node scripts/test-rules.mjs
```

Checks reads/writes for anonymous visitors, signed-in non-admins and admins across
Firestore and Storage (72 checks). Uses throwaway users; leaves your emulator content as it was.

## Editing CSS / JS / images

Files in `public/assets/{css,js,img,data}` are named `name.<hash>.ext` so browsers can cache them
for a year. **After editing one, run:**

```bash
python3 scripts/rehash.py
```

It renames changed files and updates every reference to them. Forgetting this step means
visitors may keep seeing the old file.

## Deploy

```bash
firebase login
firebase use visitjaisalmer-e3085   # already set in .firebaserc
firebase deploy                  # hosting + Firestore rules/indexes + Storage rules
firebase deploy --only hosting   # site files only
```

Preview channel (temporary URL, does not touch the live site):

```bash
firebase hosting:channel:deploy preview --expires 7d
```

## Map road routes (built-in directions)

With *Settings → Map → Directions* on **Built-in** (the default), the blue line follows the roads
without any routing service or account: `public/assets/data/jaisalmer-roads.*.json` holds the
district's OpenStreetMap roads (~140 KB gzipped, downloaded only when a visitor taps *Show route*),
and the route is worked out in the visitor's browser. A point more than 5 km from every road (or
outside the district box) gets the straight line plus Google / Apple Maps. To pick up roads newly
mapped in OpenStreetMap (every few months, or after fixing a road on openstreetmap.org):

```bash
node scripts/build-roads.mjs
python3 scripts/rehash.py
firebase deploy --only hosting
```

The road file is OpenStreetMap data (© OpenStreetMap contributors, ODbL); the map credits it.

## Caching

| Files | Cache-Control |
|---|---|
| `/assets/css,js,img,data/**` | `public, max-age=31536000, immutable` |
| `/assets/audio/**` | `public, max-age=86400` |
| HTML pages, `/admin` | `no-cache` (always revalidated, so a deploy is visible on next load) |

## Scripts

- `scripts/rehash.py` — sync hashed asset names after edits.
- `scripts/build-roads.mjs` — rebuild the map's road file from OpenStreetMap (no npm dependencies).
- `scripts/seed.mjs` — add/remove admins, seed default content (no npm dependencies).
- `scripts/test-rules.mjs` — security rules tests against the emulators.
- `scripts/set-domain.py` — switch canonical/OG/robots/sitemap URLs to the production domain.
- `scripts/extract-inline.py` — one-off: how `public/index.html` was produced from
  `originals/website.html` (inline CSS/JS/hero image moved to `public/assets/`, byte-for-byte).
  Kept for the record; do not re-run (it would overwrite later edits).
- `scripts/firebase-token.cjs` — prints an access token for `jaisalmervisitin@gmail.com` from the Firebase CLI login
  (production scripts use it; check `firebase login:list` first).
- `scripts/fix-round6-data.mjs`, `scripts/fix-round9-data.mjs`, `scripts/fix-round10-data.mjs` — one-off live-data fixes
  (dry run by default, `--apply` writes). All three are applied; kept for the record (see `docs/HANDOFF.md`).
