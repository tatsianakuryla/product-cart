import { createElementWithClassAndId } from '../../../utils/dom.js';
import { BYN } from '../../../utils/price.js';
import { CartItem, CartTotals } from '../../../types.js';
import { ProductQuantityController } from '../../ProductQuantityController/ProductQuantityController.js';
import { CartController } from '../../CartController/CartController.js';
import { createQuantityButton, createQuantityInput } from '../../../utils/quantityControls.js';

export class Cart {
  private cart: CartController;
  private containerElement!: HTMLElement;
  private itemsContainerElement!: HTMLElement;
  private emptyStateElement!: HTMLElement;
  private summaryElement!: HTMLElement;
  private liveRegionElement!: HTMLElement;
  private itemComponents: Map<
    string,
    { element: HTMLElement; counter: ProductQuantityController }
  > = new Map();

  constructor(cart: CartController) {
    this.cart = cart;
  }

  public create(): HTMLElement {
    this.containerElement = createElementWithClassAndId('aside', ['cart', 'flex']);
    this.containerElement.setAttribute('role', 'complementary');
    this.containerElement.setAttribute('aria-label', 'Корзина');

    const heading = createElementWithClassAndId('h2', ['cart__heading']);
    heading.textContent = 'Корзина';

    this.liveRegionElement = createElementWithClassAndId('div', ['cart__live-region']);
    this.liveRegionElement.setAttribute('aria-live', 'polite');
    this.liveRegionElement.setAttribute('aria-atomic', 'true');

    this.emptyStateElement = this.createEmptyState();
    this.itemsContainerElement = createElementWithClassAndId('div', ['cart__items', 'flex']);
    this.summaryElement = this.createSummary();

    const clearButton = this.createClearButton();

    this.containerElement.append(
      heading,
      this.liveRegionElement,
      this.emptyStateElement,
      this.itemsContainerElement,
      this.summaryElement,
      clearButton,
    );

    this.cart.onChange((items, stats) => this.render(items, stats));
    this.render(this.cart.getItems(), this.cart.getStats());

    return this.containerElement;
  }

  private createEmptyState(): HTMLElement {
    const el = createElementWithClassAndId('p', ['cart__empty']);
    el.textContent = 'Корзина пуста';
    return el;
  }

  private createSummary(): HTMLElement {
    const summary = createElementWithClassAndId('div', ['cart__summary', 'flex']);

    const itemCountRow = createElementWithClassAndId('div', ['cart__summary-row', 'flex']);
    const itemCountLabel = createElementWithClassAndId('span', ['cart__summary-label']);
    itemCountLabel.textContent = 'Позиций:';
    const itemCountValue = createElementWithClassAndId('span', ['cart__summary-value']);
    itemCountValue.setAttribute('data-cart-item-count', '');
    itemCountValue.textContent = '0';
    itemCountRow.append(itemCountLabel, itemCountValue);

    const totalQuantityRow = createElementWithClassAndId('div', ['cart__summary-row', 'flex']);
    const totalQuantityLabel = createElementWithClassAndId('span', ['cart__summary-label']);
    totalQuantityLabel.textContent = 'Всего единиц:';
    const totalQuantityValue = createElementWithClassAndId('span', ['cart__summary-value']);
    totalQuantityValue.setAttribute('data-cart-total-quantity', '');
    totalQuantityValue.textContent = '0';
    totalQuantityRow.append(totalQuantityLabel, totalQuantityValue);

    const totalRow = createElementWithClassAndId('div', [
      'cart__summary-row',
      'cart__summary-row--total',
      'flex',
    ]);
    const totalLabel = createElementWithClassAndId('span', ['cart__summary-label']);
    totalLabel.textContent = 'Итого:';
    const totalValue = createElementWithClassAndId('span', [
      'cart__summary-value',
      'cart__summary-value--total',
    ]);
    totalValue.setAttribute('data-cart-total', '');
    totalValue.textContent = BYN.format(0);
    totalRow.append(totalLabel, totalValue);

    summary.append(itemCountRow, totalQuantityRow, totalRow);
    return summary;
  }

  private createClearButton(): HTMLButtonElement {
    const btn = createElementWithClassAndId('button', [
      'btn',
      'btn--secondary',
      'cart__clear-button',
    ]) as HTMLButtonElement;
    btn.type = 'button';
    btn.textContent = 'Очистить корзину';
    btn.addEventListener('click', () => {
      this.cart.clear();
    });
    return btn;
  }

  private render(items: CartItem[], stats: CartTotals): void {
    const isEmpty = items.length === 0;

    this.emptyStateElement.style.display = isEmpty ? 'block' : 'none';
    this.itemsContainerElement.style.display = isEmpty ? 'none' : 'block';
    const currentIds = new Set(items.map((item) => item.id));
    const existingIds = new Set(this.itemComponents.keys());
    for (const id of existingIds) {
      if (!currentIds.has(id)) {
        const component = this.itemComponents.get(id);
        component?.element.remove();
        this.itemComponents.delete(id);
      }
    }

    for (const item of items) {
      const existing = this.itemComponents.get(item.id);
      if (existing) {
        this.updateCartItem(existing, item);
      } else {
        const component = this.createCartItem(item);
        this.itemComponents.set(item.id, component);
        this.itemsContainerElement.appendChild(component.element);
      }
    }

    this.updateSummary(stats);

    this.liveRegionElement.textContent = isEmpty
      ? 'Корзина пуста'
      : `В корзине ${stats.itemCount} ${this.getPluralForm(stats.itemCount, 'позиция', 'позиции', 'позиций')}, итого: ${BYN.format(stats.totalCents / 100)}`;
  }

