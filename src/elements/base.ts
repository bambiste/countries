/**
 * What the elements extend. On a server (an app rendering its pages there) there is no
 * HTMLElement: importing the entry must not throw, and nothing is registered.
 */
export const ElementBase: typeof HTMLElement =
  typeof HTMLElement === 'undefined' ? (class {} as unknown as typeof HTMLElement) : HTMLElement;
