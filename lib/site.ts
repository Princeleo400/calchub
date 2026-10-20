export const site = {
  name: "CalcHub",
  tagline: "Free calculators for money and health",
  description:
    "Free, fast mortgage, loan, debt payoff, BMI and calorie calculators. Clear results, the formulas behind them, and no sign-up.",
  // Set NEXT_PUBLIC_SITE_URL in Vercel once the domain is chosen.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_US",

  // BEFORE LAUNCH: replace with a real inbox (ideally on your own domain).
  // ".example" is a reserved domain, so this placeholder can never receive mail.
  contactEmail: "hello@calchub.example",

  author: {
    name: "Chukwuemeka Michael Ohaga",
    brand: "LeoStack",
    role: "Frontend developer",
    location: "Lagos, Nigeria",
    // Optional public profile, shown on the About page when set.
    url: "https://leostack.netlify.app",
  },
} as const;
