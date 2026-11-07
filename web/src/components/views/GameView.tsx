"use client";

import { Callout } from "@/components/Callout";
import { Equation } from "@/components/Equation";
import { Figure } from "@/components/Figure";
import { Footnotes } from "@/components/Footnote";
import { SectionHeader } from "@/components/SectionHeader";
import { ErrorCallout, Loading } from "@/components/States";
import { DataTable, type Column } from "@/components/Table";
import { NashEquilibriumDiagram } from "@/components/illustrations/NashEquilibriumDiagram";
import { PAYOFFS } from "@/content/game";
import { api, type GameResponse } from "@/lib/api";
import { layout, type } from "@/lib/design-system";
import { pureNash, paretoOptimal, utpeDominantStrategy } from "@/lib/gameMath";
import { strategyLabel } from "@/lib/labels";
import { cn } from "@/lib/cn";
import { useApi } from "@/lib/useApi";

const fetchGame = () => api.game();

type Row = { u: number };

function Content({ data }: { data: GameResponse }) {
  const nash = data.equilibria.filter((e) => e.type === "pure").map((e) => ({ utpe: e.utpe_strategy, sany: e.sany_strategy }));
  const isNash = (u: number, s: number) => nash.some((n) => n.utpe === u && n.sany === s);
  const apiPareto = data.equilibria.some((e) => e.type === "pure" && e.pareto_optimal);
  // Cross-check the matrix in content/game.ts against the equilibrium the API computed.
  const local = pureNash(PAYOFFS);
  const consistent = local.length === nash.length && local.every((l) => isNash(l.utpe, l.sany) && paretoOptimal(PAYOFFS, l.utpe, l.sany) === apiPareto);
  const dom = utpeDominantStrategy(PAYOFFS);

  const cell = (u: number, s: number) => (
    <span className={cn("inline-block px-2 py-1", isNash(u, s) && "bg-crimson-bg font-medium text-crimson outline outline-1 outline-crimson")}>
      ({PAYOFFS[u][s][0]}, {PAYOFFS[u][s][1]}){isNash(u, s) && <span aria-label="Nash equilibrium"> ★</span>}
    </span>
  );
  const columns: Column<Row>[] = [
    { key: "u", header: "UTPE ↓ / SANY →", render: (r) => strategyLabel("UTPE", r.u) },
    { key: "s0", header: `SANY · ${strategyLabel("SANY", 0)}`, align: "right", render: (r) => cell(r.u, 0) },
    { key: "s1", header: `SANY · ${strategyLabel("SANY", 1)}`, align: "right", render: (r) => cell(r.u, 1) },
  ];

  return (
    <>
      <Figure n={1} caption="Payoff plane of the UTPE–SANY pricing game. The Nash equilibrium reported by the API is marked." source="Equilibrium: POST /api/game. Payoffs: configs/games/pricing_war.yaml." notes="Payoffs in Rp miliar, written (UTPE, SANY).">
        <NashEquilibriumDiagram payoffs={PAYOFFS} nash={nash} />
      </Figure>
      <DataTable n={1} caption="Payoff matrix, (UTPE, SANY) in Rp miliar; ★ marks the Nash equilibrium" columns={columns} rows={[{ u: 0 }, { u: 1 }]} rowKey={(r) => String(r.u)} surface="alt" source="configs/games/pricing_war.yaml; equilibrium from POST /api/game." />

      {!consistent && (
        <Callout variant="important" title="Inconsistency">The equilibrium returned by the API does not match the payoff matrix listed here. Treat the highlighted cell as the API result.</Callout>
      )}

      <div className="mt-16">
        <SectionHeader number="04.3" title="Interpretation" level={3} />
        <div className={cn(layout.reading, "!mx-0 space-y-4")}>
          {dom !== null && (
            <p className={type.body}>
              {strategyLabel("UTPE", dom)} is a dominant strategy for UTPE: its payoff is higher whatever SANY plays ({PAYOFFS[dom][0][0]} against {PAYOFFS[1 - dom][0][0]} when SANY holds {strategyLabel("SANY", 0)}; {PAYOFFS[dom][1][0]} against {PAYOFFS[1 - dom][1][0]} when SANY plays {strategyLabel("SANY", 1)}).
            </p>
          )}
          {nash.map((n) => (
            <p key={`${n.utpe}${n.sany}`} className={type.body}>
              The equilibrium is {strategyLabel("UTPE", n.utpe)} against {strategyLabel("SANY", n.sany)}, with payoff ({data.equilibria[0].payoff[0]}, {data.equilibria[0].payoff[1]}). {apiPareto ? "It is Pareto optimal: no other cell improves both players." : "It is not Pareto optimal."}
            </p>
          ))}
        </div>
        <Callout variant="important" title="Strategic implication (proposal, not computed)">
          A discount is a dominated response for UTPE, so the lever is to raise its payoff in the (Premium + Financing, Harga Premium) cell, currently ({PAYOFFS[0][0][0]}, {PAYOFFS[0][0][1]}), by making SANY&apos;s aggressive pricing less attractive through financing and shorter lead times. The model does not estimate that effect.
        </Callout>
        <Equation n={2} label="Nash condition: no player gains by deviating alone">
          u_i(s_i*, s_-i*) ≥ u_i(s_i, s_-i*) for every player i and every strategy s_i
        </Equation>
      </div>
      <Footnotes items={["Source: utpe.analysis.game_theory; configs/games/pricing_war.yaml."]} />
    </>
  );
}

export function GameView() {
  const { data, error, retry, cached } = useApi(fetchGame, "game");
  if (error) return <ErrorCallout error={error} onRetry={retry} cachedAt={cached?.at}>{cached && <Content data={cached.data} />}</ErrorCallout>;
  if (!data) return <Loading />;
  return <Content data={data} />;
}
