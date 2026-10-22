import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateStampDuty } from "./stampDuty.ts";

const sdlt = (
  price: number,
  buyer: "mover" | "firstTime" | "additional" = "mover",
  nonResident = false,
) => calculateStampDuty({ price, buyer, nonResident }).tax;

test("standard rates: worked examples", () => {
  assert.equal(sdlt(125_000), 0);
  // £295,000: 2% of £125k + 5% of £45k = 2,500 + 2,250
  assert.equal(sdlt(295_000), 4_750);
  // £500,000: 2,500 + 5% of £250k
  assert.equal(sdlt(500_000), 15_000);
  // £1,000,000: 2,500 + 5% of £675k + 10% of £75k = 2,500 + 33,750 + 7,500
  assert.equal(sdlt(1_000_000), 43_750);
  // £2,000,000: 2,500 + 33,750 + 10% of £575k + 12% of £500k = 2,500 + 33,750 + 57,500 + 60,000
  assert.equal(sdlt(2_000_000), 153_750);
});

test("first-time buyer relief", () => {
  assert.equal(sdlt(300_000, "firstTime"), 0);
  assert.equal(sdlt(450_000, "firstTime"), 7_500);
  assert.equal(sdlt(500_000, "firstTime"), 10_000);
});

test("first-time buyers over £500,000 pay standard rates on the whole price", () => {
  const r = calculateStampDuty({
    price: 500_001,
    buyer: "firstTime",
    nonResident: false,
  });
  assert.equal(r.overFirstTimeCap, true);
  assert.equal(r.firstTimeReliefApplied, false);
  assert.equal(r.tax, sdlt(500_001));
});

test("additional property surcharge adds 5 points to every band", () => {
  // £300,000: standard 5,000 + 5% of £300k
  assert.equal(sdlt(300_000, "additional"), 20_000);
  // Below £40,000 no surcharge (and the standard nil band applies)
  assert.equal(sdlt(39_999, "additional"), 0);
  assert.equal(sdlt(40_000, "additional"), 2_000);
});

test("non-resident surcharge adds 2 points, and stacks with others", () => {
  assert.equal(sdlt(300_000, "mover", true), 11_000);
  assert.equal(sdlt(300_000, "firstTime", true), 6_000);
  assert.equal(sdlt(300_000, "additional", true), 26_000);
});

test("tax is rounded down to the pound and the effective rate is consistent", () => {
  const r = calculateStampDuty({
    price: 250_999,
    buyer: "mover",
    nonResident: false,
  });
  // 2,500 + 5% of 999 = 2,549.95 → 2,549
  assert.equal(r.tax, 2_549);
  assert.ok(Math.abs(r.effectiveRate - (2_549 / 250_999) * 100) < 1e-9);
  const total = r.slices.reduce((s, x) => s + x.taxable, 0);
  assert.equal(total, 250_999);
});
