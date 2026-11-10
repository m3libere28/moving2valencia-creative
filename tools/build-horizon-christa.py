"""Build Christa's Horizon II preview from the preserved client edition.

Pass the Round 3 PDF path to extract its exact bold, Classic R5 proof. The
generator only needs that private file when refreshing the two logo previews.
"""
from base64 import b64encode
from pathlib import Path
import re
import sys

REVIEW = Path(__file__).resolve().parents[1] / 'review'
SOURCE = REVIEW / 'client-editions/new-horizon-ii'
OUTPUT = REVIEW / 'client-editions/new-horizon-ii-review'
GOOGLE = 'https://www.google.com/maps?cid=10361883075186195757'

html = (SOURCE / 'index.html').read_text(encoding='utf-8')


def swap(old, new):
    global html
    assert old in html, old
    html = html.replace(old, new)


def cut(pattern):
    global html
    html, count = re.subn(pattern, '', html, count=1, flags=re.S)
    assert count == 1, pattern


swap('A New Horizon II · Client archive edition', 'A New Horizon II · Christa’s review')
swap('data-client-edition="new-horizon-ii"', 'data-client-edition="new-horizon-ii" data-christa-preview')
swap('</head>', '<link rel="stylesheet" href="christa.css?v=vision-audit"></head>')
swap('plays once per session in front of the hero', 'replays on refresh in front of the hero')
swap('   plays once per session and never under reduced motion.', '   replays on refresh and respects reduced motion.')
swap('  var play = false;\n  try {\n    play = !sessionStorage.getItem("m2v-intro-seen") &&\n      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;\n  } catch (e) { play = false; }\n  if (play){', '''  var navigation = performance.getEntriesByType("navigation")[0];
  var reload = navigation ? navigation.type === "reload" : performance.navigation && performance.navigation.type === 1;
  var play = (reload || !location.hash) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!play && !reload && location.hash){
    document.addEventListener("DOMContentLoaded", function(){
      var target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView({behavior:"instant"});
    }, {once:true});
  }
  if (play){
    if (reload){
      // Refresh means start from the beginning. Shared section links still land directly.
      if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
      if ("scrollRestoration" in history){
        var previousMode = history.scrollRestoration;
        history.scrollRestoration = "manual";
        window.addEventListener("pageshow", function(){
          setTimeout(function(){ history.scrollRestoration = previousMode; }, 0);
        }, { once:true });
      }
    }''')
swap('International relocation services</span>', 'Relocation Support</span>')
swap('International Relocation Services — personal support', 'Relocation Support — personal support')
swap('    <span class="bname">Moving2Valencia</span>\n    <span class="bsub">International Relocation Services</span>',
     '    <img class="christa-brand" src="r5-bold.svg" width="720" height="409" alt="Moving2Valencia · Relocation Support">')
swap('    <div class="sp-brand"><strong>Moving2Valencia</strong><span>Relocation Support</span></div>',
     '    <div class="sp-brand"><img class="christa-brand" src="r5-bold.svg" width="720" height="409" alt="Moving2Valencia · Relocation Support"></div>')
swap('— back to top', 'Relocation Support — back to top')
swap('    <a href="#faq">FAQ</a>', '    <a href="#reviews">Google reviews</a>\n    <a href="#faq">FAQ</a>')
swap('<a href="#route">Your route</a>', '<a href="#route">Services</a>')
swap('<a href="#person">Your guide</a>', '<a href="#person">About Christa</a>')
swap('Start a conversation</a>', 'Send an enquiry</a>')
swap('  <button class="motion-toggle" id="motionToggle"', '  <a class="mobile-services" href="#route">Services</a>\n  <button class="motion-toggle" id="motionToggle"')
swap('<span class="dot" aria-hidden="true"></span><span id="motionLabel">', '<span class="dot" aria-hidden="true"></span><span class="motion-glyph" aria-hidden="true"></span><span id="motionLabel">')
swap('          <a class="btn btn-ghost" href="#route">See how it works</a>',
     '          <a class="btn btn-ghost" href="#route">Explore services</a>\n          <a class="hero-reviews" href="#reviews">Google reviews <span aria-hidden="true">↓</span></a>')
swap('from the first call to your first weeks at home', 'from your first enquiry to your first weeks at home')

swap('--teal:#2E6665; --teal-deep:#173F3E; --teal-ink:#0F2B2A;',
     '--teal:#8C3B24; --teal-deep:#683723; --teal-ink:#48281E;')
