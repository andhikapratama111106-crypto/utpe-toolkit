import type { Metadata } from "next";
import { Callout } from "@/components/Callout";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable, type Column } from "@/components/Table";
import { ValidateView } from "@/components/views/ValidateView";
import { AUTHORS, UPDATED } from "@/content/findings";
import { model, type ModelSource } from "@/content/model";
import { layout, type } from "@/lib/design-system";

export const metadata: Metadata = { title: "Methodological Validation" };

const columns: Column<ModelSource>[] = [
  { key: "id", header: "ID", mono: true },
  { key: "ref", header: "Reference (APA 7)", render: (r) => <span className="font-normal">{r.ref}</span> },
  { key: "type", header: "Type", render: (r) => <span className="font-sans text-xs">{r.type}</span> },
  { key: "used", header: "Used for", render: (r) => <span className="text-ink-medium">{r.usedFor}</span> },
  { key: "url", header: "Link", render: (r) => (r.url ? <a href={r.url} rel="noopener noreferrer" target="_blank" className="font-mono text-xs text-ink underline decoration-crimson underline-offset-2">open</a> : <span className="text-ink-faint">—</span>) },
];

export default function Page() {
  const external = model.sources.length;
  return (
    <>
      <PageHeader
        eyebrow="§ 05 — METHODOLOGICAL VALIDATION"
        title="Reproducibility & Consistency Check"
        abstract="Every number in the executive summary is cross-checked against the computed dataset. Five critical figures are validated within a 0,5% tolerance, and the sources behind the inputs are registered."
        metadata={`Updated: ${UPDATED} · Authors: ${AUTHORS} · Sources: ${external}`}
      />
      <Section>
        <SectionHeader number="05.1" title="Validation results" subtitle="Computed live by the backend." level={3} />
        <ValidateView />
      </Section>
      <Section alt>
        <SectionHeader number="05.2" title="Reproducibility" level={3} />
        <p className={layout.reading + " !mx-0 " + type.body}>
          The toolkit recomputes the five figures from raw inputs through its Python modules. The competition model, a separate Excel workbook, runs its own integrity and reconciliation checks ({model.indicators.checks}). Agreement between the two paths is the evidence that the figures do not depend on one implementation.
        </p>
        <Callout variant="method" title="Recompute">
          <code className="font-mono text-[13px]">cd utpe-toolkit &amp;&amp; source .venv/bin/activate &amp;&amp; utpe validate</code>
        </Callout>
        <SectionHeader number="05.3" title="Data sources" level={3} subtitle="Register of references behind inputs and assumptions." />
        <DataTable n={2} caption={`Source register (${external} entries: S = case and external data, A = academic theory)`} columns={columns} rows={[...model.sources]} rowKey={(r) => r.id} surface="alt" source={`${model.provenance.file}, sheet Sources. ${model.provenance.note}`} />
      </Section>
    </>
  );
}
