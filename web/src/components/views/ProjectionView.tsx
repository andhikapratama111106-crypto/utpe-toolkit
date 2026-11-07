"use client";

import { useState } from "react";
import { Callout } from "@/components/Callout";
import { Delta } from "@/components/Delta";
import { Equation } from "@/components/Equation";
import { Figure } from "@/components/Figure";
import { Footnotes } from "@/components/Footnote";
import { SectionHeader } from "@/components/SectionHeader";
import { ErrorCallout, Loading } from "@/components/States";
import { DataTable, type Column } from "@/components/Table";
import { Toggle } from "@/components/Toggle";
import { ProfitBars } from "@/components/illustrations/ProfitBars";
import { financingBreakdown, priceWarBreakdown } from "@/content/projection";
import { api, type ProjectionResponse } from "@/lib/api";
import { layout, type } from "@/lib/design-system";
import { decimal, integer, miliar, signedPct } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useApi } from "@/lib/useApi";

type Mode = "pw" | "fin9" | "fin3";
type Pair = { gross: ProjectionResponse; cons: ProjectionResponse };

// konservatif=false is the 9% gross financing margin; konservatif=true the 3% net share (configs/financing.yaml).
const fetchBoth = async (): Promise<Pair> => {
  const [gross, cons] = await Promise.all([api.projection({ konservatif: false }), api.projection({ konservatif: true })]);
  return { gross, cons };
};

const OPTIONS: { value: Mode; label: string }[] = [
  { value: "pw", label: "Price War" },
  { value: "fin9", label: "Financing 9%" },
  { value: "fin3", label: "Financing 3%" },
];

const m = (rupiah: number, d: number) => decimal(rupiah / 1e9, d);

type Row = { name: string; pw: string; fin?: string; strong?: boolean };

function Content({ data, mode }: { data: Pair; mode: Mode }) {
  const chosen = mode === "fin9" ? data.gross : data.cons;
  const pw = priceWarBreakdown();
  const fin = financingBreakdown(mode === "fin3");
  const showFin = mode !== "pw";
  const rows: Row[] = [
    { name: "Units sold", pw: integer(pw.units), fin: integer(fin.units) },
    { name: "Revenue (Rp M)", pw: m(pw.revenue, 1), fin: m(fin.revenue, 1) },
    { name: "Product profit (Rp M)", pw: m(pw.productProfit, 1), fin: m(fin.productProfit, 1) },
    { name: "Financing profit (Rp M)", pw: m(pw.financingProfit, 1), fin: m(fin.financingProfit, 1) },
    { name: "Total profit (Rp M), API", pw: m(chosen.price_war.profit, 2), fin: m(chosen.financing.profit, 2), strong: true },
  ];
  const columns: Column<Row>[] = [
    { key: "name", header: "Line", render: (r) => <span className={cn("font-normal", r.strong && "font-medium")}>{r.name}</span> },
    { key: "pw", header: "Price War", align: "right", render: (r) => <span className={cn(r.strong && "font-medium")}>{r.pw}</span> },
    ...(showFin ? [{ key: "fin", header: mode === "fin9" ? "Financing 9%" : "Financing 3%", align: "right" as const, render: (r: Row) => <span className={cn(r.strong && "font-medium")}>{r.fin}</span> }] : []),
  ];

  return (
    <>
      <DataTable n={1} caption="Profit by strategy (Rp miliar unless stated)" columns={columns} rows={rows} rowKey={(r) => r.name} source="POST /api/projection for totals; components recomputed from configs/financing.yaml." />
      <Figure n={1} caption="Total profit of the Price War and Financing strategies." source="POST /api/projection (utpe.analysis.projection.compare)." notes="Financing 9% = gross interest margin (konservatif = false); Financing 3% = UTPE net share (konservatif = true).">
        <ProfitBars items={[
          { label: "Price War", value: data.cons.price_war.profit, muted: mode !== "pw" },
          { label: "Financing 9%", value: data.gross.financing.profit, highlight: mode === "fin9", muted: mode !== "fin9" },
          { label: "Financing 3%", value: data.cons.financing.profit, highlight: mode === "fin3", muted: mode !== "fin3" },
        ]} />
      </Figure>

      <div className="mt-16">
        <SectionHeader number="03.3" title="Delta" level={3} subtitle="Financing versus Price War." />
        {showFin ? (
          <>
            <Equation n={2} label="Delta profit equals financing profit minus price war profit">
              {`Δ profit (${mode === "fin3" ? "Financing 3%" : "Financing 9%"} − Price War) = +${miliar(chosen.delta.absolute, 1)} (${signedPct(chosen.delta.percentage)})`}
            </Equation>
            <p className="flex items-center gap-3 font-mono text-sm"><span>Relative to Price War:</span><Delta value={chosen.delta.percentage} /></p>
            {mode === "fin9" && (
              <Callout variant="note" title="Reading Financing 9%">The 9% case counts the gross interest margin; the conservative 3% case counts only UTPE&apos;s net share and is the figure used in the executive summary.</Callout>
            )}
          </>
        ) : (
          <p className={cn(layout.reading, "!mx-0", type.body, "text-ink-medium")}>Select a Financing scenario to compare it with Price War.</p>
        )}
      </div>
      <Footnotes items={["Source: utpe.analysis.projection; configs/financing.yaml; data/raw/validasi_konservatif.csv."]} />
    </>
  );
}

export function ProjectionView() {
  const { data, error, retry, cached } = useApi(fetchBoth, "projection");
  const [mode, setMode] = useState<Mode>("fin3");
  return (
    <>
      <SectionHeader number="03.1" title="Scenario definition" level={3} subtitle="Which strategy to compare." />
      <p className={cn(layout.reading, "!mx-0 mb-6", type.body)}>
        Price War discounts the machine by 20% and sells 160 of 200 market units. Financing sells at full price (220 units) and earns a margin on 60% financed volume. The API distinguishes two financing margins through one boolean, <code className="font-mono text-[13px]">konservatif</code>.
      </p>
      <div className="mb-10"><Toggle aria-label="Scenario" value={mode} onChange={setMode} options={OPTIONS} /></div>
      <SectionHeader number="03.2" title="Profit comparison" level={3} subtitle="Computed live by the backend." />
      {error ? (
        <ErrorCallout error={error} onRetry={retry} cachedAt={cached?.at}>{cached && <Content data={cached.data} mode={mode} />}</ErrorCallout>
      ) : !data ? (
        <Loading />
      ) : (
        <Content data={data} mode={mode} />
      )}
    </>
  );
}
