/**
 * `<bc-country-select>`: a country picker that searches as you type. A form field: with `name`
 * it submits the alpha-2 code. Emits `change` with `{ value, country }`.
 *
 *   <bc-country-select name="country" value="SN" preferred="SN,CI,FR" show-calling-code>
 */
import { getCountry, type Country } from '../data.js';
import { codesOf, labelsFor, pageLocale, type CountryLabels } from './labels.js';
import { CountryPicker, countryParts, el } from './picker.js';
import { reflect } from './reflect.js';
import { ElementBase } from './base.js';
import { installStyles } from './styles.js';

export interface CountryChange {
  value: string;
  country: Country | undefined;
}

export class BcCountrySelect extends ElementBase {
  static formAssociated = true;
  static observedAttributes = ['value', 'locale', 'only', 'preferred', 'placeholder', 'disabled', 'required', 'show-calling-code'];

  /** Words to replace, in the page's language. */
  labels: Partial<CountryLabels> = {};
  private readonly internals = this.attachInternals();
  private trigger: HTMLButtonElement | null = null;
  private picker: CountryPicker | null = null;

  get value(): string {
    return getCountry(this.getAttribute('value') ?? '')?.cca2 ?? '';
  }
  set value(code: string) {
    if (code) this.setAttribute('value', code);
    else this.removeAttribute('value');
  }

  /** The language of names and words; the page's unless set. */
  get locale(): string {
    return this.getAttribute('locale') || pageLocale(this);
  }
  set locale(locale: string) {
    if (locale) this.setAttribute('locale', locale);
    else this.removeAttribute('locale');
  }

  declare name: string;
  declare only: string;
  declare preferred: string;
  declare placeholder: string;
  declare required: boolean;
  declare disabled: boolean;
  declare showCallingCode: boolean;

  connectedCallback(): void {
    installStyles();
    if (!this.trigger) this.build();
    this.render();
  }

  disconnectedCallback(): void {
    this.picker?.close(false);
  }

  attributeChangedCallback(): void {
    if (this.trigger) this.render();
  }

  formResetCallback(): void {
    this.value = '';
  }

  formDisabledCallback(disabled: boolean): void {
    this.toggleAttribute('disabled', disabled);
  }

  private text(): CountryLabels {
    return labelsFor(this.locale, this.labels);
  }

  private build(): void {
    const trigger = el('button', { type: 'button', role: 'combobox', 'aria-haspopup': 'listbox', 'aria-expanded': 'false' });
    this.trigger = trigger;
    this.picker = new CountryPicker({
      host: this,
      anchor: () => trigger,
      locale: () => this.locale,
      only: () => codesOf(this.getAttribute('only')),
      preferred: () => codesOf(this.getAttribute('preferred')),
      selected: () => this.value,
      labels: () => this.text(),
      showCode: this.hasAttribute('show-calling-code'),
      pick: (country) => {
        this.value = country.cca2;
        const detail: CountryChange = { value: country.cca2, country };
        this.dispatchEvent(new CustomEvent('input', { bubbles: true, detail }));
        this.dispatchEvent(new CustomEvent('change', { bubbles: true, detail }));
      },
      closed: (refocus) => {
        trigger.setAttribute('aria-expanded', 'false');
        trigger.removeAttribute('aria-controls');
        if (refocus) trigger.focus();
      },
    });
    const open = (query = '') => {
      if (this.hasAttribute('disabled') || !this.picker) return;
      trigger.setAttribute('aria-expanded', 'true');
      trigger.setAttribute('aria-controls', this.picker.id);
      this.picker.open(query);
    };
    trigger.addEventListener('click', () => (this.picker?.isOpen ? this.picker.close(true) : open()));
    trigger.addEventListener('keydown', (event) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        open();
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // Typing on the closed trigger starts a search with that letter.
        event.preventDefault();
        open(event.key);
      }
    });
    this.append(trigger);
  }

  private render(): void {
    const trigger = this.trigger;
    if (!trigger) return;
    const country = getCountry(this.value);
    const value = el('span', { 'data-select-value': '' });
    if (country) value.append(...countryParts(country, this.locale, this.hasAttribute('show-calling-code')));
    else {
      value.setAttribute('data-placeholder', '');
      value.textContent = this.getAttribute('placeholder') || this.text().choose;
    }
    trigger.replaceChildren(value);
    trigger.disabled = this.hasAttribute('disabled');
    const label = this.getAttribute('aria-label');
    if (label) trigger.setAttribute('aria-label', label);
    this.internals.setFormValue(this.value);
    if (this.hasAttribute('required') && !this.value) this.internals.setValidity({ valueMissing: true }, this.text().choose, trigger);
    else this.internals.setValidity({});
  }
}

reflect(BcCountrySelect, { name: 'name', only: 'only', preferred: 'preferred', placeholder: 'placeholder' }, { required: 'required', disabled: 'disabled', showCallingCode: 'show-calling-code' });
