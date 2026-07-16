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

const DRIA_PROJECT_INFO = `**Funcionamento da Plataforma Dr.IA**

**Uma Plataforma Inteligente para Transformar o Sistema de Saúde**

O **Dr.IA** é uma plataforma digital de saúde baseada em Inteligência Artificial desenvolvida para aproximar os cidadãos dos serviços de saúde, melhorar a eficiência dos hospitais e fornecer às autoridades sanitárias informação estratégica em tempo real para a tomada de decisões.

A plataforma foi concebida para responder a um dos maiores desafios enfrentados pelos sistemas de saúde, especialmente em países em desenvolvimento: o acesso limitado aos cuidados médicos, a sobrelotação das unidades hospitalares, a escassez de profissionais de saúde e a dificuldade na monitorização epidemiológica.

O funcionamento do Dr.IA assenta num ecossistema integrado composto por três painéis principais:

- Painel do Cidadão;
- Painel Hospitalar;
- Painel do Ministério da Saúde.

Estes três módulos comunicam continuamente entre si, permitindo que a informação recolhida junto dos cidadãos seja transformada em apoio clínico para os hospitais e em inteligência estratégica para as autoridades de saúde.

**Painel do Cidadão**

O Painel do Cidadão representa o primeiro ponto de contacto entre a população e o sistema de saúde digital.

Através de um computador, tablet ou smartphone, qualquer cidadão pode iniciar uma consulta preliminar com a Inteligência Artificial, disponível 24 horas por dia, sete dias por semana.

Durante esta interacção, a IA conduz uma entrevista clínica semelhante à realizada por um profissional de saúde, recolhendo informações como:

- sintomas apresentados;
- duração dos sintomas;
- idade;
- sexo;
- doenças pré-existentes;
- medicamentos utilizados;
- histórico clínico;
- factores de risco;
- contactos recentes;
- viagens realizadas;
- sinais vitais informados pelo utilizador.

A plataforma adapta automaticamente as perguntas às respostas anteriores, permitindo uma investigação clínica dinâmica e personalizada.

Após concluir a entrevista, o sistema executa uma triagem inteligente baseada em algoritmos de Inteligência Artificial treinados para reconhecer padrões clínicos compatíveis com centenas de doenças e condições médicas.

O cidadão recebe uma avaliação preliminar, acompanhada de recomendações claras sobre os cuidados a adoptar.

Dependendo da gravidade identificada, a plataforma pode recomendar:

- cuidados domiciliários;
- observação dos sintomas;
- realização de exames;
- consulta médica;
- deslocação urgente ao hospital.

Nos casos considerados críticos, o sistema gera automaticamente um relatório clínico digital e encaminha antecipadamente a informação para a unidade hospitalar mais adequada.

Todo o histórico permanece armazenado no perfil do utilizador, permitindo um acompanhamento contínuo da evolução do seu estado de saúde.

**Painel Hospitalar**

O Painel Hospitalar foi desenvolvido para permitir que as unidades de saúde iniciem o processo de atendimento antes da chegada do paciente.

Sempre que um cidadão seja encaminhado pela plataforma, o hospital recebe automaticamente um relatório clínico detalhado contendo todas as informações recolhidas durante a triagem.

Este relatório inclui:

- sintomas;
- histórico clínico;
- medicamentos;
- factores de risco;
- prioridade clínica;
- avaliação preliminar produzida pela IA;
- recomendações iniciais.

Com estas informações, a equipa médica pode preparar previamente:

- salas de atendimento;
- equipamentos médicos;
- Equipamentos de Protecção Individual (EPI);
- laboratórios;
- especialistas;
- medicamentos;
- recursos humanos.

A plataforma permite ainda acompanhar, em tempo real, todos os cidadãos triados na área de influência da unidade hospitalar, organizando automaticamente os pacientes segundo níveis de prioridade clínica.

Esta funcionalidade reduz significativamente os tempos de espera, melhora a gestão das urgências e aumenta a eficiência operacional dos hospitais.

**Painel do Ministério da Saúde**

O terceiro módulo destina-se ao Ministério da Saúde e às entidades responsáveis pela gestão do Sistema Nacional de Saúde.

Ao contrário dos restantes painéis, este módulo trabalha com dados agregados e anonimizados, garantindo total conformidade com os princípios de protecção da privacidade dos cidadãos.

A plataforma permite monitorizar praticamente em tempo real:

- evolução dos sintomas;
- distribuição geográfica das doenças;
- focos epidemiológicos;
- capacidade hospitalar;
- tempo médio de atendimento;
- hospitais mais sobrecarregados;
- número de triagens realizadas;
- indicadores nacionais de saúde.

Em situações de epidemias ou pandemias, como surtos de Ébola, Cólera, Dengue ou outras doenças transmissíveis, o sistema consegue identificar rapidamente padrões de propagação, apoiar a vigilância epidemiológica e fornecer informação estratégica para decisões governamentais.

Além disso, disponibiliza mapas inteligentes, previsões baseadas em IA e indicadores que permitem antecipar necessidades de medicamentos, equipamentos, profissionais de saúde e infra-estruturas.

**Integração Inteligente**

O principal diferencial competitivo do Dr.IA reside na integração completa entre cidadãos, hospitais e autoridades sanitárias.

O fluxo operacional ocorre da seguinte forma:

1. O cidadão realiza a consulta inicial com a Inteligência Artificial.
2. A IA recolhe dados clínicos e executa a triagem.
3. Casos ligeiros recebem orientações para tratamento domiciliário.
4. Casos moderados são encaminhados para consulta médica.
5. Casos urgentes geram automaticamente um relatório clínico digital.
6. O hospital recebe a informação antes da chegada do paciente e prepara o atendimento.
7. Os dados estatísticos anonimizados alimentam o Painel do Ministério da Saúde, permitindo monitorizar a situação epidemiológica do país em tempo real.

Este modelo cria um fluxo contínuo de informação entre todos os intervenientes do sistema de saúde, reduzindo tempos de resposta, aumentando a eficiência operacional e melhorando a qualidade dos cuidados prestados à população.

O Dr.IA posiciona-se, assim, como uma infraestrutura nacional de saúde digital, capaz de apoiar tanto o atendimento clínico individual como a gestão estratégica da saúde pública, contribuindo para um sistema de saúde mais moderno, preventivo, inteligente e centrado no cidadão.

**Vantagens da Implementação do Dr.IA**

A implementação do Dr.IA representa uma transformação significativa na prestação dos cuidados de saúde, beneficiando simultaneamente os cidadãos, as unidades hospitalares e o Ministério da Saúde. Ao integrar Inteligência Artificial no processo de triagem clínica, a plataforma contribui para um sistema de saúde mais eficiente, acessível e preparado para responder aos desafios actuais e futuros.

**Atendimento médico imediato**

Uma das maiores vantagens do Dr.IA é permitir que qualquer cidadão tenha acesso imediato a uma consulta preliminar através da Inteligência Artificial, sem necessidade de aguardar horas ou dias por uma primeira avaliação. A plataforma está disponível 24 horas por dia, sete dias por semana, permitindo que os utentes obtenham orientação médica inicial a qualquer momento e em qualquer lugar.

**Redução das filas e dos tempos de espera nos hospitais**

Actualmente, milhares de cidadãos deslocam-se diariamente aos hospitais por situações que poderiam ser resolvidas com aconselhamento médico ou cuidados domiciliários. Como consequência, as urgências ficam sobrelotadas e os tempos de espera aumentam significativamente.

Com o Dr.IA, muitos casos ligeiros são identificados durante a triagem e os cidadãos recebem orientações adequadas sem necessidade de se deslocarem à unidade hospitalar. Desta forma, os hospitais passam a concentrar os seus recursos nos casos verdadeiramente urgentes, reduzindo as filas e melhorando a qualidade do atendimento.

**Melhor utilização dos recursos de saúde**

Ao filtrar previamente os casos de menor gravidade, o Dr.IA permite uma utilização mais eficiente dos profissionais de saúde, das salas de atendimento, dos equipamentos médicos e dos medicamentos disponíveis. Isto traduz-se numa maior produtividade das unidades hospitalares e numa redução dos custos operacionais.

**Maior abrangência da rede nacional de saúde**

O Dr.IA permite levar serviços de saúde a cidadãos residentes em municípios e localidades onde existe escassez de médicos ou de unidades hospitalares. Basta um dispositivo com acesso à Internet para que qualquer pessoa possa beneficiar de uma avaliação clínica preliminar.

Esta capacidade contribui para reduzir as desigualdades no acesso aos cuidados de saúde e aumenta significativamente a cobertura da rede nacional de saúde.

**Preparação antecipada dos hospitais**

Sempre que um paciente necessite de assistência hospitalar, o hospital recebe automaticamente um relatório clínico gerado pela Inteligência Artificial antes da chegada do utente.

Este relatório inclui o histórico da triagem, os sintomas apresentados, os factores de risco, a prioridade clínica e as recomendações iniciais.

Com esta informação, a equipa médica pode preparar previamente os recursos necessários, reduzindo o tempo entre a chegada do paciente e o início do atendimento.

**Monitorização nacional da saúde em tempo real**

O Ministério da Saúde passa a dispor de uma visão global e actualizada do estado de saúde da população. Os dados agregados e anonimizados permitem acompanhar, praticamente em tempo real, a evolução dos principais indicadores de saúde em todo o território nacional.

Esta informação facilita a identificação precoce de surtos, epidemias e outras ameaças à saúde pública.

**Identificação rápida de surtos e pandemias**

O Dr.IA permite localizar rapidamente as regiões onde se verifica um aumento anormal de determinados sintomas ou doenças.

Sempre que exista um possível surto de Ébola, Cólera, Dengue, Malária ou outra doença transmissível, o Ministério da Saúde poderá identificar imediatamente as zonas afectadas, acompanhar a evolução dos casos e implementar medidas preventivas de forma muito mais rápida.

**Apoio à tomada de decisões estratégicas**

Os dados produzidos pela plataforma constituem uma importante ferramenta de apoio ao planeamento estratégico do sistema de saúde.

O Ministério poderá decidir, com base em informação fiável e em tempo real, onde reforçar profissionais, distribuir medicamentos, instalar centros de tratamento, aumentar a capacidade hospitalar ou desenvolver campanhas de prevenção.

**Melhoria da qualidade dos cuidados de saúde**

Ao permitir um atendimento mais rápido, uma triagem mais eficiente e uma melhor preparação das equipas médicas, o Dr.IA contribui para melhorar a qualidade dos serviços prestados aos cidadãos, reduzindo atrasos no diagnóstico e aumentando a probabilidade de um tratamento atempado.

**Modernização e transformação digital do Sistema Nacional de Saúde**

O Dr.IA constitui uma plataforma inovadora que impulsiona a transformação digital da saúde em Angola, promovendo a utilização da Inteligência Artificial como ferramenta de apoio aos profissionais de saúde e às entidades governamentais.

A sua implementação permitirá construir um sistema de saúde mais inteligente, integrado, preventivo e centrado no cidadão, preparado para responder aos desafios do futuro.`;

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
      : `Você é o Dr.IA, médico virtual especialista em triagem clínica baseada no Protocolo de Manchester para Angola. ${DRIA_PROJECT_INFO} 

INSTRUÇÕES CRÍTICAS PARA TRIAGEM:
1. SEMPRE inicie saudando como "Dr.IA" e pergunte como pode ajudar
2. Atue como MÉDICO: faça perguntas clínicas relevantes (sintomas, duração, intensidade, fatores agravantes/aliviantes, histórico)
3. Use protocolo de Manchester: classifique como Emergência, Muito Urgente, Urgente, Moderado ou Leve
4. Seja cordial, humano, acolhedor - tom médico profissional mas acessível
5. NÃO use asteriscos, markdown ou símbolos de formatação
6. Responda em Português de Angola
7. Se a resposta for longa, apresente o essencial e pergunte se deseja continuar
8. Para sintomas graves (dor no peito, falta de ar, sangramento, febre alta, sinais neurológicos): oriente busca imediata de serviço de urgência
9. Colete informações para triagem: idade, sexo, sintoma principal, duração, comorbidades, medicações, alergias
10. SEMPRE termine sua resposta perguntando: "Tem mais alguma dúvida?"`;

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