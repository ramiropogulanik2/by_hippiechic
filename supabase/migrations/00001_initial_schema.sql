-- =====================================================
-- ESQUEMA: Catálogo Hippie & Chic
-- =====================================================

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  display_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete restrict,
  name text not null,
  description text,
  price numeric(10,2) not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text,
  color text,
  stock int not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, size, color)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_phone text,
  status text not null default 'pendiente',
  total numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_variant_id uuid not null references product_variants(id),
  quantity int not null default 1,
  unit_price numeric(10,2) not null
);

create index idx_products_category on products(category_id);
create index idx_product_images_product on product_images(product_id);
create index idx_product_variants_product on product_variants(product_id);
create index idx_order_items_order on order_items(order_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;

create policy "categories: lectura publica" on categories
  for select using (is_visible = true);

create policy "products: lectura publica" on products
  for select using (is_published = true);

create policy "product_images: lectura publica" on product_images
  for select using (true);

create policy "product_variants: lectura publica" on product_variants
  for select using (true);

alter table orders enable row level security;
alter table order_items enable row level security;

create policy "orders: insert publico" on orders
  for insert with check (true);

create policy "order_items: insert publico" on order_items
  for insert with check (true);
