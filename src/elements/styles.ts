/**
 * The look, taken from fluixi-ui: the same selectors and the same tokens, in the same cascade
 * layer, every rule at zero specificity. An app that loads fluixi-ui gets the very same design and
 * its skin applies as it does to fluixi-ui's own select; an app without it gets fluixi-ui's
 * default values from the fallbacks. Override any token, or any rule from outside a layer.
 */
const v = (token: string, fallback: string) => `var(--flx-ui-${token}, ${fallback})`;

const bg = v('color-bg', '#fcfcfd');
const fg = v('color-fg', '#1a1d21');
const muted = v('color-fg-muted', '#60646c');
const border = v('color-border', '#dcdfe3');
const borderStrong = v('color-border-strong', '#ced2d8');
const focus = v('color-focus-ring', '#568eec');
const ring = v('ctl-ring', `0 0 0 2px ${bg}, 0 0 0 4px ${focus}`);
const thin = v('border-width-thin', '1px');
const chevron = v(
  'chevron-down',
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2.25' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
);
const s1 = v('space-1', '0.25rem');
const s2 = v('space-2', '0.5rem');
const s3 = v('space-3', '0.75rem');
const fast = `${v('duration-fast', '150ms')} ${v('ease-standard', 'cubic-bezier(0.2, 0, 0, 1)')}`;

