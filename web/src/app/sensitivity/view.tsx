"use client";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Link from "next/link";
import { CountUp, Note, PageHeader, Panel, Stat, axis, tooltipStyle } from "@/components/ui";
import { api, arr, numAt, rec, useLive } from "@/lib/api";
import { MC_FALLBACK, SCENARIOS_FALLBACK, num, rp } from "@/lib/data";

const ITER = [1000, 10_000, 50_000];
const FALLBACK = { scenarios: SCENARIOS_FALLBACK, mc: MC_FALLBACK as typeof MC_FALLBACK | null };

export function SensitivityView() {
  const [n, setN] = useState(10_000);
  const { data, source } = useLive(
    `sens:${n}`,
    async (s) => {
      const r = rec(await api("/api/sensitivity", s, { iterations: n, monte_carlo: true }));
      const scenarios = arr(r.scenarios).map((x) => {
        const o = rec(x);
        if (typeof o.skenario !== "string") throw new Error("skenario");
        return { skenario: o.skenario, cost_per_hour: numAt(o, "cost_per_hour") };
      });
      const mcRaw = r.mc === null || r.mc === undefined ? null : rec(r.mc);
      const mc = mcRaw && { p10: numAt(mcRaw, "p10"), p50: numAt(mcRaw, "p50"), p90: numAt(mcRaw, "p90") };
      return { scenarios, mc };
    },
    FALLBACK,
    250,
  );

  const base = data.scenarios[0]?.cost_per_hour ?? 0;
  const best = data.scenarios.reduce((a, b) => (b.cost_per_hour < a.cost_per_hour ? b : a), data.scenarios[0]);
  const chart = data.scenarios.map((s, i) => ({ ...s, name: `S${i + 1}`, cost: Math.round(s.cost_per_hour) }));

  return (
    <div className="wrap">
      <PageHeader
        eyebrow="Sensitivity"
        title="Apa yang menggeser biayanya."
        lead="Lima skenario harga, lifetime, dan maintenance, lalu Monte Carlo untuk melihat sebaran cost per jam."
        source={source}
      />
      <Note>
        Catatan komparabilitas: profil Komatsu PC200 dan SANY SY215C adalah ekskavator ±20 ton, sedangkan Product B di konfigurasi ini Rp4,16 miliar. Perhitungan per jam tanpa nilai sisa dan diskonto. Perbandingan produk sejenis ada di halaman <Link href="/biaya-per-tahun">Biaya per Tahun</Link>.
      </Note>
      <div className="grid g3">
        <Stat label="Baseline" unit="Rp/jam" hint="Case Book">
          <CountUp value={base} format={num} />
        </Stat>
        <Stat label="Skenario terbaik" tint="green" unit="Rp/jam" hint={`Hemat ${num(base - best.cost_per_hour)} dari baseline`} delay={0.08}>
          <CountUp value={best.cost_per_hour} format={num} />
        </Stat>
        {data.mc && (
          <Stat label="Monte Carlo P50" tint="purple" unit="Rp/jam" hint={`P10 ${num(data.mc.p10)} · P90 ${num(data.mc.p90)}`} delay={0.16}>
            <CountUp value={data.mc.p50} format={num} />
          </Stat>
        )}
      </div>

      <div className="section grid g2">
        <Panel title="Skenario deterministik" note="Cost per jam, Rp">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart}>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="name" {...axis} />
              <YAxis {...axis} domain={[0, "auto"]} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}rb`} />
              <Tooltip {...tooltipStyle} formatter={(v) => rp(Number(v))} labelFormatter={(_, p) => p?.[0]?.payload?.skenario ?? ""} />
              <Bar dataKey="cost" name="Cost/jam" radius={[10, 10, 0, 0]}>
                {chart.map((c, i) => <Cell key={c.skenario} fill={i === 0 ? "var(--muted)" : "var(--accent)"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <ol className="muted small" style={{ paddingLeft: 18, marginBottom: 0 }}>
            {chart.map((c) => <li key={c.skenario}>{c.skenario}</li>)}
          </ol>
        </Panel>

        <Panel title="Monte Carlo" note={data.mc ? `Percentile cost per jam, ${num(n)} iterasi` : "Monte Carlo tidak tersedia"} delay={0.1}>
          <div className="seg" role="group" aria-label="Jumlah iterasi">
            {ITER.map((i) => (
              <button key={i} aria-pressed={n === i} onClick={() => setN(i)}>{num(i)}</button>
            ))}
          </div>
          {data.mc && (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={[{ name: "P10", v: Math.round(data.mc.p10) }, { name: "P50", v: Math.round(data.mc.p50) }, { name: "P90", v: Math.round(data.mc.p90) }]}>
                <CartesianGrid vertical={false} stroke="var(--line)" />
                <XAxis dataKey="name" {...axis} />
                <YAxis {...axis} domain={["dataMin - 40000", "dataMax + 20000"]} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}rb`} />
                <Tooltip {...tooltipStyle} formatter={(v) => rp(Number(v))} />
                <Bar dataKey="v" name="Cost/jam" fill="var(--purple)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>
    </div>
  );
}
