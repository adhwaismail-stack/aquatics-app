import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://aquaref.co'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  // 1. Static public pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ]

  // 2. Public discipline landing pages (SEO)
  const disciplines = [
    'swimming',
    'water-polo',
    'open-water',
    'artistic-swimming',
    'diving',
    'high-diving',
    'masters-swimming',
    'para-swimming',
  ]

  const disciplinePages: MetadataRoute.Sitemap = disciplines.map((d) => ({
    url: `${BASE_URL}/${d}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // 3. Active event pages
  let eventPages: MetadataRoute.Sitemap = []
  try {
    const { data: events } = await supabase
      .from('events')
      .select('slug, updated_at')
      .eq('is_active', true)
    if (events) {
      eventPages = events.map((e) => ({
        url: `${BASE_URL}/events/${e.slug}`,
        lastModified: new Date(e.updated_at || new Date()),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }))
    }
  } catch {
    // Silently skip if DB unavailable during build
  }

  // 4. Active announcement pages
  let announcementPages: MetadataRoute.Sitemap = []
  try {
    const { data: announcements } = await supabase
      .from('announcements')
      .select('slug, created_at')
      .eq('is_active', true)
      .not('slug', 'is', null)
    if (announcements) {
      announcementPages = announcements
        .filter((a) => a.slug)
        .map((a) => ({
          url: `${BASE_URL}/announcements/${a.slug}`,
          lastModified: new Date(a.created_at || new Date()),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }))
    }
  } catch {
    // Silently skip if DB unavailable during build
  }

  // 5. Future: programmatic Q&A pages
  // When ready, fetch from a `qa_pages` table and add here.

  // Combine all
  return [
    ...staticPages,
    ...disciplinePages,
    ...eventPages,
    ...announcementPages,
  ]
}