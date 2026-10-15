// Verifies that every translation key used in the UI exists in all languages.
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src');
const m = { exports: {} };
new Function('module', fs.readFileSync(path.join(dir, 'i18n.js'), 'utf8') + ';module.exports={STRINGS}')(m);
const S = m.exports.STRINGS;
const code = fs.readFileSync(path.join(dir, 'index.html'), 'utf8') + fs.readFileSync(path.join(dir, 'renderer.js'), 'utf8');
const keys = new Set([
  ...[...code.matchAll(/data-i18n(?:-ph)?="(\w+)"/g)].map(x => x[1]),
  ...[...code.matchAll(/\bt\('(\w+)'/g)].map(x => x[1]),
]);
let bad = 0;
for (const l of Object.keys(S)) for (const k of keys) if (!(k in S[l])) { console.log('missing', l, k); bad++; }
for (const l of Object.keys(S)) for (const k of Object.keys(S.en)) if (!(k in S[l])) { console.log('incomplete', l, k); bad++; }
console.log(`${keys.size} keys used, ${bad} problems`);
process.exit(bad ? 1 : 0);
