import type { MetadataRoute } from "next";
import { SALARIES, salarySlug } from "@/lib/affordability/salaries";
import { posts } from "@/lib/blog";
import { liveCalculators, calculatorPath } from "@/lib/calculators/registry";
import { site } from "@/lib/site";

// Every public page. New calculators, salary pages and articles appear here
// automatically because the lists come from the same data the pages use.
export default function sitemap(): MetadataRoute.Sitemap {
  const pageUrl = (path: string) => `${site.url}${path}`;

  const corePages = [
    "/",
    "/blog",
    "/how-much-house-can-i-afford",
    "/nigeria",
  ].map((path) => ({ url: pageUrl(path) }));

  const calculatorPages = liveCalculators.map((calculator) => ({
    url: pageUrl(calculatorPath(calculator)),
  }));

  const salaryPages = SALARIES.map((income) => ({
    url: pageUrl(`/how-much-house-can-i-afford/${salarySlug(income)}`),
  }));

  // Articles carry a real "last updated" date, which helps search engines
  // decide when to recrawl. Other pages leave it out rather than guess.
  const articlePages = posts.map((post) => ({
    url: pageUrl(`/blog/${post.slug}`),
    lastModified: post.updated,
  }));

  const trustPages = [
    "/about",
    "/methodology",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({ url: pageUrl(path) }));

  return [
    ...corePages,
    ...calculatorPages,
    ...salaryPages,
    ...articlePages,
    ...trustPages,
  ];
}
