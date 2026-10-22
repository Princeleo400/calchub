import Link from "next/link";
import { calculatorsByCategory, categoryLabels } from "@/lib/calculators/registry";
import type { CalculatorCategory } from "@/lib/types";
import { site } from "@/lib/site";

const categories: CalculatorCategory[] = ["finance", "health"];

const companyLinks = [
  { href: "/blog", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{site.name}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{site.tagline}.</p>
          </div>

          {categories.map((category) => (
            <FooterColumn
              key={category}
              title={categoryLabels[category]}
              links={calculatorsByCategory(category).map((c) => ({ href: `/${c.slug}`, label: c.name }))}
            />
          ))}

          <FooterColumn title="CalcHub" links={companyLinks} />
        </div>

        <p className="mt-10 border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
          Results are estimates for general information only. They are not financial, tax or medical
          advice. Check important decisions with a qualified professional.
        </p>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          &copy; <CopyrightYear /> {site.name}
        </p>
      </div>
    </footer>
  );
}

// Cached so the page stays static; refreshes on each deploy.
async function CopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

function FooterColumn({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-slate-600 transition-colors duration-150 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
