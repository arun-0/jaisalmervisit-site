#!/usr/bin/env python3
"""Point canonical / Open Graph / robots / sitemap URLs at the production domain.

    python3 scripts/set-domain.py https://visitjaisalmer.in

Replaces whatever https://… origin those files currently use. Run it once the custom
domain is connected in Firebase Hosting, then deploy.
"""
import pathlib, re, sys

if len(sys.argv) != 2 or not re.match(r'^https://[a-z0-9.-]+$', sys.argv[1]):
    sys.exit('Usage: python3 scripts/set-domain.py https://your-domain (no trailing slash)')
new = sys.argv[1]
PUBLIC = pathlib.Path(__file__).resolve().parent.parent / 'public'
html = (PUBLIC / 'index.html').read_text(encoding='utf-8')
old = re.search(r'<link rel="canonical" href="(https://[^/"]+)/">', html).group(1)
for name in ('index.html', 'robots.txt', 'sitemap.xml'):
    f = PUBLIC / name
    t = f.read_text(encoding='utf-8')
    f.write_text(t.replace(old, new), encoding='utf-8')
    print(f'{name}: {t.count(old)} × {old} → {new}')
