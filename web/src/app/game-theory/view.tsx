"use client";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Panel, Stat, axis, tooltipStyle } from "@/components/ui";
import { api, arr, isNum, numAt, rec, useLive } from "@/lib/api";
import { GAME, GAME_FALLBACK, KEY } from "@/lib/data";

type Eq = { type: string; utpe_strategy: number; sany_strategy: number; payoff: number[]; pareto_optimal: boolean };

export function GameView() {
  const { data, source } = useLive(
    "game",
    async (s) => {
      const r = rec(await api("/api/game", s, { game: "bertrand", config: "pricing_war.yaml" }));
      const equilibria = arr(r.equilibria).map((x): Eq => {
        const o = rec(x);
        const payoff = arr(o.payoff);
        const u = numAt(o, "utpe_strategy");
        const sa = numAt(o, "sany_strategy");
        if (payoff.length !== 2 || !payoff.every(isNum) || !(u in GAME.utpe) || !(sa in GAME.sany)) throw new Error("equilibrium tidak valid");
        return { type: String(o.type), utpe_strategy: u, sany_strategy: sa, payoff: payoff as number[], pareto_optimal: o.pareto_optimal === true };
      });
      if (equilibria.length === 0) throw new Error("tanpa equilibrium");
      return { equilibria };
    },
    GAME_FALLBACK as { equilibria: Eq[] },
  );

  const nash = data.equilibria[0];
  const isNash = (i: number, j: number) => data.equilibria.some((e) => e.utpe_strategy === i && e.sany_strategy === j);
  const bars = GAME.payoff.flatMap((row, i) =>
    row.map((p, j) => ({ name: `${i === 0 ? "Premium" : "Diskon"} / ${j === 0 ? "Premium" : "Agresif"}`, UTPE: p[0], SANY: p[1] })),
  );

  return (
    <div className="wrap">
      <PageHeader
        eyebrow="Game theory"
        title="Kenapa SANY akan menekan harga."
        lead="Model Bertrand UTPE lawan SANY. Titik Nash adalah pasangan strategi yang tidak ingin diubah sepihak oleh siapa pun."
        source={source}
      />
      <div className="grid g3">
        <Stat label="Nash equilibrium" tint="orange" hint="(UTPE, SANY), Rp miliar">
          ({nash.payoff[0]}, {nash.payoff[1]})
        </Stat>
        <Stat label="Strategi UTPE" tint="accent" hint={nash.pareto_optimal ? "Pareto optimal" : "Tidak Pareto optimal"} delay={0.08}>
          <span style={{ fontSize: 26 }}>{GAME.utpe[nash.utpe_strategy]}</span>
        </Stat>
        <Stat label="Respons SANY" tint="purple" hint={`Ekuilibrium ${nash.type}`} delay={0.16}>
          <span style={{ fontSize: 26 }}>{GAME.sany[nash.sany_strategy]}</span>
        </Stat>
      </div>

      <div className="section grid g2">
        <Panel title="Matriks payoff" note="(UTPE, SANY) dalam Rp miliar. Kotak biru adalah Nash.">
          <div className="matrix" role="table" aria-label="Matriks payoff">
            <div />
            {GAME.sany.map((s) => <div key={s} className="mx-head">SANY: {s}</div>)}
            {GAME.payoff.map((row, i) => [
              <div key={`h${i}`} className="mx-head">UTPE: {GAME.utpe[i]}</div>,
              ...row.map((p, j) => (
                <motion.div
                  key={`${i}${j}`}
                  className={`mx-cell${isNash(i, j) ? " nash" : ""}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + (i * 2 + j) * 0.08, type: "spring", stiffness: 260, damping: 24 }}
                >
                  ({p[0]}, {p[1]})
                  {isNash(i, j) && <small>Nash</small>}
                </motion.div>
              )),
            ])}
          </div>
        </Panel>
        <Panel title="Payoff per kombinasi" note={`Titik Nash tetap (${KEY.nash[0]}, ${KEY.nash[1]}) jika konfigurasi tidak berubah.`} delay={0.1}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bars}>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="name" {...axis} interval={0} tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <YAxis {...axis} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ color: "var(--muted)", fontSize: 12 }} />
              <Bar dataKey="UTPE" fill="var(--accent)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="SANY" fill="var(--orange)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}
