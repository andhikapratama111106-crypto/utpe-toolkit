"use client";
import { PageHeader, Panel, Stat } from "@/components/ui";
import { api, arr, isNum, numAt, rec, useLive } from "@/lib/api";
import { VALIDATE_FALLBACK, num, type Check } from "@/lib/data";

const fmt = (v: number | null) =>
  v === null ? "-" : Math.abs(v) < 1000 ? v.toLocaleString("id-ID", { maximumFractionDigits: 1 }).replace("-", "−") : num(v);

export function ValidateView() {
  const { data, source } = useLive(
    "validate",
    async (s) => {
      const r = rec(await api("/api/validate", s));
      const checks = arr(r.checks).map((x): Check => {
        const o = rec(x);
        if (typeof o.label !== "string" || typeof o.status !== "string") throw new Error("check tidak valid");
        return { label: o.label, status: o.status, expected: numAt(o, "expected"), csv_value: isNum(o.csv_value) ? o.csv_value : null };
      });
      if (typeof r.passed !== "boolean") throw new Error("passed");
      return { passed: r.passed, checks };
    },
    VALIDATE_FALLBACK,
  );

  const ok = data.checks.filter((c) => c.status === "OK").length;

  return (
    <div className="wrap">
      <PageHeader
        eyebrow="Validasi"
        title={data.passed ? "Semua angka konsisten." : "Ada angka yang tidak cocok."}
        lead="Hasil analisis dicocokkan dengan angka Executive Summary. Toleransi 0,5% untuk angka rupiah, 0,5 poin persen untuk biaya per tahun."
        source={source}
      />
      <div className="grid g3">
        <Stat label="Status" tint={data.passed ? "green" : "orange"}>{data.passed ? "Lulus" : "Gagal"}</Stat>
        <Stat label="Cek lulus" tint="accent" hint={`dari ${data.checks.length} pengecekan`} delay={0.08}>
          {ok}/{data.checks.length}
        </Stat>
      </div>

      <div className="section">
        <Panel title="Rincian pengecekan">
          <div className="scroll-x">
            <table className="tbl">
              <thead>
                <tr><th>Angka</th><th className="r">Hasil</th><th className="r">Executive Summary</th><th className="r">Status</th></tr>
              </thead>
              <tbody>
                {data.checks.map((c) => (
                  <tr key={c.label}>
                    <td>{c.label}</td>
                    <td className="r">{fmt(c.csv_value)}</td>
                    <td className="r">{fmt(c.expected)}</td>
                    <td className="r"><span className={`badge b-${c.status}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
