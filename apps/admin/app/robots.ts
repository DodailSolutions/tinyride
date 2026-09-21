import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/drivers', '/routes', '/schools', '/bookings', '/trips', '/incidents', '/cms'],
      },
    ],
    sitemap: 'https://tinyride.in/sitemap.xml',
  };
}
