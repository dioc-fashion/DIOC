'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, Menu, Phone, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from 'react';
import { useCart } from './StoreProvider';
import { siteConfig } from '@/lib/config';
import { AnimatedHeader } from '@/components/animation/AnimatedHeader';

const navigation = [
  ['/shop', 'Shop'],
  ['/women', 'Women'],
  ['/men', 'Men'],
  ['/kids', 'Kids'],
  ['/new-arrivals', 'New arrivals'],
  ['/collections', 'Collections'],
  ['/journal', 'Journal'],
] as const;

function keepFocusInside(event: ReactKeyboardEvent<HTMLDivElement>) {
  if (event.key !== 'Tab') return;
  const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled])',
  )].filter((element) => !element.classList.contains('mobile-menu-scrim') && !element.classList.contains('search-scrim'));
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

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const { count, wishlist } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const previousOverflow = document.body.style.overflow;
    if (menuOpen) menuPanelRef.current?.querySelector<HTMLElement>('nav a')?.focus();
    const background = [...document.querySelectorAll<HTMLElement>('.announcement, .header, main, .site-footer')];
    const previousInert = background.map((element) => element.inert);
    const previousAriaHidden = background.map((element) => element.getAttribute('aria-hidden'));
    const returnFocusTarget = menuOpen ? menuTriggerRef.current : searchTriggerRef.current;
    background.forEach((element) => {
      element.inert = true;
      element.setAttribute('aria-hidden', 'true');
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      background.forEach((element, index) => {
        element.inert = previousInert[index] ?? false;
        const ariaHidden = previousAriaHidden[index];
        if (ariaHidden === null || ariaHidden === undefined) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', ariaHidden);
      });
      document.removeEventListener('keydown', onKeyDown);
      returnFocusTarget?.focus();
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    menuPanelRef.current?.querySelector<HTMLElement>('nav a')?.focus();
  }, [menuOpen]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
    else router.push('/search');
    setSearchOpen(false);
  }

  return (
    <>
      <AnimatedHeader className="header">
        <div className="header-brand">
          <button
            ref={menuTriggerRef}
            type="button"
            className="mobile-icon"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <Menu size={21} />
          </button>
          <Link href="/" className="wordmark" aria-label="DIOC home"><span>D</span><span>I</span><span>O</span><span>C</span></Link>
        </div>
        <nav aria-label="Main navigation">
          {navigation.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
        </nav>
        <div className="actions">
          <a className="header-icon phone-link" href={`tel:${siteConfig.phone}`} aria-label="Call to order">
            <Phone size={18} />
          </a>
          <button ref={searchTriggerRef} className="header-icon search-trigger" type="button" onClick={() => setSearchOpen(true)} aria-label="Open search">
            <Search size={19} />
          </button>
          <Link className="header-icon account-link" href="/account" aria-label="Account">
            <UserRound size={18} />
          </Link>
          <Link className="header-icon wishlist-link" href="/wishlist" aria-label={`Wishlist${wishlist.length ? `, ${wishlist.length} saved` : ''}`}>
            <Heart size={18} />
          </Link>
          <Link className="header-icon bag" href="/cart" aria-label={`Open bag, ${count} items`}>
            <ShoppingBag size={19} /><span>{count}</span>
          </Link>
        </div>
      </AnimatedHeader>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            onKeyDown={keepFocusInside}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" className="mobile-menu-scrim" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
            <motion.div
              ref={menuPanelRef}
              className="mobile-menu-panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mobile-menu-head">
                <Link href="/" className="wordmark" onClick={() => setMenuOpen(false)}><span>D</span><span>I</span><span>O</span><span>C</span></Link>
                <button type="button" className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={21} /></button>
              </div>
              <nav aria-label="Mobile links">
                {navigation.map(([href, label], index) => (
                  <Link href={href} key={href} onClick={() => setMenuOpen(false)}>
                    <span>{label}</span><small>0{index + 1}</small>
                  </Link>
                ))}
              </nav>
              <div className="mobile-menu-foot">
                <Link href="/account" onClick={() => setMenuOpen(false)}>My account</Link>
                <a href={`tel:${siteConfig.phone}`}>Call to order</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="search-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Search DIOC"
            onKeyDown={keepFocusInside}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button className="search-scrim" type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" />
            <motion.div
              className="search-panel"
              initial={{ y: -18 }}
              animate={{ y: 0 }}
              exit={{ y: -18 }}
              transition={{ duration: 0.22 }}
            >
              <div className="search-panel-head"><p className="eyebrow">Search DIOC</p><button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={20} /></button></div>
              <form onSubmit={submitSearch}>
                <Search size={20} aria-hidden="true" />
                <input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="What are you looking for?" aria-label="Search products" />
                <button type="submit">Search <span>→</span></button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
