import { createElementWithClassAndId } from '../../../utils/dom.js';

export class Container {
  public static create() {
    return createElementWithClassAndId('div', ['container', 'flex']);
  }
}
