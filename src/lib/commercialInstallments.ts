import {
  calculateAmountWithRate,
  calculateInstallmentAmount,
} from "./financialCalculations";

export type CommercialInstallmentOption = {
  installments: number;
  installmentAmount: number;
};

export type CreditRatesByInstallment = {
  [installments: number]: number;
};

export function generateCommercialInstallmentOptions(
  baseAmount: number,
  creditRates: CreditRatesByInstallment,
  minInstallments = 1,
  maxInstallments = 10
): CommercialInstallmentOption[] {
  if (minInstallments > maxInstallments) {
    throw new RangeError("minInstallments must be less than or equal to maxInstallments");
  }

  const options: CommercialInstallmentOption[] = [];

  for (
    let installments = minInstallments;
    installments <= maxInstallments;
    installments += 1
  ) {
    const totalAmount = calculateAmountWithRate(baseAmount, creditRates[installments]);
    const installmentAmount = calculateInstallmentAmount(totalAmount, installments);

    options.push({
      installments,
      installmentAmount,
    });
  }

  return options;
}
