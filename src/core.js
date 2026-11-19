/* Palettenlogik nachgebaut nach tints.dev von Simeon Griggs (CC BY-NC 4.0, https://github.com/SimeonGriggs/tints.dev), erweitert um Shade 25. */
/* ---------- 12shades-Core: Palette aus einer Basisfarbe (inkl. Shade 25) ---------- */
const STOPS = [0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000];
// Position in der Originalreihe (0,50,100,...,1000). 25 liegt "dazwischen" (0.5),
// damit alle bestehenden Stops exakt wie bei tints.dev berechnet werden.
const STOP_POS = { 0: 0, 25: 0.5, 50: 1, 100: 2, 200: 3, 300: 4, 400: 5, 500: 6, 600: 7, 700: 8, 800: 9, 900: 10, 950: 11, 1000: 12 };

const clamp = (x, a, b) => Math.min(Math.max(x, a), b);

/* --- HEX / RGB / HSL --- */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
}
function rgbToHex(rgb) {
  return '#' + rgb.map(v => Math.round(clamp(v, 0, 1) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}
function rgbToHsl([r, g, b]) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return [h, s, l];
}
function hslToRgb([h, s, l]) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [r + m, g + m, b + m];
}

/* --- HSLuv (perceptual) ---
   Umrechnung nach der HSLuv-Referenzimplementierung von Alexei Boronine (MIT-Lizenz, https://github.com/hsluv/hsluv).
   Copyright (c) Alexei Boronine. Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction, subject to the MIT License terms. */
const M = [[3.240969941904521, -1.537383177570093, -0.498610760293], [-0.96924363628087, 1.87596750150772, 0.041555057407175], [0.055630079696993, -0.20397695888897, 1.056971514242878]];
const MI = [[0.41239079926595, 0.35758433938387, 0.18048078840183], [0.21263900587151, 0.71516867876775, 0.072192315360733], [0.019330818715591, 0.11919477979462, 0.95053215224966]];
const REF_U = 0.19783000664283, REF_V = 0.46831999493879, KAPPA = 903.2962962, EPS = 0.0088564516;
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const toLin = c => (c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92);
const fromLin = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

function getBounds(L) {
  const res = [], sub1 = Math.pow(L + 16, 3) / 1560896, sub2 = sub1 > EPS ? sub1 : L / KAPPA;
  for (let c = 0; c < 3; c++) {
    const [m1, m2, m3] = M[c];
    for (let t = 0; t < 2; t++) {
      const top1 = (284517 * m1 - 94839 * m3) * sub2;
      const top2 = (838422 * m3 + 769860 * m2 + 731718 * m1) * L * sub2 - 769860 * t * L;
      const bottom = (632260 * m3 - 126452 * m2) * sub2 + 126452 * t;
      res.push([top1 / bottom, top2 / bottom]);
    }
  }
  return res;
}
function maxChroma(L, H) {
  const hr = (H / 360) * Math.PI * 2;
  let min = Infinity;
  for (const [slope, icpt] of getBounds(L)) {
    const len = icpt / (Math.sin(hr) - slope * Math.cos(hr));
    if (len >= 0) min = Math.min(min, len);
  }
  return min;
}
function hexToHsluv(hex) {
  const xyz = MI.map(r => dot(r, hexToRgb(hex).map(toLin)));
  const [X, Y, Z] = xyz, div = X + 15 * Y + 3 * Z;
  const L = Y <= EPS ? Y * KAPPA : 116 * Math.cbrt(Y) - 16;
  if (L === 0) return [0, 0, 0];
  const U = 13 * L * (4 * X / div - REF_U), V = 13 * L * (9 * Y / div - REF_V);
  const C = Math.hypot(U, V);
  let H = C < 1e-8 ? 0 : (Math.atan2(V, U) * 180) / Math.PI; if (H < 0) H += 360;
  if (L > 99.9999999) return [H, 0, 100];
  if (L < 1e-8) return [H, 0, 0];
  return [H, (C / maxChroma(L, H)) * 100, L];
}
function hsluvToHex([H, S, L]) {
  H = ((H % 360) + 360) % 360;
  let C;
  if (L > 99.9999999) { L = 100; C = 0; } else if (L < 1e-8) { L = 0; C = 0; } else C = (maxChroma(L, H) / 100) * S;
  const hr = (H / 180) * Math.PI, U = Math.cos(hr) * C, V = Math.sin(hr) * C;
  if (L === 0) return '#000000';
  const vu = U / (13 * L) + REF_U, vv = V / (13 * L) + REF_V;
  const Y = L <= 8 ? L / KAPPA : Math.pow((L + 16) / 116, 3);
  const X = 0 - (9 * Y * vu) / ((vu - 4) * vv - vu * vv);
  const Z = (9 * Y - 15 * vv * Y - vv * X) / (3 * vv);
  return rgbToHex(M.map(r => fromLin(dot(r, [X, Y, Z]))));
}

/* --- Palette --- */
function createSwatches({ value, valueStop = 500, h = 0, s = 0, lMin = 0, lMax = 100, colorMode = 'perceived' }) {
  const hex = '#' + value.replace('#', '').toUpperCase();
  if (!/^#[0-9A-F]{6}$/.test(hex)) throw new Error('Ungültiger Hex-Wert');
  if (!(valueStop in STOP_POS)) throw new Error('Ungültige Shade');
  const vPos = STOP_POS[valueStop];
  const linear = colorMode === 'linear';
  const [bh, bs, bl] = rgbToHsl(hexToRgb(hex));
  const [uh, us, ul] = hexToHsluv(hex);
  const baseL = linear ? bl * 100 : ul;

  return STOPS.map(stop => {
    if (stop === valueStop) return { stop, hex };
    const diff = Math.abs(STOP_POS[stop] - vPos);
    const hT = h ? diff * h : 0;
    const sT = s ? Math.min(Math.round((diff + 1) * s * (1 + diff / 10)), 100) : 0;
    // Lightness: Anker 0 -> lMax, valueStop -> Basis, 1000 -> lMin, dazwischen linear
    const [a, b] = stop < valueStop ? [{ x: 0, y: lMax }, { x: valueStop, y: baseL }] : [{ x: valueStop, y: baseL }, { x: 1000, y: lMin }];
    const lT = clamp(Math.round(a.y + (b.y - a.y) * ((stop - a.x) / (b.x - a.x))), 0, 100);
    if (linear) return { stop, hex: rgbToHex(hslToRgb([(isNaN(bh) ? 0 : bh) + hT, clamp(bs * 100 + sT, 0, 100) / 100, lT / 100])) };
    return { stop, hex: hsluvToHex([(isNaN(uh) ? 0 : uh) + hT, clamp(us + sT, 0, 100), lT]) };
  });
}
if (typeof module !== 'undefined') module.exports = { createSwatches, STOPS };
