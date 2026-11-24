import { CataloguePage } from '@/components/CataloguePage';
import { getCatalogProducts } from '@/lib/catalog-server';

export const metadata = { title: 'Search' };

export const dynamic = 'force-dynamic';

export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  return (
    <CataloguePage
      products={await getCatalogProducts()}
      eyebrow="Search DIOC"
      title="Find your next piece."
      intro="Search our current demonstration collection by name."
      initialQuery={q}
    />
  );
}
