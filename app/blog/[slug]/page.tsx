import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalculatorCta } from "@/components/blog/CalculatorCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatPostDate, getPost, posts } from "@/lib/blog";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const base = buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    hasOwnSocialImage: true,
  });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.published,
      modifiedTime: post.updated,
      authors: [site.author.name],
    },
  };
}

export default async function BlogPostPage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const path = `/blog/${post.slug}`;
  const { Body } = post;
  const structuredData: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      datePublished: post.published,
      dateModified: post.updated,
      mainEntityOfPage: `${site.url}${path}`,
      author: {
        "@type": "Person",
        name: site.author.name,
        url: `${site.url}/about`,
      },
      publisher: { "@type": "Organization", name: site.name, url: site.url },
    },
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/blog" },
      { name: post.title, path },
    ]),
  ];
  if (post.faqs?.length) structuredData.push(faqJsonLd(post.faqs));

  const updatedLater = post.updated !== post.published;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <JsonLd data={structuredData} />

      <nav
        aria-label="Breadcrumb"
        className="text-xs text-slate-500 dark:text-slate-400"
      >
        <ol className="flex items-center gap-1.5">
          <li>
            <Link
              href="/"
              className="hover:text-slate-900 dark:hover:text-slate-50"
            >
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href="/blog"
              className="hover:text-slate-900 dark:hover:text-slate-50"
            >
              Guides
            </Link>
          </li>
        </ol>
      </nav>

      <header className="mt-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
          {post.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
          {post.description}
        </p>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          By{" "}
          <Link
            href="/about"
            className="font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200"
          >
            {site.author.name}
          </Link>{" "}
          &middot; {updatedLater ? "Updated" : "Published"}{" "}
          <time dateTime={updatedLater ? post.updated : post.published}>
            {formatPostDate(updatedLater ? post.updated : post.published)}
          </time>{" "}
          &middot; {post.readingMinutes} min read
        </p>
      </header>

      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 [&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2 dark:[&_a]:text-blue-400 [&_em]:italic [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 dark:[&_h2]:text-slate-50 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 dark:[&_h3]:text-slate-50 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_strong]:text-slate-900 dark:[&_strong]:text-slate-50 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        <Body />
      </div>

      {post.faqs && post.faqs.length > 0 && (
        <section aria-labelledby="faq-heading" className="mt-12">
          <h2
            id="faq-heading"
            className="text-xl font-semibold text-slate-900 dark:text-slate-50"
          >
            Frequently asked questions
          </h2>
          <dl className="mt-4 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {post.faqs.map((faq) => (
              <div key={faq.question} className="py-4">
                <dt className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {faq.question}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section aria-labelledby="sources-heading" className="mt-10">
        <h2
          id="sources-heading"
          className="text-base font-semibold text-slate-900 dark:text-slate-50"
        >
          Sources
        </h2>
        <ul className="mt-2 space-y-1 text-sm">
          {post.sources.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-400"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          This guide is general information, not{" "}
          {post.category === "health" ? "medical" : "financial"} advice. See{" "}
          <Link href="/methodology" className="underline underline-offset-2">
            how we calculate
          </Link>{" "}
          for the formulas behind every figure.
        </p>
      </section>

      <section
        aria-labelledby="try-heading"
        className="mt-10 border-t border-slate-200 pt-8 dark:border-slate-800"
      >
        <h2
          id="try-heading"
          className="text-base font-semibold text-slate-900 dark:text-slate-50"
        >
          Try the calculators
        </h2>
        {post.calculators.map((calculator) => (
          <CalculatorCta key={calculator} slug={calculator} />
        ))}
      </section>
    </article>
  );
}
