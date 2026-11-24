'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CataloguePage } from '@/components/CataloguePage';
import type { Product } from '@/lib/catalog';

const copy = {
  eyebrow: 'Search DIOC',
  title: 'Find your next piece.',
  intro: 'Search our current demonstration collection by name.',
};

function SearchWithQuery({ products }: { products: Product[] }) {
  const q = useSearchParams().get('q') ?? '';
  return <CataloguePage key={q} products={products} {...copy} initialQuery={q} />;
}

export function SearchCatalogue({ products }: { products: Product[] }) {
  return (
    <Suspense fallback={<CataloguePage products={products} {...copy} />}>
      <SearchWithQuery products={products} />
    </Suspense>
  );
}
