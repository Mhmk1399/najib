/**
 * faq-answer.tsx — Server Component
 *
 * Renders structured FAQ answer content using semantic HTML.
 * Supports paragraphs, lists, and links.
 * No "use client" — no state, no browser APIs.
 * dangerouslySetInnerHTML is intentionally absent.
 */

import Link from "next/link";
import type { FaqAnswer, FaqAnswerBlock } from "./faq.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FaqAnswerProps {
  answer: FaqAnswer;
  locale?: "fa" | "en";
}

// ---------------------------------------------------------------------------
// Block renderers
// ---------------------------------------------------------------------------

function renderBlock(
  block: FaqAnswerBlock,
  index: number,
  locale: "fa" | "en",
): React.JSX.Element {
  const isRTL = locale === "fa";

  switch (block.type) {
    case "paragraph":
      return (
        <p
          key={index}
          className="text-sm sm:text-base font-light leading-relaxed text-[#6C6662] dark:text-[#B8B2AC]"
        >
          {block.text}
        </p>
      );

    case "unordered-list":
      return (
        <ul
          key={index}
          className={[
            "flex flex-col gap-1.5",
            isRTL ? "list-none pe-4" : "list-none ps-4",
          ].join(" ")}
        >
          {block.items.map((item, i) => (
            <li
              key={i}
              className={[
                "flex items-start gap-2",
                "text-sm sm:text-base font-light leading-relaxed",
                "text-[#6C6662] dark:text-[#B8B2AC]",
              ].join(" ")}
            >
              {/* Restrained bullet — not copper */}
              <span
                aria-hidden="true"
                className="mt-2 flex-shrink-0 w-1 h-1 rounded-full bg-[#BDB5AD] dark:bg-[#46515B]"
              />
              {item}
            </li>
          ))}
        </ul>
      );

    case "ordered-list":
      return (
        <ol
          key={index}
          className={[
            "flex flex-col gap-1.5",
            isRTL ? "list-none pe-4" : "list-none ps-4",
          ].join(" ")}
        >
          {block.items.map((item, i) => (
            <li
              key={i}
              className={[
                "flex items-start gap-3",
                "text-sm sm:text-base font-light leading-relaxed",
                "text-[#6C6662] dark:text-[#B8B2AC]",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className="mt-0.5 flex-shrink-0 text-xs tabular-nums text-[#C15427]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {item}
            </li>
          ))}
        </ol>
      );

    case "link": {
      const linkClasses = [
        "text-sm sm:text-base font-light",
        "text-[#231F20] dark:text-[#F8F5F0]",
        "underline underline-offset-2 decoration-[#BDB5AD] dark:decoration-[#46515B]",
        "hover:text-[#A94420] dark:hover:text-[#E18A68]",
        "hover:decoration-[#C15427]",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[#C15427]",
        "dark:focus-visible:ring-[#E18A68]",
        "focus-visible:ring-offset-1",
      ].join(" ");

      const linkElement = block.external ? (
        <a
          key={`link-${index}`}
          href={block.href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClasses}
        >
          {block.label}
        </a>
      ) : (
        <Link key={`link-${index}`} href={block.href} className={linkClasses}>
          {block.label}
        </Link>
      );

      return (
        <p
          key={index}
          className="text-sm sm:text-base font-light text-[#6C6662] dark:text-[#B8B2AC]"
        >
          {block.leadingText && (
            <span className="me-1">{block.leadingText}</span>
          )}
          {linkElement}
        </p>
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FaqAnswer({
  answer,
  locale = "fa",
}: FaqAnswerProps): React.JSX.Element {
  // String answer — render as a single paragraph
  if (typeof answer === "string") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm sm:text-base font-light leading-relaxed text-[#6C6662] dark:text-[#B8B2AC]">
          {answer}
        </p>
      </div>
    );
  }

  // Structured block answer
  return (
    <div className="flex flex-col gap-3">
      {answer.map((block, index) => renderBlock(block, index, locale))}
    </div>
  );
}
