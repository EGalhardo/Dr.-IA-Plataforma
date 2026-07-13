import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).json({});
    return true;
  }
  return false;
}

function requirePost(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return false;
  }
  return true;
}

let ai: GoogleGenAI | null = null;
let groq: Groq | null = null;

function getAI(): GoogleGenAI | null {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (apiKey) {
      try {
        ai = new GoogleGenAI({
          apiKey,
          apiVersion: 'v1beta',
          httpOptions: { headers: { 'User-Agent': 'vercel-deploy' } }
        });
      } catch (e) {
        console.warn('Failed to instantiate GoogleGenAI client:', e);
      }
    }
  }
  return ai;
}

function getGroq(): Groq | null {
  if (!groq) {
    const groqApiKey = process.env.GROQ_API_KEY || process.env.Teste01 || '';
    if (groqApiKey) {
      try {
        groq = new Groq({ apiKey: groqApiKey });
      } catch (e) {
        console.warn('Failed to instantiate Groq client:', e);
      }
    }
  }
  return groq;
}

const DRIA_PROJECT_INFO = `
O Dr.IA é uma plataforma inteligente de saúde digital concebida para aproximar os cidadãos angolanos dos serviços de saúde através da Inteligência Artificial. O sistema funciona como um ecossistema integrado onde três painéis trabalham em conjunto: Cidadãos, Hospitais e Ministério da Saúde (MINSA).

O principal problema que resolvemos é a dificuldade de acesso a cuidados de saúde primários e a sobrelotação das urgências hospitalares em Angola. Muitos cidadãos deslocam-se aos hospitais sem necessidade real, enquanto casos verdadeiramente urgentes enfrentam atrasos.

A solução que oferecemos é uma plataforma de triagem clínica inteligente que permite:
- A qualquer cidadão obter uma avaliação preliminar de saúde por IA, via texto ou voz, 24h por dia
- Aos hospitais receber relatórios clínicos antecipados antes da chegada dos pacientes
- Ao MINSA monitorizar indicadores epidemiológicos nacionais em tempo real

Os três painéis do Dr.IA funcionam da seguinte forma:

1. PAINEL DO CIDADÃO:
- Entrevista clínica guiada por IA com perguntas sobre sintomas, febre, temperatura, dores, vómitos, hemorragias, contacto com Ébola, doenças crónicas e medicação
- Triagem inteligente baseada no Protocolo de Manchester
- Classificação de prioridade: Emergência, Muito Urgente, Urgente, Moderado, Leve
- Recomendações personalizadas (primeiros socorros, hidratação, repouso, isolamento)
- Encaminhamento automático para hospitais em casos graves
- Histórico médico digital completo
- Acesso a primeiros socorros e contactos de hospitais

2. PAINEL DO HOSPITAL:
- Dashboard com KPIs de admissões, urgências, fila de espera e altas
- Lista de pacientes em tempo real com prioridades
- Relatório clínico antecipado gerado por IA antes da chegada do paciente
- Posto médico para confirmação de diagnóstico, exames e prescrição de alta
- Alertas automáticos para casos críticos com encaminhamento do cidadão
- Gestão de conta hospitalar e perfil

3. PAINEL DO MINSA (MINISTÉRIO DA SAÚDE):
- Vigilância epidemiológica nacional com mapeamento interativo de Angola
- Monitorização de doenças: Malária, Cólera, Tuberculose, Sarampo, Ébola
- KPIs de casos totais, municípios em alerta, tendências semanais
- Alertas ativos de saúde pública
- Gestão de hospitais integrados e capacidade instalada
- Relatórios e estatísticas para apoio à decisão estratégica

O Dr.IA integra os três painéis num ecossistema contínuo: o cidadão faz a triagem, casos graves geram alertas automáticos no hospital, e os dados agregados alimentam a vigilância do MINSA.

O nosso objetivo é um sistema de saúde mais eficiente, preventivo, inteligente e centrado no utente angolano.
`;

const DIALECT_MAP: Record<string, string> = {
  pt: 'Português de Angola',
  um: 'Umbundu',
  ki: 'Kimbundu',
  kk: 'Kikongo',
  ch: 'Chokwe',
  ng: 'Ngangela',
  kw: 'Kwanyama',
  nh: 'Nhaneca',
  fi: 'Fiote',
};

async function tryGroqChat(
  groqClient: Groq,
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string | null> {
  try {
    const completion = await groqClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
    });
    return completion.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.error('Groq Chat Error:', e);
    return null;
  }
}

async function tryGeminiChat(
  aiClient: GoogleGenAI,
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string | null> {
  try {
    const formattedContents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.5,
      },
    });
    return response?.text || null;
  } catch (e) {
    console.error('Gemini Chat Error:', e);
    return null;
  }
}

