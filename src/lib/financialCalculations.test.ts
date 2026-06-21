import { describe, expect, it } from "vitest";

import {
  calculateAmountWithRate,
  calculateInstallmentAmount,
} from "./financialCalculations";

describe("financial calculations", () => {
  describe("calculateAmountWithRate", () => {
    it("aplica taxa de 5% ao valor base", () => {
      expect(calculateAmountWithRate(1000, 5)).toBe(1050);
    });

    it("mantem o valor base quando a taxa e zero", () => {
      expect(calculateAmountWithRate(1000, 0)).toBe(1000);
    });

    it("dobra o valor base quando a taxa e 100%", () => {
      expect(calculateAmountWithRate(1000, 100)).toBe(2000);
    });

    it("mantem zero quando o valor base e zero", () => {
      expect(calculateAmountWithRate(0, 5)).toBe(0);
    });

    it("aplica taxa negativa como desconto", () => {
      expect(calculateAmountWithRate(1000, -5)).toBe(950);
    });

    it("preserva o comportamento bruto de ponto flutuante para decimais", () => {
      expect(calculateAmountWithRate(1234.56, 2.5)).toBeCloseTo(1265.424);
    });
  });

  describe("calculateInstallmentAmount", () => {
    it("divide o total em tres parcelas", () => {
      expect(calculateInstallmentAmount(1050, 3)).toBe(350);
    });

    it("mantem o total quando ha uma parcela", () => {
      expect(calculateInstallmentAmount(1050, 1)).toBe(1050);
    });

    it("preserva divisao decimal sem arredondamento", () => {
      expect(calculateInstallmentAmount(1000, 3)).toBeCloseTo(333.3333333333333);
    });

    it("mantem zero quando o total e zero", () => {
      expect(calculateInstallmentAmount(0, 3)).toBe(0);
    });

    it("preserva o comportamento JavaScript de divisao por zero", () => {
      expect(calculateInstallmentAmount(1050, 0)).toBe(Infinity);
    });
  });
});
