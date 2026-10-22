import type { Metadata } from "next";
import { site } from "@/lib/site";

interface BuildMetadataOptions {
  /** Page title without the site name; the root layout appends " | CalcHub". */
  title: string;
  description: string;
  /** Path starting with "/", used for the canonical URL. */
  path: string;
  /** Set for pages that should not be indexed (e.g. thank-you pages). */
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path,
  noIndex,
}: BuildMetadataOptions): Metadata {
  const url = `${site.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url,
      title: `${title} | ${site.name}`,
      description,
      siteName: site.name,
      locale: site.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
