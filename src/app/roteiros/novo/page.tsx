"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Image as ImageIcon, MapPin, Calendar, User as UserIcon, Loader2, CheckCircle2, Wand2, Sparkles } from "lucide-react";

// Tipagem do nosso CRM de Roteiros
interface DiaRoteiro {
  id: string;
  titulo: string;
  descricao: string;
  imagemUrl: string;
  fazendoUpload: boolean;
  gerandoIA?: boolean;
}

export default function NovoRoteiroPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [verificandoAuth, setVerificandoAuth] = useState(true);

  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Estados Globais do Roteiro
  const [nomeCliente, setNomeCliente] = useState("");
  const [destino, setDestino] = useState("");
  const [dataViagem, setDataViagem] = useState("");
  
  // Estado do Array de Dias
  const [dias, setDias] = useState<DiaRoteiro[]>([
    { id: crypto.randomUUID(), titulo: "Dia 1 - Chegada", descricao: "", imagemUrl: "", fazendoUpload: false, gerandoIA: false }
  ]);

  // Blindagem de Rota
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuarioLogado) => {
      if (usuarioLogado) {
        setUser(usuarioLogado);
      } else {
        router.push("/login");
      }
      setVerificandoAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Função Sênior de Upload para o Cloudinary
  const uploadImagemCloudinary = async (file: File, diaId: string) => {
    if (!file) return;
    setDias(prev => prev.map(d => d.id === diaId ? { ...d, fazendoUpload: true } : d));

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Cloudinary não configurado no .env.local");
      setDias(prev => prev.map(d => d.id === diaId ? { ...d, fazendoUpload: false } : d));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setDias(prev => prev.map(d => d.id === diaId ? { ...d, imagemUrl: data.secure_url, fazendoUpload: false } : d));
      } else {
        throw new Error("Falha ao obter URL segura");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao enviar imagem.");
      setDias(prev => prev.map(d => d.id === diaId ? { ...d, fazendoUpload: false } : d));
    }
  };

  // Função de Integração com a IA
  const gerarTextoIA = async (diaId: string, tituloDia: string) => {
    if (!destino) {
      alert("Digite o 'Destino Principal' no topo da página antes de usar a IA.");
      return;
    }
    if (!tituloDia || tituloDia.trim() === "") {
      alert("Preencha o 'Título do Dia' para a IA saber o que inventar!");
      return;
    }

    // Ativa o loading só no botão desse card
    setDias(prev => prev.map(d => d.id === diaId ? { ...d, gerandoIA: true } : d));

    try {
      const res = await fetch('/api/gerar-descricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destino, tituloDia })
      });
      
      const data = await res.json();

      if (data.texto) {
        setDias(prev => prev.map(d => d.id === diaId ? { ...d, descricao: data.texto, gerandoIA: false } : d));
      } else {
        throw new Error(data.error || "Erro desconhecido na API.");
      }
    } catch (error) {
      console.error("Erro na IA:", error);
      alert("A Inteligência Artificial falhou. Tente novamente.");
      setDias(prev => prev.map(d => d.id === diaId ? { ...d, gerandoIA: false } : d));
    }
  };

  const adicionarDia = () => {
    setDias(prev => [
      ...prev,
      { id: crypto.randomUUID(), titulo: `Dia ${prev.length + 1} - `, descricao: "", imagemUrl: "", fazendoUpload: false, gerandoIA: false }
    ]);
  };

  const removerDia = (id: string) => {
    if (dias.length === 1) {
      alert("O roteiro precisa ter pelo menos um dia!");
      return;
    }
    setDias(prev => prev.filter(d => d.id !== id));
  };

  const atualizarDia = (id: string, campo: keyof DiaRoteiro, valor: string) => {
    setDias(prev => prev.map(d => d.id === id ? { ...d, [campo]: valor } : d));
  };

  const salvarRoteiro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!nomeCliente || !destino) {
      alert("Preencha o nome do cliente e o destino.");
      return;
    }

    setSalvando(true);

    try {
      // Limpa os estados de controle antes de mandar pro banco de dados
      const diasLimpos = dias.map(({ fazendoUpload, gerandoIA, ...resto }) => resto);

      await addDoc(collection(db, "roteiros"), {
        userId: user.uid,
        nomeCliente,
        destino,
        dataViagem,
        dias: diasLimpos,
        criadoEm: new Date().toISOString(),
        status: "Criado"
      });

      setSucesso(true);
      setTimeout(() => { router.push("/"); }, 2000);

    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar o roteiro.");
      setSalvando(false);
    }
  };

  if (verificandoAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-8 relative px-4 pb-20">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 font-semibold transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Voltar para o CRM
      </Link>

      <form onSubmit={salvarRoteiro} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 md:p-8">
        
        <div className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Construtor de Roteiros</h1>
            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> IA Ativada
            </span>
          </div>
          <p className="text-sm text-slate-500">Crie experiências visuais com a ajuda da Inteligência Artificial.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-blue-500" /> Nome do Cliente
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Família Silva"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" /> Destino Principal
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Gramado, RS"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-500" /> Data da Viagem
            </label>
            <input
              type="text"
              placeholder="Ex: 10 a 15 de Dezembro"
              value={dataViagem}
              onChange={(e) => setDataViagem(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Cronograma da Viagem</h2>
            <button
              type="button"
              onClick={adicionarDia}
              className="text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Adicionar Dia
            </button>
          </div>

          {dias.map((dia, index) => (
            <div key={dia.id} className="relative bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
              
              <button
                type="button"
                onClick={() => removerDia(dia.id)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Remover Dia"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div className="lg:col-span-4 flex flex-col items-center justify-center">
                  <label className="w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl overflow-hidden relative cursor-pointer group bg-white dark:bg-slate-900 transition-colors flex items-center justify-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImagemCloudinary(file, dia.id);
                      }}
                    />
                    {dia.fazendoUpload ? (
                      <div className="flex flex-col items-center gap-2 text-blue-600">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-xs font-bold">Otimizando na nuvem...</span>
                      </div>
                    ) : dia.imagemUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={dia.imagemUrl} alt="Preview" className="w-full h-full object-cover group-hover:opacity-70 transition-opacity" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-500 transition-colors">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs font-semibold">Clique para subir a foto</span>
                      </div>
                    )}
                  </label>
                </div>

                <div className="lg:col-span-8 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Título do Dia</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dia 1 - Passeio de Lancha nas Ilhas"
                      value={dia.titulo}
                      onChange={(e) => atualizarDia(dia.id, "titulo", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Descrição do Passeio</label>
                      
                      {/* O BOTÃO MÁGICO DA IA */}
                      <button
                        type="button"
                        onClick={() => gerarTextoIA(dia.id, dia.titulo)}
                        disabled={dia.gerandoIA}
                        className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        title="Deixe a IA escrever a descrição para você"
                      >
                        {dia.gerandoIA ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                        {dia.gerandoIA ? "IA Pensando..." : "Escrever com IA"}
                      </button>

                    </div>
                    <textarea
                      required
                      placeholder="Descreva o que o cliente fará neste dia ou clique no botão de IA..."
                      value={dia.descricao}
                      onChange={(e) => atualizarDia(dia.id, "descricao", e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={salvando || dias.some(d => d.fazendoUpload || d.gerandoIA)}
            className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-blue-500/30"
          >
            {salvando || sucesso ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white" />
                {sucesso ? "Roteiro Salvo!" : "Salvando..."}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar e Gerar Link Premium
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}