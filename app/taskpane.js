/**
 * STL Icons - PowerPoint Add-in
 *
 * Based on Slides Icons by drankush (MIT, github.com/drankush/Slides-Icons).
 * STL additions: curated STL sections and custom icons, STL brand colours,
 * background shapes, vector (SVG) insertion, favourites/recents, copy and download.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const PAGE_SIZE = 120;

const ICON_PALETTE = [
    { name: 'STL navy', hex: '#282f4c' },
    { name: 'STL orange', hex: '#f39100' },
    { name: 'STL red', hex: '#e2051c' },
    { name: 'STL grey', hex: '#5e6378' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Black', hex: '#000000' }
];

const BG_PALETTE = [
    { name: 'STL navy', hex: '#282f4c' },
    { name: 'STL orange', hex: '#f39100' },
    { name: 'STL red', hex: '#e2051c' },
    { name: 'STL grey', hex: '#5e6378' },
    { name: 'Light blue-grey', hex: '#d3dce6' },
    { name: 'Light peach', hex: '#fde8c8' },
    { name: 'Light grey', hex: '#ebebeb' }
];

// Searched by default; the 'All libraries' toggle adds the rest
const CORE_LIBRARIES = ['stl', 'tabler', 'carbon', 'lucide', 'phosphor', 'material', 'simple', 'health'];

// Libraries with designed colour schemes (flags, coloured logos) are never recoloured
const MULTI_COLOR_LIBS = ['crypto', 'flag', 'antdm', 'logos', 'dev', 'payment', 'file'];

const LIBRARY_NAMES = {
    stl: 'STL originals', stllogos: 'STL logos', tabler: 'Tabler', carbon: 'IBM Carbon', lucide: 'Lucide', phosphor: 'Phosphor',
    material: 'Material Symbols', mdi: 'Material Design Icons', simple: 'Simple Icons (brands)',
    logos: 'Logos (colour)', health: 'Health Icons', fluent: 'Microsoft Fluent', bootstrap: 'Bootstrap',
    awesome: 'Font Awesome', flag: 'Flags', remix: 'Remix', iconoir: 'Iconoir', feather: 'Feather'
};

const state = {
    view: { type: 'collection', id: 'telco' },
    groups: [],          // [{ title, items: [{ lib, name, tags }] }]
    displayLimit: PAGE_SIZE,
    selected: null,
    color: '#282f4c',
    shape: 'none',
    bg: '#f39100',
    size: 108,
    format: 'svg',
    allLibraries: true
};

let libraryIndex = [];
let inOffice = false;
let booted = false;
let searchToken = 0;
let insertCount = 0;
const manifests = new Map();   // id -> { data, byName }
const pending = new Map();     // id -> Promise

// ---------- Persistence (per-viewer conveniences only) ----------

const store = {
    get(key, fallback) {
        try {
            const value = localStorage.getItem('stl-icons:' + key);
            return value === null ? fallback : JSON.parse(value);
        } catch (e) {
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem('stl-icons:' + key, JSON.stringify(value));
        } catch (e) { /* storage unavailable */ }
    }
};

// ---------- Startup ----------

if (typeof Office !== 'undefined' && Office.onReady) {
    Office.onReady((info) => {
        inOffice = !!(info && info.host);
        boot();
    });
    setTimeout(boot, 3000); // office.js can stall outside Office
} else {
    boot();
}

async function boot() {
    if (booted) return;
    booted = true;
    document.body.classList.toggle('in-office', inOffice);

    // v2 settings: new defaults (X-Large, all libraries). Keep colour choices from v1.
    const v1 = store.get('settings', {});
    Object.assign(state, { color: v1.color || state.color, shape: v1.shape || state.shape, bg: v1.bg || state.bg },
        store.get('settings-v2', {}));
    setupControls();
    setupEventListeners();

    try {
        const response = await fetch('manifests/index.json');
        if (!response.ok) throw new Error('index.json ' + response.status);
        libraryIndex = (await response.json()).sort((a, b) => libraryName(a.id).localeCompare(libraryName(b.id)));
    } catch (error) {
        console.error('Index load failed:', error);
    }
    document.getElementById('totalCount').textContent = libraryIndex.length;
    renderSidebar();

    const last = store.get('view', null);
    if (last && last.type === 'library') showLibrary(last.id);
    else showCollection(last && last.type === 'collection' ? last.id : 'telco');
}

function saveSettings() {
    const { color, shape, bg, size, format, allLibraries } = state;
    store.set('settings-v2', { color, shape, bg, size, format, allLibraries });
}

// ---------- Controls ----------

function setupControls() {
    renderSwatches('colorSwatches', ICON_PALETTE, () => state.color, (hex) => setColor(hex));
    renderSwatches('bgSwatches', BG_PALETTE, () => state.bg, (hex) => setBg(hex));

    document.getElementById('colorPicker').value = state.color;
    document.getElementById('bgColorPicker').value = state.bg;
    document.getElementById('sizeSelect').value = String(state.size);
    document.getElementById('formatSelect').value = state.format;
    document.getElementById('allLibrariesToggle').checked = state.allLibraries;
    updateShapeButtons();
}

