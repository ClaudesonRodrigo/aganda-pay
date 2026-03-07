"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, Copy, CheckCircle2, Plane, DollarSign, Sparkles, Trash2, Clock, ExternalLink, LogOut, Settings, XCircle, Undo2 } from "lucide-react";
import { collection, addDoc, query, onSnapshot, deleteDoc, doc, where, updateDoc } from "firebase/firestore";
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
  status: 'Aberto' | 'Pago' | 'Cancelado';
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

  // 2. Escuta o Banco de Dados
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "links_gerados"), where("userId", "==", user.uid));
    
    const unsubscribeDB = onSnapshot(q, (querySnapshot) => {
      const linksMapeados: LinkHistorico[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        linksMapeados.push({ 
          id: docSnap.id, 
          status: data.status || 'Aberto', 
          ...data 
        } as LinkHistorico);
      });
      
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
    if (!user) return; 
    
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
        userId: user.uid,
        status: 'Aberto' 
      });
      
      setPacote("");
      setValor("");
    } catch (error) {
      console.error("Erro ao salvar no banco:", error);
      alert("Erro ao salvar. Verifique suas permissões no banco de dados.");
    }
  };

  const atualizarStatus = async (id: string, novoStatus: 'Aberto' | 'Pago' | 'Cancelado') => {
    try {
      await updateDoc(doc(db, "links_gerados", id), {
        status: novoStatus
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao mover orçamento. Tente novamente.");
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

  // Divisão dos Dados para o Kanban
  const linksAbertos = historico.filter(item => item.status === 'Aberto');
  const linksPagos = historico.filter(item => item.status === 'Pago');
  const linksCancelados = historico.filter(item => item.status === 'Cancelado');

  // Lógica Financeira: Somatório dos Lucros (Mágica do reduce)
  const valorTotalFaturado = linksPagos.reduce((acumulador, item) => acumulador + item.valor, 0);
  const valorTotalAReceber = linksAbertos.reduce((acumulador, item) => acumulador + item.valor, 0);

  if (verificandoAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4">
      
      {/* COLUNA ESQUERDA: GERADOR */}
      <div className="lg:col-span-4 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[24px] blur opacity-20 dark:opacity-40 animate-pulse duration-3000"></div>
        
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-800">
          
          <div className="absolute top-4 right-4 flex items-center gap-1">
            <Link 
              href="/configuracoes"
              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center"
              title="Configurações"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <button 
              onClick={fazerLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-8 text-center mt-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Agência Pay</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Nova Simulação</p>
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
                  placeholder="Ex: Pacote Maceió"
                  value={pacote}
                  onChange={(e) => setPacote(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="valor" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Valor Base (R$)
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
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/30"
            >
              <LinkIcon className="w-5 h-5" />
              Gerar Orçamento
            </button>
          </form>
        </div>
      </div>

      {/* COLUNA DIREITA: CRM KANBAN */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col h-full min-h-[600px] overflow-hidden">
        
        {/* CABEÇALHO DO CRM COM DASHBOARD FINANCEIRO */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              CRM de Vendas
            </h2>
            <p className="text-xs text-slate-500 mt-1">Gerencie o status e o faturamento da agência</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Bloco A Receber */}
            <div className="flex-1 sm:flex-none bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800/30">
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">A Receber</p>
              <p className="text-sm font-black text-blue-700 dark:text-blue-300">{formatarMoeda(valorTotalAReceber)}</p>
            </div>
            
            {/* Bloco Faturado (Lucro) */}
            <div className="flex-1 sm:flex-none bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl border border-green-200 dark:border-green-800/30 shadow-sm">
              <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Total Faturado</p>
              <p className="text-lg font-black text-green-700 dark:text-green-300">{formatarMoeda(valorTotalFaturado)}</p>
            </div>
          </div>
        </div>

        {carregandoDB ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p>Carregando pipeline...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-4 min-w-[850px] h-full">
              
              {/* COLUNA 1: EM ABERTO */}
              <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex justify-between items-center">
                  <span>Aguardando Pagamento</span>
                  <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 px-2 py-0.5 rounded text-xs">{linksAbertos.length}</span>
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                  {linksAbertos.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative group">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 pr-2">{item.pacote}</h4>
                        <span className="font-black text-blue-600 dark:text-blue-400 text-sm">{formatarMoeda(item.valor)}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-3">{formatarData(item.criadoEm)}</p>
                      
                      <div className="flex gap-2 mb-3">
                        <button onClick={() => copiarParaAreaDeTransferencia(item.url, item.id)} className="flex-1 flex items-center justify-center gap-1 p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-semibold transition-colors">
                          {copiado === item.id ? <CheckCircle2 size={14} className="text-green-500"/> : <Copy size={14} />} Copiar
                        </button>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                        <button onClick={() => atualizarStatus(item.id, 'Pago')} className="flex-1 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors">
                          <CheckCircle2 size={14}/> Pago
                        </button>
                        <button onClick={() => atualizarStatus(item.id, 'Cancelado')} className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center transition-colors" title="Marcar como Perdido">
                          <XCircle size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLUNA 2: PAGOS */}
              <div className="flex-1 flex flex-col bg-green-50/50 dark:bg-green-900/10 rounded-2xl p-4 border border-green-100 dark:border-green-900/30">
                <h3 className="text-sm font-bold text-green-700 dark:text-green-400 mb-4 flex justify-between items-center">
                  <span>Vendas Fechadas</span>
                  <span className="bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded text-xs">{linksPagos.length}</span>
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                  {linksPagos.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-green-200 dark:border-green-800/50 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm line-clamp-1 strike-through">{item.pacote}</h4>
                        <span className="font-black text-green-600 dark:text-green-400 text-sm">{formatarMoeda(item.valor)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                        <button onClick={() => atualizarStatus(item.id, 'Aberto')} className="text-slate-400 hover:text-blue-500 text-xs flex items-center gap-1 transition-colors">
                          <Undo2 size={12}/> Reabrir
                        </button>
                        <button onClick={() => deletarLink(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLUNA 3: CANCELADOS */}
              <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 opacity-80">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 flex justify-between items-center">
                  <span>Perdidos / Cancelados</span>
                  <span className="bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-xs">{linksCancelados.length}</span>
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                  {linksCancelados.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-slate-500 dark:text-slate-500 text-sm line-clamp-1">{item.pacote}</h4>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => atualizarStatus(item.id, 'Aberto')} className="text-slate-400 hover:text-blue-500 text-xs flex items-center gap-1 transition-colors">
                          <Undo2 size={12}/> Recuperar
                        </button>
                        <button onClick={() => deletarLink(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}