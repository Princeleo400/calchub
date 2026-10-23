type EventParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    /** Defined by the inline script in GoogleTags when GA4 or AdSense is on. */
    gtag?: (command: string, ...args: unknown[]) => void;
  }
}

/**
 * Send a GA4 event. Does nothing when GA4 is not configured. Never pass
 * calculator inputs here: the privacy page promises they stay in the browser.
 */
export function track(name: string, params?: EventParams): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
}
