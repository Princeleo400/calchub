import { CalculatorCta } from "@/components/blog/CalculatorCta";
import { bmiCategory, bmiFromImperial } from "@/lib/calculators/bmi";
import type { Post } from "@/lib/blog/types";
import { formatNumber } from "@/lib/utils";

// Two people at the same height and weight: identical BMI, very different bodies.
const athleteBmi = bmiFromImperial(200, 70);

function Body() {
  return (
    <>
      <p>
        BMI is the most widely used measure of weight relative to height. It is
        also one of the most criticized. Both reactions make sense once you know
        what BMI was designed to do, and what it was never meant to do.
      </p>

      <h2>What BMI is</h2>
      <p>
        Body mass index is your weight in kilograms divided by your height in
        meters squared. For adults aged 20 and over, the CDC groups the result
        into four main categories: underweight (below 18.5), healthy weight
        (18.5 to under 25), overweight (25 to under 30) and obesity (30 or
        higher, split into three classes).
      </p>
      <p>
        The CDC describes BMI as a <strong>screening tool</strong>: a quick,
        inexpensive way to flag who might be underweight, overweight or living
        with obesity. It is meant to start a conversation, not to diagnose
        anything on its own.
      </p>

      <CalculatorCta
        slug="bmi-calculator"
        text="Find your BMI and the healthy weight range for your height."
      />

      <h2>What BMI does well</h2>
      <ul>
        <li>
          <strong>It is fast and free.</strong> All it needs is height and
          weight, so it can be used anywhere.
        </li>
        <li>
          <strong>It is consistent.</strong> The same formula and categories
          apply to every adult, which makes it useful for tracking trends across
          large groups of people.
        </li>
        <li>
          <strong>It flags who might need a closer look.</strong> As a first
          filter, it helps decide when other checks are worth doing.
        </li>
      </ul>

      <h2>Where BMI falls short</h2>
      <h3>It can&apos;t tell muscle from fat</h3>
      <p>
        BMI only knows your total weight. It does not distinguish fat from
        muscle or bone. Someone who is 5 ft 10 in and 200 lb has a BMI of{" "}
        {formatNumber(athleteBmi, 1)}, in the{" "}
        {bmiCategory(athleteBmi).label.toLowerCase()} category, whether they are
        a heavily muscled athlete or carrying a lot of body fat.
      </p>
      <h3>It doesn&apos;t show where fat is carried</h3>
      <p>
        BMI says nothing about the type of fat you have or where it sits on your
        body. Two people with the same BMI can have very different health
        profiles.
      </p>
      <h3>It is one number among many</h3>
      <p>
        On its own, BMI can&apos;t tell you whether you are healthy. The CDC
        notes that health care providers consider it alongside other
        information, such as blood pressure, cholesterol, a physical exam and
        your medical history.
      </p>

      <h2>So should you pay attention to your BMI?</h2>
      <p>
        Yes, as a starting point. If your BMI is outside the healthy range, it
        is a reason to look more closely, ideally with a doctor who can weigh it
        against everything else they know about you. If it is inside the range,
        that is a good sign but not a full health check.
      </p>
      <p>A few practical takeaways:</p>
      <ul>
        <li>
          Use BMI to notice trends in your own weight over time, rather than as
          a verdict on a single day.
        </li>
        <li>
          If you are very muscular, expect BMI to read high and rely more on
          other measures.
        </li>
        <li>
          For children and teens, BMI is compared with others of the same age
          and sex as a percentile instead.
        </li>
        <li>
          If a result worries you, talk to a health care provider before making
          big changes.
        </li>
      </ul>

      <CalculatorCta
        slug="calorie-calculator"
        text="Estimate your daily calorie needs."
      />
    </>
  );
}

export const post: Post = {
  slug: "is-bmi-accurate",
  title: "Is BMI Accurate? What Your BMI Does and Doesn't Tell You",
  description:
    "What body mass index measures, what it does well, why it can mislead for muscular people, and how health care providers use it alongside other measures.",
  published: "2026-10-21",
  updated: "2026-10-21",
  category: "health",
  readingMinutes: 4,
  calculators: ["bmi-calculator", "calorie-calculator"],
  faqs: [
    {
      question: "Is BMI a good measure of health?",
      answer:
        "BMI is a useful screening tool but not a complete measure of health. It doesn't distinguish fat from muscle or show where fat is carried, so providers use it alongside other measures such as blood pressure and cholesterol.",
    },
    {
      question: "Why is my BMI high when I'm muscular?",
      answer:
        "BMI only uses total weight and height. Muscle is dense, so very muscular people can have a BMI in the overweight range without excess body fat.",
    },
  ],
  sources: [
    {
      label: "CDC: About body mass index (BMI)",
      href: "https://www.cdc.gov/bmi/about/index.html",
    },
    {
      label: "CDC: Adult BMI categories",
      href: "https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html",
    },
  ],
  Body,
};
