import { countries, getCountry, type Country } from './data.js';

// Where a calling code is shared and no area code decides, the number belongs here.
const MAIN: Record<string, string> = {
  '+1': 'US',
  '+7': 'RU',
  '+39': 'IT',
  '+44': 'GB',
  '+47': 'NO',
  '+61': 'AU',
  '+64': 'NZ',
  '+212': 'MA',
  '+262': 'RE',
  '+268': 'SZ',
  '+358': 'FI',
  '+500': 'FK',
  '+590': 'GP',
  '+599': 'CW',
};

// Countries whose national numbers keep their leading 0 after the calling code.
const KEEPS_ZERO = new Set(['IT', 'SM', 'VA', 'CI', 'CG', 'GA', 'TG']);

const byCode = new Map<string, Country[]>();
for (const c of countries) if (c.callingCode) byCode.set(c.callingCode, [...(byCode.get(c.callingCode) ?? []), c]);

const digitsOf = (text: string) => text.replace(/\D/g, '');

export interface ParsedPhone {
  country: Country;
  callingCode: string;
  /** The number after the calling code, digits only. */
  national: string;
  /** `+` then digits, e.g. `"+221771234567"`. */
  e164: string;
}

/** The country an international number belongs to, from its calling code and area code. */
export function phoneCountry(number: string): Country | undefined {
  const digits = digitsOf(number.trim().replace(/^00/, '+'));
  for (let length = 3; length >= 1; length--) {
    const code = `+${digits.slice(0, length)}`;
    const candidates = byCode.get(code);
    if (!candidates) continue;
    const rest = digits.slice(length);
    return (
      candidates.find((c) => c.areaCodes.some((area) => rest.startsWith(area))) ??
      candidates.find((c) => c.cca2 === MAIN[code]) ??
      candidates.find((c) => !c.areaCodes.length) ??
      candidates[0]
    );
  }
  return undefined;
}

/**
 * Reads what a person typed. With a `+` or `00` it is international and the country comes from
 * the number; otherwise it is national to `country`, and a leading trunk 0 is dropped where the
 * country does not keep it.
 */
export function parsePhone(input: string, country?: string): ParsedPhone | undefined {
  const text = input.trim();
  if (!text) return undefined;
  if (/^(\+|00)/.test(text)) {
    const found = phoneCountry(text);
    if (!found) return undefined;
    const digits = digitsOf(text.replace(/^00/, '+'));
    const national = digits.slice(found.callingCode.length - 1);
    return { country: found, callingCode: found.callingCode, national, e164: `+${digits}` };
  }
  const home = country ? getCountry(country) : undefined;
  if (!home?.callingCode) return undefined;
  let national = digitsOf(text);
  if (home.callingCode === '+1' && national.length === 11 && national.startsWith('1')) national = national.slice(1);
  else if (!KEEPS_ZERO.has(home.cca2)) national = national.replace(/^0/, '');
  return { country: home, callingCode: home.callingCode, national, e164: `${home.callingCode}${national}` };
}

/** `+` and the digits of `national` after the country's calling code; empty without either. */
export function toE164(country: string, national: string): string {
  return parsePhone(national, country)?.e164 ?? '';
}

/** E.164 allows 15 digits at most; fewer than 8 in all is not a whole number anywhere. */
export function isPlausiblePhone(number: string): boolean {
  const parsed = parsePhone(number);
  if (!parsed) return false;
  const total = parsed.e164.length - 1;
  return total >= 8 && total <= 15 && parsed.national.length >= 4;
}

/** `"+221 77 123 45 67"`: the calling code, then the national digits in groups of two or three. */
export function formatPhone(number: string): string {
  const parsed = parsePhone(number);
  if (!parsed) return number;
  const groups = parsed.national.match(parsed.national.length % 2 ? /^\d{3}|\d{2}/g : /\d{2}/g) ?? [];
  return [parsed.callingCode, ...groups].join(' ');
}
