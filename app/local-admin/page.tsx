import Link from 'next/link';
import './local-admin.css';

export const metadata = {
  title: 'Local Administration | DIOC',
  robots: { index: false, follow: false },
};

export default function LocalAdminNotice() {
  return (
    <main className="local-admin-page">
      <section className="local-admin-card">
        <p className="local-admin-eyebrow">DIOC · PRIVATE WORKSPACE</p>
        <h1>Store management,<br /><em>now on your laptop.</em></h1>
        <p>The cloud-based admin portal has been retired. Use DIOC Local Administration on your Windows laptop to manage products, photos, inventory, customers, orders and backups offline.</p>
        <p>Your public storefront remains online independently. Local changes only reach it when you deliberately export and publish a catalogue.</p>
        <Link href="/" className="local-admin-link">Return to the DIOC storefront</Link>
        <small>Existing online catalogue data has not been deleted.</small>
      </section>
    </main>
  );
}
