"use client";

import { useCallback, useEffect, useState } from "react";

type Cached<T> = { data: T; at: string };
type State<T> = { data?: T; error?: unknown; loading: boolean; cached?: Cached<T> };

const readCache = <T,>(key: string): Cached<T> | undefined => {
  try {
    const raw = localStorage.getItem(`utpe-cache:${key}`);
    return raw ? (JSON.parse(raw) as Cached<T>) : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Runs `fetcher` on mount and when it changes (memoise it with useCallback).
 * The previous result stays in `data` while a new request loads.
 * Each success is cached in localStorage under `cacheKey`; if a later request
 * fails, `cached` holds the last good result so pages can show it, labelled.
 */
export function useApi<T>(fetcher: () => Promise<T>, cacheKey: string) {
  const [state, setState] = useState<State<T>>({ loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ data: s.data, loading: true }));
    fetcher().then(
      (data) => {
        if (cancelled) return;
        try {
          localStorage.setItem(`utpe-cache:${cacheKey}`, JSON.stringify({ data, at: new Date().toISOString() }));
        } catch {
          /* storage full or blocked: caching is best-effort */
        }
        setState({ data, loading: false });
      },
      (error) => !cancelled && setState({ error, loading: false, cached: readCache<T>(cacheKey) }),
    );
    return () => {
      cancelled = true;
    };
  }, [fetcher, attempt, cacheKey]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}

export function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}