function renderSwatches(id, palette, current, onPick) {
    const container = document.getElementById(id);
    container.innerHTML = palette.map(c =>
        `<button class="swatch" data-hex="${c.hex}" title="${c.name}" aria-label="${c.name}" style="background:${c.hex}"></button>`
    ).join('');
    container.querySelectorAll('.swatch').forEach(btn => {
        btn.addEventListener('click', () => onPick(btn.dataset.hex));
    });
    markSwatch(id, current());
}

function markSwatch(id, hex) {
    document.querySelectorAll(`#${id} .swatch`).forEach(btn => {
        btn.classList.toggle('active', btn.dataset.hex.toLowerCase() === hex.toLowerCase());
    });
}

function setColor(hex) {
    state.color = hex;
    document.getElementById('colorPicker').value = hex;
    markSwatch('colorSwatches', hex);
    restyle();
}

function setBg(hex) {
    state.bg = hex;
    document.getElementById('bgColorPicker').value = hex;
    markSwatch('bgSwatches', hex);
    restyle();
}

function setShape(shape) {
    const wasNone = state.shape === 'none';
    state.shape = shape;
    // Brand style: white line icon on a coloured shape
    if (wasNone && shape !== 'none' && state.color.toLowerCase() === '#282f4c') {
        setColor('#ffffff');
    } else if (shape === 'none' && state.color.toLowerCase() === '#ffffff') {
        setColor('#282f4c');
    }
    updateShapeButtons();
    restyle();
}

function updateShapeButtons() {
    document.querySelectorAll('#shapeSegments button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.shape === state.shape);
    });
    document.getElementById('bgControls').classList.toggle('disabled', state.shape === 'none');
}

function restyle() {
    saveSettings();
    renderGrid();
    renderDetail();
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        clearTimeout(searchInput.timeout);
        searchInput.timeout = setTimeout(runSearchOrRestore, 250);
    });

    document.getElementById('allLibrariesToggle').addEventListener('change', (e) => {
        state.allLibraries = e.target.checked;
        saveSettings();
        if (searchInput.value.trim()) runSearch(searchInput.value);
    });

    document.getElementById('colorPicker').addEventListener('input', (e) => setColor(e.target.value));
    document.getElementById('bgColorPicker').addEventListener('input', (e) => setBg(e.target.value));
    document.querySelectorAll('#shapeSegments button').forEach(btn => {
        btn.addEventListener('click', () => setShape(btn.dataset.shape));
    });
    document.getElementById('sizeSelect').addEventListener('change', (e) => {
        state.size = parseInt(e.target.value, 10);
        saveSettings();
    });
    document.getElementById('formatSelect').addEventListener('change', (e) => {
        state.format = e.target.value;
        saveSettings();
    });

    document.getElementById('sectionSelect').addEventListener('change', (e) => {
        const [type, id] = e.target.value.split(':');
        if (type === 'search') return;
        clearSearch();
        if (type === 'library') showLibrary(id);
        else showCollection(id);
    });

    document.getElementById('settingsButton').addEventListener('click', (e) => {
        const panel = document.getElementById('settingsPanel');
        panel.classList.toggle('hidden');
        e.currentTarget.setAttribute('aria-expanded', String(!panel.classList.contains('hidden')));
    });

    document.getElementById('toggleSidebar').addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
    });
    document.getElementById('librariesHeader').addEventListener('click', (e) => {
        const list = document.getElementById('libraryList');
        list.classList.toggle('hidden');
        e.currentTarget.setAttribute('aria-expanded', String(!list.classList.contains('hidden')));
    });

    const grid = document.getElementById('iconsGrid');
    grid.addEventListener('click', (e) => {
        if (e.target.closest('#loadMoreBtn')) {
            state.displayLimit += PAGE_SIZE;
            renderGrid();
            return;
        }
        const cell = e.target.closest('.icon-item');
        if (!cell) return;
        const entry = entryFromKey(cell.dataset.key);
        selectEntry(entry);
        if (inOffice) insertEntry(entry, cell);
    });

    grid.addEventListener('click', (e) => {
        if (e.target.closest('#nothingFoundBtn')) openFeedback('no_results');
    });
    grid.addEventListener('contextmenu', (e) => {
        const cell = e.target.closest('.icon-item');
        if (!cell) return;
        e.preventDefault();
        selectEntry(entryFromKey(cell.dataset.key));
        showContextMenu(e.clientX, e.clientY);
    });
    document.getElementById('contextMenu').addEventListener('click', (e) => {
        const action = e.target.closest('button')?.dataset.action;
        hideContextMenu();
        if (!action || !state.selected) return;
        if (action === 'insert') insertEntry(state.selected);
        else if (action === 'favourite') toggleFavourite();
        else if (action === 'up' || action === 'down') vote(action);
        else if (action === 'flag') openFeedback('remove');
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('#contextMenu')) hideContextMenu(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { hideContextMenu(); closeFeedback(); } });

    document.getElementById('insertBtn').addEventListener('click', () => state.selected && insertEntry(state.selected));
    document.getElementById('favBtn').addEventListener('click', toggleFavourite);
    document.getElementById('upBtn').addEventListener('click', () => vote('up'));
    document.getElementById('downBtn').addEventListener('click', () => vote('down'));
    document.getElementById('flagBtn').addEventListener('click', () => openFeedback('remove'));
    document.getElementById('requestButton').addEventListener('click', () => openFeedback('request'));
    document.getElementById('closeSidebar').addEventListener('click', () => document.body.classList.add('sidebar-collapsed'));
    document.getElementById('feedbackCancel').addEventListener('click', closeFeedback);
    document.getElementById('feedbackForm').addEventListener('submit', (e) => { e.preventDefault(); submitFeedback(); });
    document.getElementById('dismissTip').addEventListener('click', () => {
        store.set('designerTipDismissed', true);
        document.getElementById('designerTip').classList.add('hidden');
    });
}

