"use client";

import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Footnotes } from "@/components/Footnote";
import { Reveal } from "@/components/Reveal";
import { ErrorCallout, Loading } from "@/components/States";
import { DataTable, type Column } from "@/components/Table";
import { api, type ValidateResponse } from "@/lib/api";
import { cn } from "@/lib/cn";
import { decimal, integer } from "@/lib/format";
import { useApi } from "@/lib/useApi";

const fetchValidate = () => api.validate();

// Same tolerance as configs/validation_rules.yaml (tolerance_pct).
const TOLERANCE_PCT = 0.5;

type Row = ValidateResponse["checks"][number] & { deltaPct: number; ok: boolean };

const columns: Column<Row>[] = [
  { key: "label", header: "Metric", render: (r) => <span className="font-normal">{r.label}</span> },
  { key: "csv", header: "Computed value", align: "right", render: (r) => decimal(r.csv_value, 2) },
  { key: "es", header: "Executive summary", align: "right", render: (r) => integer(r.expected) },
  { key: "d", header: "Delta", align: "right", render: (r) => `${decimal(r.deltaPct, 2)}%` },
  {
    key: "status",
    header: "Status",
    align: "right",
    render: (r) => (
      <span className={cn("inline-flex items-center gap-1 font-mono text-xs", r.ok ? "text-pos" : "text-neg")}>
        {r.ok ? <Check size={14} strokeWidth={1.5} aria-hidden="true" /> : <X size={14} strokeWidth={1.5} aria-hidden="true" />}
        {r.ok ? "PASS" : "FAIL"}
      </span>
    ),
  },
];

function Progress({ passed, total }: { passed: number; total: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(total ? (passed / total) * 100 : 0), 50);
    return () => clearTimeout(t);
  }, [passed, total]);
  return (
    <div>
      <p className="font-mono text-sm tabular-nums">{passed} of {total} checks passed</p>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={passed} aria-label="Validation checks passed" className="mt-2 h-1.5 w-full max-w-md border border-rule">
        <div className={cn("h-full transition-[width] duration-[800ms] ease-linear", passed === total ? "bg-pos" : "bg-neg")} style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

function Content({ data }: { data: ValidateResponse }) {
  const rows: Row[] = data.checks.map((c) => {
    const deltaPct = c.expected ? (Math.abs(c.csv_value - c.expected) / Math.abs(c.expected)) * 100 : 0;
    return { ...c, deltaPct, ok: c.status === "OK" && deltaPct <= TOLERANCE_PCT };
  });
  const passed = rows.filter((r) => r.ok).length;
  return (
    <Reveal>
      <Progress passed={passed} total={rows.length} />
      <p className="mt-2 font-mono text-xs text-ink-faint">Overall: {data.passed ? "PASS" : "FAIL"} · tolerance {decimal(TOLERANCE_PCT, 1)}%</p>
      <DataTable n={1} caption="Five cross-check results" columns={columns} rows={rows} rowKey={(r) => r.label} source="GET /api/validate (utpe.reporting.validator); tolerance from configs/validation_rules.yaml." />
      <Footnotes items={["Delta = |computed − executive summary| ÷ executive summary."]} />
    </Reveal>
  );
}

export function ValidateView() {
  const { data, error, retry, cached } = useApi(fetchValidate, "validate");
  if (error) return <ErrorCallout error={error} onRetry={retry} cachedAt={cached?.at}>{cached && <Content data={cached.data} />}</ErrorCallout>;
  if (!data) return <Loading />;
  return <Content data={data} />;
}
