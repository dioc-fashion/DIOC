import Link from 'next/link';
import { siteConfig } from '@/lib/config';

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="wordmark" aria-label="DIOC home"><span>D</span><span>I</span><span>O</span><span>C</span></Link>
        <p className="footer-tagline">{siteConfig.slogan}</p>
      </div>
      <div>
        <h3>Explore</h3>
        <Link href="/new-arrivals">New arrivals</Link>
        <Link href="/women">Women</Link>
        <Link href="/men">Men</Link>
        <Link href="/kids">Kids</Link>
        <Link href="/journal">Journal</Link>
      </div>
      <div>
        <h3>Client care</h3>
        <Link href="/contact">Contact</Link>
        <Link href="/policies/shipping">Shipping</Link>
        <Link href="/policies/returns">Returns</Link>
        <a href={`tel:${siteConfig.phone}`}>Call to order</a>
      </div>
      <div>
        <h3>Order assistance</h3>
        <p>Speak with our team about availability, sizing and delivery.</p>
        <a href={siteConfig.whatsappLink('Hello DIOC, I would like some assistance.')} target="_blank" rel="noreferrer">
          WhatsApp DIOC →
        </a>
      </div>
      <small>© {new Date().getFullYear()} DIOC. {siteConfig.slogan}</small>
    </footer>
  );
}