// ---------- Manifests ----------

function libraryName(id) {
    return LIBRARY_NAMES[id] || (id.charAt(0).toUpperCase() + id.slice(1));
}

function loadManifest(id) {
    if (manifests.has(id)) return Promise.resolve(manifests.get(id));
    if (pending.has(id)) return pending.get(id);

    const promise = fetch(`manifests/${id}.json`)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${id}`);
            return response.json();
        })
        .then(data => {
            const entry = { data, byName: new Map(data.icons.map(i => [i.name, i])) };
            manifests.set(id, entry);
            pending.delete(id);
            return entry;
        })
        .catch(error => {
            pending.delete(id);
            console.warn(error);
            return null;
        });
    pending.set(id, promise);
    return promise;
}

async function loadManifests(ids) {
    const BATCH_SIZE = 8;
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        await Promise.all(ids.slice(i, i + BATCH_SIZE).map(loadManifest));
    }
}

function getIcon(entry) {
    const manifest = manifests.get(entry.lib);
    return manifest ? manifest.byName.get(entry.name) : null;
}

/** Logos are full-colour pictures: never recoloured, inserted as PNG. */
function isImage(entry) {
    const icon = getIcon(entry);
    return !!(icon && icon.image);
}

function parseRef(ref) {
    const [key, tags] = ref.split('|');
    const [lib, name] = key.split(':');
    return { lib, name, tags: tags ? tags.split(',').map(t => t.trim()) : [] };
}

function entryFromKey(key) {
    const [lib, name] = key.split(':');
    return { lib, name, tags: [] };
}

// ---------- Collections and sidebar ----------

function specialCollections() {
    const favourites = store.get('favourites', []);
    const recent = store.get('recent', []);
    const list = [];
    if (favourites.length) list.push({ id: 'favourites', name: 'Favourites', icons: favourites });
    if (recent.length) list.push({ id: 'recent', name: 'Recently used', icons: recent });
    return list;
}

function allCollections() {
    return specialCollections().concat(window.STL_COLLECTIONS || []);
}

function renderSidebar() {
    const collectionList = document.getElementById('collectionList');
    collectionList.innerHTML = allCollections().map(c => `
        <div class="library-item${c.library === 'stl' ? ' stl-own' : ''}" data-collection="${c.id}" title="${escapeHtml(c.description || c.name)}">
            <span class="name">${escapeHtml(c.name)}</span>
            <span class="count">${c.icons ? c.icons.length : ''}</span>
        </div>
    `).join('');

    document.getElementById('libraryList').innerHTML = libraryIndex.map(lib => `
        <div class="library-item" data-library="${lib.id}">
            <span class="name">${escapeHtml(libraryName(lib.id))}</span>
            <span class="count">${lib.totalIcons}</span>
        </div>
    `).join('');

    const select = document.getElementById('sectionSelect');
    const searchOption = select.querySelector('option[value="search"]');
    const optionsFor = (list, type, label) => list.map(item =>
        `<option value="${type}:${item.id}">${escapeHtml(label(item))}</option>`).join('');
    select.innerHTML =
        `<optgroup label="STL sections">${optionsFor(allCollections(), 'collection', c => c.name)}</optgroup>` +
        `<optgroup label="All libraries">${optionsFor(libraryIndex, 'library', l => libraryName(l.id))}</optgroup>`;
    if (searchOption) {
        select.prepend(searchOption);
        select.value = 'search';
    }

    document.querySelectorAll('[data-collection]').forEach(el => {
        el.addEventListener('click', () => { clearSearch(); showCollection(el.dataset.collection); collapseIfNarrow(); });
    });
    document.querySelectorAll('[data-library]').forEach(el => {
        el.addEventListener('click', () => { clearSearch(); showLibrary(el.dataset.library); collapseIfNarrow(); });
    });
    markActiveSidebarItem();
}

function markActiveSidebarItem() {
    const select = document.getElementById('sectionSelect');
    if (!select.querySelector('option[value="search"]')) select.value = `${state.view.type}:${state.view.id}`;
    document.querySelectorAll('[data-collection]').forEach(el => {
        el.classList.toggle('active', state.view.type === 'collection' && state.view.id === el.dataset.collection);
    });
    document.querySelectorAll('[data-library]').forEach(el => {
        el.classList.toggle('active', state.view.type === 'library' && state.view.id === el.dataset.library);
    });
}

function collapseIfNarrow() {
    if (window.innerWidth < 520) document.body.classList.add('sidebar-collapsed');
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
}

async function showCollection(id) {
    const collection = allCollections().find(c => c.id === id) || window.STL_COLLECTIONS[1];
    state.view = { type: 'collection', id: collection.id };
    store.set('view', state.view);
    markActiveSidebarItem();
    setTitle(collection.name, '');
    showLoading(true);

    let items;
    if (collection.library) {
        const manifest = await loadManifest(collection.library);
        items = manifest ? manifest.data.icons.map(i => ({ lib: collection.library, name: i.name, tags: [] })) : [];
    } else {
        items = collection.icons.map(parseRef);
        await loadManifests([...new Set(items.map(i => i.lib))]);
        items = items.filter(i => getIcon(i));
    }

    if (state.view.type !== 'collection' || state.view.id !== collection.id) return;
    showLoading(false);
    if (collection.groupBy) {
        const groups = new Map();
        items.forEach(item => {
            const key = getIcon(item)[collection.groupBy] || 'Other';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(item);
        });
        setGroups([...groups].map(([title, groupItems]) => ({ title, items: groupItems })));
    } else {
        setGroups([{ title: null, items }]);
    }
    setTitle(collection.name, `${items.length} ${collection.library === 'stllogos' ? 'logos' : 'icons'}`);
}

async function showLibrary(id) {
    state.view = { type: 'library', id };
    store.set('view', state.view);
    markActiveSidebarItem();
    setTitle(libraryName(id), '');
    showLoading(true);

    const manifest = await loadManifest(id);
    if (state.view.type !== 'library' || state.view.id !== id) return;
    showLoading(false);
    const items = manifest ? manifest.data.icons.map(i => ({ lib: id, name: i.name, tags: [] })) : [];
    setGroups([{ title: null, items }]);
    setTitle(libraryName(id), `${items.length} icons`);
}

function setGroups(groups) {
    state.groups = groups;
    // Show curated sets (e.g. all logos) in one go; page through big libraries
    const total = groups.reduce((n, g) => n + g.items.length, 0);
    state.displayLimit = total <= 400 ? total : PAGE_SIZE;
    renderGrid();
}

// ---------- Search ----------

function normaliseText(text) {
    const spellings = window.STL_SPELLINGS || {};
    return String(text).toLowerCase()
        .replace(/[-_/]+/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .map(word => spellings[word] || word)
        .join(' ');
}

function expandQuery(query) {
    const synonyms = window.STL_SYNONYMS || {};
    const phrase = normaliseText(query);
    const terms = [{ text: phrase, weight: 1 }];
    const words = phrase.split(' ');
    const compact = phrase.replace(/ /g, '');
    const synonymKey = synonyms[compact] ? compact : (words.length === 1 ? words[0] : null);
    if (synonymKey && synonyms[synonymKey]) {
        synonyms[synonymKey].forEach(s => {
            const text = normaliseText(s);
            if (text !== phrase) terms.push({ text, weight: 0.8 });
        });
    }
    return terms;
}

function scoreText(haystack, term) {
    if (!haystack) return 0;
    if (haystack === term) return 100;
    const words = haystack.split(' ');
    // Short terms like 'ai', 'ran', '5g' must match whole words, or 'ai' finds 'chair'
    if (term.length <= 3 && !term.includes(' ')) {
        return words.includes(term) ? 70 : 0;
    }
    if (haystack.startsWith(term)) return 80;
    if (words.some(w => w.startsWith(term))) return 60;
    if (haystack.includes(term)) return 40;
    return 0;
}

function scoreEntry(entry, icon, terms) {
    const name = normaliseText(icon.name);
    const title = icon.title ? normaliseText(icon.title) : '';
    const tags = (icon.tags || []).concat(entry.tags || []).map(normaliseText);
    if (icon.category) tags.push(normaliseText(icon.category));

    let best = 0;
    for (const term of terms) {
        let score = Math.max(scoreText(name, term.text), scoreText(title, term.text));
        for (const tag of tags) score = Math.max(score, scoreText(tag, term.text) * 0.9);
        best = Math.max(best, score * term.weight);
    }
    return best;
}

function runSearchOrRestore() {
    const query = document.getElementById('searchInput').value.trim();
    if (query) runSearch(query);
    else if (state.view.type === 'library') showLibrary(state.view.id);
    else showCollection(state.view.id);
}

async function runSearch(query) {
    const token = ++searchToken;
    const terms = expandQuery(query);
    markActiveSidebarItem();
    setTitle(`Search: “${query}”`, 'Searching...', true);

    // 1. STL sections first: curated and tagged for STL topics
    const curated = (window.STL_COLLECTIONS || []);
    const curatedLibs = new Set();
    curated.forEach(c => {
        if (c.library) curatedLibs.add(c.library);
        (c.icons || []).forEach(ref => curatedLibs.add(parseRef(ref).lib));
    });
    await loadManifests([...curatedLibs]);
    if (token !== searchToken) return;

    const seen = new Set();
    const stlHits = [];
    const consider = (entry, bucket) => {
        const key = `${entry.lib}:${entry.name}`;
        if (seen.has(key)) return;
        const icon = getIcon(entry);
        if (!icon) return;
        const score = scoreEntry(entry, icon, terms);
        if (score > 0) {
            seen.add(key);
            bucket.push({ ...entry, score });
        }
    };

    curated.forEach(c => {
        const own = c.library && manifests.get(c.library);
        if (own) own.data.icons.forEach(i => consider({ lib: c.library, name: i.name, tags: [] }, stlHits));
        (c.icons || []).forEach(ref => consider(parseRef(ref), stlHits));
    });
    stlHits.sort((a, b) => b.score - a.score);

    const groups = [{ title: 'STL sections', items: stlHits }, { title: 'Open-source libraries', items: [], loading: true }];
    state.groups = groups;
    state.displayLimit = PAGE_SIZE;
    renderGrid();

    // 2. Open-source libraries
    // STL's own libraries were searched in full above
    const libIds = (state.allLibraries ? libraryIndex.map(l => l.id) : CORE_LIBRARIES)
        .filter(id => id !== 'stl' && id !== 'stllogos');
    await loadManifests(libIds);
    if (token !== searchToken) return;

    const libHits = [];
    for (const id of libIds) {
        const manifest = manifests.get(id);
        if (!manifest) continue;
        for (const icon of manifest.data.icons) consider({ lib: id, name: icon.name, tags: [] }, libHits);
    }
    libHits.sort((a, b) => b.score - a.score);

    groups[1] = { title: 'Open-source libraries', items: libHits.slice(0, 1500), more: libHits.length > 1500 };
    renderGrid();
    const total = stlHits.length + libHits.length;
    setTitle(`Search: “${query}”`, `${total} icons`, true);

    // Count the search once the person stops typing (anonymous)
    clearTimeout(runSearch.logTimer);
    runSearch.logTimer = setTimeout(() => {
        if (token === searchToken) window.STLFeedback.usage({ event: 'search', query, result_count: total });
    }, 2000);
}

// ---------- SVG building ----------

const PRESENTATION_ATTRS = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
    'stroke-miterlimit', 'fill-rule', 'clip-rule', 'opacity'];

function isRecolourable(value) {
    if (!value) return false;
    const v = value.trim().toLowerCase();
    // White fills are usually knock-outs inside a shape, so keep them
    return !(v === 'none' || v === 'transparent' || v.startsWith('url(') || v === '#fff' || v === '#ffffff' || v === 'white');
}

const SHAPE_TAGS = ['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon'];

function paintValue(el, prop) {
    const style = el.getAttribute('style') || '';
    const m = style.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`));
    return m ? m[1].trim() : el.getAttribute(prop);
}

