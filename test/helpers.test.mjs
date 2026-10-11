import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  countries,
  countryName,
  countriesByName,
  formatPhone,
  getCountry,
  isPlausiblePhone,
  parsePhone,
  phoneCountry,
  searchCountries,
  toE164,
} from '../dist/index.js';

test('every country with a calling code has one that starts with +', () => {
  const missing = countries.filter((c) => !c.callingCode).map((c) => c.cca2);
  assert.deepEqual(missing.sort(), ['AQ', 'HM']);
  assert.ok(countries.every((c) => !c.callingCode || /^\+\d{1,3}$/.test(c.callingCode)));
});

test('shared calling codes keep the area codes that tell countries apart', () => {
  assert.equal(getCountry('SN').callingCode, '+221');
  assert.equal(getCountry('KZ').callingCode, '+7');
  assert.deepEqual(getCountry('KZ').areaCodes, ['6', '7']);
  assert.ok(getCountry('CA').areaCodes.includes('514'));
});

test('a number finds its country', () => {
  assert.equal(phoneCountry('+221 77 123 45 67')?.cca2, 'SN');
  assert.equal(phoneCountry('+1 514 555 0100')?.cca2, 'CA');
  assert.equal(phoneCountry('+1 212 555 0100')?.cca2, 'US');
  assert.equal(phoneCountry('0044 20 7946 0000')?.cca2, 'GB');
  assert.equal(phoneCountry('+7 701 000 0000')?.cca2, 'KZ');
  assert.equal(phoneCountry('+7 495 000 0000')?.cca2, 'RU');
  assert.equal(phoneCountry('+999'), undefined);
});

test('national numbers drop the trunk 0, except where it is kept', () => {
  assert.equal(toE164('FR', '06 12 34 56 78'), '+33612345678');
  assert.equal(toE164('SN', '77 123 45 67'), '+221771234567');
  assert.equal(toE164('IT', '06 1234 5678'), '+390612345678');
  assert.equal(toE164('US', '1 (212) 555-0100'), '+12125550100');
  assert.equal(parsePhone('+33 6 12 34 56 78')?.national, '612345678');
  assert.equal(parsePhone('77 123 45 67'), undefined);
});

test('plausible numbers and their formatting', () => {
  assert.equal(isPlausiblePhone('+221771234567'), true);
  assert.equal(isPlausiblePhone('+221 77'), false);
  assert.equal(isPlausiblePhone('+1234567890123456'), false);
  assert.equal(formatPhone('+221771234567'), '+221 771 23 45 67');
  assert.equal(formatPhone('+33612345678'), '+33 612 34 56 78');
});

test('names follow the locale, search ignores accents and matches codes', () => {
  assert.equal(countryName('SN', 'fr'), 'Sénégal');
  assert.equal(countryName('SN', 'en'), 'Senegal');
  assert.equal(searchCountries('senegal', { locale: 'fr' })[0].cca2, 'SN');
  assert.equal(searchCountries('cote', { locale: 'fr' })[0].cca2, 'CI');
  assert.equal(searchCountries('+221')[0].cca2, 'SN');
  assert.equal(searchCountries('sen')[0].cca2, 'SN');
  assert.equal(searchCountries('fra', { locale: 'en' })[0].cca2, 'FR');
  assert.deepEqual(searchCountries('', { only: ['SN', 'CI'], locale: 'fr' }).map((c) => c.cca2), ['CI', 'SN']);
  assert.equal(countriesByName('fr')[0].cca2, 'AF');
});

test('the elements entry imports on a server without throwing or registering', async () => {
  const entry = await import('../dist/elements/index.js');
  assert.equal(typeof entry.BcPhoneInput, 'function');
  assert.equal(typeof entry.BcCountrySelect, 'function');
});
