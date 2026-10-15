// Generate src/countries.json from the `world-countries` dataset (mledoze/countries, ODbL).
// Run once (or whenever you bump world-countries): `npm run generate`. The output is committed
// and shipped: consumers get the data with zero runtime deps, zero network, zero secret.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const all = require('world-countries');

// Country calling codes are 1 to 3 digits. world-countries writes a country's prefixes as a
// root plus suffixes; a prefix longer than its code carries an area code (Jersey: +44 1534,
// the US: +1 201...). The known codes are every short prefix, plus the shared roots +1 and +7.
const prefixesOf = (c) => (c.idd?.root ? (c.idd.suffixes?.length ? c.idd.suffixes : ['']).map((s) => c.idd.root + s) : []);
const codes = new Set(['+1', '+7']);
// Under +1 and +7 every suffix is an area code, however short (Kazakhstan: +7 6, +7 7).
for (const c of all) {
  if (codes.has(c.idd?.root)) continue;
  for (const p of prefixesOf(c)) if (p.length <= 4) codes.add(p);
}

/** The calling code a prefix starts with, and the area code after it. */
function split(prefix) {
  for (let length = 4; length >= 2; length--) {
    const code = prefix.slice(0, length);
    if (codes.has(code)) return { code, area: prefix.slice(length) };
  }
  return { code: prefix, area: '' };
}

function calling(c) {
  const parts = prefixesOf(c).map(split);
  if (!parts.length) return { callingCode: '', areaCodes: [] };
  const callingCode = parts[0].code;
  const areaCodes = parts.filter((p) => p.code === callingCode && p.area).map((p) => p.area);
  return { callingCode, areaCodes };
}

const countries = all
  .map((c) => ({
    cca2: c.cca2,
    cca3: c.cca3,
    name: { common: c.name.common, official: c.name.official },
    region: c.region,
    subregion: c.subregion,
    flag: c.flag, // unicode emoji (also derivable from cca2)
    ...calling(c),
  }))
  .filter((c) => c.cca2 && c.name.common)
  .sort((a, b) => a.name.common.localeCompare(b.name.common));

writeFileSync(resolve(here, '../src/countries.json'), JSON.stringify(countries, null, 2) + '\n');

const wcVersion = JSON.parse(
  readFileSync(require.resolve('world-countries/package.json'), 'utf8'),
).version;
console.log(`Wrote ${countries.length} countries → src/countries.json (world-countries@${wcVersion})`);
