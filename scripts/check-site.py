from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
import json,re,sys,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]/'docs';errors=[];pages=list(root.glob('*.html'))
class Page(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.ids=[];self.refs=[];self.h1=0;self.lang=False;self.alts=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='html':self.lang=a.get('lang')=='ru'
  if tag=='h1':self.h1+=1
  if 'id' in a:self.ids.append(a['id'])
  if tag=='img':
   if 'alt' not in a:self.alts.append(a)
   if 'src' in a:self.refs.append(a['src'])
   if 'srcset' in a:
    for s in a['srcset'].split(','):self.refs.append(s.strip().split()[0])
  if tag in ('a','link') and a.get('href'):self.refs.append(a['href'])
  if tag=='script' and a.get('src'):self.refs.append(a['src'])
parsed={}
for file in pages:
 p=Page();p.feed(file.read_text());parsed[file.name]=p
 if not p.lang:errors.append(f'{file.name}: Russian language is missing')
 if p.h1!=1:errors.append(f'{file.name}: expected one h1, got {p.h1}')
 if len(p.ids)!=len(set(p.ids)):errors.append(f'{file.name}: duplicate ids')
 if p.alts:errors.append(f'{file.name}: images without alt')
for file in pages:
 p=parsed[file.name]
 for ref in p.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  target=root/unquote(u.path or file.name)
  if not target.is_file():errors.append(f'{file.name}: missing local target {ref}');continue
  if u.fragment and target.suffix=='.html':
   dest=parsed.get(target.name)
   if dest and u.fragment not in dest.ids:errors.append(f'{file.name}: missing anchor {ref}')
for css in (root/'assets').glob('*.css'):
 for ref in re.findall(r'url\([\'\"]?([^\)\'\"]+)',css.read_text()):
  if not ref.startswith('data:') and not (css.parent/ref).is_file():errors.append(f'{css.name}: missing CSS asset {ref}')
projects=json.loads((root.parent/'projects.json').read_text());assert len(projects)==8
index=(root/'index.html').read_text()
for p in projects:
 if 'case-'+p['slug']+'.html' not in index:errors.append('Project absent: '+p['slug'])
for term in ['+79536220223','lubochkachayka@gmail.com','Unity','Python','Cisco','C++','SQL']:
 if term not in index:errors.append('Missing user content: '+term)
ET.parse(root/'sitemap.xml')
if max(p.stat().st_size for p in root.rglob('*') if p.is_file())>40*1024*1024:errors.append('An asset exceeds 40 MB')
if errors:print('\n'.join(errors));sys.exit(1)
print(f'PASS: {len(pages)} pages, 8 project pages, all local links, fragments, image variants and fonts; Russian headings, alt text, sitemap, contacts and skills')
