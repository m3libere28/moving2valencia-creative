"""Build the three full pages from the original A New Horizon concept."""
from base64 import b64encode
from pathlib import Path
import re
import sys
from zipfile import ZIP_DEFLATED, ZipFile

review = Path(__file__).resolve().parents[1] / 'review'
out = review / 'horizon-directions'
base = (review / '15-new-horizon/index.html').read_text(encoding='utf-8')
source = '../15-new-horizon/img/'


def replace_once(page, old, new):
    assert page.count(old) == 1, old
    return page.replace(old, new, 1)


def film(kind, center):
    return f'''<dialog class="m2v-opening direction-film" data-film="{kind}" data-opener-for="a-new-horizon" data-film-duration="5200" aria-label="Moving2Valencia introduction" hidden>
  <div class="m2v-film">
    <div class="m2v-top"><span>Moving2Valencia · {center['name']}</span><button type="button" data-film-exit>Skip intro ↗</button></div>
    <div class="m2v-center direction-film-center">
      <img class="direction-film-logo" data-horizon-mark src="{source}brand-r1-classic-transparent.webp" alt="Moving2Valencia · Relocation Support" width="360" height="82">
      {center['art']}
      <h2>{center['title']}</h2>
      <p>{center['line']}</p>
    </div>
    <div class="m2v-bottom"><span>València, Espanya</span><div class="m2v-controls"><button type="button" data-film-pause aria-pressed="false">Pause motion</button><button type="button" class="m2v-enter" data-film-exit autofocus>Enter Valencia ↗</button></div></div>
    <div class="m2v-progress" aria-hidden="true"></div>
  </div>
</dialog>'''


route_art = '''<svg class="direction-map" viewBox="0 0 620 112" aria-hidden="true">
  <path class="direction-map-underlay" d="M30 78H135Q174 78 195 46T260 20H357Q402 20 429 52T498 78H590"/>
  <path class="direction-map-line" pathLength="1" d="M30 78H135Q174 78 195 46T260 20H357Q402 20 429 52T498 78H590"/>
  <circle cx="30" cy="78" r="9"/><circle cx="204" cy="37" r="9"/><circle cx="389" cy="27" r="9"/><circle cx="590" cy="78" r="9"/>
</svg>'''

portrait_art = f'''<div class="direction-portrait-film" aria-hidden="true">
  <figure class="direction-print direction-print-street"><img src="{source}el-carmen-square-800.webp" alt="" width="800" height="533"></figure>
  <figure class="direction-print direction-print-christa"><img src="{source}christa-600.webp" alt="" width="600" height="824"></figure>
  <figure class="direction-print direction-print-coast"><img src="{source}malvarrosa-sky-800.webp" alt="" width="800" height="600"></figure>
</div>'''

route_index = '''<aside class="direction-route-index" aria-label="Find relocation services">
  <p>Where would you like to start?</p>
  <ol>
    <li><a href="#service-plan"><span>01</span> Plan your move <b aria-hidden="true">↘</b></a></li>
    <li><a href="#service-paperwork"><span>02</span> Sort out paperwork <b aria-hidden="true">↘</b></a></li>
    <li><a href="#service-home"><span>03</span> Find a home or school <b aria-hidden="true">↘</b></a></li>
    <li><a href="#service-settle"><span>04</span> Settle in <b aria-hidden="true">↘</b></a></li>
  </ol>
</aside>'''

