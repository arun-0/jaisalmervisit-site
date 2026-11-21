#!/usr/bin/env python3
"""Keep content-hashed asset names in sync after editing a file in public/assets/.

Files under public/assets/{css,js,img,data} are named <name>.<8-hex hash>.<ext> so they can be
cached for a year. After you edit one, run:

    python3 scripts/rehash.py

It renames every file whose content no longer matches its hash and rewrites the
references in public/**/*.html, *.css and *.js, repeating until stable (a renamed
file changes the files that import it). Safe to run any time (no-op when clean).
New files can start as name.00000000.ext.
"""
import hashlib, pathlib, re

PUBLIC = pathlib.Path(__file__).resolve().parent.parent / 'public'
NAME = re.compile(r'^(?P<stem>.+)\.(?P<hash>[0-9a-f]{8})(?P<ext>\.[a-z0-9]+)$')


def one_pass():
    renames = {}
    for d in ('css', 'js', 'img', 'data'):
        for f in sorted((PUBLIC / 'assets' / d).glob('*')):
            m = NAME.match(f.name)
            if not m:
                continue
            h = hashlib.sha256(f.read_bytes()).hexdigest()[:8]
            if h != m['hash']:
                new = f.with_name(f"{m['stem']}.{h}{m['ext']}")
                f.rename(new)
                renames[f.name] = new.name
                print(f'{f.name} -> {new.name}')
    for f in PUBLIC.rglob('*'):
        if f.suffix not in ('.html', '.css', '.js') or not f.is_file():
            continue
        text = f.read_text(encoding='utf-8')
        new_text = text
        for old, new in renames.items():
            new_text = new_text.replace(old, new)
        if new_text != text:
            f.write_text(new_text, encoding='utf-8', newline='\n')
            print(f'  updated refs in {f.relative_to(PUBLIC)}')
    return renames


# A file that imports another hashed file changes when that file is renamed,
# so repeat until nothing moves.
passes = 0
while one_pass():
    passes += 1
    if passes > 10:
        raise SystemExit('rehash did not settle after 10 passes')
if not passes:
    print('All asset hashes up to date.')
