"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
};
const snapshot = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, snapshot, () => "light");
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      aria-label={`Switch to ${next} theme`}
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem("utpe-theme", next); } catch { /* theme still applies for this visit */ }
      }}
      className="grid h-9 w-9 place-items-center text-ink-medium transition-colors duration-150 hover:text-ink"
    >
      {theme === "dark" ? <Sun size={18} strokeWidth={1.5} aria-hidden="true" /> : <Moon size={18} strokeWidth={1.5} aria-hidden="true" />}
    </button>
  );
}
