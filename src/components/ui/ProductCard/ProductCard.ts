import { createElementWithClassAndId } from '../../../utils/dom.js';
import type { Product } from '../../../types.js';
import { BYN } from '../../../utils/price.js';
import { ProductQuantityController } from '../../ProductQuantityController/ProductQuantityController.js';
import { createQuantityButton, createQuantityInput } from '../../../utils/quantityControls.js';

type ProductCardOptions = {
  isInCart?: (productId: string) => boolean;
  onAddToCart?: (payload: {
    id: string;
    title: string;
    priceCents: number;
    quantity: number;
  }) => number;
  onRemoveFromCart?: (productId: string) => void;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onCartChange?: (callback: (isInCart: boolean) => void) => () => void;
};

export class ProductCard {
  private readonly defaultImageWidth = 240;
  private readonly defaultImageHeight = 320;

  private currentProduct!: Product;

  private decreaseButtonElement!: HTMLButtonElement;
  private quantityInputElement!: HTMLInputElement;
  private increaseButtonElement!: HTMLButtonElement;
  private totalAmountElement!: HTMLElement;
  private addRemoveButtonElement!: HTMLButtonElement;

  private quantityCounter!: ProductQuantityController;
  private inCart = false;

  constructor(private readonly options: ProductCardOptions = {}) {}

  public create(product: Product): HTMLElement {
    this.currentProduct = product;
    this.initializeQuantityCounter();

    const listItemElement = createElementWithClassAndId('li', ['product-card', 'flex']);
    const articleElement = createElementWithClassAndId('article', [
      'product-card__article',
      'flex',
    ]);

    articleElement.append(
      this.createHeading(product),
      this.createImage(product),
      this.createDescription(product),
      this.createBottomRow(product),
    );
    listItemElement.append(articleElement);
    this.setInCartState(this.options.isInCart?.(product.id) ?? false);

    if (this.options.onCartChange) {
      this.options.onCartChange((isInCart) => {
        if (isInCart !== this.inCart) {
          if (!isInCart) {
            this.setInCartState(false);
            this.quantityCounter.setQuantity(1);
          } else {
            this.setInCartState(true);
          }
        }
      });
    }

    return listItemElement;
  }

  private createHeading(product: Product): HTMLElement {
    const el = createElementWithClassAndId('h3', ['product-card__heading']);
    el.textContent = product.title;
    return el;
  }

  private createImage(product: Product): HTMLElement {
    const img = createElementWithClassAndId('img', ['product-card__image']) as HTMLImageElement;
    img.src = product.img;
    img.alt = product.alt;
    img.width = this.defaultImageWidth;
    img.height = this.defaultImageHeight;
    return img;
  }

  private createDescription(product: Product): HTMLElement {
    const el = createElementWithClassAndId('p', ['product-card__description']);
    el.textContent = product.desc;
    return el;
  }

  private createBottomRow(product: Product): HTMLElement {
    const row = createElementWithClassAndId('div', ['product-card__row', 'flex']);

    const unitPrice = createElementWithClassAndId('div', ['product-card__unit-price']);
    unitPrice.textContent = BYN.format(product.priceCents / 100);

    const quantityControls = this.createQuantityControl();
    this.addQuantityControlEvents();

    this.totalAmountElement = createElementWithClassAndId('div', ['product-card__total-amount']);
    this.totalAmountElement.textContent = BYN.format(product.priceCents / 100);

    this.addRemoveButtonElement = this.createAddRemoveButton();

    const right = createElementWithClassAndId('div', ['product-card__controls', 'flex']);
    right.append(quantityControls, this.totalAmountElement, this.addRemoveButtonElement);

    row.append(unitPrice, right);
    return row;
  }

  private createQuantityControl(): HTMLElement {
    this.decreaseButtonElement = createQuantityButton('−', 'Уменьшить количество');
    this.quantityInputElement = createQuantityInput(1, 'Количество товара');
    this.increaseButtonElement = createQuantityButton('+', 'Увеличить количество');

    const wrap = createElementWithClassAndId('div', ['quantity-control', 'flex']);
    wrap.append(this.decreaseButtonElement, this.quantityInputElement, this.increaseButtonElement);
    return wrap;
  }

