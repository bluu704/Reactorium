#!/usr/bin/env python3
"""PC용 index.html + mobile/ 스타일·스크립트 → www/index.html (앱 빌드용)."""
import pathlib, re, shutil
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')
css = (root / 'mobile/mobile.css').read_text(encoding='utf-8')
js = (root / 'mobile/mobile.js').read_text(encoding='utf-8')
html = html.replace(
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
    '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">\n'
    '<meta name="theme-color" content="#111728">', 1)
assert '</head>' in html and '</body>' in html
html = html.replace('</head>', f'<style id="mobile-css">\n{css}</style>\n</head>', 1)
html = html.replace('</body>', f'<script id="mobile-js">\n{js}</script>\n</body>', 1)
out = root / 'www'
shutil.rmtree(out, ignore_errors=True); out.mkdir()
# 글꼴: Google Fonts 링크 대신 앱 안에 넣은 글꼴(mobile/fonts) 사용 → 오프라인에서도 같은 모양
fonts = root / 'mobile/fonts'
if (fonts / 'fonts.css').exists():
    html = re.sub(r'<link rel="preconnect"[^>]*>\n?', '', html)
    html = re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>', '<link rel="stylesheet" href="fonts/fonts.css">', html, count=1)
    assert 'fonts.googleapis.com' not in html
    shutil.copytree(fonts, out / 'fonts')
(out / 'index.html').write_text(html, encoding='utf-8')
print('built', out / 'index.html', len(html), 'bytes')
