import type { Post } from "./types";
import { post as afford } from "./posts/how-much-house-can-i-afford";
import { post as snowball } from "./posts/debt-snowball-vs-avalanche";
import { post as terms } from "./posts/15-vs-30-year-mortgage";
import { post as pmi } from "./posts/how-to-remove-pmi";
import { post as bmi } from "./posts/is-bmi-accurate";

// Add new articles here. Newest first by published date, then by title.
export const posts: Post[] = [afford, snowball, terms, pmi, bmi].sort(
  (a, b) => b.published.localeCompare(a.published) || a.title.localeCompare(b.title),
);

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
