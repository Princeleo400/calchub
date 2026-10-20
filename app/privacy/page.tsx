import Link from "next/link";
import { ContentPage } from "@/components/layout/ContentPage";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${site.name} handles your data: calculations stay in your browser, plus how advertising and analytics cookies work and how to opt out.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy policy"
      intro={
        <p>
          The short version: the numbers you type into {site.name} stay in your browser. The site uses analytics
          and advertising cookies, explained below, and you can opt out of personalized ads.
        </p>
      }
      lastUpdated="2026-10-20"
    >
      <h2>Who we are</h2>
      <p>
        {site.name} ({site.url.replace(/^https?:\/\//, "")}) is run by {site.author.name}. For any privacy
        question or request, email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>

      <h2>What you enter into calculators</h2>
      <p>
        All calculations happen in your browser. The values you enter, such as a loan amount, your height or your
        debts, are not sent to or stored on {site.name}&apos;s servers.
      </p>
      <ul>
        <li>
          <strong>Your calculation history</strong> is saved in your browser&apos;s local storage so you can return
          to it. It never leaves your device. You can delete it with the &ldquo;Clear all&rdquo; button on any
          calculator, or by clearing your browser&apos;s site data.
        </li>
        <li>
          <strong>Your dark mode choice</strong> is saved the same way.
        </li>
        <li>
          <strong>Shareable links</strong> put your inputs in the page address (the URL) so that you can share a
          result. Anyone you send the link to can see those numbers, and like any web address they may appear in
          your browser history and in standard server logs.
        </li>
      </ul>

      <h2>Analytics</h2>
      <p>
        We use Google Analytics to understand how the site is used, for example which calculators are popular and
        how people find us. Google Analytics uses cookies and collects information such as pages visited, approximate
        location, device and browser type. We do not send the values you enter into calculators to Google
        Analytics. Learn more about{" "}
        <a href="https://policies.google.com/technologies/partner-sites">
          how Google uses information from sites that use its services
        </a>
        .
      </p>

      <h2>Advertising</h2>
      <p>{site.name} is funded by ads served by Google AdSense.</p>
      <ul>
        <li>
          Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this
          website or other websites.
        </li>
        <li>
          Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your
          visit to this site and/or other sites on the internet.
        </li>
        <li>
          You may opt out of personalized advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads">Google Ads Settings</a>. Alternatively, you can opt out of
          some third-party vendors&apos; use of cookies for personalized advertising by visiting{" "}
          <a href="https://www.aboutads.info/choices/">www.aboutads.info</a>.
        </li>
      </ul>
      <p>
        If other advertising partners are added in future, they will be listed here with links to their own
        privacy and opt-out pages.
      </p>

      <h2>Cookie consent</h2>
      <p>
        Visitors in the European Economic Area, the United Kingdom and Switzerland are asked for consent before
        advertising and analytics cookies are used, through a consent message that meets Google&apos;s
        requirements. You can change your choice at any time from the link in that message.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Block or delete cookies in your browser settings. The calculators still work without them.</li>
        <li>Opt out of personalized ads using the links above.</li>
        <li>
          Install the{" "}
          <a href="https://tools.google.com/dlpage/gaoptout">Google Analytics opt-out browser add-on</a> to stop
          Analytics from collecting data about your visits.
        </li>
        <li>
          Depending on where you live, you may have rights to access, correct or delete personal data. Because
          {` ${site.name}`} does not keep accounts or store your calculator inputs, there is usually nothing held
          about you, but you can email us with any request.
        </li>
      </ul>

      <h2>Children</h2>
      <p>
        {site.name} is meant for adults and is not directed at children under 13. We do not knowingly collect
        personal information from children.
      </p>

      <h2>Links to other sites</h2>
      <p>
        Our guides link to sources such as government websites. Those sites have their own privacy policies, which
        we do not control.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If this policy changes, the new version will be posted here with a new &ldquo;last updated&rdquo; date.
        See also our <Link href="/terms">terms of use</Link>.
      </p>
    </ContentPage>
  );
}
