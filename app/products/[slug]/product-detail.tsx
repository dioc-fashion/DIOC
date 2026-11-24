'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { effectivePrice, formatKes } from '@/lib/catalog';
import { useCart } from '@/components/StoreProvider';
import { siteConfig } from '@/lib/config';

export function ProductDetail({ product }: { product: Product }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [qty, setQty] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const { add, wishlist, toggleWishlist } = useCart();
  const saved = wishlist.includes(product.id);
  const ask = () => window.open(
    siteConfig.whatsappLink(`Hello DIOC,\n\nI have an enquiry about: ${product.name}\nSize: ${size}\nColour: ${color}\n\nPlease let me know about availability.`),
    '_blank',
    'noopener,noreferrer',
  );

  return (
    <section className="product-detail">
      <div className="gallery" aria-label={`${product.name} product images`}>
        {product.images.map((src, index) => (
          <button
            className={`gallery-slide${zoomed ? ' is-zoomed' : ''}`}
            type="button"
            aria-label={zoomed ? 'Reset product image zoom' : 'Zoom product image'}
            aria-pressed={zoomed}
            onClick={() => setZoomed((current) => !current)}
            key={src}
          >
            <Image
              src={src}
              alt={`${product.name}, view ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width: 800px) 100vw, 58vw"
              style={{ objectPosition: product.imagePositions?.[index] ?? '50% 50%' }}
            />
          </button>
        ))}
      </div>
      <div className="details">
        <p className="eyebrow">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="detail-price">
          {formatKes(effectivePrice(product))}
          {product.sale && product.salePrice ? <del className="price-original">{formatKes(product.price)}</del> : null}
        </p>
        <p className="detail-copy">{product.description}</p>
        <p className="stock">{product.stock > 0 ? `${product.stock} units available` : 'Currently unavailable'}</p>
        <fieldset>
          <legend>Select colour</legend>
          <div className="choice-row">
            {product.colors.map((option) => (
              <button type="button" className={color === option ? 'selected' : ''} onClick={() => setColor(option)} key={option}>{option}</button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Select size</legend>
          <div className="choice-row">
            {product.sizes.map((option) => (
              <button type="button" className={size === option ? 'selected' : ''} onClick={() => setSize(option)} key={option}>{option}</button>
            ))}
          </div>
        </fieldset>
        <div className="add-row">
          <div className="quantity" aria-label="Quantity">
            <button type="button" onClick={() => setQty((current) => Math.max(1, current - 1))} aria-label="Decrease quantity">−</button>
            <span aria-live="polite">{qty}</span>
            <button type="button" onClick={() => setQty((current) => current + 1)} aria-label="Increase quantity">+</button>
          </div>
          <button className="primary" onClick={() => add(product, size, color, qty)} disabled={!product.stock}>Add to bag <span>→</span></button>
        </div>
        <button className="secondary" onClick={ask}>WhatsApp enquiry</button>
        <button
          className={`wishlist-button${saved ? ' is-saved' : ''}`}
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={saved}
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved to wishlist' : 'Save to wishlist'}
        </button>
        <details><summary>Size guide</summary><p>Our demonstration size guide needs final brand measurements before launch.</p></details>
        <details><summary>Delivery & returns</summary><p>Delivery options and return policy are configured by the administrator before launch.</p></details>
      </div>
    </section>
  );
}
