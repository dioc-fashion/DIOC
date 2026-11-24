'use client';

import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { StaggerContainer } from '@/components/animation/StaggerContainer';
import { useCart } from '@/components/StoreProvider';
import type { Product } from '@/lib/catalog';

export default function WishlistProducts({ products }: { products: Product[] }) {
  const { wishlist } = useCart();
  const savedProducts = products.filter((product) => wishlist.includes(product.id));

  return (
    <main className="catalogue">
      <p className="eyebrow">Saved pieces</p>
      <h1>Your wishlist.</h1>
      {savedProducts.length ? (
        <StaggerContainer className="product-grid wishlist-grid">
          {savedProducts.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} />)}
        </StaggerContainer>
      ) : (
        <div className="wishlist-empty">
          <p>Your saved pieces will be collected here.</p>
          <Link href="/shop" className="primary">Explore the collection <span>→</span></Link>
        </div>
      )}
    </main>
  );
}
