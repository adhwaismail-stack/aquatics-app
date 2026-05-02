import type { Metadata } from "next";
import Link from "next/link";
import { diving } from "@/data/disciplines/diving";
import FAQAccordion from "@/app/components/FAQAccordion";
import DivingDemoChat from "@/app/components/DivingDemoChat";

const d = diving;
const url = "https://aquaref.co/" + d.slug;

export const metadata: Metadata = {
  title: d.metaTitle,
  description: d.metaDescription,
  alternates: { canonical: url },
  openGraph: {
    title: d.name + " Rules - Ask Anything | AquaRef",
    description: d.metaDescription,
    url: url,
    images: ["https://aquaref.co" + d.ogImagePath],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: d.name + " Rules - Ask Anything | AquaRef",
    description: d.metaDescription,
    images: ["https://aquaref.co" + d.ogImagePath],
  },
};

const otherDisciplines = [
  { slug: "swimming", name: "Swimming", num: "01" },
  { slug: "water-polo", name: "Water Polo", num: "02" },
  { slug: "open-water", name: "Open Water", num: "03" },
  { slug: "artistic-swimming", name: "Artistic Swimming", num: "04" },
  { slug: "high-diving", name: "High Diving", num: "06" },
  { slug: "masters-swimming", name: "Masters Swimming", num: "07" },
  { slug: "para-swimming", name: "Para Swimming", num: "08" },
];

export default function DivingPage() {
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: d.name + " Rules - Ask Anything",
    description: d.metaDescription,
    url: url,
    datePublished: d.datePublished,
    dateModified: d.dateModified,
    author: { "@type": "Organization", name: "AquaRef", url: "https://aquaref.co" },
    publisher: { "@type": "Organization", name: "AquaRef", url: "https://aquaref.co" },
  };

  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: d.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer + " (Cited: World Aquatics " + f.cite + ")",
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://aquaref.co" },
      { "@type": "ListItem", position: 2, name: d.name, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="bg-aqua-paper text-aqua-ink font-body">

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

        <section className="border-b border-aqua-rule">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
            <div className="font-cite text-xs text-aqua-pool-deep tracking-widest mb-8">
              DIVE 05 — {d.heroEyebrow}
            </div>
            <h1 className="font-display text-5xl sm:text-7xl leading-tight mb-7 max-w-4xl">
              {d.name} Rules — Ask Anything
            </h1>
            <p className="text-lg sm:text-xl text-aqua-ink-soft max-w-2xl mb-10">
              {d.heroSub}
            </p>
            <div className="flex gap-3 flex-wrap">
              <a href="#demo" className="px-7 py-4 text-base font-medium rounded-full bg-aqua-pool text-white">
                Try it free — 2 questions
              </a>
              <Link href="/pricing" className="px-7 py-4 text-base font-medium rounded-full text-aqua-ink hover:bg-aqua-ink/5">
                See pricing
              </Link>
            </div>
          </div>
        </section>

        <section id="demo" className="bg-aqua-ink text-aqua-paper py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="font-cite text-xs tracking-widest text-aqua-pool mb-6">LIVE DEMO</div>
            <h2 className="font-display text-4xl sm:text-5xl mb-5 max-w-2xl">
              Ask a question. Get a sourced answer.
            </h2>
            <p className="text-aqua-paper/70 max-w-2xl mb-12 text-lg">
              Two free questions, no signup required. Each answer cites the specific World Aquatics article it draws from.
            </p>
            <DivingDemoChat placeholder={d.demoPlaceholder} suggestedQuestions={d.suggestedQuestions} />
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="font-cite text-xs text-aqua-pool-deep tracking-widest mb-4">05 — KEY CALLS</div>
            <h2 className="font-display text-4xl sm:text-5xl max-w-3xl mb-6">
              {d.sectionHeading}
            </h2>
            <p className="max-w-2xl text-aqua-ink-soft text-lg mb-14">
              {d.sectionLead}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-aqua-ink">
              {d.dqReasons.map((r) => (
                <article key={r.num} className="p-9 border-b border-r border-aqua-rule">
                  <div className="font-cite text-xs tracking-widest text-aqua-flag mb-3">
                    {r.num} — {r.category}
                  </div>
                  <h3 className="font-display text-xl leading-tight mb-3">
                    {r.title}
                  </h3>
                  <p className="text-sm text-aqua-ink-soft leading-relaxed mb-4">{r.body}</p>
                  <span className="inline-block font-cite text-xs text-aqua-pool-deep px-2 py-1 bg-aqua-pool-tint rounded">
                    {r.cite}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-aqua-paper-deep py-24">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="font-cite text-xs text-aqua-pool-deep tracking-widest mb-4">03 — FAQ</div>
            <h2 className="font-display text-4xl sm:text-5xl max-w-3xl mb-6">
              Real questions parents, coaches, and officials actually ask.
            </h2>
            <p className="max-w-2xl text-aqua-ink-soft text-lg mb-14">
              Each answer is grounded in a specific World Aquatics article. Tap any to expand.
            </p>
            <FAQAccordion faqs={d.faqs} />
          </div>
        </section>

        <section className="py-20 border-y border-aqua-rule">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-3 gap-12">
            <div>
              <div className="font-cite text-xs tracking-widest text-aqua-ink-soft mb-3">REVIEWED BY</div>
              <div className="font-display text-xl leading-tight">
                World Aquatics Certified Technical Officials
              </div>
            </div>
            <div>
              <div className="font-cite text-xs tracking-widest text-aqua-ink-soft mb-3">SOURCE</div>
              <div className="font-display text-xl leading-tight">
                {d.rulebookName}
              </div>
            </div>
            <div>
              <div className="font-cite text-xs tracking-widest text-aqua-ink-soft mb-3">LAST REVIEWED</div>
              <div className="font-display text-xl leading-tight">
                May 2, 2026
              </div>
            </div>
          </div>
        </section>

        <section className="bg-aqua-ink text-aqua-paper py-24">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center">
            <h2 className="font-display text-5xl sm:text-7xl max-w-2xl mx-auto leading-tight mb-5">
              Stop guessing. Start knowing.
            </h2>
            <p className="text-aqua-paper/70 max-w-xl mx-auto mb-12 text-lg">
              Three plans, every one of them grounded in the same regulations the officials use on deck.
            </p>
            <Link href="/signup" className="inline-block bg-aqua-pool text-white px-9 py-4 text-base font-medium rounded-full">
              Start free trial — 7 days
            </Link>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="font-cite text-xs text-aqua-pool-deep tracking-widest mb-4">04 — DISCIPLINES</div>
            <h2 className="font-display text-4xl sm:text-5xl max-w-2xl mb-14">
              Explore the other seven aquatic codes.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-aqua-ink">
              {otherDisciplines.map((o) => (
                <Link
                  key={o.slug}
                  href={"/" + o.slug}
                  className="p-7 border-b border-r border-aqua-rule hover:bg-aqua-paper-deep flex flex-col gap-2"
                >
                  <div className="font-cite text-xs text-aqua-ink-soft tracking-widest">{o.num}</div>
                  <h3 className="font-display text-xl leading-tight">{o.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

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

