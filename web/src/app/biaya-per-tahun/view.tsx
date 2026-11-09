"use client";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Note, PageHeader, Panel, Stat, axis, tooltipStyle } from "@/components/ui";
import { api, arr, isNum, numAt, rec, useLive } from "@/lib/api";
import { MARGIN_KONTRIBUSI, dec, diskonVsVolume, eacTable, pct, type EacRow } from "@/lib/data";

function parseRow(x: unknown): EacRow {
  const o = rec(x);
  if (typeof o.produk !== "string") throw new Error("produk");
  const be = o.diskonto_impas;
  return {
    produk: o.produk,
    premi_harga: numAt(o, "premi_harga"),
    selisih_biaya_th_tanpa_diskonto: numAt(o, "selisih_biaya_th_tanpa_diskonto"),
    eac_patria: numAt(o, "eac_patria"),
    eac_china: numAt(o, "eac_china"),
    selisih_eac: numAt(o, "selisih_eac"),
    flex_patria: numAt(o, "flex_patria"),
    flex_china: numAt(o, "flex_china"),
    selisih_flex: numAt(o, "selisih_flex"),
    diskonto_impas: isNum(be) ? be : null,
  };
}

export function BiayaPerTahunView() {
  // Diskonto pelanggan dalam persen (Lampiran A memakai 12%).
  const [rPct, setRPct] = useState(12);
  const r = rPct / 100;
  const local = eacTable(r);
  const tbl = useLive(
    `eac:${rPct}`,
    async (s) => arr(rec(await api(`/api/eac?r=${r}`, s)).produk).map(parseRow),
    local,
    250,
  );
  const rows = tbl.data;
  const kalah = rows.filter((x) => x.diskonto_impas !== null && r > x.diskonto_impas);

  // Diskon vs volume (Rp4,16 M; margin kontribusi 30% = Tabel B1a I03).
  const [diskon, setDiskon] = useState(20);
  const [margin, setMargin] = useState(MARGIN_KONTRIBUSI * 100);
  const dvLocal = diskonVsVolume(4.16, diskon / 100, margin / 100);
  const dv = useLive(
    `dv:${diskon}:${margin}`,
    async (s) => {
      const o = rec(await api(`/api/eac/discount?discount=${diskon / 100}&margin=${margin / 100}`, s));
      const vi = o.volume_impas;
      return {
        kontribusi_penuh: numAt(o, "kontribusi_penuh"),
        kontribusi_diskon: numAt(o, "kontribusi_diskon"),
        penurunan_kontribusi: numAt(o, "penurunan_kontribusi"),
        volume_impas: isNum(vi) ? vi : null,
      };
    },
    dvLocal,
    250,
  );

  const chart = rows.map((x) => ({
    name: `Produk ${x.produk}`,
    EAC: +(x.selisih_eac * 100).toFixed(1),
    FLEX: +(x.selisih_flex * 100).toFixed(1),
  }));

  return (
    <div className="wrap">
      <PageHeader
        eyebrow="Biaya per tahun · data Case Book"
        title="Lebih mahal di depan, lebih murah per tahun."
        lead="Biaya per tahun setara (EAC) dan skema sewa-beli FLEX 4 tahun untuk produk A–D versus pesaing China. Angka sama dengan Lampiran A Executive Summary."
        source={tbl.source}
      />
      <div className="grid g4">
        {rows.map((x, i) => (
          <Stat
            key={x.produk}
            label={`Produk ${x.produk}: EAC vs China`}
            tint={x.selisih_eac < 0 ? "green" : "orange"}
            hint={`Harga ${pct(x.premi_harga, 0)} · FLEX ${pct(x.selisih_flex)} · impas ${x.diskonto_impas === null ? "–" : pct(x.diskonto_impas, 1, false)}`}
            delay={i * 0.06}
          >
            {pct(x.selisih_eac)}
          </Stat>
        ))}
      </div>

      <div className="section">
        <Panel
          title="Tingkat diskonto pelanggan"
          note="Semakin tinggi diskonto, semakin besar bobot harga beli. Titik impas = diskonto saat EAC PATRIA sama dengan China."
        >
          <div className="field">
            <div className="field-row">
              <label htmlFor="r">Diskonto</label>
              <span>{pct(r, 1, false)}</span>
            </div>
            <input id="r" type="range" min={0} max={20} step={0.5} value={rPct} onChange={(e) => setRPct(+e.target.value)} />
          </div>
          {kalah.length > 0 ? (
            <p className="small" style={{ margin: 0, color: "var(--orange)" }}>
              {kalah.map((x) => `Produk ${x.produk} kehilangan keunggulan biaya per tahun di atas ${pct(x.diskonto_impas ?? 0, 1, false)}`).join("; ")}.
            </p>
          ) : (
            <p className="small muted" style={{ margin: 0 }}>Pada diskonto ini keempat produk PATRIA lebih murah per tahun daripada pesaing China.</p>
          )}
        </Panel>
      </div>

      <div className="section grid g2">
        <Panel title="Selisih PATRIA vs China" note="Persen; negatif = PATRIA lebih murah per tahun">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart}>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="name" {...axis} />
              <YAxis {...axis} tickFormatter={(v) => `${v}%`} />
              <Tooltip {...tooltipStyle} formatter={(v) => `${String(v).replace(".", ",")}%`} />
              <Legend wrapperStyle={{ color: "var(--muted)", fontSize: 12 }} />
              <ReferenceLine y={0} stroke="var(--muted)" />
              <Bar dataKey="EAC" name="Biaya per tahun (EAC)" fill="var(--accent)" radius={[6, 6, 6, 6]} />
              <Bar dataKey="FLEX" name="FLEX 4 tahun" fill="var(--green)" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Rincian per produk" note="Rp miliar per tahun; FLEX = sewa-beli 4 tahun, nilai sisa dijamin 80% nilai buku" delay={0.1}>
          <div className="scroll-x">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th className="r">Tanpa diskonto</th>
                  <th className="r">EAC PATRIA / China</th>
                  <th className="r">FLEX PATRIA / China</th>
                  <th className="r">Impas</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.produk} className={x.diskonto_impas !== null && r > x.diskonto_impas ? "hl" : undefined}>
                    <td>{x.produk}</td>
                    <td className="r">{pct(x.selisih_biaya_th_tanpa_diskonto, 0)}</td>
                    <td className="r">{dec(x.eac_patria)} / {dec(x.eac_china)}</td>
                    <td className="r">{dec(x.flex_patria)} / {dec(x.flex_china)}</td>
                    <td className="r">{x.diskonto_impas === null ? "–" : pct(x.diskonto_impas, 1, false)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="section" id="diskon">
        <Panel
          title="Diskon vs volume"
          note="Volume sama, tanpa margin pembiayaan sebagai laba UTPE. Harga Rp4,16 miliar; margin kontribusi awal 30% (rasio biaya variabel 70%)."
        >
          <div className="grid g2">
            <div>
              <div className="field">
                <div className="field-row"><label htmlFor="d">Diskon</label><span>{diskon}%</span></div>
                <input id="d" type="range" min={5} max={30} step={1} value={diskon} onChange={(e) => setDiskon(+e.target.value)} />
              </div>
              <div className="field">
                <div className="field-row"><label htmlFor="m">Margin kontribusi</label><span>{margin}%</span></div>
                <input id="m" type="range" min={20} max={40} step={1} value={margin} onChange={(e) => setMargin(+e.target.value)} />
              </div>
            </div>
            <div>
              <div className="stat-label">Kontribusi per unit</div>
              <div className="stat-value tint-orange">{pct(dv.data.penurunan_kontribusi)}</div>
              <div className="stat-hint">
                Rp{dec(dv.data.kontribusi_penuh, 2)} → Rp{dec(dv.data.kontribusi_diskon, 2)} miliar.{" "}
                {dv.data.volume_impas === null
                  ? "Diskon melebihi margin: tidak ada volume yang membuatnya impas."
                  : `Volume harus naik ${dec(dv.data.volume_impas, 1)}× agar laba kontribusi tidak turun.`}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="section">
        <Note>
          Sumber: Case Book, Supporting Data I (harga dan umur pakai); diskonto 12% dan skema FLEX mengikuti Lampiran A Executive
          Summary. EAC = harga × r / (1 − (1 + r)<sup>−umur</sup>). API: <code>/api/eac</code>, <code>/api/eac/discount</code>.
        </Note>
      </div>
    </div>
  );
}
