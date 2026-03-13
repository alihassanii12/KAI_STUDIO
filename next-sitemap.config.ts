// next-sitemap.config.ts
import type { IConfig } from 'next-sitemap'

const config: IConfig = {
  siteUrl: 'https://kai-studio.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/*', '/admin/*'], // Agar koi private pages hain
      },
    ],
    additionalSitemaps: [
      'https://kai-studio.vercel.app/sitemap.xml',
    ],
  },
  exclude: [
    '/404',
    '/500',
    '*/_meta', // Next.js meta files exclude karne ke liye
  ],
  transform: async (config, path) => {
    // Custom transformations agar chahein to
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    }
  },
}

export default config