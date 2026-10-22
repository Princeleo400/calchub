import Link from "next/link";
import { ContentPage } from "@/components/layout/ContentPage";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Terms of Use",
  description: `The terms for using ${site.name}'s free calculators and guides.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms of use"
      intro={
        <p>
          By using {site.name} you agree to these terms. They are written to be
          read, so please take two minutes to do so.
        </p>
      }
      lastUpdated="2026-10-20"
    >
      <h2>Information only, not advice</h2>
      <p>
        {site.name}&apos;s calculators and guides are for general information
        and education. They are not financial, tax, legal or medical advice, and
        they do not take your full circumstances into account.
      </p>
      <p>
        Before making a decision about a loan, a mortgage, debt, your health or
        your diet, check with a qualified professional, such as your lender, a
        financial adviser, a doctor or a registered dietitian. Do not ignore
        professional advice, or delay seeking it, because of something you read
        here.
      </p>

      <h2>Estimates may differ from real figures</h2>
      <p>
        Results depend on the numbers you enter and on simplifying assumptions,
        which are explained on each page and on the{" "}
        <Link href="/methodology">methodology page</Link>. Real loan offers,
        payments, tax and health outcomes can differ. We work hard to keep the
        math correct and the information current, but we cannot guarantee that
        everything is complete, accurate or up to date.
      </p>

      <h2>Using the site</h2>
      <ul>
        <li>
          You may use the calculators freely for personal and business purposes.
        </li>
        <li>
          You may share links to results and quote short passages from our
          guides with a link back to the page.
        </li>
        <li>
          Please don&apos;t copy whole pages, scrape the site in bulk, interfere
          with how it runs, or try to gain access to parts of it that
          aren&apos;t public.
        </li>
      </ul>

      <h2>Content and ownership</h2>
      <p>
        The site&apos;s design, text and code belong to {site.author.name}{" "}
        unless stated otherwise. Formulas and facts we cite belong to their
        original sources, which are credited on each page.
      </p>

      <h2>Links and ads</h2>
      <p>
        The site links to other websites and shows ads from third parties. We
        are not responsible for their content, products or practices, and a link
        or an ad is not an endorsement.
      </p>

      <h2>No warranty and limits on liability</h2>
      <p>
        The site is provided &ldquo;as is&rdquo;, without warranties of any
        kind. To the fullest extent the law allows, {site.author.name} is not
        liable for any loss or damage arising from your use of, or reliance on,
        the site or its results. Nothing in these terms limits liability that
        cannot be limited by law.
      </p>

      <h2>Changes</h2>
      <p>
        We may update the site and these terms from time to time. The date at
        the top shows when the terms last changed, and continuing to use the
        site means you accept the current version.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> or see
        our <Link href="/contact">contact page</Link>.
      </p>
    </ContentPage>
  );
}
