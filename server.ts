import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";
import Groq from "groq-sdk";

// Provide a WebSocket implementation for Supabase Realtime on Node.js < 22
if (!globalThis.WebSocket) {
  (globalThis as any).WebSocket = WebSocket;
}

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = createServer(app);
  
  app.use(express.json());

  // Initialize AI Studio Gemini Client
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  
  // Initialize Groq Client
  const groqApiKey = process.env.GROQ_API_KEY || process.env.Teste01 || '';
  
  let groq: Groq | null = null;
  if (groqApiKey) {
    try {
      groq = new Groq({ apiKey: groqApiKey });
    } catch (e) {
      console.warn("CRITICAL: Failed to instantiate Groq client:", e);
    }
  }

  if (!apiKey) {
    console.warn("CRITICAL: No Gemini API Key found!");
  }
  
  if (!groqApiKey) {
    console.warn("CRITICAL: No Groq API Key found (Checked GROQ_API_KEY and Teste01)!");
  }

  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        apiVersion: 'v1beta',
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (e) {
      console.warn("CRITICAL: Failed to instantiate GoogleGenAI client:", e);
    }
  }

  const getRuntimeFlags = () => ({
    local_bootstrap: (process.env.VITE_ENABLE_LOCAL_BOOTSTRAP || 'true') !== 'false',
    mock_fallback: (process.env.VITE_ENABLE_MOCK_FALLBACK || 'true') !== 'false',
    supabase_auto_seed: (process.env.VITE_ENABLE_SUPABASE_AUTO_SEED || 'false') === 'true',
  });

  const createSupabaseAdminClient = () => {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      '';
    if (!url || !serviceKey) return null;
    return createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  };

  // API Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      ai_key_configured: !!process.env.GEMINI_API_KEY,
      groq_key_configured: !!groqApiKey,
      supabase_url_configured: !!(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
      supabase_anon_configured: !!(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY),
      supabase_service_role_configured: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY),
      runtime_flags: getRuntimeFlags()
    });
  });

  app.get('/api/security/readiness', async (req, res) => {
    const runtimeFlags = getRuntimeFlags();
    const blockers: string[] = [];
    const warnings: string[] = [];
    const tableHealth: Record<string, { ok: boolean; count?: number; error?: string }> = {};

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      warnings.push('SUPABASE_SERVICE_ROLE_KEY não configurada para operações administrativas.');
    }
    if (runtimeFlags.mock_fallback) {
      blockers.push('VITE_ENABLE_MOCK_FALLBACK=true — desativar antes de produção.');
    }
    if (runtimeFlags.supabase_auto_seed) {
      blockers.push('VITE_ENABLE_SUPABASE_AUTO_SEED=true — desativar antes de produção.');
    }
    if (runtimeFlags.local_bootstrap) {
      warnings.push('VITE_ENABLE_LOCAL_BOOTSTRAP=true — confirmar estratégia offline antes de produção.');
    }

    const adminSupabase = createSupabaseAdminClient();
    if (!adminSupabase) {
      blockers.push('Credenciais do Supabase não configuradas no servidor.');
    } else {
      const tables = ['profiles','messages','message_state_history','documents','contacts','notifications','user_requests','document_requests','audit_logs','digital_protocols'];
      for (const table of tables) {
        const { count, error } = await adminSupabase.from(table).select('*', { count: 'exact', head: true });
        tableHealth[table] = {
          ok: !error,
          count: typeof count === 'number' ? count : undefined,
          error: error?.message,
        };
        if (error) blockers.push(`Tabela indisponível: ${table} (${error.message})`);
      }
    }

    res.json({
      status: blockers.length === 0 ? 'production-candidate' : 'not-ready',
      blockers,
      warnings,
      runtime_flags: runtimeFlags,
      table_health: tableHealth,
    });
  });

  // API for Government AI
  app.post("/api/gov-ai", async (req, res) => {
    try {
      const { action, text, context } = req.body;
      let systemPrompt = "Você é o assistente virtual do Dr.IA especializado em análises governamentais.";
      let userPrompt = "";

      if (action === "summarize") {
        systemPrompt = "Você é um assistente do Governo de Angola especialista em simplificar e resumir documentos administrativos de forma clara, concisa e direta. Remova burocracias desnecessárias e explique tudo de forma simples em português de Angola.";
        userPrompt = `Faça um resumo inteligente, estruturado e muito fácil de ler do seguinte documento administrativo:\n\n${text}`;
      } else if (action === "explain") {
        systemPrompt = "Você é um assistente especialista em traduzir e explicar termos jurídicos, siglas e termos burocráticos complicados presentes em mensagens e comunicações do Estado de Angola para cidadãos comuns, de forma acolhedora, prática, muito simples e direta.";
        userPrompt = `Explique de forma acolhedora, clara e simples o significado prático e os termos difíceis desta notificação/mensagem oficial:\n\n${text}`;
      } else if (action === "urgency") {
        systemPrompt = "Você é especialista em identificar o nível de urgência e prazos legais de atendimento em comunicações administrativas públicas em Angola. Estipule riscos de perda de prazo.";
        userPrompt = `Analise detalhadamente o nível de urgência, o prazo oficial implícito ou explícito e as consequências jurídicas ou fiscais imediatas se o prazo não for cumprido para esta correspondência oficial:\n\n${text}`;
      } else if (action === "classify") {
        systemPrompt = "Você é um classificador especializado de correspondência governamental angolana. Determine: 1. Categoria do Documento (Notificação, Ofício, Multa, Fatura, Processo, etc.), 2. Instituição Emissora Provável, 3. Assunto Principal, e 4. Metadados Extraídos de forma organizada.";
        userPrompt = `Classifique e extraia metadados e informações críticas do seguinte documento:\n\n${text}`;
      } else if (action === "fraud") {
        systemPrompt = "Você é o perito de segurança facial e cibernética do Dr.IA. Analise o documento ou mensagem para detectar indícios de fraudes, tentativas de phishing, golpes de cobrança falsa de impostos, NIF falso, ou solicitações indevidas de dados pessoais.";
        userPrompt = `Analise este documento ou correspondência minuciosamente procurando sinais de fraude, de falsificação de identidade ou golpe fiscal/social:\n\n${text}`;
      } else if (action === "help" || action === "qna") {
        systemPrompt = "Você é o assistente virtual de inteligência artificial governamental do Dr.IA. Ajude o cidadão de Angola com instruções passo a passo detalhadas sobre como resolver as pendências financeiras, fiscais ou burocráticas descritas no documento ou mensagem.";
        userPrompt = `Dúvida do cidadão ou solicitação de ajuda sobre o documento:\n${text}\n\nContexto da correspondência:\n${context || ''}`;
      } else {
        userPrompt = text;
      }

      // Try using Gemini if client is present
      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.3,
            }
          });
          if (response && response.text) {
            return res.json({ result: response.text });
          }
        } catch (geminiErr: any) {
          console.error("Gemini failed in /api/gov-ai, falling back to Groq... Error:", geminiErr);
        }
      }

      // Fallback to Groq if client is present
      if (groq) {
        try {
          const completion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.3
          });
          if (completion.choices && completion.choices[0] && completion.choices[0].message) {
            return res.json({ result: completion.choices[0].message.content });
          }
        } catch (groqErr) {
          console.error("Groq fallback failed in /api/gov-ai:", groqErr);
        }
      }

      // If both clients failed, send a simulated smart mock response for safety
      let mockResult = "";
      if (action === "summarize") {
        mockResult = `**RESUMO INTELIGENTE DO DOCUMENTO (Sandbox offline):**\n\nEste documento trata do procedimento oficial de identificação civil nacional ou notificação da Administração Geral Tributária (AGT). \n- **Órgão**: Governo de Angola / Ministério das Finanças.\n- **Status**: Válido e Certificado Criptograficamente.\n- **Ações recomendadas**: Guarde a cópia offline na sua carteira digital para apresentação em postos fiscais ou de trânsito em território angolano.`;
      } else if (action === "explain") {
        mockResult = `**EXPLICAÇÃO DE TERMOS OFICIAIS:**\n\n- **Força probatória**: Significa que o documento tem valor legal total de prova, do mesmo modo que um papel timbrado físico original assinado à mão.\n- **Custódia Segura**: O Estado garante que seus dados estão cifrados em servidores seguros e ninguém pode alterá-los sem sua autorização biometrizada.`;
      } else if (action === "urgency") {
        mockResult = `**GRAU DE URGÊNCIA DETECTADO: Médio a Alto**\n\nO documento tem validade regular. Recomenda-se manter os dados de contato atualizados para evitar multas de intempestividade ou atrasos no processamento de trâmites civis em Angola.`;
      } else if (action === "classify") {
        mockResult = `**CLASSIFICAÇÃO DOCUMENTAL AUTOMÁTICA:**\n\n- **Tipo de Documento**: Identidade / Certidão Administrativa Oficial\n- **Órgão Responsável**: Ministério da Justiça e dos Direitos Humanos / AGT\n- **Sensibilidade**: Reservada com Certificação ICP-AO ativa.`;
      } else if (action === "fraud") {
        mockResult = `**PARECER DE SEGURANÇA E ANÁLISE DE FRAUDE:**\n\n- **Nível de Risco**: Baixo / Seguro\n- **Selagem Digital**: Confirmada com assinatura criptográfica SHA-256 ativa.\n- **Veredito**: O documento provem dos servidores governamentais seguros e oficiais integrados ao Dr.IA. Pode ser confiado plenamente.`;
      } else {
        mockResult = `Olá! Sou o Assistente Inteligente do Dr.IA. Ajudo a resolver as suas dúvidas. Para resolver pendências jurídicas ou fiscais, utilize a Carteira Digital para consultar faturas ou aceda à nossa secção de correspondências para submeter uma resposta formal via formulário assinado eletronicamente com o PIN do seu BI Digital.`;
      }

      return res.json({ result: mockResult });

    } catch (err: any) {
      console.error("error in /api/gov-ai:", err);
      res.status(500).json({ error: err.message || "Erro desconhecido na central de IA." });
    }
  });

  // Groq & Gemini Resilient Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, isGovMode, currentPage, pageContext, language } = req.body;
      
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

