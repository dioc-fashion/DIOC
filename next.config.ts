import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
  { protocol: 'https', hostname: 'images.unsplash.com' },
];
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  remotePatterns.push({ protocol: 'https', hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname });
}

const nextConfig: NextConfig = isGitHubPages
  ? {
      output: 'export',
      basePath: basePath || undefined,
      trailingSlash: true,
      images: { loader: 'custom', loaderFile: './lib/image-loader.ts', remotePatterns },
    }
  : {
      outputFileTracingRoot: process.cwd(),
      images: { remotePatterns },
    };

if (!isGitHubPages) initOpenNextCloudflareForDev();

export default nextConfig;
