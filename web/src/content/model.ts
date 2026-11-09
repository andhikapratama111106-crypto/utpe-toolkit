import raw from "./model.json";

/** Numbers extracted from the NBCC 2026 Excel model by scripts/extract_model.py (see model.json.provenance). */
export const model = raw;
export type ModelSource = (typeof raw.sources)[number];
