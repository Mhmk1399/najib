/**
 * faq-json-ld.tsx — Server Component
 *
 * Generates FAQPage JSON-LD from the visible FAQ items.
 * All schema generation happens on the server — no client-side computation.
 * No "use client".
 *
 * IMPORTANT: Only one FaqSection per page should have includeSchema=true.
 * Multiple FAQPage blocks on one page may cause search engine warnings.
 */

import type { FaqAnswer, FaqAnswerBlock, FaqItem } from "./faq.types";

// ---------------------------------------------------------------------------
// Answer block → plain text
// ---------------------------------------------------------------------------

/**
 * Converts one answer block to a plain text string.
 * Used for schema "text" fields — no HTML markup allowed.
 */
function blockToText(block: FaqAnswerBlock): string {
  switch (block.type) {
    case "paragraph":
      return block.text;

    case "unordered-list":
      return block.items.join(" — ");

    case "ordered-list":
      return block.items.map((item, i) => `${i + 1}. ${item}`).join(" ");

    case "link": {
      const parts: string[] = [];
      if (block.leadingText) parts.push(block.leadingText);
      parts.push(block.label);
      return parts.join(" ");
    }
  }
}

/**
 * Converts an FaqAnswer (string or block array) to a plain readable string
 * suitable for the schema "text" field.
 */
function answerToPlainText(answer: FaqAnswer): string {
  if (typeof answer === "string") return answer;
  return answer.map(blockToText).join(" ");
}

/**
 * Safely serialize the schema to a JSON string.
 * Replaces '<' with '\u003c' to prevent script injection.
 */
function serializeSchema(schema: Record<string, unknown>): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FaqJsonLdProps {
  items: readonly FaqItem[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FaqJsonLd({ items }: FaqJsonLdProps): React.JSX.Element | null {
  if (items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answerToPlainText(item.answer),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled static server-generated schema
      dangerouslySetInnerHTML={{ __html: serializeSchema(schema) }}
    />
  );
}