directions = {
    'coastal-story': {'name': 'The Coastal Story'},
    'clear-route': {
        'name': 'A Clear Route',
        'title': 'A path takes <em>shape.</em>',
        'line': 'Plan · Prepare · Arrive · Settle',
        'art': route_art,
        'headline': ('Start with', 'a clear plan.'),
        'intro': 'Find the support you need for your move to Valencia. Start with home finding, school search, paperwork or settling in, and take it one step at a time with Christa Brokke.',
        'hero_image': ('plaza-virgen-1200.webp', 'plaza-virgen-800.webp', 'People crossing Plaza de la Virgen in the old town of Valencia.'),
        'photo_note': 'Plaça de la Mare de Déu · València',
        'waypoint': 'ARRIVE',
        'order': ('route', 'packages', 'life', 'begin', 'christa', 'reviews'),
    },
    'personal-welcome': {
        'name': 'A Personal Welcome',
        'title': 'Hola. I’m <em>Christa.</em>',
        'line': 'Your local guide to a new life in Valencia.',
        'art': portrait_art,
        'headline': ('A familiar face', 'in a new city.'),
        'intro': 'I made Valencia my home in 2004. As an independent relocation consultant, I now help individuals, couples and families find their feet here, from the first practical questions to the everyday details.',
        'hero_image': ('christa-1000.webp', 'christa-600.webp', 'Christa Brokke smiling beside an old wooden doorway in Valencia.'),
        'photo_note': 'Christa Brokke · Independent relocation consultant',
        'waypoint': 'BELONG',
        'order': ('christa', 'reviews', 'route', 'packages', 'life', 'begin'),
    },
}


def reorder(page, order):
    sections = re.compile(r'<section\b[^>]*\bid="(life|begin|route|packages|christa|reviews)"[^>]*>.*?</section>', re.S)
    originals = list(sections.finditer(page))
    assert len(originals) == len(order)
    by_id = {match[1]: match[0] for match in originals}
    return page[:originals[0].start()] + '\n\n'.join(by_id[key] for key in order) + page[originals[-1].end():]


def build(slug, direction):
    page = base.replace('img/', source).replace('vendor/', '../15-new-horizon/vendor/')
    page = re.sub(r'url\((?:\./)?fonts/', 'url(../15-new-horizon/fonts/', page)
    page = replace_once(page, '<title>A New Horizon</title>', f'<title>{direction["name"]} · Moving2Valencia</title>')
    page = replace_once(page, '<body data-jury-concept=', f'<body data-direction="{slug}" data-jury-concept=')
    page = replace_once(page, '</head>', '<link rel="stylesheet" href="directions.css"></head>')
    page = page.replace('href="../?concept=a-new-horizon#preview"', 'href="./#compare" target="_top"')
    page = page.replace('href="../jury-review.html"', 'href="./" target="_top"')
    page = page.replace('Back to website selection ↗', 'Back to Christa’s three directions ↗').replace('Review all concepts ↗', 'Compare the three directions ↗')
    if slug == 'coastal-story':
        return page

    page = re.sub(r'\n<style id="horizon-runner-style">.*?</style>', '', page, flags=re.S)
    page, count = re.subn(r'<dialog class="m2v-opening".*?</dialog>', lambda _: film(slug, direction), page, count=1, flags=re.S)
    assert count == 1
    image = re.search(r'<img class="hero-photo"[^>]+>', page)[0]
    large, small, alt = direction['hero_image']
    small_width, large_width = (600, 1000) if slug == 'personal-welcome' else (800, 1200)
    sizes = '(min-width: 900px) 51vw, 100vw' if slug == 'personal-welcome' else '100vw'
    page = replace_once(page, image, f'<img class="hero-photo" src="{source}{large}" srcset="{source}{small} {small_width}w, {source}{large} {large_width}w" sizes="{sizes}" fetchpriority="high" decoding="async" alt="{alt}">')
    page = replace_once(page, f'<link rel="preload" as="image" href="{source}malvarrosa-sky-1600.webp" type="image/webp">', '')
    page = replace_once(page, 'Imagine your life</span>', direction['headline'][0] + '</span>')
    page = replace_once(page, '<em>in Valencia.</em>', f'<em>{direction["headline"][1]}</em>')
    page = replace_once(page, '</span></span><span class="h1-line">', '</span></span> <span class="h1-line">')
    page = replace_once(page, 'Moving to Valencia? I’m Christa Brokke, an independent relocation consultant. I help individuals, couples and families find a home, choose a school, sort out paperwork and settle into life here.', direction['intro'])
    page = replace_once(page, 'Relocation support by Christa Brokke · Photography credited below.', direction['photo_note'])
    page = replace_once(page, 'aria-hidden="true">IMAGINE</div>', f'aria-hidden="true">{direction["waypoint"]}</div>')
    page = re.sub(r'Chapter [2-7] · ', '', page)
    page = reorder(page, direction['order'])
    page, count = re.subn(r'var heroImg = \$\("\.hero-photo"\), heroStage = \$\("\.hero-stage"\), PHOTO_HZ = \.842;.*?\n  }\n  if \(heroImg\)',
        '''var heroImg = $(".hero-photo"), heroStage = $(".hero-stage");
  function alignHorizon(){
    heroStage.style.setProperty("--hz", Math.round(heroStage.clientHeight * .82) + "px");
  }
  if (heroImg)''', page, count=1, flags=re.S)
    assert count == 1
    if slug == 'clear-route':
        page = replace_once(page, '        </div>\n    </div>\n    <div class="horizon"', route_index + '\n        </div>\n    </div>\n    <div class="horizon"')
        for number, key in enumerate(('plan', 'paperwork', 'home', 'settle')):
            page = replace_once(page, f'<article class="stage" data-stage="{number}">', f'<article class="stage" data-stage="{number}" id="service-{key}">')
    if slug == 'personal-welcome':
        page = replace_once(page, '<a class="btn btn-line" href="#route">Explore services</a>', '<a class="btn btn-line" href="#christa">Meet Christa</a>')
    return page


