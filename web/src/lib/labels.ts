/**
 * /api/game returns strategy INDICES (0 or 1). The UI must show labels, never
 * the raw number. Labels differ per player.
 */
export type GamePlayer = "UTPE" | "SANY";

const LABELS: Record<GamePlayer, readonly [string, string]> = {
  UTPE: ["Premium + Financing", "Diskon Harga"],
  SANY: ["Harga Premium", "Harga Agresif"],
};

export function strategyLabel(player: GamePlayer, index: number): string {
  if (index !== 0 && index !== 1) throw new RangeError(`Unknown strategy index: ${index}`);
  return LABELS[player][index];
}
