export const site = {
  name: "CalcHub",
  tagline: "Free calculators for money and health",
  description:
    "Free, fast mortgage, loan, debt payoff, BMI and calorie calculators. Clear results, the formulas behind them, and no sign-up.",
  // Set NEXT_PUBLIC_SITE_URL in Vercel once the domain is chosen.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_US",
} as const;
