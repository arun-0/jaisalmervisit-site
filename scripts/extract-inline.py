#!/usr/bin/env python3
"""One-off Phase 1 extraction: moves the large inline <style>/<script> blocks and the
inline hero image out of originals/website.html into public/assets/, byte-for-byte.
Scripts stay classic (no defer / no module) and load at the same position, so
execution order and shared top-level bindings are unchanged.

Usage: python3 scripts/extract-inline.py   (run from the project root)
"""
import base64, hashlib, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'originals' / 'website.html'
OUT = ROOT / 'public'

# (open-tag line, close-tag line, output path) — 1-indexed line numbers in originals/website.html
BLOCKS = [
    (40,    2170,  'assets/css/site.css'),
    (2739,  6326,  'assets/js/core.js'),             # DATA + places, history audio, sponsors, activities, add-service
    (6332,  6444,  'assets/js/hero-parallax.js'),
    (6453,  8251,  'assets/js/map.js'),              # JMMap — Smart Tourist Map
    (8262,  8864,  'assets/js/transport.js'),        # Getting Around directory
    (8870,  9586,  'assets/js/tourist-mode.js'),     # JMPlace
    (9606,  10509, 'assets/js/audio-guide.js'),      # JMAudioGuide
    (10511, 10571, 'assets/js/release-hardening.js'),
]

def short_hash(b):
    return hashlib.sha256(b).hexdigest()[:8]

def versioned(rel, data):
    p = pathlib.PurePosixPath(rel)
    return str(p.with_name(f'{p.stem}.{short_hash(data)}{p.suffix}'))

lines = SRC.read_text(encoding='utf-8').split('\n')
for start, end, rel in reversed(BLOCKS):
    open_tag, close_tag = lines[start - 1].strip(), lines[end - 1].strip()
    is_css = rel.endswith('.css')
    assert open_tag == ('<style>' if is_css else '<script>'), (start, open_tag)
    assert close_tag == ('</style>' if is_css else '</script>'), (end, close_tag)
    body = '\n'.join(lines[start:end - 1]) + '\n'
    data = body.encode('utf-8')
    rel_v = versioned(rel, data)
    (OUT / rel_v).parent.mkdir(parents=True, exist_ok=True)
    (OUT / rel_v).write_bytes(data)
    tag = f'<link rel="stylesheet" href="/{rel_v}">' if is_css else f'<script src="/{rel_v}"></script>'
    lines[start - 1:end] = [tag]
    print(f'{start}-{end} -> {rel_v} ({len(data):,} bytes)')

html = '\n'.join(lines)
m = re.search(r'src="data:image/webp;base64,([A-Za-z0-9+/=]+)"', html)
assert m and html.count('data:image/webp') == 1
img = base64.b64decode(m.group(1))
img_rel = versioned('assets/img/hero-fort.webp', img)
(OUT / img_rel).parent.mkdir(parents=True, exist_ok=True)
(OUT / img_rel).write_bytes(img)
html = html[:m.start()] + f'src="/{img_rel}"' + html[m.end():]
print(f'hero image -> {img_rel} ({len(img):,} bytes)')

(OUT / 'index.html').write_text(html, encoding='utf-8')
print(f'index.html: {len(html.encode()):,} bytes')
