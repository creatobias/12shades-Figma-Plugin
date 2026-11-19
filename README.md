# 12shades – Figma-Plugin

Erzeuge Farbpaletten mit 12 Shades (25 … 950, optional 0 und 1000) aus einer einzigen Basisfarbe und schreibe sie direkt als **Variablen** und/oder **Farbstile** in Figma. Bestehende Paletten (Namen wie `brand/500`) werden erkannt und lassen sich an Ort und Stelle aktualisieren, sodass Variablen-Bindings und Stil-Zuweisungen erhalten bleiben.

Web-Version: <https://12shades.creatobias.de>

## Funktionen

- Mehrere Paletten auf einmal anlegen, jeweils mit eigenem Namen und eigener Basisfarbe
- Bestehende Paletten aktualisieren, umbenennen oder gesammelt bearbeiten (Farbton, Sättigung, min./max. Helligkeit, Modus)
- Modus „Linear“ (HSL) und „Wahrgenommen“ (HSLuv)
- Live-Vorschau, Klick auf eine Kachel kopiert den Hex-Wert
- Hell, Dunkel oder Auto (System)

## Als lokales Entwicklungs-Plugin installieren

1. Repository herunterladen oder klonen.
2. In Figma Desktop: **Plugins → Development → Import plugin from manifest…** und die `manifest.json` wählen.
3. Starten über **Plugins → Development → 12shades**.

## Build

`ui.html` wird aus `src/` erzeugt:

```sh
node build.js
```

## Credits und Lizenzen

by [creatobias](https://creatobias.de) · based on [tints.dev](https://www.tints.dev) by Simeon Griggs ([CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)).
Die Palettenlogik bildet den Ansatz von tints.dev nach und ergänzt Shade 25 sowie die optionalen Shades 0 und 1000. Wegen der NonCommercial-Lizenz von tints.dev ist dieses Plugin kostenlos und darf nicht kommerziell genutzt werden.

Die HSLuv-Umrechnung folgt der HSLuv-Referenzimplementierung von Alexei Boronine (<https://github.com/hsluv/hsluv>), MIT-Lizenz:

```
MIT License

Copyright (c) Alexei Boronine

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
