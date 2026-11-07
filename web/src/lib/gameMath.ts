type Matrix = readonly (readonly (readonly [number, number])[])[];

/** Pure-strategy Nash equilibria of a 2x2 game: cells where neither player gains by deviating alone. */
export function pureNash(m: Matrix): { utpe: number; sany: number }[] {
  const out: { utpe: number; sany: number }[] = [];
  for (let u = 0; u < m.length; u++) {
    for (let s = 0; s < m[u].length; s++) {
      const utpeBest = m.every((_, u2) => m[u2][s][0] <= m[u][s][0]);
      const sanyBest = m[u].every((cell) => cell[1] <= m[u][s][1]);
      if (utpeBest && sanyBest) out.push({ utpe: u, sany: s });
    }
  }
  return out;
}

/** A cell is Pareto optimal if no other cell is at least as good for both players and better for one. */
export function paretoOptimal(m: Matrix, u: number, s: number): boolean {
  const [a, b] = m[u][s];
  return !m.some((row) => row.some(([x, y]) => x >= a && y >= b && (x > a || y > b)));
}

/** Row index that is a best reply for UTPE against every SANY column, or null when none exists. */
export function utpeDominantStrategy(m: Matrix): number | null {
  for (let u = 0; u < m.length; u++) {
    const dominates = m.every((other, u2) => u2 === u || other.every((cell, s) => m[u][s][0] > cell[0]));
    if (dominates) return u;
  }
  return null;
}
