"""Check a local build, or exercise the same release over HTTP using --origin."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET

from build_guides import ORIGIN, PUBLIC, GROUPS, build


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.tags = []
        self.schemas = []
        self.in_schema = False
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        self.tags.append((tag, data))
        if tag == "script":
            self.in_schema = data.get("type") == "application/ld+json"

    def handle_data(self, data):
        if self.in_schema:
            self.schemas.append(json.loads(data))

    def handle_endtag(self, tag):
        if tag == "script":
            self.in_schema = False

    def values(self, tag, attr):
        return [data[attr] for name, data in self.tags if name == tag and attr in data]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def request(origin, path):
    req = Request(origin + path, headers={"User-Agent": "JaisalmerVisit/ReleaseCheck", "Accept": "*/*"})
    try:
        with urlopen(req, timeout=30) as response:
            return response.status, response.headers, response.read()
    except HTTPError as error:
        return error.code, error.headers, error.read()


def sitemap_paths(data):
    tree = ET.fromstring(data)
    urls = [loc.text for loc in tree.findall(".//{*}loc")]
    require(len(set(urls)) == len(urls), "Duplicate sitemap URL")
    require(all(url.startswith(ORIGIN + "/") for url in urls), "Incorrect sitemap host")
    return [urlsplit(url).path for url in urls]


def check(origin=None):
    build(check=True)
    paths = sitemap_paths((PUBLIC / "sitemap.xml").read_bytes())
    guides = set(paths) - {"/", "/privacy"}
    resources = {"/admin/", "/ads.txt", "/robots.txt", "/sitemap.xml", "/workneed"}
    if origin:
        def fetch(path):
            status, headers, body = request(origin, path)
            require(status == 200, f"HTTP {status} at {path}")
            if path == "/admin/":
                require("noindex" in headers.get("X-Robots-Tag", ""), "Admin indexing header missing")
            return path, body
        with ThreadPoolExecutor(max_workers=5) as pool:
            bodies = dict(pool.map(fetch, sorted(set(paths) | resources)))
        require(set(sitemap_paths(bodies["/sitemap.xml"])) == set(paths), "Deployed sitemap differs")
        require(request(origin, "/missing-travel-guide-for-release-check")[0] == 404, "Missing route returned a soft 404")
        for path in ("/ads.txt", "/robots.txt"):
            require(bodies[path].decode().splitlines() == (PUBLIC / path[1:]).read_text().splitlines(), path)
    else:
        bodies = {"/": (PUBLIC / "index.html").read_bytes()}
        bodies.update({p: (PUBLIC / (p[1:] + ".html")).read_bytes() for p in paths if p != "/"})
    home = Page(bodies["/"].decode("utf-8"))
    require(guides.issubset(home.values("a", "href")), "Homepage is missing a static guide link")
    assets = {link for link in home.values("script", "src") + home.values("link", "href") if link.startswith("/assets/")}
    # Booted app modules are URLs in the inline VJData.boot list rather than script tags.
    assets.update(re.findall(r"['\"](/assets/[^'\"]+\.js)['\"]", bodies["/"].decode("utf-8")))
    titles, descriptions = set(), set()
    for path in sorted(guides):
        page = Page(bodies[path].decode("utf-8"))
        require(sum(tag == "h1" for tag, _ in page.tags) == 1, f"Expected one H1 at {path}")
        canonical = [a.get("href") for t, a in page.tags if t == "link" and a.get("rel") == "canonical"]
        require(canonical == [ORIGIN + path], f"Bad canonical at {path}")
        require(all(a.get("alt", "").strip() for t, a in page.tags if t == "img"), f"Missing photo description at {path}")
        metadata = {a.get("name", a.get("property")): a.get("content") for t, a in page.tags if t == "meta"}
        require(metadata.get("og:image") and metadata.get("og:title") and metadata.get("description"), f"Missing sharing metadata at {path}")
        titles.add(metadata["og:title"])
        descriptions.add(metadata["description"])
        entity = page.schemas[0]["@graph"][0]
        require(entity["@type"] == GROUPS[path.split("/")[1]][2] and entity["url"] == ORIGIN + path, f"Incorrect schema at {path}")
        for href in page.values("a", "href"):
            dest = urlsplit(href)
            if not dest.netloc and dest.path:
                require(dest.path in paths, f"{path} links to missing {href}")
        assets.update(v for v in page.values("script", "src") + page.values("link", "href") if v.startswith("/assets/"))
    require(len(titles) == len(guides) and len(descriptions) == len(guides), "Guide titles or descriptions repeat")
    for path in (PUBLIC / "assets").rglob("*"):
        match = re.search(r"\.([a-f0-9]{8})\.[^.]+$", path.name)
        if path.is_file() and match:
            require(sha256(path.read_bytes()).hexdigest()[:8] == match[1], f"Rehash {path.name}")
    for path in sorted(assets):
        require((PUBLIC / path[1:]).is_file(), f"Missing local asset {path}")
    if origin:
        with ThreadPoolExecutor(max_workers=5) as pool:
            for path, body in pool.map(fetch, sorted(assets)):
                require(body == (PUBLIC / path[1:]).read_bytes(), f"Deployed asset differs at {path}")
    print(f"Passed {len(guides)} guide pages, {len(paths)} sitemap URLs and {len(assets)} referenced assets at {origin or 'local build'}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--origin", help="A Pages preview or production origin")
    args = parser.parse_args()
    check(args.origin.rstrip("/") if args.origin else None)
