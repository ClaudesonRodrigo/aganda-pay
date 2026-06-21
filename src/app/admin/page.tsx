"use client";

import { useCallback, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users, ArrowRight, Activity, ArrowLeft } from "lucide-react";

// O SEU UID DE SEGURANÇA MÁXIMA
const MEU_UID = "8LMLbOMGgtceH0Fn9Fq6ZdHHEIQ2";

type UsuarioAdmin = {
  uid: string;
  email?: string | null;
  ultimoAcesso: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [autorizado, setAutorizado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const buscarUsuarios = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const lista: UsuarioAdmin[] = [];
      querySnapshot.forEach((doc) => {
        lista.push(doc.data() as UsuarioAdmin);
      });
      // Ordena pelos que acessaram mais recentemente
      lista.sort((a, b) => new Date(b.ultimoAcesso).getTime() - new Date(a.ultimoAcesso).getTime());
      setUsuarios(lista);
      setCarregando(false);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.uid === MEU_UID) {
        setAutorizado(true);
        buscarUsuarios();
      } else if (user) {
        router.push("/"); // Expulsa usuários comuns para o painel deles
      } else {
        router.push("/login"); // Expulsa quem não está logado
      }
    });
    return () => unsubscribe();
  }, [buscarUsuarios, router]);

  const personificarCliente = (uidCliente: string) => {
    // Grava o UID do cliente no cache (Modo Deus) e manda para a Home
    localStorage.setItem("admin_impersonating_uid", uidCliente);
    router.push("/");
  };

  if (!autorizado) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <ShieldCheck className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Verificando credenciais de Elite...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Cabeçalho Admin */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl">
              <ShieldCheck className="w-10 h-10 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Central de Comando</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Acesso exclusivo Master Admin</p>
            </div>
          </div>
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao meu Painel
          </button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex items-center gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Clientes Ativos</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{usuarios.length}</h3>
            </div>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Monitoramento de Agências
            </h2>
          </div>
          
          {carregando ? (
            <div className="p-10 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {usuarios.map((usr) => (
                <div key={usr.uid} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-lg">{usr.email}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <p>UID: <span className="font-mono bg-slate-100 dark:bg-slate-900 px-1 rounded">{usr.uid}</span></p>
                      <p>Último acesso: {new Date(usr.ultimoAcesso).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => personificarCliente(usr.uid)}
                    className="w-full sm:w-auto bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                  >
                    Dar Suporte <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {usuarios.length === 0 && (
                <div className="p-10 text-center text-slate-500">
                  Nenhum cliente registrado no banco de dados ainda. Faça login de novo para atualizar.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
