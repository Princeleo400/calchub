"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { detectAdBlocker } from "@/lib/adBlock";
import { adsenseClient } from "@/lib/googleConfig";
import { site } from "@/lib/site";

// When to show the notice. It never appears on the page someone lands on
// from a search result (Google treats that as an intrusive interstitial);
// it waits for a second page or 45 seconds of use, and once closed it stays
// away for a week.
const PAGES_BEFORE_NOTICE = 2;
const SECONDS_BEFORE_NOTICE = 45;
const QUIET_DAYS_AFTER_CLOSE = 7;

const DISMISSED_KEY = "calchub_adblock_dismissed_at";
const PAGES_SEEN_KEY = "calchub_pages_seen";
const DAY_MS = 24 * 60 * 60 * 1000;

// Storage can be unavailable (private windows, blocked site data), so every
// read and write is guarded and the notice simply stays hidden on failure.
function readNumber(storage: () => Storage, key: string): number {
  try {
    return Number(storage().getItem(key)) || 0;
  } catch {
    return 0;
  }
}

function writeValue(storage: () => Storage, key: string, value: string) {
  try {
    storage().setItem(key, value);
  } catch {
    // Nothing to do: the notice may show again next visit.
  }
}

const local = () => window.localStorage;
const session = () => window.sessionStorage;

function recentlyDismissed(): boolean {
  const dismissedAt = readNumber(local, DISMISSED_KEY);
  return (
    dismissedAt > 0 &&
    Date.now() - dismissedAt < QUIET_DAYS_AFTER_CLOSE * DAY_MS
  );
}

/** Counts distinct pages viewed in this browser tab session. */
function recordPageView(pathname: string): number {
  try {
    const seen = new Set<string>(
      JSON.parse(session().getItem(PAGES_SEEN_KEY) ?? "[]"),
    );
    seen.add(pathname);
    session().setItem(PAGES_SEEN_KEY, JSON.stringify([...seen].slice(-20)));
    return seen.size;
  } catch {
    return 1;
  }
}

/**
 * A polite, dismissible request to allow ads, shown only when AdSense is
 * configured and an ad blocker is detected. The calculators keep working
 * whatever the visitor chooses.
 */
export function AdBlockNotice() {
  if (!adsenseClient) return null;
  return <AdBlockNoticeDialog />;
}

function AdBlockNoticeDialog() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Plain refs rather than state: each trigger below just checks whether
  // everything is in place and opens the dialog, without extra renders.
  const blockedRef = useRef(false);
  const eligibleRef = useRef(false);
  const closedRef = useRef(false);

  const maybeShow = useCallback(() => {
    const dialog = dialogRef.current;
    if (
      dialog &&
      !dialog.open &&
      blockedRef.current &&
      eligibleRef.current &&
      !closedRef.current &&
      !recentlyDismissed()
    ) {
      dialog.showModal();
    }
  }, []);

  // Detect once per page load.
  useEffect(() => {
    if (recentlyDismissed()) return;
    let cancelled = false;
    detectAdBlocker().then((isBlocked) => {
      if (cancelled) return;
      blockedRef.current = isBlocked;
      maybeShow();
    });
    return () => {
      cancelled = true;
    };
  }, [maybeShow]);

  // Eligible from the second distinct page in this session...
  useEffect(() => {
    if (recordPageView(pathname) >= PAGES_BEFORE_NOTICE) {
      eligibleRef.current = true;
      maybeShow();
    }
  }, [pathname, maybeShow]);

  // ...or after some time spent on the site.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      eligibleRef.current = true;
      maybeShow();
    }, SECONDS_BEFORE_NOTICE * 1000);
    return () => window.clearTimeout(timer);
  }, [maybeShow]);

  function dismiss() {
    closedRef.current = true;
    writeValue(local, DISMISSED_KEY, String(Date.now()));
    if (dialogRef.current?.open) dialogRef.current.close();
  }

  function allowedAds() {
    // Reload so the ads (and the check) run again with the blocker paused.
    closedRef.current = true;
    writeValue(local, DISMISSED_KEY, String(Date.now()));
    window.location.reload();
  }

  const domain = site.url.replace(/^https?:\/\//, "");

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="adblock-title"
      aria-describedby="adblock-description"
      // Escape and the browser's own close also count as "not now".
      onClose={() => {
        if (!closedRef.current) dismiss();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-slate-200 bg-white p-0 text-slate-900 backdrop:bg-slate-950/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
    >
      <div className="p-6">
        <h2 id="adblock-title" className="text-lg font-semibold">
          Ads keep {site.name} free
        </h2>
        <div
          id="adblock-description"
          className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
        >
          <p>
            It looks like an ad blocker is on. {site.name} has no paywall and no
            sign-up; a few ads pay for it. We keep them out of the calculators
            themselves.
          </p>
          <p>
            If you find the site useful, please allow ads on{" "}
            <strong className="font-semibold text-slate-900 dark:text-slate-50">
              {domain}
            </strong>
            : open your ad blocker from the browser toolbar and choose to pause
            or turn it off on this site.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The calculators work either way.
          </p>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={dismiss}
            className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={allowedAds}
            className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700"
          >
            I&apos;ve allowed ads
          </button>
        </div>
      </div>
    </dialog>
  );
}
