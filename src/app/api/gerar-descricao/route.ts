import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destino, tituloDia } = body;

    if (!destino || !tituloDia) {
      return NextResponse.json({ error: 'Destino e Título do Dia são obrigatórios.' }, { status: 400 });
    }

    // 🚨 BYPASS ATIVADO: Chave injetada diretamente no código (Hardcode)
    // Isto ignora o ficheiro .env local e garante 100% de leitura limpa
    const apiKey = "AIzaSyD66yNL1j16byqi9gK2AYphdUVX1etYYwA";

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Utilizando o modelo mais rápido e moderno do Google
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Você é um agente de viagens de luxo muito experiente e persuasivo. 
    Sua tarefa é escrever a descrição de uma atividade em um roteiro de viagem.
    Destino da Viagem: ${destino}.
    Atividade ou Título do dia: ${tituloDia}.
    
    Regras estritas:
    1. Escreva em apenas 1 parágrafo curto e direto ao ponto (máximo de 4 linhas).
    2. Use um tom elegante, empolgante e focado em vender a experiência (Efeito UAU).
    3. Retorne APENAS o texto da descrição, sem aspas, sem introduções e sem formatação markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textoGerado = response.text();

    return NextResponse.json({ texto: textoGerado.trim() });

  } catch (error) {
    console.error('Erro no motor da IA:', error);
    return NextResponse.json({ error: 'Falha interna ao gerar o texto com IA.' }, { status: 500 });
  }
}