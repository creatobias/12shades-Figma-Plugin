// Baut ui.html aus src/ui.src.html: fügt src/core.js und src/logo.svg ein.
const fs = require('fs');
const path = require('path');
const read = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const core = read('core.js').replace(/if \(typeof module[\s\S]*$/, '');
fs.writeFileSync(
  path.join(__dirname, 'ui.html'),
  read('ui.src.html').replace('/*__CORE__*/', () => core).replace('/*__LOGO__*/', () => read('logo.svg'))
);
