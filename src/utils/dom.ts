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
