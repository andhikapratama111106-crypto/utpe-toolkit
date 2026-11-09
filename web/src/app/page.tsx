import { Callout } from "@/components/Callout";
import { Citation } from "@/components/Citation";
import { DataCard } from "@/components/DataCard";
import { Delta } from "@/components/Delta";
import { Equation } from "@/components/Equation";
import { Figure } from "@/components/Figure";
import { Footnotes } from "@/components/Footnote";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { SectionHeader } from "@/components/SectionHeader";
import { CostBreakdownExploded } from "@/components/illustrations/CostBreakdownExploded";
import { ExcavatorSchematic } from "@/components/illustrations/ExcavatorSchematic";
import { MonteCarloHistogram } from "@/components/illustrations/MonteCarloHistogram";
import { SupplyChainFlow } from "@/components/illustrations/SupplyChainFlow";
import { FLEET } from "@/content/fleet";
import { AUTHORS, PROFIT, UPDATED } from "@/content/findings";
import { REFERENCES } from "@/content/references";
import { model } from "@/content/model";
import { layout, type } from "@/lib/design-system";
import { decimal, integer, miliar, percent, rp, rpM } from "@/lib/format";
import { perHour } from "@/lib/tcoMath";

const [komatsu, sany, utpe] = FLEET.map((f) => perHour(f));
const mc = model.monteCarlo;
const steps = [
  { n: "01", title: "Measure", body: "Total Cost of Ownership per equipment profile. The unit of analysis is the operating hour, not the purchase price: fuel, maintenance, operator and depreciation are summed over the lifetime.", chip: "3 profiles · 4 cost components" },
  { n: "02", title: "Simulate", body: "Deterministic scenarios and Monte Carlo draws test how robust the comparison is to price, lifetime and maintenance. The incremental-NPV model draws 18 correlated variables.", chip: `${integer(mc.n)} iterations · 18 variables` },
  { n: "03", title: "Optimize", body: "A 2×2 simultaneous game models the interaction between UTPE and SANY. The equilibrium indicates which pricing response is stable, and whether any alternative improves both players.", chip: "Nash equilibrium (200, 150)" },
];

