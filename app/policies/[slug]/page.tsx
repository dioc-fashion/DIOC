import { notFound } from 'next/navigation';

const policies: Record<string, { title: string; content: string }> = {
  shipping: { title: 'Shipping & delivery', content: 'Delivery coverage, collection options, rates, timelines, courier partners and tracking process must be supplied and approved by DIOC before publishing. No delivery fees are currently represented as promises.' },
  returns: { title: 'Returns & exchanges', content: 'Returns eligibility, timeframe, condition requirements and refund process require business owner approval before this policy may be published.' },
  terms: { title: 'Terms & conditions', content: 'This is an editable policy placeholder. Engage appropriate legal review and add the DIOC company details before launch.' },
  payments: { title: 'Payment information', content: 'WhatsApp orders can be confirmed manually. M-Pesa payment initiation is intentionally not activated until Daraja credentials and callback verification are complete.' },
};

export default async function Policy({ params }: { params: Promise<{ slug: string }> }) {
  const policy = policies[(await params).slug];
  if (!policy) notFound();
  return (
    <main className="simple-page">
      <p className="eyebrow">DIOC policies</p>
      <h1>{policy.title}</h1>
      <p>{policy.content}</p>
    </main>
  );
}