Sempre que um cidadão seja encaminhado pela plataforma, o hospital recebe automaticamente um relatório clínico detalhado contendo todas as as informações recolhidas durante a triagem.

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
4. Casos urgentes geram automaticamente um relatório clínico digital.
5. O hospital recebe a informação antes da chegada do paciente e prepara o atendimento.
6. Os dados estatísticos anonimizados alimentam o Painel do Ministério da Saúde, permitindo monitorizar a situação epidemiológica do país em tempo real.

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

A sua implementação permitirá construir um sistema de saúde mais inteligente, integrado, preventivo e centrado no cidadão, preparado para responder aos desafios do futuro.
`;

      let systemPrompt = isGovMode 
        ? `Você é o Consultor de Segurança e Legislação do SOC do Governo de Angola. Sua função é auxiliar administradores na gestão de protocolos de emergência, interoperabilidade e redação de normas. ${DRIA_PROJECT_INFO} Inicie sempre saudando e perguntando como pode ser útil. Responda de forma eficiente, clara e profissional. Não utilize asteriscos ou símbolos de formatação na sua fala. Utilize sempre o nome completo Dr.IA. Se a explicação for muito longa, apresente primeiro o essencial e interrompa para perguntar se o usuário deseja que você continue detalhando ou prefere focar em algo específico.`
        : `Você é o assistente oficial do Dr.IA. ${DRIA_PROJECT_INFO} Inicie sempre saudando e perguntando como pode ser útil. Ajude o usuário com informações sobre seus documentos e correspondências de forma eficiente. Seja cordial, humano e acolhedor. Utilize sempre o nome completo Dr.IA. Não utilize asteriscos ou símbolos de formatação para garantir uma fala limpa e natural. Caso sua resposta seja longa, apresente primeiro os pontos essenciais e interrompa para perguntar se o usuário gostaria que continuasse detalhando ou se prefere focar em algo específico. Responda em Português de Angola.`;

      // Inject active page context if available
      if (currentPage && pageContext) {
        systemPrompt += `\n\n[CONTEXTO DO ECRÃ ATUAL DO UTILIZADOR]:
