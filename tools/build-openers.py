"""Add original, theme-specific brand films without rebuilding the existing sites."""
from pathlib import Path
import base64, hashlib, html, io, json, os, re, zipfile

REPO=Path(__file__).resolve().parents[1]
ROOT=REPO/'review'
CSS=(ROOT/'m2v-openers.css').read_text(encoding='utf-8')+'\n'+(ROOT/'m2v-opener-scenes.css').read_text(encoding='utf-8')+'\n'+(ROOT/'m2v-editorial-magazine.css').read_text(encoding='utf-8')+'\n'+(ROOT/'m2v-hola-film.css').read_text(encoding='utf-8')+'\n'+(ROOT/'m2v-postcard-film.css').read_text(encoding='utf-8')
JS=(ROOT/'m2v-openers.js').read_text(encoding='utf-8')
VERSION=hashlib.sha256((CSS+JS+(ROOT/'m2v-review-openers.js').read_text(encoding='utf-8')+(REPO/'tools/hola-valencia-scene.svg').read_text(encoding='utf-8')+hashlib.sha256((ROOT/'assets/postcard/editorial-postcard.mp4').read_bytes()+(ROOT/'assets/postcard/editorial-postcard-phone.mp4').read_bytes()).hexdigest()).encode()).hexdigest()[:10]
FILMS={
 'casa-editorial':('folio','The first page of your next chapter','A place to call your own.','Casa Editorial / A personal beginning'),
 'blue-horizon':('tide','Between city life and sea air','Find your own horizon.','Blue Horizon / Mediterranean light'),
 'hola-valencia':('citrus','A little sunshine. A lot of life.','Your good life starts here.','Hola, Valencia / A warm welcome'),
 'valencia-plan':('assemble','Big dreams. Thoughtful little steps.','Let’s put your life in place.','The Valencia Plan / Coming together'),
 'editorial-journey':('thread','Every new chapter starts somewhere','From somewhere. To belonging.','Editorial Journey / Follow the thread'),
 'valencia-bento':('mosaic','The little things make a life','Make room for your Valencia.','Valencia Bento / Life, piece by piece'),
 'immersive-valencia':('reflection','A different rhythm is calling','Let a new life come to you.','Immersive Valencia / A moment of stillness'),
 'azahar':('blossom','Some things are meant to unfold','A new life, in full bloom.','Azahar / The art of beginning'),
 'a-new-horizon':('horizon','The distance becomes a possibility','Your horizon. A little closer.','A New Horizon / Room to imagine'),
 'new-horizon-client':('aperture','Somewhere new. Something familiar.','Step into your next chapter.','A New Horizon / An open invitation'),
}
SITES=json.loads((ROOT/'client-review-catalog.json').read_text(encoding='utf-8'))
BY_ID={s['id']:s for s in SITES}
KEEP={'new-horizon-ii-client':'Existing full branded splash',
      'azahar-client':'Existing photographic brand introduction',
      'valencia-in-motion':'Existing kinetic city-to-sea opening'}
assert set(FILMS)|set(KEEP)==set(BY_ID)

def photo(asset,klass,portable,parent):
    p=ROOT/asset
    assert p.is_file(), p
    src='data:image/webp;base64,'+base64.b64encode(p.read_bytes()).decode() if portable else Path(os.path.relpath(p,parent)).as_posix()
    return '<img class="'+klass+'" src="'+html.escape(src,quote=True)+'" alt="" decoding="async">'

def route(path,klass=''):
    return '<svg viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true" class="'+klass+'"><path class="m2v-path" pathLength="1" d="'+path+'"/></svg>'

def media(asset,parent,portable,mime):
    p=ROOT/asset
    assert p.is_file(),p
    return 'data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode() if portable else Path(os.path.relpath(p,parent)).as_posix()+'?v='+VERSION

