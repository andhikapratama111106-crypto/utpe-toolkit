const STEPS = ["ORE", "STEEL", "COMPONENT", "ASSEMBLY", "UTPE", "DEALER", "CUSTOMER"];
const EDGES = ["extraction", "rolling", "machining", "build", "distribution", "sale"];

/** Linear flow with square boxes and 1px arrows; brackets the segment local sourcing shortens. */
export function SupplyChainFlow({ note }: { note: string }) {
  const w = 104, h = 40, gap = 30, x0 = 12, y = 90;
  const x = (i: number) => x0 + i * (w + gap);
  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 960 190" role="img" aria-labelledby="scf-t scf-d" className="h-auto w-full min-w-[760px] text-ink">
        <title id="scf-t">Supply chain flow from ore to customer</title>
        <desc id="scf-d">Seven stages: ore, steel, component, assembly, UTPE, dealer, customer. Local sourcing shortens the component to assembly segment. {note}</desc>
        <defs>
          <marker id="scf-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8" className="fill-none stroke-ink" strokeWidth="1" />
          </marker>
        </defs>
        {STEPS.map((s, i) => (
          <g key={s}>
            <rect x={x(i)} y={y} width={w} height={h} className={s === "UTPE" ? "fill-crimson-bg stroke-crimson" : "fill-paper stroke-ink"} strokeWidth={s === "UTPE" ? 1.5 : 1} />
            <text x={x(i) + w / 2} y={y + h / 2 + 4} textAnchor="middle" className={`font-mono text-[11px] ${s === "UTPE" ? "fill-crimson" : "fill-ink"}`}>{s}</text>
            {i < STEPS.length - 1 && (
              <>
                <line x1={x(i) + w} y1={y + h / 2} x2={x(i + 1) - 1} y2={y + h / 2} className="stroke-ink" strokeWidth="1" markerEnd="url(#scf-arrow)" />
                <text x={x(i) + w + gap / 2} y={y + h / 2 - 8} textAnchor="middle" className="fill-ink-faint font-mono text-[8px]">{EDGES[i]}</text>
              </>
            )}
          </g>
        ))}
        {/* bracket over COMPONENT -> ASSEMBLY */}
        <path d={`M${x(2)} ${y - 14} V${y - 24} H${x(3) + w} V${y - 14}`} className="fill-none stroke-crimson" strokeWidth="1" strokeDasharray="3 2" />
        <text x={(x(2) + x(3) + w) / 2} y={y - 32} textAnchor="middle" className="fill-crimson font-mono text-[10px]">{note}</text>
        <line x1={x0} y1="160" x2={x(6) + w} y2="160" className="stroke-ink-ghost" strokeWidth="0.5" />
        <text x={x0} y="178" className="fill-ink-faint font-mono text-[9px]">upstream</text>
        <text x={x(6) + w} y="178" textAnchor="end" className="fill-ink-faint font-mono text-[9px]">downstream</text>
      </svg>
    </div>
  );
}
