import type { RefObject } from "react";
import { CreditCard, Landmark } from "lucide-react";

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
}: CommercialInstallmentsPreviewProps) {
  return (
    <div
      ref={previewRef}
      className="w-full min-w-0 aspect-[4/5] overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-2xl"
      style={{ width: "min(432px, calc(100vw - 64px))" }}
    >
      <div className="flex h-full flex-col bg-[radial-gradient(circle_at_88%_8%,_rgba(59,130,246,0.32),_transparent_30%),radial-gradient(circle_at_18%_0%,_rgba(16,185,129,0.14),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#111827_45%,_#020617_100%)] p-4 max-[430px]:p-3">
        <header className="shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200 max-[430px]:text-[8px]">
                Condições de pagamento
              </p>
              <h1 className="mt-1 text-2xl font-black leading-[1.04] text-white max-[430px]:text-[20px]">
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
            <p className="mt-2.5 line-clamp-2 rounded-2xl bg-white/[0.09] px-3.5 py-2 text-xs font-semibold leading-snug text-slate-100 shadow-inner ring-1 ring-white/10 max-[430px]:mt-2 max-[430px]:px-3 max-[430px]:py-1.5 max-[430px]:text-[10px]">
              {proposalTitle}
            </p>
          )}
        </header>

        <section className="mt-3 flex min-h-0 flex-1 flex-col rounded-[26px] bg-slate-50 p-3.5 text-slate-950 shadow-[0_22px_46px_rgba(2,6,23,0.28)] ring-1 ring-white/70 max-[430px]:mt-2 max-[430px]:p-2.5">
          <div className="mb-2.5 flex shrink-0 items-center gap-2.5 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-800 px-3.5 py-2.5 text-white shadow-lg shadow-slate-900/10 max-[430px]:mb-2 max-[430px]:px-3 max-[430px]:py-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-100 ring-1 ring-blue-300/30 max-[430px]:h-6 max-[430px]:w-6">
              <CreditCard className="h-3.5 w-3.5 max-[430px]:h-3 max-[430px]:w-3" />
            </span>
            <h2 className="min-w-0 truncate text-sm font-black leading-none text-white max-[430px]:text-xs">
              Parcelamento no cartão
            </h2>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] auto-rows-fr gap-2 max-[430px]:gap-1.5">
            {installmentOptions.map((option) => (
              <div
                key={option.installments}
                className="flex min-h-[46px] min-w-0 flex-row items-center justify-between gap-2 overflow-visible rounded-2xl border border-slate-200/90 bg-white px-2.5 py-2 text-slate-900 shadow-[0_9px_18px_rgba(15,23,42,0.06)] max-[430px]:min-h-[38px] max-[430px]:gap-1.5 max-[430px]:rounded-xl max-[430px]:px-2 max-[430px]:py-1.5"
              >
                <p className="w-fit shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black leading-[1.1] text-blue-700 ring-1 ring-blue-100 max-[430px]:px-1.5 max-[430px]:text-[8px]">
                  {option.installments}x
                </p>
                <p className="min-w-0 whitespace-nowrap text-right text-[14px] font-black leading-[1.15] tabular-nums text-slate-950 max-[430px]:text-[10px]">
                  {formatCurrency(option.installmentAmount)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 pt-3 max-[430px]:mt-2 max-[430px]:pt-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 max-[430px]:h-7 max-[430px]:w-7">
                <Landmark className="h-3.5 w-3.5 max-[430px]:h-3 max-[430px]:w-3" />
              </span>
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700 max-[430px]:text-[9px]">
                À vista no PIX
              </p>
            </div>
            <p className="text-right text-lg font-black leading-none tabular-nums text-slate-950 max-[430px]:text-sm">
              {formatCurrency(pixAmount)}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  return brlFormatter.format(value);
}