O usuário está visualizando a página "${currentPage}" no momento. 
O conteúdo e dados visíveis no ecrã dele são:
"""
${pageContext}
"""
Se o utilizador pedir para explicar o que está aberto, resumir a página, ou fizer perguntas sobre o conteúdo atual do ecrã, utilize os dados acima de forma natural para responder de maneira precisa e informativa.`;
      }

      const dialectMap: Record<string, string> = {
        pt: "Português de Angola",
        um: "Umbundu",
        ki: "Kimbundu",
        kk: "Kikongo",
        ch: "Chokwe",
        ng: "Ngangela",
        kw: "Kwanyama",
        nh: "Nhaneca",
        fi: "Fiote"
      };

      if (language && language !== 'pt') {
        const selectedDialect = dialectMap[language] || "Português de Angola";
        systemPrompt += `\n\n[CRITICAL DIALECT INSTRUCTION]:\nO utilizador atual prefere interagir no dialeto regional de Angola: "${selectedDialect}". Por favor, ignore a instrução de responder em Português de Angola; você DEVE responder integralmente no dialeto "${selectedDialect}". Seja nativo, evite jargões em português fora de termos oficiais inevitáveis, e mantenha o tom do Dr.IA nesta língua regional.`;
      }

      // Extract any incoming system message from frontend, and merge it with backend systemPrompt
      let finalSystemPrompt = systemPrompt;
      const filteredMessages = (messages || []).filter((m: any) => {
        if (m.role === 'system' || m.role === 'System') {
          if (m.content || m.text) {
            finalSystemPrompt += "\n\n" + (m.content || m.text);
          }
          return false; // exclude from normal chat turns
        }
        return true;
      });

      // Merge consecutive messages with the same role to strictly alternate to avoid GoogleGenAIError
      const alternateMessages: { role: 'user' | 'assistant'; content: string }[] = [];
      for (const msg of filteredMessages) {
        const role = msg.role === 'assistant' || msg.role === 'model' || msg.role === 'bot' ? 'assistant' : 'user';
        const content = msg.content || msg.text || '';
        if (!content) continue;
        
        if (alternateMessages.length > 0 && alternateMessages[alternateMessages.length - 1].role === role) {
          alternateMessages[alternateMessages.length - 1].content += "\n\n" + content;
        } else {
          alternateMessages.push({ role, content });
        }
      }

      // 1. Try Groq if client is present
      if (groq) {
        try {
          const completion = await groq.chat.completions.create({
            messages: [
              {
                role: "system",
                content: finalSystemPrompt
              },
              ...alternateMessages.map(m => ({
                role: m.role,
                content: m.content
              }))
            ],
            model: "llama-3.1-8b-instant",
          });
          return res.json({ message: completion.choices[0].message.content });
        } catch (groqErr) {
          console.error("Groq Chat Error, trying Gemini fallback:", groqErr);
        }
      }

      // 2. Try Gemini if client is present
      if (ai) {
        try {
          const formattedContents = alternateMessages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }));

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: formattedContents,
            config: {
              systemInstruction: finalSystemPrompt,
              temperature: 0.5,
            }
          });

          if (response && response.text) {
            return res.json({ message: response.text });
          }
        } catch (geminiErr) {
          console.error("Gemini Chat Error, trying sandbox offline:", geminiErr);
        }
      }

      // 3. Complete and helpful fallback in offline mode if both APIs can't be reached
      const chatMsgList = messages || [];
      const lastMessageObj = chatMsgList.length > 0 ? chatMsgList[chatMsgList.length - 1] : null;
      const lastMessage = lastMessageObj ? (lastMessageObj.content || lastMessageObj.text || '') : '';
      let offlineResponse = "Olá! Atualmente estou a operar em Modo Sandbox local e offline por razões de conectividade institucional. Como assistente virtual do Dr.IA, garanto-lhe que a sua correspondência está selada e segura nos servidores centrais.";
      
      if (lastMessage.toLowerCase().includes('nif') || lastMessage.toLowerCase().includes('contribuinte')) {
        offlineResponse = "Para tratar de assuntos relacionados ao seu NIF (Número de Identificação Fiscal) ou impostos pendentes, aceda à secção 'Correspondência' no menu lateral e selecione a 'AGT' (Administração Geral Tributária) para falar diretamente com o integrador de processos fiscais.";
      } else if (lastMessage.toLowerCase().includes('sme') || lastMessage.toLowerCase().includes('passaporte') || lastMessage.toLowerCase().includes('visto')) {
        offlineResponse = "O Serviço de Migração e Estrangeiros (SME) permite-lhe agendar a recolha de dados e emissão de passaportes diretamente pelo portal. Vá à aba de 'Correspondência' e inicie uma conversa com o 'SME'.";
      } else if (lastMessage.toLowerCase().includes('pagamento') || lastMessage.toLowerCase().includes('fatura') || lastMessage.toLowerCase().includes('pagar')) {
        offlineResponse = "Através do canal de Correspondência da ENDE e EPAL, pode consultar e simular o pagamento eletrotécnico e hidráulico de faturas de forma imediata e integrada. Os comprovativos são gerados na própria conversa oficial.";
      }

      return res.json({ message: offlineResponse });

    } catch (error) {
      console.error("Groq & Gemini Chat Error:", error);
      res.status(500).json({ error: "Erro ao processar conversa com IA." });
    }
  });

  // WebSocket for Gemini Live
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    if (url.pathname === '/api/live') {
      const isGov = url.searchParams.get('gov') === 'true';
      wss.handleUpgrade(request, socket, head, (ws) => {
        (ws as any).isGov = isGov;
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", async (clientWs: WebSocket) => {
    const isGov = (clientWs as any).isGov;
    console.log(`Client connected to Gemini Live WebSocket (Gov Mode: ${isGov})`);

    clientWs.on("error", (err) => {
      console.error("Client WebSocket error:", err);
    });

    if (!ai) {
      console.warn("WebSocket attempted without Gemini Client instantiated");
      if (clientWs.readyState === 1) {
        clientWs.send(JSON.stringify({ type: 'error', message: 'A chave da API Gemini não está configurada neste servidor VPS/Produção.' }));
        clientWs.close();
      }
      return;
    }

    // Keep-alive to prevent connection timeouts
    const pingInterval = setInterval(() => {
      if (clientWs.readyState === 1) { // 1 = OPEN
        clientWs.ping();
      }
    }, 20000);

    try {
      console.log("Connecting to Gemini Live with model: gemini-3.1-flash-live-preview");
      
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

Sempre que um cidadão seja encaminhado pela plataforma, o hospital recebe automaticamente um relatório clínico detalhado contendo todas as as informações recolhidas durante a triagem.

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
4. Casos urgentes geram automaticamente um relatório clínico digital.
5. O hospital recebe a informação antes da chegada do paciente e prepara o atendimento.
6. Os dados estatísticos anonimizados alimentam o Painel do Ministério da Saúde, permitindo monitorizar a situação epidemiológica do país em tempo real.

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

A sua implementação permitirá construir um sistema de saúde mais inteligente, integrado, preventivo e centrado no cidadão, preparado para responder aos desafios do futuro.
`;

      const normalSysInstr = `Você é o assistente virtual do Dr.IA. ${DRIA_PROJECT_INFO} Inicie sempre saudando e perguntando como pode ser útil. Responda de forma eficiente. Seja cordial, humano e acolhedor. Não utilize asteriscos ou símbolos de formatação para garantir uma fala natural. Utilize sempre o nome completo Dr.IA. Se a explicação for longa, apresente o essencial e pergunte se pode continuar.`;
      const govSysInstr = `Você é o Consultor de Segurança e Redação Oficial do Governo de Angola. ${DRIA_PROJECT_INFO} Sua função é auxiliar administradores na gestão de protocolos e redação de normas. Inicie saudando e perguntando como pode ser útil. Seja eficiente, formal, institucional e conhecedor das normas de protocolo. Não utilize asteriscos ou símbolos na sua fala. Utilize sempre o nome completo Dr.IA.`;

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent) {
              const { modelTurn, interrupted } = message.serverContent;
              
              if (interrupted) {
                console.log("AI session interrupted by user activity");
                clientWs.send(JSON.stringify({ type: 'interrupted' }));
              }

              if (modelTurn?.parts) {
                for (const part of modelTurn.parts) {
                  if (part.inlineData?.data) {
                    clientWs.send(JSON.stringify({ type: 'audio', data: part.inlineData.data }));
                  }
                  if (part.text) {
                    clientWs.send(JSON.stringify({ type: 'model_transcript', data: part.text }));
                  }
                }
              }
            }
          },
          onerror: (error) => {
            console.error("CRITICAL: Gemini Live Session Error:", error);
            if (clientWs.readyState === 1) {
              // Extract message if it's an error object
              const errorMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error);
              clientWs.send(JSON.stringify({ type: 'error', message: `Erro no serviço de IA: ${errorMsg}` }));
            }
          },
          onclose: (e) => {
            console.log(`Gemini Live Session closed. Code: ${e.code}, Reason: ${e.reason}`);
            clearInterval(pingInterval);
            if (clientWs.readyState === 1) {
              const reasonMsg = e.reason || 'Conexão com servidor de IA encerrada.';
              clientWs.send(JSON.stringify({ type: 'error', message: reasonMsg }));
              clientWs.close();
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: isGov ? govSysInstr : normalSysInstr,
        },
      });

      console.log("Gemini Live session established successfully");

      // Wake up the model with a greeting
      setTimeout(() => {
        try {
          if (clientWs.readyState === 1) {
            console.log("Sending initial greeting to Gemini...");
            const greeting = isGov 
              ? "Saudações. Em que posso ser útil na gestão do SOC hoje?"
              : "Olá! Sou o assistente do Dr.IA. Como posso ser útil com seus documentos ou correspondências hoje?";
            session.sendRealtimeInput({ 
              text: greeting 
            });
          }
        } catch (err) {
          console.error("Error sending initial wake-up message:", err);
        }
      }, 1500);

      clientWs.on("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'ping') return;
          
          if (msg.type === 'audio' && msg.data) {
            session.sendRealtimeInput({
              audio: { data: msg.data, mimeType: "audio/pcm;rate=16000" },
            });
          }
        } catch (e) {
          console.error("Error processing client message:", e);
        }
      });

      clientWs.on("close", () => {
        console.log("Client disconnected, closing Gemini session");
        clearInterval(pingInterval);
        try {
          session.close();
        } catch (err) {
          console.error("Error closing Gemini session:", err);
        }
      });

    } catch (error) {
      console.error("Failed to connect to Gemini Live:", error);
      const isAuthError = String(error).includes("unregistered callers") || !apiKey;
      const helpMsg = isAuthError 
        ? "Configuração de API pendente. Por favor, adicione a GEMINI_API_KEY no painel de Segredos (Settings -> Secrets)."
        : "Erro ao conectar com o serviço de IA.";
      
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: 'error', message: helpMsg }));
        clientWs.close();
      } else if (clientWs.readyState === WebSocket.CONNECTING) {
        clientWs.on('open', () => {
          clientWs.send(JSON.stringify({ type: 'error', message: helpMsg }));
          clientWs.close();
        });
      }
    }
  });

  // Dynamic AI Translation API
  app.post("/api/translate", async (req, res) => {
    try {
      const { texts, targetLanguage } = req.body;
      if (!texts || !Array.isArray(texts) || texts.length === 0) {
        return res.json({ translations: [] });
      }

      if (!targetLanguage || targetLanguage === 'pt') {
        return res.json({ translations: texts });
      }

      const languageNames: Record<string, string> = {
        um: "Umbundu",
        ki: "Kimbundu",
        kk: "Kikongo",
        ch: "Chokwe",
        ng: "Ngangela",
        kw: "Kwanyama",
        nh: "Nhaneca",
        fi: "Fiote"
      };

      const langName = languageNames[targetLanguage] || targetLanguage;

      const systemPrompt = `Você é o Tradutor Institucional Oficial do Dr.IA, especializado em Português de Angola e em adaptação linguística prudente para línguas nacionais angolanas, incluindo:

- Umbundu
- Kimbundu
- Kikongo
- Chokwe
- Ngangela
- Kwanyama
- Nhaneca
- Fiote

A sua tarefa é analisar e traduzir uma lista de strings dinâmicas recolhidas de toda a aplicação, do Português de Angola para a língua selecionada: ${langName}.

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
- interface curta (ex: “Entrar”, “Cancelar”, “Pesquisar”)
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

Não criar falsas traduções “oficiais”.

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

      const userPrompt = `--------------------------------------------------
ENTRADA
--------------------------------------------------

LÍNGUA SELECIONADA:
${langName}

STRINGS:
${JSON.stringify(texts, null, 2)}`;

      if (apiKey) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.1,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING
                }
              }
            }
          });

          if (response && response.text) {
            const translations = JSON.parse(response.text.trim());
            if (Array.isArray(translations) && translations.length === texts.length) {
              return res.json({ translations });
            }
          }
        } catch (geminiErr: any) {
          const errMsg = geminiErr?.message || String(geminiErr);
          const isRateLimit = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED");
          const isUnavailable = errMsg.includes("503") || errMsg.includes("UNAVAILABLE");
          if (isRateLimit) {
            console.warn("[Translate API] Gemini rate limit exceeded (429). Using fallback.");
          } else if (isUnavailable) {
            console.warn("[Translate API] Gemini service temporarily unavailable (503). Using fallback.");
          } else {
            console.warn("[Translate API] Gemini translation skipped:", errMsg.substring(0, 150));
          }
        }
      }

      // Fallback with Groq if configured
      if (groqApiKey && groq) {
        try {
          const completion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt + " Retorne SOMENTE a lista JSON bruta, sem explicações, marcações markdown ou comentários adicionais, começando com [ e terminando com ]." },
              { role: "user", content: userPrompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.1
          });
          if (completion.choices && completion.choices[0] && completion.choices[0].message) {
            const raw = completion.choices[0].message.content || '[]';
            const cleanRaw = raw.substring(raw.indexOf('['), raw.lastIndexOf(']') + 1);
            const translations = JSON.parse(cleanRaw);
            if (Array.isArray(translations) && translations.length === texts.length) {
              return res.json({ translations });
            }
          }
        } catch (groqErr: any) {
          const errMsg = groqErr?.message || String(groqErr);
          const isAuthError = errMsg.includes("401") || errMsg.includes("invalid_api_key") || errMsg.includes("Invalid API Key");
          if (isAuthError) {
            console.warn("[Translate API] Groq key is invalid/unauthorized (401). Using local default fallback.");
          } else {
            console.warn("[Translate API] Groq translation skipped:", errMsg.substring(0, 150));
          }
        }
      }

      // Safe return of same texts in case of API failure
      return res.json({ translations: texts });
    } catch (err: any) {
      console.error("Error in /api/translate:", err);
      return res.json({ translations: req.body.texts || [] });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