def art(theme,portable,parent):
    image=lambda asset,klass:photo(asset,klass,portable,parent)
    if theme=='folio':
        return '<div class="m2v-folio-spine"></div>'+image('assets/jury-photo-editorial-lane-1440.webp','m2v-folio-arch')+'<span class="m2v-folio-seal">V</span><span class="m2v-folio-corner">01.</span>'
    if theme=='tide':
        return image('15-new-horizon/img/malvarrosa-sky-1600.webp','m2v-tide-photo')+'<div class="m2v-tide-shade"></div><div class="m2v-tide-orbit"></div><div class="m2v-tide-wave"></div><div class="m2v-tide-wave"></div>'
    if theme=='citrus':
        return '<div class="m2v-citrus-disc"></div><div class="m2v-petal"></div><div class="m2v-petal"></div><div class="m2v-citrus-star"><svg viewBox="0 0 100 100"><path fill="currentColor" d="M50 0 59 32 85 15 68 41 100 50 68 59 85 85 59 68 50 100 41 68 15 85 32 59 0 50 32 41 15 15 41 32Z"/></svg></div>'
    if theme=='assemble':
        tiles=''.join('<div class="m2v-plan-tile" style="--i:'+str(i)+'"><span>'+sign+'</span>'+label+'</div>' for i,(sign,label) in enumerate([('↗','A possibility'),('⌂','A home'),('✓','A clear plan'),('✳','Your everyday')]))
        return '<div class="m2v-plan-grid"></div>'+tiles+route('M80 160H280Q330 160 330 210V580Q330 630 380 630H850Q900 630 900 580V220Q900 170 950 170H1120','m2v-plan-route')
    if theme=='thread':
        movie=media('assets/postcard/editorial-postcard.mp4',parent,portable,'video/mp4')
        phone=media('assets/postcard/editorial-postcard-phone.mp4',parent,portable,'video/mp4')
        poster=media('assets/postcard/postcard-back.webp',parent,portable,'image/webp')
        phoneposter=media('assets/postcard/postcard-back-phone.webp',parent,portable,'image/webp')
        still=media('assets/postcard/postcard-front.webp',parent,portable,'image/webp')
        phonestill=media('assets/postcard/postcard-front-phone.webp',parent,portable,'image/webp')
        return '<video class="m2v-postcard-cinema" data-film-video data-film-desktop="'+movie+'" data-film-mobile="'+phone+'" data-film-poster-desktop="'+poster+'" data-film-poster-mobile="'+phoneposter+'" muted playsinline preload="metadata" poster="'+poster+'"><source src="'+movie+'" type="video/mp4"></video><picture class="m2v-postcard-still"><source media="(max-width:900px)" srcset="'+phonestill+'"><img src="'+still+'" alt=""></picture>'
    if theme=='mosaic':
        return ''.join('<div class="m2v-mosaic-tile" style="--i:'+str(i)+'">'+image(asset,'')+'</div>' for i,asset in enumerate(['assets/valencia-market-hd.webp','assets/hero_valencia-1440.webp','assets/valencia-cabanyal-hd.webp']))+'<div class="m2v-mosaic-tile" style="--i:3">Benvinguts.</div>'
    if theme=='reflection':
        rings=''.join('<ellipse cx="600" cy="400" rx="'+str(95+i*42)+'" ry="'+str(70+i*26)+'" style="--i:'+str(i)+'"/>' for i in range(12))
        return '<div class="m2v-water-light"></div><div class="m2v-water-sun"></div><div class="m2v-water-rings"><svg viewBox="0 0 1200 800" preserveAspectRatio="none">'+rings+'</svg></div><div class="m2v-reflected">Moving2Valencia</div>'
    if theme=='blossom':
        petals=''.join('<ellipse class="m2v-path" pathLength="1" cx="300" cy="206" rx="55" ry="110" transform="rotate('+str(i*72)+' 300 300)"/>' for i in range(5))
        return '<div class="m2v-blossom"><svg viewBox="0 0 600 600">'+petals+'<circle cx="300" cy="300" r="21"/></svg></div><div class="m2v-blossom-core"></div>'
    if theme=='horizon':
        return image('15-new-horizon/img/malvarrosa-sky-1600.webp','m2v-horizon-photo')+'<div class="m2v-horizon-rule"></div><div class="m2v-horizon-sun"></div>'
    if theme=='aperture':
        return '<div class="m2v-aperture-window">'+image('15-new-horizon/img/malvarrosa-sky-1600.webp','')+'</div><div class="m2v-aperture-slice"></div>'
    raise ValueError(theme)

def word(text):
    return '<span class="m2v-word">'+''.join('<i style="--n:'+str(i)+'">'+c+'</i>' for i,c in enumerate(text))+'</span>'

def identity():
    return '<p class="m2v-identity">Moving<span>2</span>Valencia</p>'

