/** Tufte-style word-sized chart: 1px line, dot on the last point, no axes. */
export function Sparkline({ values, width = 80, height = 20, label }: { values: number[]; width?: number; height?: number; label: string }) {
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const pts = values.map((v, i) => [2 + (i / (values.length - 1)) * (width - 4), height - 2 - ((v - min) / span) * (height - 4)]);
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="inline-block align-middle text-ink">
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx={last[0]} cy={last[1]} r="2" className="fill-crimson" />
    </svg>
  );
}
