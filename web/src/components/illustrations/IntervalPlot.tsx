import { rp } from "@/lib/format";

type Props = { p10: number; p50: number; p90: number; baseline: number; label: string };

/** Interval plot of simulated cost per hour: P10–P90 bar, P50 tick, deterministic baseline as a dashed guide. */
export function IntervalPlot({ p10, p50, p90, baseline, label }: Props) {
  const W = 640, H = 170, L = 24, R = 24, y = 80;
  const lo = Math.floor((Math.min(p10, baseline) - 40000) / 50000) * 50000;
  const hi = Math.ceil((Math.max(p90, baseline) + 40000) / 50000) * 50000;
  const sx = (v: number) => L + ((v - lo) / (hi - lo)) * (W - L - R);
  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += 50000) ticks.push(t);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="ip-t ip-d" className="h-auto w-full text-ink">
      <title id="ip-t">Simulated cost per hour, P10 to P90</title>
      <desc id="ip-d">{`P10 Rp ${rp(p10)}, P50 Rp ${rp(p50)}, P90 Rp ${rp(p90)}; deterministic baseline Rp ${rp(baseline)}.`}</desc>
      <line x1={L} x2={W - R} y1={y + 30} y2={y + 30} className="stroke-ink" strokeWidth="1.5" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={sx(t)} x2={sx(t)} y1={y + 30} y2={y + 35} className="stroke-ink" strokeWidth="1" />
          <text x={sx(t)} y={y + 48} textAnchor="middle" className="fill-ink-faint font-sans text-[10px]">{rp(t)}</text>
        </g>
      ))}
      <rect x={sx(p10)} y={y - 8} width={sx(p90) - sx(p10)} height="16" className="fill-ink" opacity="0.85" />
      <line x1={sx(p50)} x2={sx(p50)} y1={y - 18} y2={y + 18} className="stroke-paper" strokeWidth="2" />
      <line x1={sx(baseline)} x2={sx(baseline)} y1={y - 34} y2={y + 30} className="stroke-crimson" strokeWidth="1" strokeDasharray="4 3" />
      <text x={sx(p10)} y={y - 16} textAnchor="middle" className="fill-ink font-mono text-[10px]">P10 {rp(p10)}</text>
      <text x={sx(p50)} y={y - 16} textAnchor="middle" className="fill-ink font-mono text-[10px]">P50 {rp(p50)}</text>
      <text x={sx(p90)} y={y - 16} textAnchor="middle" className="fill-ink font-mono text-[10px]">P90 {rp(p90)}</text>
      <text x={sx(baseline)} y={y - 40} textAnchor="middle" className="fill-crimson font-mono text-[10px]">Baseline {rp(baseline)}</text>
      <text x={(L + W - R) / 2} y={H - 8} textAnchor="middle" className="fill-ink-medium font-sans text-[11px]">{label}</text>
    </svg>
  );
}