/**
 * Drop shapes with neither fill nor stroke, such as Tabler's 24x24 frame path. They are invisible on
 * screen, but PowerPoint's Graphics Outline strokes every shape, which turns them into a visible box.
 */
function removeInvisibleShapes(root) {
    const walk = (el, fill, stroke) => {
        fill = paintValue(el, 'fill') ?? fill;
        stroke = paintValue(el, 'stroke') ?? stroke;
        const isNone = v => v === 'none' || v === 'transparent';
        if (SHAPE_TAGS.includes(el.localName) && isNone(fill) && (stroke == null || isNone(stroke))) {
            el.remove();
            return;
        }
        Array.from(el.children).forEach(child => walk(child, fill, stroke));
    };
    // SVG defaults: fill black, stroke none
    walk(root, 'black', null);
}

/** Returns { viewBox, attrs, inner } with colours applied. */
function iconParts(entry, color) {
    const icon = getIcon(entry);
    if (!icon) return null;

    let source;
    if (typeof icon.svg === 'string') source = icon.svg;
    else if (icon.svg && typeof icon.svg.content === 'string') {
        source = `<svg xmlns="${SVG_NS}" viewBox="${icon.svg.viewBox || '0 0 24 24'}">${icon.svg.content}</svg>`;
    } else return null;

    const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
    const root = doc.documentElement;
    if (!root || root.nodeName !== 'svg') return null;

    let viewBox = root.getAttribute('viewBox');
    if (!viewBox) {
        const w = parseFloat(root.getAttribute('width')) || 24;
        const h = parseFloat(root.getAttribute('height')) || 24;
        viewBox = `0 0 ${w} ${h}`;
    }

    const attrs = {};
    PRESENTATION_ATTRS.forEach(a => {
        if (root.hasAttribute(a)) attrs[a] = root.getAttribute(a);
    });

    removeInvisibleShapes(root);

    if (!MULTI_COLOR_LIBS.includes(entry.lib)) {
        // SVG fills default to black, so an unset root fill means 'icon colour'
        if (!attrs.fill || isRecolourable(attrs.fill)) attrs.fill = color;
        if (attrs.stroke && isRecolourable(attrs.stroke)) attrs.stroke = color;

        root.querySelectorAll('*').forEach(el => {
            ['fill', 'stroke'].forEach(a => {
                const v = el.getAttribute(a);
                if (v && isRecolourable(v)) el.setAttribute(a, color);
            });
            const style = el.getAttribute('style');
            if (style) {
                el.setAttribute('style', style.replace(/(fill|stroke)\s*:\s*([^;]+)/g,
                    (m, prop, val) => isRecolourable(val) ? `${prop}:${color}` : m));
            }
        });
    }

    const serializer = new XMLSerializer();
    let inner = Array.from(root.childNodes).map(n => serializer.serializeToString(n)).join('');
    inner = inner.replace(/ xmlns="[^"]*"/g, '').replace(/currentColor/g, color);
    Object.keys(attrs).forEach(a => { attrs[a] = attrs[a].replace(/currentColor/g, color); });

    return { viewBox, attrs, inner };
}

