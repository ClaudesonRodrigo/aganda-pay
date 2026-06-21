import { describe, expect, it } from "vitest";

import { isValidNonNegativeRate } from "./financialValidation";

describe("financial validation", () => {
  it("aceita zero", () => {
    expect(isValidNonNegativeRate(0)).toBe(true);
  });

  it("aceita taxa decimal positiva", () => {
    expect(isValidNonNegativeRate(1.37)).toBe(true);
  });

  it("aceita taxa positiva inteira", () => {
    expect(isValidNonNegativeRate(100)).toBe(true);
  });

  it("aceita taxa alta sem limite maximo neste ciclo", () => {
    expect(isValidNonNegativeRate(150)).toBe(true);
  });

  it("rejeita decimal negativo", () => {
    expect(isValidNonNegativeRate(-0.01)).toBe(false);
  });

  it("rejeita taxa negativa inteira", () => {
    expect(isValidNonNegativeRate(-5)).toBe(false);
  });

  it("rejeita NaN", () => {
    expect(isValidNonNegativeRate(NaN)).toBe(false);
  });

  it("rejeita infinito positivo", () => {
    expect(isValidNonNegativeRate(Infinity)).toBe(false);
  });

  it("rejeita infinito negativo", () => {
    expect(isValidNonNegativeRate(-Infinity)).toBe(false);
  });
});
