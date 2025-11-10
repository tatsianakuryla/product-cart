import { Main } from './components/ui/Main/Main.js';
import { loadProducts } from './utils/loadProducts.js';

const root = document.getElementById('root');

(async () => {
  const products = (await loadProducts()) ?? [];
  if (root) {
    root.append(Main.create(products));
  }
})();