def composition(ident,parent,portable):
    """Each film has its own authored hierarchy and composition, not a logo template."""
    image=lambda asset,klass:photo(asset,klass,portable,parent)
    brand=identity()
    if ident=='casa-editorial':
        return '<div class="m2v-folio-layout m2v-folio-magazine"><div class="m2v-folio-copy"><p class="m2v-section-label">A personal beginning</p><h2>A place. <br>A life.<br><em>Your own.</em></h2><p class="m2v-support">Moving2Valencia</p></div><div class="m2v-magazine-stage" role="img" aria-label="A photographic Moving2Valencia magazine opens to a Valencia city-and-sea spread"><div class="m2v-magazine-shadow" aria-hidden="true"></div><div class="m2v-magazine" aria-hidden="true"><div class="m2v-magazine-paper"></div><div class="m2v-magazine-right"><div class="m2v-magazine-running">THE ART OF FEELING AT HOME <span>02</span></div><div class="m2v-magazine-story"><span>YOUR NEXT CHAPTER</span><strong>At home.<br><em>In Valencia.</em></strong><p>A slower morning. A familiar street.<br>A beautiful life, made yours.</p></div>'+image('assets/valencia-coast-hd.webp','m2v-magazine-sea')+'<div class="m2v-magazine-foot">CITY, SEA &amp; EVERYDAY POSSIBILITY <span>Moving2Valencia</span></div></div><div class="m2v-magazine-leaf"><div class="m2v-magazine-front">'+image('assets/valencia-morning-hd.webp','m2v-magazine-cover-photo')+'<div class="m2v-magazine-cover-type"><span class="m2v-magazine-issue">THE VALENCIA ISSUE / Nº 01</span><strong class="m2v-magazine-masthead">Moving<span>2</span>Valencia</strong><div class="m2v-magazine-cover-story"><span>A NEW ADDRESS. A NEW PERSPECTIVE.</span><strong>A life<br><em>well lived.</em></strong><p>Your personal guide to a<br>beautiful beginning in Valencia.</p></div><span class="m2v-magazine-cover-foot">PLACES · PEOPLE · POSSIBILITIES</span></div></div><div class="m2v-magazine-back">'+image('assets/jury-photo-editorial-lane-1440.webp','m2v-magazine-lane')+'<div class="m2v-magazine-back-type"><span>01 / THE CITY IS YOURS</span><strong>Somewhere<br>to belong.</strong></div></div></div><div class="m2v-magazine-gutter"></div></div></div></div>'
    if ident=='blue-horizon':
        return '<div class="m2v-tide-layout"><p class="m2v-section-label">One city. Two beautiful rhythms.</p><h2 class="m2v-city-word">CITY</h2><div class="m2v-tide-brand">'+brand+'<span class="m2v-tide-crossing">39.47° N / 0.37° W</span></div><h2 class="m2v-sea-word">SEA</h2><p class="m2v-support">Find your own horizon.</p></div>'
    if ident=='hola-valencia':
        scene=(REPO/'tools/hola-valencia-scene.svg').read_text(encoding='utf-8')
        return '<div class="m2v-hola-film"><div class="m2v-hola-film-copy">'+brand+'<p class="m2v-hola-film-eyebrow">A Mediterranean state of mind</p><h2><span>¡Hola,</span><em>Valencia!</em></h2><p class="m2v-hola-film-caption">Sea air. City soul.<br> A life that feels like you.</p><div class="m2v-hola-film-index"><span>01 / Old town</span><span>02 / New perspectives</span><span>03 / Sea air</span></div></div><div class="m2v-hola-film-scene" role="img" aria-label="A sunlit Valencia composition: the Micalet tower, the eye-shaped Hemisfèric, oranges and Mediterranean waves">'+scene+'<p class="m2v-hola-film-note">A new chapter, in a different light.</p></div></div>'
    if ident=='valencia-plan':
        return '<div class="m2v-plan-layout">'+brand+'<h2>Your next chapter.<br><em>Coming together.</em></h2><div class="m2v-plan-board"><svg viewBox="0 0 800 110" preserveAspectRatio="none" aria-hidden="true"><path class="m2v-path" pathLength="1" d="M10 55H790"/></svg>'+''.join('<div class="m2v-plan-step" style="--i:'+str(i)+'"><span class="m2v-step-dot">'+str(i+1)+'</span><strong>'+name+'</strong><p>'+copy+'</p></div>' for i,(name,copy) in enumerate([('Dream','Picture your everyday.'),('Plan','Put the pieces in place.'),('Live','Make Valencia yours.')]))+'</div><p class="m2v-support">Big dreams. Thoughtful little steps.</p></div>'
    if ident=='editorial-journey':
        return '<div class="m2v-postcard-layout"><div class="m2v-postcard-copy">'+brand+'<p class="m2v-postcard-eyebrow">A postcard from your next chapter</p><h2>Wish you <br><em>were here.</em></h2><p class="m2v-postcard-message">From a new address to a place that feels like home.</p><span class="m2v-postcard-signature">With Christa Brokke</span></div></div>'
    if ident=='valencia-bento':
        return '<div class="m2v-bento-layout"><div class="m2v-bento-heading"><p class="m2v-section-label">The little things make a life</p>'+brand+'</div><div class="m2v-bento-board"><div class="m2v-bento-say"><h2>Make room <br>for <em>life.</em></h2></div><div class="m2v-bento-photo m2v-bento-market">'+image('assets/valencia-market-hd.webp','')+'<span>Your usual market.</span></div><div class="m2v-bento-sun"><span aria-hidden="true">✳</span><p>A sunnier<br>everyday.</p></div><div class="m2v-bento-photo m2v-bento-street">'+image('assets/valencia-cabanyal-hd.webp','')+'<span>Your new street.</span></div><div class="m2v-bento-welcome"><p>Hola,<br><strong>neighbour.</strong></p></div></div></div>'
    if ident=='immersive-valencia':
        return '<div class="m2v-reflection-layout">'+brand+'<p class="m2v-section-label">Listen to the possibility</p><h2>A different<br><em>rhythm.</em></h2><div class="m2v-reflection-echo" aria-hidden="true">A different rhythm.</div><p class="m2v-support">Let a new life come to you.</p></div>'
    if ident=='azahar':
        return '<div class="m2v-bloom-layout"><p class="m2v-section-label">The art of beginning</p><div class="m2v-bloom-name"><span class="m2v-bloom-a" aria-hidden="true">a</span><h2>azahar</h2></div><div class="m2v-bloom-caption"><span class="m2v-bloom-line"></span><p>Let life unfold.</p></div>'+brand+'</div>'
    if ident=='a-new-horizon':
        return '<div class="m2v-horizon-layout">'+brand+'<p class="m2v-section-label">A new horizon</p><h2><span>closer</span><em>to home.</em></h2><div class="m2v-horizon-baseline" aria-hidden="true"><i></i></div><p class="m2v-support">The distance becomes a possibility.</p></div>'
    if ident=='new-horizon-client':
        return '<div class="m2v-aperture-layout"><div class="m2v-aperture-copy"><p class="m2v-section-label">An open invitation</p><h2>what if<br><em>this was</em><br>home?</h2>'+brand+'</div><div class="m2v-doorway">'+image('15-new-horizon/img/malvarrosa-sky-1600.webp','')+'<span>Step into your next chapter.</span></div></div>'
    raise ValueError(ident)

