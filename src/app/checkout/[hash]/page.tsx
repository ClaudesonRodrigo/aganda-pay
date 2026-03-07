"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CreditCard, Wallet, AlertCircle, QrCode, MessageCircle, CheckCircle2, Instagram, Globe } from "lucide-react";

type OpcaoSelecionada = {
  id: string;
  resumo: string;
  valorTotal: number;
};

// Atualização: Tipagem agora inclui os novos campos de contato
type ConfiguracoesAtuais = {
  whatsapp: string;
  instagram?: string;
  site?: string;
  taxas: {
    debito: number;
    credito: { [key: number]: number };
  }
};

export default function CheckoutPage() {
  const params = useParams();
  const hashParam = params?.hash as string;

  const [data, setData] = useState<{ p: string; v: number } | null>(null);
  const [error, setError] = useState(false);
  const [selecionado, setSelecionado] = useState<OpcaoSelecionada | null>(null);
  
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesAtuais | null>(null);

  // 1. Decodifica a URL
  useEffect(() => {
    if (!hashParam) return;
    try {
      const cleanHash = decodeURIComponent(hashParam);
      const base64Decoded = atob(cleanHash);
      const parsed = JSON.parse(decodeURIComponent(base64Decoded));
      
      if (parsed.p && parsed.v) {
        setData(parsed);
      } else {
        setError(true);
      }
    } catch (e) {
      console.error("Erro ao decodificar URL:", e);
      setError(true);
    }
  }, [hashParam]);

  // 2. Busca as taxas e contatos no Firebase
  useEffect(() => {
    const fetchConfiguracoes = async () => {
      try {
        const docRef = doc(db, "configuracoes", "geral");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setConfiguracoes(docSnap.data() as ConfiguracoesAtuais);
        } else {
          setConfiguracoes({
            whatsapp: "5579999999999",
            instagram: "",
            site: "",
            taxas: {
              debito: 1.37,
              credito: { 1: 3.15, 2: 5.39, 3: 6.12, 4: 6.85, 5: 7.57, 6: 8.28, 7: 8.99, 8: 9.69, 9: 10.38, 10: 11.06, 11: 11.74, 12: 12.40 }
            }
          });
        }
      } catch (e) {
        console.error("Erro ao buscar configurações no banco", e);
        setError(true);
      }
    };

    fetchConfiguracoes();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 max-w-md w-full">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Link Inválido ou Expirado</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Por favor, solicite um novo link de simulação para a agência.
        </p>
      </div>
    );
  }

  if (!data || !configuracoes) {
    return (
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-100 dark:border-slate-700 flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm font-medium text-slate-500">Conectando ao banco de dados...</p>
        </div>
      </div>
    );
  }

  const calcularValor = (taxa: number) => {
    return data.v * (1 + (taxa / 100));
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const abrirWhatsApp = () => {
    if (!selecionado) return;
    const texto = `Olá! Gostaria de fechar o pacote *${data.p}*.\n\nForma de pagamento escolhida:\n✅ *${selecionado.resumo}*\nTotal: *${formatarMoeda(selecionado.valorTotal)}*\n(Simulado via InfinitePay)\n\nComo procedemos com o pagamento?`;
    const urlWa = `https://wa.me/${configuracoes.whatsapp}?text=${encodeURIComponent(texto)}`;
    window.open(urlWa, "_blank");
  };

  // Funções de formatação de links (UX de Elite)
  const formatarUrlInstagram = (valor: string) => {
    if (!valor) return "#";
    if (valor.includes("instagram.com")) return valor.startsWith("http") ? valor : `https://${valor}`;
    return `https://instagram.com/${valor.replace("@", "")}`;
  };

  const formatarUrlSite = (valor: string) => {
    if (!valor) return "#";
    return valor.startsWith("http") ? valor : `https://${valor}`;
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 pb-4">
      {/* Cabeçalho do Recibo */}
      <div className="bg-blue-600 p-6 text-center text-white relative">
        <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Simulação de Pagamento</p>
        <h1 className="text-2xl font-bold line-clamp-2">{data.p}</h1>
        <p className="text-3xl font-black mt-4">{formatarMoeda(data.v)}</p>
        <p className="text-blue-200 text-xs mt-1">Valor base à vista</p>
      </div>

      <div className="p-6">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 text-center mt-2">
          Selecione a forma de pagamento
        </p>

        {/* Tabela de Valores Selecionáveis */}
        <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          
          <button
            onClick={() => setSelecionado({ id: 'pix', resumo: 'PIX (À vista)', valorTotal: data.v })}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
              selecionado?.id === 'pix' 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500' 
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              {selecionado?.id === 'pix' ? <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" /> : <QrCode className="w-5 h-5 text-slate-400" />}
              <span className={`font-semibold ${selecionado?.id === 'pix' ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>PIX (Sem taxa)</span>
            </div>
            <span className={`font-bold ${selecionado?.id === 'pix' ? 'text-green-700 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
              {formatarMoeda(data.v)}
            </span>
          </button>

          <button
            onClick={() => setSelecionado({ id: 'debito', resumo: 'Cartão de Débito', valorTotal: calcularValor(configuracoes.taxas.debito) })}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
              selecionado?.id === 'debito' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' 
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              {selecionado?.id === 'debito' ? <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <Wallet className="w-5 h-5 text-slate-400" />}
              <span className={`font-medium ${selecionado?.id === 'debito' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>Débito</span>
            </div>
            <span className={`font-bold ${selecionado?.id === 'debito' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
              {formatarMoeda(calcularValor(configuracoes.taxas.debito))}
            </span>
          </button>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Cartão de Crédito
            </h3>
            <div className="space-y-2">
              {Object.entries(configuracoes.taxas.credito).map(([parcela, taxa]) => {
                const numParcelas = Number(parcela);
                const valorTotalComJuros = calcularValor(taxa);
                const valorDaParcela = valorTotalComJuros / numParcelas;
                const idParcela = `credito-${parcela}`;
                const resumoParcela = `Crédito em ${numParcelas}x de ${formatarMoeda(valorDaParcela)}`;

                return (
                  <button
                    key={parcela}
                    onClick={() => setSelecionado({ id: idParcela, resumo: resumoParcela, valorTotal: valorTotalComJuros })}
                    className={`w-full flex justify-between items-center p-3 rounded-lg border transition-all text-left ${
                      selecionado?.id === idParcela
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' 
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selecionado?.id === idParcela && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      <span className={`${selecionado?.id === idParcela ? 'text-blue-700 dark:text-blue-400 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                        {numParcelas}x de <span className="font-semibold">{formatarMoeda(valorDaParcela)}</span>
                      </span>
                    </div>
                    <span className={`font-medium ${selecionado?.id === idParcela ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                      {formatarMoeda(valorTotalComJuros)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Botão de Fechar Pedido via WhatsApp */}
        <button
          onClick={abrirWhatsApp}
          disabled={!selecionado}
          className={`w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-bold text-lg transition-all ${
            selecionado 
              ? 'bg-[#25D366] hover:bg-[#1ebd5b] text-white shadow-lg shadow-green-500/30 transform hover:-translate-y-0.5' 
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          }`}
        >
          <MessageCircle className="w-6 h-6" />
          {selecionado ? 'Fechar Pacote no WhatsApp' : 'Selecione uma opção'}
        </button>

        {/* Links Sociais (Só aparecem se o dono tiver preenchido lá nas Configurações) */}
        {(configuracoes.instagram || configuracoes.site) && (
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-center gap-6">
            {configuracoes.instagram && (
              <a 
                href={formatarUrlInstagram(configuracoes.instagram)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
            )}
            {configuracoes.site && (
              <a 
                href={formatarUrlSite(configuracoes.site)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Globe className="w-4 h-4" />
                Site Oficial
              </a>
            )}
          </div>
        )}

      </div>
    </div>
  );
}