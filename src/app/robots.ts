import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/go/', '/admin', '/alerts/'],
      },
    ],
    sitemap: 'https://gadgetpulse.example.com/sitemap.xml',
  };
}
