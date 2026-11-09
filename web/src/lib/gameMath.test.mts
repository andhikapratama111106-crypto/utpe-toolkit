// Run: node --test src/lib/gameMath.test.mts   (after transpiling, see scripts/README in the report) or via any TS runner.
import assert from "node:assert/strict";
import { test } from "node:test";
import { paretoOptimal, pureNash, utpeDominantStrategy } from "./gameMath.ts";

const M = [
  [[278, 100], [200, 150]],
  [[150, 120], [133, 133]],
] as const;

test("pricing game: Nash is (Premium+Financing, Harga Agresif) = (200, 150)", () => {
  assert.deepEqual(pureNash(M), [{ utpe: 0, sany: 1 }]);
});
test("(200,150) is Pareto optimal; (133,133) is not", () => {
  assert.equal(paretoOptimal(M, 0, 1), true);
  assert.equal(paretoOptimal(M, 1, 1), false);
});
test("UTPE's dominant strategy is row 0", () => {
  assert.equal(utpeDominantStrategy(M), 0);
});
