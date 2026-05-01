import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/dashboard',
          '/chat/',
          '/onboarding',
          '/choose-discipline',
          '/atlet/',
        ],
      },
    ],
    sitemap: 'https://aquaref.co/sitemap.xml',
  }
}