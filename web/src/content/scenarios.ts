/**
 * Inputs of the five deterministic scenarios (Rp, hours, Rp/hour), keyed by the name the API returns.
 * Source: configs/scenarios.yaml. The API returns only name + cost_per_hour, so inputs are listed here.
 * shortcut: copied by hand; replace if /api/sensitivity starts returning the inputs.
 */
export const SCENARIO_INPUTS: Record<string, { price: number; lifetime: number; maint: number }> = {
  "Baseline (Case Book)": { price: 4_160_000_000, lifetime: 12_000, maint: 55_000 },
  "Diskon Harga 20%": { price: 3_328_000_000, lifetime: 12_000, maint: 55_000 },
  "Lifetime 15.000 Jam": { price: 4_160_000_000, lifetime: 15_000, maint: 55_000 },
  "Diskon 20% + Lifetime 15rb": { price: 3_328_000_000, lifetime: 15_000, maint: 55_000 },
  "Diskon 30% + Maint 40k + Lifetime 15rb": { price: 2_912_000_000, lifetime: 15_000, maint: 40_000 },
};
