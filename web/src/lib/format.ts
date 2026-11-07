/** Indonesian number formats: 754.067 (dot thousands), 56,2% (comma decimals). */
const nf = (min: number, max: number) => new Intl.NumberFormat("id-ID", { minimumFractionDigits: min, maximumFractionDigits: max });

export const integer = (n: number) => nf(0, 0).format(n);
export const decimal = (n: number, d = 1) => nf(d, d).format(n);
/** 754066.67 -> "754.067" */
export const rp = (n: number) => integer(n);
/** 754066.67 -> "Rp 754.067" */
export const rupiah = (n: number) => `Rp ${integer(n)}`;
/** 278220800000 -> "Rp 278,22 M" (M = miliar) */
export const miliar = (n: number, d = 0) => `Rp ${decimal(n / 1e9, d)} M`;
/** Values already in Rp miliar (model.json) -> "Rp 518,4 M" */
export const rpM = (n: number, d = 0) => `Rp ${decimal(n, d)} M`;
/** 0.5619 -> "56,2%" ; value is a ratio */
export const percent = (ratio: number, d = 1) => `${decimal(ratio * 100, d)}%`;
/** 109.0000001 -> "+109%" (value already in percent points) */
export const signedPct = (pts: number, d = 0) => `${pts >= 0 ? "+" : "−"}${decimal(Math.abs(pts), d)}%`;
export const signed = (n: number) => `${n >= 0 ? "+" : "−"}${integer(Math.abs(n))}`;
