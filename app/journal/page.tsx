import Image from 'next/image';
import Link from 'next/link';

const stories = [
  ['The new ease of tailoring', 'A quiet guide to balance, proportion and pieces that stay with you.', 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1100&q=85'],
  ['A wardrobe in considered shades', 'Why the right neutral is never simply neutral.', 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1100&q=85'],
  ['Notes from the atelier', 'The details and decisions behind a future DIOC collection.', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1100&q=85'],
];

export default function Journal() {
  return (
    <main className="catalogue">
      <p className="eyebrow">DIOC Journal</p>
      <h1>Notes on a<br /><em>considered life.</em></h1>
      <div className="story-grid">
        {stories.map(([title, copy, image]) => (
          <article className="story" key={title}>
            <Image src={image} alt="" width={1100} height={825} sizes="(max-width: 800px) 90vw, 30vw" />
            <p className="eyebrow">Style notes</p>
            <h2>{title}</h2>
            <p>{copy}</p>
            <Link className="underlink" href="/contact">Read story <span>→</span></Link>
          </article>
        ))}
      </div>
    </main>
  );
}
