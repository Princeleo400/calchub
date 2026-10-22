import Link from "next/link";
import { Mail } from "lucide-react";
import { ContentPage } from "@/components/layout/ContentPage";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Contact",
  description: `Get in touch with ${site.name} to report an error, suggest a calculator or ask a question.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact"
      intro={
        <p>
          Found an error, want a new calculator, or have a question about the
          site? I read every message.
        </p>
      }
    >
      <a
        href={`mailto:${site.contactEmail}`}
        className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 no-underline! transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-900"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Mail className="size-5" aria-hidden />
        </span>
        <span>
          <span className="block text-sm font-semibold text-slate-900 dark:text-slate-50">
            Email
          </span>
          <span className="block text-sm text-blue-600 dark:text-blue-400">
            {site.contactEmail}
          </span>
        </span>
      </a>

      <h2>Reporting an error</h2>
      <p>To help me check it quickly, please include:</p>
      <ul>
        <li>
          which calculator you used (or paste the share link, which includes
          your inputs)
        </li>
        <li>the result you got and what you expected</li>
        <li>
          where your expected figure comes from, such as a lender&apos;s
          statement
        </li>
      </ul>
      <p>
        Confirmed errors are fixed and the page&apos;s review date updated. See{" "}
        <Link href="/methodology">how we calculate</Link> for the formulas
        behind each result.
      </p>

      <h2>Please note</h2>
      <p>
        I can&apos;t give personal financial, tax or medical advice. For
        decisions about your own situation, talk to your lender, a financial
        adviser, a doctor or a registered dietitian.
      </p>
    </ContentPage>
  );
}
