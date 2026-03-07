"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, Copy, CheckCircle2, Plane, DollarSign, Sparkles, Trash2, Clock, ExternalLink, LogOut, Settings } from "lucide-react";
import { collection, addDoc, query, onSnapshot, deleteDoc, doc, where } from "firebase/firestore";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LinkHistorico {
  id: string;
  pacote: string;
  valor: number;
  url: string;
  criadoEm: string;
  userId: string;
}

export default function Home() {
  const router = useRouter();
  
  // Estados de Autenticação
  const [user, setUser] = useState<User | null>(null);
  const [verificandoAuth, setVerificandoAuth] = useState(true);

  // Estados do Formulário e Banco
  const [pacote, setPacote] = useState("");
  const [valor, setValor] = useState("");
  const [linkGerado, setLinkGerado] = useState("");
  const [copiado, setCopiado] = useState<string | null>(null);
  const [historico, setHistorico] = useState<LinkHistorico[]>([]);
  const [carregandoDB, setCarregandoDB] = useState(true);

  // 1. Blindagem de Rota
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (usuarioLogado) => {
      if (usuarioLogado) {
        setUser(usuarioLogado);
        setVerificandoAuth(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  // 2. Escuta o Banco de Dados (Filtrando APENAS os links do usuário logado)
  useEffect(() => {
    if (!user) return;

    // A mágica do isolamento: busca apenas onde o userId bate com quem está logado
    const q = query(collection(db, "links_gerados"), where("userId", "==", user.uid));
    
    const unsubscribeDB = onSnapshot(q, (querySnapshot) => {
      const linksMapeados: LinkHistorico[] = [];
      querySnapshot.forEach((doc) => {
        linksMapeados.push({ id: doc.id, ...doc.data() } as LinkHistorico);
      });
      
      // Ordenando do mais novo para o mais velho no Front-end
      linksMapeados.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
      
      setHistorico(linksMapeados);
      setCarregandoDB(false);
    });

    return () => unsubscribeDB();
  }, [user]);

  const fazerLogout = async () => {
    await signOut(auth);
  };

  const gerarLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return; // Segurança extra
    
    const valorNumerico = valor.replace(/\D/g, ""); 
    if (!pacote || !valorNumerico) return;

    const valorFormatado = Number(valorNumerico) / 100;

    const payload = { p: pacote, v: valorFormatado };
    const jsonString = JSON.stringify(payload);
    const hashSeguro = encodeURIComponent(btoa(encodeURIComponent(jsonString)));
    const urlFinal = `${window.location.origin}/checkout/${hashSeguro}`;
    
    setLinkGerado(urlFinal);

    try {
      await addDoc(collection(db, "links_gerados"), {
        pacote: pacote,
        valor: valorFormatado,
        url: urlFinal,
        criadoEm: new Date().toISOString(),
        userId: user.uid // Carimbando o dono do link no banco de dados
      });
      
      setPacote("");
      setValor("");
    } catch (error) {
      console.error("Erro ao salvar no banco:", error);
      alert("Erro ao salvar. Verifique suas permissões no banco de dados.");
    }
  };

  const deletarLink = async (id: string) => {
    if (confirm("Tem certeza que deseja apagar essa simulação do histórico?")) {
      await deleteDoc(doc(db, "links_gerados", id));
    }
  };

  const copiarParaAreaDeTransferencia = (texto: string, idRef: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(idRef);
    setTimeout(() => setCopiado(null), 2000);
  };

  const formatarMoeda = (valorAFormatar: string | number) => {
    if (typeof valorAFormatar === 'number') {
      return valorAFormatar.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    const apenasNumeros = valorAFormatar.replace(/\D/g, "");
    if (!apenasNumeros) {
      setValor("");
      return;
    }
    const valorComVirgula = (Number(apenasNumeros) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    setValor(valorComVirgula);
  };

  const formatarData = (dataIso: string) => {
    return new Date(dataIso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (verificandoAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* COLUNA ESQUERDA: GERADOR */}
      <div className="lg:col-span-5 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[24px] blur opacity-20 dark:opacity-40 animate-pulse duration-3000"></div>
        
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-100 dark:border-slate-800">
          
          {/* Botões do topo (Config e Logout) */}
          <div className="absolute top-4 right-4 flex items-center gap-1">
            <Link 
              href="/configuracoes"
              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <Settings className="w-4 h-4" />
              Configurações
            </Link>
            <button 
              onClick={fazerLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>

          <div className="mb-8 text-center mt-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Agência Pay</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Nova Simulação de Venda</p>
          </div>

          <form onSubmit={gerarLink} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="pacote" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Destino ou Pacote
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Plane className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="pacote"
                  type="text"
                  placeholder="Ex: Pacote Maceió 5 Dias"
                  value={pacote}
                  onChange={(e) => setPacote(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="valor" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Valor Total Base
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="valor"
                  type="text"
                  placeholder="R$ 0,00"
                  value={valor}
                  onChange={(e) => formatarMoeda(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/30"
            >
              <LinkIcon className="w-5 h-5" />
              Gerar & Salvar Link
            </button>
          </form>

          {linkGerado && (
            <div className="mt-8 p-1 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 animate-in fade-in zoom-in duration-300">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-bold text-slate-900 dark:text-white mb-1">Simulação criada com sucesso!</p>
                <p className="text-xs text-slate-500">O link já foi salvo no seu histórico ao lado.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COLUNA DIREITA: HISTÓRICO */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col h-full min-h-[500px]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Histórico Recente
          </h2>
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
            {historico.length} simulações
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
          {carregandoDB ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p>Carregando histórico...</p>
            </div>
          ) : historico.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 mt-12">
              <Plane className="w-12 h-12 mb-4 opacity-20" />
              <p>Nenhuma simulação gerada ainda.</p>
              <p className="text-sm mt-1">Crie seu primeiro link de pagamento ao lado.</p>
            </div>
          ) : (
            historico.map((item) => (
              <div key={item.id} className="group p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 bg-slate-50 dark:bg-slate-800/30 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{item.pacote}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{formatarData(item.criadoEm)}</p>
                  </div>
                  <span className="font-black text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-2 py-1 rounded shadow-sm text-sm">
                    {formatarMoeda(item.valor)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                  <button
                    onClick={() => copiarParaAreaDeTransferencia(item.url, item.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
                  >
                    {copiado === item.id ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copiado === item.id ? "Copiado!" : "Copiar Link"}
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Testar Link"
                    className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:text-blue-500 text-slate-500 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => deletarLink(item.id)}
                    title="Apagar"
                    className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:text-red-500 text-slate-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}