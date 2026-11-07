"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, VERSION } from "@/content/nav";
import { layout } from "@/lib/design-system";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur-sm">
      <div className={cn(layout.container, "grid h-16 grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]")}>
        <Link href="/" className="font-serif text-xl text-ink" aria-label="UTPE Toolkit, home">
          UTPE<span className="px-1.5 text-ink-faint">·</span><span className="italic text-ink-faint">Toolkit</span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? "page" : undefined}
                    className={cn("font-sans text-[13px] underline-offset-[6px] decoration-1 hover:underline", active ? "text-ink underline decoration-crimson decoration-2" : "text-ink-medium")}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-2">
          <span className="hidden font-mono text-xs text-ink-faint sm:inline">{VERSION}</span>
          <ThemeToggle />
          <button type="button" className="grid h-9 w-9 place-items-center text-ink lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
            {open ? <X size={24} strokeWidth={1.5} aria-hidden="true" /> : <Menu size={24} strokeWidth={1.5} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-paper px-6 py-8 lg:hidden">
          <ul className="divide-y divide-rule border-y border-rule">
            {NAV.map((item, i) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={cn("flex items-baseline gap-4 py-4 font-serif text-2xl", pathname === item.href ? "text-crimson" : "text-ink")}>
                  <span className="font-mono text-xs text-ink-faint">§ {String(i).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
