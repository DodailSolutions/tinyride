import { MetadataRoute } from 'next';
import { ARTICLES_DATA } from '@/components/landing/KnowledgeHubSection';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tinyride.in';

  // Core static landing pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // Blog and safety guide articles
  const blogPages: MetadataRoute.Sitemap = ARTICLES_DATA.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...blogPages];
}
