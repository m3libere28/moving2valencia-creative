"""Update only the Immersive portable edition, credits, catalog and local preview."""
from pathlib import Path
import re,json,base64,mimetypes,shutil,hashlib,subprocess
REPO=Path(__file__).resolve().parents[1]
ROOT=REPO/'review'
ORIGIN='https://m3libere28.github.io/moving2valencia-creative/review/'
canonical=(ROOT/'07-proposal-immersive.html').read_text(encoding='utf-8')
target=ROOT/'Immersive-Valencia.html'
portable=target.read_text(encoding='utf-8')
for klass in ['story','stack','voices','end']:
 pattern=r'<section class="'+klass+r'"[\s\S]*?</section>'
 section=re.search(pattern,canonical)[0]
 def asset(m):
  value=m[2];local=ROOT/value.split('?',1)[0]
  if not local.is_file():return m[0]
  if local.suffix=='.mp4':url=ORIGIN+value
  else:url='data:'+(mimetypes.guess_type(local.name)[0] or 'application/octet-stream')+';base64,'+base64.b64encode(local.read_bytes()).decode()
  return m[1]+url+m[1]
 section=re.sub(r'''(["'])(assets/[a-zA-Z0-9_./%+?-]+\.(?:webp|mp4))\1''',asset,section)
 section=section.replace('href="photo-credits.html','href="'+ORIGIN+'photo-credits.html')
 portable=re.sub(pattern,lambda m:section,portable,count=1)
portable=re.sub(r'/\* ---------- story dots \+ active dock ---------- \*/[\s\S]*?const links=', '/* ---------- active dock ---------- */\nconst links=',portable,count=1)
portable=re.sub(r'  /\* word-by-word quote reveal \*/[\s\S]*?(?=  gsap.utils.toArray)', '',portable,count=1)
portable=re.sub(r'<!-- immersive-refinement-head:start -->[\s\S]*?<!-- immersive-refinement-head:end -->','',portable)
portable=re.sub(r'<!-- immersive-refinement-script:start -->[\s\S]*?<!-- immersive-refinement-script:end -->','',portable)
portable=portable.replace('</head>','<!-- immersive-refinement-head:start --><style>'+(ROOT/'immersive-refinement.css').read_text(encoding='utf-8')+'</style><!-- immersive-refinement-head:end --></head>',1)
portable=portable.replace('</body>','<!-- immersive-refinement-script:start --><script>'+(ROOT/'immersive-refinement.js').read_text(encoding='utf-8')+'</script><!-- immersive-refinement-script:end --></body>')
portable=portable.replace('All twelve concepts','All 13 concepts').replace('Review all twelve concepts','Review all 13 concepts')
target.write_text(portable,encoding='utf-8')
assert target.stat().st_size<25*1024*1024
catalog=json.loads((ROOT/'client-review-catalog.json').read_text(encoding='utf-8'))
assert len(catalog)==13
site=next(c for c in catalog if c['id']=='immersive-valencia')
site['downloadSize']=target.stat().st_size
site['revision']=re.search(r'immersive-refinement.css\?v=([a-f0-9]+)',canonical)[1]
site['description']='An immersive shoreline, an uncropped portrait of Christa and beautifully clear service cards. Real Valencia footage brings the city and coast into focus.'
site['points']=['Christa’s story with a complete founder portrait','Photographic service cards with clear next steps','A real Valencia film in HD, adapted for mobile']
(ROOT/'client-review-catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf-8')
for name in ['index.html','jury-review.html','client-review.html']:
 p=ROOT/name;s=p.read_text(encoding='utf-8')
 s=re.sub(r'(src="client-review.js)(?:\?[^\"]*)?"',lambda m:m[1]+'?v=immersive-'+site['revision']+'"',s)
 s=re.sub(r'(<script[^>]*id="client-catalog"[^>]*>)[\s\S]*?(</script>)',lambda m:m[1]+json.dumps(catalog,ensure_ascii=False)+m[2],s,count=1)
 s=re.sub(r'(href="Immersive-Valencia.html" download>[^<]*<small>)[^<]*(</small>)',lambda m:m[1]+f'{site["downloadSize"]/1024/1024:.1f} MB'+m[2],s)
 p.write_text(s,encoding='utf-8')
credits=ROOT/'photo-credits.html';s=credits.read_text(encoding='utf-8')
s=re.sub(r'<!-- immersive-documentary:start -->[\s\S]*?<!-- immersive-documentary:end -->','',s)
credit='''<!-- immersive-documentary:start --><section id="immersive-documentary" style="padding:45px 5%;border-top:1px solid #213c3220"><h2 style="font:35px/1.15 Georgia,serif;margin-bottom:22px">Immersive Valencia · Documentary film</h2><p>The 25-second film combines real footage recorded in Valencia: <a href="https://www.pexels.com/video/valencia-s-futuristic-city-of-arts-and-sciences-35901359/">City of Arts and Sciences by Maksym Parovenko</a> and <a href="https://www.pexels.com/video/drone-footage-of-the-coastal-city-of-valencia-spain-15044556/">Valencia’s beachfront by Lazar Krstić</a>. Both original clips are 3840 × 2160. Licensed under the <a href="https://www.pexels.com/license/">Pexels License</a>; edited, crossfaded, resized and compressed for web delivery at 1920 × 1080 and 1280 × 720. The closing background uses the same Valencia beachfront footage. No generated imagery is used in these replacement videos.</p></section><!-- immersive-documentary:end -->'''
s=s.replace('</body>',credit+'</body>');credits.write_text(s,encoding='utf-8')
manifest={'license':'https://www.pexels.com/license/','sources':[{'creator':'Maksym Parovenko','page':'https://www.pexels.com/video/valencia-s-futuristic-city-of-arts-and-sciences-35901359/','sourceDimensions':[3840,2160]},{'creator':'Lazar Krstić','page':'https://www.pexels.com/video/drone-footage-of-the-coastal-city-of-valencia-spain-15044556/','sourceDimensions':[3840,2160]}],'files':{}}
for p in (ROOT/'assets/immersive').glob('*.mp4'):
 manifest['files'][p.name]={'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size,'probe':json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=width,height,codec_name,r_frame_rate','-show_entries','format=duration','-of','json',str(p)],text=True))}
(ROOT/'assets/immersive/provenance.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
local=REPO.parent/'concepts/dist'
for n in ['07-proposal-immersive.html','Immersive-Valencia.html','immersive-refinement.css','immersive-refinement.js','photo-credits.html','client-review-catalog.json','client-review.js']:
 shutil.copy2(ROOT/n,local/n)
shutil.copytree(ROOT/'assets/immersive',local/'assets/immersive',dirs_exist_ok=True)
print(json.dumps({'portableBytes':target.stat().st_size,'concepts':len(catalog),'files':len(manifest['files'])}))
