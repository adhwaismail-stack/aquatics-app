import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import SwimmingDemoChat from "@/app/components/SwimmingDemoChat";

// Tells Next.js to revalidate the page every hour (Incremental Static Regeneration)
export const revalidate = 3600;

// Discipline display names (hyphenated slug → human readable)
const DISCIPLINE_NAMES: Record<string, string> = {
  "swimming": "Swimming",
  "water-polo": "Water Polo",
  "open-water": "Open Water",
  "artistic-swimming": "Artistic Swimming",
  "diving": "Diving",
  "high-diving": "High Diving",
  "masters-swimming": "Masters Swimming",
  "para-swimming": "Para Swimming",
};

// Reviewer type
type Reviewer = {
  display_name: string;
  credential_title: string;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
};

// Q&A page type
type QAPage = {
  id: string;
  discipline: string;
  slug: string;
  canonical_question: string;
  answer_short: string | null;
  answer_full: string | null;
  rule_citation: string | null;
  rule_quote: string | null;
  meta_description: string | null;
  published_at: string | null;
  last_updated_at: string | null;
  reviewer: Reviewer | null;
};

// Fetch a single Q&A page by discipline + slug
async function getQAPage(discipline: string, slug: string): Promise<QAPage | null> {
  const { data, error } = await supabase
    .from("qa_pages")
    .select(`
      id, discipline, slug, canonical_question,
      answer_short, answer_full, rule_citation, rule_quote,
      meta_description, published_at, last_updated_at,
      reviewer:reviewers!reviewer_id (
        display_name, credential_title, bio, photo_url, linkedin_url
      )
    `)
    .eq("discipline", discipline)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;

  // Supabase returns reviewer as array even on single FK; flatten it
  const reviewerData = Array.isArray(data.reviewer) ? data.reviewer[0] : data.reviewer;

  return { ...data, reviewer: reviewerData ?? null } as QAPage;
}

