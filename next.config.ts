import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
  { protocol: 'https', hostname: 'images.unsplash.com' },
];
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  remotePatterns.push({ protocol: 'https', hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname });
}
const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: { remotePatterns },
};

initOpenNextCloudflareForDev();

export default nextConfig;
