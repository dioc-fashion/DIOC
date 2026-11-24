import { SearchCatalogue } from '@/components/SearchCatalogue';
import { getCatalogProducts } from '@/lib/catalog-server';

export const metadata = { title: 'Search' };

export const dynamic = 'force-dynamic';

export default async function Search() {
  return <SearchCatalogue products={await getCatalogProducts()} />;
}