function getOfflineResponse(lastMessage: string): string {
  let response = 'Olá! Atualmente estou a operar em Modo Sandbox local e offline por razões de conectividade institucional. Como assistente virtual do Dr.IA, garanto-lhe que a sua correspondência está selada e segura nos servidores centrais.';

  const lower = lastMessage.toLowerCase();
  if (lower.includes('nif') || lower.includes('contribuinte')) {
    response = 'Para tratar de assuntos relacionados ao seu NIF (Número de Identificação Fiscal) ou impostos pendentes, aceda à secção "Correspondência" no menu lateral e selecione a "AGT" (Administração Geral Tributária) para falar diretamente com o integrador de processos fiscais.';
  } else if (lower.includes('sme') || lower.includes('passaporte') || lower.includes('visto')) {
    response = 'O Serviço de Migração e Estrangeiros (SME) permite-lhe agendar a recolha de dados e emissão de passaportes diretamente pelo portal. Vá à aba de "Correspondência" e inicie uma conversa com o "SME".';
  } else if (lower.includes('pagamento') || lower.includes('fatura') || lower.includes('pagar')) {
    response = 'Através do canal de Correspondência da ENDE e EPAL, pode consultar e simular o pagamento eletrotécnico e hidráulico de faturas de forma imediata e integrada. Os comprovativos são gerados na própria conversa oficial.';
  }
  return response;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (!requirePost(req, res)) return;

  try {
    const { messages, isGovMode, currentPage, pageContext, language } = req.body;

    let systemPrompt = isGovMode
      ? `Você é o Consultor de Segurança e Legislação do SOC do Governo de Angola. Sua função é auxiliar administradores na gestão de protocolos de emergência, interoperabilidade e redação de normas. ${DRIA_PROJECT_INFO} Inicie sempre saudando e perguntando como pode ser útil. Responda de forma eficiente, clara e profissional. Não utilize asteriscos ou símbolos de formatação na sua fala. Utilize sempre o nome completo Dr.IA. Se a explicação for muito longa, apresente primeiro o essencial e interrompa para perguntar se o usuário deseja que você continue detalhando ou prefere focar em algo específico.`
      : `Você é o assistente oficial do Dr.IA. ${DRIA_PROJECT_INFO} Inicie sempre saudando e perguntando como pode ser útil. Ajude o usuário com informações sobre seus documentos e correspondências de forma eficiente. Seja cordial, humano e acolhedor. Utilize sempre o nome completo Dr.IA. Não utilize asteriscos ou símbolos de formatação para garantir uma fala limpa e natural. Caso sua resposta seja longa, apresente primeiro os pontos essenciais e interrompa para perguntar se o usuário gostaria que continuasse detalhando ou se prefere focar em algo específico. Responda em Português de Angola.`;

    if (currentPage && pageContext) {
      systemPrompt += `\n\n[CONTEXTO DO ECRÃ ATUAL DO UTILIZADOR]:\nO usuário está visualizando a página "${currentPage}" no momento. \nO conteúdo e dados visíveis no ecrã dele são:\n"""${pageContext}"""\nSe o utilizador pedir para explicar o que está aberto, resumir a página, ou fizer perguntas sobre o conteúdo atual do ecrã, utilize os dados acima de forma natural para responder de maneira precisa e informativa.`;
    }

    if (language && language !== 'pt') {
      const selectedDialect = DIALECT_MAP[language] || 'Português de Angola';
      systemPrompt += `\n\n[CRITICAL DIALECT INSTRUCTION]:\nO utilizador atual prefere interagir no dialeto regional de Angola: "${selectedDialect}". Por favor, ignore a instrução de responder em Português de Angola; você DEVE responder integralmente no dialeto "${selectedDialect}". Seja nativo, evite jargões em português fora de termos oficiais inevitáveis, e mantenha o tom do Dr.IA nesta língua regional.`;
    }

    let finalSystemPrompt = systemPrompt;
    const filteredMessages = (messages || []).filter((m: any) => {
      if (m.role === 'system' || m.role === 'System') {
        if (m.content || m.text) {
          finalSystemPrompt += '\n\n' + (m.content || m.text);
        }
        return false;
      }
      return true;
    });

    const alternateMessages: { role: 'user' | 'assistant'; content: string }[] = [];
    for (const msg of filteredMessages) {
      const role = msg.role === 'assistant' || msg.role === 'model' || msg.role === 'bot' ? 'assistant' : 'user';
      const content = msg.content || msg.text || '';
      if (!content) continue;

      if (alternateMessages.length > 0 && alternateMessages[alternateMessages.length - 1].role === role) {
        alternateMessages[alternateMessages.length - 1].content += '\n\n' + content;
      } else {
        alternateMessages.push({ role, content });
      }
    }

    const groqClient = getGroq();
    if (groqClient) {
      const result = await tryGroqChat(groqClient, finalSystemPrompt, alternateMessages);
      if (result) return res.status(200).json({ message: result });
    }

    const aiClient = getAI();
    if (aiClient) {
      const result = await tryGeminiChat(aiClient, finalSystemPrompt, alternateMessages);
      if (result) return res.status(200).json({ message: result });
    }

    const lastMessageObj = messages?.length > 0 ? messages[messages.length - 1] : null;
    const lastMessage = lastMessageObj ? (lastMessageObj.content || lastMessageObj.text || '') : '';
    const offlineResponse = getOfflineResponse(lastMessage);

    return res.status(200).json({ message: offlineResponse });
  } catch (error: any) {
    console.error('Groq & Gemini Chat Error:', error);
    res.status(500).json({ error: 'Erro ao processar conversa com IA.' });
  }
}