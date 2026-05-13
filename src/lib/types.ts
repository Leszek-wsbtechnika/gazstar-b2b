export type Profile = {
  id: string;
  role: 'admin' | 'client';
  email?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  purchase_price: number;
  margin: number;
  image_url: string;
};

export type OrderItem = {
  quantity: number;
  price_at_time: number;
  products: Pick<Product, 'id' | 'name' | 'price' | 'image_url'> | null;
};

export type Order = {
  id: string;
  created_at: string;
  status: string;
  delivery_address: string;
  total_price: number;
  order_items: OrderItem[];
};
