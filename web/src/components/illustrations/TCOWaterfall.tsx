import { signed, rp } from "@/lib/format";

type Item = { label: string; value: number; highlight?: boolean };

/** Bars from a 2px zero baseline with step connectors; the deltas between profiles are printed between bars. */
export function TCOWaterfall({ items }: { items: Item[] }) {
  const W = 640, H = 320, L = 64, R = 16, T = 30, B = 56;
  const top = Math.ceil(Math.max(...items.map((i) => i.value)) / 200000) * 200000;
  const sy = (v: number) => H - B - (v / top) * (H - B - T);
  const slot = (W - L - R) / items.length, bw = 64;
  const bx = (i: number) => L + slot * i + (slot - bw) / 2;
  const yticks = Array.from({ length: top / 200000 + 1 }, (_, i) => i * 200000);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="wf-t wf-d" className="h-auto w-full text-ink">
      <title id="wf-t">Cost per hour by equipment profile</title>
      <desc id="wf-d">{items.map((i) => `${i.label} Rp ${rp(i.value)}`).join("; ")}. Cost per hour in rupiah.</desc>
      {yticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={sy(t)} y2={sy(t)} className="stroke-paper-deep" strokeWidth="0.75" opacity="0.8" />
          <text x={L - 8} y={sy(t) + 3} textAnchor="end" className="fill-ink-faint font-sans text-[10px]">{rp(t)}</text>
        </g>
      ))}
      {items.map((it, i) => (
        <g key={it.label}>
          <rect x={bx(i)} y={sy(it.value)} width={bw} height={sy(0) - sy(it.value)} className={it.highlight ? "fill-crimson" : "fill-ink-faint"} />
          <text x={bx(i) + bw / 2} y={sy(it.value) - 8} textAnchor="middle" className="fill-ink font-mono text-[13px]">{rp(it.value)}</text>
          <text x={bx(i) + bw / 2} y={sy(0) + 18} textAnchor="middle" className="fill-ink-medium font-sans text-[11px]">{it.label}</text>
          {i < items.length - 1 && (
            <>
              <line x1={bx(i) + bw} x2={bx(i + 1)} y1={sy(it.value)} y2={sy(it.value)} className="stroke-ink-faint" strokeWidth="0.75" strokeDasharray="3 2" />
              <text x={(bx(i) + bw + bx(i + 1)) / 2} y={sy(it.value) - 6} textAnchor="middle" className={`font-mono text-[10px] ${items[i + 1].value > it.value ? "fill-neg" : "fill-pos"}`}>{signed(items[i + 1].value - it.value)}</text>
            </>
          )}
        </g>
      ))}
      <line x1={L} x2={W - R} y1={sy(0)} y2={sy(0)} className="stroke-ink" strokeWidth="2" />
      <line x1={L} x2={L} y1={T - 6} y2={sy(0)} className="stroke-ink" strokeWidth="1" />
      <text transform={`translate(14 ${(T + H - B) / 2}) rotate(-90)`} textAnchor="middle" className="fill-ink-medium font-sans text-[11px]">Cost per Hour (Rp)</text>
      <text x={(L + W - R) / 2} y={H - 10} textAnchor="middle" className="fill-ink-medium font-sans text-[11px]">Equipment profile</text>
    </svg>
  );
}
