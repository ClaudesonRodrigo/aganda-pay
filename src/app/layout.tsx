import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agência Pay - Self Checkout",
  description: "Gerador de links de pagamento rápidos e cálculo de taxas para pacotes de viagens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <main className="min-h-screen w-full flex flex-col items-center justify-center p-4">
          {children}
        </main>
      </body>
    </html>
  );
}