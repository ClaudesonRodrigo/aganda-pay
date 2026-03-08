"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MapPin, Calendar, Clock, MessageCircle, AlertCircle, PlaneTakeoff } from "lucide-react";

// Tipagens do que vem do Banco de Dados
interface DiaRoteiro {
  id: string;
  titulo: string;
  descricao: string;
  imagemUrl: string;
}

interface RoteiroData {
  nomeCliente: string;
  destino: string;
  dataViagem: string;
  dias: DiaRoteiro[];
  status: string;
}

export default function RoteiroVitrinePage() {
  const params = useParams();
  const idParam = params?.id as string;

  const [roteiro, setRoteiro] = useState<RoteiroData | null>(null);
  const [whatsapp, setWhatsapp] = useState("5579999999999");
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarDados = async () => {
      if (!idParam) return;

      try {
        // 1. Busca os dados do roteiro
        const docRef = doc(db, "roteiros", idParam);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRoteiro(docSnap.data() as RoteiroData);
        } else {
          setErro(true);
        }

        // 2. Busca o WhatsApp da agência para o botão de fechamento
        const configRef = doc(db, "configuracoes", "geral");
        const configSnap = await getDoc(configRef);
        if (configSnap.exists() && configSnap.data().whatsapp) {
          setWhatsapp(configSnap.data().whatsapp);
        }

      } catch (error) {
        console.error("Erro ao carregar roteiro:", error);
        setErro(true);
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, [idParam]);

  const abrirWhatsApp = () => {
    if (!roteiro) return;
    const texto = `Olá! Acabei de analisar a proposta de roteiro para *${roteiro.destino}* no meu link exclusivo.\n\nGostaria de aprovar e dar andamento ao pacote!`;
    const urlWa = `https://wa.me/${whatsapp}?text=${encodeURIComponent(texto)}`;
    window.open(urlWa, "_blank");
  };

  if (carregando) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center">
        <PlaneTakeoff className="w-12 h-12 text-blue-600 animate-pulse mb-4" />
        <p className="text-slate-500 font-medium tracking-widest uppercase text-sm animate-pulse">Preparando sua viagem...</p>
      </div>
    );
  }

  if (erro || !roteiro) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-md border border-slate-100 dark:border-slate-700">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Roteiro Indisponível</h2>
          <p className="text-slate-500 dark:text-slate-400">Este link de viagem expirou ou não existe mais. Entre em contato com a sua agência.</p>
        </div>
      </div>
    );
  }

  // Pega a foto do primeiro dia para usar como Capa Gigante (Hero)
  const fotoCapa = roteiro.dias[0]?.imagemUrl || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop";

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
      
      {/* SEÇÃO 1: HERO IMAGE (Capa Cinematográfica) */}
      <div className="relative w-full h-[45vh] md:h-[55vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fotoCapa} alt={roteiro.destino} className="w-full h-full object-cover" />
        {/* Gradiente escuro sobre a imagem para o texto ficar legível */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white">
          <p className="text-blue-400 font-bold tracking-widest uppercase text-xs mb-2 flex items-center gap-1.5 shadow-sm">
            <PlaneTakeoff className="w-4 h-4" /> Proposta Exclusiva
          </p>
          <h1 className="text-4xl md:text-5xl font-black mb-2 leading-tight">
            {roteiro.destino}
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-4">
            <span className="flex items-center gap-2 text-sm md:text-base font-medium text-slate-200">
              <MapPin className="w-5 h-5 text-red-500" /> Preparado para {roteiro.nomeCliente}
            </span>
            {roteiro.dataViagem && (
              <span className="flex items-center gap-2 text-sm md:text-base font-medium text-slate-200">
                <Calendar className="w-5 h-5 text-blue-400" /> {roteiro.dataViagem}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: LINHA DO TEMPO (Timeline do Roteiro) */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">O seu roteiro dia a dia</h2>
          <p className="text-slate-500 mt-2">Confira a experiência incrível que montamos para você.</p>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent">
          
          {roteiro.dias.map((dia, index) => (
            <div key={dia.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              {/* Ícone no centro da linha */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 dark:border-slate-900 bg-blue-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Clock className="w-4 h-4" />
              </div>
              
              {/* Card de Conteúdo */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                {dia.imagemUrl && (
                  <div className="w-full h-48 mb-4 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={dia.imagemUrl} alt={dia.titulo} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{dia.titulo}</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {dia.descricao}
                </p>
              </div>

            </div>
          ))}

        </div>
      </div>

      {/* SEÇÃO 3: CALL TO ACTION (Botão Flutuante de Fechamento) */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 z-50 flex justify-center shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]">
        <button
          onClick={abrirWhatsApp}
          className="w-full max-w-md bg-[#25D366] hover:bg-[#1ebd5b] text-white font-bold text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transform hover:-translate-y-1 transition-all"
        >
          <MessageCircle className="w-6 h-6" />
          Aprovar Roteiro
        </button>
      </div>

    </div>
  );
}