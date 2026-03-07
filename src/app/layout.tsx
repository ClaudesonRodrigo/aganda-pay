import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Configuração de Viewport e cor da barra do celular (Tema)
export const viewport: Viewport = {
  themeColor: "#2563eb", // Azul da nossa marca
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Metadados do PWA e SEO
export const metadata: Metadata = {
  title: "Agência Pay - Self Checkout",
  description: "Gerador de links de pagamento rápidos e cálculo de taxas para pacotes de viagens.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Agência Pay",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
          {children}
        </main>
      </body>
    </html>
  );
}