import { model } from "./model";

/** Numbered references for inline [n] citations (Home § 06). Entries 2, 3, 5 come from the model's Sources sheet. */
export const REFERENCES: { n: number; text: string; href?: string }[] = [
  { n: 1, text: "UTPE Toolkit (2026). validasi_konservatif.csv, data/raw. Profit Price War and Financing (konservatif 3%)." },
  { n: 2, text: "PT United Tractors Pandu Engineering. (2026). When quality is no longer enough: How UTPE can win in a market-driven by price and speed [Case book, NBCC Pathseeker 2026; data dummy]. (Source S01)" },
  { n: 3, text: "Tak ditunda lagi, kebijakan Zero ODOL dimulai 1 Januari 2027. (2025, 6 Oktober). Kontan.co.id. (Source S13)", href: model.sources.find((x) => x.id === "S13")?.url ?? undefined },
  { n: 4, text: "Tufte, E. R. (2001). The visual display of quantitative information (2nd ed.). Graphics Press." },
  { n: 5, text: "Ellram, L. M. (1995). Total cost of ownership: An analysis approach for purchasing. International Journal of Physical Distribution & Logistics Management, 25(8), 4–23. (Source A04)" },
];
