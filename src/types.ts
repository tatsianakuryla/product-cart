export type Product = {
  id: string;
  title: string;
  desc: string;
  priceCents: number;
  img: string;
  alt: string;
};

export type CartItem = {
  id: string;
  title: string;
  priceCents: number;
  quantity: number;
};

export type CartTotals = {
  itemCount: number;
  totalQuantity: number;
  totalCents: number;
};
