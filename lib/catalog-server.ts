
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { Product } from '@/lib/catalog';
import { publishedCatalog } from '@/lib/published-catalog';

type CatalogRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  gender: Product['gender'];
  target_audience: NonNullable<Product['targetAudience']>;
  created_at: string;
  collections: { slug: string } | { slug: string }[] | null;
  product_type: string | null;
  price_kes: number;
  sale_price_kes: number | null;
  is_sale: boolean;
  featured: boolean;
  is_new: boolean;
  available: boolean;
  categories: { name: string } | { name: string }[] | null;
  product_images: { storage_path: string; focal_point: string; sort_order: number }[];
  product_variants: { size: string | null; color: string | null; stock_quantity: number }[];
};

export async function getCatalogProducts(): Promise<Product[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (process.env.DIOC_LIVE_CATALOG !== 'true') {
    return publishedCatalog;
  }

  if (!url || !key) {
    throw new Error('DIOC_LIVE_CATALOG is enabled but the public Supabase URL or publishable key is missing.');
  }

  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await client
    .from('products')
    .select('id,slug,name,description,gender,target_audience,created_at,collections(slug),product_type,price_kes,sale_price_kes,is_sale,featured,is_new,available,categories(name),product_images(storage_path,focal_point,sort_order),product_variants(size,color,stock_quantity)')
    .eq('status', 'published')
    .eq('active', true)
    .eq('available', true)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });

  if (error) {
    throw new Error(`Could not load the live DIOC catalogue: ${error.message}`);
  }

  const supabaseProducts: Product[] = ((data ?? []) as unknown as CatalogRow[]).map((row) => {
    const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
    const collection = Array.isArray(row.collections) ? row.collections[0] : row.collections;
    const images = [...row.product_images].sort((a, b) => a.sort_order - b.sort_order);
    const sizes = [...new Set(row.product_variants.map((variant) => variant.size).filter((value): value is string => Boolean(value)))];
    const colors = [...new Set(row.product_variants.map((variant) => variant.color).filter((value): value is string => Boolean(value)))];

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      gender: row.gender,
      targetAudience: row.target_audience,
      collection: collection?.slug,
      createdAt: row.created_at,
      category: category?.name ?? 'Collection',
      type: row.product_type ?? undefined,
      price: row.price_kes,
      salePrice: row.sale_price_kes ?? undefined,
      sale: row.is_sale,
      description: row.description ?? '',
      images: images.map((image) => image.storage_path.startsWith('http')
        ? image.storage_path
        : client.storage.from('product-images').getPublicUrl(image.storage_path).data.publicUrl),
      imagePositions: images.map((image) => image.focal_point || '50% 50%'),
      sizes: sizes.length ? sizes : ['One size'],
      colors: colors.length ? colors : ['Default'],
      featured: row.featured,
      new: row.is_new,
      available: row.available,
      stock: row.product_variants.reduce((total, variant) => total + variant.stock_quantity, 0),
    };
  });

  // Preserve Supabase products and add local DIOC.exe products.
  // Supabase takes priority when IDs or slugs match.
  const combined = [...supabaseProducts];
  const existingIds = new Set(supabaseProducts.map((product) => product.id));
  const existingSlugs = new Set(supabaseProducts.map((product) => product.slug));

  for (const product of publishedCatalog) {
    if (existingIds.has(product.id) || existingSlugs.has(product.slug)) continue;

    combined.push(product);
    existingIds.add(product.id);
    existingSlugs.add(product.slug);
  }

  return combined.sort((a, b) =>
    Date.parse(b.createdAt ?? '') - Date.parse(a.createdAt ?? '') ||
    b.id.localeCompare(a.id)
  );
}

