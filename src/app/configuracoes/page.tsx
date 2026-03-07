"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Save, Phone, Percent, ArrowLeft, Settings, CheckCircle2, Instagram, Globe } from "lucide-react";
import Link from "next/link";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [verificandoAuth, setVerificandoAuth] = useState(true);
  
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Estados dos formulários
  const [whatsapp, setWhatsapp] = useState("5579999999999");
  const [instagram, setInstagram] = useState("");
  const [site, setSite] = useState("");
  const [taxaDebito, setTaxaDebito] = useState<number>(1.37);
  const [taxasCredito, setTaxasCredito] = useState<{ [key: number]: number }>({
    1: 3.15, 2: 5.39, 3: 6.12, 4: 6.85, 5: 7.57, 6: 8.28,
    7: 8.99, 8: 9.69, 9: 10.38, 10: 11.06, 11: 11.74, 12: 12.40
  });

  // 1. Blindagem de Rota
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuarioLogado) => {
      if (usuarioLogado) {
        setUser(usuarioLogado);
        carregarConfiguracoes();
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 2. Busca as configurações no Firebase
  const carregarConfiguracoes = async () => {
    try {
      const docRef = doc(db, "configuracoes", "geral");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const dados = docSnap.data();
        if (dados.whatsapp) setWhatsapp(dados.whatsapp);
        if (dados.instagram) setInstagram(dados.instagram);
        if (dados.site) setSite(dados.site);
        if (dados.taxas) {
          if (dados.taxas.debito) setTaxaDebito(dados.taxas.debito);
          if (dados.taxas.credito) setTaxasCredito(dados.taxas.credito);
        }
      }
      setVerificandoAuth(false);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      setVerificandoAuth(false);
    }
  };

  // 3. Salva as alterações no Firebase
  const salvarConfiguracoes = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setSucesso(false);

    try {
      await setDoc(doc(db, "configuracoes", "geral"), {
        whatsapp: whatsapp,
        instagram: instagram,
        site: site,
        taxas: {
          debito: taxaDebito,
          credito: taxasCredito
        },
        atualizadoEm: new Date().toISOString()
      });
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar configurações. Verifique sua conexão.");
    } finally {
      setSalvando(false);
    }
  };

  const handleTaxaCreditoChange = (parcela: number, valor: string) => {
    const num = parseFloat(valor.replace(",", "."));
    setTaxasCredito(prev => ({
      ...prev,
      [parcela]: isNaN(num) ? 0 : num
    }));
  };

  if (verificandoAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-8 relative px-4">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 font-semibold transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Voltar para Dashboard
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações do Sistema</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie contatos, redes sociais e taxas de juros</p>
          </div>
        </div>

        <form onSubmit={salvarConfiguracoes} className="space-y-8">
          
          {/* Seção Contatos e Redes Sociais */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-500" />
              Contatos e Redes Sociais
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WhatsApp */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  WhatsApp de Recebimento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="5579999999999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">DDI e DDD juntos. Número para fechar o pedido.</p>
              </div>

              {/* Instagram */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Perfil do Instagram
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Instagram className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="@suaagencia"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              {/* Site */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Site Oficial
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://www.suaagencia.com.br"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção Taxas */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Percent className="w-5 h-5 text-blue-500" />
              Taxas de Juros (%)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Débito */}
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Cartão de Débito</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={taxaDebito}
                    onChange={(e) => setTaxaDebito(parseFloat(e.target.value))}
                    className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                </div>
              </div>

              {/* Crédito */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 md:col-span-2">
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-300 mb-4">Cartão de Crédito (Parcelado)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((parcela) => (
                    <div key={parcela}>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{parcela}x</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={taxasCredito[parcela]}
                          onChange={(e) => handleTaxaCreditoChange(parcela, e.target.value)}
                          className="w-full pl-3 pr-8 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={salvando}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
            >
              {salvando ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : sucesso ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  Salvo com Sucesso!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}