function round(n) {
    return Math.round(n * 1000) / 1000;
}

/** Full standalone SVG for an entry, styled with the current settings. */
function buildSvg(entry, px) {
    const parts = iconParts(entry, state.color);
    if (!parts) return null;

    const [minX, minY, w, h] = parts.viewBox.split(/[\s,]+/).map(Number);
    const attrString = Object.entries(parts.attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
    const group = `<g ${attrString}>${parts.inner}</g>`;
    const max = Math.max(w, h);

    if (state.shape === 'none') {
        const width = round(px * w / max);
        const height = round(px * h / max);
        return `<svg xmlns="${SVG_NS}" viewBox="${parts.viewBox}" width="${width}" height="${height}">${group}</svg>`;
    }

    // 100x100 canvas, icon fills the central 60%
    const box = 60;
    const scale = box / max;
    const tx = round(20 + (box - w * scale) / 2 - minX * scale);
    const ty = round(20 + (box - h * scale) / 2 - minY * scale);
    const background = {
        circle: `<circle cx="50" cy="50" r="50" fill="${state.bg}"/>`,
        rounded: `<rect width="100" height="100" rx="18" fill="${state.bg}"/>`,
        square: `<rect width="100" height="100" fill="${state.bg}"/>`
    }[state.shape];

    return `<svg xmlns="${SVG_NS}" viewBox="0 0 100 100" width="${px}" height="${px}">${background}` +
        `<g transform="translate(${tx} ${ty}) scale(${round(scale)})">${group}</g></svg>`;
}

function svgToPngBase64(svg, px) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
        img.onload = () => {
            const ratio = img.naturalHeight / img.naturalWidth || 1;
            const canvas = document.createElement('canvas');
            canvas.width = px;
            canvas.height = Math.round(px * ratio);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png').split(',')[1]);
        };
        img.onerror = (e) => {
            URL.revokeObjectURL(url);
            reject(e);
        };
        img.src = url;
    });
}