swap('--teal:#2E6665;       /* site teal, accents only */', '--teal:#8C3B24;       /* warm accent */')
swap('--soft-on-dark:#C9D6D2;', '--soft-on-dark:#F0D9C7;')
swap('background:#0B2221;', 'background:#43251B;')
swap('#132E3A 0%,#1D4A4A 34%,#7A5A3E 68%,#0F2B2A 100%', '#62341F 0%,#824E36 34%,#76503B 68%,#45271D 100%')
swap('rgba(15,32,31,', 'rgba(63,32,21,')
swap('rgba(11,24,23,.86)', 'rgba(54,28,20,.86)')

cut(r'\n            <div class="svc">\s*<button[^>]+aria-controls="svc-culture"[^\n]+\n[^\n]+\n            </div>')
cut(r'\n +<button[^>]+data-service="Intercultural Workshops"[^\n]+')
cut(r'\n +<li>Intercultural Workshops</li>')
swap('School Finding, Intercultural Workshops; help', 'School Finding; help')
swap('home finding, school finding, formalities, workshops', 'home finding, school finding and formalities')
swap('The route, <em>step by step.</em>', 'The route, <em>at your pace.</em>')
swap('<span class="no">Chapter four</span> Your route to arrival', '<span class="no">Chapter four</span> Relocation services')
swap('<h2 id="route-h">The route, <em>at your pace.</em></h2>', '''<h2 id="route-h">The route, <em>at your pace.</em></h2>
      <div class="service-shortcuts">
        <p>Explore the support that fits your move. The order depends on your plans and the kind of school you’re considering.</p>
        <a href="#packages">See relocation packages <span aria-hidden="true">↓</span></a>
      </div>''')
swap('A home, a school', 'Home &amp; school')
swap('The two anchors of a new life, searched on the ground in Valencia — not from another continent, weeks behind the listings.',
     'Christa helps you look for a home and a school in Valencia. Where you start depends on the kind of school you’re considering.')
swap('            <div class="svc">\n              <button type="button" aria-expanded="false" aria-controls="svc-home">',
     '''            <aside class="school-sequence" aria-labelledby="school-sequence-title">
              <h4 id="school-sequence-title">What comes first: home or school?</h4>
              <p><strong>Private schools:</strong> Families usually start with the school search, then look for a home that makes the school run practical.</p>
              <p><strong>Public and state-funded private schools (concertados):</strong> Families usually start with their address and local registration (<em>padrón</em>) before arranging school placement. Christa can help you check what applies to your family.</p>
            </aside>
            <div class="svc">
              <button type="button" aria-expanded="false" aria-controls="svc-home">''')
swap('Finding the right fit for your children is a crucial part of the move. School finding support helps you compare options and settle the question early, because it shapes where and how you live.',
     'Christa helps you compare schools, arrange visits and work through enrolment. When you start depends on your children’s needs and the type of school you choose.')
swap('Legal advice &amp; negotiation', 'Contracts &amp; practical support')
swap('Support understanding contracts and terms before you sign — including rental agreements — and help negotiating, so local paperwork doesn\'t become expensive guesswork.',
     'Christa helps you work through practical questions about rental agreements and can connect you with a local specialist when needed.')
swap('Help finding your home in Valencia, whether you are renting or buying — searching, viewing and judging properties with local eyes, against the life you described in the planning stage.',
     'Christa helps you shortlist homes, arrange viewings and work through practical questions before you decide where to live.')
swap('Select the help you\'d want — the plan on the right orders itself the way Christa would sequence it — then carry it straight into your first email. Nothing is priced or promised here; the conversation works out the details.',
     'Select the help you’d like, then add it to your enquiry. The list shows your priorities; Christa can help you work out what needs to happen first.')
swap('Your route, so far', 'Your priorities, so far')
swap('Tap the pieces on the left and they will line up here — in the order they\'d actually happen.', 'Select the services you’re interested in to build a list for Christa.')
swap('What happens in the first conversation?', 'What happens after I send an enquiry?')
swap('You describe the life you\'re moving toward — who\'s coming, roughly when, what matters most. Christa explains how she can help, which services fit your situation, and what the sensible first steps are. You leave with a clear picture, whether or not you go further.',
     'Tell Christa who’s moving, roughly when and what you need help with. She’ll send you information about the services and fees. If it feels like a fit, you can arrange a call.')
swap('Individuals, couples and families moving to Valencia — and employers relocating an employee.', 'Individuals, couples and families moving to Valencia and the surrounding area.')
swap('Christa replies personally</b> and you arrange a time to talk, within office hours, Mon–Fri 09:00–19:00.',
     'Christa replies with information and fees.</b> If you’d like to go ahead, you can then arrange a call.')
