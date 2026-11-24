'use client';

import { useState } from 'react';
import { siteConfig } from '@/lib/config';

export default function Contact() {
  const [sent, setSent] = useState(false);
  function submitEnquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '');
    const email = String(form.get('email') || '');
    const message = String(form.get('message') || '');
    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
    const text = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    if (supportEmail) {
      window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent('DIOC enquiry')}&body=${encodeURIComponent(text)}`;
    } else {
      window.open(siteConfig.whatsappLink(`Hello DIOC, I have an enquiry.\n\n${text}`), '_blank', 'noopener,noreferrer');
    }
    setSent(true);
  }
  return (
    <main className="simple-page">
      <p className="eyebrow">Client care</p>
      <h1>How can we help?</h1>
      <p>For order and product enquiries, our WhatsApp team is the quickest way to reach us. Support email details should be configured before launch.</p>
      <a className="primary" target="_blank" rel="noreferrer" href={siteConfig.whatsappLink('Hello DIOC, I need assistance with an enquiry.')}>WhatsApp DIOC <span>→</span></a>
      <form className="contact-form" onSubmit={submitEnquiry}>
        <label>Name<input required name="name" /></label>
        <label>Email<input required name="email" type="email" /></label>
        <label>Message<textarea required name="message" rows={5} /></label>
        <label className="consent"><input required type="checkbox" /> I agree that DIOC may use my details to respond to this enquiry.</label>
        <button className="primary">Send enquiry</button>
        {sent && <p role="status">Your enquiry is ready in your selected email or WhatsApp application.</p>}
      </form>
    </main>
  );
}
