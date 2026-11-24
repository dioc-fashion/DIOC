'use client';

import { usePathname } from 'next/navigation';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { PageTransition } from '@/components/animation/PageTransition';
import { ScrollProgress } from '@/components/animation/ScrollProgress';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return children;

  return (
    <>
      <div className="announcement">
        <span>Complimentary delivery on orders over KES 20,000</span>
        <span className="announcement-separator" aria-hidden="true">·</span>
        <span>Kenyan orders only</span>
      </div>
      <Header />
      <ScrollProgress />
      <PageTransition>{children}</PageTransition>
      <Footer />
      <CartDrawer />
    </>
  );
}
