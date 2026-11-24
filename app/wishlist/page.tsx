import { getCatalogProducts } from '@/lib/catalog-server';
import WishlistProducts from '@/components/WishlistProducts';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  return <WishlistProducts products={await getCatalogProducts()} />;
}
