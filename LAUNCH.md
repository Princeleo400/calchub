# CalcHub launch checklist

Work top to bottom. Analytics and ads stay switched off until their IDs are
added, so each step can be done and deployed on its own.

All IDs go in Vercel > Project > Settings > Environment Variables
(Production). Names and examples are in `.env.example`. Redeploy after
changing any of them, because they are built into the pages.

## 1. Before going live

- [ ] Replace the placeholder `contactEmail` in `lib/site.ts` with a real
      inbox, ideally on the new domain.
- [ ] Buy the domain and add it to the Vercel project.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the domain, e.g. `https://example.com`
      (no trailing slash). Canonical links, the sitemap and the social preview
      images all use it.
- [ ] Deploy, then open these on the live domain:
  - [ ] `/robots.txt` lists the sitemap.
  - [ ] `/sitemap.xml` lists 31 pages, all on the real domain.
  - [ ] A calculator page and a guide look right on a phone.
- [ ] Paste a calculator URL into a social preview checker such as LinkedIn
      Post Inspector and confirm its preview image shows.

Branch and pull request deployments on Vercel tell search engines to stay
away (see `app/robots.ts`), so only the real domain gets indexed.

## 2. Google Search Console and Bing

- [ ] Add the domain property in Google Search Console and verify it with the
      DNS record it gives you.
- [ ] Submit `https://<domain>/sitemap.xml` under Sitemaps.
- [ ] In Bing Webmaster Tools, import the site from Search Console.
- [ ] After a few days, check Pages > Indexing for errors.

## 3. Google Analytics 4

- [ ] Create a GA4 property and a Web data stream for the domain.
- [ ] Copy the Measurement ID (`G-...`) into `NEXT_PUBLIC_GA_MEASUREMENT_ID`
      and redeploy.
- [ ] In the data stream, open Enhanced measurement > Page views > Show
      advanced settings, and turn off "Page changes based on browser history
      events". The site sends its own page views without the calculator
      numbers, and leaving this on would count pages twice.
- [ ] Admin > Data retention: set event data to 14 months.
- [ ] Check Reports > Realtime while you browse the live site.

## 4. Google AdSense

Apply once the site is live on its domain with the calculators and guides
published.

- [ ] Sign up at AdSense and add the site.
- [ ] Copy your publisher ID (`ca-pub-...`) into `NEXT_PUBLIC_ADSENSE_CLIENT`
      and redeploy. This adds the AdSense script, the
      `google-adsense-account` verification tag and `/ads.txt`.
- [ ] In AdSense, verify the site with the meta tag method and request review.
- [ ] Privacy & messaging: create a "European regulations" message (Google's
      own certified consent tool), turn on consent mode, and publish it for
      the site. Visitors in the EEA, UK and Switzerland start with cookies
      denied until they answer it; `CONSENT_REQUIRED_REGIONS` in
      `lib/googleConfig.ts` must match this.
- [ ] Privacy & messaging: also create a "US state regulations" message.
- [ ] Check that `/ads.txt` shows your publisher ID and that AdSense reports
      it as authorized (this can take a few days).

After approval:

- [ ] Ads > By ad unit: create Display units, then add their numeric IDs:
  - [ ] `NEXT_PUBLIC_ADSENSE_SLOT_HEADER` (below the calculator title)
  - [ ] `NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT` (between calculator and guide)
  - [ ] `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR` (desktop sidebar)
- [ ] Redeploy. Ads only appear on positions that have an ID; the sidebar
      column only exists once its ID is set.
- [ ] Leave Auto ads off at first, so ads appear only in the reserved spaces
      and pages don't jump around while loading.

## 5. Keep the numbers current

- [ ] UK stamp duty: recheck the rates after each UK Budget (next one:
      28 October 2026). Rates live in `SDLT_RATES` in
      `lib/calculators/stampDuty.ts`.
- [ ] Canada stress test: recheck the qualifying rate rules and CMHC premiums
      in `CANADA_RULES` in `lib/calculators/stressTest.ts` a few times a year.
- [ ] The 15-year vs 30-year guide quotes Freddie Mac average rates from
      October 2026. Update the two rates and the dates in
      `lib/blog/posts/15-vs-30-year-mortgage.tsx` every few months.
- [ ] When a page's content changes, update its "last reviewed" or "updated"
      date so the sitemap and the page stay honest.
