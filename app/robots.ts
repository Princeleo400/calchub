import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Vercel sets VERCEL_ENV to "preview" for branch and pull request builds.
// Those copies of the site are kept out of search results so they never
// compete with the real domain.
const isPreviewBuild =
  process.env.VERCEL_ENV !== undefined &&
  process.env.VERCEL_ENV !== "production";

export default function robots(): MetadataRoute.Robots {
  if (isPreviewBuild) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
