"use client";
import { animate, motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Source } from "@/lib/api";

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const [v, setV] = useState(value);
  const prev = useRef(0);
  useEffect(() => {
    const c = animate(prev.current, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (x) => {
        prev.current = x;
        setV(x);
      },
    });
    return () => c.stop();
  }, [value]);
  return <>{format(v)}</>;
}

type Tint = "accent" | "green" | "purple" | "orange";

export function Stat({
  label,
  children,
  unit,
  hint,
  tint = "accent",
  delay = 0,
}: {
  label: string;
  children: ReactNode;
  unit?: string;
  hint?: string;
  tint?: Tint;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="card" style={{ height: "100%" }}>
        <div className="stat-label">{label}</div>
        <div className={`stat-value tint-${tint}`}>
          {children}
          {unit && <span className="stat-unit">{unit}</span>}
        </div>
        {hint && <div className="stat-hint">{hint}</div>}
      </div>
    </Reveal>
  );
}

export function PageHeader({ eyebrow, title, lead, source }: { eyebrow: string; title: string; lead: string; source?: Source }) {
  return (
    <header>
      <p className="eyebrow">{eyebrow}</p>
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        {title}
      </motion.h1>
      <p className="lead">{lead}</p>
      {source && <SourceBadge source={source} />}
    </header>
  );
}

export function SourceBadge({ source }: { source: Source }) {
  const text = { loading: "Memuat…", live: "Data live dari API", fallback: "Data statis (API belum siap)" }[source];
  return (
    <span className="pill" role="status">
      <span className={`dot ${source}`} />
      {text}
    </span>
  );
}

export function Panel({ title, note, children, delay = 0 }: { title: string; note?: string; children: ReactNode; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <section className="card">
        <h2>{title}</h2>
        {note && <p className="muted small" style={{ margin: 0 }}>{note}</p>}
        <div className="chart">{children}</div>
      </section>
    </Reveal>
  );
}

// Tema Recharts: warna dari CSS variable supaya ikut dark/light.
export const axis = { stroke: "var(--muted)", tick: { fill: "var(--muted)", fontSize: 12 }, tickLine: false, axisLine: { stroke: "var(--line)" } } as const;
export const tooltipStyle = {
  contentStyle: { background: "var(--elev)", border: "1px solid var(--line)", borderRadius: 12, color: "var(--text)" },
  labelStyle: { color: "var(--muted)" },
  itemStyle: { color: "var(--text)" },
  cursor: { fill: "var(--line)" },
} as const;
