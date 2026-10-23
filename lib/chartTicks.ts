/**
 * Round axis ticks for money charts: 0, 10k, 20k, 30k rather than the
 * 0, 9.5k, 19k, 28.5k a chart library picks on its own. The step is a
 * 1, 2, 2.5 or 5 multiple of a power of ten.
 */
export function niceTicks(maxValue: number, targetSteps = 4): number[] {
  if (!(maxValue > 0)) return [0];
  const roughStep = maxValue / targetSteps;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const step =
    [1, 2, 2.5, 5, 10]
      .map((multiple) => multiple * magnitude)
      .find((candidate) => candidate >= roughStep) ?? 10 * magnitude;
  const ticks: number[] = [];
  for (let tick = 0; tick < maxValue + step; tick += step) {
    ticks.push(tick);
  }
  return ticks;
}

/** "$950", "$25k", "$12.5k", "$1.2M" for axis labels. */
export function compactMoney(value: number): string {
  if (value >= 1_000_000) {
    return `$${Number((value / 1_000_000).toFixed(1))}M`;
  }
  if (value >= 1000) return `$${Number((value / 1000).toFixed(1))}k`;
  return `$${Math.round(value)}`;
}
