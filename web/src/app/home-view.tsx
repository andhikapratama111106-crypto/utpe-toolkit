"use client";
import Link from "next/link";
import { CountUp, PageHeader, Reveal, Stat } from "@/components/ui";
import { KEY, eacTable, miliar, num, pct } from "@/lib/data";

const MODULES = [
  { href: "/biaya-per-tahun", title: "Biaya per Tahun", text: "EAC dan FLEX produk A–D vs pesaing China, data Case Book." },
  { href: "/tco", title: "TCO", text: "Biaya per jam vs ekskavator 20 ton (profil tidak setara)." },
  { href: "/sensitivity", title: "Sensitivity", text: "Skenario harga, lifetime, maintenance, plus Monte Carlo." },
  { href: "/projection", title: "Projection", text: "Ilustrasi Price War vs Financing, dan NPV." },
  { href: "/game-theory", title: "Game Theory", text: "Ilustrasi matriks payoff (payoff asumsi)." },
  { href: "/validate", title: "Validate", text: "10 cek angka terhadap Executive Summary." },
];

const EAC12 = eacTable(0.12);

export function HomeView() {
  return (
    <div className="wrap">
      <PageHeader
        eyebrow="UTPE Toolkit"
        title="Keputusan harga dan pembiayaan, dalam satu pandangan."
        lead="UTPE menghadapi RKAB 2026 dan pesaing China. PATRIA lebih mahal saat dibeli, tetapi lebih murah per tahun."
      />
      <div className="grid g4">
        <Link href="/biaya-per-tahun" style={{ display: "block", height: "100%" }}>
          <Stat
            label="Biaya per tahun PATRIA vs China"
            unit="produk lebih murah"
            tint="green"
            hint={`EAC, r = 12%: ${EAC12.map((x) => `${x.produk} ${pct(x.selisih_eac, 0)}`).join(" · ")}`}
            delay={0}
          >
            {EAC12.filter((x) => x.selisih_eac < 0).length}/{EAC12.length}
          </Stat>
        </Link>
        <Stat label="NPV P50" tint="purple" hint={`P10 ${miliar(KEY.npvP10)} · P90 ${miliar(KEY.npvP90)}`} delay={0.08}>
          <CountUp value={KEY.npvP50 / 1e9} format={(n) => miliar(n * 1e9)} />
        </Stat>
        <Stat
          label="UTPE cost/hour (tidak setara)"
          unit="Rp/jam"
          tint="orange"
          hint="Product B Rp4,16 M vs ekskavator 20 ton Rp0,6 M. Perbandingan sejenis: Biaya per Tahun."
          delay={0.16}
        >
          <CountUp value={KEY.costPerHour} format={(n) => num(n)} />
        </Stat>
        <Stat
          label="Profit Financing (ilustrasi)"
          tint="orange"
          hint="Model satu periode; volume 220 unit melebihi pasar 200; termasuk margin pembiayaan milik SAN Finance. Tidak dipakai di Executive Summary."
          delay={0.24}
        >
          <CountUp value={KEY.profitFinancing / 1e9} format={(n) => miliar(n * 1e9)} />
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
