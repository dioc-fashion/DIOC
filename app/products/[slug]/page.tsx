import { notFound } from 'next/navigation';
import { getCatalogProducts } from '@/lib/catalog-server';
import { ProductDetail } from './product-detail';
import { ProductCard } from '@/components/ProductCard';
import { StaggerContainer } from '@/components/animation/StaggerContainer';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const products = await getCatalogProducts();
  // A static export needs at least one path; an unknown slug renders the 404 page.
  return products.length ? products.map(({ slug }) => ({ slug })) : [{ slug: 'unavailable' }];
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await getCatalogProducts();
  const product = products.find((entry) => entry.slug === slug);
  if (!product) notFound();
  const related = products.filter((item) => item.id !== product.id && item.gender === product.gender).slice(0, 3);

  return (
    <main>
      <ProductDetail product={product} />
      <section className="section related">
        <div className="section-head">
          <div><p className="eyebrow">You may also like</p><h2>More to discover</h2></div>
        </div>
        <StaggerContainer className="product-grid">
          {related.map((item) => <ProductCard key={item.id} product={item} />)}
        </StaggerContainer>
      </section>
    </main>
  );
}