  private createCartItem(item: CartItem): {
    element: HTMLElement;
    counter: ProductQuantityController;
  } {
    const article = createElementWithClassAndId('article', ['cart-item', 'flex']);
    article.setAttribute('data-item-id', item.id);

    const header = createElementWithClassAndId('div', ['cart-item__header', 'flex']);
    const title = createElementWithClassAndId('h3', ['cart-item__title']);
    title.textContent = item.title;
    header.appendChild(title);

    const priceRow = createElementWithClassAndId('div', ['cart-item__price-row', 'flex']);
    const unitPrice = createElementWithClassAndId('span', ['cart-item__unit-price']);
    unitPrice.textContent = BYN.format(item.priceCents / 100);
    priceRow.appendChild(unitPrice);

    const controls = createElementWithClassAndId('div', ['cart-item__controls', 'flex']);

    const quantityCounter = new ProductQuantityController({
      initialQuantity: item.quantity,
      minimumQuantity: 1,
      maximumQuantity: 999,
    });

    const decreaseBtn = createQuantityButton('−', 'Уменьшить количество');
    const quantityInput = createQuantityInput(item.quantity, 'Количество товара');
    const increaseBtn = createQuantityButton('+', 'Увеличить количество');

    const quantityWrap = createElementWithClassAndId('div', ['quantity-control']);
    quantityWrap.append(decreaseBtn, quantityInput, increaseBtn);

    const itemTotal = createElementWithClassAndId('div', ['cart-item__total']);
    itemTotal.textContent = BYN.format((item.priceCents * item.quantity) / 100);

    const removeBtn = createElementWithClassAndId('button', [
      'btn',
      'btn--danger',
      'cart-item__remove',
    ]) as HTMLButtonElement;
    removeBtn.type = 'button';
    removeBtn.textContent = 'Удалить';
    removeBtn.setAttribute('aria-label', `Удалить ${item.title} из корзины`);
    removeBtn.addEventListener('click', () => {
      this.cart.removeItem(item.id);
    });

    controls.append(quantityWrap, itemTotal, removeBtn);

    article.append(header, priceRow, controls);

    increaseBtn.addEventListener('click', () => {
      const current = parseInt(quantityInput.value, 10);
      if (current < 999) {
        quantityCounter.increase(1);
        const newQuantity = quantityCounter.quantity;
        quantityInput.value = String(newQuantity);
        itemTotal.textContent = BYN.format((item.priceCents * newQuantity) / 100);
        this.cart.updateQuantity(item.id, newQuantity);
      }
    });

    decreaseBtn.addEventListener('click', () => {
      const current = parseInt(quantityInput.value, 10);
      if (current > 1) {
        quantityCounter.decrease(1);
        const newQuantity = quantityCounter.quantity;
        quantityInput.value = String(newQuantity);
        itemTotal.textContent = BYN.format((item.priceCents * newQuantity) / 100);
        this.cart.updateQuantity(item.id, newQuantity);
      } else if (current === 1) {
        this.cart.removeItem(item.id);
      }
    });

    quantityInput.addEventListener('change', () => {
      const v = parseInt(quantityInput.value, 10);
      if (!Number.isFinite(v) || v <= 0) {
        this.cart.removeItem(item.id);
      } else {
        const normalized = Math.max(1, Math.min(999, v));
        quantityCounter.setQuantity(normalized);
        quantityInput.value = String(normalized);
        itemTotal.textContent = BYN.format((item.priceCents * normalized) / 100);
        this.cart.updateQuantity(item.id, normalized);
      }
    });

    return { element: article, counter: quantityCounter };
  }

  private updateCartItem(
    component: { element: HTMLElement; counter: ProductQuantityController },
    item: CartItem,
  ): void {
    const quantityInput = component.element.querySelector(
      '.quantity-control__input',
    ) as HTMLInputElement;
    const itemTotal = component.element.querySelector('.cart-item__total') as HTMLElement;

    if (quantityInput && component.counter.quantity !== item.quantity) {
      component.counter.setQuantity(item.quantity);
      quantityInput.value = String(item.quantity);
    }

    if (itemTotal) {
      itemTotal.textContent = BYN.format((item.priceCents * item.quantity) / 100);
    }
  }

  private updateSummary(stats: CartTotals): void {
    const itemCountEl = this.summaryElement.querySelector('[data-cart-item-count]');
    const totalQuantityEl = this.summaryElement.querySelector('[data-cart-total-quantity]');
    const totalEl = this.summaryElement.querySelector('[data-cart-total]');

    if (itemCountEl) itemCountEl.textContent = String(stats.itemCount);
    if (totalQuantityEl) totalQuantityEl.textContent = String(stats.totalQuantity);
    if (totalEl) totalEl.textContent = BYN.format(stats.totalCents / 100);
  }

  private getPluralForm(n: number, form1: string, form2: string, form5: string): string {
    const n10 = n % 10;
    const n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return form1;
    if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return form2;
    return form5;
  }
}
