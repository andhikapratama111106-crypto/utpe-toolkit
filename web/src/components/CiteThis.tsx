"use client";

import { useState } from "react";
import { BIBTEX } from "@/content/nav";

/** Inline expansion (no modal) showing the BibTeX entry. */
export function CiteThis() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" aria-expanded={open} aria-controls="bibtex" onClick={() => setOpen((v) => !v)} className="border-b border-crimson font-mono text-[11px] uppercase tracking-wide text-ink hover:text-crimson">
        {open ? "Hide citation" : "Cite this"}
      </button>
      {open && <pre id="bibtex" className="mt-3 overflow-x-auto border border-rule bg-paper p-3 font-mono text-[11px] leading-relaxed text-ink-medium">{BIBTEX}</pre>}
    </div>
  );
}
