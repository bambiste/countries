import data from './countries.json' with { type: 'json' };

/** A country, trimmed to the fields apps actually use. */
export interface Country {
  /** ISO 3166-1 alpha-2 code, e.g. `"FR"`. */
  cca2: string;
  /** ISO 3166-1 alpha-3 code, e.g. `"FRA"`. */
  cca3: string;
  name: {
    /** Everyday name, e.g. `"France"`. */
    common: string;
    /** Formal name, e.g. `"French Republic"`. */
    official: string;
  };
  /** Continental region, e.g. `"Europe"`. */
  region: string;
  /** Sub-region, e.g. `"Western Europe"`. */
  subregion: string;
  /** Unicode flag emoji, e.g. `"🇫🇷"` (also derivable from `cca2` via `flagEmoji`). */
  flag: string;
  /** Country calling code with its `+`, e.g. `"+221"`; empty for the two places without one. */
  callingCode: string;
  /**
   * Area codes that tell this country apart from others sharing its calling code (the US and
   * Canada under `+1`, Kazakhstan under `+7`); empty when the code is its own.
   */
  areaCodes: string[];
}

/** All countries, sorted by common name. Static data — no network, no key. */
export const countries: readonly Country[] = data as Country[];

const byCca2 = new Map(countries.map((c) => [c.cca2, c]));
const byCca3 = new Map(countries.map((c) => [c.cca3, c]));

/** Look up a country by its ISO alpha-2 (e.g. `"FR"`) or alpha-3 (e.g. `"FRA"`) code. */
export function getCountry(code: string): Country | undefined {
  const k = code.toUpperCase();
  return byCca2.get(k) ?? byCca3.get(k);
}

/** Derive the Unicode flag emoji from an ISO alpha-2 code (regional indicator symbols). */
export function flagEmoji(cca2: string): string {
  return cca2
    .toUpperCase()
    .replace(/[A-Z]/g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}
