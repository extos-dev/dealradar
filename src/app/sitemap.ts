import { MetadataRoute } from 'next';
import { ProductRepository } from '@/lib/repository';


export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://gadgetpulse.example.com';
  const products = ProductRepository.getPublishedProducts();
  const collections = ProductRepository.getCollections();

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const collectionUrls: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${baseUrl}/best/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/deals`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides/how-we-judge-deals`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/disclosure`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...collectionUrls, ...productUrls];
}
