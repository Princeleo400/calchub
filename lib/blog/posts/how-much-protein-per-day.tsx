import { CalculatorCta } from "@/components/blog/CalculatorCta";
import { DataTable } from "@/components/blog/DataTable";
import type { Post } from "@/lib/blog/types";
import { KG_PER_LB } from "@/lib/calculators/bmi";
import {
  ACTIVE_PROTEIN_G_PER_KG,
  ADULT_RANGES,
  PROTEIN_RDA_G_PER_KG,
} from "@/lib/calculators/macro";
import { formatNumber } from "@/lib/utils";

const WEIGHTS_LB = [120, 140, 160, 180, 200, 220, 250];
const grams = (value: number) => `${formatNumber(Math.round(value))} g`;
const active = `${ACTIVE_PROTEIN_G_PER_KG.min.toFixed(1)} to ${ACTIVE_PROTEIN_G_PER_KG.max.toFixed(1)}`;

const EXAMPLE_LB = 160;
const exampleKg = EXAMPLE_LB * KG_PER_LB;

// Protein from 10% and 35% of a 2,000-calorie day, at 4 calories per gram.
const lowShareGrams = (2000 * ADULT_RANGES.protein.min) / 100 / 4;
const highShareGrams = (2000 * ADULT_RANGES.protein.max) / 100 / 4;

function Body() {
  return (
    <>
      <p>
        Protein advice ranges from &ldquo;most people already get enough&rdquo;
        to &ldquo;eat as much as you can.&rdquo; The official guidance is
        simpler than either, and it scales with your body weight.
      </p>

      <h2>The quick answer</h2>
      <p>
        Adults are advised to get at least{" "}
        <strong>{PROTEIN_RDA_G_PER_KG} g of protein per kilogram</strong> of
        body weight a day. That is the Recommended Dietary Allowance (RDA), set
        to cover the needs of nearly all healthy adults. For someone who weighs{" "}
        {EXAMPLE_LB} lb ({formatNumber(Math.round(exampleKg))} kg), it works out
        to about {grams(PROTEIN_RDA_G_PER_KG * exampleKg)} a day.
      </p>
      <p>
        If you exercise regularly, the International Society of Sports Nutrition
        finds {active} g/kg enough for most people to build and keep muscle:{" "}
        {grams(ACTIVE_PROTEIN_G_PER_KG.min * exampleKg)} to{" "}
        {grams(ACTIVE_PROTEIN_G_PER_KG.max * exampleKg)} a day at the same
        weight.
      </p>

      <h2>Daily protein by body weight</h2>
      <DataTable
        caption={`Minimum is the RDA of ${PROTEIN_RDA_G_PER_KG} g/kg. Exercising is ${active} g/kg.`}
        headers={["Weight", "Minimum", "Exercising"]}
        numeric={[1, 2]}
        fitsPhone
        rows={WEIGHTS_LB.map((pounds) => {
          const kilograms = pounds * KG_PER_LB;
          return [
            `${pounds} lb / ${formatNumber(Math.round(kilograms))} kg`,
            grams(PROTEIN_RDA_G_PER_KG * kilograms),
            `${Math.round(ACTIVE_PROTEIN_G_PER_KG.min * kilograms)}–${grams(ACTIVE_PROTEIN_G_PER_KG.max * kilograms)}`,
          ];
        })}
      />

      <CalculatorCta
        slug="macro-calculator"
        text="See your protein, carbs and fat in grams, and your protein per kg."
      />

      <h2>Protein as a share of your calories</h2>
      <p>
        Another way to look at it: health authorities consider{" "}
        {ADULT_RANGES.protein.min} to {ADULT_RANGES.protein.max}% of daily
        calories from protein an acceptable range for adults. On a 2,000-calorie
        day that is {grams(lowShareGrams)} to {grams(highShareGrams)}, since
        protein has about 4 calories per gram. The per-kilogram figure is
        usually the more useful one, because it follows your size rather than
        how much you eat.
      </p>

      <h2>Who may need a different amount</h2>
      <ul>
        <li>
          <strong>People who train hard</strong> tend to sit toward the top of
          the {active} g/kg range.
        </li>
        <li>
          <strong>People with kidney disease</strong> may need to limit protein
          and should follow their doctor&apos;s advice.
        </li>
        <li>
          <strong>During pregnancy or breastfeeding</strong> needs change, so
          ask a doctor or midwife.
        </li>
        <li>
          <strong>Children and teens</strong> have their own recommendations by
          age.
        </li>
      </ul>

      <h2>Getting enough without overthinking it</h2>
      <ul>
        <li>
          Include a protein source at each meal, such as eggs, dairy, fish,
          poultry, meat, beans, lentils, tofu or nuts.
        </li>
        <li>
          Spreading protein across the day is easier than fitting most of it
          into dinner.
        </li>
        <li>
          Whole foods bring other nutrients too, so treat supplements as a
          convenience rather than a necessity.
        </li>
        <li>
          Being close to your target most days matters more than hitting it
          exactly.
        </li>
      </ul>
    </>
  );
}

export const post: Post = {
  slug: "how-much-protein-per-day",
  title: "How Much Protein Do You Need a Day? A Guide by Body Weight",
  description:
    "The official minimum is 0.8 g of protein per kg of body weight. See daily grams by weight, the higher range for people who exercise, and who may need a different amount.",
  published: "2026-10-26",
  updated: "2026-10-26",
  category: "health",
  readingMinutes: 4,
  calculators: ["macro-calculator", "calorie-calculator"],
  faqs: [
    {
      question: "How much protein do I need a day?",
      answer: `At least ${PROTEIN_RDA_G_PER_KG} g per kilogram of body weight for healthy adults, about ${grams(PROTEIN_RDA_G_PER_KG * exampleKg)} for someone who weighs ${EXAMPLE_LB} lb. People who exercise regularly often aim for ${active} g/kg.`,
    },
    {
      question: "Can I eat too much protein?",
      answer:
        "For most healthy adults, intakes within the ranges above are considered safe. People with kidney disease may need to limit protein, so they should check with their doctor.",
    },
  ],
  sources: [
    {
      label:
        "Institute of Medicine: Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids (2005)",
      href: "https://doi.org/10.17226/10490",
    },
    {
      label:
        "Jäger et al.: International Society of Sports Nutrition position stand, protein and exercise (2017)",
      href: "https://pubmed.ncbi.nlm.nih.gov/28642676/",
    },
  ],
  Body,
};
