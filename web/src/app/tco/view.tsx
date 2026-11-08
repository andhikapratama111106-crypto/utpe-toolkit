"use client";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CountUp, PageHeader, Panel, Stat, axis, tooltipStyle } from "@/components/ui";
import { api, numAt, rec, useLive } from "@/lib/api";
import { ASSUME, FLEET, miliar, num, rp, tcoCalc, type Unit } from "@/lib/data";

const COLORS = ["var(--muted)", "var(--orange)", "var(--accent)"];

function body(u: Unit) {
  return {
    brand: u.merek,
    model: u.model,
    purchase_price: u.harga,
    lifetime_hours: u.lifetime,
    maintenance_per_hour: u.maint,
    fuel_consumption_lph: ASSUME.bbm,
    fuel_price_per_liter: ASSUME.solar,
    operator_wage_per_hour: ASSUME.operator,
  };
}

async function callTco(u: Unit, signal: AbortSignal) {
  const r = rec(await api("/api/tco", signal, body(u)));
  return { total: numAt(r, "total_tco"), perHour: numAt(r, "cost_per_hour") };
}

export function TcoView() {
  const fallbackRows = FLEET.map((u) => ({ ...u, ...tcoCalc(u) }));
  const fleet = useLive(
    "fleet",
    async (s) => {
      const live = await Promise.all(FLEET.map((u) => callTco(u, s)));
      return fallbackRows.map((r, i) => ({ ...r, ...live[i] }));
    },
    fallbackRows,
  );
  const rows = fleet.data;
  const utpe = rows[2];

  // Kalkulator UTPE: geser asumsi, hitung ulang lewat API (rumus lokal jika API belum siap).
  const [harga, setHarga] = useState(4160);
  const [lifetime, setLifetime] = useState(12_000);
  const [maint, setMaint] = useState(55_000);
  const unit: Unit = { ...FLEET[2], harga: harga * 1e6, lifetime, maint };
  const local = tcoCalc(unit);
  const calc = useLive(`calc:${harga}:${lifetime}:${maint}`, async (s) => ({ ...local, ...(await callTco(unit, s)) }), local, 350);

  const stacked = rows.map((r) => ({
    name: r.merek.split(" ")[0],
    Harga: r.harga / 1e9,
    BBM: r.bbm / 1e9,
    Maintenance: r.maint / 1e9,
    Operator: r.operator / 1e9,
  }));

  return (
    <div className="wrap">
      <PageHeader
        eyebrow="Total Cost of Ownership"
        title="Biaya per jam, apa adanya."
        lead="Harga beli, BBM, maintenance, dan operator, dibagi umur pakai. UTPE lebih mahal per jam, tetapi umurnya lebih panjang."
        source={fleet.source}
      />
      <div className="grid g3">
        {rows.map((r, i) => (
          <Stat key={r.merek} label={r.merek} unit="Rp/jam" tint={i === 2 ? "accent" : "purple"} hint={`${r.model} · total ${miliar(r.total)}`} delay={i * 0.08}>
            <CountUp value={r.perHour} format={num} />
          </Stat>
        ))}
      </div>

      <div className="section grid g2">
        <Panel title="Cost per jam" note="Rp per jam operasi">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rows.map((r) => ({ name: r.merek.split(" ")[0], perHour: Math.round(r.perHour) }))}>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="name" {...axis} />
              <YAxis {...axis} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}rb`} />
              <Tooltip {...tooltipStyle} formatter={(v) => rp(Number(v))} />
              <Bar dataKey="perHour" name="Cost/jam" radius={[10, 10, 0, 0]}>
                {rows.map((r, i) => <Cell key={r.merek} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Komposisi biaya" note="Rp miliar selama umur pakai" delay={0.1}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stacked}>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="name" {...axis} />
              <YAxis {...axis} />
              <Tooltip {...tooltipStyle} formatter={(v) => `${Number(v).toFixed(2)} M`} />
              <Legend wrapperStyle={{ color: "var(--muted)", fontSize: 12 }} />
              <Bar dataKey="Harga" stackId="a" fill="var(--accent)" />
              <Bar dataKey="BBM" stackId="a" fill="var(--orange)" />
              <Bar dataKey="Maintenance" stackId="a" fill="var(--purple)" />
              <Bar dataKey="Operator" stackId="a" fill="var(--green)" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="section">
        <Panel title="Kalkulator UTPE Product B" note={`Geser asumsi. Selisih ke baseline ${num(utpe.perHour)} Rp/jam ikut berubah.`}>
          <div className="grid g2">
            <div>
              <div className="field">
                <div className="field-row"><label htmlFor="h">Harga beli</label><span>{num(harga)} juta</span></div>
                <input id="h" type="range" min={2000} max={5000} step={50} value={harga} onChange={(e) => setHarga(+e.target.value)} />
              </div>
              <div className="field">
                <div className="field-row"><label htmlFor="l">Lifetime</label><span>{num(lifetime)} jam</span></div>
                <input id="l" type="range" min={6000} max={18000} step={500} value={lifetime} onChange={(e) => setLifetime(+e.target.value)} />
              </div>
              <div className="field">
                <div className="field-row"><label htmlFor="m">Maintenance</label><span>{rp(maint)}/jam</span></div>
                <input id="m" type="range" min={30_000} max={80_000} step={1000} value={maint} onChange={(e) => setMaint(+e.target.value)} />
              </div>
            </div>
            <div>
              <div className="stat-label">Cost per jam</div>
              <div className="stat-value tint-accent"><CountUp value={calc.data.perHour} format={num} /><span className="stat-unit">Rp/jam</span></div>
              <div className="stat-hint">Total TCO {miliar(calc.data.total)} · {calc.source === "live" ? "dihitung API" : calc.source === "loading" ? "menghitung…" : "rumus lokal"}</div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