/** PNG (base64) of a logo file at its own size, capped so slides stay small. */
function imageToPngBase64(src, maxWidth) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, maxWidth / img.naturalWidth);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.naturalWidth * scale);
            canvas.height = Math.round(img.naturalHeight * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve({ base64: canvas.toDataURL('image/png').split(',')[1], ratio: img.naturalWidth / img.naturalHeight });
        };
        img.onerror = reject;
        img.src = src;
    });
}

/** PNG for any entry: logos as they are, icons styled with the current settings. */
async function entryPng(entry) {
    const icon = getIcon(entry);
    if (icon.image) return imageToPngBase64(icon.image, 1200);
    const { width, height } = insertSize(entry);
    return { base64: await svgToPngBase64(buildSvg(entry, 512), 512), ratio: width / height };
}

// ---------- Rendering ----------

function isLight(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.85;
}

function renderGrid() {
    const grid = document.getElementById('iconsGrid');
    const onDark = state.shape === 'none' && isLight(state.color);
    const cellClass = 'icon-item' + (state.shape !== 'none' ? ' has-shape' : '') + (onDark ? ' on-dark' : '');
    const selectedKey = state.selected ? `${state.selected.lib}:${state.selected.name}` : null;
    const showHeadings = state.groups.length > 1;
    const total = state.groups.reduce((n, g) => n + g.items.length, 0);

    let html = '';
    let shown = 0;
    for (const group of state.groups) {
        if (shown >= state.displayLimit && group.items.length) break;
        if (showHeadings) {
            const note = group.loading ? 'loading...' : `${group.items.length}${group.more ? '+' : ''}`;
            html += `<div class="grid-heading"><span>${group.title}</span><span class="muted">${note}</span></div>`;
            if (!group.loading && group.items.length === 0) {
                html += `<div class="empty-state">No matches here</div>`;
            }
        }
        for (const entry of group.items) {
            if (shown >= state.displayLimit) break;
            const key = `${entry.lib}:${entry.name}`;
            const icon = getIcon(entry);
            if (!icon) continue;
            const label = `${icon.title || icon.name} · ${libraryName(entry.lib)}`;
            const selected = key === selectedKey ? ' selected' : '';
            if (icon.image) {
                html += `<div class="icon-item logo${icon.dark ? ' on-dark' : ''}${selected}" data-key="${key}" title="${escapeHtml(label)}">` +
                    `<img src="${icon.image}" alt="${escapeHtml(icon.title)}" loading="lazy"></div>`;
            } else {
                const svg = buildSvg(entry, 48);
                if (!svg) continue;
                html += `<div class="${cellClass}${selected}" data-key="${key}" title="${escapeHtml(label)}">` +
                    `${svg}${entry.lib === 'stl' ? '<span class="stl-badge">★</span>' : ''}</div>`;
            }
            shown++;
        }
    }

    if (total === 0 && !showHeadings) {
        html = '<div class="empty-state">No icons found</div>';
    }
    if (total > state.displayLimit) {
        html += `<div class="load-more-container"><button id="loadMoreBtn" class="load-more-btn">Show more (${total - state.displayLimit} remaining)</button></div>`;
    }
    const searching = document.getElementById('searchInput').value.trim() && !state.groups.some(g => g.loading);
    if (searching) {
        html += `<div class="nothing-found">Nothing suitable? <button id="nothingFoundBtn">Tell us what you need</button></div>`;
    }
    grid.innerHTML = html;
}

