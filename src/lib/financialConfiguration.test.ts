import { describe, expect, it } from "vitest";

import { resolveCheckoutRates, resolveValidRate, type CheckoutRates } from "./financialConfiguration";

const fallbackRates: CheckoutRates = {
  debito: 1.37,
  credito: {
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
  },
};

describe("financial configuration", () => {
  describe("resolveValidRate", () => {
    it("usa taxa valida do proprietario", () => {
      expect(resolveValidRate(2.5, 3.5, 4.5)).toBe(2.5);
    });

    it("usa taxa geral quando proprietario e invalido", () => {
      expect(resolveValidRate(-1, 3.5, 4.5)).toBe(3.5);
    });

    it("usa taxa geral quando proprietario esta ausente", () => {
      expect(resolveValidRate(undefined, 3.5, 4.5)).toBe(3.5);
    });

    it("usa fallback hardcoded quando proprietario e geral sao invalidos", () => {
      expect(resolveValidRate(NaN, Infinity, 4.5)).toBe(4.5);
    });

    it("preserva taxa zero do proprietario", () => {
      expect(resolveValidRate(0, 3.5, 4.5)).toBe(0);
    });

    it("preserva taxa decimal do proprietario", () => {
      expect(resolveValidRate(1.37, 3.5, 4.5)).toBe(1.37);
    });

    it("rejeita taxa negativa", () => {
      expect(resolveValidRate(-0.01, 3.5, 4.5)).toBe(3.5);
    });

    it("rejeita NaN", () => {
      expect(resolveValidRate(NaN, 3.5, 4.5)).toBe(3.5);
    });

    it("rejeita Infinity", () => {
      expect(resolveValidRate(Infinity, 3.5, 4.5)).toBe(3.5);
    });

    it("rejeita string numerica", () => {
      expect(resolveValidRate("2.5", 3.5, 4.5)).toBe(3.5);
    });
  });

  describe("resolveCheckoutRates", () => {
    it("preserva parcela valida existente", () => {
      const rates = resolveCheckoutRates(
        { debito: 2, credito: { 1: 0, 2: 5.5 } },
        undefined,
        fallbackRates
      );

      expect(rates.credito[1]).toBe(0);
      expect(rates.credito[2]).toBe(5.5);
    });

    it("usa geral quando parcela do proprietario esta ausente", () => {
      const rates = resolveCheckoutRates(
        { debito: 2, credito: { 1: 3.2 } },
        { debito: 3, credito: { 2: 5.5 } },
        fallbackRates
      );

      expect(rates.credito[2]).toBe(5.5);
    });

    it("usa fallback quando objeto de credito esta ausente", () => {
      const rates = resolveCheckoutRates(
        { debito: 2 },
        undefined,
        fallbackRates
      );

      expect(rates.credito[3]).toBe(6.12);
    });

    it("usa fallback quando valor de credito tem tipo invalido", () => {
      const rates = resolveCheckoutRates(
        { debito: 2, credito: { 4: "6.85" } },
        { debito: 3, credito: { 4: -1 } },
        fallbackRates
      );

      expect(rates.credito[4]).toBe(6.85);
    });
  });
});