// Fetch up to 5 related Q&As from same discipline
async function getRelatedQAs(discipline: string, currentId: string) {
  const { data } = await supabase
    .from("qa_pages")
    .select("slug, canonical_question")
    .eq("discipline", discipline)
    .eq("status", "published")
    .neq("id", currentId)
    .order("published_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

// Generate per-page metadata for SEO
export async function generateMetadata(
  { params }: { params: Promise<{ discipline: string; slug: string }> }
): Promise<Metadata> {
  const { discipline, slug } = await params;
  const qa = await getQAPage(discipline, slug);

  if (!qa) {
    return { title: "Question not found | AquaRef" };
  }

  const url = `https://aquaref.co/${discipline}/q/${slug}`;
  const description = qa.meta_description || qa.answer_short || `${qa.canonical_question} - answered by AquaRef.`;

  return {
    title: `${qa.canonical_question} | AquaRef`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: qa.canonical_question,
      description,
      url,
      type: "article",
      publishedTime: qa.published_at ?? undefined,
      modifiedTime: qa.last_updated_at ?? undefined,
      authors: qa.reviewer ? [qa.reviewer.display_name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: qa.canonical_question,
      description,
    },
    robots: { index: true, follow: true, "max-image-preview": "large" } as Metadata["robots"],
  };
}

export default async function QAPage(
  { params }: { params: Promise<{ discipline: string; slug: string }> }
) {
  const { discipline, slug } = await params;

  // 404 for unknown disciplines
  if (!DISCIPLINE_NAMES[discipline]) notFound();

  const qa = await getQAPage(discipline, slug);
  if (!qa) notFound();

  const disciplineName = DISCIPLINE_NAMES[discipline];
  const url = `https://aquaref.co/${discipline}/q/${slug}`;
  const relatedQAs = await getRelatedQAs(discipline, qa.id);

  // Format the last reviewed date
  const lastReviewed = qa.last_updated_at
    ? new Date(qa.last_updated_at).toLocaleDateString("en-MY", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "Recently";

  // QAPage schema for rich results
  const qaSchema = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: qa.canonical_question,
      text: qa.canonical_question,
      answerCount: 1,
      datePublished: qa.published_at,
      dateModified: qa.last_updated_at,
      author: { "@type": "Organization", name: "AquaRef" },
      acceptedAnswer: {
        "@type": "Answer",
        text: qa.answer_full ?? qa.answer_short ?? "",
        datePublished: qa.published_at,
        author: qa.reviewer
          ? {
              "@type": "Person",
              name: qa.reviewer.display_name,
              jobTitle: qa.reviewer.credential_title,
              ...(qa.reviewer.linkedin_url && { url: qa.reviewer.linkedin_url }),
            }
          : { "@type": "Organization", name: "AquaRef" },
        ...(qa.rule_citation && { citation: qa.rule_citation }),
      },
    },
  };

  // BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://aquaref.co" },
      { "@type": "ListItem", position: 2, name: disciplineName, item: `https://aquaref.co/${discipline}` },
      { "@type": "ListItem", position: 3, name: "Q&A", item: `https://aquaref.co/${discipline}/q` },
      { "@type": "ListItem", position: 4, name: qa.canonical_question, item: url },
    ],
  };

  // Person schema (E-E-A-T signal)
  const personSchema = qa.reviewer
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: qa.reviewer.display_name,
        jobTitle: qa.reviewer.credential_title,
        url: "https://aquaref.co/about/reviewers",
        ...(qa.reviewer.photo_url && { image: qa.reviewer.photo_url }),
        ...(qa.reviewer.linkedin_url && { sameAs: [qa.reviewer.linkedin_url] }),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(qaSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {personSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      )}

      <main className="bg-aqua-paper text-aqua-ink font-body">

        {/* Header */}
        <header className="sticky top-0 z-50 bg-aqua-paper border-b border-aqua-rule">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <nav className="flex items-center justify-between h-18 py-4">
              <Link href="/" className="font-display text-2xl font-medium tracking-tight">
                AquaRef
              </Link>
              <div className="flex gap-3 items-center">
                <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-full hover:bg-aqua-ink/5">Log in</Link>
                <Link href="/signup" className="text-sm font-medium px-4 py-2 rounded-full bg-aqua-ink text-aqua-paper">Sign up</Link>
              </div>
            </nav>
          </div>
        </header>

        {/* Breadcrumbs */}
        <section className="border-b border-aqua-rule">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4">
            <nav className="font-cite text-xs tracking-widest text-aqua-ink-soft" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-aqua-pool-deep">HOME</Link>
              <span className="mx-2">/</span>
              <Link href={`/${discipline}`} className="hover:text-aqua-pool-deep">{disciplineName.toUpperCase()}</Link>
              <span className="mx-2">/</span>
              <span className="text-aqua-pool-deep">Q&A</span>
            </nav>
          </div>
        </section>

        {/* Hero — the Question */}
        <section className="border-b border-aqua-rule">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <div className="font-cite text-xs text-aqua-pool-deep tracking-widest mb-8">
              {disciplineName.toUpperCase()} — Q&A
            </div>
            <h1 className="font-display text-3xl sm:text-5xl leading-tight mb-8">
              {qa.canonical_question}
            </h1>
            <div className="font-cite text-xs tracking-widest text-aqua-ink-soft">
              LAST REVIEWED — {lastReviewed.toUpperCase()}
            </div>
          </div>
        </section>

        {/* Lead Answer (above-fold) */}
        {qa.answer_short && (
          <section className="border-b border-aqua-rule bg-aqua-paper-deep">
            <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
              <div className="font-cite text-xs tracking-widest text-aqua-pool-deep mb-4">
                THE SHORT ANSWER
              </div>
              <p className="font-display text-xl sm:text-2xl leading-relaxed text-aqua-ink">
                {qa.answer_short}
              </p>
            </div>
          </section>
        )}

        {/* Full Answer */}
        {qa.answer_full && (
          <section className="py-16 sm:py-20">
            <div className="max-w-4xl mx-auto px-5 sm:px-8">
              <div className="font-cite text-xs tracking-widest text-aqua-pool-deep mb-6">
                THE FULL EXPLANATION
              </div>
              <div className="prose prose-lg max-w-none text-aqua-ink-soft leading-relaxed">
                {qa.answer_full.split("\n\n").map((para, i) => (
                  <p key={i} className="text-base sm:text-lg leading-relaxed mb-6">{para}</p>
                ))}
              </div>

              {/* Rule citation block */}
              {qa.rule_citation && (
                <aside className="mt-10 border-l-2 border-aqua-pool pl-6 py-2">
                  <div className="font-cite text-xs tracking-widest text-aqua-pool-deep mb-2">
                    CITED RULE — {qa.rule_citation}
                  </div>
                  {qa.rule_quote && (
                    <p className="font-body text-sm sm:text-base text-aqua-ink-soft italic">
                      &ldquo;{qa.rule_quote}&rdquo;
                    </p>
                  )}
                </aside>
              )}
            </div>
          </section>
        )}

        {/* Reviewer trust block */}
        {qa.reviewer && (
          <section className="py-16 border-y border-aqua-rule">
            <div className="max-w-4xl mx-auto px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-3 gap-12">
              <div>
                <div className="font-cite text-xs tracking-widest text-aqua-ink-soft mb-3">REVIEWED BY</div>
                <div className="font-display text-xl leading-tight mb-2">{qa.reviewer.display_name}</div>
                <div className="text-sm text-aqua-ink-soft">{qa.reviewer.credential_title}</div>
              </div>
              <div>
                <div className="font-cite text-xs tracking-widest text-aqua-ink-soft mb-3">SOURCE</div>
                <div className="font-display text-xl leading-tight">
                  Official World Aquatics {disciplineName} Regulations
                </div>
              </div>
              <div>
                <div className="font-cite text-xs tracking-widest text-aqua-ink-soft mb-3">DISCLAIMER</div>
                <div className="text-sm text-aqua-ink-soft leading-relaxed">
                  Always verify with the Meet Referee. Rules may have updated since last review.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Try AquaRef CTA — embeds the demo */}
        <section id="demo" className="bg-aqua-ink text-aqua-paper py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="font-cite text-xs tracking-widest text-aqua-pool mb-6">HAVE A DIFFERENT QUESTION?</div>
            <h2 className="font-display text-4xl sm:text-5xl mb-5 max-w-2xl">
              Ask AquaRef. Get a sourced answer.
            </h2>
            <p className="text-aqua-paper/70 max-w-2xl mb-12 text-lg">
              Two free questions, no signup required. Each answer cites the specific World Aquatics article.
            </p>
            <SwimmingDemoChat
              placeholder={`Ask anything about ${disciplineName} rules...`}
              suggestedQuestions={[]}
            />
          </div>
        </section>

        {/* Related questions */}
        {relatedQAs.length > 0 && (
          <section className="py-24">
            <div className="max-w-6xl mx-auto px-5 sm:px-8">
              <div className="font-cite text-xs text-aqua-pool-deep tracking-widest mb-4">RELATED QUESTIONS</div>
              <h2 className="font-display text-3xl sm:text-4xl mb-12 max-w-2xl">
                More {disciplineName} questions answered.
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-aqua-ink">
                {relatedQAs.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/${discipline}/q/${r.slug}`}
                    className="p-7 border-b border-r border-aqua-rule hover:bg-aqua-paper-deep flex flex-col gap-2"
                  >
                    <h3 className="font-display text-lg leading-tight">{r.canonical_question}</h3>
                    <span className="font-cite text-xs text-aqua-pool-deep tracking-widest mt-2">READ ANSWER →</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Discipline pillar link */}
        <section className="py-20 border-t border-aqua-rule">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
            <h2 className="font-display text-3xl sm:text-4xl mb-6">
              Explore all {disciplineName} rules.
            </h2>
            <Link
              href={`/${discipline}`}
              className="inline-block px-9 py-4 text-base font-medium rounded-full bg-aqua-pool text-white"
            >
              {disciplineName} Hub →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-aqua-ink text-aqua-paper/70 py-16">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="font-display text-2xl text-aqua-paper mb-3">AquaRef</div>
            <p className="text-sm max-w-md mb-10">
              The aquatics rulebook, on tap. Reviewed by certified Technical Officials.
            </p>
            <div className="border-t border-white/10 pt-6 text-xs font-cite">
              2026 AquaRef. Built on World Aquatics regulations.
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}