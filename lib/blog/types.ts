import type { ComponentType } from "react";
import type { FaqItem } from "@/lib/seo/jsonLd";
import type { CalculatorSlug } from "@/lib/types";

/**
 * A guide article. Articles are React components rather than MDX so their
 * worked examples call the same tested math as the calculators and can never
 * drift out of date.
 */
export interface Post {
  slug: string;
  title: string;
  /** Meta description and listing summary: one or two sentences. */
  description: string;
  /** ISO dates. */
  published: string;
  updated: string;
  category: "finance" | "health";
  readingMinutes: number;
  /** Shown as call-to-action cards in and after the article. */
  calculators: CalculatorSlug[];
  faqs?: FaqItem[];
  sources: Array<{ label: string; href: string }>;
  Body: ComponentType;
}
