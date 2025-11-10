import { createElementWithClassAndId } from './dom.js';

export function createQuantityButton(labelText: string, ariaLabel: string): HTMLButtonElement {
  const btn = createElementWithClassAndId('button', [
    'btn',
    'quantity-control__button',
  ]) as HTMLButtonElement;
  btn.type = 'button';
  btn.textContent = labelText;
  btn.setAttribute('aria-label', ariaLabel);
  return btn;
}

export function createQuantityInput(initial: number, ariaLabel: string): HTMLInputElement {
  const input = createElementWithClassAndId('input', [
    'quantity-control__input',
  ]) as HTMLInputElement;
  input.type = 'number';
  input.min = '1';
  input.max = '999';
  input.step = '1';
  input.inputMode = 'numeric';
  input.value = String(initial);
  input.setAttribute('aria-label', ariaLabel);
  return input;
}