/** The header dropdown shows the current section, or a search entry while searching. */
function setTitle(title, count, isSearch = false) {
    const select = document.getElementById('sectionSelect');
    const searchOption = select.querySelector('option[value="search"]');
    if (searchOption) searchOption.remove();
    if (isSearch) {
        select.insertAdjacentHTML('afterbegin', `<option value="search">${escapeHtml(title)}</option>`);
        select.value = 'search';
    } else {
        select.value = `${state.view.type}:${state.view.id}`;
    }
    document.getElementById('iconCount').textContent = count;
}

function showLoading(show) {
    document.querySelector('.loading-state').classList.toggle('hidden', !show);
    document.getElementById('iconsGrid').style.opacity = show ? '0.5' : '1';
}

function selectEntry(entry) {
    state.selected = entry;
    document.querySelectorAll('.icon-item.selected').forEach(el => el.classList.remove('selected'));
    const cell = document.querySelector(`.icon-item[data-key="${entry.lib}:${entry.name}"]`);
    if (cell) cell.classList.add('selected');
    renderDetail();
}

function renderDetail() {
    const bar = document.getElementById('detailBar');
    const entry = state.selected;
    const icon = entry && getIcon(entry);
    if (!icon) {
        bar.classList.add('hidden');
        return;
    }
    bar.classList.remove('hidden');
    const preview = document.getElementById('detailPreview');
    if (icon.image) {
        preview.innerHTML = `<img src="${icon.image}" alt="">`;
        preview.style.background = icon.dark ? 'var(--stl-navy)' : '';
    } else {
        preview.innerHTML = buildSvg(entry, 40) || '';
        preview.style.background = state.shape === 'none' && isLight(state.color) ? '#5e6378' : '';
    }
    const myVote = store.get('votes', {})[`${entry.lib}:${entry.name}`];
    document.getElementById('upBtn').classList.toggle('voted', myVote === 'up');
    document.getElementById('downBtn').classList.toggle('voted', myVote === 'down');
    document.getElementById('detailTitle').textContent = icon.title || icon.name;
    document.getElementById('detailSource').textContent = libraryName(entry.lib);
    const isFav = store.get('favourites', []).includes(`${entry.lib}:${entry.name}`);
    const favBtn = document.getElementById('favBtn');
    favBtn.textContent = isFav ? '★' : '☆';
    favBtn.title = isFav ? 'Remove from favourites' : 'Add to favourites';
}

// ---------- Actions ----------

function rememberRecent(entry) {
    const key = `${entry.lib}:${entry.name}`;
    const recent = store.get('recent', []).filter(k => k !== key);
    recent.unshift(key);
    store.set('recent', recent.slice(0, 30));
    renderSidebar();
}

function toggleFavourite() {
    const entry = state.selected;
    if (!entry) return;
    const key = `${entry.lib}:${entry.name}`;
    let favourites = store.get('favourites', []);
    favourites = favourites.includes(key) ? favourites.filter(k => k !== key) : [key].concat(favourites);
    store.set('favourites', favourites);
    renderSidebar();
    renderDetail();
}

/** Logos keep their proportions: the size setting sets the height, within a width cap for long wordmarks. */
function logoSize(ratio) {
    let height = state.size * 0.75;
    let width = height * ratio;
    if (width > state.size * 3) {
        width = state.size * 3;
        height = width / ratio;
    }
    return { width, height };
}

function insertSize(entry) {
    const parts = iconParts(entry, state.color);
    const [, , w, h] = parts.viewBox.split(/[\s,]+/).map(Number);
    if (state.shape !== 'none') return { width: state.size, height: state.size };
    const max = Math.max(w, h);
    return { width: state.size * w / max, height: state.size * h / max };
}

