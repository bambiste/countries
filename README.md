# @bambiste/countries

ISO 3166 country list — codes, names, region, and flag emoji — as **static data**. No API, no
API key, no network call at runtime. Generated from
[`world-countries`](https://github.com/mledoze/countries) (ODbL) and shipped as a committed JSON.

## Install

```bash
npm install @bambiste/countries
```

Requires `@bambiste` pointed at GitHub Packages in your `.npmrc`:

```
@bambiste:registry=https://npm.pkg.github.com/
```

## Use

```ts
import { countries, getCountry, flagEmoji, type Country } from '@bambiste/countries';

countries.length;                 // 250 — sorted by common name
getCountry('FR');                 // { cca2:'FR', cca3:'FRA', name:{ common:'France', … }, region:'Europe', flag:'🇫🇷' }
getCountry('FRA');                // same — alpha-2 or alpha-3
flagEmoji('FR');                  // '🇫🇷'
```

### Shape

```ts
interface Country {
  cca2: string;                   // 'FR'
  cca3: string;                   // 'FRA'
  name: { common: string; official: string };
  region: string;                 // 'Europe'
  subregion: string;              // 'Western Europe'
  flag: string;                   // '🇫🇷'
}
```

## Regenerate

The data is committed. To refresh it (e.g. after bumping `world-countries`):

```bash
npm run generate   # rewrites src/countries.json
npm run build
```
