'use client';

import Link from 'next/link';
import { useCart } from '@/components/StoreProvider';
import { effectivePrice, formatKes } from '@/lib/catalog';

export default function CartPage() {
  const { items, setDrawerOpen } = useCart();
  const total = items.reduce((sum, item) => sum + effectivePrice(item.product) * item.quantity, 0);

  return (
    <main className="simple-page">
      <p className="eyebrow">Your selection</p>
      <h1>Shopping bag.</h1>
      {items.length ? (
        <>
          <div className="bag-summary">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.size}-${item.color}`}>
                <span>{item.product.name} · {item.size} · {item.quantity}</span>
                <b>{formatKes(effectivePrice(item.product) * item.quantity)}</b>
              </div>
            ))}
          </div>
          <p><b>Total: {formatKes(total)}</b></p>
          <button className="primary" onClick={() => setDrawerOpen(true)}>Review and order <span>→</span></button>
        </>
      ) : (
        <>
          <p>Your bag is currently empty.</p>
          <Link href="/shop" className="primary">Shop the collection <span>→</span></Link>
        </>
      )}
    </main>
  );
}