export default function Home() {
  return (
    <>
      <PageHeader
        eyebrow="§ 00 — OVERVIEW"
        title="When Quality Is No Longer Enough"
        abstract="UTPE Toolkit is a decision-support system for evaluating strategic responses to price-driven disruption in Indonesia's heavy equipment market. It combines Total Cost of Ownership econometrics, Monte Carlo simulation of 10,000 iterations, and game-theoretic analysis of competitive interactions. This document reports findings from six independent analytical modules applied to the 2026 market state of PT United Tractors Pandu Engineering."
        metadata={`Version 0.1.1 · Published ${UPDATED} · 6 modules · 37 tests passing · Authors: ${AUTHORS}`}
      />

      <Section>
        <SectionHeader number="00.1" title="Key findings" subtitle="Four quantities that carry the argument." level={3} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DataCard eyebrow="§ 01" value={rp(utpe.total)} label="Cost per hour · UTPE (Rp)" secondary={`SANY ${rp(sany.total)} · Komatsu ${rp(komatsu.total)}`} delta={<Delta value={(utpe.total / sany.total - 1) * 100} goodWhen="down" suffix="vs SANY" />} footnote="¹ Computed from fleet inputs; re-verified on § 05." />
          <DataCard eyebrow="§ 03" value={miliar(PROFIT.financing)} label="Profit · Financing (konservatif)" secondary={`Price War ${miliar(PROFIT.priceWar)}`} delta={<Delta value={(PROFIT.financing / PROFIT.priceWar - 1) * 100} suffix="vs Price War" />} footnote="² validasi_konservatif.csv, margin 3%." />
          <DataCard eyebrow="§ 03" value={rpM(mc.p50)} label="Incremental NPV · P50" secondary={`P10 ${rpM(mc.p10)} · P90 ${rpM(mc.p90)}`} delta={<span className="font-mono text-xs text-pos">P(NPV&lt;0) = {percent(mc.pNegative)}</span>} footnote={`³ ${integer(mc.n)} draws, seed ${mc.seed}.`} />
          <DataCard eyebrow="§ 04" value="(200, 150)" label="Nash equilibrium · payoff" secondary="UTPE Premium + Financing · SANY Harga Agresif" delta={<span className="font-mono text-xs text-ink-medium">Pareto optimal</span>} footnote="⁴ Payoffs in Rp miliar." />
        </div>
      </Section>

      <Section alt>
        <SectionHeader number="01" title="Strategic framework" subtitle="Three pillars, each tied to a measurable quantity." />
        <div className={layout.reading + " space-y-14"}>
          <article>
            <h3 className={type.h3}><span className="mr-3 font-mono text-sm text-crimson">§ 01.1</span>FLEX — Financing-as-a-Service</h3>
            <p className={type.body + " mt-4"}>A 36–48 month lease-purchase arranged with SAN Finance (Astra Group), PATRIA Care and remanufacturing converts the purchase price into a monthly cost. Under a conservative 3% financing margin the strategy yields Rp {decimal(PROFIT.financing / 1e9, 0)} M profit against Rp {decimal(PROFIT.priceWar / 1e9, 0)} M for a 20% price discount<Citation n={1} />. Purchase price is {percent(utpe.purchase / utpe.total, 0)} of UTPE&apos;s hourly cost, so financing addresses the dominant cost component.</p>
          </article>
        </div>
        <Figure n={2} caption="Exploded view of UTPE Product B hourly cost, by component." source="utpe.analysis.tco, inputs from configs/tco_base.yaml." notes="Component costs are derived from the TCO inputs; they sum to the total shown.">
          <CostBreakdownExploded parts={[
            { part: "cab", label: "Cabin · operator wage", basis: "Rp / hour", value: utpe.operator },
            { part: "engine", label: "Engine · fuel", basis: "12 L/h × Rp 25.200", value: utpe.fuel },
            { part: "hydraulic", label: "Hydraulics · maintenance", basis: "Rp / hour", value: utpe.maintenance },
            { part: "undercarriage", label: "Asset · purchase ÷ lifetime", basis: "Rp 4.160 M ÷ 12.000 h", value: utpe.purchase },
          ]} />
        </Figure>
        <div className={layout.reading + " space-y-14"}>
          <article>
            <h3 className={type.h3}><span className="mr-3 font-mono text-sm text-crimson">§ 01.2</span>FAST — Modular platform and local sourcing</h3>
            <p className={type.body + " mt-4"}>A modular platform with locally sourced components targets lead-time reductions from 6 to 4 months for Product B and from 6 to 3 months for Product C, narrowing the speed gap with Chinese competitors<Citation n={2} />. The roadmap identifies five components for local sourcing and supplier negotiation in the first two quarters.</p>
          </article>
        </div>
        <Figure n={3} caption="Value chain from ore to customer; local sourcing shortens the component-to-assembly segment." source="Executive Summary, Table 7 (lead-time target: Product B 6 → 4 months, Product C 6 → 3 months).">
          <SupplyChainFlow note="Local sourcing: lead time B 6 → 4, C 6 → 3 months" />
        </Figure>
        <div className={layout.reading + " space-y-14"}>
          <article>
            <h3 className={type.h3}><span className="mr-3 font-mono text-sm text-crimson">§ 01.3</span>NEXT — Logistics expansion</h3>
            <p className={type.body + " mt-4"}>Zero ODOL enforcement begins on 1 January 2027<Citation n={3} />, which raises demand for compliant, lightweight bodies and trailers. The model sizes the heavy-duty body and trailer SAM at about Rp {decimal(model.samLogistics.values[0] / 1000, 1)} T in {model.samLogistics.years[0]} (Rp {integer(model.samLogistics.values[0])} M).</p>
          </article>
        </div>
        <Figure n={4} caption="Hydraulic excavator, side elevation. Platform for attachments and compliant body variants." source="Schematic drawing by the authors; not to scale.">
          <ExcavatorSchematic />
        </Figure>
      </Section>

      <Section>
        <SectionHeader number="02" title="Methodology" subtitle="Measure, simulate, optimize." />
        <ol className={layout.reading + " !mx-0"}>
          {steps.map((s, i) => (
            <li key={s.n} className="grid grid-cols-[4.5rem_1fr] gap-x-6">
              <div className="flex flex-col items-start">
                <span className="font-mono text-[3rem] leading-none text-ink">{s.n}</span>
                {i < steps.length - 1 && <span aria-hidden="true" className="mt-3 w-px flex-1 bg-rule" />}
              </div>
              <div className="pb-12">
                <h3 className={type.h3}>{s.title}</h3>
                <p className={type.body + " mt-2 text-ink-medium"}>{s.body}</p>
                <span className="mt-3 inline-block border border-rule px-2 py-1 font-mono text-[11px] text-ink-medium">{s.chip}</span>
              </div>
            </li>
          ))}
        </ol>
        <Equation n={1} label="Total cost of ownership per hour equals purchase divided by lifetime plus maintenance plus fuel plus operator">
          TCO/hour = (Purchase ÷ Lifetime) + Maintenance + Fuel + Operator
        </Equation>
      </Section>

      <Section alt>
        <SectionHeader number="03" title="Evidence" subtitle="Distribution of incremental NPV under uncertainty." />
        <Figure n={1} caption={`Distribution of incremental NPV (strategy minus do-nothing) from ${integer(mc.n)} Monte Carlo iterations.`} source={`${model.provenance.file}, sheet MC_Data (seed ${mc.seed}).`} notes={`Bins of Rp 37,5 M; ${mc.clipped} draws outside the axis range are not drawn. Hatched area: NPV < 0 (P = ${percent(mc.pNegative)}).`}>
          <MonteCarloHistogram bins={mc.bins} p10={mc.p10} p50={mc.p50} p90={mc.p90} n={mc.n} xLabel="Incremental NPV (Rp miliar)" unitLabel="Rp miliar" shadeNegative />
        </Figure>
      </Section>

      <Section>
        <SectionHeader number="04" title="Discussion" />
        <div className={layout.reading + " !mx-0 space-y-4"}>
          <p className={type.body}>The analysis suggests that UTPE cannot close the hourly cost gap through price alone: even at the most favourable deterministic scenario its cost per hour remains above SANY&apos;s baseline (§ 02). The financing strategy indicates a higher expected profit than discounting, and the game-theoretic model identifies Premium + Financing as UTPE&apos;s dominant strategy<Citation n={4} />.</p>
          <p className={type.body}>The base-case incremental NPV is Rp {decimal(model.indicators.npvBase, 0)} M with payback in {model.indicators.paybackYear}, but {percent(model.scenarios["Porsi NPV dari nilai terminal"].values[0] as number, 0)} of it comes from terminal value<Citation n={5} />; NPV excluding terminal value is Rp {decimal(model.indicators.npvExTv, 1)} M. Results should therefore be read as conditional on the post-2031 assumptions in § 03.</p>
        </div>
        <Callout variant="note" title="Data caveat">Case data are dummy values from the competition Case Book (source S01). External figures carry their own citations in the register on § 05.</Callout>
      </Section>

      <Section alt>
        <SectionHeader number="06" title="References" />
        <ol className={layout.reading + " !mx-0 space-y-3"}>
          {REFERENCES.map((r) => (
            <li key={r.n} id={`ref-${r.n}`} className="grid scroll-mt-24 grid-cols-[2.5rem_1fr] font-serif text-sm leading-relaxed text-ink-medium">
              <span className="font-mono text-xs text-crimson">[{r.n}]</span>
              <span>{r.text}{r.href && <> <a href={r.href} className="break-all text-ink underline decoration-crimson underline-offset-2">{r.href}</a></>}</span>
            </li>
          ))}
        </ol>
        <Footnotes items={[
          "Source: utpe.analysis.tco on configs/tco_base.yaml. Computed 2026-11-08.",
          "Source: data/raw/validasi_konservatif.csv.",
          `Source: ${model.provenance.file}, sheet MC_Data.`,
          "Source: configs/games/pricing_war.yaml; equilibrium from POST /api/game.",
        ]} />
      </Section>
    </>
  );
}
