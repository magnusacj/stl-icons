# STL Icons

A PowerPoint add-in for STL Partners, replacing the Noun Project subscription. It is built on the open-source
[Slides Icons](https://github.com/drankush/Slides-Icons) add-in (MIT) and adds:

- **STL sections**: curated sets for Telco & mobile, Networks, Data centres, Cloud & edge, AI & data,
  Enterprise & industries, Sustainability & energy, Business & strategy, and Companies & logos
- **STL originals**: 152 icons drawn for STL topics the open libraries don't cover, guided by the STL research
  agenda: RAN/Open RAN/vRAN/AI-RAN, 5G-Advanced/6G, slicing, NaaS, APIs, CPaaS, autonomous networks, data centres
  (DCI, cooling, power, heat reuse, rack density), AI (GenAI, LLMs, agents, inference), verticals, consumer services,
  and strategy concepts (infraco/techco/servco, M&A, ARPU, capex, market sizing…)
- **Logos**: 278 full-colour company logos: 165 from the STL slide templates, plus 113 freely licensed logos from
  Wikimedia Commons (towercos, data centre operators and vendors, AI companies, chips, cybersecurity, CPaaS,
  industry bodies, more operators). Each web logo's source file is recorded in `app/logos/logos.json`
- **STL colours by default**: navy, orange, red and grey swatches, plus the house style of a white icon on a coloured circle or square
- **Search that knows STL language**: British spellings ("data centre", "fibre") and shorthand ("dc", "ran", "mno", "genai")
- **Vector insertion**: icons go into PowerPoint as SVG, so they stay sharp and can be recoloured or converted to shapes
- Favourites, recently used, and Copy / SVG / PNG download for use outside PowerPoint
- Search across 94,000+ icons in 106 open-source libraries (on by default; the first search takes a few seconds)
- Settings (gear icon): insert size (default X-Large), vector or picture, and whether search covers all libraries

## Folder layout

```
stl-icons/
├── app/                    The add-in itself: host this folder on HTTPS
│   ├── taskpane.html/.css/.js
│   ├── collections.js      STL sections and search synonyms (edit this)
│   ├── assets/             Ribbon icons
│   └── manifests/          Icon libraries (JSON); stl.json is generated
├── custom-icons/           STL original icons, one SVG each (edit/add here)
├── manifest.template.xml   PowerPoint manifest template
└── scripts/
    ├── build.py            Compiles custom icons, checks sections, writes the manifest
    └── serve.py            Local preview server
```

## Preview locally

```bash
python scripts/serve.py
```

Then open http://localhost:3000/taskpane.html. Everything works except **Insert** (that only appears inside PowerPoint).
Copy and download work in the browser.

## Add an STL icon

1. Draw it on a 24×24 grid (Figma, Illustrator or by hand), using strokes in `currentColor`.
   To match the existing set, copy an SVG from `custom-icons/` as a starting point: stroke width 1.75, round caps and joins.
2. Save it as `custom-icons/<name>.svg` with a `data-title` and comma-separated `data-tags` on the `<svg>` element.
3. Run `python scripts/build.py`.

## Add a company logo

1. Save the logo as a PNG (transparent background preferred) in `app/logos/`, e.g. `app/logos/acme-telecom.png`.
2. Add an entry to `app/logos/logos.json`:
   `{"name": "acme-telecom", "title": "Acme Telecom", "file": "acme-telecom.png", "category": "Telecom operators: Europe", "tags": ["Telecom operators: Europe"]}`.
   Use an existing `category` to put it in that group, or a new one to create a group.
3. Run `python scripts/build.py`.

## Designer opening over the panel

PowerPoint opens its Designer pane whenever a picture is inserted, and add-ins have no way to stop it
(Microsoft's add-in API for inserting pictures without it is still preview-only). Each user can turn it off once:
**File → Options → General → untick "Automatically show me design ideas"**. The panel shows this tip after the first insert.

## Add or change a section

Edit `app/collections.js`. Icons are referenced as `library:icon-name` (for example `tabler:antenna`, `carbon:data-center`,
`stl:ran`), with optional extra search words after a pipe: `'tabler:antenna|aerial, mast'`. To find names, browse a library
under "All libraries" in the app: hovering an icon shows its name. Run `python scripts/build.py` afterwards: it reports any
reference that doesn't exist.

## Deploy for STL staff

PowerPoint only loads add-ins from **HTTPS**, so the `app/` folder needs a web host. Options:

| Host | Notes |
|---|---|
| Azure Static Web Apps or Azure Storage static website | Best fit if STL is on Microsoft 365 / Azure; IT can manage it |
| GitHub Pages | Free and simple; the icons are not confidential |
| Any existing STL web server | Upload `app/` as static files |

SharePoint document libraries won't work: they download `.html` files instead of serving them.

Once hosted, for example at `https://icons.stlpartners.com`:

```bash
python scripts/build.py --base-url https://icons.stlpartners.com
```

This writes `app/manifest.xml`. Then either:

- **Everyone (recommended)**: a Microsoft 365 admin uploads `manifest.xml` in the Microsoft 365 admin centre →
  *Settings → Integrated apps → Upload custom apps*, and assigns it to all users. **STL Icons** then appears on the
  **Insert** tab in PowerPoint (desktop, web and Mac) for everyone, within about a day.
- **Testing on one machine (Windows)**: put `manifest.xml` in a shared folder, add that folder in PowerPoint under
  *File → Options → Trust Center → Trust Center Settings → Trusted Add-in Catalogs*, restart PowerPoint, then
  *Insert → Add-ins → My Add-ins → Shared Folder*.

To update icons later, change the files on the host. Users get the update next time they open the panel, with no reinstall.
Only re-upload the manifest if the host address changes.

## Licences

- Add-in code: MIT (see `LICENSE`), based on Slides Icons by drankush.
- Icon libraries keep their own open-source licences (for example Tabler: MIT, IBM Carbon: Apache 2.0, Simple Icons: CC0).
  None of them require attribution on slides.
- **Company logos** (Companies & logos section) are trademarks of their owners. Using them to refer to the company in
  analysis is normal practice. Don't alter them or imply endorsement.
- STL originals in `custom-icons/` belong to STL Partners.
