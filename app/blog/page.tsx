import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPostDate, posts } from "@/lib/blog";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Guides: Mortgages, Debt and Health Explained",
  description: `Plain-English guides from ${site.name} on mortgages, paying off debt, BMI and more, with worked examples and official sources.`,
  path: "/blog",
});

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">Guides</h1>
      <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Plain-English explanations with worked examples, built on the same math as our calculators and backed by
        official sources.
      </p>

      <ul className="mt-10 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group block py-6">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {post.category === "finance" ? "Finance" : "Health"} &middot; {post.readingMinutes} min read
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900 transition-colors duration-150 group-hover:text-blue-600 dark:text-slate-50 dark:group-hover:text-blue-400">
                {post.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{post.description}</p>
              <p className="mt-3 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <time dateTime={post.published}>{formatPostDate(post.published)}</time>
                <ArrowRight
                  className="ml-auto size-4 text-slate-400 transition-colors duration-150 group-hover:text-blue-600"
                  aria-hidden
                />
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
