import type { Metadata } from 'next';
import './globals.css';
import './premium.css';
import { SiteChrome } from '@/components/SiteChrome';
import { StoreProvider } from '@/components/StoreProvider';
import { siteUrl } from '@/lib/config';
import { withBasePath } from '@/lib/base-path';

export const metadata: Metadata = {
  title: { default: 'DIOC | Timeless Style. Modern Elegance.', template: '%s | DIOC' },
  description: 'DIOC is a premium contemporary fashion house in Kenya.',
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: withBasePath('/favicon.svg'), type: 'image/svg+xml' },
      { url: withBasePath('/favicon-32x32.png'), type: 'image/png', sizes: '32x32' },
      { url: withBasePath('/favicon-16x16.png'), type: 'image/png', sizes: '16x16' },
    ],
    apple: [{ url: withBasePath('/apple-touch-icon.png'), sizes: '180x180', type: 'image/png' }],
    shortcut: withBasePath('/favicon.ico'),
  },
  manifest: withBasePath('/site.webmanifest'),
  openGraph: { type: 'website', locale: 'en_KE', siteName: 'DIOC', images: [withBasePath('/og-dioc.png')] },
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
