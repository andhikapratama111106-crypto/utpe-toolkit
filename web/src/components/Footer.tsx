import Link from "next/link";
import { CITATION, NAV, VERSION } from "@/content/nav";
import { layout } from "@/lib/design-system";
import { cn } from "@/lib/cn";
import { CiteThis } from "./CiteThis";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-rule bg-paper-alt py-12">
      <div className={cn(layout.container, "grid gap-10 md:grid-cols-3")}>
        <div>
          <p className="font-serif text-xl">UTPE<span className="px-1.5 text-ink-faint">·</span><span className="italic text-ink-faint">Toolkit</span></p>
          <p className="mt-3 max-w-xs font-serif text-sm leading-relaxed text-ink-medium">
            A decision-support system for the Indonesian heavy-equipment market. Total Cost of Ownership, Monte Carlo simulation and game-theoretic analysis.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-ink-faint">Sections</p>
          <ul className="mt-3 space-y-2 font-mono text-xs">
            {NAV.map((n, i) => (
              <li key={n.href}><Link href={n.href} className="text-ink-medium hover:text-ink hover:underline">§ {String(i).padStart(2, "0")} {n.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-ink-faint">Cite</p>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-medium">{CITATION}</p>
          <div className="mt-3"><CiteThis /></div>
        </div>
      </div>
      <div className={cn(layout.container, "mt-10 border-t border-rule pt-4")}>
        <p className="font-mono text-[11px] text-ink-faint">© 2026 TEAM ANOMALI · National Business Case Competition 2026 · {VERSION}</p>
      </div>
    </footer>
  );
}
