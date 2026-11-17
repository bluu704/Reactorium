#!/usr/bin/env python3
"""index.html이 쓰는 Google Fonts를 내려받아 mobile/fonts/에 저장한다 (앱 오프라인용).
게임 텍스트에 실제로 쓰인 글자가 들어 있는 unicode-range 조각만 받는다.
글꼴이나 게임 텍스트가 바뀌면 다시 실행: python3 scripts/fetch_fonts.py"""
import pathlib, re, urllib.request, hashlib, shutil
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')
url = re.search(r'href="(https://fonts\.googleapis\.com/css2[^"]+)"', html).group(1).replace('&amp;', '&')
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=60).read()
css = get(url).decode()
used = {ord(c) for c in html} | set(range(0x20, 0x7f))   # 게임 파일에 나오는 모든 글자 + ASCII

def covers(rng):
    for part in rng.split(','):
        part = part.strip().replace('U+', '')
        if '-' in part: a, b = (int(x, 16) for x in part.split('-'))
        elif '?' in part: a, b = int(part.replace('?', '0'), 16), int(part.replace('?', 'F'), 16)
        else: a = b = int(part, 16)
        if any(a <= c <= b for c in used): return True
    return False

out = root / 'mobile/fonts'
shutil.rmtree(out, ignore_errors=True); out.mkdir(parents=True)
kept, total = [], 0
for block in re.findall(r'@font-face\s*{[^}]+}', css):
    rng = re.search(r'unicode-range:\s*([^;]+);', block)
    if rng and not covers(rng.group(1)): continue
    src = re.search(r'url\((https://[^)]+)\)', block).group(1)
    data = get(src)
    name = hashlib.sha1(src.encode()).hexdigest()[:12] + '.woff2'
    if not (out / name).exists(): (out / name).write_bytes(data); total += len(data)
    kept.append(block.replace(src, name))  # fonts.css와 같은 폴더
(out / 'fonts.css').write_text('\n'.join(kept) + '\n', encoding='utf-8')
print(f'{len(kept)} files, {total/1e6:.2f} MB -> {out}')
