import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { SensitivityView } from "@/components/views/SensitivityView";
import { AUTHORS, UPDATED } from "@/content/findings";

export const metadata: Metadata = { title: "Sensitivity Analysis" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="§ 02 — SENSITIVITY ANALYSIS"
        title="Sensitivity Analysis"
        abstract="How robust is the TCO comparison to plausible variations in input parameters? Five deterministic scenarios and a Monte Carlo simulation of cost per hour test whether a price cut, a longer lifetime or lower maintenance closes the gap to the lowest-cost competitor."
        metadata={`Updated: ${UPDATED} · Authors: ${AUTHORS}`}
      />
      <Section>
        <SensitivityView />
      </Section>
    </>
  );
}
