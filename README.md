# @bambiste/countries

Countries as static data, with what a form needs around them: calling codes, names in any
language, search, phone numbers, and two form fields, a country select and a phone input.

No API, no key, no network at runtime. The data is generated from
[`world-countries`](https://github.com/mledoze/countries) (ODbL) and shipped as JSON.

## Install

```bash
npm install @bambiste/countries
```

## Data

```ts
import { countries, getCountry, flagEmoji, type Country } from '@bambiste/countries';

countries.length;     // 250, sorted by English common name
getCountry('SN');     // alpha-2 or alpha-3: getCountry('SEN') is the same country
flagEmoji('SN');      // '🇸🇳'
```

```ts
interface Country {
  cca2: string;                               // 'SN'
  cca3: string;                               // 'SEN'
  name: { common: string; official: string }; // English
  region: string;                             // 'Africa'
  subregion: string;                          // 'Western Africa'
  flag: string;                               // '🇸🇳'
  callingCode: string;                        // '+221', empty for Antarctica and Heard Island
  areaCodes: string[];                        // see below
}
```

Some calling codes are shared. The US, Canada and the Caribbean all use `+1`, Russia and
Kazakhstan use `+7`, Jersey and the UK use `+44`. Where the data knows the area codes that tell
them apart, `areaCodes` lists them (`getCountry('CA').areaCodes` includes `'514'`); for a code a
country has to itself, it is empty.

## Names and search

Names come from the browser or Node's `Intl.DisplayNames`, so every language works without
shipping translations.

```ts
import { countryName, countriesByName, searchCountries } from '@bambiste/countries';

countryName('SN', 'fr');                 // 'Sénégal'
countriesByName('fr');                   // every country, sorted by its French name
countriesByName('fr', ['SN', 'CI']);     // only these, sorted the same way

searchCountries('cote', { locale: 'fr' });   // Côte d’Ivoire first: accents are ignored
searchCountries('+221');                     // Senegal, by calling code
searchCountries('sen');                      // Senegal, by alpha-3 code before names
```

Results come best first: an exact code or calling code, then names starting with the query
(any word of them), then names containing it. English names match in every locale.

## Phone numbers

```ts
import { parsePhone, phoneCountry, toE164, isPlausiblePhone, formatPhone } from '@bambiste/countries';

parsePhone('77 123 45 67', 'SN');
// { country: Senegal, callingCode: '+221', national: '771234567', e164: '+221771234567' }

parsePhone('0033 6 12 34 56 78');        // + or 00: the country comes from the number
toE164('FR', '06 12 34 56 78');          // '+33612345678', the trunk 0 is dropped
phoneCountry('+1 514 555 0100');         // Canada, from the area code
isPlausiblePhone('+221771234567');       // true
formatPhone('+221771234567');            // '+221 771 23 45 67'
```

These helpers read and write numbers; they do not know each country's numbering plan.
`isPlausiblePhone` checks the length E.164 allows (8 to 15 digits in all), not that the number
exists, and `formatPhone` groups digits evenly rather than by national convention. Countries
that keep the leading 0 after the calling code (Italy, Côte d’Ivoire and a few others) keep it.

## Form fields

```ts
import '@bambiste/countries/elements';
```

Importing the entry registers two custom elements. They work in any page and any framework, take
part in forms like native fields, and follow the page's language (`lang`) unless given `locale`.

```html
<form>
  <bc-country-select name="country" value="SN" preferred="SN,CI,FR" show-calling-code></bc-country-select>
  <bc-phone-input name="phone" country="SN" preferred="SN,CI,FR" required></bc-phone-input>
</form>
```

`<bc-country-select>` submits the alpha-2 code. `<bc-phone-input>` submits the number in E.164;
typing or pasting a number that starts with `+` or `00` switches to its country, and changing
the country keeps the digits already typed.

| Attribute | Both | Meaning |
|---|---|---|
| `name`, `required`, `disabled` | yes | As on any form field |
| `locale` | yes | Language of names and words; defaults to the page's |
| `only` | yes | `"SN,CI,ML"`: offer these countries only |
| `preferred` | yes | `"SN,CI,FR"`: listed first, above a separator |
| `value` | yes | Alpha-2 for the select, E.164 for the phone input |
| `placeholder` | yes | Text with no country, or in the empty number |
| `show-calling-code` | select | Show `+221` next to each country |
| `country` | phone | Starting country; else the region of the locale (`fr-SN`), else the first preferred |

Both send `input` and `change` events whose `detail` holds the value and the country; the phone
input adds `national` and `valid`. Set `labels` to replace any of the words (French and English
are built in):

```ts
document.querySelector('bc-phone-input')!.labels = { search: 'Find a country' };
```

The popup opens on click, on the arrow keys, or by typing a letter on the closed select. It
searches as you type, moves with the arrows, Page Up and Down, and Ctrl+Home and End, picks with
Enter and closes with Escape, Tab or a click outside. It sits in the browser's top layer, so a
parent with `overflow: hidden` does not cut it.

### Styling

The fields are drawn with fluixi-ui's markup and design
tokens. In an app that already uses fluixi-ui, they look like its own select, and a skin restyles
them along with everything else. Without fluixi-ui they use its default values, and any token can
be set to change them:

```css
:root {
  --flx-ui-color-primary: #0e7c5a;
  --flx-ui-color-primary-subtle: #e3f5ee;
  --flx-ui-color-focus-ring: #0e7c5a;
  --flx-ui-radius-md: 12px;
  --flx-ui-size-md: 44px;
}
```

The tokens they read are the colours `bg`, `bg-subtle`, `fg`, `fg-muted`, `border`,
`border-strong`, `primary`, `primary-subtle`, `primary-active`, `focus-ring` and `danger`, and
`radius-sm`, `radius-md`, `radius-lg`, `size-md`, `space-1` to `space-3`, `font-size-sm`,
`shadow-lg` and `z-popover`, each prefixed with `--flx-ui-`.

Every rule has zero specificity and sits in the `flx.components` cascade layer, so any rule of
your own wins. The parts carry data attributes to aim at: `[data-bc-popup]` for the popup,
`[data-bc-flag]`, `[data-bc-name]` and `[data-bc-code]` inside each row, `[data-bc-country]` and
`[data-bc-number]` in the phone input. The stylesheet is also exported as `styles` for pages that
need it elsewhere, such as inside a shadow root.

## Regenerate the data

The data is committed. To refresh it after bumping `world-countries`:

```bash
npm run generate   # rewrites src/countries.json
npm test           # builds, then checks the helpers
```
