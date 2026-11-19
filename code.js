// 12shades – Figma-Plugin (Hauptthread). Rechnet nichts, liest und schreibt nur Variablen und Farbstile.
figma.showUI(__html__, { width: 1160, height: 900 });

const NS = '12shades';
const STOPS = [0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000];

const toHex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const toRgb = hex => {
  const h = hex.replace('#', '');
  return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 };
};
// "brand/500" -> { prefix: "brand", stop: 500 }
const parseName = name => {
  const m = /^(.+)\/(\d+)$/.exec(name);
  if (!m) return null;
  const stop = parseInt(m[2], 10);
  return STOPS.indexOf(stop) === -1 ? null : { prefix: m[1], stop };
};

const readSettings = () => { try { return JSON.parse(figma.root.getSharedPluginData(NS, 'palettes') || '{}'); } catch (e) { return {}; } };
const writeSettings = map => figma.root.setSharedPluginData(NS, 'palettes', JSON.stringify(map));

async function scan() {
  const found = {};
  const get = key => found[key] || (found[key] = { key, name: key, stops: {}, variables: false, styles: false, collection: null });

  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const colById = {};
  cols.forEach(c => { colById[c.id] = c; });
  const vars = await figma.variables.getLocalVariablesAsync('COLOR');
  for (const v of vars) {
    const p = parseName(v.name);
    const col = colById[v.variableCollectionId];
    if (!p || !col) continue;
    const val = v.valuesByMode[col.defaultModeId];
    if (!val || typeof val.r !== 'number') continue; // Alias oder leer: überspringen
    const pal = get(p.prefix);
    if (pal.collection && pal.collection !== col.name) continue; // gleicher Name in anderer Sammlung: ignorieren
    pal.collection = col.name;
    pal.variables = true;
    pal.stops[p.stop] = toHex(val);
  }

  const styles = await figma.getLocalPaintStylesAsync();
  for (const s of styles) {
    const p = parseName(s.name);
    const paint = s.paints && s.paints[0];
    if (!p || !paint || paint.type !== 'SOLID') continue;
    const pal = get(p.prefix);
    pal.styles = true;
    if (pal.stops[p.stop] === undefined) pal.stops[p.stop] = toHex(paint.color);
  }

  const stored = readSettings();
  return Object.keys(found)
    .map(k => found[k])
    .filter(p => Object.keys(p.stops).length >= 3)
    .map(p => Object.assign(p, { settings: stored[p.key] || null }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function apply(items) {
  const cache = {
    cols: await figma.variables.getLocalVariableCollectionsAsync(),
    vars: await figma.variables.getLocalVariablesAsync('COLOR'),
    styles: await figma.getLocalPaintStylesAsync()
  };
  const settings = readSettings();
  let created = 0, updated = 0, skipped = 0, renamed = 0;

  for (const it of items) {
    if (it.oldName && it.oldName !== it.name) {
      const clash = cache.vars.some(v => parseName(v.name) && parseName(v.name).prefix === it.name)
        || cache.styles.some(s => parseName(s.name) && parseName(s.name).prefix === it.name);
      if (clash) throw new Error('Eine Palette namens "' + it.name + '" existiert bereits.');
      cache.vars.forEach(v => { const p = parseName(v.name); if (p && p.prefix === it.oldName) v.name = it.name + '/' + p.stop; });
      cache.styles.forEach(s => { const p = parseName(s.name); if (p && p.prefix === it.oldName) s.name = it.name + '/' + p.stop; });
      delete settings[it.oldName];
      renamed++;
    }
    if (it.targets.variables) {
      let col = cache.cols.find(c => c.name === it.collection);
      if (!col) { col = figma.variables.createVariableCollection(it.collection); cache.cols.push(col); }
      for (const sw of it.swatches) {
        const name = it.name + '/' + sw.stop;
        let v = cache.vars.find(x => x.name === name && x.variableCollectionId === col.id);
        if (!v) { v = figma.variables.createVariable(name, col, 'COLOR'); cache.vars.push(v); created++; } else updated++;
        const rgba = Object.assign(toRgb(sw.hex), { a: 1 });
        col.modes.forEach(m => v.setValueForMode(m.modeId, rgba));
      }
    }
    if (it.targets.styles) {
      for (const sw of it.swatches) {
        const name = it.name + '/' + sw.stop;
        let s = cache.styles.find(x => x.name === name);
        if (!s) { s = figma.createPaintStyle(); s.name = name; cache.styles.push(s); created++; }
        else {
          const bound = s.paints[0] && s.paints[0].boundVariables && s.paints[0].boundVariables.color;
          if (bound) { skipped++; continue; } // Stil hängt an einer Variable und folgt ihr automatisch
          updated++;
        }
        s.paints = [{ type: 'SOLID', color: toRgb(sw.hex) }];
      }
    }
    settings[it.name] = it.settings;
  }
  writeSettings(settings);

  let msg = items.length + (items.length === 1 ? ' Palette' : ' Paletten') + ': ' + created + ' angelegt, ' + updated + ' aktualisiert';
  if (renamed) msg += ', ' + renamed + ' umbenannt';
  if (skipped) msg += ', ' + skipped + ' Stil(e) an Variablen gebunden (übersprungen)';
  figma.notify(msg);
}

figma.ui.onmessage = async msg => {
  try {
    if (msg.type === 'getTheme') {
      figma.ui.postMessage({ type: 'theme', value: (await figma.clientStorage.getAsync('theme')) || 'auto' });
    } else if (msg.type === 'setTheme') {
      await figma.clientStorage.setAsync('theme', msg.value);
    } else if (msg.type === 'scan') {
      figma.ui.postMessage({ type: 'palettes', palettes: await scan() });
    } else if (msg.type === 'apply') {
      await apply(msg.items);
      figma.ui.postMessage({ type: 'palettes', palettes: await scan(), applied: true });
    } else if (msg.type === 'close') {
      figma.closePlugin();
    }
  } catch (e) {
    figma.notify('12shades: ' + (e && e.message ? e.message : e), { error: true });
    figma.ui.postMessage({ type: 'error', message: String(e && e.message ? e.message : e) });
  }
};
