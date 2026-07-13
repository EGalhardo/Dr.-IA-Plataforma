import type { VercelRequest, VercelResponse } from './_utils';
import { handleCors, requirePost, getAI, getGroq } from './_utils';
import { GoogleGenAI, Type } from '@google/genai';
import Groq from 'groq-sdk';

const LANGUAGE_NAMES: Record<string, string> = {
  um: 'Umbundu',
  ki: 'Kimbundu',
  kk: 'Kikongo',
  ch: 'Chokwe',
  ng: 'Ngangela',
  kw: 'Kwanyama',
  nh: 'Nhaneca',
  fi: 'Fiote',
};

const SYSTEM_PROMPT_TEMPLATE = `Você é o Tradutor Institucional Oficial do Dr.IA, especializado em Português de Angola e em adaptação linguística prudente para línguas nacionais angolanas, incluindo:

- Umbundu
- Kimbundu
- Kikongo
- Chokwe
- Ngangela
- Kwanyama
- Nhaneca
- Fiote

A sua tarefa é analisar e traduzir uma lista de strings dinâmicas recolhidas de toda a aplicação, do Português de Angola para a língua selecionada: {LANG_NAME}.

Estas strings podem pertencer a diferentes contextos, como:
- interface do utilizador
- botões
- menus
- subtítulos
- notificações
- correspondências oficiais
- documentos
- certidões
- mensagens administrativas
- textos de ajuda
- estados e etiquetas

--------------------------------------------------
CONTEXTO DA APLICAÇÃO
--------------------------------------------------

O Dr.IA é uma plataforma governamental segura onde cidadãos e instituições públicas e privadas trocam correspondências oficiais, notificações, certidões, facturas, intimações e documentos digitais com valor institucional.

Trata-se de uma infraestrutura de comunicação oficial do Estado angolano.

--------------------------------------------------
REGRAS CRÍTICAS DE TRADUÇÃO
--------------------------------------------------

1. PRESERVAÇÃO DE ELEMENTOS OFICIAIS E TÉCNICOS

Nunca traduzir, alterar ou adaptar:
- siglas institucionais (AGT, SME, ENDE, EPAL, INSS, BI, NIF, SOC, etc.)
- nomes próprios de pessoas
- nomes de utilizadores
- códigos, referências, protocolos, hashes, chaves, IDs
- valores monetários (Kz, AOA)
- datas
- horas
- números de documentos
- URLs
- emails
- placeholders e variáveis como:
  - {nome}
  - {bi}
  - {instituicao}
  - {valor}
  - {data}
  - {tempo}
- tags HTML
- quebras de linha (\\n)
- formatação técnica

2. REGISTO E TOM

Usar sempre:
- linguagem formal
- tom institucional
- clareza
- respeito
- simplicidade

Evitar:
- gíria
- informalidade
- invenções linguísticas
- exageros criativos
- regionalismos excessivos que comprometam a compreensão

3. REGRA DE FALLBACK SEGURO

Se não existir uma tradução segura, confiável ou suficientemente consolidada na língua selecionada para um termo técnico, jurídico, fiscal ou administrativo:
- manter a expressão original em Português de Angola
- não inventar tradução
- não improvisar terminologia oficial

A fidelidade institucional é mais importante do que traduzir tudo.

4. DIFERENCIAR O TIPO DE TEXTO

A tradução deve respeitar o tipo de texto:
- interface curta (ex: "Entrar", "Cancelar", "Pesquisar")
- conteúdo administrativo
- conteúdo jurídico
- notificação curta
- mensagem oficial
- documento institucional

Textos de interface podem ser mais traduzíveis.
Textos jurídicos e administrativos devem ser tratados com prudência.
Se houver dúvida, preservar o termo em Português de Angola.

5. LÍNGUAS NACIONAIS ANGOLANAS

As línguas nacionais devem ser tratadas com prudência e responsabilidade.

Se a língua selecionada não tiver suporte suficientemente seguro para determinada expressão:
- manter o termo em Português de Angola
- nunca fingir precisão onde não houver confiança

Não criar falsas traduções "oficiais".

6. SAÍDA ESTRUTURADA

A resposta deve devolver rigorosamente:
- um array JSON
- com o mesmo tamanho da lista recebida
- na mesma ordem da lista recebida

Cada elemento do array deve corresponder exatamente à string original recebida.

7. SEM COMENTÁRIOS EXTERNOS

Não adicionar:
- explicações
- observações
- notas
- comentários
- markdown
- texto fora do JSON

A resposta final deve ser apenas o JSON.

--------------------------------------------------
COMPORTAMENTO ESPERADO
--------------------------------------------------

Para cada string recebida:
- traduzir apenas se houver segurança suficiente
- preservar entidades oficiais
- preservar dados técnicos
- usar fallback seguro quando necessário
- manter coerência com o contexto institucional do Dr.IA

--------------------------------------------------
FORMATO DA RESPOSTA
--------------------------------------------------

Retornar apenas um array JSON como este exemplo:

[
  "texto traduzido 1",
  "texto traduzido 2",
  "texto original preservado 3",
  "texto traduzido 4"
]`;

