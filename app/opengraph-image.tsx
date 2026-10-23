import { renderSocialCard, socialImageSize } from "@/lib/og/socialCard";
import { site } from "@/lib/site";

// Used by every page that has no preview image of its own.
export const alt = `${site.name}: ${site.tagline}`;
export const size = socialImageSize;
export const contentType = "image/png";

export default function Image() {
  return renderSocialCard({
    eyebrow: "Money and health",
    title: site.tagline,
    description:
      "Mortgage, loan, debt payoff, BMI and calorie calculators that show the formulas behind every result.",
  });
}
