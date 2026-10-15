"""Apply the bespoke planner opening without rebuilding the other twelve concepts."""
from pathlib import Path
import re,json,shutil
REPO=Path(__file__).resolve().parents[1]
ROOT=REPO/'review'
builder=REPO/'tools/build-openers.py'
namespace={'__file__':str(builder)}
exec(compile(builder.read_text(encoding='utf-8').split('updated=[]')[0],str(builder),'exec'),namespace)
version=namespace['VERSION']
for name,portable in [('04-planner.html',False),('The-Valencia-Plan.html',True)]:
 p=ROOT/name;original=p.read_text(encoding='utf-8')
 updated=namespace['inject'](original,'valencia-plan',ROOT,portable)
 p.write_text(updated,encoding='utf-8')
 assert p.stat().st_size<25*1024*1024
 # All edits stay within the existing opener slots.
 strip=lambda text:re.sub(r'<!-- m2v-film-(head|markup|foot):start -->[\s\S]*?<!-- m2v-film-\1:end -->','',text)
 assert strip(original)==strip(updated),name
catalog=json.loads((ROOT/'client-review-catalog.json').read_text(encoding='utf-8'))
assert len(catalog)==13
site=next(s for s in catalog if s['id']=='valencia-plan')
site['downloadSize']=(ROOT/site['download']).stat().st_size
site['revision']=version
for name in ['index.html','jury-review.html','client-review.html']:
 p=ROOT/name;code=p.read_text(encoding='utf-8')
 code=re.sub(r'(<script[^>]*id="client-catalog"[^>]*>)[\s\S]*?(</script>)',lambda m:m[1]+json.dumps(catalog,ensure_ascii=False)+m[2],code,count=1)
 code=re.sub(r'(href="The-Valencia-Plan.html" download>[^<]*<small>)[^<]*(</small>)',lambda m:m[1]+f'{site["downloadSize"]/1024/1024:.1f} MB'+m[2],code)
 p.write_text(code,encoding='utf-8')
(ROOT/'client-review-catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf-8')
local=REPO.parent/'concepts/dist'
for name in ['04-planner.html','The-Valencia-Plan.html','m2v-planner-film.css','m2v-planner-film.js','client-review-catalog.json']:
 shutil.copy2(ROOT/name,local/name)
print(json.dumps({'version':version,'portableBytes':site['downloadSize'],'concepts':len(catalog)}))
