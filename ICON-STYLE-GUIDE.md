# STL icon style guide

Every icon in `custom-icons/` follows these rules, so the set looks like one family next to Tabler and the
other line libraries, and recolours cleanly in PowerPoint. `app/icon-lint.html` checks the measurable rules
automatically (open it from the local preview server: `python scripts/serve.py`, then
http://localhost:3000/icon-lint.html). Fix every icon it flags before publishing.

## 1. Canvas

| Rule | Value |
|---|---|
| Canvas | `viewBox="0 0 24 24"` |
| Live area (where geometry goes) | 2 to 22 on both axes |
| Safe area (nothing painted outside, stroke included) | 1 to 23, so geometry never goes past 1.75 or 22.25 |
| Optical centre | Balance the icon around (12, 12). Wide icons sit on the vertical centre, tall ones on the horizontal |

## 2. Stroke

| Rule | Value |
|---|---|
| Stroke width | **1.5** everywhere. Never override it on an element |
| Caps and joins | `round` / `round` |
| Colour | `currentColor` only. No hard-coded colours, no gradients, no opacity |
| Fill | `fill="none"`. The only filled shapes are small dots (see 4) |
| Dashes | Only to mean "virtual", "wireless link" or "dotted connection": `stroke-dasharray="1.5 2"` |

The root element carries the style once:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
     data-title="Network slicing" data-tags="network slicing, slice, 5g sa, qos">
```

## 3. Spacing (no overlapping or near-touching lines)

| Rule | Value |
|---|---|
| Clear gap between separate strokes | **At least 0.75px**, so stroke centres are at least 2.25 apart. The linter fails anything under 0.5 |
| Lines that should connect | Must actually meet (end exactly on the other line) rather than stopping just short |
| No doubled strokes | Never draw one line on top of another. For example, when a building sits on a ground line, leave the building's bottom edge open (no `z`) |
| Parallel elements (window ticks, rack units, waves) | Keep an even rhythm and the same gap to the frame on all sides |

## 4. Details

| Element | Rule |
|---|---|
| Dots (LEDs, nodes, data points) | `fill="currentColor" stroke="none"`, radius 0.6 to 1.2, at least 0.75 clear of any stroke |
| Corner radius | Large frames 1.5 to 3; small boxes 0.5 to 1 |
| Smallest feature | 1.5 long (tick marks, pins). Anything smaller disappears at slide size |
| Element count | As few as possible. If an icon needs more than about 12 parts, simplify the idea |
| Text | Only where the letters are the point (5G, 6G). Use the real **Roboto Bold** outlines as filled paths (`fill="currentColor" stroke="none"`), capitals 6 to 7 tall: at that size Roboto Bold's stems match the 1.5 stroke. Never `<text>` elements, which depend on the viewer's fonts. The generator is `text_icons.py` (see README) |
| Hidden shapes | None. No invisible frames or placeholder rectangles: PowerPoint's Graphics Outline turns them into a visible box |

## 5. Shared motifs (reuse these instead of redrawing)

These keep the family consistent. The generator script implements them as functions.

| Motif | Standard |
|---|---|
| **Mast** (RAN, towers) | Node circle r 1 (or 1.5 when large), two straight legs, base line overhanging the legs by 0.5. Radio waves: arcs of radius 3.2 (and 6 for a second wave) spanning ±35° either side of horizontal, centred on the node |
| **Signal waves** (wireless, connected things) | Quarter arcs from one corner point, radii at least 2.25 apart (e.g. 2 and 4.5, or 3 and 5.5) |
| **Cloud** | The standard cloud path, at least 2.5 from the top of the canvas |
| **Chip / GPU** | Rounded square, 2 pins per side of length 1.5, optional inner square |
| **Server / rack** | Rounded rectangle, unit dividers full width, one LED dot per unit at 2 from the left edge |
| **Gear** | Ring plus teeth as short radial strokes: 8 teeth at r ≥ 3, 6 teeth below that; hub circle at 0.35 r (a dot when small) |
| **Person** | Head circle r 2, shoulders a 7-wide arc 7 below the head centre |
| **Sparkle** (AI) | Four-point star with concave sides |
| **Building** | Rectangle with 1-long window ticks, kept at least 2.25 from walls |

## 6. Naming and metadata

- File name: lower-case, hyphenated, describing the concept rather than the picture (`network-slicing.svg`, not `pipe-arrows.svg`).
- `data-title`: how it appears in the panel ("Network slicing").
- `data-tags`: comma-separated search words, including British and US spellings and common abbreviations
  ("data centre, data center, dc").

## 7. Checklist before publishing

1. `python scripts/build.py` runs clean.
2. `icon-lint.html` reports 0 issues.
3. Look at the icon at 24px **and** at slide size (X-Large). Ask whether it still reads at the small size.
4. Insert it in PowerPoint, change **Graphics Outline** colour, and check no box or stray shape appears.
