/**
 * Google Analytics and AdSense IDs come from environment variables, so the
 * site runs with neither until you add them in Vercel. Each value is checked
 * against its expected format: a typo turns the feature off instead of
 * breaking the page, and nothing unexpected can reach the inline script.
 */

function validated(value: string | undefined, pattern: RegExp) {
  const trimmed = value?.trim();
  return trimmed && pattern.test(trimmed) ? trimmed : undefined;
}

/** GA4 Measurement ID, e.g. "G-ABC123XYZ9". */
export const gaMeasurementId = validated(
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  /^G-[A-Z0-9]{4,20}$/,
);

/** AdSense publisher ID as AdSense shows it, e.g. "ca-pub-1234567890123456". */
export const adsenseClient = validated(
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
  /^ca-pub-\d{10,20}$/,
);

export type AdPosition =
  "header" | "sidebar" | "in-content" | "footer" | "mobile-banner";

// One AdSense ad unit per position, created in AdSense under Ads > By ad unit.
// Each name is written out in full so Next.js can inline it at build time.
const adUnitIds: Record<AdPosition, string | undefined> = {
  header: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER,
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
  "in-content": process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT,
  footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER,
  "mobile-banner": process.env.NEXT_PUBLIC_ADSENSE_SLOT_MOBILE_BANNER,
};

/** The ad unit id for a position, or undefined if it is missing or invalid. */
export function adUnitIdFor(position: AdPosition, override?: string) {
  if (!adsenseClient) return undefined;
  return validated(override ?? adUnitIds[position], /^\d{5,20}$/);
}

/** Show placeholder boxes in development so the ad layout stays visible. */
export const showAdPlaceholders = process.env.NODE_ENV === "development";

/**
 * Where visitors must opt in before cookies are used: the European Economic
 * Area, the UK and Switzerland. Google's consent message (set up in AdSense
 * under Privacy & messaging) asks these visitors and updates consent.
 */
// prettier-ignore
export const CONSENT_REQUIRED_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
];
