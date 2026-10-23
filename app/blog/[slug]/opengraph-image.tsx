import { notFound } from "next/navigation";
import { getPost, posts } from "@/lib/blog";
import { renderSocialCard, socialImageSize } from "@/lib/og/socialCard";
import { site } from "@/lib/site";

export const alt = `A guide from ${site.name}`;
export const size = socialImageSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return renderSocialCard({
    eyebrow: `${post.category === "finance" ? "Money" : "Health"} guide · ${post.readingMinutes} min read`,
    title: post.title,
  });
}
