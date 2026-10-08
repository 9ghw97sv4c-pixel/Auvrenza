export interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_ko: string | null;
  name_uz: string | null;
  name_ru: string | null;
  description_en: string | null;
  image_url?: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  slug: string;
  brand: string;
  name_en: string;
  name_ko: string | null;
  name_uz: string | null;
  name_ru: string | null;
  description_en: string | null;
  description_ko: string | null;
  description_uz: string | null;
  description_ru: string | null;
  category_id: string | null;
  price_usd: number;
  compare_at_price_usd: number | null;
  sku: string | null;
  stock: number;
  images: string[];
  ingredients: string | null;
  benefits: string | null;
  skin_type: string[];
  rating: number;
  review_count: number;
  is_bestseller: boolean;
  is_active: boolean;
}

export interface CartItem {
  id: string;
  owner_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
}

export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";

export interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  currency: string;
  subtotal_usd: number;
  discount_usd: number;
  shipping_usd: number;
  total_usd: number;
  coupon_code: string | null;
  stripe_session_id: string | null;
  shipping_address: Record<string, string> | null;
  contact_email: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price_usd: number;
  quantity: number;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "customer" | "admin";
  created_at: string;
}

export function productName(p: Pick<Product, "name_en" | "name_ko" | "name_uz" | "name_ru">, locale: string) {
  const key = `name_${locale}` as keyof typeof p;
  return (p[key] as string) || p.name_en;
}