swap('No forms to a void, no commitment hidden in the small print. You write, Christa reads it herself, and the two of you talk.',
     'Tell Christa a little about your move and what you need help with. She’ll reply personally with information on the services that fit and what they cost.')
swap('Tel / WhatsApp — <a href="https://wa.me/34648117862" target="_blank" rel="noopener">+34 648 117 862</a>',
     '<a href="tel:+34648117862">Call +34 648 117 862</a> · <a href="https://wa.me/34648117862" target="_blank" rel="noopener">Message on WhatsApp</a>')

swap('Not a call centre. <em>A person.</em>', 'Meet <em>Christa Brokke.</em>')
swap('<p><strong>Christa Brokke</strong> is the relocation consultant behind Moving2Valencia — and the person you will actually deal with. Based in Valencia, she supports individuals, couples, families and employees relocating here, on every aspect of the move.</p>',
     '<p>I moved to Valencia with my family in 2004. I know how exciting a move can feel and how many decisions there are to make before you can settle in. I’m now an independent relocation consultant, working with individuals, couples and families moving to Valencia and the surrounding area.</p>')
swap('<p>Her approach, in the business\'s own words, is to take the tangle out of your hands: comprehensive relocation support built on years of experience, thorough knowledge of the local market, and strong local networks — so you can adapt quickly and calmly, and avoid the isolation of figuring out a strange country alone.</p>',
     '<p>Before relocation work, I was an opera stage manager. A lot of the job happened out of sight: keeping track of timings, people and last-minute changes so the evening could go ahead. That experience still shapes how I work. I help you see what needs doing now, what can wait and who to speak to next.</p>')
swap('<p>One point of contact means nothing is lost between departments: the person who hears what your life should look like is the person searching for your home, standing in the paperwork queue, and answering when the small questions come.</p>',
     '<p>You’ll deal with me directly, whether you need help finding a home, looking at schools, working through Spanish paperwork or getting settled once you arrive.</p>')

swap('<div class="ph"><img src="img/83651e4d.webp" srcset="img/461b5fd1.webp 640w, img/83651e4d.webp 1280w" sizes="(max-width:880px) 100vw, 55vw" alt="The Mercado de Colón, Valencia&#x27;s modernista market in the Eixample" loading="lazy"></div>',
     '''<figure class="ph christa-city">
          <div class="city-sea" id="city-sea">
            <img src="../../assets/valencia-coast-hd.webp" width="1672" height="941" alt="A sunny Mediterranean beach and seafront promenade" loading="lazy" decoding="async">
            <img class="city-sea-city" src="../../assets/valencia-morning-hd.webp" width="1672" height="941" alt="People walking past a café and orange trees on a sunlit street" loading="lazy" decoding="async">
            <div class="city-sea-divider" aria-hidden="true"><span>‹ ›</span></div>
            <span class="city-sea-label city-sea-label-city" aria-hidden="true">City</span><span class="city-sea-label city-sea-label-sea" aria-hidden="true">Sea</span>
          </div>
          <div class="city-sea-controls" hidden>
            <label for="city-sea-slider">Slide between city life and sea air</label>
            <input id="city-sea-slider" type="range" min="0" max="100" value="70" aria-valuetext="70% city, 30% sea">
          </div>
          <figcaption>City and coast · illustrations from proposal 11</figcaption>
        </figure>''')
swap('All photographs are real and used under their Creative Commons licences;', 'The city and coast illustrations are from proposal 11. The listed photographs are used under their Creative Commons licences;')
swap('The move is the journey between the two.</p>', '''The move is the journey between the two.</p>
        <a class="city-sea-jump" href="#belong">Explore the city and the coast <span aria-hidden="true">↓</span></a>''')

planner_marker = '  <!-- ============ BUILD YOUR MOVE — INTERACTIVE PLANNER ============ -->'
swap(planner_marker, '''  <section class="christa-packages" id="packages" aria-labelledby="packages-h">
    <div class="wrap">
      <p class="chapter-tag">Relocation packages</p>
      <h2 id="packages-h">Choose the support that <em>fits your move.</em></h2>
      <div class="christa-package-grid">
        <article>
          <h3>Basic Homefinding</h3>
          <p>For people who mainly need help finding a home. Includes the home search, help setting up a bank account and mobile phone, and two weeks of online support.</p>
        </article>
        <article>
          <h3>Basic Package</h3>
          <p>For a move that needs some planning and paperwork. Includes pre-move guidance, a home search, help with your NIE, banking and home insurance, and two months of online support.</p>
        </article>
        <article>
          <h3>Family Package</h3>
          <p>For families arranging a home and school. Includes pre-move guidance, both searches, help with local registration and other paperwork, and two months of online support.</p>
        </article>
        <article>
          <h3>Tailormade Package</h3>
          <p>For a move that needs a different mix of services. Tell Christa which parts you’d like help with and she’ll put together a proposal.</p>
        </article>
      </div>
      <p><a href="#start">Ask about a package</a>. Christa will confirm what’s included and share the fees in her reply.</p>
    </div>
  </section>

''' + planner_marker)

