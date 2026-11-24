-- Add audience-aware collections and stable product timestamps without replacing existing catalogue data.

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.products
  add column if not exists created_at timestamptz not null default now();

insert into public.collections (name, slug)
values
  ('Men', 'men'),
  ('Women', 'women'),
  ('Kids', 'kids'),
  ('Unisex', 'unisex')
on conflict (slug) do update set name = excluded.name;

alter table public.collections enable row level security;
drop policy if exists "Public can read collections" on public.collections;
create policy "Public can read collections" on public.collections for select using (true);
grant select on public.collections to anon, authenticated;

alter table public.products
  add column if not exists target_audience text,
  add column if not exists collection_id uuid references public.collections(id),
  add column if not exists updated_at timestamptz,
  add column if not exists published_at timestamptz;

update public.products
set target_audience = case
      when gender in ('men', 'women', 'boys', 'girls') then gender
      else 'unisex'
    end
where target_audience is null;

update public.products as product
set collection_id = collection.id
from public.collections as collection
where product.collection_id is null
  and collection.slug = case
    when product.gender in ('boys', 'girls') then 'kids'
    when product.gender in ('men', 'women') then product.gender
    else 'unisex'
  end;

update public.products
set updated_at = coalesce(updated_at, created_at),
    published_at = case
      when status = 'published' then coalesce(published_at, created_at)
      else published_at
    end;

alter table public.products
  alter column target_audience set default 'unisex',
  alter column target_audience set not null,
  alter column collection_id set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

alter table public.products
  drop constraint if exists products_target_audience_check,
  add constraint products_target_audience_check
    check (target_audience in ('men', 'women', 'boys', 'girls', 'unisex_kids', 'unisex'));

create index if not exists products_audience_created_idx
  on public.products (target_audience, created_at desc, id desc)
  where status = 'published' and active and available;
create index if not exists products_collection_created_idx
  on public.products (collection_id, created_at desc, id desc);
create index if not exists product_variants_size_color_idx
  on public.product_variants (size, color);

create or replace function public.set_product_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_product_updated_at();

insert into public.categories (name, slug, gender)
values
  ('Boys'' T-shirts', 'boys-t-shirts', 'boys'),
  ('Boys'' shirts', 'boys-shirts', 'boys'),
  ('Boys'' trousers', 'boys-trousers', 'boys'),
  ('Boys'' shorts', 'boys-shorts', 'boys'),
  ('Boys'' jackets', 'boys-jackets', 'boys'),
  ('Boys'' shoes', 'boys-shoes', 'boys'),
  ('Boys'' accessories', 'boys-accessories', 'boys'),
  ('Girls'' dresses', 'girls-dresses', 'girls'),
  ('Girls'' tops', 'girls-tops', 'girls'),
  ('Girls'' skirts', 'girls-skirts', 'girls'),
  ('Girls'' trousers', 'girls-trousers', 'girls'),
  ('Girls'' jackets', 'girls-jackets', 'girls'),
  ('Girls'' shoes', 'girls-shoes', 'girls'),
  ('Girls'' accessories', 'girls-accessories', 'girls')
on conflict (slug) do nothing;
