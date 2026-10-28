import {
  adsenseClient,
  CONSENT_REQUIRED_REGIONS,
  gaMeasurementId,
} from "@/lib/googleConfig";
import { ADSENSE_STATUS_KEY } from "@/lib/adBlock";
import { PageViewTracker } from "./PageViewTracker";

const consentDenied = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
};
const consentGranted = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
};

/**
 * One inline script in <head> that, in this order:
 * 1. Sets Google Consent Mode defaults. EEA, UK and Switzerland start with
 *    cookies denied until the visitor answers Google's consent message
 *    (configured in AdSense). Everywhere else starts granted, with opt-outs
 *    on the privacy page.
 * 2. Configures GA4 without automatic page views. PageViewTracker sends them
 *    without the query string, so numbers in shareable links stay private.
 * 3. Loads Google's scripts. Adding them from here, rather than as <script>
 *    tags, guarantees they never run before the consent defaults exist.
 */
function buildInitScript() {
  const lines = [
    "window.dataLayer=window.dataLayer||[];",
    "function gtag(){dataLayer.push(arguments);}",
    `gtag("consent","default",${JSON.stringify({
      ...consentDenied,
      region: CONSENT_REQUIRED_REGIONS,
      wait_for_update: 500,
    })});`,
    `gtag("consent","default",${JSON.stringify(consentGranted)});`,
    // statusKey records "loaded" or "failed" on window, so the ad blocker
    // notice can tell whether the AdSense script was blocked.
    'function loadScript(source,anonymous,statusKey){var element=document.createElement("script");element.async=true;element.src=source;if(anonymous)element.crossOrigin="anonymous";if(statusKey){window[statusKey]="loading";element.onload=function(){window[statusKey]="loaded"};element.onerror=function(){window[statusKey]="failed"}}document.head.appendChild(element);}',
  ];
  if (gaMeasurementId) {
    const gtagSource = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
    lines.push(
      'gtag("js",new Date());',
      `gtag("config",${JSON.stringify(gaMeasurementId)},{send_page_view:false});`,
      `loadScript(${JSON.stringify(gtagSource)},false);`,
    );
  }
  if (adsenseClient) {
    const adsenseSource = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`;
    lines.push(
      `loadScript(${JSON.stringify(adsenseSource)},true,${JSON.stringify(ADSENSE_STATUS_KEY)});`,
    );
  }
  return lines.join("");
}

/** Renders nothing until a GA4 or AdSense ID is configured. */
export function GoogleTags() {
  if (!gaMeasurementId && !adsenseClient) return null;
  return <script dangerouslySetInnerHTML={{ __html: buildInitScript() }} />;
}

/** Sends page views; lives in <body> because it is a client component. */
export function GoogleAnalyticsPageViews() {
  return gaMeasurementId ? <PageViewTracker /> : null;
}
