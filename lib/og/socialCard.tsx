import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getCalculator } from "@/lib/calculators/registry";
import { site } from "@/lib/site";
import type { CalculatorSlug } from "@/lib/types";

/** The size every social platform expects for a large link preview. */
export const socialImageSize = { width: 1200, height: 630 };

const colors = {
  background: "#ffffff",
  heading: "#0f172a",
  body: "#475569",
  muted: "#64748b",
  border: "#e2e8f0",
  brand: "#2563eb",
};

/**
 * Inter, from assets/fonts (SIL Open Font License). "use cache" keeps the
 * file reads inside the build's cache, so every preview image is generated
 * once at build time instead of on each request.
 */
async function loadFonts() {
  "use cache";
  const fontDirectory = join(process.cwd(), "assets/fonts");
  const [regularFont, boldFont] = await Promise.all([
    readFile(join(fontDirectory, "Inter-Regular.woff")),
    readFile(join(fontDirectory, "Inter-Bold.woff")),
  ]);
  return [new Uint8Array(regularFont), new Uint8Array(boldFont)];
}

interface SocialCardContent {
  /** Small label above the title, e.g. "Finance calculator". */
  eyebrow: string;
  title: string;
  /** Optional supporting line, cut to two lines if long. */
  description?: string;
}

/** Copies just the bytes of a view, in case it shares a larger buffer. */
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

/** Long titles get a smaller size so they stay within three lines. */
function titleFontSize(title: string) {
  if (title.length > 60) return 60;
  if (title.length > 40) return 68;
  return 76;
}

export async function renderSocialCard({
  eyebrow,
  title,
  description,
}: SocialCardContent) {
  const [regularFont, boldFont] = await loadFonts();
  const domain = site.url.replace(/^https?:\/\//, "");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 80px",
        backgroundColor: colors.background,
        borderTop: `12px solid ${colors.brand}`,
        color: colors.heading,
        fontFamily: "Inter",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            width: 56,
            height: 56,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            backgroundColor: colors.brand,
            color: "#ffffff",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          C
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>
          {site.name}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: colors.brand,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: titleFontSize(title),
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -1.5,
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              display: "block",
              lineClamp: 2,
              fontSize: 30,
              lineHeight: 1.4,
              color: colors.body,
            }}
          >
            {description}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 28,
          borderTop: `2px solid ${colors.border}`,
          fontSize: 24,
          color: colors.muted,
        }}
      >
        <div>Free, no sign-up. Your numbers stay in your browser.</div>
        <div>{domain}</div>
      </div>
    </div>,
    {
      ...socialImageSize,
      fonts: [
        {
          name: "Inter",
          data: toArrayBuffer(regularFont),
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: toArrayBuffer(boldFont),
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}

export function calculatorCardAlt(slug: CalculatorSlug) {
  return `${getCalculator(slug).name} | ${site.name}`;
}

/** Preview image for a calculator page, built from its registry entry. */
export function renderCalculatorCard(slug: CalculatorSlug) {
  const calculator = getCalculator(slug);
  return renderSocialCard({
    eyebrow: `${calculator.category} calculator`,
    title: calculator.name,
    description: calculator.description,
  });
}