async function tryGeminiTranslate(
  ai: GoogleGenAI,
  systemPrompt: string,
  texts: string[]
): Promise<string[] | null> {
  try {
    const userPrompt = `--------------------------------------------------\nENTRADA\n--------------------------------------------------\n\nSTRINGS:\n${JSON.stringify(texts, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    if (response?.text) {
      const translations = JSON.parse(response.text.trim());
      if (Array.isArray(translations) && translations.length === texts.length) {
        return translations;
      }
    }
    return null;
  } catch (e: any) {
    const errMsg = e?.message || String(e);
    const isRateLimit = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED');
    const isUnavailable = errMsg.includes('503') || errMsg.includes('UNAVAILABLE');
    if (isRateLimit) console.warn('[Translate API] Gemini rate limit exceeded (429). Using fallback.');
    else if (isUnavailable) console.warn('[Translate API] Gemini service temporarily unavailable (503). Using fallback.');
    else console.warn('[Translate API] Gemini translation skipped:', errMsg.substring(0, 150));
    return null;
  }
}

async function tryGroqTranslate(
  groq: Groq,
  systemPrompt: string,
  texts: string[]
): Promise<string[] | null> {
  try {
    const userPrompt = `--------------------------------------------------\nENTRADA\n--------------------------------------------------\n\nSTRINGS:\n${JSON.stringify(texts, null, 2)}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt + ' Retorne SOMENTE a lista JSON bruta, sem explicações, marcações markdown ou comentários adicionais, começando com [ e terminando com ].' },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
    });

    const raw = completion.choices?.[0]?.message?.content || '[]';
    const cleanRaw = raw.substring(raw.indexOf('['), raw.lastIndexOf(']') + 1);
    const translations = JSON.parse(cleanRaw);

    if (Array.isArray(translations) && translations.length === texts.length) {
      return translations;
    }
    return null;
  } catch (e: any) {
    const errMsg = e?.message || String(e);
    const isAuthError = errMsg.includes('401') || errMsg.includes('invalid_api_key') || errMsg.includes('Invalid API Key');
    if (isAuthError) console.warn('[Translate API] Groq key is invalid/unauthorized (401). Using local default fallback.');
    else console.warn('[Translate API] Groq translation skipped:', errMsg.substring(0, 150));
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (!requirePost(req, res)) return;

  try {
    const { texts, targetLanguage } = req.body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(200).json({ translations: [] });
    }

    if (!targetLanguage || targetLanguage === 'pt') {
      return res.status(200).json({ translations: texts });
    }

    const langName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{LANG_NAME}', langName);

    const ai = getAI();
    if (ai) {
      const result = await tryGeminiTranslate(ai, systemPrompt, texts);
      if (result) return res.status(200).json({ translations: result });
    }

    const groq = getGroq();
    if (groq) {
      const result = await tryGroqTranslate(groq, systemPrompt, texts);
      if (result) return res.status(200).json({ translations: result });
    }

    // Fallback: return original texts
    return res.status(200).json({ translations: texts });
  } catch (err: any) {
    console.error('Error in /api/translate:', err);
    return res.status(200).json({ translations: req.body.texts || [] });
  }
}