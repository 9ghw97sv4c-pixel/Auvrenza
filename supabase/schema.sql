-- ============================================================
-- AVELIS — Supabase schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`)
-- ============================================================

-- ---------- PROFILES ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

-- auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- CATEGORIES ----------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_ko text,
  name_uz text,
  name_ru text,
  description_en text,
  image_url text,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

-- ---------- PRODUCTS ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  brand text not null default 'AVELIS Lab',
  name_en text not null,
  name_ko text,
  name_uz text,
  name_ru text,
  description_en text,
  description_ko text,
  description_uz text,
  description_ru text,
  category_id uuid references categories(id) on delete set null,
  price_usd numeric(10,2) not null,
  compare_at_price_usd numeric(10,2),
  sku text unique,
  stock int not null default 0,
  images text[] default '{}',
  ingredients text,
  benefits text,
  skin_type text[] default '{}',
  rating numeric(2,1) default 0,
  review_count int default 0,
  is_bestseller boolean default false,
  is_active boolean default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_slug on products(slug);

-- ---------- WISHLISTS ----------
create table if not exists wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

-- ---------- CART ITEMS ----------
-- owner_id is either the authenticated user's uuid, or a guest session id (text) stored in a cookie
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  product_id uuid references products(id) on delete cascade not null,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique(owner_id, product_id)
);
create index if not exists idx_cart_owner on cart_items(owner_id);

-- ---------- COUPONS ----------
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null check (type in ('percent','fixed')),
  value numeric(10,2) not null,
  active boolean default true,
  usage_limit int,
  used_count int default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- ORDERS ----------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','paid','fulfilled','cancelled','refunded')),
  currency text not null default 'USD',
  subtotal_usd numeric(10,2) not null,
  discount_usd numeric(10,2) default 0,
  shipping_usd numeric(10,2) default 0,
  total_usd numeric(10,2) not null,
  coupon_code text,
  stripe_session_id text unique,
  stripe_payment_intent text,
  shipping_address jsonb,
  contact_email text,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  unit_price_usd numeric(10,2) not null,
  quantity int not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_order_items_order on order_items(order_id);

-- ---------- REVIEWS ----------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  is_approved boolean default true,
  created_at timestamptz not null default now()
);

-- ---------- CONTACT MESSAGES ----------
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- ---------- NEWSLETTER ----------
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table wishlists enable row level security;
alter table cart_items enable row level security;
alter table coupons enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table newsletter_subscribers enable row level security;
alter table contact_messages enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Atomically reserve stock for a checkout: decrements only if enough stock is
-- available, in a single UPDATE statement. Two simultaneous requests for the
-- last unit cannot both succeed — Postgres row-level locking during the UPDATE
-- serializes them, so the second one correctly sees insufficient stock and
-- returns false instead of silently overselling.
create or replace function public.reserve_stock(p_product_id uuid, p_quantity int)
returns boolean as $$
declare
  affected int;
begin
  update products set stock = stock - p_quantity
  where id = p_product_id and stock >= p_quantity;
  get diagnostics affected = row_count;
  return affected > 0;
end;
$$ language plpgsql security definer;

-- Releases a previously reserved quantity back to stock — used when a
-- checkout session expires or is cancelled before payment completes.
create or replace function public.restore_stock(p_product_id uuid, p_quantity int)
returns void as $$
begin
  update products set stock = stock + p_quantity where id = p_product_id;
end;
$$ language plpgsql security definer;

-- profiles
create policy "profiles_select_own_or_admin" on profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- categories & products: public read, admin write
create policy "categories_public_read" on categories for select using (true);
create policy "categories_admin_write" on categories for all using (public.is_admin()) with check (public.is_admin());

create policy "products_public_read" on products for select using (is_active = true or public.is_admin());
create policy "products_admin_write" on products for all using (public.is_admin()) with check (public.is_admin());

-- wishlists: user manages own rows
create policy "wishlists_own" on wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- cart_items: owner_id equals auth.uid()::text for logged-in users.
-- Guest carts (owner_id = a random session id) are only ever read/written via the
-- anon key from the browser using that same id, so we allow open access for text
-- ids that don't match a real user — enforced at the application layer.
create policy "cart_items_select" on cart_items for select using (true);
create policy "cart_items_insert" on cart_items for insert with check (true);
create policy "cart_items_update" on cart_items for update using (true);
create policy "cart_items_delete" on cart_items for delete using (true);

-- coupons: public can read active ones (to validate codes), admin manages
create policy "coupons_public_read_active" on coupons for select using (active = true or public.is_admin());
create policy "coupons_admin_write" on coupons for all using (public.is_admin()) with check (public.is_admin());

-- orders: user reads own, admin reads/writes all. Inserts happen server-side (service role) only.
create policy "orders_select_own_or_admin" on orders for select using (auth.uid() = user_id or public.is_admin());
create policy "orders_admin_write" on orders for all using (public.is_admin()) with check (public.is_admin());

create policy "order_items_select_own_or_admin" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);
create policy "order_items_admin_write" on order_items for all using (public.is_admin()) with check (public.is_admin());

-- reviews: public reads approved, user inserts own
create policy "reviews_public_read" on reviews for select using (is_approved = true or public.is_admin());
create policy "reviews_user_insert" on reviews for insert with check (auth.uid() = user_id);
create policy "reviews_admin_moderate" on reviews for update using (public.is_admin());

-- newsletter: anyone can insert (subscribe), only admin can read
create policy "newsletter_insert" on newsletter_subscribers for insert with check (true);
create policy "newsletter_admin_read" on newsletter_subscribers for select using (public.is_admin());

-- contact messages: anyone can insert, only admin can read
create policy "contact_insert" on contact_messages for insert with check (true);
create policy "contact_admin_read" on contact_messages for select using (public.is_admin());

-- ============================================================
-- To make your first admin user:
--   update profiles set role = 'admin' where id = '<your-auth-user-uuid>';
-- ============================================================

-- ============================================================
-- MIGRATIONS — safe to re-run even if you already ran an earlier
-- version of this file; each statement is a no-op if already applied.
-- ============================================================
alter table categories add column if not exists image_url text;
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_order_items_order on order_items(order_id);

-- Atomic stock reservation/restore functions (see definitions earlier in this
-- file) — safe to re-run, `create or replace function` always overwrites cleanly.
create or replace function public.reserve_stock(p_product_id uuid, p_quantity int)
returns boolean as $$
declare
  affected int;
begin
  update products set stock = stock - p_quantity
  where id = p_product_id and stock >= p_quantity;
  get diagnostics affected = row_count;
  return affected > 0;
end;
$$ language plpgsql security definer;

create or replace function public.restore_stock(p_product_id uuid, p_quantity int)
returns void as $$
begin
  update products set stock = stock + p_quantity where id = p_product_id;
end;
$$ language plpgsql security definer;

-- Same race-condition class as reserve_stock/restore_stock above, applied to
-- coupon usage_limit: two concurrent checkouts with the same near-exhausted
-- coupon could otherwise both read used_count < usage_limit before either
-- writes, letting the coupon be redeemed past its intended cap.
create or replace function public.try_use_coupon(p_coupon_id uuid)
returns boolean as $$
declare
  affected int;
begin
  update coupons set used_count = used_count + 1
  where id = p_coupon_id and active = true
    and (expires_at is null or expires_at > now())
    and (usage_limit is null or used_count < usage_limit);
  get diagnostics affected = row_count;
  return affected > 0;
end;
$$ language plpgsql security definer;

create or replace function public.release_coupon_usage(p_coupon_id uuid)
returns void as $$
begin
  update coupons set used_count = greatest(0, used_count - 1) where id = p_coupon_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- CRITICAL: restrict the stock/coupon functions above to service_role only.
-- SECURITY DEFINER functions run with elevated privileges that bypass RLS —
-- that's required for them to update products/coupons on a customer's behalf,
-- but it also means Postgres' default PUBLIC execute grant would let ANY
-- caller invoke them directly via the Supabase REST API using just the public
-- anon key, with no authentication at all (arbitrarily inflate stock, deplete
-- it as a DoS, or free up coupon usage). These are only ever meant to be
-- called from server-side code using the service role key (see
-- src/app/api/checkout/route.ts and src/app/api/webhooks/stripe/route.ts) —
-- never from the browser. Revoking from PUBLIC removes the default grant that
-- anon/authenticated would otherwise inherit; the explicit revokes below are
-- redundant defense-in-depth and are safe no-ops if no direct grant exists.
-- ============================================================
revoke execute on function public.reserve_stock(uuid, int) from public, anon, authenticated;
revoke execute on function public.restore_stock(uuid, int) from public, anon, authenticated;
revoke execute on function public.try_use_coupon(uuid) from public, anon, authenticated;
revoke execute on function public.release_coupon_usage(uuid) from public, anon, authenticated;
