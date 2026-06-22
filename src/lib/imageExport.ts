import { toPng } from "html-to-image";

const EXPORT_WIDTH = 1080;
const EXPORT_HEIGHT = 1350;
const MAX_SLUG_LENGTH = 60;

export function buildCommercialInstallmentsFilename(
  proposalTitle?: string | null,
  proposalId?: string | null
): string {
  const slug = normalizeFilePart(proposalTitle, "proposta", MAX_SLUG_LENGTH);
  const safeId = normalizeFilePart(proposalId, "sem-id", 8);

  return `condicoes-pagamento-${slug}-${safeId}.png`;
}

export async function downloadCommercialInstallmentsPng(
  element: HTMLDivElement | null,
  proposalTitle?: string | null,
  proposalId?: string | null
): Promise<void> {
  const dataUrl = await createCommercialInstallmentsPngDataUrl(element);

  const link = document.createElement("a");
  link.download = buildCommercialInstallmentsFilename(proposalTitle, proposalId);
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function createCommercialInstallmentsPngDataUrl(
  element: HTMLDivElement | null
): Promise<string> {
  if (!element) {
    throw new Error("Preview element is required to generate the image.");
  }

  const rect = element.getBoundingClientRect();
  return toPng(element, {
    backgroundColor: "#020617",
    cacheBust: true,
    canvasWidth: EXPORT_WIDTH,
    canvasHeight: EXPORT_HEIGHT,
    pixelRatio: 1,
    width: rect.width,
    height: rect.height,
  });
}

function normalizeFilePart(
  value: string | null | undefined,
  fallback: string,
  maxLength: number
): string {
  const normalized = (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLength)
    .replace(/-$/g, "");

  return normalized || fallback;
}
