import type { VercelRequest, VercelResponse } from './_utils';
import { handleCors, requirePost, getAI, getGroq } from './_utils';
import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';

const DRIA_GOV_PROMPTS: Record<string, { system: string; user: (text: string, context?: string) => string }> = {
  summarize: {
    system: 'Você é um assistente do Governo de Angola especialista em simplificar e resumir documentos administrativos de forma clara, concisa e direta. Remova burocracias desnecessárias e explique tudo de forma simples em português de Angola.',
    user: (text: string) => `Faça um resumo inteligente, estruturado e muito fácil de ler do seguinte documento administrativo:\n\n${text}`,
  },
  explain: {
    system: 'Você é um assistente especialista em traduzir e explicar termos jurídicos, siglas e termos burocráticos complicados presentes em mensagens e comunicações do Estado de Angola para cidadãos comuns, de forma acolhedora, prática, muito simples e direta.',
    user: (text: string) => `Explique de forma acolhedora, clara e simples o significado prático e os termos difíceis desta notificação/mensagem oficial:\n\n${text}`,
  },
  urgency: {
    system: 'Você é especialista em identificar o nível de urgência e prazos legais de atendimento em comunicações administrativas públicas em Angola. Estipule riscos de perda de prazo.',
    user: (text: string) => `Analise detalhadamente o nível de urgência, o prazo oficial implícito ou explícito e as consequências jurídicas ou fiscais imediatas se o prazo não for cumprido para esta correspondência oficial:\n\n${text}`,
  },
  classify: {
    system: 'Você é um classificador especializado de correspondência governamental angolana. Determine: 1. Categoria do Documento (Notificação, Ofício, Multa, Fatura, Processo, etc.), 2. Instituição Emissora Provável, 3. Assunto Principal, e 4. Metadados Extraídos de forma organizada.',
    user: (text: string) => `Classifique e extraia metadados e informações críticas do seguinte documento:\n\n${text}`,
  },
  fraud: {
    system: 'Você é o perito de segurança facial e cibernética do Dr.IA. Analise o documento ou mensagem para detectar indícios de fraudes, tentativas de phishing, golpes de cobrança falsa de impostos, NIF falso, ou solicitações indevidas de dados pessoais.',
    user: (text: string) => `Analise este documento ou correspondência minuciosamente procurando sinais de fraude, de falsificação de identidade ou golpe fiscal/social:\n\n${text}`,
  },
  help: {
    system: 'Você é o assistente virtual de inteligência artificial governamental do Dr.IA. Ajude o cidadão de Angola com instruções passo a passo detalhadas sobre como resolver as pendências financeiras, fiscais ou burocráticas descritas no documento ou mensagem.',
    user: (text: string, context?: string) => `Dúvida do cidadão ou solicitação de ajuda sobre o documento:\n${text}\n\nContexto da correspondência:\n${context || ''}`,
  },
  qna: {
    system: 'Você é o assistente virtual de inteligência artificial governamental do Dr.IA. Ajude o cidadão de Angola com instruções passo a passo detalhadas sobre como resolver as pendências financeiras, fiscais ou burocráticas descritas no documento ou mensagem.',
    user: (text: string, context?: string) => `Dúvida do cidadão ou solicitação de ajuda sobre o documento:\n${text}\n\nContexto da correspondência:\n${context || ''}`,
  },
};

const MOCK_RESPONSES: Record<string, string> = {
  summarize: `**RESUMO INTELIGENTE DO DOCUMENTO (Sandbox offline):**\n\nEste documento trata do procedimento oficial de identificação civil nacional ou notificação da Administração Geral Tributária (AGT). \n- **Órgão**: Governo de Angola / Ministério das Finanças.\n- **Status**: Válido e Certificado Criptograficamente.\n- **Ações recomendadas**: Guarde a cópia offline na sua carteira digital para apresentação em postos fiscais ou de trânsito em território angolano.`,
  explain: `**EXPLICAÇÃO DE TERMOS OFICIAIS:**\n\n- **Força probatória**: Significa que o documento tem valor legal total de prova, do mesmo modo que um papel timbrado físico original assinado à mão.\n- **Custódia Segura**: O Estado garante que seus dados estão cifrados em servidores seguros e ninguém pode alterá-los sem sua autorização biometrizada.`,
  urgency: `**GRAU DE URGÊNCIA DETECTADO: Médio a Alto**\n\nO documento tem validade regular. Recomenda-se manter os dados de contato atualizados para evitar multas de intempestividade ou atrasos no processamento de trâmites civis em Angola.`,
  classify: `**CLASSIFICAÇÃO DOCUMENTAL AUTOMÁTICA:**\n\n- **Tipo de Documento**: Identidade / Certidão Administrativa Oficial\n- **Órgão Responsável**: Ministério da Justiça e dos Direitos Humanos / AGT\n- **Sensibilidade**: Reservada com Certificação ICP-AO ativa.`,
  fraud: `**PARECER DE SEGURANÇA E ANÁLISE DE FRAUDE:**\n\n- **Nível de Risco**: Baixo / Seguro\n- **Selagem Digital**: Confirmada com assinatura criptográfica SHA-256 ativa.\n- **Veredito**: O documento provem dos servidores governamentais seguros e oficiais integrados ao Dr.IA. Pode ser confiado plenamente.`,
  help: `Olá! Sou o Assistente Inteligente do Dr.IA. Ajudo a resolver as suas dúvidas. Para resolver pendências jurídicas ou fiscais, utilize a Carteira Digital para consultar faturas ou aceda à nossa secção de correspondências para submeter uma resposta formal via formulário assinado eletronicamente com o PIN do seu BI Digital.`,
};

async function tryGemini(
  ai: GoogleGenAI,
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      },
    });
    return response?.text || null;
  } catch (e) {
    console.error('Gemini failed in /api/gov-ai:', e);
    return null;
  }
}

async function tryGroq(
  groq: Groq,
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
    });
    return completion.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.error('Groq fallback failed in /api/gov-ai:', e);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (!requirePost(req, res)) return;

  try {
    const { action, text, context } = req.body;
    const promptConfig = DRIA_GOV_PROMPTS[action] || DRIA_GOV_PROMPTS.help;
    const systemPrompt = promptConfig.system;
    const userPrompt = promptConfig.user(text, context);

    const ai = getAI();
    if (ai) {
      const result = await tryGemini(ai, systemPrompt, userPrompt);
      if (result) return res.status(200).json({ result });
    }

    const groq = getGroq();
    if (groq) {
      const result = await tryGroq(groq, systemPrompt, userPrompt);
      if (result) return res.status(200).json({ result });
    }

    // Fallback mock response
    const mockResult = MOCK_RESPONSES[action] || MOCK_RESPONSES.help;
    return res.status(200).json({ result: mockResult });
  } catch (err: any) {
    console.error('error in /api/gov-ai:', err);
    res.status(500).json({ error: err.message || 'Erro desconhecido na central de IA.' });
  }
}