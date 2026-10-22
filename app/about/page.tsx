import Link from "next/link";
import { ContentPage } from "@/components/layout/ContentPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { liveCalculators } from "@/lib/calculators/registry";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";

export const metadata = buildMetadata({
  title: "About",
  description: `Who builds ${site.name}, how the calculators are made and checked, and how the site is funded.`,
  path: "/about",
});

const { author } = site;

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: `${site.url}/about`,
  mainEntity: {
    "@type": "Person",
    name: author.name,
    alternateName: author.brand,
    jobTitle: author.role,
    url: author.url,
  },
};

export default function AboutPage() {
  return (
    <ContentPage
      title="About CalcHub"
      intro={
        <p>
          {site.name} is a set of free calculators for everyday money and health
          questions. Every result comes with the formula behind it and a
          plain-English explanation, with no sign-up and nothing to install.
        </p>
      }
      lastUpdated="2026-10-20"
    >
      <JsonLd data={personJsonLd} />

      <h2>Who builds it</h2>
      <p>
        {site.name} is built and maintained by <strong>{author.name}</strong>, a{" "}
        {author.role.toLowerCase()} based in {author.location} who publishes as{" "}
        {author.url ? <a href={author.url}>{author.brand}</a> : author.brand}. I
        write the calculator code, test the math and write the guides on each
        page.
      </p>
      <p>
        I am a software developer, not a financial adviser, accountant or
        medical professional. That is why every calculator uses published
        formulas, links to the official sources it relies on, and tells you
        plainly when a result is only an estimate.
      </p>

      <h2>Why it exists</h2>
      <p>
        Many calculator sites bury the answer under pop-ups, ask for an email
        address before showing a result, or give you a number with no
        explanation. {site.name} aims to do the opposite: a clean page, an
        instant answer, and enough context to understand what the number means
        and what changes it.
      </p>

      <h2>How the calculators are made</h2>
      <ul>
        <li>
          <strong>Published formulas.</strong> Each calculator uses a standard,
          documented method, such as the fixed-rate amortization formula or the
          Mifflin-St Jeor equation. The{" "}
          <Link href="/methodology">methodology page</Link> lists them all.
        </li>
        <li>
          <strong>Tested against known answers.</strong> The math for every
          calculator has automated tests that check it against published
          reference values before any change goes live.
        </li>
        <li>
          <strong>Official sources.</strong> Guides cite government and academic
          sources such as the CFPB and the CDC, not other calculator sites.
        </li>
        <li>
          <strong>Reviewed and dated.</strong> Each page shows when it was last
          reviewed. Pages that depend on rules that change, such as tax bands,
          are rechecked regularly.
        </li>
      </ul>

      <h2>Your privacy</h2>
      <p>
        Calculations run in your browser. The numbers you enter are not sent to{" "}
        {site.name}&apos;s servers, and your saved history stays on your device.
        See the <Link href="/privacy">privacy policy</Link> for details,
        including how ads and analytics work.
      </p>

      <h2>How the site is funded</h2>
      <p>
        {site.name} is free and paid for by advertising. Ads are kept away from
        the calculators themselves, and advertisers have no say in what the
        calculators show or what the guides say.
      </p>

      <h2>Corrections and feedback</h2>
      <p>
        If you spot an error or think a result looks wrong, please{" "}
        <Link href="/contact">get in touch</Link>. Corrections are checked,
        fixed and the page&apos;s review date updated.
      </p>

      <h2>The calculators</h2>
      <ul>
        {liveCalculators.map((calculator) => (
          <li key={calculator.slug}>
            <Link href={`/${calculator.slug}`}>{calculator.name}</Link>:{" "}
            {calculator.description}
          </li>
        ))}
      </ul>
    </ContentPage>
  );
}
