import { createElementWithClassAndId } from '../../../utils/dom.js';
import { Container } from '../Container/Container.js';
import { ProductCardList } from '../ProductCardList/ProductCardList.js';
import { Product } from '../../../types.js';
import { CartController } from '../../CartController/CartController.js';
import { Cart } from '../Cart/Cart.js';

export class Main {
  public static create(products: Product[]): HTMLElement {
    const cart = new CartController();
    const cartUI = new Cart(cart);

    const main = createElementWithClassAndId('main', ['main', 'flex']);
    const container = Container.create();

    const catalogSection = createElementWithClassAndId('section', ['catalog']);
    const catalogHeading = createElementWithClassAndId('h1', ['catalog__heading']);
    catalogHeading.textContent = 'Каталог товаров';
    catalogSection.append(catalogHeading, ProductCardList.create(products, cart));

    container.append(catalogSection, cartUI.create());
    main.append(container);
    return main;
  }
}
