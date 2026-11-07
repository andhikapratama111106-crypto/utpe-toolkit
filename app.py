"""
UTPE Toolkit — Streamlit GUI
Jalankan: streamlit run app.py
"""
import streamlit as st
import subprocess
import pandas as pd
from pathlib import Path
from datetime import datetime

# ─── Config ───
TOOLKIT_DIR = Path(__file__).parent
UTPE_BIN = TOOLKIT_DIR / ".venv" / "bin" / "utpe"
CSV_DIR = TOOLKIT_DIR / "data" / "processed"
RAW_DIR = TOOLKIT_DIR / "data" / "raw"
OUTPUT_DIR = TOOLKIT_DIR / "output"
CONFIG_DIR = TOOLKIT_DIR / "configs"

st.set_page_config(
    page_title="UTPE Toolkit",
    page_icon="🚜",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── UTPE Palette ───
UTPE_RED = "#C12026"
UTPE_BLACK = "#231F20"

st.markdown(f"""
<style>
    .stApp {{ background-color: #fafafa; }}
    h1, h2 {{ color: {UTPE_RED} !important; }}
    .metric-big {{ font-size: 2rem; font-weight: bold; color: {UTPE_RED}; }}
    .metric-label {{ font-size: 0.85rem; color: #666; }}
    div[data-testid="stMetricValue"] {{ color: {UTPE_RED}; }}
</style>
""", unsafe_allow_html=True)


# ─── Helper: run CLI ───
def run_utpe(args: list[str], timeout: int = 180):
    """Jalankan utpe CLI, return (success, stdout, stderr)."""
    cmd = ([str(UTPE_BIN)] if UTPE_BIN.exists() else ["utpe"]) + args
    try:
        r = subprocess.run(cmd, capture_output=True, text=True,
                           cwd=str(TOOLKIT_DIR), timeout=timeout)
        return r.returncode == 0, r.stdout or "", r.stderr or ""
    except subprocess.TimeoutExpired:
        return False, "", f"Timeout setelah {timeout}s"
    except Exception as e:
        return False, "", str(e)


def show_output(success, stdout, stderr, label="Output"):
    if success:
        st.success(f"✅ {label} selesai")
        if stdout.strip():
            st.code(stdout, language="text")
    else:
        st.error(f"❌ {label} gagal")
        if stderr.strip():
            st.code(stderr, language="text")
        if stdout.strip():
            st.code(stdout, language="text")


def load_csv(name):
    p = CSV_DIR / name
    return pd.read_csv(p) if p.exists() else None


# ═══════════════════════════════════════════
# SIDEBAR
# ═══════════════════════════════════════════
st.sidebar.title("🚜 UTPE Toolkit")
st.sidebar.caption("v0.1.0 · NBPC 2026 · TEAM ANOMALI")

page = st.sidebar.radio(
    "Navigasi",
    ["🏠 Dashboard", "📊 TCO", "📈 Sensitivity", "💰 Projection",
     "🎮 Game Theory", "✅ Validate", "📁 Data Explorer", "ℹ️ About"],
)

st.sidebar.divider()
st.sidebar.caption(f"**Toolkit:** `{TOOLKIT_DIR.name}`")
st.sidebar.caption(f"**Python:** `{UTPE_BIN}`")
st.sidebar.caption(f"**Waktu:** {datetime.now().strftime('%H:%M:%S')}")


# ═══════════════════════════════════════════
# PAGE: Dashboard
# ═══════════════════════════════════════════
if page == "🏠 Dashboard":
    st.title("🚜 UTPE Toolkit")
    st.caption("Analisis bisnis alat berat — *When Quality Is No Longer Enough*")

    st.markdown("### 📊 Ringkasan Kunci")

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Cost/hour UTPE", "Rp 754K", "-36% vs SANY target", delta_color="inverse")
    c2.metric("Profit Financing", "Rp 278 M", "+109% vs Price War")
    c3.metric("NPV P50", "Rp 398 M", "P(neg) = 2,0%")
    c4.metric("Nash Eq.", "(200, 150)", "Pareto optimal")

    st.divider()

    st.markdown("### ⚡ Quick Actions")
    col1, col2, col3 = st.columns(3)

    with col1:
        if st.button("🔄 Run Full Pipeline", use_container_width=True, type="primary"):
            with st.spinner("Menjalankan semua analisis (TCO + Sensitivity + Projection + Validate)..."):
                steps = []
                for name, cmd in [
                    ("TCO", ["tco", "--chart"]),
                    ("Sensitivity+MC", ["sensitivity", "--monte-carlo", "--n", "1000"]),
                    ("Projection", ["project"]),
                    ("Projection Konservatif", ["project", "--konservatif"]),
                    ("Validate", ["validate"]),
                ]:
                    ok, out, err = run_utpe(cmd)
                    steps.append((name, ok, out, err))
                all_ok = all(s[1] for s in steps)
                st.success("✅ Semua selesai!" if all_ok else "⚠️ Sebagian gagal")
                for name, ok, out, err in steps:
                    with st.expander(f"{'✅' if ok else '❌'} {name}"):
                        st.code(out or err, language="text")
                st.rerun()

    with col2:
        if st.button("📊 Generate Charts", use_container_width=True):
            with st.spinner("Generate charts..."):
                ok, out, err = run_utpe(["tco", "--chart"])
                show_output(ok, out, err, "Generate charts")

    with col3:
        if st.button("✅ Validate Consistency", use_container_width=True):
            with st.spinner("Validasi 5 angka kunci..."):
                ok, out, err = run_utpe(["validate"])
                show_output(ok, out, err, "Validate")

    st.divider()

    st.markdown("### 📈 Charts Preview")
    chart_files = list(OUTPUT_DIR.glob("*.png"))
    if chart_files:
        cols = st.columns(min(2, len(chart_files)))
        for i, chart in enumerate(chart_files):
            with cols[i % 2]:
                st.image(str(chart), caption=chart.name, use_container_width=True)
    else:
        st.info("Belum ada chart. Klik **Generate Charts** di atas.")

    st.divider()

    st.markdown("### 📋 Status File")
    files_status = {
        "hasil_tco_analysis.csv": CSV_DIR / "hasil_tco_analysis.csv",
        "hasil_sensitivity.csv": CSV_DIR / "hasil_sensitivity.csv",
        "hasil_financial_projection.csv": CSV_DIR / "hasil_financial_projection.csv",
        "validasi_konservatif.csv": CSV_DIR / "validasi_konservatif.csv",
        "cost_per_hour.png": OUTPUT_DIR / "cost_per_hour.png",
        "monte_carlo.png": OUTPUT_DIR / "monte_carlo.png",
        "validation_report.md": OUTPUT_DIR / "validation_report.md",
    }
    for name, path in files_status.items():
        st.markdown(f"{'✅' if path.exists() else '⏳'} **{name}** — `{path.relative_to(TOOLKIT_DIR)}`")


# ═══════════════════════════════════════════
# PAGE: TCO
# ═══════════════════════════════════════════
elif page == "📊 TCO":
    st.title("📊 Total Cost of Ownership")
    st.caption("Hitung dan bandingkan cost-per-hour antar merek")

    tabs = st.tabs(["📋 Hasil Terkini", "🔄 Re-run", "🎨 Chart"])

    with tabs[0]:
        df = load_csv("hasil_tco_analysis.csv")
        if df is not None:
            st.dataframe(df, use_container_width=True)
            st.download_button(
                "⬇️ Download CSV",
                df.to_csv(index=False).encode(),
                "hasil_tco_analysis.csv",
                "text/csv",
            )
        else:
            st.warning("CSV belum ada. Klik tab **Re-run** untuk generate.")

    with tabs[1]:
        st.markdown("**Jalankan ulang analisis TCO**")
        col1, col2 = st.columns([1, 1])
        with col1:
            with_chart = st.checkbox("Buat bar chart", value=True)
        with col2:
            if st.button("▶️ Jalankan `utpe tco`", type="primary", use_container_width=True):
                args = ["tco"] + (["--chart"] if with_chart else [])
                with st.spinner("Menjalankan..."):
                    ok, out, err = run_utpe(args)
                    show_output(ok, out, err, "TCO")
                    st.rerun()

    with tabs[2]:
        chart = OUTPUT_DIR / "cost_per_hour.png"
        if chart.exists():
            st.image(str(chart), use_container_width=True)
        else:
            st.info("Chart belum ada. Jalankan `utpe tco --chart` dulu.")


# ═══════════════════════════════════════════
# PAGE: Sensitivity
# ═══════════════════════════════════════════
elif page == "📈 Sensitivity":
    st.title("📈 Sensitivity & Monte Carlo")
    st.caption("Uji robustness TCO terhadap 5 skenario + Monte Carlo")

    col1, col2 = st.columns([2, 1])
    with col1:
        with_mc = st.checkbox("Jalankan Monte Carlo", value=True)
    with col2:
        n_iter = st.number_input("Iterasi MC", min_value=100, max_value=10000, value=1000, step=100)

    if st.button("▶️ Jalankan Sensitivity", type="primary"):
        args = ["sensitivity"]
        if with_mc:
            args += ["--monte-carlo", "--n", str(n_iter)]
        with st.spinner("Menjalankan..."):
            ok, out, err = run_utpe(args)
            show_output(ok, out, err, "Sensitivity")
            st.rerun()

    st.divider()

    tab1, tab2, tab3 = st.tabs(["📋 Tabel", "📊 Histogram MC", "⬇️ Download"])

    with tab1:
        df = load_csv("hasil_sensitivity.csv")
        if df is not None:
            st.dataframe(df, use_container_width=True)
        else:
            st.info("CSV belum ada.")

    with tab2:
        chart = OUTPUT_DIR / "monte_carlo.png"
        if chart.exists():
            st.image(str(chart), use_container_width=True)
        else:
            st.info("Chart belum ada. Jalankan Monte Carlo dulu.")

    with tab3:
        df = load_csv("hasil_sensitivity.csv")
        if df is not None:
            st.download_button(
                "⬇️ Download hasil_sensitivity.csv",
                df.to_csv(index=False).encode(),
                "hasil_sensitivity.csv",
                "text/csv",
            )


# ═══════════════════════════════════════════
# PAGE: Projection
# ═══════════════════════════════════════════
elif page == "💰 Projection":
    st.title("💰 Financial Projection")
    st.caption("Price War vs Financing — P&L dan profit comparison")

    col1, col2 = st.columns(2)
    with col1:
        if st.button("▶️ Run (Default 9%)", type="primary", use_container_width=True):
            with st.spinner("Menjalankan projection..."):
                ok, out, err = run_utpe(["project"])
                show_output(ok, out, err, "Projection Default")
                st.rerun()
    with col2:
        if st.button("▶️ Run (Konservatif 3%)", type="secondary", use_container_width=True):
            with st.spinner("Menjalankan projection konservatif..."):
                ok, out, err = run_utpe(["project", "--konservatif"])
                show_output(ok, out, err, "Projection Konservatif")
                st.rerun()

    st.divider()

    df = load_csv("hasil_financial_projection.csv")
    if df is not None:
        st.markdown("### 📊 Perbandingan Skenario")
        st.dataframe(df, use_container_width=True)

        c1, c2, c3 = st.columns(3)
        if len(df) >= 2:
            price_war = df[df["Skenario"].str.contains("Price War", case=False)]["Total_Profit"].iloc[0]
            financing = df[df["Skenario"].str.contains("Financing", case=False)]["Total_Profit"].iloc[0]
            delta = financing - price_war
            pct = (delta / price_war) * 100

            c1.metric("Price War", f"Rp {price_war/1e9:,.2f} M")
            c2.metric("Financing", f"Rp {financing/1e9:,.2f} M",
                      f"+{pct:.1f}%")
            c3.metric("Delta", f"Rp {delta/1e9:,.2f} M",
                      "Financing unggul")

        st.download_button(
            "⬇️ Download CSV",
            df.to_csv(index=False).encode(),
            "hasil_financial_projection.csv",
            "text/csv",
        )
    else:
        st.info("Jalankan projection dulu.")


# ═══════════════════════════════════════════
# PAGE: Game Theory
# ═══════════════════════════════════════════
elif page == "🎮 Game Theory":
    st.title("🎮 Game Theory Analysis")
    st.caption("Nash equilibrium untuk interaksi strategis UTPE vs SANY")

    st.markdown("**Config YAML:**")
    games_dir = CONFIG_DIR / "games"
    game_files = list(games_dir.glob("*.yaml")) if games_dir.exists() else []
    game_options = [g.name for g in game_files] if game_files else ["pricing_war.yaml"]

    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        selected_game = st.selectbox("Pilih game", game_options)
    with col2:
        game_type = st.selectbox("Tipe", ["bertrand", "stackelberg", "entry"])
    with col3:
        use_config = st.checkbox("Pakai YAML", value=True)

    if st.button("▶️ Solve Game", type="primary", use_container_width=True):
        args = ["game", game_type]
        if use_config and selected_game:
            args += ["--config", str(games_dir / selected_game)]
        with st.spinner("Solving Nash equilibrium..."):
            ok, out, err = run_utpe(args)
            show_output(ok, out, err, f"Game {game_type}")
            st.session_state["game_output"] = out

    st.divider()

    if "game_output" in st.session_state:
        st.markdown("### 📊 Interpretasi")

        output = st.session_state["game_output"]
        st.code(output, language="text")

        st.markdown("### 💡 Insight untuk Executive Summary")
        st.info("""
        **Nash Equilibrium = (UTPE Premium + Financing, SANY Agresif)**
        
        - **UTPE memilih Premium** karena strategi Diskon hanya menghasilkan 133 (turun 33%)
        - **SANY punya dominant strategy Agresif** — keunggulan biaya struktural
        - **Equilibrium Pareto optimal** — tidak ada kombinasi yang membuat kedua pihak lebih baik
        - **Implikasi:** Price war bukan solusi. UTPE harus bangun diferensiasi (Financing) yang 
          menaikkan payoff Premium dari 200 → 278
        """)

    st.divider()

    st.markdown("### 📁 Config Pricing War")
    yaml_path = games_dir / "pricing_war.yaml"
    if yaml_path.exists():
        st.code(yaml_path.read_text(), language="yaml")


# ═══════════════════════════════════════════
# PAGE: Validate
# ═══════════════════════════════════════════
elif page == "✅ Validate":
    st.title("✅ Validasi Konsistensi")
    st.caption("Cross-check 5 angka kunci: CSV vs Executive Summary")

    if st.button("▶️ Jalankan Validasi", type="primary", use_container_width=True):
        with st.spinner("Validasi 5 angka..."):
            ok, out, err = run_utpe(["validate"])
            show_output(ok, out, err, "Validate")
            st.rerun()

    st.divider()

    report = OUTPUT_DIR / "validation_report.md"
    if report.exists():
        st.markdown("### 📋 Validation Report")
        content = report.read_text()
        st.markdown(content)

        st.download_button(
            "⬇️ Download Report",
            content.encode(),
            "validation_report.md",
            "text/markdown",
        )
    else:
        st.info("Report belum ada. Klik **Jalankan Validasi**.")

    st.divider()

    st.markdown("### 🔍 5 Angka Kunci yang Divalidasi")
    checks = [
        ("Cost/hour Komatsu", "Rp 517.400", "hasil_tco_analysis.csv"),
        ("Cost/hour SANY", "Rp 483.114", "hasil_tco_analysis.csv"),
        ("Cost/hour UTPE", "Rp 754.067", "hasil_tco_analysis.csv"),
        ("Profit Price War", "Rp 133,12 M", "validasi_konservatif.csv"),
        ("Profit Financing", "Rp 278,22 M", "validasi_konservatif.csv"),
    ]
    for label, value, source in checks:
        st.markdown(f"- **{label}** = `{value}` (dari `{source}`)")


# ═══════════════════════════════════════════
# PAGE: Data Explorer
# ═══════════════════════════════════════════
elif page == "📁 Data Explorer":
    st.title("📁 Data Explorer")
    st.caption("Jelajahi semua CSV hasil analisis")

    col1, col2 = st.columns([1, 3])
    with col1:
        location = st.radio("Folder", ["processed", "raw"])
    with col2:
        folder = CSV_DIR if location == "processed" else RAW_DIR
        csv_files = sorted(folder.glob("*.csv")) if folder.exists() else []
        csv_names = [f.name for f in csv_files]

    if not csv_names:
        st.warning(f"Tidak ada CSV di `{folder}`")
    else:
        selected = st.selectbox("Pilih file", csv_names)
        file_path = folder / selected
        df = pd.read_csv(file_path)

        st.markdown(f"### 📄 `{selected}` — {len(df)} baris × {len(df.columns)} kolom")
        st.dataframe(df, use_container_width=True)

        col_a, col_b, col_c = st.columns(3)
        with col_a:
            st.download_button(
                "⬇️ Download CSV",
                df.to_csv(index=False).encode(),
                selected,
                "text/csv",
                use_container_width=True,
            )
        with col_b:
            if st.button("📊 Show Statistics", use_container_width=True):
                st.dataframe(df.describe(), use_container_width=True)


# ═══════════════════════════════════════════
# PAGE: About
# ═══════════════════════════════════════════
elif page == "ℹ️ About":
    st.title("ℹ️ Tentang UTPE Toolkit")
    st.caption("v0.1.0 · NBPC 2026 · TEAM ANOMALI")

    st.markdown("""
    ### 🎯 Tentang Aplikasi
    
    **UTPE Toolkit** adalah *decision-support system* untuk analisis bisnis alat berat, 
    dibangun untuk kasus NBPC 2026: **"When Quality Is No Longer Enough"**.
    
    ### 🏗️ 6 Module
    
    | Module | Fungsi |
    |--------|--------|
    | **Scrapers** | Data acquisition dari 10 pilar (Komatsu, Solar, SANY, OJK, RKAB, dll) |
    | **TCO** | Total Cost of Ownership per merek |
    | **Sensitivity** | Uji robustness + Monte Carlo |
    | **Projection** | P&L, NPV, Price War vs Financing |
    | **Game Theory** | Nash equilibrium, Stackelberg, mechanism design |
    | **Reporting** | Validator (5 checks) + charts |
    
    ### 📊 Data yang Digunakan
    
    - `hasil_tco_analysis.csv` — TCO 3 merek
    - `hasil_sensitivity.csv` — 5 skenario
    - `hasil_financial_projection.csv` — Price War vs Financing
    - `validasi_konservatif.csv` — Profit comparison
    - `configs/games/pricing_war.yaml` — Payoff matrix
    
    ### 🚀 Teknologi
    
    - Python 3.9+, `click`, `pandas`, `matplotlib`
    - No `nashpy` — solver 2×2 manual
    - 29 tests pass
    - Streamlit GUI
    
    ### 📖 Cara Pakai
    
    1. **Sidebar kiri** — pilih module
    2. **Tombol "▶️ Jalankan"** — eksekusi analisis
    3. **Download CSV** — ekspor hasil untuk lampiran
    
    ### 📝 Citation
    
    Jika menggunakan toolkit ini untuk publikasi:
    ```
    TEAM ANOMALI. (2026). UTPE Toolkit v0.1.0 [Software].
    NBPC 2026 — National Business Case Competition.
    ```
    """)

    st.divider()
    st.caption("Dibangun dengan ❤️ untuk NBPC 2026")
