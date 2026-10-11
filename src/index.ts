/** ISO 3166 countries with their calling codes, names in any language, search and phone numbers. */
export { countries, flagEmoji, getCountry, type Country } from './data.js';
export { countryName, countriesByName, searchCountries, type SearchOptions } from './names.js';
export { formatPhone, isPlausiblePhone, parsePhone, phoneCountry, toE164, type ParsedPhone } from './phone.js';
