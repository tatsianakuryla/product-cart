import { Product } from '../types.js';

export async function loadProducts(): Promise<Product[]> {
  try {
    const response = await fetch('./data/products.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as unknown;
    if (!Array.isArray(data)) return [];
    return data as Product[];
  } catch (error) {
    console.warn('loadProducts failed:', error);
    return [];
  }
}
