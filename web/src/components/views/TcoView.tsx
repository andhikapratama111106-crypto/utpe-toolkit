"use client";

import { Callout } from "@/components/Callout";
import { Delta } from "@/components/Delta";
import { Figure } from "@/components/Figure";
import { Footnotes } from "@/components/Footnote";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { ErrorCallout, Loading } from "@/components/States";
import { DataTable, type Column } from "@/components/Table";
import { TCOWaterfall } from "@/components/illustrations/TCOWaterfall";
import { FLEET } from "@/content/fleet";
import { api, type TcoResponse } from "@/lib/api";
import { layout, type } from "@/lib/design-system";
import { percent, rp } from "@/lib/format";
import { perHour } from "@/lib/tcoMath";
import { useApi } from "@/lib/useApi";

const fetchAll = () => Promise.all(FLEET.map((f) => api.tco(f)));

type Row = { brand: string; model: string; apiTotal: number; isUtpe: boolean; parts: ReturnType<typeof perHour>; vsSany: number };

function toRows(data: TcoResponse[]): Row[] {
  const sany = data.find((d) => d.brand.startsWith("SANY"))?.cost_per_hour ?? NaN;
  return data.map((d, i) => ({
    brand: d.brand,
    model: d.model,
    apiTotal: d.cost_per_hour,
    isUtpe: d.brand.startsWith("UTPE"),
    parts: perHour(FLEET[i]),
    vsSany: (d.cost_per_hour / sany - 1) * 100,
  }));
}

const columns: Column<Row>[] = [
  { key: "brand", header: "Profile", render: (r) => <>{r.brand}<span className="block font-mono text-[11px] font-normal text-ink-faint">{r.model}</span></> },
  { key: "purchase", header: "Purchase ÷ life", align: "right", render: (r) => rp(r.parts.purchase) },
  { key: "maint", header: "Maint.", align: "right", render: (r) => rp(r.parts.maintenance) },
  { key: "fuel", header: "Fuel", align: "right", render: (r) => rp(r.parts.fuel) },
  { key: "op", header: "Operator", align: "right", render: (r) => rp(r.parts.operator) },
  { key: "total", header: "Total / h", align: "right", render: (r) => <strong className="font-medium">{rp(r.apiTotal)}</strong> },
  { key: "vs", header: "vs SANY", align: "right", render: (r) => (r.brand.startsWith("SANY") ? <span className="text-ink-faint">—</span> : <Delta value={r.vsSany} goodWhen="down" />) },
];

function Content({ data }: { data: TcoResponse[] }) {
  const rows = toRows(data);
  const utpe = rows.find((r) => r.isUtpe);
  const sany = rows.find((r) => r.brand.startsWith("SANY"));
  return (
    <>
      <Reveal>
        <Figure n={1} caption="Cost per hour by equipment profile, with step differences between adjacent profiles." source="POST /api/tco (utpe.analysis.tco), one request per profile." notes="Cost per hour in rupiah; bars start at zero.">
          <TCOWaterfall items={rows.map((r) => ({ label: r.brand.split(" ")[0], value: r.apiTotal, highlight: r.isUtpe }))} />
        </Figure>
      </Reveal>
      <DataTable
        n={1}
        caption="TCO per hour, decomposed (Rp per operating hour)"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.brand}
        highlight={(r) => r.isUtpe}
        surface="alt" source="POST /api/tco; components computed from the request inputs (configs/tco_base.yaml) and sum to the total."
      />

      <div className="mt-16">
        <SectionHeader number="01.3" title="Interpretation" level={3} />
        <div className={layout.reading + " !mx-0 space-y-4"}>
          {utpe && sany && (
            <p className={type.body}>
              UTPE Product B costs {percent(utpe.apiTotal / sany.apiTotal - 1, 0)} more per hour than the SANY profile (Rp {rp(utpe.apiTotal)} against Rp {rp(sany.apiTotal)}). Purchase depreciation is {percent(utpe.parts.purchase / utpe.apiTotal, 0)} of UTPE&apos;s hourly cost against {percent(sany.parts.purchase / sany.apiTotal, 0)} for SANY, so the gap is driven by price and lifetime rather than by running costs. The sensitivity analysis (§ 02) tests how far that gap moves under plausible changes.
            </p>
          )}
        </div>
        <Callout variant="important" title="Caveat">
          The purchase component divides price by the stated lifetime. If realised operating hours fall short of that lifetime, the purchase share per hour rises in inverse proportion; the other components are unchanged.
        </Callout>
      </div>
      <Footnotes items={["Source: utpe.analysis.tco. Fuel = 12 L/h × Rp 25.200; operator = Rp 50.000/h for all profiles."]} />
    </>
  );
}

export function TcoView() {
  const { data, error, retry, cached } = useApi(fetchAll, "tco");
  if (error) return <ErrorCallout error={error} onRetry={retry} cachedAt={cached?.at}>{cached && <Content data={cached.data} />}</ErrorCallout>;
  if (!data) return <Loading />;
  return <Content data={data} />;
}
