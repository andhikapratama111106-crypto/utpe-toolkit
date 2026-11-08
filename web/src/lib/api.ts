"use client";
import { useEffect, useRef, useState } from "react";

export type Source = "loading" | "live" | "fallback";

/** Panggil /api/*. GET jika tanpa body, POST JSON jika ada body. Lempar error bila bukan 2xx. */
export async function api(path: string, signal: AbortSignal, body?: unknown): Promise<unknown> {
  const res = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal,
  });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json();
}

/**
 * Ambil data live; bila gagal (API belum siap, bentuk salah, timeout 8 dtk) pakai `fallback`.
 * `key` memicu ambil ulang; `load` harus melempar error untuk bentuk respons yang tidak valid.
 */
export function useLive<T>(key: string, load: (signal: AbortSignal) => Promise<T>, fallback: T, delayMs = 0) {
  const [state, setState] = useState<{ data: T; source: Source }>({ data: fallback, source: "loading" });
  const loadRef = useRef(load);
  loadRef.current = load;
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  useEffect(() => {
    const ctl = new AbortController();
    let alive = true;
    setState((s) => ({ ...s, source: "loading" }));
    const start = setTimeout(() => {
      const timeout = setTimeout(() => ctl.abort(), 8000);
      loadRef
        .current(ctl.signal)
        .then((data) => alive && setState({ data, source: "live" }))
        .catch(() => alive && setState({ data: fallbackRef.current, source: "fallback" }))
        .finally(() => clearTimeout(timeout));
    }, delayMs);
    return () => {
      alive = false;
      clearTimeout(start);
      ctl.abort();
    };
  }, [key, delayMs]);

  return state;
}

// ---- guard bentuk respons (batas kepercayaan: respons API tidak dipercaya begitu saja) ----
export const isNum = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);
export function rec(x: unknown): Record<string, unknown> {
  if (typeof x !== "object" || x === null || Array.isArray(x)) throw new Error("bentuk respons salah");
  return x as Record<string, unknown>;
}
export function numAt(o: Record<string, unknown>, k: string): number {
  const v = o[k];
  if (!isNum(v)) throw new Error(`field ${k} bukan angka`);
  return v;
}
export function arr(x: unknown): unknown[] {
  if (!Array.isArray(x)) throw new Error("bukan array");
  return x;
}
