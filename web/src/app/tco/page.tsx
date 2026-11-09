import type { Metadata } from "next";
import { Citation } from "@/components/Citation";
import { Equation } from "@/components/Equation";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { SectionHeader } from "@/components/SectionHeader";
import { TcoView } from "@/components/views/TcoView";
import { FLEET } from "@/content/fleet";
import { UPDATED, AUTHORS } from "@/content/findings";
import { layout, type } from "@/lib/design-system";
import { percent } from "@/lib/format";
import { perHour } from "@/lib/tcoMath";

export const metadata: Metadata = { title: "Total Cost of Ownership" };

const [komatsu, sany, utpe] = FLEET.map(perHour);

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="§ 01 — TOTAL COST OF OWNERSHIP"
        title="Total Cost of Ownership"
        abstract={`Decomposition of per-hour operating cost across three competitor profiles. For the two incumbent profiles purchase depreciation is ${percent(komatsu.purchase / komatsu.total, 0)} (Komatsu) and ${percent(sany.purchase / sany.total, 0)} (SANY) of hourly cost, so fuel and maintenance dominate; for UTPE Product B it is ${percent(utpe.purchase / utpe.total, 0)}.`}
        metadata={`Updated: ${UPDATED} · Authors: ${AUTHORS} · Refs: 1`}
      />
      <Section>
        <SectionHeader number="01.1" title="Methodology" level={3} />
        <p className={layout.reading + " !mx-0 " + type.body}>
          Total Cost of Ownership accounts for all costs of acquiring and operating an asset over its life<Citation n={5} />. Here it is expressed per operating hour: the purchase price is spread over the stated lifetime and added to maintenance, fuel and operator wages.
        </p>
        <Equation n={1} label="TCO per hour equals purchase divided by lifetime plus maintenance plus fuel plus operator">
          TCO/hour = (Purchase ÷ Lifetime) + Maintenance + Fuel + Operator
        </Equation>
      </Section>
      <Section alt>
        <SectionHeader number="01.2" title="Results" subtitle="Computed live by the backend." level={3} />
        <TcoView />
      </Section>
    </>
  );
}
