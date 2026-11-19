# 12shades – Figma plugin

Generate colour palettes with 12 shades (25 … 950, optionally 0 and 1000) from a single base colour and write them straight into Figma as **variables** and/or **paint styles**. Existing palettes (names like `brand/500`) are detected and can be updated in place, so variable bindings and style usage stay intact.

Web version: <https://12shades.creatobias.de>

## Features

- Create several palettes at once, each with its own name and base colour
- Update, rename or batch-edit existing palettes (hue shift, saturation, min/max lightness, mode)
- Linear (HSL) and perceived (HSLuv) mode
- Live preview, click a swatch to copy its hex value
- Light/dark/auto theme

## Install as a development plugin

1. Download or clone this repository.
2. In Figma Desktop: **Plugins → Development → Import plugin from manifest…** and choose `manifest.json`.
3. Run it via **Plugins → Development → 12shades**.

## Build

`ui.html` is generated from `src/`:

```sh
node build.js
```

## Credits and licences

by [creatobias](https://creatobias.de) · based on [tints.dev](https://www.tints.dev) by Simeon Griggs ([CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)).
The palette logic re-implements the approach of tints.dev and adds shade 25 as well as optional shades 0 and 1000. Because of the NonCommercial licence of tints.dev this plugin is free to use and must not be used commercially.

The HSLuv conversion follows the HSLuv reference implementation by Alexei Boronine (<https://github.com/hsluv/hsluv>), MIT licence:

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
