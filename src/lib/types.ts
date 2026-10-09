export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  has_sizes: boolean;
  unit: string;
  sort_order: number;
};

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export type Order = {
  id: number;
  customer_name: string;
  phone: string;
  email: string;
  method: "pickup" | "delivery";
  address: string | null;
  note: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: string | null;
  product_name: string;
  size: "S" | "M" | "L" | "XL" | null;
  qty: number;
  unit_price: number;
};

export const SIZES = ["S", "M", "L", "XL"] as const;
