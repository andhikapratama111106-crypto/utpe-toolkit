/**
 * Full payoff matrix of the pricing game, Rp miliar, [UTPE, SANY].
 * Source: configs/games/pricing_war.yaml (payoff_matrix[i][j], i = UTPE strategy, j = SANY strategy).
 * shortcut: /api/game returns only the equilibria, not the matrix; replace with the API once it exposes payoffs.
 */
export const PAYOFFS: readonly (readonly [number, number])[][] = [
  [[278, 100], [200, 150]],
  [[150, 120], [133, 133]],
];
