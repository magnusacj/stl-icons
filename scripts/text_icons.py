"""Rebuild the STL icons that contain letters (5G, 6G...) using real Roboto Bold outlines, filled in currentColor.

Usage: pip install fonttools, download Roboto Bold (Google Fonts), then
       python scripts/text_icons.py path/to/Roboto-Bold.ttf custom-icons
"""
import os, re, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

FONT, OUT = sys.argv[1], sys.argv[2]
font = TTFont(FONT)
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
cap_height = font['OS/2'].sCapHeight
hmtx = font['hmtx']


def text_path(text, cx, cy, cap, tracking=0.0):
    """SVG path data for `text`, centred on (cx, cy), with capitals `cap` units tall."""
    scale = cap / cap_height
    names = [cmap[ord(ch)] for ch in text]
    # measure the ink box with letters placed at their advances
    x, xmin, xmax = 0, None, None
    placements = []
    for name in names:
        bp = BoundsPen(glyphs)
        glyphs[name].draw(bp)
        if bp.bounds:
            gx0, _, gx1, _ = bp.bounds
            xmin = gx0 + x if xmin is None else min(xmin, gx0 + x)
            xmax = gx1 + x if xmax is None else max(xmax, gx1 + x)
        placements.append((name, x))
        x += hmtx[name][0] + tracking / scale
    width = (xmax - xmin) * scale
    left = cx - width / 2 - xmin * scale
    baseline = cy + cap / 2
    pen = SVGPathPen(glyphs, ntos=lambda v: f'{round(v, 2):g}')
    for name, gx in placements:
        # font units are y-up; SVG is y-down
        tp = TransformPen(pen, (scale, 0, 0, -scale, left + gx * scale, baseline))
        glyphs[name].draw(tp)
    return pen.getCommands()


def filled(d):
    return f'<path d="{d}" fill="currentColor" stroke="none"/>'


def head_of(name):
    with open(os.path.join(OUT, name + '.svg'), encoding='utf-8') as f:
        return re.match(r'(?s)(<svg[^>]*>)', f.read()).group(1)


BODIES = {
    '5g': '<rect x="2" y="5" width="20" height="14" rx="3"/>\n  ' + filled(text_path('5G', 12, 12, 7)),
    '6g': '<rect x="2" y="5" width="20" height="14" rx="3"/>\n  ' + filled(text_path('6G', 12, 12, 7)),
    '5g-advanced': '<rect x="2" y="6" width="16" height="12" rx="3"/>\n  ' + filled(text_path('5G', 10, 12, 6.5))
                   + '\n  <path d="M20.25 2v4M18.25 4h4"/>',
    '5g-to-6g': filled(text_path('6G', 12, 5, 6)) + '\n  <path d="M12 13.5v-3M10.5 12L12 10.5l1.5 1.5"/>\n  '
                + filled(text_path('5G', 12, 19, 6)),
}

for name, body in BODIES.items():
    path = os.path.join(OUT, name + '.svg')
    head = head_of(name)
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(head + '\n  ' + body + '\n</svg>\n')
    print('wrote', name)
