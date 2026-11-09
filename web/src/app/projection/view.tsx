"use client";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Link from "next/link";
import { CountUp, Note, PageHeader, Panel, Stat, axis, tooltipStyle } from "@/components/ui";
import { api, isNum, numAt, rec, useLive } from "@/lib/api";
import { KEY, PROJECTION_FALLBACK, miliar, num } from "@/lib/data";

export function ProjectionView() {
  const { data, source } = useLive(
    "projection",
    async (s) => {
      const r = rec(await api("/api/projection", s, { konservatif: true }));
      const pct = rec(r.delta).percentage;
      return {
        price_war: { profit: numAt(rec(r.price_war), "profit") },
        financing: { profit: numAt(rec(r.financing), "profit") },
        delta: { absolute: numAt(rec(r.delta), "absolute"), percentage: isNum(pct) ? pct : null },
      };
    },
    PROJECTION_FALLBACK as { price_war: { profit: number }; financing: { profit: number }; delta: { absolute: number; percentage: number | null } },
  );

  const bars = [
    { name: "Price War", v: data.price_war.profit / 1e9 },
    { name: "Financing", v: data.financing.profit / 1e9 },
  ];
  // NPV tidak dihitung oleh API; angkanya dari Executive Summary (configs/validation_rules.yaml).
  const npv = [
    { name: "P10", v: KEY.npvP10 / 1e9 },
    { name: "P50", v: KEY.npvP50 / 1e9 },
    { name: "P90", v: KEY.npvP90 / 1e9 },
  ];

  return (
    <div className="wrap">
      <PageHeader
        eyebrow="Proyeksi finansial"
        title="Perang harga memangkas laba lebih cepat daripada menambah volume."
        lead="Perbandingan satu periode untuk ilustrasi. Nilai FLEX bagi UTPE berasal dari volume, harga yang terjaga, servis, dan reman, bukan dari bunga."
        source={source}
      />
      <Note>
        Volume Financing (220 unit) melebihi pasar dasar 200, dan sepertiga tambahan profit berasal dari margin pembiayaan yang dalam
        struktur FLEX menjadi milik SAN Finance; karena itu angka di halaman ini tidak dipakai di Executive Summary. Uji yang sejenis
        (volume sama, tanpa bunga): <Link href="/biaya-per-tahun#diskon">diskon vs volume</Link> — diskon 20% menurunkan kontribusi
        per unit 67%, sehingga volume harus naik 3×.
      </Note>
      <div className="grid g3">
        <Stat label="Profit Price War" tint="orange" hint="Diskon 20%, 160 unit">
          <CountUp value={data.price_war.profit / 1e9} format={(n) => miliar(n * 1e9)} />
        </Stat>
        <Stat label="Profit Financing" tint="green" hint="Konservatif 3%, 220 unit (> pasar 200)" delay={0.08}>
          <CountUp value={data.financing.profit / 1e9} format={(n) => miliar(n * 1e9)} />
        </Stat>
        <Stat
          label="Selisih"
          hint={data.delta.percentage === null ? undefined : `+${num(data.delta.percentage)}% dari Price War`}
          delay={0.16}
        >
          +<CountUp value={data.delta.absolute / 1e9} format={(n) => miliar(n * 1e9)} />
        </Stat>
      </div>

      <div className="section grid g2">
        <Panel title="Laba total" note="Rp miliar">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bars}>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="name" {...axis} />
              <YAxis {...axis} />
              <Tooltip {...tooltipStyle} formatter={(v) => `${Number(v).toFixed(1)} M`} />
              <Bar dataKey="v" name="Laba" radius={[10, 10, 0, 0]}>
                <Cell fill="var(--orange)" />
                <Cell fill="var(--green)" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title={`NPV · P50 ${miliar(KEY.npvP50)}`} note="Sebaran P10 / P50 / P90, Rp miliar. Sumber: Executive Summary." delay={0.1}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={npv}>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="name" {...axis} />
              <YAxis {...axis} />
              <Tooltip {...tooltipStyle} formatter={(v) => `${num(Number(v))} M`} />
              <Bar dataKey="v" name="NPV" fill="var(--purple)" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}
