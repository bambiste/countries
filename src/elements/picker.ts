/**
 * The popup both elements open: a search box over the countries, keyboard and pointer. It is
 * placed under its anchor (above when there is no room) in the top layer, so no ancestor with
 * `overflow: hidden` cuts it.
 */
import { countryName, searchCountries } from '../names.js';
import { getCountry, type Country } from '../data.js';
import type { CountryLabels } from './labels.js';

export interface PickerOptions {
  /** Where the popup lives in the page, and what a click outside of closes it. */
  host: HTMLElement;
  /** What it is placed against. */
  anchor: () => HTMLElement;
  locale: () => string;
  only: () => string[];
  preferred: () => string[];
  selected: () => string;
  labels: () => CountryLabels;
  /** Shown in each row. */
  showCode: boolean;
  pick: (country: Country) => void;
  /** `refocus`: the person closed it from the keyboard, so focus goes back to the trigger. */
  closed: (refocus: boolean) => void;
}

let count = 0;

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, attributes: Record<string, string> = {}, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Flag, name and, when asked, calling code: the content of a row and of a trigger. */
export function countryParts(country: Country, locale: string, showCode: boolean): HTMLElement[] {
  const parts: HTMLElement[] = [
    el('span', { 'data-bc-flag': '', 'aria-hidden': 'true' }, country.flag),
    el('span', { 'data-bc-name': '' }, countryName(country, locale)),
  ];
  if (showCode && country.callingCode) parts.push(el('span', { 'data-bc-code': '' }, country.callingCode));
  return parts;
}

export class CountryPicker {
  readonly id = `bc-popup-${++count}`;
  private popup: HTMLDivElement | null = null;
  private search: HTMLInputElement | null = null;
  private rows: { country: Country; node: HTMLElement }[] = [];
  private active = -1;
  private readonly onOutside = (event: PointerEvent) => {
    const path = event.composedPath();
    if (!path.includes(this.options.host) && (!this.popup || !path.includes(this.popup))) this.close(false);
  };
  private readonly onMove = () => this.place();

  constructor(private readonly options: PickerOptions) {}

  get isOpen(): boolean {
    return this.popup !== null;
  }

  open(query = ''): void {
    if (this.popup) return;
    const labels = this.options.labels();
    const popup = el('div', { id: this.id, role: 'listbox', 'data-state': 'open', 'data-bc-popup': '', 'aria-label': labels.search });
    const search = el('input', {
      type: 'text',
      'data-select-search': '',
      role: 'combobox',
      'aria-expanded': 'true',
      'aria-controls': this.id,
      'aria-autocomplete': 'list',
      'aria-label': labels.search,
      placeholder: labels.search,
      autocomplete: 'off',
      spellcheck: 'false',
    });
    search.value = query;
    search.addEventListener('input', () => this.fill());
    search.addEventListener('keydown', (event) => this.key(event));
    popup.append(search);
    this.popup = popup;
    this.search = search;
    this.options.host.append(popup);
    if (typeof popup.showPopover === 'function') {
      popup.setAttribute('popover', 'manual');
      popup.showPopover();
    }
    this.fill();
    this.place();
    search.focus({ preventScroll: true });
    document.addEventListener('pointerdown', this.onOutside, true);
    window.addEventListener('resize', this.onMove);
    window.addEventListener('scroll', this.onMove, true);
  }

  close(refocus: boolean): void {
    if (!this.popup) return;
    document.removeEventListener('pointerdown', this.onOutside, true);
    window.removeEventListener('resize', this.onMove);
    window.removeEventListener('scroll', this.onMove, true);
    this.popup.remove();
    this.popup = null;
    this.search = null;
    this.rows = [];
    this.options.closed(refocus);
  }

  /** The rows for the current search: suggested countries first when it is empty. */
  private fill(): void {
    const popup = this.popup;
    if (!popup || !this.search) return;
    for (const node of [...popup.children]) if (node !== this.search) node.remove();
    const { locale, only, preferred, selected, labels, showCode } = { ...this.options, locale: this.options.locale() };
    const query = this.search.value;
    let list = searchCountries(query, { locale, only: only() });
    const pinned = query.trim() ? [] : preferred().map((code) => getCountry(code)).filter((c): c is Country => !!c && list.includes(c));
    if (pinned.length) list = list.filter((c) => !pinned.includes(c));
    this.rows = [];
    const add = (country: Country) => {
      const node = el('div', { role: 'option', id: `${this.id}-${country.cca2}`, 'aria-selected': String(country.cca2 === selected()) });
      if (country.cca2 === selected()) node.setAttribute('data-selected', '');
      node.append(...countryParts(country, locale, showCode));
      node.addEventListener('pointerdown', (event) => event.preventDefault());
      node.addEventListener('click', () => this.choose(country));
      node.addEventListener('pointermove', () => this.activate(this.rows.findIndex((row) => row.node === node), false));
      this.rows.push({ country, node });
      popup.append(node);
    };
    pinned.forEach(add);
    if (pinned.length && list.length) popup.append(el('div', { 'data-bc-separator': '', role: 'separator' }));
    list.forEach(add);
    if (!this.rows.length) popup.append(el('p', { 'data-bc-empty': '', role: 'status' }, labels().empty));
    const current = this.rows.findIndex((row) => row.country.cca2 === selected());
    this.activate(query.trim() ? 0 : Math.max(current, 0), true);
  }

  private activate(index: number, scroll: boolean): void {
    if (!this.rows.length || index < 0) {
      this.search?.removeAttribute('aria-activedescendant');
      return;
    }
    const next = Math.min(Math.max(index, 0), this.rows.length - 1);
    this.rows[this.active]?.node.removeAttribute('data-active');
    this.active = next;
    const row = this.rows[next]!;
    row.node.setAttribute('data-active', '');
    this.search?.setAttribute('aria-activedescendant', row.node.id);
    if (scroll) row.node.scrollIntoView({ block: 'nearest' });
  }

  private choose(country: Country): void {
    this.options.pick(country);
    this.close(true);
  }

  private key(event: KeyboardEvent): void {
    const page = 8;
    const moves: Record<string, () => number> = {
      ArrowDown: () => this.active + 1,
      ArrowUp: () => this.active - 1,
      PageDown: () => this.active + page,
      PageUp: () => this.active - page,
      Home: () => 0,
      End: () => this.rows.length - 1,
    };
    const move = moves[event.key];
    // Home and End move the caret in the search box; with Ctrl they go to the first or last row.
    const caretKey = event.key === 'Home' || event.key === 'End';
    if (move && (!caretKey || event.ctrlKey)) {
      event.preventDefault();
      this.activate(move(), true);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const row = this.rows[this.active];
      if (row) this.choose(row.country);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close(true);
    } else if (event.key === 'Tab') {
      this.close(false);
    }
  }

  /** Under the anchor, as wide as it, inside the window; above it when there is more room there. */
  private place(): void {
    const popup = this.popup;
    if (!popup) return;
    const rect = this.options.anchor().getBoundingClientRect();
    const gap = 4;
    const margin = 8;
    popup.style.width = `${Math.max(rect.width, 240)}px`;
    const height = popup.offsetHeight;
    const below = window.innerHeight - rect.bottom - gap - margin;
    const above = rect.top - gap - margin;
    const top = height > below && above > below ? Math.max(margin, rect.top - gap - height) : rect.bottom + gap;
    const left = Math.min(Math.max(margin, rect.left), window.innerWidth - popup.offsetWidth - margin);
    popup.style.top = `${top}px`;
    popup.style.left = `${Math.max(margin, left)}px`;
  }
}
