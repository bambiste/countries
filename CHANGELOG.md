# @bambiste/countries

## 0.2.2

### Patch Changes

- 3d41e3b: When there is no room below, the popup opens above its field with its bottom edge pinned to the field and its height limited to the available space, so the list stays close while typing.

## 0.2.1

### Patch Changes

- 032fc1b: Importing `@bambiste/countries/elements` now works on the server and registers the elements only in the browser.

## 0.2.0

### Minor Changes

- 2734b4d: The library now provides callingCode and areaCodes for each country, adds helpers such as `countryName`, `countriesByName`, `searchCountries`, `phoneCountry`, `parsePhone`, `toE164`, `isPlausiblePhone`, `formatPhone`, and the `@bambiste/countries/elements` entry registers `<bc-country-select>` and `<bc-phone-input>` elements that render fluixi-ui markup and tokens.
