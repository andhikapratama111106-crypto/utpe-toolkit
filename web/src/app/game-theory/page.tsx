import type { Metadata } from "next";
import { Equation } from "@/components/Equation";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { SectionHeader } from "@/components/SectionHeader";
import { GameView } from "@/components/views/GameView";
import { AUTHORS, UPDATED } from "@/content/findings";
import { layout, type } from "@/lib/design-system";
import { strategyLabel } from "@/lib/labels";

export const metadata: Metadata = { title: "Game-Theoretic Analysis" };

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="§ 04 — GAME-THEORETIC ANALYSIS"
        title="Nash Equilibrium of Price Competition"
        abstract="Modeling UTPE's strategic position against SANY as a 2×2 simultaneous game. A price discount emerges as a dominated strategy for UTPE regardless of SANY's choice."
        metadata={`Updated: ${UPDATED} · Authors: ${AUTHORS}`}
      />
      <Section>
        <SectionHeader number="04.1" title="Game specification" level={3} />
        <p className={layout.reading + " !mx-0 " + type.body}>
          Two players choose simultaneously. UTPE chooses between {strategyLabel("UTPE", 0)} and {strategyLabel("UTPE", 1)}; SANY chooses between {strategyLabel("SANY", 0)} and {strategyLabel("SANY", 1)}. Payoffs are calibrated from the profit scenarios in validasi_konservatif.csv.
        </p>
        <Equation n={1} label="Players and strategy sets of the game">
          {`N = {UTPE, SANY}; S_UTPE = {${strategyLabel("UTPE", 0)}, ${strategyLabel("UTPE", 1)}}; S_SANY = {${strategyLabel("SANY", 0)}, ${strategyLabel("SANY", 1)}}`}
        </Equation>
      </Section>
      <Section alt>
        <SectionHeader number="04.2" title="Payoff matrix" level={3} subtitle="Equilibrium computed live by the backend." />
        <GameView />
      </Section>
    </>
  );
}
