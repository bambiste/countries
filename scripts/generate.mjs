// Generate src/countries.json from the `world-countries` dataset (mledoze/countries, ODbL).
// Run once (or whenever you bump world-countries): `npm run generate`. The output is committed
// and shipped — consumers get the data with zero runtime deps, zero network, zero secret.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const all = require('world-countries');

const countries = all
  .map((c) => ({
    cca2: c.cca2,
    cca3: c.cca3,
    name: { common: c.name.common, official: c.name.official },
    region: c.region,
    subregion: c.subregion,
    flag: c.flag, // unicode emoji (also derivable from cca2)
  }))
  .filter((c) => c.cca2 && c.name.common)
  .sort((a, b) => a.name.common.localeCompare(b.name.common));

writeFileSync(resolve(here, '../src/countries.json'), JSON.stringify(countries, null, 2) + '\n');

const wcVersion = JSON.parse(
  readFileSync(require.resolve('world-countries/package.json'), 'utf8'),
).version;
console.log(`Wrote ${countries.length} countries → src/countries.json (world-countries@${wcVersion})`);
