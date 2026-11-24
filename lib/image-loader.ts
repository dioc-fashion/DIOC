import { withBasePath } from './base-path';

type LoaderProps = { src: string; width: number; quality?: number };

// GitHub Pages has no image optimisation server: serve files directly,
// prefixing local paths with the base path and sizing Unsplash images by URL.
export default function staticImageLoader({ src, width, quality }: LoaderProps) {
  if (src.startsWith('https://images.unsplash.com/')) {
    const url = new URL(src);
    url.searchParams.set('w', String(width));
    if (quality) url.searchParams.set('q', String(quality));
    return url.toString();
  }
  return withBasePath(src);
}
