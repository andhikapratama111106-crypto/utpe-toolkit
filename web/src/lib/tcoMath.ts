import type { TcoRequest } from "./api";

/** Per-hour cost components from the request inputs (they sum to the API's cost_per_hour). */
export function perHour(r: TcoRequest) {
  const purchase = r.purchase_price / r.lifetime_hours;
  const maintenance = r.maintenance_per_hour;
  const fuel = r.fuel_consumption_lph * r.fuel_price_per_liter;
  const operator = r.operator_wage_per_hour;
  return { purchase, maintenance, fuel, operator, total: purchase + maintenance + fuel + operator };
}
