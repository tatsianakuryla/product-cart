import { CartItem, CartTotals } from '../../types.js';

export type CartChangeListener = (items: CartItem[], stats: CartTotals) => void;

export class CartController {
  private items: Map<string, CartItem> = new Map();
  private listeners: Set<CartChangeListener> = new Set();

  public addItem(item: { id: string; title: string; priceCents: number; quantity: number }): void {
    const existing = this.items.get(item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.items.set(item.id, { ...item });
    }
    this.notifyListeners();
  }

  public removeItem(id: string): void {
    this.items.delete(id);
    this.notifyListeners();
  }

  public updateQuantity(id: string, quantity: number): void {
    const item = this.items.get(id);
    if (!item) return;

    if (quantity <= 0) {
      this.removeItem(id);
    } else {
      item.quantity = quantity;
      this.notifyListeners();
    }
  }

  public clear(): void {
    this.items.clear();
    this.notifyListeners();
  }

  public hasItem(id: string): boolean {
    return this.items.has(id);
  }

  public getItems(): CartItem[] {
    return Array.from(this.items.values());
  }

  public getStats(): CartTotals {
    const items = this.getItems();
    const itemCount = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

    return { itemCount, totalQuantity, totalCents };
  }

  public getTotalCents(): number {
    return this.getStats().totalCents;
  }

  public onChange(listener: CartChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const items = this.getItems();
    const stats = this.getStats();
    this.listeners.forEach((listener) => listener(items, stats));
  }
}
