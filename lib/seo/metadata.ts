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
  /**
   * Set when the page's folder has its own opengraph-image file. Metadata set
   * here would replace that file's image, so the site-wide image is only
   * added to pages without one.
   */
  hasOwnSocialImage?: boolean;
}

export function buildMetadata({
  title,
  description,
  path,
  noIndex,
  hasOwnSocialImage,
}: BuildMetadataOptions): Metadata {
  const url = `${site.url}${path}`;
  const images = hasOwnSocialImage
    ? undefined
    : [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${site.name}: ${site.tagline}`,
        },
      ];
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
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
      ...(images ? { images } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
