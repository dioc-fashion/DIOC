import { notFound } from 'next/navigation';

const pages: Record<string, { eyebrow: string; title: string; body: string }> = {
  about: { eyebrow: 'Our story', title: 'A modern house of style.', body: 'DIOC is building a wardrobe for people who appreciate clarity, character and longevity. Business history and official company information must be confirmed by the owner before launch.' },
  faq: { eyebrow: 'Client care', title: 'Frequently asked questions.', body: 'Product availability, payment, delivery and returns need to be confirmed in the final business policy. Until then, our team can answer individual questions through WhatsApp.' },
  'size-guide': { eyebrow: 'DIOC fit', title: 'Find your size.', body: 'Final garment measurements and fit notes must be supplied by the DIOC buying team before publishing a customer size guide.' },
  privacy: { eyebrow: 'Privacy', title: 'Your privacy matters.', body: 'This page is an editable template placeholder. Obtain approved privacy wording for your business, including data controller details and customer rights, before launch.' },
};

export default async function StaticPage({ params }: { params: Promise<{ page: string }> }) {
  const page = pages[(await params).page];
  if (!page) notFound();
  return (
    <main className="simple-page">
      <p className="eyebrow">{page.eyebrow}</p>
      <h1>{page.title}</h1>
      <p>{page.body}</p>
    </main>
  );
}