reviews = (
    (
        'Boombap Conissour',
        'It felt like concierge service. She guided us through each step, and her local connections gave us confidence that we were in experienced hands.',
        'https://maps.app.goo.gl/wuR94andqYxRHjN47',
    ),
    ('Anna Madarasz', 'She gave us confidence'),
    ('Elly Johnson', 'will save you so much stress'),
    ('Bee Avila', 'she really did make us feel welcomed'),
)


def review_card(person, excerpt, url=None):
    source = (
        f'<a href="{url}" target="_blank" rel="noopener">Read this review on Google</a>'
        if url else '<span>Google review excerpt</span>'
    )
    return f'''<figure class="christa-quote">
      <span class="christa-stars" role="img" aria-label="5 out of 5 stars">★★★★★</span>
      <blockquote>“{excerpt}”</blockquote>
      <figcaption><strong>{person}</strong>{source}</figcaption>
    </figure>'''


leap_marker = '  <!-- ============ CHAPTER 3 · THE LEAP ============ -->'
swap(leap_marker, f'''  <section class="christa-reviews" id="reviews" aria-labelledby="reviews-h">
    <div class="wrap christa-review-grid">
      <div>
        <p class="chapter-tag">Google reviews</p>
        <h2 id="reviews-h">What clients say</h2>
        <p>See what people wrote about working with Christa on their move to Valencia.</p>
        <a class="btn btn-terra" href="{GOOGLE}">Read the full reviews on Google <span aria-hidden="true">↗</span></a>
      </div>
      <div>
        {review_card(*reviews[0])}
        <details class="christa-more">
          <summary>Read more review excerpts <span class="christa-details-icon" aria-hidden="true"></span></summary>
          <div class="christa-more-quotes">{''.join(review_card(*review) for review in reviews[1:])}</div>
        </details>
      </div>
    </div>
  </section>

{leap_marker}''')
swap('          <li><a href="#person">About Christa</a></li>', '          <li><a href="#person">About Christa</a></li>\n          <li><a href="#reviews">Google reviews</a></li>')
swap('Imported separately for design review. Service scope and fees are discussed personally. Supplied imagery credits are retained.',
     'Warm-colour revision for Christa Brokke.')
swap('<a href="media-credits.html">Supplied photography credits ↗</a><a href="../../jury-review.html">Return to the twelve-concept review ↗</a>',
     '<a href="compare.html">Compare the two R5 treatments ↗</a><a href="../../horizon-directions/">Return to the website directions ↗</a>')

# Reuse the archive’s media and motion libraries from the sibling directory.
html = re.sub(r'(?<![\w./-])(img|fonts|js)/', r'../new-horizon-ii/\1/', html)
swap('"../new-horizon-ii/js/site.js"', '"christa-site.js"')
swap('src="../new-horizon-ii/js/splash.js"', 'src="christa-splash.js?v=replay"')
for asset in ('icon.svg', 'favicon.ico', 'apple-touch-icon.png', 'site.webmanifest', 'og.jpg'):
    html = html.replace(f'href="{asset}"', f'href="../new-horizon-ii/{asset}"')
site = (SOURCE / 'js/site.js').read_text(encoding='utf-8')
site = re.sub(r'^  function introSeen\(\).*\n|^ +introSeen\(\);[^\n]*\n', '', site, flags=re.M)
site = re.sub(r'(?<![\w./-])img/', '../new-horizon-ii/img/', site)
site = site.replace('pieces chosen — in route order', 'services selected').replace('1 piece chosen — a focused start', '1 service selected')
site = site.replace('rgba(30,60,70,.06)', 'rgba(87,46,25,.06)').replace('rgba(150,200,230,.12), rgba(30,70,90,.08)', 'rgba(255,194,141,.12), rgba(106,57,35,.08)')
site = site.replace('offset: -70, duration:', 'offset: -(document.getElementById("topbar").offsetHeight + 10), duration:')
site = site.replace('if (start) start.scrollIntoView({ behavior: motionOff ? "auto" : "smooth" });\n    if (msg) setTimeout(function(){ msg.focus({ preventScroll: true }); }, motionOff ? 60 : 700);', '''function focusMessage(){ if (msg) msg.focus({ preventScroll: true }); }
    if (start && lenis && !motionOff){
      lenis.scrollTo(start, {offset: -(document.getElementById("topbar").offsetHeight + 10), duration: 1, onComplete: focusMessage});
    } else {
      if (start) start.scrollIntoView({behavior: motionOff ? "instant" : "smooth"});
      setTimeout(focusMessage, motionOff ? 60 : 700);
    }''')
