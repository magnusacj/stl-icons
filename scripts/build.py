"""Build STL Icons.

1. Compiles every SVG in custom-icons/ into app/manifests/stl.json
2. Compiles app/logos/logos.json into app/manifests/stllogos.json
3. Checks that every icon referenced in app/collections.js exists
4. With --base-url, writes the PowerPoint manifest app/manifest.xml

Usage:  python scripts/build.py [--base-url https://your-host/path]
Exit code is 1 if any collection reference is broken.
"""
import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CUSTOM_DIR = ROOT / 'custom-icons'
MANIFEST_DIR = ROOT / 'app' / 'manifests'
COLLECTIONS = ROOT / 'app' / 'collections.js'
MANIFEST_TEMPLATE = ROOT / 'manifest.template.xml'

SVG_NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', SVG_NS)

# Root attributes that are carried onto a wrapping <g> so styling survives
STYLE_ATTRS = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin']


def build_custom_icons():
    icons = []
    for path in sorted(CUSTOM_DIR.glob('*.svg')):
        root = ET.parse(path).getroot()
        inner = ''.join(ET.tostring(child, encoding='unicode') for child in root)
        inner = re.sub(r'\s*xmlns(:\w+)?="[^"]*"', '', inner)
        inner = re.sub(r'>\s+<', '><', inner).strip()
        group_attrs = ' '.join(f'{a}="{root.get(a)}"' for a in STYLE_ATTRS if root.get(a))
        icons.append({
            'name': path.stem,
            'title': root.get('data-title') or path.stem.replace('-', ' ').title(),
            'tags': [t.strip() for t in (root.get('data-tags') or '').split(',') if t.strip()],
            'svg': {
                'viewBox': root.get('viewBox', '0 0 24 24'),
                'content': f'<g {group_attrs}>{inner}</g>' if group_attrs else inner,
            },
        })

    manifest = {'id': 'stl', 'name': 'STL originals', 'version': '1.0.0',
                'totalIcons': len(icons), 'icons': icons}
    (MANIFEST_DIR / 'stl.json').write_text(json.dumps(manifest, separators=(',', ':')), encoding='utf-8')
    print(f'Compiled {len(icons)} custom icons -> app/manifests/stl.json')


def build_logos():
    """app/logos/logos.json (one entry per image file) -> app/manifests/stllogos.json"""
    logos = json.loads((ROOT / 'app' / 'logos' / 'logos.json').read_text(encoding='utf-8'))
    icons = []
    for logo in logos:
        if not (ROOT / 'app' / 'logos' / logo['file']).exists():
            print(f"  missing image for logo {logo['name']}: {logo['file']}")
            continue
        icons.append({'name': logo['name'], 'title': logo['title'], 'tags': logo.get('tags', []),
                      'category': logo.get('category', ''), 'image': 'logos/' + logo['file'],
                      **({'dark': True} if logo.get('dark') else {})})
    manifest = {'id': 'stllogos', 'name': 'STL logos', 'version': '1.0.0',
                'totalIcons': len(icons), 'icons': icons}
    (MANIFEST_DIR / 'stllogos.json').write_text(json.dumps(manifest, ensure_ascii=False, separators=(',', ':')),
                                               encoding='utf-8')
    print(f'Compiled {len(icons)} logos -> app/manifests/stllogos.json')


def check_collections():
    source = re.sub(r'/\*.*?\*/', '', COLLECTIONS.read_text(encoding='utf-8'), flags=re.S)
    refs = re.findall(r"'([a-z0-9]+):([a-z0-9-]+)(?:\|[^']*)?'", source)
    names_by_lib = {}
    missing = []
    for lib, name in refs:
        if lib not in names_by_lib:
            path = MANIFEST_DIR / f'{lib}.json'
            if not path.exists():
                names_by_lib[lib] = set()
            else:
                data = json.loads(path.read_text(encoding='utf-8'))
                names_by_lib[lib] = {i['name'] for i in data['icons']}
        if name not in names_by_lib[lib]:
            missing.append(f'{lib}:{name}')

    print(f'Checked {len(refs)} collection references')
    if missing:
        print('MISSING icons (fix or remove in app/collections.js):')
        for m in missing:
            print('  ' + m)
        return False
    return True


def write_office_manifest(base_url):
    base_url = base_url.rstrip('/')
    if not base_url.startswith('https://'):
        sys.exit('--base-url must start with https:// (Office only loads add-ins over HTTPS)')
    origin = '/'.join(base_url.split('/')[:3])
    xml = (MANIFEST_TEMPLATE.read_text(encoding='utf-8')
           .replace('{{BASE_URL}}', base_url).replace('{{ORIGIN}}', origin))
    xml = re.sub(r'<!--.*?-->\s*', '', xml, count=1, flags=re.S)  # drop the template note
    (ROOT / 'app' / 'manifest.xml').write_text(xml, encoding='utf-8')
    print(f'Wrote app/manifest.xml for {base_url}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--base-url', help='HTTPS address the app/ folder is hosted at')
    args = parser.parse_args()

    build_custom_icons()
    build_logos()
    ok = check_collections()
    if args.base_url:
        write_office_manifest(args.base_url)
    sys.exit(0 if ok else 1)
