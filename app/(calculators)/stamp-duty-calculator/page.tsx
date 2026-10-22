import { DataTable } from "@/components/blog/DataTable";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import {
  calculateStampDuty,
  SDLT_RATES,
  type Band,
} from "@/lib/calculators/stampDuty";
import { buildMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/jsonLd";
import { formatCurrency } from "@/lib/utils";
import { StampDutyCalculator } from "./StampDutyCalculator";

export const metadata = buildMetadata({
  title: "UK Stamp Duty Calculator (England & NI) for 2026",
  description:
    "Free UK Stamp Duty calculator for England and Northern Ireland. Work out SDLT for home movers, first-time buyers, second homes and non-UK residents, with a band-by-band breakdown.",
  path: "/stamp-duty-calculator",
});

const gbp = (amount: number) => formatCurrency(amount, "GBP");
const sdlt = (price: number, buyer: "mover" | "firstTime" | "additional") =>
  calculateStampDuty({ price, buyer, nonResident: false }).tax;

function bandRows(bands: Band[]) {
  let from = 0;
  return bands.map((band) => {
    const label =
      band.upTo === Infinity
        ? `Above ${gbp(from)}`
        : from === 0
          ? `Up to ${gbp(band.upTo)}`
          : `${gbp(from + 1)} to ${gbp(band.upTo)}`;
    from = band.upTo;
    return [label, `${band.rate}%`];
  });
}

const EXAMPLE_PRICES = [200_000, 300_000, 400_000, 500_000, 750_000, 1_000_000];

const faqs: FaqItem[] = [
  {
    question: "How much is Stamp Duty in 2026?",
    answer:
      "In England and Northern Ireland, home movers pay nothing on the first £125,000, 2% on the portion up to £250,000, 5% up to £925,000, 10% up to £1.5 million and 12% above that. First-time buyers pay nothing up to £300,000 and 5% up to £500,000.",
  },
  {
    question: "Do first-time buyers pay Stamp Duty?",
    answer: `Not on homes up to £300,000. Between £300,000 and £500,000 they pay 5% on the part above £300,000, so a £400,000 home costs ${gbp(sdlt(400_000, "firstTime"))}. Above £500,000 first-time buyer relief is lost and standard rates apply to the whole price.`,
  },
  {
    question: "How much Stamp Duty do I pay on a second home?",
    answer: `An extra 5 percentage points on every band, on purchases of £40,000 or more. On a £300,000 second home or buy-to-let that means ${gbp(sdlt(300_000, "additional"))} instead of ${gbp(sdlt(300_000, "mover"))}.`,
  },
  {
    question: "Does Stamp Duty apply in Scotland and Wales?",
    answer:
      "No. Scotland has Land and Buildings Transaction Tax (LBTT) and Wales has Land Transaction Tax (LTT), each with their own rates. This calculator covers England and Northern Ireland only.",
  },
];

const sources = [
  {
    label:
      "GOV.UK: Stamp Duty Land Tax rates, 31 October 2024 to 31 March 2025 (surcharges for additional dwellings and non-UK residents)",
    href: "https://www.gov.uk/government/publications/rates-and-allowances-stamp-duty-land-tax/stamp-duty-land-tax-rates-31-october-2024-to-31-march-2025",
  },
  {
    label: "SalaryTax.uk: UK Stamp Duty rules 2026/27",
    href: "https://salarytax.uk/uk-stamp-duty-rules-guide",
  },
  {
    label: "Calculate My Stamp Duty: Autumn Budget 2026 and stamp duty",
    href: "https://calculatemystampduty.co.uk/news/autumn-budget-2026-stamp-duty",
  },
];

export default function StampDutyPage() {
  return (
    <CalculatorShell
      slug="stamp-duty-calculator"
      title="UK Stamp Duty Calculator"
      intro={
        <p>
          Work out the Stamp Duty Land Tax (SDLT) on a home in England or
          Northern Ireland. Covers home movers, first-time buyers, second homes
          and buy-to-lets, and the surcharge for non-UK residents.
        </p>
      }
      lastReviewed={SDLT_RATES.lastChecked}
      faqs={faqs}
      sources={sources}
      guide={
        <>
          <h2>How Stamp Duty is calculated</h2>
          <p>
            Stamp Duty works like income tax bands: each slice of the price is
            taxed at its own rate, and you add the slices up. You only pay the
            higher rate on the part of the price that falls in that band, not on
            the whole amount.
          </p>
          <p>
            For example, a home mover buying for {gbp(295_000)} pays nothing on
            the first {gbp(125_000)}, 2% on the next {gbp(125_000)} (
            {gbp(2_500)}) and 5% on the final {gbp(45_000)} ({gbp(2_250)}):{" "}
            {gbp(sdlt(295_000, "mover"))} in total.
          </p>

          <h2>Current rates for home movers</h2>
          <p>These rates have applied since 1 April 2025:</p>
          <DataTable
            headers={["Portion of the price", "Rate"]}
            numeric={[1]}
            rows={bandRows(SDLT_RATES.standard)}
          />

          <h2>First-time buyer relief</h2>
          <p>
            If everyone buying has never owned a home and you will live in the
            property, you pay less on homes up to{" "}
            {gbp(SDLT_RATES.firstTimeBuyerMaxPrice)}:
          </p>
          <DataTable
            headers={["Portion of the price", "Rate"]}
            numeric={[1]}
            rows={bandRows(SDLT_RATES.firstTimeBuyer)}
          />
          <p>
            Relief stops completely above{" "}
            {gbp(SDLT_RATES.firstTimeBuyerMaxPrice)}. A first-time buyer paying{" "}
            {gbp(500_001)} pays standard rates on the whole price,{" "}
            {gbp(sdlt(500_001, "firstTime"))}, compared with{" "}
            {gbp(sdlt(500_000, "firstTime"))} at exactly {gbp(500_000)}.
          </p>

          <h2>Second homes, buy-to-lets and non-UK residents</h2>
          <ul>
            <li>
              <strong>Additional properties:</strong> if buying means you will
              own more than one home, every band is{" "}
              {SDLT_RATES.additionalSurcharge} percentage points higher. This
              has applied since 31 October 2024 and doesn&apos;t apply to
              purchases under {gbp(SDLT_RATES.surchargeMinPrice)}.
            </li>
            <li>
              <strong>Non-UK residents:</strong> a further{" "}
              {SDLT_RATES.nonResidentSurcharge} percentage points on every band,
              including first-time buyer rates. It can apply on top of the
              additional property surcharge.
            </li>
          </ul>

          <h2>Stamp Duty at common prices</h2>
          <DataTable
            headers={[
              "Price",
              "Home mover",
              "First-time buyer",
              "Additional property",
            ]}
            numeric={[1, 2, 3]}
            rows={EXAMPLE_PRICES.map((price) => [
              gbp(price),
              gbp(sdlt(price, "mover")),
              gbp(sdlt(price, "firstTime")),
              gbp(sdlt(price, "additional")),
            ])}
          />

          <h2>Scotland and Wales</h2>
          <p>
            Stamp Duty Land Tax only applies in England and Northern Ireland.
            Scotland uses Land and Buildings Transaction Tax (LBTT) and Wales
            uses Land Transaction Tax (LTT), each with different bands and
            surcharges.
          </p>

          <h2>Rates can change</h2>
          <p>
            Stamp Duty rates are set by the government and can change at any
            Budget. The rates on this page were last checked on 22 October 2026,
            ahead of the Autumn Budget on 28 October 2026. Your solicitor or
            conveyancer will confirm what you owe, as some reliefs and special
            cases are not covered here.
          </p>
        </>
      }
    >
      <StampDutyCalculator />
    </CalculatorShell>
  );
}
