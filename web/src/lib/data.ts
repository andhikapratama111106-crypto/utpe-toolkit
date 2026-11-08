// Angka kunci + data statis cadangan. Sumber: configs/*.yaml, data/processed/*.csv, output/validation_report.md.
// Dipakai saat /api/* belum siap, dan sebagai nilai awal render.

export const KEY = {
  costPerHour: 754_067, // UTPE Product B, Rp/jam
  profitPriceWar: 133_120_000_000,
  profitFinancing: 278_220_800_000, // Financing konservatif 3%
  npvP10: 127_000_000_000,
  npvP50: 398_000_000_000,
  npvP90: 717_000_000_000,
  nash: [200, 150] as const, // (UTPE, SANY) dalam Rp miliar
};

// Asumsi bersama (configs/tco_base.yaml).
export const ASSUME = { solar: 25_200, bbm: 12, operator: 50_000 };

export type Unit = { merek: string; model: string; harga: number; lifetime: number; maint: number };
export const FLEET: Unit[] = [
  { merek: "Komatsu (Premium)", model: "PC200-10M0", harga: 1_025_000_000, lifetime: 10_000, maint: 62_500 },
  { merek: "SANY (China)", model: "SY215C", harga: 600_000_000, lifetime: 7_000, maint: 45_000 },
  { merek: "UTPE (Patria)", model: "Product B", harga: 4_160_000_000, lifetime: 12_000, maint: 55_000 },
];

/** Rumus TCO yang sama dengan utpe.analysis.tco (dipakai untuk rincian biaya dan kalkulator cadangan). */
export function tcoCalc(u: Pick<Unit, "harga" | "lifetime" | "maint">) {
  const bbm = ASSUME.bbm * ASSUME.solar * u.lifetime;
  const maint = u.maint * u.lifetime;
  const operator = ASSUME.operator * u.lifetime;
  const total = u.harga + bbm + maint + operator;
  return { harga: u.harga, bbm, maint, operator, total, perHour: total / u.lifetime };
}

export const SCENARIOS_FALLBACK = [
  { skenario: "Baseline (Case Book)", cost_per_hour: 754_066.67 },
  { skenario: "Diskon Harga 20%", cost_per_hour: 684_733.33 },
  { skenario: "Lifetime 15.000 Jam", cost_per_hour: 684_733.33 },
  { skenario: "Diskon 20% + Lifetime 15rb", cost_per_hour: 629_266.67 },
  { skenario: "Diskon 30% + Maint 40k + Lifetime 15rb", cost_per_hour: 586_533.33 },
];
// Monte Carlo cost/jam, n=10.000, seed 42.
export const MC_FALLBACK = { p10: 700_292, p50: 753_553, p90: 823_705 };

export const PROJECTION_FALLBACK = {
  price_war: { profit: KEY.profitPriceWar },
  financing: { profit: KEY.profitFinancing },
  delta: {
    absolute: KEY.profitFinancing - KEY.profitPriceWar,
    percentage: ((KEY.profitFinancing - KEY.profitPriceWar) / KEY.profitPriceWar) * 100,
  },
};

// configs/games/pricing_war.yaml: payoff[i][j] = [UTPE, SANY], Rp miliar.
export const GAME = {
  utpe: ["Premium + Financing", "Diskon Harga"],
  sany: ["Harga Premium", "Harga Agresif"],
  payoff: [
    [[278, 100], [200, 150]],
    [[150, 120], [133, 133]],
  ],
};
export const GAME_FALLBACK = {
  equilibria: [{ type: "pure", utpe_strategy: 0, sany_strategy: 1, payoff: [200, 150], pareto_optimal: true }],
};

export type Check = { label: string; csv_value: number | null; expected: number; status: string };
export const VALIDATE_FALLBACK: { passed: boolean; checks: Check[] } = {
  passed: true,
  checks: [
    { label: "Cost/hour Komatsu", csv_value: 517_400, expected: 517_400, status: "OK" },
    { label: "Cost/hour SANY", csv_value: 483_114, expected: 483_114, status: "OK" },
    { label: "Cost/hour UTPE", csv_value: 754_067, expected: 754_067, status: "OK" },
    { label: "Profit Price War", csv_value: 133_120_000_000, expected: 133_120_000_000, status: "OK" },
    { label: "Profit Financing Konservatif", csv_value: 278_220_800_000, expected: 278_220_800_000, status: "OK" },
  ],
};

// ---- format angka (id-ID: titik sebagai pemisah ribuan) ----
const nf = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
export const num = (n: number) => nf.format(n);
export const rp = (n: number) => `Rp ${nf.format(n)}`;
export const miliar = (n: number) => `${nf.format(n / 1e9)} M`;
