/**
 * Properties that mirror attributes. Frameworks set properties on custom elements when they exist
 * (Fluixi, React 19, Lit), plain HTML sets attributes; both have to reach the same option.
 */
export function reflect(element: CustomElementConstructor, strings: Record<string, string>, booleans: Record<string, string>): void {
  for (const [property, attribute] of Object.entries(strings)) {
    Object.defineProperty(element.prototype, property, {
      configurable: true,
      get(this: HTMLElement) {
        return this.getAttribute(attribute) ?? '';
      },
      set(this: HTMLElement, value: unknown) {
        if (value == null || value === '') this.removeAttribute(attribute);
        else this.setAttribute(attribute, String(value));
      },
    });
  }
  for (const [property, attribute] of Object.entries(booleans)) {
    Object.defineProperty(element.prototype, property, {
      configurable: true,
      get(this: HTMLElement) {
        return this.hasAttribute(attribute);
      },
      set(this: HTMLElement, value: unknown) {
        this.toggleAttribute(attribute, !!value);
      },
    });
  }
}
