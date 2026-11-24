'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product } from '@/lib/catalog';
import { effectivePrice, formatKes } from '@/lib/catalog';
import { useCart } from './StoreProvider';
import { staggerItem } from '@/components/animation/variants';

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { wishlist, toggleWishlist } = useCart();
  const saved = wishlist.includes(product.id);

  return (
    <motion.article className="product-card" variants={staggerItem}>
      <Link href={`/products/${product.slug}`} className="product-photo">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 800px) 48vw, (max-width: 1200px) 25vw, 22vw"
          style={{ objectPosition: product.imagePositions?.[0] ?? '50% 50%' }}
        />
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 800px) 48vw, (max-width: 1200px) 25vw, 22vw"
            className="product-photo-secondary"
            style={{ objectPosition: product.imagePositions?.[1] ?? '50% 50%' }}
          />
        )}
        {product.new && <span className="pill">New</span>}
      </Link>
      <div className="product-info">
        <div>
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
          <p>{product.category}</p>
        </div>
        <motion.button
          type="button"
          className={`product-wishlist${saved ? ' is-saved' : ''}`}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
          aria-pressed={saved}
          onClick={() => toggleWishlist(product.id)}
          whileTap={{ scale: 0.88 }}
        >
          <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
        </motion.button>
      </div>
      <strong className="price">
        {formatKes(effectivePrice(product))}
        {product.sale && product.salePrice ? <del className="price-original">{formatKes(product.price)}</del> : null}
      </strong>
    </motion.article>
  );
}
