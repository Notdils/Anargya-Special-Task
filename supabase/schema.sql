-- =====================================================================
--  ANARGYA EV ITS — Database schema (Supabase / PostgreSQL)
--  Jalankan SELURUH file ini sekali di: Supabase Dashboard → SQL Editor
--  Aman dijalankan ulang (idempotent).
-- =====================================================================

-- ---------- Tabel ----------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  price       integer not null check (price >= 0),          -- dalam Rupiah
  stock       integer not null default 0 check (stock >= 0),
  image_url   text,
  has_sizes   boolean not null default false,               -- true = kaos (S/M/L/XL)
  unit        text not null default 'pcs',                  -- pcs / pack
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id             bigint generated always as identity primary key,
  customer_name  text not null,
  phone          text not null,
  email          text not null,
  method         text not null check (method in ('pickup','delivery')),
  address        text,
  note           text,
  total          integer not null default 0,
  status         text not null default 'pending'
                 check (status in ('pending','processing','completed','cancelled')),
  created_at     timestamptz not null default now()
);

create table if not exists public.order_items (
  id            bigint generated always as identity primary key,
  order_id      bigint not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  product_name  text not null,
  size          text check (size in ('S','M','L','XL')),
  qty           integer not null check (qty > 0),
  unit_price    integer not null
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- Daftar admin (user Supabase Auth yang boleh mengelola toko)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- ---------- Row Level Security ----------------------------------------
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "products: public read"  on public.products;
drop policy if exists "products: admin write"  on public.products;
create policy "products: public read" on public.products for select using (true);
create policy "products: admin write" on public.products for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders: admin all" on public.orders;
create policy "orders: admin all" on public.orders for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order_items: admin all" on public.order_items;
create policy "order_items: admin all" on public.order_items for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_users: self read" on public.admin_users;
create policy "admin_users: self read" on public.admin_users for select
  using (user_id = auth.uid());

-- ---------- Checkout (atomik) -----------------------------------------
-- Pembeli (anon) TIDAK bisa insert langsung ke tabel orders.
-- Semua checkout lewat fungsi ini: validasi data, cek & kurangi stok,
-- hitung total dari harga di database (bukan dari client).
create or replace function public.place_order(customer jsonb, items jsonb)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_order_id bigint;
  v_total    integer := 0;
  v_item     jsonb;
  v_product  public.products%rowtype;
  v_qty      integer;
  v_size     text;
  v_method   text := customer->>'method';
  v_lines    jsonb := '[]'::jsonb;
  v_need     record;
begin
  if coalesce(trim(customer->>'name'),'')  = '' then raise exception 'Nama wajib diisi'; end if;
  if coalesce(trim(customer->>'phone'),'') = '' then raise exception 'No. WhatsApp wajib diisi'; end if;
  if coalesce(trim(customer->>'email'),'') = '' then raise exception 'Email wajib diisi'; end if;
  if v_method not in ('pickup','delivery') then raise exception 'Metode tidak valid'; end if;
  if v_method = 'delivery' and coalesce(trim(customer->>'address'),'') = '' then
    raise exception 'Alamat wajib diisi untuk pengiriman';
  end if;
  if items is null or jsonb_array_length(items) = 0 then raise exception 'Keranjang masih kosong'; end if;

  -- cek stok per produk (total qty semua size), kunci baris produk
  for v_need in
    select (i->>'product_id')::uuid as pid, sum((i->>'qty')::int) as qty
    from jsonb_array_elements(items) i group by 1
  loop
    select * into v_product from public.products where id = v_need.pid for update;
    if not found then raise exception 'Produk tidak ditemukan'; end if;
    if v_need.qty <= 0 then raise exception 'Jumlah tidak valid'; end if;
    if v_product.stock < v_need.qty then
      raise exception 'Stok % tidak cukup (sisa %)', v_product.name, v_product.stock;
    end if;
  end loop;

  insert into public.orders (customer_name, phone, email, method, address, note)
  values (trim(customer->>'name'), trim(customer->>'phone'), trim(customer->>'email'), v_method,
          nullif(trim(customer->>'address'),''), nullif(trim(customer->>'note'),''))
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(items) loop
    select * into v_product from public.products where id = (v_item->>'product_id')::uuid;
    v_qty  := (v_item->>'qty')::int;
    v_size := nullif(v_item->>'size','');
    if v_product.has_sizes and v_size is null then raise exception 'Ukuran % wajib dipilih', v_product.name; end if;
    if not v_product.has_sizes then v_size := null; end if;

    insert into public.order_items (order_id, product_id, product_name, size, qty, unit_price)
    values (v_order_id, v_product.id, v_product.name, v_size, v_qty, v_product.price);

    update public.products set stock = stock - v_qty where id = v_product.id;
    v_total := v_total + v_qty * v_product.price;
    v_lines := v_lines || jsonb_build_object('name', v_product.name, 'size', v_size,
                                             'qty', v_qty, 'unit_price', v_product.price);
  end loop;

  update public.orders set total = v_total where id = v_order_id;

  return jsonb_build_object('id', v_order_id, 'total', v_total, 'status', 'pending',
                            'method', v_method, 'name', trim(customer->>'name'), 'items', v_lines);
end;
$$;

grant execute on function public.place_order(jsonb, jsonb) to anon, authenticated;

-- ---------- Storage untuk gambar produk -------------------------------
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "products bucket: public read"  on storage.objects;
drop policy if exists "products bucket: admin insert" on storage.objects;
drop policy if exists "products bucket: admin update" on storage.objects;
drop policy if exists "products bucket: admin delete" on storage.objects;
create policy "products bucket: public read"  on storage.objects for select using (bucket_id = 'products');
create policy "products bucket: admin insert" on storage.objects for insert with check (bucket_id = 'products' and public.is_admin());
create policy "products bucket: admin update" on storage.objects for update using (bucket_id = 'products' and public.is_admin());
create policy "products bucket: admin delete" on storage.objects for delete using (bucket_id = 'products' and public.is_admin());

-- ---------- Seed produk awal ------------------------------------------
insert into public.products (name, price, stock, image_url, has_sizes, unit, sort_order)
select * from (values
  ('White Shirt',  115000, 25, '/images/white-shirt.png',  true,  'pcs',  1),
  ('Black Shirt',  115000, 25, '/images/black-shirt.png',  true,  'pcs',  2),
  ('Sticker Pack',  10000, 50, '/images/sticker-pack.png', false, 'pack', 3),
  ('Tumbler',       40000, 20, '/images/tumbler.png',      false, 'pcs',  4),
  ('Keychain',      15000, 40, '/images/keychain.png',     false, 'pcs',  5)
) as v(name, price, stock, image_url, has_sizes, unit, sort_order)
where not exists (select 1 from public.products);

-- ---------- Jadikan akun admin ----------------------------------------
-- Pastikan user admin@anargya.com SUDAH dibuat di Authentication → Users
-- sebelum menjalankan file ini (kalau belum, jalankan ulang baris ini nanti).
insert into public.admin_users (user_id)
select id from auth.users where email = 'admin@anargya.com'
on conflict do nothing;
