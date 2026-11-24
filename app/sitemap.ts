import type { MetadataRoute } from 'next';
import { getCatalogProducts } from '@/lib/catalog-server';
import { siteUrl } from '@/lib/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl;
  const products = await getCatalogProducts();
  return [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/women`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/men`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/kids`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/kids/boys`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/kids/girls`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/kids/unisex-kids`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/collections`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/new-arrivals`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    ...products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
