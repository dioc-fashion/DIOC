'use client';
import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { compareNewestFirst, type Product, type TargetAudience } from '@/lib/catalog';
import { StaggerContainer } from '@/components/animation/StaggerContainer';

type Props = {
  title: string;
  eyebrow: string;
  intro: string;
  initialGender?: 'women' | 'men' | 'all';
  initialAudience?: TargetAudience;
  newOnly?: boolean;
  initialQuery?: string;
  categoryOptions?: string[];
  products: Product[];
};

function Content({ title, eyebrow, intro, initialGender = 'all', initialAudience, newOnly = false, initialQuery = '', categoryOptions = [], products }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const audienceProducts = useMemo(() => products.filter((product) => {
    if (initialAudience) return (product.targetAudience ?? product.gender) === initialAudience;
    return initialGender === 'all' || product.gender === initialGender || product.gender === 'unisex';
  }), [products, initialAudience, initialGender]);
  const result = useMemo(() => audienceProducts
    .filter((product) => (!newOnly || product.new)
      && (category === 'all' || product.category === category)
      && `${product.name} ${product.category} ${product.type ?? ''}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price || compareNewestFirst(a, b);
      if (sort === 'price-high') return b.price - a.price || compareNewestFirst(a, b);
      if (sort === 'featured') return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || compareNewestFirst(a, b);
      return compareNewestFirst(a, b);
    }), [audienceProducts, category, newOnly, query, sort]);
  const categories = [...new Set([...categoryOptions, ...audienceProducts.map((product) => product.category)])].sort();

  return (
    <main className="catalogue">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="catalogue-intro">{intro}</p>
      <div className="catalogue-controls">
        <input aria-label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pieces" />
        <select aria-label="Filter category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          {categories.map((value) => <option key={value}>{value}</option>)}
        </select>
        <select aria-label="Sort products" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="newest">Newest first</option>
          <option value="featured">Featured, then newest</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
        </select>
      </div>
      <p className="result-count" aria-live="polite">{result.length} pieces</p>
      {result.length ? (
        <StaggerContainer className="product-grid stagger-grid">
          {result.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} />)}
        </StaggerContainer>
      ) : <p className="catalogue-empty">No pieces are currently available in this edit. Please check back soon.</p>}
    </main>
  );
}

export function CataloguePage(props: Props) {
  return <Content {...props} />;
}
