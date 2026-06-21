export function calculateAmountWithRate(
  baseAmount: number,
  ratePercent: number
): number {
  return baseAmount * (1 + ratePercent / 100);
}

export function calculateInstallmentAmount(
  totalAmount: number,
  installments: number
): number {
  return totalAmount / installments;
}
