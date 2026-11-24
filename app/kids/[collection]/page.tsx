import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CataloguePage } from '@/components/CataloguePage';
import { getCatalogProducts } from '@/lib/catalog-server';

const collections = {
  boys: {
    title: 'Boys',
    eyebrow: 'DIOC Kids · Boys',
    intro: 'Comfortable essentials and polished layers, made for their everyday adventures.',
    audience: 'boys' as const,
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1800&q=90',
    categories: ["Boys' T-shirts", "Boys' shirts", "Boys' trousers", "Boys' shorts", "Boys' jackets", "Boys' shoes", "Boys' accessories"],
  },
  girls: {
    title: 'Girls',
    eyebrow: 'DIOC Kids · Girls',
    intro: 'Expressive dresses, versatile layers and considered everyday favourites.',
    audience: 'girls' as const,
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1800&q=90',
    categories: ["Girls' dresses", "Girls' tops", "Girls' skirts", "Girls' trousers", "Girls' jackets", "Girls' shoes", "Girls' accessories"],
  },
  'unisex-kids': {
    title: 'Unisex Kids',
    eyebrow: 'DIOC Kids · Unisex',
    intro: 'Easy, versatile pieces designed to be worn their own way.',
    audience: 'unisex_kids' as const,
    image: 'https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=1800&q=90',
    categories: [
      "Boys' T-shirts", "Boys' shirts", "Boys' trousers", "Boys' shorts", "Boys' jackets", "Boys' shoes", "Boys' accessories",
      "Girls' dresses", "Girls' tops", "Girls' skirts", "Girls' trousers", "Girls' jackets", "Girls' shoes", "Girls' accessories",
    ],
  },
};

type Props = { params: Promise<{ collection: string }> };

export function generateStaticParams() {
  return [
    { collection: 'boys' },
    { collection: 'girls' },
    { collection: 'unisex-kids' },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params;
  const selected = collections[collection as keyof typeof collections];
  return { title: selected ? (selected.title === 'Boys' || selected.title === 'Girls' ? `${selected.title} Kids` : selected.title) : 'Kids' };
}

export default async function KidsCollection({ params }: Props) {
  const { collection: slug } = await params;
  const selected = collections[slug as keyof typeof collections];
  if (!selected) notFound();

  const products = await getCatalogProducts();
  return (
    <>
      <section className="kids-collection-banner">
        <Image src={selected.image} alt={`${selected.title} fashion editorial`} fill priority sizes="100vw" />
        <div>
          <p className="eyebrow light">{selected.eyebrow}</p>
          <h1>{selected.title}<br /><em>with character.</em></h1>
          <p>{selected.intro}</p>
        </div>
      </section>
      <CataloguePage
        products={products}
        eyebrow={selected.eyebrow}
        title={`${selected.title} collection`}
        intro="Explore the pieces currently available from DIOC Kids."
        initialAudience={selected.audience}
        categoryOptions={selected.categories}
      />
    </>
  );
}