async function insertEntry(entry, cell) {
    if (!inOffice) {
        showToast('Open STL Icons inside PowerPoint to insert icons.');
        return;
    }
    if (cell) cell.classList.add('inserting');
    try {
        const offset = (insertCount++ % 6) * 12;
        const at = { imageLeft: 100 + offset, imageTop: 100 + offset };
        const vector = !isImage(entry) && state.format === 'svg' &&
            Office.context.requirements.isSetSupported('ImageCoercion', '1.2');

        if (vector) {
            const { width, height } = insertSize(entry);
            await setSelectedData(buildSvg(entry, state.size), {
                coercionType: Office.CoercionType.XmlSvg, ...at, imageWidth: width, imageHeight: height
            });
        } else {
            const png = await entryPng(entry);
            const { width, height } = isImage(entry) ? logoSize(png.ratio) : insertSize(entry);
            await setSelectedData(png.base64, {
                coercionType: Office.CoercionType.Image, ...at, imageWidth: width, imageHeight: height
            });
        }
        rememberRecent(entry);
        showToast('Inserted');
        window.STLFeedback.usage({
            event: 'insert', icon_key: entryKey(entry), icon_title: entryTitle(entry),
            query: document.getElementById('searchInput').value.trim() || null
        });
        if (!store.get('designerTipDismissed', false)) document.getElementById('designerTip').classList.remove('hidden');
    } catch (error) {
        console.error('Insert failed:', error);
        showToast('Insert failed: ' + (error.message || error), 'error');
    } finally {
        if (cell) cell.classList.remove('inserting');
    }
}

function setSelectedData(data, options) {
    return new Promise((resolve, reject) => {
        Office.context.document.setSelectedDataAsync(data, options, (res) => {
            if (res.status === Office.AsyncResultStatus.Succeeded) resolve();
            else reject(new Error(res.error.message));
        });
    });
}

// ---------- Feedback ----------

const FEEDBACK_FORMS = {
    request: {
        title: 'Request an icon',
        intro: 'Tell us the icon or logo you need and what it’s for. We’ll add it to STL Icons.',
        placeholder: 'e.g. an icon for "network digital twin", or the Iliad logo'
    },
    no_results: {
        title: 'Nothing suitable?',
        intro: 'Tell us what you were looking for, so we can add it.',
        placeholder: 'What did you need the icon to show?'
    },
    remove: {
        title: 'Suggest removing this icon',
        intro: 'Why should this icon go? For example: unclear, wrong, duplicate or off-brand.',
        placeholder: 'Reason (optional)'
    }
};
let feedbackKind = null;

function entryKey(entry) {
    return entry ? `${entry.lib}:${entry.name}` : null;
}

function entryTitle(entry) {
    const icon = entry && getIcon(entry);
    return icon ? (icon.title || icon.name) : null;
}

function openFeedback(kind) {
    feedbackKind = kind;
    const form = FEEDBACK_FORMS[kind];
    const query = document.getElementById('searchInput').value.trim();
    document.getElementById('feedbackTitle').textContent = form.title;
    document.getElementById('feedbackIntro').textContent = kind === 'remove' && state.selected
        ? `${entryTitle(state.selected)}: ${form.intro}` : form.intro;
    const message = document.getElementById('feedbackMessage');
    message.placeholder = form.placeholder;
    message.value = kind === 'no_results' && query ? `I searched for "${query}" and needed: ` : '';
    document.getElementById('feedbackName').value = store.get('feedbackName', '');
    document.getElementById('feedbackDialog').classList.remove('hidden');
    message.focus();
}

function closeFeedback() {
    document.getElementById('feedbackDialog').classList.add('hidden');
    feedbackKind = null;
}

async function submitFeedback() {
    const message = document.getElementById('feedbackMessage').value.trim();
    const name = document.getElementById('feedbackName').value.trim();
    if (!message && feedbackKind !== 'remove') {
        document.getElementById('feedbackMessage').focus();
        return;
    }
    store.set('feedbackName', name);
    const row = {
        kind: feedbackKind,
        message: message || null,
        name: name || null,
        query: document.getElementById('searchInput').value.trim() || null,
        icon_key: feedbackKind === 'remove' ? entryKey(state.selected) : null,
        icon_title: feedbackKind === 'remove' ? entryTitle(state.selected) : null
    };
    closeFeedback();
    const sent = await window.STLFeedback.feedback(row);
    showToast(sent ? 'Thanks, sent' : 'Thanks, saved: it will be sent when the feedback service is connected');
}

/** Thumbs up/down: one vote per icon per person; voting the same way again takes it back. */
async function vote(direction) {
    const entry = state.selected;
    if (!entry) return;
    const key = entryKey(entry);
    const votes = store.get('votes', {});
    const undo = votes[key] === direction;
    if (undo) delete votes[key]; else votes[key] = direction;
    store.set('votes', votes);
    renderDetail();
    await window.STLFeedback.feedback({
        kind: undo ? `undo_${direction}` : (direction === 'up' ? 'thumbs_up' : 'thumbs_down'),
        icon_key: key,
        icon_title: entryTitle(entry),
        query: document.getElementById('searchInput').value.trim() || null
    });
    showToast(undo ? 'Vote removed' : (direction === 'up' ? 'Thanks: marked as a good icon' : 'Thanks: marked as not good'));
}

function showContextMenu(x, y) {
    const menu = document.getElementById('contextMenu');
    menu.classList.remove('hidden');
    const { width, height } = menu.getBoundingClientRect();
    menu.style.left = Math.min(x, window.innerWidth - width - 8) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - height - 8) + 'px';
}

function hideContextMenu() {
    document.getElementById('contextMenu').classList.add('hidden');
}

// ---------- Utilities ----------

function showToast(msg, type) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast visible ${type || ''}`;
    clearTimeout(toast.timeout);
    toast.timeout = setTimeout(() => toast.classList.remove('visible'), 2200);
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
