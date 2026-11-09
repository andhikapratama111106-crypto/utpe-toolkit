/**
 * Typed client for the UTPE backend (FastAPI). Base URL can be overridden with
 * NEXT_PUBLIC_API_URL. Errors are surfaced as typed classes:
 *   NetworkError    backend unreachable
 *   ValidationError HTTP 422 with FastAPI issue list
 *   ApiError        any other non-2xx status
 */
// Production uses relative /api/* (same origin, see vercel.json). Dev defaults to the local backend.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "production" ? "" : "http://localhost:8000");

/** FastAPI validation item (HTTP 422 body: { detail: ValidationIssue[] }). */
export type ValidationIssue = { loc: (string | number)[]; msg: string; type: string };

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Thrown on HTTP 422 so forms can show per-field messages. */
export class ValidationError extends ApiError {
  constructor(public readonly issues: ValidationIssue[]) {
    super(422, issues.map((i) => i.msg).join("; ") || "Invalid input");
    this.name = "ValidationError";
  }
}

/** Thrown when fetch itself fails (backend down, DNS, CORS). */
export class NetworkError extends Error {
  constructor() {
    super(`Backend unreachable at ${API_BASE_URL || "this origin"}`);
    this.name = "NetworkError";
  }
}

// ---- Request / response shapes (from /openapi.json + live payloads) ----

export type TcoRequest = {
  brand: string;
  model: string;
  purchase_price: number;
  lifetime_hours: number;
  maintenance_per_hour: number;
  fuel_consumption_lph: number;
  fuel_price_per_liter: number;
  operator_wage_per_hour: number;
};
export type TcoResponse = { brand: string; model: string; total_tco: number; cost_per_hour: number };

/** iterations: integer 1..100000 (server enforces; 422 otherwise). */
export type SensitivityRequest = { iterations?: number; monte_carlo?: boolean };
export type SensitivityResponse = {
  scenarios: { skenario: string; cost_per_hour: number }[];
  mc?: { p10: number; p50: number; p90: number } | null;
};

export type ProjectionRequest = { konservatif?: boolean };
export type ProjectionResponse = {
  price_war: { profit: number };
  financing: { profit: number };
  delta: { absolute: number; percentage: number };
};

export type GameResponse = {
  players: { name: string; strategies: string[] }[];
  equilibria: {
    type: string;
    utpe_strategy: number;
    sany_strategy: number;
    payoff: [number, number];
    pareto_optimal: boolean;
  }[];
};

export type ValidateResponse = {
  passed: boolean;
  checks: { label: string; csv_value: number; expected: number; status: string }[];
};

export type HealthResponse = { ok: boolean; version: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new NetworkError();
  }
  if (res.status === 422) {
    const body = (await res.json().catch(() => ({}))) as { detail?: ValidationIssue[] };
    throw new ValidationError(Array.isArray(body.detail) ? body.detail : []);
  }
  if (!res.ok) throw new ApiError(res.status, res.statusText || "Request failed");
  return (await res.json()) as T;
}

const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });

export const api = {
  health: () => request<HealthResponse>("/api/health"),
  tco: (body: TcoRequest) => post<TcoResponse>("/api/tco", body),
  sensitivity: (body: SensitivityRequest) => post<SensitivityResponse>("/api/sensitivity", body),
  projection: (body: ProjectionRequest) => post<ProjectionResponse>("/api/projection", body),
  // The game endpoint defaults (bertrand, pricing_war.yaml) are what the UI needs.
  game: () => post<GameResponse>("/api/game", {}),
  validate: () => request<ValidateResponse>("/api/validate"),
};
