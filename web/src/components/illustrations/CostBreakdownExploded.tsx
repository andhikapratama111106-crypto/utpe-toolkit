import { rp } from "@/lib/format";

export type CostPart = { part: "cab" | "engine" | "hydraulic" | "undercarriage"; label: string; basis: string; value: number };

const ORDER: CostPart["part"][] = ["cab", "engine", "hydraulic", "undercarriage"];

/** Exploded view: one block per cost component, aligned on a dashed axis, labelled with Rp per hour. */
export function CostBreakdownExploded({ parts }: { parts: CostPart[] }) {
  const sorted = ORDER.map((k) => parts.find((p) => p.part === k)).filter((p): p is CostPart => !!p);
  const total = sorted.reduce((s, p) => s + p.value, 0);
  const y0 = 20, gap = 78;
  return (
    <svg viewBox="0 0 640 340" role="img" aria-labelledby="cbe-t cbe-d" className="h-auto w-full text-ink">
      <title id="cbe-t">Exploded cost breakdown of one machine-hour</title>
      <desc id="cbe-d">{`Four components of cost per hour: ${sorted.map((p) => `${p.label} Rp ${rp(p.value)}`).join("; ")}. Total Rp ${rp(total)}.`}</desc>
      <line x1="150" y1="8" x2="150" y2="332" className="stroke-ink-ghost" strokeWidth="0.5" strokeDasharray="4 3" />
      {sorted.map((p, i) => {
        const y = y0 + i * gap;
        const w = 40 + (p.value / total) * 160;
        return (
          <g key={p.part}>
            {/* block */}
            {p.part === "cab" && (<><rect x={150 - w / 2} y={y} width={w} height="56" className="fill-none stroke-ink" /><rect x={150 - w / 2 + 8} y={y + 8} width={w * 0.45} height="26" className="fill-none stroke-ink" strokeWidth="0.5" /></>)}
            {p.part === "engine" && (<><rect x={150 - w / 2} y={y} width={w} height="56" className="fill-none stroke-ink" />{[0.25, 0.5, 0.75].map((f) => <rect key={f} x={150 - w / 2 + w * f - 6} y={y - 8} width="12" height="8" className="fill-none stroke-ink" strokeWidth="0.75" />)}</>)}
            {p.part === "hydraulic" && (<><rect x={150 - w / 2} y={y + 16} width={w} height="24" className="fill-none stroke-ink" /><line x1={150 - w / 2 - 22} y1={y + 28} x2={150 - w / 2} y2={y + 28} className="stroke-ink" /><line x1={150 + w / 2} y1={y + 28} x2={150 + w / 2 + 22} y2={y + 28} className="stroke-ink" strokeWidth="2" /></>)}
            {p.part === "undercarriage" && (<><rect x={150 - w / 2} y={y + 18} width={w} height="34" className="fill-none stroke-ink" />{[-1, 0, 1].map((k) => <circle key={k} cx={150 + k * (w / 3)} cy={y + 35} r="8" className="fill-none stroke-ink" strokeWidth="0.75" />)}</>)}
            {/* leader + label */}
            <line x1={150 + w / 2 + 6} y1={y + 28} x2="330" y2={y + 28} className="stroke-ink-faint" strokeWidth="0.5" />
            <text x="338" y={y + 24} className="fill-ink font-sans text-[12px]">{p.label}</text>
            <text x="338" y={y + 40} className="fill-ink-faint font-mono text-[10px]">{p.basis}</text>
            <text x="630" y={y + 32} textAnchor="end" className={`font-mono text-[14px] ${p.part === "undercarriage" ? "fill-crimson" : "fill-ink"}`}>Rp {rp(p.value)}</text>
          </g>
        );
      })}
      <line x1="338" y1="326" x2="630" y2="326" className="stroke-ink" strokeWidth="1.5" />
      <text x="338" y="338" className="fill-ink-medium font-mono text-[10px]">TOTAL / HOUR</text>
      <text x="630" y="338" textAnchor="end" className="fill-ink font-mono text-[11px]">Rp {rp(total)}</text>
    </svg>
  );
}
