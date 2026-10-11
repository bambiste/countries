import { countries, getCountry, type Country } from './data.js';

const displayNames = new Map<string, Intl.DisplayNames | null>();

function namesIn(locale: string): Intl.DisplayNames | null {
  if (!displayNames.has(locale)) {
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([locale], { type: 'region', fallback: 'none' });
    } catch {
      names = null;
    }
    displayNames.set(locale, names);
  }
  return displayNames.get(locale) ?? null;
}

/** A country's name in `locale` (`"Sénégal"` in French), or its English common name. */
export function countryName(country: Country | string, locale = 'en'): string {
  const found = typeof country === 'string' ? getCountry(country) : country;
  if (!found) return typeof country === 'string' ? country : '';
  return namesIn(locale)?.of(found.cca2) ?? found.name.common;
}

/** Every country, or the `only` ones, sorted by their name in `locale`. */
export function countriesByName(locale = 'en', only?: readonly string[]): Country[] {
  const keep = only?.length ? new Set(only.map((code) => getCountry(code)?.cca2)) : null;
  const collator = new Intl.Collator(locale);
  return countries
    .filter((c) => !keep || keep.has(c.cca2))
    .map((c) => ({ c, name: countryName(c, locale) }))
    .sort((a, b) => collator.compare(a.name, b.name))
    .map(({ c }) => c);
}

/** Lower case, accents removed: "Côte d’Ivoire" and "cote d'ivoire" meet. */
const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[’']/g, "'")
    .toLowerCase()
    .trim();

export interface SearchOptions {
  /** The language names are matched and sorted in; English names match too. */
  locale?: string;
  /** Search within these countries only (alpha-2 or alpha-3 codes). */
  only?: readonly string[];
}

/**
 * Countries matching `query`, best first: an exact code (`sn`, `sen`) or calling code (`+221`,
 * `221`), then names starting with the query, then names containing it. An empty query
 * answers every country by name.
 */
export function searchCountries(query: string, options: SearchOptions = {}): Country[] {
  const locale = options.locale ?? 'en';
  const all = countriesByName(locale, options.only);
  const q = fold(query);
  if (!q) return all;
  const digits = q.replace(/^\+/, '');
  const scored: { c: Country; score: number }[] = [];
  all.forEach((c, index) => {
    const names = [countryName(c, locale), c.name.common, c.name.official].map(fold);
    let score = 0;
    if (q === c.cca2.toLowerCase() || q === c.cca3.toLowerCase()) score = 4;
    else if (/^\d+$/.test(digits) && c.callingCode && c.callingCode.slice(1).startsWith(digits)) score = digits.length === c.callingCode.length - 1 ? 4 : 3;
    else if (names.some((n) => n.startsWith(q) || n.split(/[\s-]+/).some((word) => word.startsWith(q)))) score = 2;
    else if (names.some((n) => n.includes(q))) score = 1;
    if (score) scored.push({ c, score: score * 1000 - index });
  });
  return scored.sort((a, b) => b.score - a.score).map(({ c }) => c);
}
