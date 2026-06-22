import type { RefObject } from "react";

import type { CommercialInstallmentOption } from "@/lib/commercialInstallments";

type CommercialInstallmentsPreviewProps = {
  previewRef?: RefObject<HTMLDivElement | null>;
  pixAmount: number;
  installmentOptions: CommercialInstallmentOption[];
  companyName?: string;
  proposalTitle?: string;
  whatsapp?: string;
};

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function CommercialInstallmentsPreview({
  previewRef,
  pixAmount,
  installmentOptions,
  companyName,
  proposalTitle,
  whatsapp,
}: CommercialInstallmentsPreviewProps) {
  const highestInstallments = installmentOptions.reduce(
    (highest, option) => Math.max(highest, option.installments),
    0
  );

  return (
    <div
      ref={previewRef}
      className="w-full min-w-0 aspect-[4/5] overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-2xl"
      style={{ width: "min(432px, calc(100vw - 64px))" }}
    >
      <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.35),_transparent_34%),linear-gradient(180deg,_#0f172a_0%,_#111827_48%,_#020617_100%)] p-4 max-[430px]:p-3">
        <header className="shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200 max-[430px]:text-[8px]">
                Condições de pagamento
              </p>
              <h1 className="mt-1 text-2xl font-black leading-[1.05] tracking-tight text-white max-[430px]:text-[20px]">
                Planeje sua viagem do seu jeito
              </h1>
            </div>
            {companyName && (
              <p className="max-w-[104px] shrink-0 text-right text-[10px] font-semibold uppercase leading-tight tracking-wide text-slate-300 max-[430px]:hidden">
                {companyName}
              </p>
            )}
          </div>

          {proposalTitle && (
            <p className="mt-2.5 line-clamp-2 rounded-2xl bg-white/10 px-3.5 py-2 text-xs font-semibold leading-snug text-slate-100 ring-1 ring-white/10 max-[430px]:mt-2 max-[430px]:px-3 max-[430px]:py-1.5 max-[430px]:text-[10px]">
              {proposalTitle}
            </p>
          )}
        </header>

        <section className="mt-3 shrink-0 rounded-3xl bg-white p-3.5 text-slate-950 shadow-xl max-[430px]:mt-2 max-[430px]:p-2.5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-green-600 max-[430px]:text-[9px]">
                PIX
              </p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500 max-[430px]:text-[10px]">
                À vista
              </p>
            </div>
            <p className="min-w-0 truncate text-right text-[22px] font-black leading-none tabular-nums text-slate-950 max-[430px]:text-lg">
              {formatCurrency(pixAmount)}
            </p>
          </div>
        </section>

        <section className="mt-3 min-h-0 flex-1 rounded-3xl bg-slate-50 p-3.5 text-slate-950 shadow-xl max-[430px]:mt-2 max-[430px]:p-2.5">
          <div className="mb-2 flex items-center justify-between gap-4 max-[430px]:mb-1.5">
            <h2 className="text-sm font-black text-slate-900 max-[430px]:text-xs">
              Cartão de crédito
            </h2>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 max-[430px]:px-2 max-[430px]:text-[9px]">
              até {highestInstallments}x
            </span>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-1.5 max-[430px]:gap-1">
            {installmentOptions.map((option) => {
              const isHighlighted = option.installments === highestInstallments;

              return (
                <div
                  key={option.installments}
                  className={`flex min-w-0 items-center justify-between gap-2 rounded-xl border px-2.5 py-2 max-[430px]:gap-1.5 max-[430px]:px-2 max-[430px]:py-1 ${
                    isHighlighted
                      ? "border-blue-300 bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                >
                  <p
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wide max-[430px]:text-[8px] ${
                      isHighlighted ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    {option.installments}x de
                  </p>
                  <p className="min-w-0 truncate text-right text-sm font-black leading-none tabular-nums max-[430px]:text-[11px]">
                    {formatCurrency(option.installmentAmount)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="mt-2.5 shrink-0 space-y-0.5 text-center text-[9px] font-medium leading-snug text-slate-300 max-[430px]:mt-1.5 max-[430px]:text-[7px]">
          <p>Valores das parcelas já incluem os custos da operação de pagamento.</p>
          <p>Condições sujeitas a alteração até a confirmação da proposta.</p>
          {whatsapp && (
            <p className="pt-0.5 text-[10px] font-bold text-white max-[430px]:text-[8px]">
              Atendimento: {whatsapp}
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  return brlFormatter.format(value);
}
