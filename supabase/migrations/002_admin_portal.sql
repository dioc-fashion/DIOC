create table if not exists public.admin_users (
  email text primary key check (email = lower(email)),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.admin_users (email)
values ('dominicnjoroge079@gmail.com')
on conflict (email) do update set active = true;

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_users
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
      and active
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.products
  add column if not exists gender text not null default 'unisex',
  add column if not exists product_type text not null default 'Clothing',
  add column if not exists available boolean not null default true,
  add column if not exists status text not null default 'published',
  add column if not exists is_sale boolean not null default false;

alter table public.products
  drop constraint if exists products_gender_check,
  add constraint products_gender_check check (gender in ('men', 'women', 'boys', 'girls', 'unisex')),
  drop constraint if exists products_status_check,
  add constraint products_status_check check (status in ('draft', 'published', 'archived'));

alter table public.product_images
  add column if not exists focal_point text not null default '50% 50%';

alter table public.orders alter column status set default 'pending_contact';
create index if not exists products_status_category_idx on public.products(status, category_id);
create index if not exists product_images_product_sort_idx on public.product_images(product_id, sort_order);
create index if not exists product_variants_product_idx on public.product_variants(product_id);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.activity_logs enable row level security;
create table if not exists public.customer_enquiries (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  requested_products jsonb not null default '[]'::jsonb,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  source text not null default 'whatsapp',
  created_at timestamptz not null default now()
);
alter table public.customer_enquiries enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories" on public.categories for select using (true);
drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products" on public.products for select
  using ((status = 'published' and active and available) or public.is_admin());
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read published product images" on public.product_images;
create policy "Public can read published product images" on public.product_images for select
  using (
    public.is_admin() or exists (
      select 1 from public.products
      where products.id = product_images.product_id
        and products.status = 'published' and products.active and products.available
    )
  );
drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images" on public.product_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read published product variants" on public.product_variants;
create policy "Public can read published product variants" on public.product_variants for select
  using (
    public.is_admin() or exists (
      select 1 from public.products
      where products.id = product_variants.product_id
        and products.status = 'published' and products.active and products.available
    )
  );
drop policy if exists "Admins manage product variants" on public.product_variants;
create policy "Admins manage product variants" on public.product_variants for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins read orders" on public.orders;
create policy "Admins read orders" on public.orders for select to authenticated using (public.is_admin());
drop policy if exists "Admins update order status" on public.orders;
create policy "Admins update order status" on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins read order items" on public.order_items;
create policy "Admins read order items" on public.order_items for select to authenticated using (public.is_admin());

drop policy if exists "Admins read activity logs" on public.activity_logs;
create policy "Admins read activity logs" on public.activity_logs for select to authenticated using (public.is_admin());
drop policy if exists "Admins write activity logs" on public.activity_logs;
create policy "Admins write activity logs" on public.activity_logs for insert to authenticated with check (public.is_admin());
drop policy if exists "Admins manage customer enquiries" on public.customer_enquiries;
create policy "Admins manage customer enquiries" on public.customer_enquiries for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create or replace view public.inventory with (security_invoker = true) as
select product_id, sum(stock_quantity)::integer as stock_quantity
from public.product_variants
group by product_id;
grant select on public.inventory to anon, authenticated;

insert into public.categories (name, slug, gender)
values
  ('Jackets', 'jackets', 'unisex'),
  ('Dresses', 'dresses', 'women'),
  ('Shirts', 'shirts', 'men'),
  ('Trousers', 'trousers', 'unisex'),
  ('Accessories', 'accessories', 'unisex')
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public can view product photos') then
    create policy "Public can view product photos" on storage.objects for select using (bucket_id = 'product-images');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins upload product photos') then
    create policy "Admins upload product photos" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins update product photos') then
    create policy "Admins update product photos" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin()) with check (bucket_id = 'product-images' and public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins delete product photos') then
    create policy "Admins delete product photos" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
  end if;
end $$;

    create or replace function public.admin_create_product(p_product jsonb, p_variants jsonb, p_images jsonb)
    returns uuid
    language plpgsql
    security definer
    set search_path = public, pg_temp
    as $$
    declare
      created_id uuid;
    begin
      if not public.is_admin() then
        raise exception 'Administrator permission required' using errcode = '42501';
      end if;

      insert into public.products (
        sku, name, slug, description, category_id, price_kes, sale_price_kes, is_sale,
        gender, product_type, featured, is_new, active, available, status
      ) values (
        p_product ->> 'sku',
        p_product ->> 'name',
        p_product ->> 'slug',
        coalesce(p_product ->> 'description', ''),
        (p_product ->> 'category_id')::uuid,
        (p_product ->> 'price_kes')::integer,
        nullif(p_product ->> 'sale_price_kes', '')::integer,
        coalesce((p_product ->> 'is_sale')::boolean, false),
        p_product ->> 'gender',
        coalesce(p_product ->> 'product_type', 'Clothing'),
        coalesce((p_product ->> 'featured')::boolean, false),
        coalesce((p_product ->> 'is_new')::boolean, false),
        coalesce((p_product ->> 'active')::boolean, false),
        coalesce((p_product ->> 'available')::boolean, true),
        coalesce(p_product ->> 'status', 'draft')
      ) returning id into created_id;

      insert into public.product_variants (product_id, sku, size, color, stock_quantity)
      select created_id, item.sku, item.size, item.color, item.stock_quantity
      from jsonb_to_recordset(coalesce(p_variants, '[]'::jsonb)) as item(sku text, size text, color text, stock_quantity integer);

      insert into public.product_images (product_id, storage_path, alt_text, sort_order, focal_point)
      select created_id, item.storage_path, item.alt_text, item.sort_order, item.focal_point
      from jsonb_to_recordset(coalesce(p_images, '[]'::jsonb)) as item(storage_path text, alt_text text, sort_order integer, focal_point text);

      return created_id;
    end;
    $$;

    create or replace function public.admin_update_product(p_product_id uuid, p_product jsonb, p_variants jsonb, p_images jsonb)
    returns void
    language plpgsql
    security definer
    set search_path = public, pg_temp
    as $$
    begin
      if not public.is_admin() then
        raise exception 'Administrator permission required' using errcode = '42501';
      end if;

      update public.products set
        sku = p_product ->> 'sku',
        name = p_product ->> 'name',
        slug = p_product ->> 'slug',
        description = coalesce(p_product ->> 'description', ''),
        category_id = (p_product ->> 'category_id')::uuid,
        price_kes = (p_product ->> 'price_kes')::integer,
        sale_price_kes = nullif(p_product ->> 'sale_price_kes', '')::integer,
        is_sale = coalesce((p_product ->> 'is_sale')::boolean, false),
        gender = p_product ->> 'gender',
        product_type = coalesce(p_product ->> 'product_type', 'Clothing'),
        featured = coalesce((p_product ->> 'featured')::boolean, false),
        is_new = coalesce((p_product ->> 'is_new')::boolean, false),
        active = coalesce((p_product ->> 'active')::boolean, false),
        available = coalesce((p_product ->> 'available')::boolean, true),
        status = coalesce(p_product ->> 'status', 'draft')
      where id = p_product_id;

      if not found then
        raise exception 'Product not found' using errcode = 'P0002';
      end if;

      delete from public.product_variants where product_id = p_product_id;
      insert into public.product_variants (product_id, sku, size, color, stock_quantity)
      select p_product_id, item.sku, item.size, item.color, item.stock_quantity
      from jsonb_to_recordset(coalesce(p_variants, '[]'::jsonb)) as item(sku text, size text, color text, stock_quantity integer);

      delete from public.product_images where product_id = p_product_id;
      insert into public.product_images (product_id, storage_path, alt_text, sort_order, focal_point)
      select p_product_id, item.storage_path, item.alt_text, item.sort_order, item.focal_point
      from jsonb_to_recordset(coalesce(p_images, '[]'::jsonb)) as item(storage_path text, alt_text text, sort_order integer, focal_point text);
    end;
    $$;

    revoke all on function public.admin_create_product(jsonb, jsonb, jsonb) from public;
    revoke all on function public.admin_update_product(uuid, jsonb, jsonb, jsonb) from public;
    grant execute on function public.admin_create_product(jsonb, jsonb, jsonb) to authenticated;
    grant execute on function public.admin_update_product(uuid, jsonb, jsonb, jsonb) to authenticated;

insert into public.products (sku, name, slug, description, category_id, price_kes, gender, product_type, featured, is_new, active, available, status, is_sale)
select seed.sku, seed.name, seed.slug, seed.description, categories.id, seed.price, seed.gender, seed.product_type, seed.featured, seed.is_new, true, true, 'published', false
from (values
  ('DEMO-W-001', 'Serein Jacket', 'serein-jacket', 'A precisely cut single-breasted jacket in a structured wool blend. Made for an effortless silhouette.', 'jackets', 18900, 'women', 'Jacket', true, true),
  ('DEMO-W-002', 'No. 8 Silk Dress', 'no-8-silk-dress', 'Fluid satin drape in a refined midi length. A quietly memorable evening piece.', 'dresses', 14800, 'women', 'Dress', true, true),
  ('DEMO-M-001', 'Atelier Overshirt', 'atelier-overshirt', 'A relaxed overshirt in heavyweight cotton twill, finished with considered utility details.', 'shirts', 12900, 'men', 'Shirt', true, true),
  ('DEMO-M-002', 'Palais Trouser', 'palais-trouser', 'Wide-leg tailoring in a breathable wool blend, cut with a clean, architectural line.', 'trousers', 11800, 'men', 'Trousers', true, false),
  ('DEMO-U-001', 'Éclat Cuff', 'eclat-cuff', 'A polished sculptural cuff in gold-tone stainless steel.', 'accessories', 6200, 'unisex', 'Accessory', false, true),
  ('DEMO-W-003', 'Lune Slingback', 'lune-slingback', 'A pointed slingback in supple leather, balanced on a comfortable sculpted heel.', 'accessories', 11200, 'women', 'Shoes', false, false)
) as seed(sku, name, slug, description, category_slug, price, gender, product_type, featured, is_new)
join public.categories on categories.slug = seed.category_slug
on conflict (slug) do nothing;

insert into public.product_images (product_id, storage_path, alt_text, sort_order)
select products.id, seed.image_url, products.name, 0
from (values
  ('serein-jacket', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=85'),
  ('no-8-silk-dress', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85'),
  ('atelier-overshirt', 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=1200&q=85'),
  ('palais-trouser', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=85'),
  ('eclat-cuff', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1200&q=85'),
  ('lune-slingback', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85')
) as seed(slug, image_url)
join public.products on products.slug = seed.slug
where not exists (
  select 1 from public.product_images where product_id = products.id and storage_path = seed.image_url
);

with seed(slug, stock, sizes, colors) as (
  values
    ('serein-jacket', 8, array['XS','S','M','L'], array['Noir','Ivory']),
    ('no-8-silk-dress', 12, array['XS','S','M','L'], array['Champagne','Noir']),
    ('atelier-overshirt', 10, array['S','M','L','XL'], array['Stone','Black']),
    ('palais-trouser', 6, array['30','32','34','36'], array['Charcoal','Sand']),
    ('eclat-cuff', 18, array['One size'], array['Gold']),
    ('lune-slingback', 5, array['36','37','38','39','40'], array['Black','Bordeaux'])
), variants as (
  select products.id as product_id, products.sku, size, color, stock,
    row_number() over (partition by products.id order by size, color) as position
  from seed
  join public.products on products.slug = seed.slug
  cross join unnest(seed.sizes) as sizes(size)
  cross join unnest(seed.colors) as colors(color)
)
insert into public.product_variants (product_id, sku, size, color, stock_quantity)
select product_id, sku || '-' || upper(regexp_replace(coalesce(size, 'OS') || '-' || color, '[^A-Za-z0-9]+', '-', 'g')) || '-' || position,
  size, color, case when position = 1 then stock else 0 end
from variants
on conflict (sku) do nothing;