  private addQuantityControlEvents(): void {
    this.increaseButtonElement.addEventListener('click', () => {
      const currentValue = this.quantityInputElement.valueAsNumber;
      const newValue = !Number.isFinite(currentValue) || currentValue < 1 ? 1 : currentValue;
      const nextValue = newValue + 1;
      if (nextValue <= 999) {
        this.quantityCounter.setQuantity(nextValue);
        if (this.inCart) {
          this.options.onUpdateQuantity?.(this.currentProduct.id, nextValue);
        }
      }
    });

    this.decreaseButtonElement.addEventListener('click', () => {
      const currentValue = this.quantityInputElement.valueAsNumber;
      if (!Number.isFinite(currentValue) || currentValue <= 1) {
        this.quantityCounter.setQuantity(1);
        if (this.inCart) {
          this.options.onUpdateQuantity?.(this.currentProduct.id, 1);
        }
        return;
      }
      const nextValue = currentValue - 1;
      if (nextValue >= 1) {
        this.quantityCounter.setQuantity(nextValue);
        if (this.inCart) {
          this.options.onUpdateQuantity?.(this.currentProduct.id, nextValue);
        }
      }
    });

    this.quantityInputElement.addEventListener('input', () => {
      const v = this.quantityInputElement.valueAsNumber;
      if (!Number.isFinite(v) || v < 1) {
        return;
      }
      const quantity = Math.trunc(v);
      if (quantity >= 1 && quantity <= 999) {
        this.quantityCounter.setQuantity(quantity);
        if (this.inCart) {
          this.options.onUpdateQuantity?.(this.currentProduct.id, quantity);
        }
      }
    });

    this.quantityInputElement.addEventListener('change', () => {
      const v = this.quantityInputElement.valueAsNumber;
      if (!Number.isFinite(v) || v < 1) {
        this.quantityCounter.setQuantity(1);
        this.quantityInputElement.value = '1';
        if (this.inCart) {
          this.options.onUpdateQuantity?.(this.currentProduct.id, 1);
        }
      } else {
        const quantity = Math.trunc(v);
        const normalized = Math.max(1, Math.min(999, quantity));
        this.quantityCounter.setQuantity(normalized);
        this.quantityInputElement.value = String(normalized);
        if (this.inCart) {
          this.options.onUpdateQuantity?.(this.currentProduct.id, normalized);
        }
      }
    });
  }

  private createAddRemoveButton(): HTMLButtonElement {
    const btn = createElementWithClassAndId('button', [
      'btn',
      'btn--primary',
      'product-card__add-to-cart-button',
    ]) as HTMLButtonElement;
    btn.type = 'button';
    btn.addEventListener('click', () => {
      if (!this.inCart) {
        const raw = this.quantityInputElement.valueAsNumber;
        const quantity = Number.isFinite(raw) && raw > 0 ? Math.trunc(raw) : 1;
        this.quantityCounter.setQuantity(quantity);
        this.quantityInputElement.value = String(this.quantityCounter.quantity);

        const cartTotal =
          this.options.onAddToCart?.({
            id: this.currentProduct.id,
            title: this.currentProduct.title,
            priceCents: this.currentProduct.priceCents,
            quantity: this.quantityCounter.quantity,
          }) ?? 0;
        this.setInCartState(true);

        alert(`Товар добавлен. Итого по корзине: ${BYN.format(cartTotal / 100)}`);
      } else {
        this.options.onRemoveFromCart?.(this.currentProduct.id);
        this.setInCartState(false);
        this.quantityCounter.setQuantity(1);
      }
    });

    return btn;
  }

  private setInCartState(inCart: boolean): void {
    this.inCart = inCart;
    if (!this.addRemoveButtonElement) return;

    this.addRemoveButtonElement.classList.toggle('is-in-cart', inCart);
    if (inCart) {
      this.addRemoveButtonElement.textContent = 'Удалить из корзины';
      this.addRemoveButtonElement.setAttribute(
        'aria-label',
        `Удалить ${this.currentProduct.title} из корзины`,
      );
      this.addRemoveButtonElement.disabled = false;
    } else {
      this.addRemoveButtonElement.textContent = 'В корзину';
      this.addRemoveButtonElement.setAttribute(
        'aria-label',
        `Добавить ${this.currentProduct.title} в корзину`,
      );
      this.addRemoveButtonElement.disabled = false;
    }
  }

  private initializeQuantityCounter(): void {
    this.quantityCounter = new ProductQuantityController({
      initialQuantity: 1,
      onQuantityChange: (nextQuantity) => {
        if (nextQuantity >= 1) {
          this.quantityInputElement && (this.quantityInputElement.value = String(nextQuantity));
          this.updateTotal(nextQuantity);
        }
      },
    });
  }

  private updateTotal(quantity: number): void {
    const cents = this.currentProduct.priceCents * quantity;
    this.totalAmountElement.textContent = BYN.format(cents / 100);
  }
}
