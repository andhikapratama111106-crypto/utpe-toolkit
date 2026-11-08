"use client";
import Link from "next/link";
import { CountUp, PageHeader, Reveal, Stat } from "@/components/ui";
import { KEY, miliar, num } from "@/lib/data";

const MODULES = [
  { href: "/tco", title: "TCO", text: "Biaya total per jam: Komatsu, SANY, UTPE." },
  { href: "/sensitivity", title: "Sensitivity", text: "Skenario harga, lifetime, maintenance, plus Monte Carlo." },
  { href: "/projection", title: "Projection", text: "Price War lawan Financing, dan NPV." },
  { href: "/game-theory", title: "Game Theory", text: "Matriks payoff dan keseimbangan Nash." },
  { href: "/validate", title: "Validate", text: "Cek angka hasil terhadap Executive Summary." },
];

export function HomeView() {
  return (
    <div className="wrap">
      <PageHeader
        eyebrow="UTPE Toolkit"
        title="Keputusan harga dan pembiayaan, dalam satu pandangan."
        lead="UTPE menghadapi RKAB 2026 dan pesaing China. Empat angka ini merangkum jalan keluarnya."
      />
      <div className="grid g4">
        <Stat label="UTPE Cost/hour" unit="Rp/jam" hint="Product B, lifetime 12.000 jam" delay={0}>
          <CountUp value={KEY.costPerHour} format={(n) => num(n)} />
        </Stat>
        <Stat label="Profit Financing" tint="green" hint="Skenario konservatif, margin bersih 3%" delay={0.08}>
          <CountUp value={KEY.profitFinancing / 1e9} format={(n) => miliar(n * 1e9)} />
        </Stat>
        <Stat label="NPV P50" tint="purple" hint={`P10 ${miliar(KEY.npvP10)} · P90 ${miliar(KEY.npvP90)}`} delay={0.16}>
          <CountUp value={KEY.npvP50 / 1e9} format={(n) => miliar(n * 1e9)} />
        </Stat>
        <Stat label="Nash equilibrium" tint="orange" hint="(UTPE, SANY), Rp miliar" delay={0.24}>
          ({KEY.nash[0]}, {KEY.nash[1]})
        </Stat>
      </div>

      <div className="section">
        <Reveal>
          <h2>Jelajahi modul</h2>
        </Reveal>
        <div className="grid g3" style={{ marginTop: 16 }}>
          {MODULES.map((m, i) => (
            <Reveal key={m.href} delay={i * 0.05}>
              <Link href={m.href} className="card" style={{ height: "100%" }}>
                <h3>{m.title} →</h3>
                <p className="muted" style={{ margin: 0 }}>{m.text}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
