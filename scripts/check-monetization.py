"""Regression checks for independently controlled guide Auto ads and manual placements."""
from pathlib import Path
from string import Template
import unittest
import build_guides as guides

class AdvertisingTests(unittest.TestCase):
    def test_switch_and_manual_thresholds(self):
        blocks = ['<section>one</section>', '<section>two</section>', '<section>three</section>']
        publisher = 'ca-pub-9028150722368329'
        for auto, words, slots, count in [
            (False,100,[],0), (True,100,[],0),
            (False,599,['1234567890','1234567891'],0),
            (True,599,['1234567890','1234567891'],0),
            (False,600,['1234567890','1234567891'],2),
            (True,1000,['1234567890','1234567891','1234567892'],3),
        ]:
            with self.subTest(auto=auto, words=words):
                loader, body = guides.place_ads(blocks,words,publisher,slots,auto)
                self.assertEqual(loader.count('adsbygoogle.js'), int(auto or count > 0))
                self.assertEqual('\n'.join(body).count('data-ad-slot='), count)
                if not count:
                    self.assertEqual(body, blocks)

    def test_short_guide_loader_follows_consent_defaults(self):
        guide = guides.load_guide(guides.ROOT/'content/things-to-do/camel-safari.md')
        by_path = {g.path:g for group in guides.GROUPS for p in (guides.ROOT/'content'/group).glob('*.md') for g in [guides.load_guide(p)]}
        template = Template((guides.ROOT/'templates/guide.html').read_text('utf-8'))
        assets = dict(site_css='/test.css',guide_css='/guide.css',config_js='/config.js',analytics_js='/analytics.js')
        for auto in (False,True):
            html = guides.guide_html(guide,by_path,template,assets,'ca-pub-9028150722368329',[],auto)
            self.assertEqual(html.count('adsbygoogle.js'),int(auto))
            self.assertNotIn('data-ad-slot=',html)
            if auto:
                self.assertLess(html.index("gtag('consent','default'"),html.index('adsbygoogle.js'))

if __name__ == '__main__':
    unittest.main()
