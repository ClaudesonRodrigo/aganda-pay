export function isValidNonNegativeRate(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}
