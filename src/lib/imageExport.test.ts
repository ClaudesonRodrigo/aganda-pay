import { describe, expect, it } from "vitest";

import { buildCommercialInstallmentsFilename } from "./imageExport";

describe("buildCommercialInstallmentsFilename", () => {
  it("builds a safe filename for a common title", () => {
    expect(
      buildCommercialInstallmentsFilename("Pacote Maceió Premium", "abc123456789")
    ).toBe("condicoes-pagamento-pacote-maceio-premium-abc12345.png");
  });

  it("removes accents from the title", () => {
    expect(
      buildCommercialInstallmentsFilename("Condições em São Luís", "id987654")
    ).toBe("condicoes-pagamento-condicoes-em-sao-luis-id987654.png");
  });

  it("normalizes spaces and special characters", () => {
    expect(
      buildCommercialInstallmentsFilename("  Pacote @ Recife!!! 2026  ", "abc12345")
    ).toBe("condicoes-pagamento-pacote-recife-2026-abc12345.png");
  });

  it("removes repeated hyphens", () => {
    expect(
      buildCommercialInstallmentsFilename("Pacote --- Maceió ___ Premium", "abc12345")
    ).toBe("condicoes-pagamento-pacote-maceio-premium-abc12345.png");
  });

  it("uses a fallback when the slug is empty", () => {
    expect(buildCommercialInstallmentsFilename("!!!", "abc12345")).toBe(
      "condicoes-pagamento-proposta-abc12345.png"
    );
  });

  it("uses only the first eight safe characters from a long id", () => {
    expect(
      buildCommercialInstallmentsFilename("Pacote Maceió", "abc123456789xyz")
    ).toBe("condicoes-pagamento-pacote-maceio-abc12345.png");
  });

  it("uses a fallback for missing ids", () => {
    expect(buildCommercialInstallmentsFilename("Pacote Maceió")).toBe(
      "condicoes-pagamento-pacote-maceio-sem-id.png"
    );
  });

  it("limits the title slug length", () => {
    const filename = buildCommercialInstallmentsFilename(
      "Pacote completo internacional com hospedagem traslado passeios e seguro viagem",
      "abc12345"
    );

    expect(filename).toBe(
      "condicoes-pagamento-pacote-completo-internacional-com-hospedagem-traslado-passei-abc12345.png"
    );
  });

  it("always uses png extension", () => {
    expect(buildCommercialInstallmentsFilename("Pacote Maceió", "abc12345")).toMatch(
      /\.png$/
    );
  });

  it("does not add phone numbers or customer names by itself", () => {
    expect(buildCommercialInstallmentsFilename(undefined, undefined)).toBe(
      "condicoes-pagamento-proposta-sem-id.png"
    );
  });
});
