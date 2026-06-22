"use client";

import { useEffect, useRef } from "react";
import { Download, X } from "lucide-react";

import CommercialInstallmentsPreview from "@/components/CommercialInstallmentsPreview";
import type { CommercialInstallmentOption } from "@/lib/commercialInstallments";

type CommercialInstallmentsModalProps = {
  isOpen: boolean;
  proposalTitle: string;
  proposalId: string;
  pixAmount: number;
  installmentOptions: CommercialInstallmentOption[];
  isGenerating: boolean;
  generationError?: string | null;
  onDownload: (element: HTMLDivElement) => Promise<void> | void;
  onClose: () => void;
};

export default function CommercialInstallmentsModal({
  isOpen,
  proposalTitle,
  pixAmount,
  installmentOptions,
  isGenerating,
  generationError,
  onDownload,
  onClose,
}: CommercialInstallmentsModalProps) {
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isGenerating) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isGenerating, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = () => {
    if (!isGenerating) {
      onClose();
    }
  };

  const handleDownload = async () => {
    if (!previewRef.current || isGenerating) return;
    await onDownload(previewRef.current);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="commercial-installments-title"
        className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2
              id="commercial-installments-title"
              className="text-lg font-black text-slate-900 dark:text-white"
            >
              Imagem das parcelas
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Confira a arte antes de baixar o PNG.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            aria-label="Fechar prévia"
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-100 px-4 py-6 dark:bg-slate-950">
          <div className="mx-auto flex w-full justify-center">
            <CommercialInstallmentsPreview
              previewRef={previewRef}
              pixAmount={pixAmount}
              installmentOptions={installmentOptions}
              proposalTitle={proposalTitle}
            />
          </div>
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-5">
            {generationError && (
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                {generationError}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGenerating ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-b-white" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isGenerating ? "Gerando..." : "Baixar PNG"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