site += '''\n// Keep the comparison usable with a mouse, touch or the native range keys.\n(function(){
  var slider = document.getElementById("city-sea-slider");
  var stage = document.getElementById("city-sea");
  if (!slider || !stage) return;
  function update(){
    var city = Number(slider.value);
    stage.style.setProperty("--city", city + "%");
    slider.setAttribute("aria-valuetext", city + "% city, " + (100 - city) + "% sea");
  }
  stage.classList.add("city-sea-ready");
  slider.parentElement.hidden = false;
  slider.addEventListener("input", update);
  function scrub(event){
    var rect = stage.getBoundingClientRect();
    slider.value = Math.max(0, Math.min(100, Math.round(100 * (event.clientX - rect.left) / rect.width)));
    update();
  }
  stage.addEventListener("pointerdown", function(event){
    if (!event.isPrimary || event.button !== 0) return;
    stage.setPointerCapture(event.pointerId);
    scrub(event);
  });
  stage.addEventListener("pointermove", function(event){
    if (stage.hasPointerCapture(event.pointerId)) scrub(event);
  });
  update();
})();
'''
splash = (SOURCE / 'js/splash.js').read_text(encoding='utf-8')
splash = re.sub(r'(?<![\w./-])img/', '../new-horizon-ii/img/', splash)
splash = splash.replace('once per session, never under reduced motion', 'replays on refresh and respects reduced motion')
splash = re.sub(r'^  try \{ sessionStorage\.setItem\("m2v-intro-seen", "1"\); \} catch \(e\) \{\}\n', '', splash, flags=re.M)
splash = splash.replace('window.scrollTo(0, 0)', 'window.scrollTo({top:0, left:0, behavior:"instant"})')
splash = splash.replace('INTERCULTURAL WORKSHOPS', 'SETTLING IN')
splash = splash.replace('function enterSite(){\n    if (state !== "rest") return;', 'function enterSite(){\n    if (state === "intro") toRest();\n    if (state !== "rest") return;')
OUTPUT.mkdir(parents=True, exist_ok=True)
(OUTPUT / 'index.html').write_text(re.sub(r'[ \t]+$', '', html, flags=re.M), encoding='utf-8')
(OUTPUT / 'christa-site.js').write_text(site, encoding='utf-8')
(OUTPUT / 'christa-splash.js').write_text(splash.rstrip() + '\n', encoding='utf-8')

if len(sys.argv) == 2:
    import fitz

    with fitz.open(sys.argv[1]) as pdf:
        page = pdf[2]
        assert all(s in page.get_text() for s in ('R5', 'BOLD', 'Classic'))
        entries = sorted(page.get_image_info(xrefs=True), key=lambda e: (round(e['bbox'][1]), e['bbox'][0]))
        assert len(entries) == 12 and (entries[0]['width'], entries[0]['height']) == (960, 638)
        proof = pdf.extract_image(entries[0]['xref'])
        assert proof['ext'] == 'jpeg'
        uri = 'data:image/jpeg;base64,' + b64encode(proof['image']).decode('ascii')
    for name, with_gaps in [('r5-bold.svg', False), ('r5-bold-gaps.svg', True)]:
        mask = '''<mask id="gaps" maskUnits="userSpaceOnUse" x="0" y="0" width="960" height="638">
  <path fill="white" d="M0 0h960v638H0z"/>
  <path fill="none" stroke="black" stroke-width="10" d="M475 215l-2 15M617 237l-2 12M349 291l-4 16M600 377l23 1"/>
</mask>''' if with_gaps else ''
        clip = ' mask="url(#gaps)"' if with_gaps else ''
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="133 132 720 409" width="720" height="409">
  <title>Moving2Valencia Relocation Support — R5 Bold{', interrupted lines study' if with_gaps else ''}</title>
  <defs><filter id="remove-white-matte" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 -1.72 0 1.68"/></filter>{mask}</defs>
  <g{clip}><image href="{uri}" width="960" height="638" filter="url(#remove-white-matte)"/></g>
</svg>\n'''
        (OUTPUT / name).write_text(svg, encoding='utf-8')
