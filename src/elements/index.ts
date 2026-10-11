/**
 * The elements, registered on import: `<bc-country-select>` and `<bc-phone-input>`. They render in
 * the page with fluixi-ui's markup and tokens, so a fluixi-ui skin styles them like its own select.
 */
import { BcCountrySelect } from './country-select.js';
import { BcPhoneInput } from './phone-input.js';

export { BcCountrySelect, type CountryChange } from './country-select.js';
export { BcPhoneInput, type PhoneChange } from './phone-input.js';
export { labelsFor, type CountryLabels } from './labels.js';
export { installStyles, styles } from './styles.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('bc-country-select')) customElements.define('bc-country-select', BcCountrySelect);
  if (!customElements.get('bc-phone-input')) customElements.define('bc-phone-input', BcPhoneInput);
}

declare global {
  interface HTMLElementTagNameMap {
    'bc-country-select': BcCountrySelect;
    'bc-phone-input': BcPhoneInput;
  }
}
