/**
 * Assumptions of the Price War vs Financing comparison, from configs/financing.yaml.
 * Only used to decompose profit into components; the totals shown come from POST /api/projection.
 * shortcut: copied by hand; the API returns totals only.
 */
export const ASSUMPTIONS = {
  marketUnits: 200,
  priceNormal: 4_160_000_000,
  priceDiscount: 3_328_000_000,
  grossProductMargin: 0.25,
  financingPenetration: 0.6,
  tenorYears: 3,
  marginGross: 0.09, // konservatif = false: gross interest margin
  marginConservative: 0.03, // konservatif = true: UTPE net share
  priceWarUnitsFactor: 0.8,
  financingUnitsFactor: 1.1,
} as const;

export type Breakdown = { units: number; revenue: number; productProfit: number; financingProfit: number };

export function priceWarBreakdown(a = ASSUMPTIONS): Breakdown {
  const units = a.marketUnits * a.priceWarUnitsFactor;
  const revenue = units * a.priceDiscount;
  return { units, revenue, productProfit: revenue * a.grossProductMargin, financingProfit: 0 };
}

export function financingBreakdown(conservative: boolean, a = ASSUMPTIONS): Breakdown {
  const units = a.marketUnits * a.financingUnitsFactor;
  const revenue = units * a.priceNormal;
  const margin = conservative ? a.marginConservative : a.marginGross;
  return { units, revenue, productProfit: revenue * a.grossProductMargin, financingProfit: revenue * a.financingPenetration * margin * a.tenorYears };
}
