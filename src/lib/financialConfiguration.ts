import { isValidNonNegativeRate } from "./financialValidation";

const CREDIT_INSTALLMENTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export type CheckoutRates = {
  debito: number;
  credito: { [key: number]: number };
};

type UnknownRates = {
  debito?: unknown;
  credito?: unknown;
} | null | undefined;

export function resolveValidRate(
  ownerRate: unknown,
  generalRate: unknown,
  fallbackRate: number
): number {
  if (typeof ownerRate === "number" && isValidNonNegativeRate(ownerRate)) {
    return ownerRate;
  }

  if (typeof generalRate === "number" && isValidNonNegativeRate(generalRate)) {
    return generalRate;
  }

  return fallbackRate;
}

export function resolveCheckoutRates(
  ownerRates: UnknownRates,
  generalRates: UnknownRates,
  fallbackRates: CheckoutRates
): CheckoutRates {
  const ownerCredito = getCreditRates(ownerRates);
  const generalCredito = getCreditRates(generalRates);

  return {
    debito: resolveValidRate(
      ownerRates?.debito,
      generalRates?.debito,
      fallbackRates.debito
    ),
    credito: CREDIT_INSTALLMENTS.reduce<{ [key: number]: number }>((rates, parcela) => {
      rates[parcela] = resolveValidRate(
        ownerCredito?.[parcela],
        generalCredito?.[parcela],
        fallbackRates.credito[parcela]
      );
      return rates;
    }, {}),
  };
}

function getCreditRates(rates: UnknownRates): { [key: number]: unknown } | undefined {
  if (!rates || typeof rates.credito !== "object" || rates.credito === null) {
    return undefined;
  }

  return rates.credito as { [key: number]: unknown };
}
