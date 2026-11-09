/**
 * INPUT assumptions sent to POST /api/tco (not results). Mirrors the backend's
 * configs/tco_base.yaml; all displayed numbers still come from the API response.
 * shortcut: copied by hand because the API has no endpoint for the fleet defaults;
 * replace with a fetch if the backend adds one.
 */
import type { TcoRequest } from "@/lib/api";

const shared = { fuel_consumption_lph: 12, fuel_price_per_liter: 25200, operator_wage_per_hour: 50000 };

export const FLEET: TcoRequest[] = [
  {
    brand: "Komatsu (Premium)",
    model: "PC200-10M0",
    purchase_price: 1_025_000_000,
    lifetime_hours: 10_000,
    maintenance_per_hour: 62_500,
    ...shared,
  },
  {
    brand: "SANY (China)",
    model: "SY215C",
    purchase_price: 600_000_000,
    lifetime_hours: 7_000,
    maintenance_per_hour: 45_000,
    ...shared,
  },
  {
    brand: "UTPE (Patria)",
    model: "Product B",
    purchase_price: 4_160_000_000,
    lifetime_hours: 12_000,
    maintenance_per_hour: 55_000,
    ...shared,
  },
];
