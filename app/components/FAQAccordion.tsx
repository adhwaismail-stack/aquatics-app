"use client";

import { useState } from "react";
import type { FAQ } from "@/data/disciplines/swimming";

type Props = {
  faqs: FAQ[];
};

export default function FAQAccordion({ faqs }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="border-t border-aqua-rule">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        const num = String(i + 1).padStart(2, "0");
        const toggleClass = isOpen
          ? "bg-aqua-ink text-aqua-paper border-aqua-ink rotate-45"
          : "";

        return (
          <div key={i} className="border-b border-aqua-rule">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full text-left py-7 grid grid-cols-[60px_1fr_40px] gap-4 items-center cursor-pointer text-aqua-ink"
            >
              <span className="font-cite text-xs text-aqua-pool-deep tracking-widest">
                Q.{num}
              </span>
              <span className="font-display text-lg leading-tight">
                {faq.question}
              </span>
              <span
                aria-hidden="true"
                className={"w-8 h-8 border border-aqua-rule-strong rounded-full flex items-center justify-center font-cite text-base justify-self-end transition-all " + toggleClass}
              >
                +
              </span>
            </button>

            {isOpen ? (
              <div className="pb-8 pl-20 max-w-2xl">
                <p className="text-aqua-ink-soft text-base leading-relaxed mb-3">
                  {faq.answer}
                </p>
                <span className="inline-block font-cite text-xs text-aqua-pool-deep px-2 py-1 bg-aqua-pool-tint rounded mr-3">
                  {faq.cite}
                </span>
                
                <a href="#demo"
                  className="text-sm text-aqua-pool-deep border-b border-aqua-pool pb-px hover:text-aqua-ink hover:border-aqua-ink"
                >
                  Get the full answer
                </a>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}