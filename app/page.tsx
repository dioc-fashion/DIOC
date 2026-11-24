import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { compareNewestFirst } from '@/lib/catalog';
import { getCatalogProducts } from '@/lib/catalog-server';
import { siteConfig } from '@/lib/config';
import { ImageReveal } from '@/components/animation/ImageReveal';
import { Reveal } from '@/components/animation/Reveal';
import { SmoothSection } from '@/components/animation/SmoothSection';
import { StaggerContainer } from '@/components/animation/StaggerContainer';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await getCatalogProducts();
  return (
    <main>
      <section className="hero">
        <ImageReveal
          className="hero-image"
          src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=2200&q=90"
          alt="DIOC Spring Summer editorial"
          sizes="100vw"
          priority
        />
        <div className="hero-content">
          <p className="eyebrow light">Spring — Summer 2026</p>
          <h1>The art of<br /><em>an entrance.</em></h1>
          <Link href="/shop" className="button light-button">Explore the collection <ArrowUpRight size={16} /></Link>
        </div>
        <span className="hero-caption">A study in contrasts, 01—26</span>
      </section>

      <SmoothSection className="intro">
        <p className="eyebrow">The DIOC point of view</p>
        <h2>Pieces that hold a room<br />without saying a word.</h2>
        <p>Designed with a respect for precise tailoring, tactile materials, and a life well lived.</p>
      </SmoothSection>

      <section className="campaign-grid" aria-label="Shop by collection">
        <Link href="/women" className="campaign-card woman">
          <Image src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1300&q=85" alt="" fill sizes="(max-width: 800px) 50vw, 46vw" />
          <span>Women <ArrowUpRight size={16} /></span>
        </Link>
        <Link href="/men" className="campaign-card man">
          <Image src="https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=1300&q=85" alt="" fill sizes="(max-width: 800px) 50vw, 46vw" />
          <span>Men <ArrowUpRight size={16} /></span>
        </Link>
      </section>

      <section className="section">
        <Reveal className="section-head">
          <div><p className="eyebrow">Selected pieces</p><h2>New signatures</h2></div>
          <Link href="/new-arrivals" className="underlink">Shop all <span>→</span></Link>
        </Reveal>
        <StaggerContainer className="product-grid featured-products">
          {products.filter((product) => product.new).sort(compareNewestFirst).slice(0, 4).map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </StaggerContainer>
      </section>

      <SmoothSection className="atelier">
        <div className="atelier-image">
          <Image
            src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1500&q=85"
            alt="DIOC atelier editorial"
            fill
            sizes="(max-width: 800px) 100vw, 55vw"
          />
        </div>
        <div>
          <p className="eyebrow">The atelier</p>
          <h2>Made with<br /><em>intention.</em></h2>
          <p>Exceptional pieces begin with discerning choices: fabric, cut, and the hand that finishes every detail.</p>
          <Link className="underlink" href="/about">Discover our craft <span>→</span></Link>
        </div>
      </SmoothSection>

      <SmoothSection className="journal-tease">
        <p className="eyebrow">DIOC Journal</p>
        <h2>Considered <em>living.</em></h2>
        <p>Notes on style, culture and the quiet confidence of getting dressed.</p>
        <Link href="/journal" className="button dark-button">Read the journal <ArrowUpRight size={16} /></Link>
      </SmoothSection>
      <a className="whatsapp" href={siteConfig.whatsappLink('Hello DIOC, I would like some assistance.')} target="_blank" rel="noreferrer" aria-label="Contact DIOC via WhatsApp">WA</a>
    </main>
  );
}
