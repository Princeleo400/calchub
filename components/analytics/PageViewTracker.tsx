"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Longest wait for the new page's title before sending anyway. */
const TITLE_WAIT_MS = 1000;

/**
 * Sends one GA4 page view per page, including client-side navigations.
 * Only the path is sent: calculator inputs live in the query string and must
 * stay out of Analytics. Changing an input updates the query string but not
 * the path, so it never counts as a new page view.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const lastTitle = useRef<string | null>(null);

  useEffect(() => {
    const sendPageView = () => {
      lastTitle.current = document.title;
      window.gtag?.("event", "page_view", {
        page_location: `${window.location.origin}${pathname}`,
        page_path: pathname,
        page_title: document.title,
      });
    };

    // First load, or the title is already the new page's: send now.
    const titleReady =
      document.title !== "" && document.title !== lastTitle.current;
    if (lastTitle.current === null || titleReady) {
      sendPageView();
      return;
    }

    // After a client-side navigation Next.js sets the title a moment later.
    let sent = false;
    const sendOnce = () => {
      if (sent) return;
      sent = true;
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
      sendPageView();
    };
    const observer = new MutationObserver(() => {
      if (document.title !== "" && document.title !== lastTitle.current) {
        sendOnce();
      }
    });
    observer.observe(document.head, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    const fallbackTimer = window.setTimeout(sendOnce, TITLE_WAIT_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
    };
  }, [pathname]);

  return null;
}
