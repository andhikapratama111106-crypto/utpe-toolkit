import { integer } from "@/lib/format";

type Bin = { x0: number; x1: number; count: number };
type Props = { bins: readonly Bin[]; p10: number; p50: number; p90: number; n: number; xLabel: string; unitLabel: string; shadeNegative?: boolean };

/** Histogram of simulation draws with P10/P50/P90 guides; bins below zero are cross-hatched. */
export function MonteCarloHistogram({ bins, p10, p50, p90, n, xLabel, unitLabel, shadeNegative }: Props) {
  const W = 640, H = 300, L = 56, R = 16, T = 34, B = 52;
  const xmin = bins[0].x0, xmax = bins[bins.length - 1].x1;
  const ymax = Math.max(...bins.map((b) => b.count));
  const yTop = Math.ceil(ymax / 100) * 100;
  const sx = (v: number) => L + ((v - xmin) / (xmax - xmin)) * (W - L - R);
  const sy = (v: number) => H - B - (v / yTop) * (H - B - T);
  const xticks: number[] = [];
  for (let t = Math.ceil(xmin / 200) * 200; t <= xmax; t += 200) xticks.push(t);
  const yticks = [0, 1, 2, 3, 4].map((i) => (yTop / 4) * i);
  const guides = [{ v: p10, l: "P10" }, { v: p50, l: "P50" }, { v: p90, l: "P90" }];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="mc-t mc-d" className="h-auto w-full text-ink">
      <title id="mc-t">{`Histogram of ${integer(n)} simulation draws`}</title>
      <desc id="mc-d">{`${xLabel}. P10 ${integer(p10)}, P50 ${integer(p50)}, P90 ${integer(p90)} ${unitLabel}.`}</desc>
      <defs>
        <pattern id="mc-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" className="stroke-crimson" strokeWidth="1" />
        </pattern>
      </defs>
      {yticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={sy(t)} y2={sy(t)} className="stroke-paper-deep" strokeWidth="0.75" opacity="0.8" />
          <text x={L - 8} y={sy(t) + 3} textAnchor="end" className="fill-ink-faint font-sans text-[10px]">{integer(t)}</text>
        </g>
      ))}
      {bins.map((b) => {
        const neg = shadeNegative && b.x1 <= 0;
        const x = sx(b.x0) + 0.5, w = Math.max(sx(b.x1) - sx(b.x0) - 1, 1);
        return <rect key={b.x0} x={x} y={sy(b.count)} width={w} height={sy(0) - sy(b.count)} className={neg ? "fill-crimson" : "fill-ink"} opacity={neg ? 0.85 : 0.82} />;
      })}
      {shadeNegative && xmin < 0 && (
        <rect x={sx(xmin)} y={T} width={sx(0) - sx(xmin)} height={H - B - T} fill="url(#mc-hatch)" opacity="0.6" />
      )}
      {/* axes */}
      <line x1={L} x2={W - R} y1={sy(0)} y2={sy(0)} className="stroke-ink" strokeWidth="1.5" />
      <line x1={L} x2={L} y1={T} y2={sy(0)} className="stroke-ink" strokeWidth="1" />
      {xticks.map((t) => (
        <g key={t}>
          <line x1={sx(t)} x2={sx(t)} y1={sy(0)} y2={sy(0) + 4} className="stroke-ink" strokeWidth="1" />
          <text x={sx(t)} y={sy(0) + 16} textAnchor="middle" className="fill-ink-faint font-sans text-[10px]">{integer(t)}</text>
        </g>
      ))}
      {xmin < 0 && <line x1={sx(0)} x2={sx(0)} y1={T} y2={sy(0)} className="stroke-ink" strokeWidth="1" />}
      {guides.map((g, i) => (
        <g key={g.l}>
          <line x1={sx(g.v)} x2={sx(g.v)} y1={T - 6} y2={sy(0)} className="stroke-crimson" strokeWidth="1" strokeDasharray="4 3" />
          <text x={sx(g.v)} y={T - 12 - (i === 1 ? 0 : 0)} textAnchor="middle" className="fill-crimson font-mono text-[10px]">{g.l} = {integer(g.v)}</text>
        </g>
      ))}
      <text x={(L + W - R) / 2} y={H - 10} textAnchor="middle" className="fill-ink-medium font-sans text-[11px]">{xLabel}</text>
      <text transform={`translate(14 ${(T + H - B) / 2}) rotate(-90)`} textAnchor="middle" className="fill-ink-medium font-sans text-[11px]">Frequency (draws per bin)</text>
    </svg>
  );
}
