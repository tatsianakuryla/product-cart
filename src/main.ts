import { Container } from './components/Container/Container.js';

const root = document.getElementById('root');

if (root) {
  root.append(Container.create());
}
