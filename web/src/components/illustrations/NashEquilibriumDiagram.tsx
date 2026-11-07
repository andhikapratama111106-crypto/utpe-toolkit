import { strategyLabel } from "@/lib/labels";

type Props = {
  /** payoffs[u][s] = [UTPE, SANY], Rp miliar */
  payoffs: readonly (readonly [number, number])[][];
  /** Equilibrium cells reported by the API */
  nash: { utpe: number; sany: number }[];
};

/** 2x2 strategy plane. Columns = SANY strategies, rows = UTPE strategies; Nash cell marked and labelled. */
export function NashEquilibriumDiagram({ payoffs, nash }: Props) {
  const L = 150, T = 20, cw = 220, ch = 110;
  const isNash = (u: number, s: number) => nash.some((n) => n.utpe === u && n.sany === s);
  return (
    <svg viewBox="0 0 640 330" role="img" aria-labelledby="nash-t nash-d" className="h-auto w-full text-ink">
      <title id="nash-t">Payoff plane of the UTPE and SANY pricing game</title>
      <desc id="nash-d">{`Four cells. ${[0, 1].flatMap((u) => [0, 1].map((s) => `UTPE ${strategyLabel("UTPE", u)} against SANY ${strategyLabel("SANY", s)}: payoff ${payoffs[u][s][0]}, ${payoffs[u][s][1]}${isNash(u, s) ? " (Nash equilibrium)" : ""}`)).join("; ")}.`}</desc>
      {[0, 1].map((u) =>
        [0, 1].map((s) => {
          const cx = L + s * cw, cy = T + u * ch, on = isNash(u, s);
          return (
            <g key={`${u}${s}`}>
              <rect x={cx} y={cy} width={cw} height={ch} className={on ? "fill-crimson-bg stroke-crimson" : "fill-paper-alt stroke-rule"} strokeWidth={on ? 1.5 : 1} />
              <text x={cx + cw / 2} y={cy + ch / 2 + (on ? 4 : 5)} textAnchor="middle" className={`font-mono text-[15px] ${on ? "fill-ink" : "fill-ink-faint"}`}>({payoffs[u][s][0]}, {payoffs[u][s][1]})</text>
              {on && (
                <>
                  <circle cx={cx + cw / 2} cy={cy + 28} r="4" className="fill-crimson" />
                  <text x={cx + cw / 2} y={cy + ch - 18} textAnchor="middle" className="fill-crimson font-mono text-[11px]">Nash ({payoffs[u][s][0]}, {payoffs[u][s][1]})</text>
                </>
              )}
            </g>
          );
        }),
      )}
      {/* axes */}
      <line x1={L} y1={T + 2 * ch + 14} x2={L + 2 * cw} y2={T + 2 * ch + 14} className="stroke-ink" strokeWidth="1" />
      <line x1={L - 14} y1={T} x2={L - 14} y2={T + 2 * ch} className="stroke-ink" strokeWidth="1" />
      {[0, 1].map((s) => <text key={s} x={L + s * cw + cw / 2} y={T + 2 * ch + 30} textAnchor="middle" className="fill-ink-medium font-sans text-[11px]">{strategyLabel("SANY", s)}</text>)}
      <text x={L + cw} y={T + 2 * ch + 50} textAnchor="middle" className="fill-ink font-sans text-[11px] font-medium">SANY strategy →</text>
      {[0, 1].map((u) => <text key={u} x={L - 22} y={T + u * ch + ch / 2 + 4} textAnchor="end" className="fill-ink-medium font-sans text-[11px]">{strategyLabel("UTPE", u)}</text>)}
      <text transform={`translate(12 ${T + ch}) rotate(-90)`} textAnchor="middle" className="fill-ink font-sans text-[11px] font-medium">UTPE strategy →</text>
      <text x={L + 2 * cw} y={T + 2 * ch + 50} textAnchor="end" className="fill-ink-faint font-mono text-[9px]">payoff (UTPE, SANY), Rp miliar</text>
    </svg>
  );
}
