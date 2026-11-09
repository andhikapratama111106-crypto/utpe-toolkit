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

// ---- Biaya per Tahun (configs/products_casebook.yaml; sama dengan Lampiran A Executive Summary) ----
// Harga Rp miliar, umur tahun (Case Book, Supporting Data I).
export type Produk = { produk: string; hp: number; up: number; hc: number; uc: number };
export const PRODUK: Produk[] = [
  { produk: "A", hp: 1.2, up: 10, hc: 0.9, uc: 3.5 },
  { produk: "B", hp: 4.1, up: 15, hc: 3.7, uc: 10 },
  { produk: "C", hp: 0.8, up: 12, hc: 0.6, uc: 7 },
  { produk: "D", hp: 0.17, up: 7, hc: 0.15, uc: 3 },
];
export const C_ESSENTIAL = { harga: 0.68, umur: 10 };
export const FLEX = { tenor: 4, sisa: 0.8 };
export const MARGIN_KONTRIBUSI = 0.3;

/** Rumus yang sama dengan utpe.analysis.eac (dipakai saat API belum siap). */
export const crf = (r: number, n: number) => (r === 0 ? 1 / n : r / (1 - (1 + r) ** -n));
export const eac = (harga: number, umur: number, r: number) => harga * crf(r, umur);

export function flexCost(harga: number, umur: number, r: number, tenor = FLEX.tenor, sisa = FLEX.sisa) {
  let pv = 0;
  let t = 0;
  while (t < tenor - 1e-9) {
    pv += harga / (1 + r) ** t;
    if (t + umur >= tenor - 1e-9) {
      pv -= (sisa * harga * Math.max(0, 1 - (tenor - t) / umur)) / (1 + r) ** tenor;
      break;
    }
    t += umur;
  }
  return pv * crf(r, tenor);
}

export function diskontoImpas(p: Produk): number | null {
  const f = (x: number) => eac(p.hp, p.up, x) - eac(p.hc, p.uc, x);
  let lo = 1e-6;
  let hi = 5;
  if (!(f(lo) < 0 && f(hi) > 0)) return null;
  for (let i = 0; i < 200; i++) {
    const m = (lo + hi) / 2;
    if (f(m) < 0) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}

export type EacRow = {
  produk: string;
  premi_harga: number;
  selisih_biaya_th_tanpa_diskonto: number;
  eac_patria: number;
  eac_china: number;
  selisih_eac: number;
  flex_patria: number;
  flex_china: number;
  selisih_flex: number;
  diskonto_impas: number | null;
};

export function eacTable(r = 0.12): EacRow[] {
  return PRODUK.map((p) => {
    const ep = eac(p.hp, p.up, r);
    const ec = eac(p.hc, p.uc, r);
    const fp = flexCost(p.hp, p.up, r);
    const fc = flexCost(p.hc, p.uc, r);
    return {
      produk: p.produk,
      premi_harga: p.hp / p.hc - 1,
      selisih_biaya_th_tanpa_diskonto: p.hp / p.up / (p.hc / p.uc) - 1,
      eac_patria: ep,
      eac_china: ec,
      selisih_eac: ep / ec - 1,
      flex_patria: fp,
      flex_china: fc,
      selisih_flex: fp / fc - 1,
      diskonto_impas: diskontoImpas(p),
    };
  });
}

export function diskonVsVolume(harga = 4.16, diskon = 0.2, margin = MARGIN_KONTRIBUSI) {
  const biayaVar = harga * (1 - margin);
  const penuh = harga - biayaVar;
  const setelah = harga * (1 - diskon) - biayaVar;
  return {
    kontribusi_penuh: penuh,
    kontribusi_diskon: setelah,
    penurunan_kontribusi: setelah / penuh - 1,
    volume_impas: setelah > 0 ? penuh / setelah : null,
  };
}

/** Persen gaya id-ID dengan tanda minus tipografis, mis. −35,6%. */
export const pct = (x: number, d = 1, signed = true) => {
  const v = Math.abs(x) < 0.5 * 10 ** -(d + 2) ? 0 : x;
  const s = (v * 100).toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });
  return `${signed && v > 0 ? "+" : ""}${s}%`.replace("-", "−");
};
export const dec = (x: number, d = 3) => x.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });

export type Check = { label: string; csv_value: number | null; expected: number; status: string };
export const VALIDATE_FALLBACK: { passed: boolean; checks: Check[] } = {
  passed: true,
  checks: [
    { label: "Cost/hour Komatsu", csv_value: 517_400, expected: 517_400, status: "OK" },
    { label: "Cost/hour SANY", csv_value: 483_114, expected: 483_114, status: "OK" },
    { label: "Cost/hour UTPE", csv_value: 754_067, expected: 754_067, status: "OK" },
    { label: "Profit Price War", csv_value: 133_120_000_000, expected: 133_120_000_000, status: "OK" },
    { label: "Profit Financing Konservatif", csv_value: 278_220_800_000, expected: 278_220_800_000, status: "OK" },
    { label: "Biaya per tahun: selisih EAC Produk A (%)", csv_value: -35.6, expected: -36, status: "OK" },
    { label: "Biaya per tahun: selisih EAC Produk B (%)", csv_value: -8.1, expected: -8, status: "OK" },
    { label: "Biaya per tahun: selisih EAC Produk C (%)", csv_value: -1.8, expected: -2, status: "OK" },
    { label: "Biaya per tahun: selisih EAC Produk D (%)", csv_value: -40.4, expected: -40, status: "OK" },
    { label: "Biaya per tahun: diskonto impas Produk C (%)", csv_value: 13.3, expected: 13.3, status: "OK" },
  ],
};

// ---- format angka (id-ID: titik sebagai pemisah ribuan) ----
const nf = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
export const num = (n: number) => nf.format(n);
export const rp = (n: number) => `Rp ${nf.format(n)}`;
export const miliar = (n: number) => `${nf.format(n / 1e9)} M`;
