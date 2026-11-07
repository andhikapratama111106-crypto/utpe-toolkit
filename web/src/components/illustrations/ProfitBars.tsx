import { decimal } from "@/lib/format";

type Item = { label: string; value: number; highlight?: boolean; muted?: boolean };

/** Horizontal bars from a zero baseline, value printed at the bar end (values in rupiah, shown in miliar). */
export function ProfitBars({ items }: { items: Item[] }) {
  const W = 640, L = 150, R = 90, rowH = 52, T = 16, B = 44;
  const H = T + items.length * rowH + B;
  const max = Math.ceil(Math.max(...items.map((i) => i.value)) / 1e11) * 1e11;
  const sx = (v: number) => L + (v / max) * (W - L - R);
  const ticks = Array.from({ length: max / 1e11 + 1 }, (_, i) => i * 1e11).filter((_, i) => i % 2 === 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="pb-t pb-d" className="h-auto w-full text-ink">
      <title id="pb-t">Total profit by strategy</title>
      <desc id="pb-d">{items.map((i) => `${i.label}: Rp ${decimal(i.value / 1e9, 2)} M`).join("; ")}.</desc>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={sx(t)} x2={sx(t)} y1={T} y2={H - B} className="stroke-paper-deep" strokeWidth="0.75" opacity="0.8" />
          <text x={sx(t)} y={H - B + 16} textAnchor="middle" className="fill-ink-faint font-sans text-[10px]">{decimal(t / 1e9, 0)}</text>
        </g>
      ))}
      {items.map((it, i) => {
        const y = T + i * rowH + 10;
        return (
          <g key={it.label} opacity={it.muted ? 0.45 : 1}>
            <text x={L - 10} y={y + 17} textAnchor="end" className="fill-ink-medium font-sans text-[12px]">{it.label}</text>
            <rect x={L} y={y} width={sx(it.value) - L} height="26" className={it.highlight ? "fill-crimson" : "fill-ink"} />
            <text x={sx(it.value) + 8} y={y + 18} className="fill-ink font-mono text-[12px]">{decimal(it.value / 1e9, 2)}</text>
          </g>
        );
      })}
      <line x1={L} x2={L} y1={T} y2={H - B} className="stroke-ink" strokeWidth="2" />
      <text x={(L + W - R) / 2} y={H - 8} textAnchor="middle" className="fill-ink-medium font-sans text-[11px]">Total profit (Rp miliar)</text>
    </svg>
  );
}
