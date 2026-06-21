import { describe, expect, it } from "vitest";

import { generateCommercialInstallmentOptions } from "./commercialInstallments";
import {
  calculateAmountWithRate,
  calculateInstallmentAmount,
} from "./financialCalculations";

const creditRates = {
  1: 3.15,
  2: 5.39,
  3: 6.12,
  4: 6.85,
  5: 7.57,
  6: 8.28,
  7: 8.99,
  8: 9.69,
  9: 10.38,
  10: 11.06,
  11: 11.74,
  12: 12.4,
};

describe("commercial installments", () => {
  it("gera exatamente opcoes de 1x ate 10x", () => {
    const options = generateCommercialInstallmentOptions(1000, creditRates);

    expect(options).toHaveLength(10);
    expect(options.map((option) => option.installments)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });

  it("preserva a ordem crescente das parcelas", () => {
    const options = generateCommercialInstallmentOptions(1000, creditRates);

    expect(options.map((option) => option.installments)).toEqual(
      [...options].map((option) => option.installments).sort((a, b) => a - b)
    );
  });

  it("usa a taxa correspondente a cada quantidade de parcelas", () => {
    const options = generateCommercialInstallmentOptions(1000, creditRates);

    for (const option of options) {
      const totalAmount = calculateAmountWithRate(
        1000,
        creditRates[option.installments]
      );
      const installmentAmount = calculateInstallmentAmount(
        totalAmount,
        option.installments
      );

      expect(option.installmentAmount).toBeCloseTo(installmentAmount);
    }
  });

  it("calcula corretamente o valor de cada parcela com as funcoes financeiras", () => {
    const [oneInstallment, twoInstallments] = generateCommercialInstallmentOptions(
      1000,
      creditRates
    );

    expect(oneInstallment.installmentAmount).toBe(
      calculateInstallmentAmount(calculateAmountWithRate(1000, 3.15), 1)
    );
    expect(twoInstallments.installmentAmount).toBe(
      calculateInstallmentAmount(calculateAmountWithRate(1000, 5.39), 2)
    );
  });

  it("preserva comportamento bruto para valor base decimal", () => {
    const [oneInstallment] = generateCommercialInstallmentOptions(
      1234.56,
      creditRates
    );

    expect(oneInstallment.installmentAmount).toBeCloseTo(
      calculateInstallmentAmount(calculateAmountWithRate(1234.56, 3.15), 1)
    );
  });

  it("preserva taxa zero", () => {
    const ratesWithZero = {
      ...creditRates,
      1: 0,
    };

    const [oneInstallment] = generateCommercialInstallmentOptions(
      1000,
      ratesWithZero
    );

    expect(oneInstallment.installmentAmount).toBe(1000);
  });

  it("preserva taxas decimais", () => {
    const [oneInstallment] = generateCommercialInstallmentOptions(
      1000,
      creditRates
    );

    expect(oneInstallment.installmentAmount).toBe(1031.5);
  });

  it("nao gera opcoes de 11x ou 12x", () => {
    const options = generateCommercialInstallmentOptions(1000, creditRates);

    expect(options.some((option) => option.installments === 11)).toBe(false);
    expect(options.some((option) => option.installments === 12)).toBe(false);
  });

  it("gera intervalo personalizado valido", () => {
    const options = generateCommercialInstallmentOptions(1000, creditRates, 3, 5);

    expect(options.map((option) => option.installments)).toEqual([3, 4, 5]);
  });

  it("rejeita intervalo personalizado incoerente", () => {
    expect(() =>
      generateCommercialInstallmentOptions(1000, creditRates, 5, 3)
    ).toThrow(RangeError);
  });

  it("nao expoe total financiado nem percentual da taxa", () => {
    const [oneInstallment] = generateCommercialInstallmentOptions(
      1000,
      creditRates
    );

    expect(Object.keys(oneInstallment)).toEqual([
      "installments",
      "installmentAmount",
    ]);
    expect(oneInstallment).not.toHaveProperty("totalAmount");
    expect(oneInstallment).not.toHaveProperty("ratePercent");
  });

  it("nao modifica as taxas recebidas", () => {
    const ratesBefore = { ...creditRates };

    generateCommercialInstallmentOptions(1000, creditRates);

    expect(creditRates).toEqual(ratesBefore);
  });
});
