export type CreateOptions = {
  attrs?: Record<string, string>;
  dataset?: Record<string, string | number | boolean>;
  text?: string;
  html?: string;
  children?: HTMLElement | HTMLElement[] | null;
  on?: Record<string, (ev: Event) => void>;
  classList?: string[];
};

export function createElementWithClassAndId(
  tag: keyof HTMLElementTagNameMap,
  classNames: string[] = [],
  id?: string | null,
): HTMLElement {
  const element = document.createElement(tag);
  if (classNames) {
    element.classList.add(...classNames.filter(Boolean));
  }
  if (id) element.id = id;
  return element;
}
