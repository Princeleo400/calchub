import { test } from "node:test";
import assert from "node:assert/strict";
import { compactMoney, niceTicks } from "./chartTicks.ts";

test("ticks are round and cover the largest value", () => {
  assert.deepEqual(niceTicks(36_904), [0, 10_000, 20_000, 30_000, 40_000]);
  assert.deepEqual(niceTicks(9_000), [0, 2_500, 5_000, 7_500, 10_000]);
  assert.deepEqual(niceTicks(155_000), [0, 50_000, 100_000, 150_000, 200_000]);
  assert.deepEqual(niceTicks(40_000), [0, 10_000, 20_000, 30_000, 40_000]);
  assert.deepEqual(niceTicks(0), [0]);
});

test("compact labels", () => {
  assert.equal(compactMoney(950), "$950");
  assert.equal(compactMoney(25_000), "$25k");
  assert.equal(compactMoney(2_500), "$2.5k");
  assert.equal(compactMoney(1_250_000), "$1.3M");
});
