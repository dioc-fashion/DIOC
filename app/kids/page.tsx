import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export const metadata = { title: 'Kids' };

const edits = [
  {
    href: '/kids/boys',
    label: 'Boys',
    copy: 'Everyday favourites, thoughtfully made.',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1200&q=85',
  },
  {
    href: '/kids/girls',
    label: 'Girls',
    copy: 'Expressive pieces for every occasion.',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=85',
  },
  {
    href: '/kids/unisex-kids',
    label: 'Unisex Kids',
    copy: 'Easy layers and considered essentials.',
    image: 'https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=1200&q=85',
  },
];

export default function Kids() {
  return (
    <main className="kids-hub">
      <section className="kids-hub-hero">
        <Image
          src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=2200&q=90"
          alt="Kidswear editorial"
          fill
          priority
          sizes="100vw"
        />
        <div>
          <p className="eyebrow light">DIOC Kids</p>
          <h1>Small details.<br /><em>Big character.</em></h1>
          <p>Thoughtful everyday style, made for all the ways they grow.</p>
          <a className="button light-button" href="#kids-edits">Explore the edits <ArrowUpRight size={16} /></a>
        </div>
        <span className="kids-hero-caption">A new point of view</span>
      </section>

      <section className="kids-edits" id="kids-edits">
        <div className="kids-section-heading">
          <p className="eyebrow">The kids collection</p>
          <h2>Find their edit.</h2>
        </div>
        <div className="kids-edit-grid">
          {edits.map((edit) => (
            <Link href={edit.href} className="kids-edit-card" key={edit.href}>
              <Image src={edit.image} alt="" fill sizes="(max-width: 800px) 90vw, 31vw" />
              <span className="kids-edit-copy">
                <span><strong>{edit.label}</strong><small>{edit.copy}</small></span>
                <ArrowUpRight size={19} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
