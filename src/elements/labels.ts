/** The words the elements show, French and English built in; any language can be passed. */
export interface CountryLabels {
  /** Trigger text with no country chosen. */
  choose: string;
  /** The search box's placeholder and name. */
  search: string;
  /** No country matches the search. */
  empty: string;
  /** Names the phone field's country button, before the country itself. */
  country: string;
  /** The number does not look like a whole phone number. */
  invalid: string;
}

const builtIn: Record<string, CountryLabels> = {
  en: {
    choose: 'Choose a country',
    search: 'Search a country',
    empty: 'No country found',
    country: 'Country',
    invalid: 'Enter a whole phone number.',
  },
  fr: {
    choose: 'Choisir un pays',
    search: 'Rechercher un pays',
    empty: 'Aucun pays trouvé',
    country: 'Pays',
    invalid: 'Saisissez un numéro de téléphone complet.',
  },
};

export function labelsFor(locale: string, overrides: Partial<CountryLabels> = {}): CountryLabels {
  const base = builtIn[locale.slice(0, 2).toLowerCase()] ?? builtIn.en!;
  return { ...base, ...overrides };
}

/** The page's language, then the browser's. */
export function pageLocale(element: Element): string {
  const lang = element.closest('[lang]')?.getAttribute('lang');
  return lang || (typeof navigator !== 'undefined' ? navigator.language : '') || 'en';
}

/** The region of a locale such as `fr-SN`, used as the phone field's first country. */
export function localeRegion(locale: string): string {
  try {
    return new Intl.Locale(locale).maximize().region ?? '';
  } catch {
    return '';
  }
}

/** `"SN, CI"` → `["SN", "CI"]`. */
export const codesOf = (value: string | null): string[] =>
  (value ?? '')
    .split(/[\s,]+/)
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);
