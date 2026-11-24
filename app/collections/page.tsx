import Image from 'next/image';
import Link from 'next/link';

const collections = [
  ['women', 'The Women’s Edit', 'Refined essentials for the rhythm of every day.', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85'],
  ['men', 'The Men’s Edit', 'Modern tailoring and quietly elevated foundations.', 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=1200&q=85'],
  ['kids', 'The Kids Edit', 'Considered pieces for their own point of view.', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=85'],
  ['new', 'New Signatures', 'The first pieces from the latest DIOC chapter.', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=85'],
] as const;

export default function Collections() {
  return (
    <main className="collections">
      <p className="eyebrow">Curated worlds</p>
      <h1>Collections with a point<br /><em>of view.</em></h1>
      <div className="collection-list">
        {collections.map(([slug, title, copy, image]) => (
          <Link href={slug === 'new' ? '/new-arrivals' : `/${slug}`} key={slug} className="collection-row">
            <Image src={image} alt="" width={420} height={280} sizes="(max-width: 800px) 100px, 210px" />
            <div>
              <p className="eyebrow">DIOC Collection</p>
              <h2>{title}</h2>
              <p>{copy}</p>
            </div>
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
