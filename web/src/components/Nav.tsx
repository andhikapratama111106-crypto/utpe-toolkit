"use client";
import { MotionConfig, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { api, rec, useLive } from "@/lib/api";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/tco", label: "TCO" },
  { href: "/sensitivity", label: "Sensitivity" },
  { href: "/projection", label: "Projection" },
  { href: "/game-theory", label: "Game Theory" },
  { href: "/validate", label: "Validate" },
];

function Health() {
  const { source } = useLive(
    "health",
    async (s) => {
      if (rec(await api("/api/health", s)).ok !== true) throw new Error("not ok");
      return true;
    },
    false,
  );
  const text = { loading: "API…", live: "API online", fallback: "Mode statis" }[source];
  return (
    <span className="pill" title="Status /api/health">
      <span className={`dot ${source}`} />
      <span className="hide-sm">{text}</span>
    </span>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => setTheme(document.documentElement.dataset.theme ?? "dark"), []);
  const flip = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("utpe-theme", next);
    setTheme(next);
  };
  return (
    <button className="icon-btn" onClick={flip} aria-label={theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}>
      {theme === "dark" ? "☀︎" : "☾"}
    </button>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <MotionConfig reducedMotion="user">
      <nav className="nav" aria-label="Utama">
        <div className="nav-in">
          <Link href="/" className="brand">UTPE</Link>
          <div className="links">
            {LINKS.map((l) => {
              const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
              return (
                <Link key={l.href} href={l.href} className="link" aria-current={active ? "page" : undefined}>
                  {active && <motion.span layoutId="nav-pill" className="link-pill" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                  {l.label}
                </Link>
              );
            })}
          </div>
          <Health />
          <ThemeToggle />
        </div>
      </nav>
      <main>{children}</main>
      <footer className="foot">UTPE Toolkit · analisis TCO, sensitivity, proyeksi, dan game theory</footer>
    </MotionConfig>
  );
}