for key, details in directions.items():
    page = re.sub(r'(?m)^[ \t]+$', '', build(key, details))
    (out / f'{key}.html').write_text(page, encoding='utf-8', newline='\n')


def package(destination):
    shared = ('jury-shell.css', 'jury-shell.js', 'jury-audit.js', 'jury-icon.svg',
              'site.webmanifest', 'm2v-openers.css', 'm2v-opener-scenes.css', 'm2v-openers.js')
    font_root = review / 'assets/jury-fonts'
    font_css = font_root / '478285d805eb7999.css'
    opener = '''<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Open Christa’s Moving2Valencia review</title>
<style>body{margin:0;background:#f7f2e9;color:#132e43;font:18px/1.55 system-ui,sans-serif}
main{width:min(100% - 2rem,42rem);margin:12vh auto}h1{font:500 clamp(2.6rem,8vw,5rem)/1 Georgia,serif}
a{display:inline-block;background:#132e43;color:#f7f2e9;padding:.75rem 1.15rem;border-radius:999px;text-decoration:none}</style>
<main><p>Prepared for Christa Brokke</p><h1>Moving2Valencia<br>Design review</h1>
<p>Extract the entire ZIP before opening the review so all three websites, photos and animations stay together.</p>
<a href="review/horizon-directions/index.html">Open the three website directions ↗</a></main></html>'''
    paths = [*out.glob('*.html'), *out.glob('*.css'), out / 'review.js',
             *(review / file for file in shared),
             *(review / '15-new-horizon/img').glob('*.webp'),
             *(review / '15-new-horizon/vendor').glob('*.js'), *font_root.glob('*.woff2')]
    published = 'https://m3libere28.github.io/moving2valencia-creative/review/'
    with ZipFile(destination, 'w', ZIP_DEFLATED, compresslevel=7) as archive:
        archive.writestr('OPEN-CHRISTAS-REVIEW.html', opener)
        for path in sorted(paths):
            name = path.relative_to(review.parent).as_posix()
            if path.parent == out and path.suffix == '.html':
                html = path.read_text(encoding='utf-8')
                html = html.replace('href="../photo-credits.html"', f'href="{published}photo-credits.html"')
                html = html.replace('href="../">Back to the full website collection', f'href="{published}">Back to the full website collection')
                archive.writestr(name, html)
            else:
                archive.write(path, name)
        fonts = re.sub(r'url\(([^)]+\.woff2)\)',
                       lambda match: 'url(data:font/woff2;base64,' + b64encode((font_root / match[1]).read_bytes()).decode() + ')',
                       font_css.read_text(encoding='utf-8'))
        archive.writestr(font_css.relative_to(review.parent).as_posix(), fonts)


if '--package' in sys.argv:
    package(out / 'Moving2Valencia-Christa-Review.zip')
