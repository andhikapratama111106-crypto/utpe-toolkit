import type { Metadata } from "next";
import { Callout } from "@/components/Callout";
import { DataCard } from "@/components/DataCard";
import { Footnotes } from "@/components/Footnote";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { SectionHeader } from "@/components/SectionHeader";
import { Sparkline } from "@/components/Sparkline";
import { DataTable, type Column } from "@/components/Table";
import { ProjectionView } from "@/components/views/ProjectionView";
import { AUTHORS, UPDATED } from "@/content/findings";
import { model } from "@/content/model";
import { layout, type } from "@/lib/design-system";
import { decimal, percent, rpM } from "@/lib/format";

export const metadata: Metadata = { title: "Financial Projection" };

const { series, years, indicators, monteCarlo: mc, scenarios, scenarioNames } = model;
const fy = (y: number, i: number) => `${y}${i === 0 ? "E" : "F"}`;

type PL = { line: string; values: readonly number[]; fmt: (v: number) => string };
const pl: PL[] = [
  { line: "Revenue — strategy", values: series["Pendapatan — strategi"], fmt: (v) => decimal(v, 0) },
  { line: "Revenue — do-nothing", values: series["Pendapatan — do-nothing"], fmt: (v) => decimal(v, 0) },
  { line: "EBITDA — strategy", values: series["EBITDA — strategi"], fmt: (v) => decimal(v, 0) },
  { line: "EBITDA — do-nothing", values: series["EBITDA — do-nothing"], fmt: (v) => decimal(v, 0) },
  { line: "EBITDA margin — strategy", values: series["Margin EBITDA — strategi"], fmt: (v) => percent(v) },
  { line: "Δ free cash flow", values: series["Δ Arus kas bebas"], fmt: (v) => decimal(v, 0) },
];
const plColumns: Column<PL>[] = [
  { key: "line", header: "Line (Rp M)", render: (r) => r.line },
  ...years.map((y, i) => ({ key: String(y), header: fy(y, i), align: "right" as const, render: (r: PL) => r.fmt(r.values[i]) })),
  { key: "trend", header: "Trend", render: (r: PL) => <Sparkline values={[...r.values]} label={`${r.line}, ${years[0]} to ${years[years.length - 1]}`} /> },
];

type SC = { metric: string; values: (string | number | null)[] };
const scRows: SC[] = [
  { metric: "Incremental NPV (Rp M)", values: scenarios["NPV inkremental"].values },
  { metric: "NPV excl. terminal value (Rp M)", values: scenarios["NPV tanpa nilai terminal"].values },
  { metric: "Peak funding need (Rp M)", values: scenarios["Dana puncak"].values },
  { metric: "EBITDA margin 2031, strategy", values: scenarios["Margin EBITDA 2031 — strategi"].values },
];
const fmtCell = (metric: string, v: string | number | null) => (typeof v !== "number" ? String(v ?? "—") : metric.startsWith("EBITDA margin") ? percent(v) : decimal(v, 0));
const scColumns: Column<SC>[] = [
  { key: "metric", header: "Metric", render: (r) => r.metric },
  ...scenarioNames.map((n, i) => ({ key: n, header: n, align: "right" as const, render: (r: SC) => fmtCell(r.metric, r.values[i]) })),
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="§ 03 — FINANCIAL PROJECTION"
        title="Two Strategies, One Decision"
        abstract="Comparison of two strategic responses: discount-led price competition and value-led financing-as-a-service. A one-period profit comparison is computed live by the backend; a six-year incremental NPV model and its Monte Carlo distribution are reported from the competition model."
        metadata={`Updated: ${UPDATED} · Authors: ${AUTHORS}`}
      />
      <Section>
        <ProjectionView />
      </Section>

      <Section alt>
        <SectionHeader number="03.4" title="Five-year projection" level={3} subtitle="Base scenario, strategy versus do-nothing." />
        <DataTable n={2} caption="Six-year P&L summary (Rp miliar)" columns={plColumns} rows={pl} rowKey={(r) => r.line} surface="alt" source={`${model.provenance.file}, sheet Dashboard (active scenario: Base).`} />

        <SectionHeader number="03.5" title="NPV analysis" level={3} subtitle="Incremental to do-nothing, WACC 11,5%." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DataCard eyebrow="BASE" value={rpM(indicators.npvBase, 0)} label="Incremental NPV" secondary={`Excl. terminal value ${rpM(indicators.npvExTv, 1)}`} />
          <DataCard eyebrow="MONTE CARLO" value={rpM(mc.p50, 0)} label="NPV · P50" secondary={`P10 ${rpM(mc.p10, 0)} · P90 ${rpM(mc.p90, 0)}`} footnote={`N = ${mc.n.toLocaleString("id-ID")}, seed ${mc.seed}`} />
          <DataCard eyebrow="RISK" value={percent(mc.pNegative)} label="P(NPV < 0)" secondary="Share of draws with negative NPV" />
          <DataCard eyebrow="PAYBACK" value={String(indicators.paybackYear)} label="Payback year" secondary={`Peak funding ${rpM(Math.abs(indicators.peak), 0)} · investment ${rpM(indicators.investment, 0)}`} />
        </div>
        <DataTable n={3} caption="Incremental NPV across the five model scenarios (Rp miliar)" columns={scColumns} rows={scRows} rowKey={(r) => r.metric} surface="alt" source={`${model.provenance.file}, sheet Scenarios.`} />
        <Callout variant="important" title="Reading the NPV">
          <p className={type.bodySm}>
            {percent(scenarios["Porsi NPV dari nilai terminal"].values[0] as number, 0)} of the Base NPV is terminal value; excluding it the Base NPV is {rpM(indicators.npvExTv, 1)}. The Stress scenario has a negative NPV ({rpM(scenarios["NPV inkremental"].values[3] as number, 0)}), and the Stress + Gate case limits the loss to {rpM(scenarios["NPV inkremental"].values[4] as number, 0)}. P(NPV &lt; 0) of {percent(mc.pNegative)} describes the Monte Carlo distribution around the Base assumptions, not the Stress case.
          </p>
        </Callout>
        <p className={layout.reading + " !mx-0 " + type.bodySm + " text-ink-faint"}>Scenario definitions are given in the model workbook (sheet Scenarios).</p>
        <Footnotes items={[`Source: ${model.provenance.file}. ${model.provenance.note}`]} />
      </Section>
    </>
  );
}
