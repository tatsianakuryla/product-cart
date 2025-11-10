import { createElementWithClassAndId } from '../../../utils/dom.js';
import type { Product } from '../../../types.js';
import { ProductCard } from '../ProductCard/ProductCard.js';
import { CartController } from '../../CartController/CartController.js';

export class ProductCardList {
  public static create(products: Product[], cart: CartController): HTMLElement {
    if (!Array.isArray(products) || products.length === 0) {
      return ProductCardList.createEmptyState();
    }

    const listElement = createElementWithClassAndId('ul', ['product-card-list', 'flex']);
    listElement.setAttribute('role', 'list');

    for (const product of products) {
      const productCard = new ProductCard({
        isInCart: (id) => cart.hasItem(id),
        onAddToCart: (payload) => {
          cart.addItem(payload);
          return cart.getTotalCents();
        },
        onRemoveFromCart: (id) => {
          cart.removeItem(id);
        },
        onUpdateQuantity: (id, quantity) => {
          cart.updateQuantity(id, quantity);
        },
        onCartChange: (callback) => {
          return cart.onChange(() => {
            const isInCart = cart.hasItem(product.id);
            callback(isInCart);
          });
        },
      });
      listElement.appendChild(productCard.create(product));
    }

    return listElement;
  }

  private static createEmptyState(): HTMLElement {
    const wrapperElement = createElementWithClassAndId('div', ['product-card-list__empty']);
    wrapperElement.setAttribute('role', 'status');
    wrapperElement.setAttribute('aria-live', 'polite');
    const titleElement = createElementWithClassAndId('h3', ['product-card-list__empty-title']);
    titleElement.textContent = 'Нет товаров в витрине';
    const hintElement = createElementWithClassAndId('p', ['product-card-list__empty-hint']);
    hintElement.textContent = 'Попробуйте изменить фильтры или обновить страницу.';
    wrapperElement.append(titleElement, hintElement);
    return wrapperElement;
  }
}
