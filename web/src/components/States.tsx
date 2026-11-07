import type { ReactNode } from "react";
import { ApiError, NetworkError, ValidationError } from "@/lib/api";
import { Button } from "./Button";
import { Callout } from "./Callout";

/** Loading: three pulsing rules and a mono caption. No spinner. */
export function Loading({ label = "Computing…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="py-8">
      <div aria-hidden="true" className="space-y-4">
        {["w-full", "w-5/6", "w-2/3"].map((w) => (
          <div key={w} className={`h-px ${w} animate-pulse bg-ink-ghost`} />
        ))}
      </div>
      <p className="mt-4 font-mono text-xs text-ink-faint">{label}</p>
    </div>
  );
}

/** Empty: dashed box with an italic hint and an optional action. */
export function Empty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="border border-dashed border-rule px-6 py-12 text-center">
      <p className="font-serif text-sm italic text-ink-faint">{children}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function describe(error: unknown): string {
  if (error instanceof ValidationError) {
    const lines = error.issues.map((i) => `${i.loc.filter((p) => p !== "body").join(".")}: ${i.msg}`);
    return `The backend rejected the input (HTTP 422). ${lines.join("; ")}`;
  }
  if (error instanceof NetworkError) return `${error.message}. Check that the API server is running.`;
  if (error instanceof ApiError) return `The backend returned HTTP ${error.status}: ${error.message}.`;
  return "The result could not be loaded.";
}

/** Error: "important" callout with message, timestamp and Retry. Cached data, if any, is shown after it. */
export function ErrorCallout({ error, onRetry, cachedAt, children }: { error: unknown; onRetry: () => void; cachedAt?: string; children?: ReactNode }) {
  return (
    <div>
      <Callout variant="important" title="Computation error">
        <p>{describe(error)}</p>
        <p className="mt-1 font-mono text-[11px] text-ink-faint">{new Date().toISOString().replace("T", " ").slice(0, 19)} UTC</p>
        <div className="mt-3">
          <Button variant="ghost" onClick={onRetry}>Retry</Button>
        </div>
      </Callout>
      {cachedAt && children && (
        <div className="mt-6">
          <p className="mb-4 font-mono text-xs text-warn">⚠ Cached from {cachedAt.slice(0, 10)}</p>
          {children}
        </div>
      )}
    </div>
  );
}
