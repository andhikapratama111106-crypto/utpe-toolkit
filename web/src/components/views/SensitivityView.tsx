"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/Button";
import { Callout } from "@/components/Callout";
import { Figure } from "@/components/Figure";
import { Footnotes } from "@/components/Footnote";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { Slider } from "@/components/Slider";
import { Empty, ErrorCallout, Loading } from "@/components/States";
import { DataTable, type Column } from "@/components/Table";
import { Toggle } from "@/components/Toggle";
import { Delta } from "@/components/Delta";
import { IntervalPlot } from "@/components/illustrations/IntervalPlot";
import { FLEET } from "@/content/fleet";
import { SCENARIO_INPUTS } from "@/content/scenarios";
import { api, type SensitivityResponse } from "@/lib/api";
import { layout, type } from "@/lib/design-system";
import { integer, percent, rp } from "@/lib/format";
import { cn } from "@/lib/cn";
import { perHour } from "@/lib/tcoMath";
import { useApi } from "@/lib/useApi";

// Slider is logarithmic: 10^2 .. 10^5 iterations. The API accepts 1..100000 (SensitivityRequest.iterations).
const MIN_EXP = 2;
const MAX_EXP = 5;
const SANY_BASELINE = perHour(FLEET[1]).total;

type Row = { n: number; name: string; cost: number };

const columns: Column<Row>[] = [
  { key: "n", header: "#", render: (r) => <span className="text-ink-faint">{r.n}</span> },
  { key: "name", header: "Scenario", render: (r) => <span className="font-normal">{r.name}</span> },
  { key: "price", header: "Price (Rp)", align: "right", render: (r) => { const s = SCENARIO_INPUTS[r.name]; return s ? integer(s.price) : "—"; } },
  { key: "life", header: "Lifetime (h)", align: "right", render: (r) => { const s = SCENARIO_INPUTS[r.name]; return s ? integer(s.lifetime) : "—"; } },
  { key: "maint", header: "Maint. (Rp/h)", align: "right", render: (r) => { const s = SCENARIO_INPUTS[r.name]; return s ? integer(s.maint) : "—"; } },
  { key: "cost", header: "Cost / h", align: "right", render: (r) => <strong className="font-medium">{rp(r.cost)}</strong> },
  { key: "vs", header: "vs SANY", align: "right", render: (r) => <Delta value={(r.cost / SANY_BASELINE - 1) * 100} goodWhen="down" /> },
];

const fetchScenarios = () => api.sensitivity({ monte_carlo: false });

function Scenarios({ data }: { data: SensitivityResponse }) {
  const rows: Row[] = data.scenarios.map((s, i) => ({ n: i + 1, name: s.skenario, cost: s.cost_per_hour }));
  return <DataTable n={1} caption="Five deterministic scenarios for UTPE Product B" columns={columns} rows={rows} rowKey={(r) => r.name} source="POST /api/sensitivity; scenario inputs from configs/scenarios.yaml." />;
}

function Interpretation({ data }: { data: SensitivityResponse }) {
  const best = data.scenarios[data.scenarios.length - 1];
  return (
    <div className="mt-16">
      <SectionHeader number="02.3" title="Interpretation" level={3} />
      <p className={cn(layout.reading, "!mx-0", type.body)}>
        Even under the most favourable assumption set ({best.skenario}), UTPE&apos;s cost per hour is Rp {rp(best.cost_per_hour)}, still {percent(best.cost_per_hour / SANY_BASELINE - 1, 0)} above the SANY baseline of Rp {rp(SANY_BASELINE)}. A price cut alone does not close the gap; the lifetime and maintenance assumptions carry as much weight as price.
      </p>
    </div>
  );
}

