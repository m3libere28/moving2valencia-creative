"""Add original, theme-specific brand films without rebuilding the existing sites."""
from pathlib import Path
import base64, hashlib, html, io, json, os, re, zipfile

REPO=Path(__file__).resolve().parents[1]
ROOT=REPO/'review'
CSS=(ROOT/'m2v-openers.css').read_text(encoding='utf-8')
JS=(ROOT/'m2v-openers.js').read_text(encoding='utf-8')
VERSION=hashlib.sha256((CSS+JS+(ROOT/'m2v-review-openers.js').read_text(encoding='utf-8')).encode()).hexdigest()[:10]
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
        return image('assets/jury-photo-editorial-lane-1440.webp','m2v-thread-photo')+image('assets/valencia-market-hd.webp','m2v-thread-photo')+route('M-20 130C180 70 370 110 370 260S70 430 250 570 520 750 600 610 930 90 1110 220 1000 600 1240 660')
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

def markup(ident,parent,portable=False):
    theme,kicker,caption,label=FILMS[ident]
    return '<!-- m2v-film-markup:start --><dialog class="m2v-opening" data-film="'+theme+'" data-opener-for="'+ident+'" aria-label="Moving2Valencia introduction" hidden><div class="m2v-film"><div class="m2v-art" aria-hidden="true">'+art(theme,portable,parent)+'</div><div class="m2v-top"><span>'+html.escape(label)+'</span><button type="button" data-film-exit>Skip intro ↗</button></div><div class="m2v-center"><p class="m2v-kicker">'+html.escape(kicker)+'</p><p class="m2v-wordmark" role="heading" aria-level="2" aria-label="Moving2Valencia"><span class="m2v-sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)">Moving2Valencia</span><span aria-hidden="true" style="display:contents">'+word('Moving')+'<span class="m2v-number">2</span>'+word('Valencia')+'</span></p><div class="m2v-line"></div><p class="m2v-caption">'+html.escape(caption)+'</p></div><div class="m2v-bottom"><span>València, España<br>A new way to feel at home.</span><div class="m2v-controls"><button type="button" data-film-pause aria-pressed="false">Pause motion</button><button type="button" class="m2v-enter" data-film-exit autofocus>Enter Valencia ↗</button></div></div><div class="m2v-progress" aria-hidden="true"></div></div></dialog><!-- m2v-film-markup:end -->'

def inject(code,ident,parent,portable=False):
    code=re.sub(r'<!-- m2v-film-(head|markup|foot):start -->[\s\S]*?<!-- m2v-film-\1:end -->','',code)
    prefix=Path(os.path.relpath(ROOT,parent)).as_posix()
    if prefix=='.':prefix=''
    else:prefix+='/'
    head='<style>'+CSS+'</style>' if portable else '<link rel="stylesheet" href="'+prefix+'m2v-openers.css?v='+VERSION+'">'
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

report={'newOpeners':{key:value[0] for key,value in FILMS.items()},'preservedOpeners':KEEP,'updatedFiles':updated,'version':VERSION}
(REPO/'opener-implementation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'newOpeners':len(FILMS),'preservedOpeners':len(KEEP),'updatedPages':len(updated),'version':VERSION}))
