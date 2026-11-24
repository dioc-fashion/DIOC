import type { Metadata } from 'next';
import './globals.css';
import './premium.css';
import { SiteChrome } from '@/components/SiteChrome';
import { StoreProvider } from '@/components/StoreProvider';
import { siteUrl } from '@/lib/config';

export const metadata: Metadata = {
  title: { default: 'DIOC | Timeless Style. Modern Elegance.', template: '%s | DIOC' },
  description: 'DIOC is a premium contemporary fashion house in Kenya.',
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  openGraph: { type: 'website', locale: 'en_KE', siteName: 'DIOC', images: ['/og-dioc.png'] },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <StoreProvider>
          <SiteChrome>{children}</SiteChrome>
        </StoreProvider>
      </body>
    </html>
  );
}