export function SensitivityView() {
  const scen = useApi(fetchScenarios, "sens-scenarios");

  const [exp, setExp] = useState(4);
  const [mcOn, setMcOn] = useState<"on" | "off">("on");
  const [request, setRequest] = useState<{ iterations: number } | null>(null);
  const iterations = Math.round(10 ** exp);

  const fetchMc = useCallback(
    () => (request ? api.sensitivity({ iterations: request.iterations, monte_carlo: true }) : Promise.resolve(null)),
    [request],
  );
  const mc = useApi(fetchMc, "sens-mc");
  const result = mc.data?.mc ?? null;

  return (
    <>
      <SectionHeader number="02.1" title="Scenario design" level={3} subtitle="Five deterministic cases, computed live." />
      {scen.error ? (
        <ErrorCallout error={scen.error} onRetry={scen.retry} cachedAt={scen.cached?.at}>{scen.cached && <Scenarios data={scen.cached.data} />}</ErrorCallout>
      ) : !scen.data ? (
        <Loading />
      ) : (
        <Reveal><Scenarios data={scen.data} /></Reveal>
      )}

      <div className="mt-16">
        <SectionHeader number="02.2" title="Monte Carlo" level={3} subtitle="Cost per hour under uncertain price, lifetime and maintenance." />
        <div className="grid gap-8 border border-rule p-6 md:grid-cols-[1fr_auto] md:items-end">
          <Slider
            label="Iterations"
            value={exp}
            min={MIN_EXP}
            max={MAX_EXP}
            onChange={setExp}
            display={integer(iterations)}
            minLabel={integer(10 ** MIN_EXP)}
            maxLabel={integer(10 ** MAX_EXP)}
            valueText={`${integer(iterations)} iterations`}
          />
          <div className="flex flex-wrap items-center gap-4">
            <Toggle aria-label="Monte Carlo" value={mcOn} onChange={setMcOn} options={[{ value: "off", label: "MC off" }, { value: "on", label: "MC on" }]} />
            <Button variant="ghost" disabled={mcOn === "off" || mc.loading} onClick={() => setRequest({ iterations })}>Run simulation</Button>
          </div>
        </div>

        <div className="mt-6" aria-live="polite">
          {mc.error ? (
            <ErrorCallout error={mc.error} onRetry={mc.retry} />
          ) : mc.loading && !result ? (
            <Loading />
          ) : !result ? (
            <Empty>Run the simulation to visualize the distribution.</Empty>
          ) : (
            <div className={cn(mc.loading && "opacity-60")}>
              <Figure n={1} caption={`Simulated cost per hour of UTPE Product B, ${integer(request?.iterations ?? iterations)} iterations: P10–P90 interval, P50 and the deterministic baseline.`} source="POST /api/sensitivity (utpe.analysis.sensitivity.monte_carlo)." notes="The API returns percentiles only, so the interval is drawn instead of a histogram.">
                <IntervalPlot p10={result.p10} p50={result.p50} p90={result.p90} baseline={scen.data?.scenarios[0]?.cost_per_hour ?? result.p50} label="Cost per Hour (Rp)" />
              </Figure>
              <p className="font-mono text-xs text-ink-medium">
                P10 {rp(result.p10)} · P50 {rp(result.p50)} · P90 {rp(result.p90)} · spread P90−P10 {rp(result.p90 - result.p10)}
              </p>
            </div>
          )}
        </div>

        <Callout variant="method" title="Methodology">
          This Monte Carlo draws price (σ = Rp 200 M), lifetime (σ = 1.500 h) and maintenance (σ = Rp 5.000/h) from clipped normal distributions around the baseline; seed 42. The incremental-NPV model on the Overview page is a separate simulation: 18 correlated variables, Gaussian copula, seed 20261106, N = 10.000.
        </Callout>
      </div>
      {(scen.data ?? scen.cached?.data) && <Interpretation data={(scen.data ?? scen.cached?.data) as SensitivityResponse} />}
      <Footnotes items={["Source: utpe.analysis.sensitivity; configs/scenarios.yaml."]} />
    </>
  );
}