def markup(ident,parent,portable=False):
    theme,kicker,caption,label=FILMS[ident]
    backdrop=art(theme,portable,parent) if theme in ['tide','thread','reflection','blossom','horizon'] else ('<div class="m2v-plan-grid"></div>' if theme=='assemble' else '')
    return '<!-- m2v-film-markup:start --><dialog class="m2v-opening" data-film="'+theme+'" data-opener-for="'+ident+'" aria-label="Moving2Valencia introduction"'+((' data-film-duration="'+str({'hola-valencia':6200,'editorial-journey':9200}[ident])+'" style="--m2v-duration:'+str({'hola-valencia':6.2,'editorial-journey':9.2}[ident])+'s"') if ident in ['hola-valencia','editorial-journey'] else '')+' hidden><div class="m2v-film"><div class="m2v-art" aria-hidden="true">'+backdrop+'</div><div class="m2v-top"><span>'+html.escape(label)+'</span><button type="button" data-film-exit>Skip intro ↗</button></div><div class="m2v-center m2v-bespoke">'+composition(ident,parent,portable)+'</div><div class="m2v-bottom"><span>València, España</span><div class="m2v-controls"><button type="button" data-film-pause aria-pressed="false">Pause motion</button><button type="button" class="m2v-enter" data-film-exit autofocus>Enter Valencia ↗</button></div></div><div class="m2v-progress" aria-hidden="true"></div></div></dialog><!-- m2v-film-markup:end -->'

