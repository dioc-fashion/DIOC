'use client';

import Image from 'next/image';
import { Minus, Phone, Plus, X } from 'lucide-react';
import { KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from 'react';
import { useCart } from './StoreProvider';
import { effectivePrice, formatKes } from '@/lib/catalog';
import { siteConfig } from '@/lib/config';

function keepFocusInside(event: ReactKeyboardEvent<HTMLElement>) {
  if (event.key !== 'Tab') return;
  const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled])',
  )];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}

export function CartDrawer() {
  const { items, drawerOpen, setDrawerOpen, remove, update } = useCart();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const total = items.reduce((sum, item) => sum + effectivePrice(item.product) * item.quantity, 0);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    closeButtonRef.current?.focus();
    const background = [...document.querySelectorAll<HTMLElement>('.announcement, .header, main, .site-footer')];
    const previousInert = background.map((element) => element.inert);
    const previousAriaHidden = background.map((element) => element.getAttribute('aria-hidden'));
    background.forEach((element) => {
      element.inert = true;
      element.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
      background.forEach((element, index) => {
        element.inert = previousInert[index] ?? false;
        const ariaHidden = previousAriaHidden[index];
        if (ariaHidden === null || ariaHidden === undefined) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', ariaHidden);
      });
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [drawerOpen, setDrawerOpen]);

  const order = () => {
    const lines = items.map((item) => (
      `Product: ${item.product.name}\nSize: ${item.size}\nColour: ${item.color}\nQuantity: ${item.quantity}\nPrice: ${formatKes(effectivePrice(item.product) * item.quantity)}`
    )).join('\n\n');
    window.open(
      siteConfig.whatsappLink(`Hello DIOC,\n\nI would like to start an order conversation.\n\nCustomer name: ${name || 'Not provided'}\nPreferred delivery location: ${location || 'Not provided'}\n\n${lines}\n\nTotal estimated order value: ${formatKes(total)}\n\nPlease confirm availability and delivery arrangements.`),
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <>
      <button
        type="button"
        className={`scrim ${drawerOpen ? 'show' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-label="Close shopping bag"
        tabIndex={drawerOpen ? 0 : -1}
        aria-hidden={!drawerOpen}
      />
      <aside
        className={`cart-drawer ${drawerOpen ? 'open' : ''}`}
        aria-label="Shopping bag"
        role={drawerOpen ? 'dialog' : undefined}
        aria-modal={drawerOpen || undefined}
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
        onKeyDown={keepFocusInside}
      >
        <div className="drawer-head">
          <h2>Your bag ({items.length})</h2>
          <button ref={closeButtonRef} type="button" onClick={() => setDrawerOpen(false)} aria-label="Close bag"><X /></button>
        </div>
        <div className="drawer-items">
          {items.length === 0
            ? <p className="muted">Your bag is waiting for its first piece.</p>
            : items.map((item, index) => (
              <div className="cart-line" key={`${item.product.id}-${item.size}-${item.color}`}>
                <Image src={item.product.images[0]} alt={item.product.name} width={75} height={95} sizes="75px" />
                <div>
                  <strong>{item.product.name}</strong>
                  <small>{item.color} · {item.size}</small>
                  <b>{formatKes(effectivePrice(item.product))}</b>
                  <div className="qty">
                    <button type="button" onClick={() => update(index, item.quantity - 1)} aria-label={`Decrease ${item.product.name} quantity`}><Minus size={13} /></button>
                    <span aria-live="polite">{item.quantity}</span>
                    <button type="button" onClick={() => update(index, item.quantity + 1)} aria-label={`Increase ${item.product.name} quantity`}><Plus size={13} /></button>
                    <button type="button" className="remove" onClick={() => remove(index)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className="drawer-total">
          <div><span>Estimated total</span><strong>{formatKes(total)}</strong></div>
          {items.length > 0 && (
            <div className="order-fields">
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name (optional)" aria-label="Your name, optional" />
              <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Preferred delivery location" aria-label="Preferred delivery location" />
            </div>
          )}
          <p>Sending this starts a conversation; DIOC confirms availability before any order is accepted.</p>
          <button className="primary full" disabled={!items.length} onClick={order}>Send bag via WhatsApp <span>→</span></button>
          <a className="call-order" href={`tel:${siteConfig.phone}`}><Phone size={14} /> Call to order</a>
        </div>
      </aside>
    </>
  );
}
