"""Targeted body refinement; retain all thirteen concepts and existing introductions."""
from pathlib import Path
import re,hashlib,json,base64,mimetypes
ROOT=Path(__file__).resolve().parents[1]/'review'
PAGE=ROOT/'07-proposal-immersive.html'
code=PAGE.read_text(encoding='utf-8')
story='''<section class="story" id="story" aria-labelledby="story-title">
 <div class="wrap story-heading"><div><p class="k">A personal perspective</p><h2 id="story-title">A new chapter.<br>A familiar <em>face.</em></h2></div><p>Someone who knows the questions, the small details and the feeling of starting again.</p></div>
 <div class="rail" id="rail">
  <article class="chap founder"><div class="img"><img src="assets/jury-photo-about_founder-1440.webp" width="1000" height="1374" alt="Christa Brokke, founder of Moving2Valencia" loading="lazy" decoding="async"></div><div class="chap-copy"><p class="yr">Your guide to Valencia</p><h3>It starts with<br>someone who<br><em>understands.</em></h3><p>In September 2004, Christa moved to the Valencia region with her family. She knows how much a new beginning can hold.</p><p style="margin-top:20px">Today, she brings that first-hand perspective to your move. Your priorities come first. The next steps become clearer.</p><p class="founder-signature">Christa Brokke</p><p class="founder-role">Founder, Moving2Valencia · Established 2008</p><a class="story-link" href="#book">Start a conversation <span aria-hidden="true">↗</span></a></div></article>
  <article class="chap"><div class="img"><img src="assets/valencia-market-hd.webp" width="1800" height="1200" alt="The entrance to Valencia’s Central Market" loading="lazy" decoding="async"></div><div class="chap-copy"><p class="yr">01 / The local perspective</p><h3>Beyond the<br>first impression.</h3><p>The places, the paperwork, the everyday questions. Practical guidance informed by years of life in the region.</p></div></article>
  <article class="chap"><div class="img"><img src="assets/valencia-cabanyal-hd.webp" width="1800" height="1200" alt="Colourful houses on a street in El Cabanyal, Valencia" loading="lazy" decoding="async"></div><div class="chap-copy"><p class="yr">02 / Your next chapter</p><h3>A place that<br>feels like you.</h3><p>Your morning routine. Your family. Your own pace. We start with what matters to you and shape the move around it.</p></div></article>
 </div>
</section>'''
code=re.sub(r'<section class="story"[\s\S]*?</section>',story,code,count=1)
services=[('Plan','Before the move','A clear starting point, shaped around your household, budget and timing.',['Apostilles','Translations','Budget','Timeline'],'assets/valencia-market-hd.webp','Valencia’s Central Market'),('Paperwork','The practical details','Make sense of the documents, appointments and qualified advice your situation requires.',['NIE / TIE','Padrón','Bank','Health insurance'],'assets/immersive/valencia-film-poster.webp','The City of Arts and Sciences, Valencia'),('Home & school','Your everyday life','Explore neighbourhoods and school options around the way your family wants to live.',['Home search','Lease review','School visits','Enrolment'],'assets/valencia-cabanyal-hd.webp','Traditional homes in El Cabanyal, Valencia'),('Belong','Beyond arrival','Find your bearings, build local connections and ask the settling-in questions that matter.',['Coaching','Community','TIE renewals','Gestoría'],'assets/jury-photo-service_legal_docs-1440.webp','Inside Valencia’s Central Market')]
cards=[]
for i,(title,label,desc,tags,photo,alt) in enumerate(services,1):
 cards.append(f'<article class="sc"><div class="bgi"><img src="{photo}" alt="{alt}" loading="lazy" decoding="async" width="1000" height="700"></div><div class="service-copy"><div class="service-topline"><span>{label}</span><b>{i:02}</b></div><h3>{title}</h3><p>{desc}</p><ul>'+''.join('<li>'+t+'</li>' for t in tags)+'</ul><a class="story-link" href="#pricing">Explore your support <span aria-hidden="true">↗</span></a></div></article>')
section='<section class="stack" id="services"><div class="wrap"><p class="k" data-i="svcK">Personal relocation support</p><h2 class="big-h" data-i="svcH">The details.<br>The bigger <em>picture.</em></h2><div class="service-grid">'+''.join(cards)+'</div></div></section>'
code=re.sub(r'<section class="stack"[\s\S]*?</section>',section,code,count=1)
film='''<section class="voices" id="film" aria-labelledby="voice"><div class="wrap vgrid">
 <div class="film-heading"><div><p class="k">A moment in Valencia</p><h2 class="voice" id="voice">See the city.<br>Feel the possibility.</h2></div><p class="ph">From the City of Arts and Sciences to the Mediterranean shore. A little glimpse of the place your next chapter could begin.</p></div>
 <figure><div class="valencia-cinema"><video id="valencia-documentary" muted playsinline preload="none" poster="assets/immersive/valencia-film-poster.webp" data-hd="assets/immersive/valencia-film-1080.mp4" data-phone="assets/immersive/valencia-film-720.mp4" aria-label="Valencia film: the City of Arts and Sciences and the Mediterranean beachfront"></video><button class="cinema-start" data-cinema-play type="button" aria-label="Play the Valencia film"><i aria-hidden="true">▶</i><span>Watch a moment in Valencia · 25 seconds</span></button></div><figcaption class="film-meta"><span>Valencia, Spain · Filmed on location</span><a href="photo-credits.html#immersive-documentary">Film credits ↗</a></figcaption></figure><p class="film-error" id="cinema-error" role="status" hidden>The film could not load. <a href="assets/immersive/valencia-film-1080.mp4">Open the HD film directly ↗</a></p>
</div></section>'''
code=re.sub(r'<section class="voices"[\s\S]*?</section>',film,code,count=1)
code=re.sub(r'(<section class="end" id="book">)<video[\s\S]*?</video>',r'\1<video autoplay muted loop playsinline preload="none" poster="assets/immersive/valencia-shore-poster.webp" data-hd="assets/immersive/valencia-shore-1080.mp4" data-phone="assets/immersive/valencia-shore-720.mp4" aria-hidden="true"></video>',code,count=1)
code=re.sub(r'/\* ---------- story dots \+ active dock ---------- \*/[\s\S]*?const links=', '/* ---------- active dock ---------- */\nconst links=',code,count=1)
code=re.sub(r'  /\* word-by-word quote reveal \*/[\s\S]*?(?=  gsap.utils.toArray)', '',code,count=1)
code=code.replace('All twelve concepts','All 13 concepts').replace('Review all twelve concepts','Review all 13 concepts')
version=hashlib.sha256(((ROOT/'immersive-refinement.css').read_text()+(ROOT/'immersive-refinement.js').read_text()+story+section+film).encode()).hexdigest()[:10]
code=re.sub(r'<link rel="stylesheet" href="immersive-refinement.css[^>]*>|<script src="immersive-refinement.js[^>]*></script>','',code)
code=code.replace('</head>','<link rel="stylesheet" href="immersive-refinement.css?v='+version+'"><script src="immersive-refinement.js?v='+version+'" defer></script></head>')
PAGE.write_text(code,encoding='utf-8')
print('Updated Immersive Valencia body:',version)