export const styles = `
@layer flx.components {
  /* Select trigger and combobox control (fluixi-ui select-combobox.css). */
  :where(bc-country-select button[role='combobox'], bc-phone-input [data-combobox-control]) {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: ${s2};
    height: ${v('size-md', '2.5rem')};
    min-width: 200px;
    width: 100%;
    padding: 0 ${s3};
    font: inherit;
    color: ${fg};
    background: ${bg};
    border: ${thin} solid ${borderStrong};
    border-radius: ${v('radius-md', '0.375rem')};
    cursor: pointer;
    transition: border-color ${fast}, box-shadow ${fast};
  }
  :where(bc-country-select button[role='combobox']) { justify-content: space-between; text-align: left; }
  :where(bc-country-select button[role='combobox']:hover) { border-color: ${muted}; }
  :where(bc-country-select button[role='combobox']:focus-visible) { outline: none; border-color: ${focus}; box-shadow: ${ring}; }
  :where(bc-country-select button[role='combobox'], bc-phone-input [data-bc-country])::after {
    content: '';
    width: 1.15em;
    height: 1.15em;
    flex: none;
    background: ${muted};
    -webkit-mask: ${chevron} center / contain no-repeat;
    mask: ${chevron} center / contain no-repeat;
  }
  :where(bc-country-select [data-select-value][data-placeholder]) { color: ${muted}; }
  :where(bc-phone-input [data-combobox-control]) { cursor: text; padding: 0 ${s3} 0 ${s1}; }
  :where(bc-phone-input [data-combobox-control]:focus-within) { border-color: ${focus}; box-shadow: ${ring}; }
  :where(bc-phone-input [data-combobox-control][data-invalid]) { border-color: ${v('color-danger', '#dc2626')}; }

  /* The phone field's two parts: the country button, then the number, borderless inside. */
  :where(bc-phone-input [data-bc-country]) {
    display: inline-flex;
    align-items: center;
    gap: ${s1};
    flex: none;
    height: calc(100% - 2 * ${s1});
    padding: 0 ${s2};
    font: inherit;
    color: ${fg};
    background: none;
    border: none;
    border-radius: ${v('radius-sm', '0.25rem')};
    cursor: pointer;
  }
  :where(bc-phone-input [data-bc-country]:hover) { background: ${v('color-bg-subtle', '#f9f9fb')}; }
  :where(bc-phone-input [data-bc-country]:focus-visible) { outline: none; box-shadow: ${ring}; }
  :where(bc-phone-input [data-bc-number]) {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0 0 0 ${s2};
    font: inherit;
    color: inherit;
    background: none;
    border: none;
    border-left: ${thin} solid ${border};
    border-radius: 0;
    outline: none;
    box-shadow: none;
  }
  :where(bc-phone-input [data-bc-number]::placeholder) { color: ${muted}; }

  /* The popup (fluixi-ui menu.css, floating listbox), in the top layer. */
  :where([data-bc-popup][role='listbox'][data-state='open']) {
    position: fixed;
    inset: auto;
    margin: 0;
    box-sizing: border-box;
    min-width: 240px;
    max-height: 320px;
    overflow-y: auto;
    padding: ${s1};
    background: ${bg};
    color: ${fg};
    border: ${thin} solid ${border};
    border-radius: ${v('radius-lg', '0.5rem')};
    box-shadow: ${v('shadow-lg', '0 4px 8px -2px rgba(17, 24, 39, 0.06), 0 12px 20px -6px rgba(17, 24, 39, 0.10)')};
    font-size: ${v('font-size-sm', '0.875rem')};
    z-index: ${v('z-popover', '50')};
    animation: bc-pop-in ${v('duration-fast', '150ms')} ${v('ease-emphasized', 'cubic-bezier(0.3, 0, 0, 1)')};
  }
  /* The search box (fluixi-ui listbox.css), kept in view while the list scrolls. */
  :where([data-bc-popup] [data-select-search]) {
    position: sticky;
    top: 0;
    z-index: 1;
    box-sizing: border-box;
    width: 100%;
    margin-bottom: ${s1};
    padding: ${s2} ${s3};
    font: inherit;
    color: ${fg};
    background: ${bg};
    border: ${thin} solid ${border};
    border-radius: ${v('radius-sm', '0.25rem')};
    outline: none;
  }
  :where([data-bc-popup] [data-select-search]:focus-visible) { border-color: ${focus}; box-shadow: ${ring}; }
  :where([data-bc-popup] [data-select-search]::placeholder) { color: ${muted}; }
  /* Options (fluixi-ui listbox.css). */
  :where([data-bc-popup] [role='option']) {
    display: flex;
    align-items: center;
    gap: ${s2};
    padding: ${s2} ${s3};
    border-radius: ${v('radius-sm', '0.25rem')};
    color: ${fg};
    cursor: pointer;
    user-select: none;
    outline: none;
  }
  :where([data-bc-popup] [role='option'][data-active]) {
    background: ${v('color-primary-subtle', '#e7f1ff')};
    color: ${v('color-primary-active', '#295ec2')};
  }
  :where([data-bc-popup] [role='option'][data-selected]) { font-weight: ${v('font-weight-medium', '500')}; }
  :where([data-bc-popup] [role='option'][data-selected])::after {
    content: '✓';
    margin-left: ${s2};
    color: ${v('color-primary', '#2563eb')};
    font-size: 0.85em;
  }
  :where([data-bc-popup] [data-bc-separator]) { height: 0; margin: ${s1} 0; border-top: ${thin} solid ${border}; }
  :where([data-bc-popup] [data-bc-empty]) { margin: 0; padding: ${s2} ${s3}; color: ${muted}; }

  /* Pieces of a country: flag, name, calling code. */
  :where(bc-country-select, bc-phone-input) { display: block; }
  :where([data-bc-flag]) { flex: none; font-size: 1.15em; line-height: 1; }
  :where([data-bc-name]) { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  :where([data-bc-code]) { flex: none; color: ${muted}; font-variant-numeric: tabular-nums; }
  :where([role='option'][data-active] [data-bc-code]) { color: inherit; opacity: 0.8; }
  :where(bc-country-select [data-select-value]) { display: flex; align-items: center; gap: ${s2}; min-width: 0; flex: 1; }
  :where(bc-country-select[disabled], bc-phone-input[disabled]) { opacity: ${v('opacity-disabled', '0.5')}; pointer-events: none; }
}
@keyframes bc-pop-in {
  from { opacity: 0; transform: translateY(-4px) scale(0.98); }
}
`;

let installed = false;

/** Adds the styles to the page once, before any element renders. */
export function installStyles(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  const style = document.createElement('style');
  style.dataset.bambisteCountries = '';
  style.textContent = styles;
  // First in <head>: the app's own rules, later in the cascade, win ties.
  document.head.prepend(style);
}
