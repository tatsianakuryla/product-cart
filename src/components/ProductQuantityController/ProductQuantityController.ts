export type QuantityCounterOptions = {
  initialQuantity?: number;
  minimumQuantity?: number;
  maximumQuantity?: number;
  onQuantityChange?: (quantity: number) => void;
};

export class ProductQuantityController {
  private quantityValue: number;
  private readonly minimumQuantity: number;
  private readonly maximumQuantity: number;
  private readonly onQuantityChange?: (quantity: number) => void;

  constructor(options: QuantityCounterOptions = {}) {
    this.minimumQuantity = options.minimumQuantity ?? 1;
    this.maximumQuantity = options.maximumQuantity ?? 999;
    this.onQuantityChange = options.onQuantityChange;

    const start = options.initialQuantity ?? this.minimumQuantity;
    this.quantityValue = this._clampToRange(start);
  }

  public get quantity(): number {
    return this.quantityValue;
  }

  public set quantity(value: number) {
    this.setQuantity(value);
  }

  public setQuantity(nextQuantity: number): void {
    const normalized = this._clampToRange(this._toInteger(nextQuantity));
    if (normalized !== this.quantityValue) {
      this.quantityValue = normalized;
      this.onQuantityChange?.(this.quantityValue);
    }
  }

  public increase(step: number = 1): void {
    this.setQuantity(this.quantityValue + step);
  }

  public decrease(step: number = 1): void {
    this.setQuantity(this.quantityValue - step);
  }

  private _toInteger(value: unknown): number {
    const number = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(number) ? Math.trunc(number) : this.minimumQuantity;
  }

  private _clampToRange(value: number): number {
    if (value < this.minimumQuantity) return this.minimumQuantity;
    if (value > this.maximumQuantity) return this.maximumQuantity;
    return value;
  }
}
