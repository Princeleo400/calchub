// Ad blocker detection. Runs only in the browser and only when AdSense is
// configured; nothing about the result leaves the visitor's device.

/** Set on window by the AdSense loader in GoogleTags. */
export const ADSENSE_STATUS_KEY = "__calchubAdsenseStatus";

type ScriptStatus = "loading" | "loaded" | "failed" | undefined;

declare global {
  interface Window {
    [ADSENSE_STATUS_KEY]?: ScriptStatus;
  }
}

/** How long to wait for the AdSense script before checking anyway. */
const SCRIPT_WAIT_MS = 4000;

/**
 * Class names ad blockers hide on sight. A visible element with these
 * classes that ends up with no size means a blocker's cosmetic filter is on.
 */
const BAIT_CLASSES = "adsbox ad-banner ad-placement pub_300x250 text-ad";

function waitForScript(): Promise<ScriptStatus> {
  return new Promise((resolve) => {
    const started = Date.now();
    const check = () => {
      const status = window[ADSENSE_STATUS_KEY];
      if (status === "loaded" || status === "failed") resolve(status);
      else if (Date.now() - started > SCRIPT_WAIT_MS) resolve(status);
      else window.setTimeout(check, 200);
    };
    check();
  });
}

function baitIsHidden(): Promise<boolean> {
  return new Promise((resolve) => {
    const bait = document.createElement("div");
    bait.className = BAIT_CLASSES;
    bait.setAttribute("aria-hidden", "true");
    bait.style.cssText =
      "position:absolute;left:-9999px;top:-9999px;width:10px;height:10px;";
    bait.innerHTML = "&nbsp;";
    document.body.appendChild(bait);
    // Give cosmetic filters a moment to apply.
    window.setTimeout(() => {
      const style = window.getComputedStyle(bait);
      const hidden =
        bait.offsetHeight === 0 ||
        style.display === "none" ||
        style.visibility === "hidden";
      bait.remove();
      resolve(hidden);
    }, 300);
  });
}

/**
 * True when an ad blocker appears to be active: the AdSense script was
 * blocked from loading, or ad-like elements are being hidden.
 */
export async function detectAdBlocker(): Promise<boolean> {
  const status = await waitForScript();
  if (status === "failed") return true;
  return baitIsHidden();
}
