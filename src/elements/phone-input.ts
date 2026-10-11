/**
 * `<bc-phone-input>`: a country button with its flag and calling code, then the number. Its value
 * is the number in E.164 (`+221771234567`); typing `+` or `00` first picks the country from the
 * number. A form field: with `name` it submits that value. Emits `input` and `change` with
 * `{ value, country, national, valid }`.
 *
 *   <bc-phone-input name="phone" country="SN" preferred="SN,CI,FR" required>
 */
import { getCountry, type Country } from '../data.js';
import { countryName } from '../names.js';
import { isPlausiblePhone, parsePhone } from '../phone.js';
import { codesOf, labelsFor, localeRegion, pageLocale, type CountryLabels } from './labels.js';
import { CountryPicker, el } from './picker.js';
import { installStyles } from './styles.js';

export interface PhoneChange {
  /** E.164, or empty while there is no number. */
  value: string;
  country: Country | undefined;
  /** The number after the calling code, digits only. */
  national: string;
  valid: boolean;
}

export class BcPhoneInput extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ['value', 'country', 'locale', 'placeholder', 'disabled', 'required'];

  /** Words to replace, in the page's language. */
  labels: Partial<CountryLabels> = {};
  private readonly internals = this.attachInternals();
  private control: HTMLDivElement | null = null;
  private button: HTMLButtonElement | null = null;
  private input: HTMLInputElement | null = null;
  private flag: HTMLSpanElement | null = null;
  private code: HTMLSpanElement | null = null;
  private picker: CountryPicker | null = null;
  private current = '';
  private touched = false;
  // Set while the element writes its own `value`, so the attribute does not reparse it.
  private writing = false;

  get value(): string {
    return this.state().value;
  }
  set value(number: string) {
    if (number) this.setAttribute('value', number);
    else this.removeAttribute('value');
  }

  /** The chosen country, alpha-2. */
  get country(): string {
    return this.current;
  }
  set country(code: string) {
    this.setAttribute('country', code);
  }

  get locale(): string {
    return this.getAttribute('locale') || pageLocale(this);
  }

  connectedCallback(): void {
    installStyles();
    if (!this.control) this.build();
    this.load();
  }

  disconnectedCallback(): void {
    this.picker?.close(false);
  }

  attributeChangedCallback(name: string): void {
    if (!this.control || this.writing) return;
    if (name === 'value' || name === 'country') this.load();
    else this.render();
  }

  formResetCallback(): void {
    this.touched = false;
    this.value = '';
  }

  formDisabledCallback(disabled: boolean): void {
    this.toggleAttribute('disabled', disabled);
  }

  private text(): CountryLabels {
    return labelsFor(this.locale, this.labels);
  }

  /** The country to start from: the attribute, the page's region, the first suggested. */
  private startCountry(): string {
    const asked = getCountry(this.getAttribute('country') ?? '');
    if (asked) return asked.cca2;
    const region = getCountry(localeRegion(this.locale));
    if (region?.callingCode) return region.cca2;
    return getCountry(codesOf(this.getAttribute('preferred'))[0] ?? '')?.cca2 ?? '';
  }

  private state(): PhoneChange {
    const typed = this.input?.value ?? '';
    const parsed = parsePhone(typed, this.current);
    const country = getCountry(this.current);
    if (!parsed || !parsed.national) return { value: '', country, national: '', valid: false };
    return { value: parsed.e164, country, national: parsed.national, valid: isPlausiblePhone(parsed.e164) };
  }

  private build(): void {
    const control = el('div', { 'data-combobox-control': '', 'data-bc-phone': '' });
    const button = el('button', { type: 'button', 'data-bc-country': '', 'aria-haspopup': 'listbox', 'aria-expanded': 'false' });
    const input = el('input', { type: 'tel', inputmode: 'tel', autocomplete: 'tel-national', 'data-bc-number': '' });
    // Made once and only their text changes: rebuilding them under a pointer, as a blur renders
    // between pointerdown and click, would lose the click.
    this.flag = el('span', { 'data-bc-flag': '', 'aria-hidden': 'true' });
    this.code = el('span', { 'data-bc-code': '' });
    button.append(this.flag, this.code);
    control.append(button, input);
    this.control = control;
    this.button = button;
    this.input = input;
    this.picker = new CountryPicker({
      host: this,
      anchor: () => control,
      locale: () => this.locale,
      only: () => codesOf(this.getAttribute('only')),
      preferred: () => codesOf(this.getAttribute('preferred')),
      selected: () => this.current,
      labels: () => this.text(),
      showCode: true,
      pick: (country) => {
        this.current = country.cca2;
        this.changed(true);
      },
      closed: (refocus) => {
        button.setAttribute('aria-expanded', 'false');
        button.removeAttribute('aria-controls');
        if (refocus) input.focus();
      },
    });
    button.addEventListener('click', () => {
      if (!this.picker) return;
      if (this.picker.isOpen) return this.picker.close(true);
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-controls', this.picker.id);
      this.picker.open();
    });
    control.addEventListener('click', (event) => {
      if (event.target === control) input.focus();
    });
    // The inner field's own events stop here; the element sends its own, with the number.
    input.addEventListener('input', (event) => {
      event.stopPropagation();
      const typed = input.value.trim();
      if (/^(\+|00)/.test(typed)) {
        const parsed = parsePhone(typed);
        if (parsed) {
          this.current = parsed.country.cca2;
          input.value = parsed.national;
        }
      }
      this.changed(false);
    });
    input.addEventListener('change', (event) => {
      event.stopPropagation();
      this.touched = true;
      this.changed(true);
    });
    input.addEventListener('blur', () => {
      this.touched = true;
      this.render();
    });
    this.append(control);
  }

  /** Reads `value` and `country` into the field. */
  private load(): void {
    const parsed = parsePhone(this.getAttribute('value') ?? '');
    if (parsed && this.input) {
      this.current = parsed.country.cca2;
      this.input.value = parsed.national;
    } else {
      this.current = this.startCountry();
      if (this.input && !this.getAttribute('value')) this.input.value = '';
    }
    this.render();
  }

  private changed(commit: boolean): void {
    const detail = this.state();
    this.writing = true;
    if (detail.value) this.setAttribute('value', detail.value);
    else this.removeAttribute('value');
    this.writing = false;
    this.render();
    this.dispatchEvent(new CustomEvent('input', { bubbles: true, detail }));
    if (commit) this.dispatchEvent(new CustomEvent('change', { bubbles: true, detail }));
  }

  private render(): void {
    const { button, input, control } = this;
    if (!button || !input || !control) return;
    const country = getCountry(this.current);
    const text = this.text();
    if (this.flag) this.flag.textContent = country?.flag ?? '🌐';
    if (this.code) this.code.textContent = country?.callingCode ?? '+';
    button.setAttribute('aria-label', country ? `${text.country}: ${countryName(country, this.locale)} ${country.callingCode}` : text.choose);
    const disabled = this.hasAttribute('disabled');
    button.disabled = disabled;
    input.disabled = disabled;
    input.required = this.hasAttribute('required');
    const placeholder = this.getAttribute('placeholder');
    if (placeholder) input.placeholder = placeholder;
    else input.removeAttribute('placeholder');
    const label = this.getAttribute('aria-label');
    if (label) input.setAttribute('aria-label', label);
    const { value, valid } = this.state();
    this.internals.setFormValue(value);
    if (this.hasAttribute('required') && !value) this.internals.setValidity({ valueMissing: true }, text.invalid, input);
    else if (value && !valid) this.internals.setValidity({ typeMismatch: true }, text.invalid, input);
    else this.internals.setValidity({});
    const showError = this.touched && !!input.value && !valid;
    control.toggleAttribute('data-invalid', showError);
    input.setAttribute('aria-invalid', String(showError));
  }
}