def inject(code,ident,parent,portable=False):
    code=re.sub(r'<!-- m2v-film-(head|markup|foot):start -->[\s\S]*?<!-- m2v-film-\1:end -->','',code)
    prefix=Path(os.path.relpath(ROOT,parent)).as_posix()
    if prefix=='.':prefix=''
    else:prefix+='/'
    head='<style>'+CSS+'</style>' if portable else '<link rel="stylesheet" href="'+prefix+'m2v-openers.css?v='+VERSION+'"><link rel="stylesheet" href="'+prefix+'m2v-opener-scenes.css?v='+VERSION+'">'+('<link rel="stylesheet" href="'+prefix+'m2v-editorial-magazine.css?v='+VERSION+'">' if ident=='casa-editorial' else '')+('<link rel="stylesheet" href="'+prefix+'m2v-hola-film.css?v='+VERSION+'">' if ident=='hola-valencia' else '')+('<link rel="stylesheet" href="'+prefix+'m2v-postcard-film.css?v='+VERSION+'">' if ident=='editorial-journey' else '')
    script='<script>'+JS+'</script>' if portable else '<script src="'+prefix+'m2v-openers.js?v='+VERSION+'" defer></script>'
    code=code.replace('</head>','<!-- m2v-film-head:start -->'+head+'<!-- m2v-film-head:end --></head>',1)
    code=re.sub(r'(<body\b[^>]*>)',lambda m:m[1]+markup(ident,parent,portable),code,count=1)
    replay='<div class="m2v-opener-replay"><span>Moving2Valencia · The opening moment</span><button type="button" data-film-replay>Replay the opening ↗</button></div>'
    return code.replace('</body>','<!-- m2v-film-foot:start -->'+replay+script+'<!-- m2v-film-foot:end --></body>',1)

updated=[]
for p in ROOT.rglob('*.html'):
    if p.parts[-2:] == ('logos','index.html'):continue
    code=p.read_text(encoding='utf-8')
    m=re.search(r'<body\b[^>]*\bdata-(jury-concept|client-edition)="([^"]+)"',code)
    if not m:continue
    ident=m[2]
    if m[1]=='client-edition':ident={'new-horizon':'new-horizon-client','azahar':'azahar-client'}.get(ident,ident)
    if ident not in FILMS:continue
    portable=p.stat().st_size>1024*1024
    p.write_text(inject(code,ident,p.parent,portable),encoding='utf-8')
    updated.append({'path':p.relative_to(ROOT).as_posix(),'id':ident,'portable':portable})

# Keep the optional source-folder ZIP in sync with the new Horizon edition.
bundle=ROOT/'client-editions/new-horizon/website.zip'
with zipfile.ZipFile(bundle) as z: entries=[(info,z.read(info.filename)) for info in z.infolist()]
with zipfile.ZipFile(bundle,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for info,data in entries:
        if info.filename.endswith('.html'):
            code=data.decode('utf-8')
            if re.search(r'<body\b[^>]*data-client-edition="new-horizon"',code):data=inject(code,'new-horizon-client',ROOT,True).encode('utf-8')
        z.writestr(info,data)

# Review controls can replay an opening without losing form or scroll state.
for name in ['index.html','jury-review.html','client-review.html']:
    p=ROOT/name;code=p.read_text(encoding='utf-8')
    if 'id="replay-opener"' not in code:
        code=code.replace('<button id="reload-preview" type="button">Reload ↻</button>','<button id="reload-preview" type="button">Reload ↻</button><button id="replay-opener" type="button" hidden>Replay opening ↗</button>')
    if 'm2v-review-openers.js' not in code:
        code=code.replace('</head>','<script src="m2v-review-openers.js?v='+VERSION+'" defer></script></head>')
    p.write_text(code,encoding='utf-8')

# Refresh download labels after embedding the distinct artwork and styles.
for site in SITES:
    site['downloadSize']=(ROOT/site['download']).stat().st_size
    if site.get('zip'):site['zipSize']=(ROOT/site['zip']).stat().st_size
for name in ['index.html','jury-review.html','client-review.html']:
    p=ROOT/name;code=p.read_text(encoding='utf-8')
    for site in SITES:
        for key,sizekey in [('download','downloadSize'),('zip','zipSize')]:
            if not site.get(key):continue
            pattern=r'(href="'+re.escape(site[key])+r'" download>[^<]*<small>)[^<]*(</small>)'
            code=re.sub(pattern,lambda m:m[1]+f'{site[sizekey]/1024/1024:.1f} MB'+m[2],code)
    p.write_text(code,encoding='utf-8')
(ROOT/'client-review-catalog.json').write_text(json.dumps(SITES,ensure_ascii=False,indent=2),encoding='utf-8')
report={'newOpeners':{key:value[0] for key,value in FILMS.items()},'preservedOpeners':KEEP,'updatedFiles':updated,'version':VERSION}
(REPO/'opener-implementation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'newOpeners':len(FILMS),'preservedOpeners':len(KEEP),'updatedPages':len(updated),'version':VERSION}))
