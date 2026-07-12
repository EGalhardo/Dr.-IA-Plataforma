/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppMode } from '../types';

const INTRO = "Seja muito bem-vindo ao Doctor IA Angola. Uma plataforma de saúde digital inteligente com o objetivo de apoiar os cidadãos e conectar a rede hospitalar nacional. ";

export const PAGE_PRESENTATIONS: Record<AppMode, Record<string, string>> = {
  user: {
    home: INTRO + "Na página Início, a sua central de comando pessoal do Doctor IA. Aqui pode ver as campanhas de saúde pública, destaques sobre primeiros socorros, aceder rapidamente à triagem inteligente por IA e consultar as recomendações adaptadas ao seu estado de saúde.",
    "avaliacao-ia": INTRO + "Na página Avaliação IA, pode iniciar uma conversa interativa por texto ou voz com o assistente inteligente. A IA conduzirá uma entrevista clínica sobre febre, sintomas ou contactos, oferecendo uma triagem preliminar com indicação de prioridade clínica de emergência, muito urgente, urgente, moderada ou leve.",
    hospitais: INTRO + "Na página Hospitais, visualize em tempo real os hospitais integrados ao ecossistema Doctor IA. Pode consultar a distância, ocupação, especialidades clínicas disponíveis e obter rotas rápidas.",
    "historico-consultas": INTRO + "Na página Histórico, aceda ao registo digital seguro de todas as suas avaliações anteriores feitas com a IA do Doctor IA, para acompanhar de forma contínua a evolução dos seus sintomas.",
    "primeiros-socorros": INTRO + "Na página Primeiros Socorros, consulte um guia ilustrado de resposta médica rápida para emergências em casa, como queimaduras, convulsões, cortes e engasgamentos.",
    perfil: INTRO + "Na página Conta, pode atualizar as suas informações de contacto, dados de saúde base, doenças crónicas ou alergias, e configurar opções de segurança do seu perfil digital."
  },
  institution: {
    "hospital-dashboard": INTRO + "No Painel do Hospital, acompanhe métricas consolidadas em tempo real sobre atendimentos ativos, tempos médios de espera e distribuição de prioridades clínicas de emergência.",
    "hospital-pacientes": INTRO + "Na página Pacientes, tenha acesso imediato a todos os pacientes da sua área de influência que realizaram triagem com o Doctor IA. O sistema envia um relatório clínico antecipado que ajuda a organizar antecipadamente os recursos hospitalares, equipamentos de isolamento e equipas de biossegurança.",
    "hospital-historico": INTRO + "Na página Histórico, consulte o registo histórico de todas as admissões e triagens recebidas por este hospital.",
    "hospital-perfil": INTRO + "Na página IA, utilize o assistente clínico inteligente de apoio à decisão médica do hospital para consultar diretrizes clínicas.",
    "hospital-conta": INTRO + "Na página Conta, atualize os dados institucionais do hospital, credenciais profissionais, configurações de utilizadores autorizados e notificações."
  },
  admin: {
    "minsa-dashboard": INTRO + "No Painel Nacional, o Ministério da Saúde acompanha indicadores agregados em tempo real, incluindo total de triagens nacionais, casos críticos detetados, hospitais integrados e focos ativos de alarmes epidemiológicos.",
    "minsa-vigilancia": INTRO + "Na página Vigilância Epidemiológica, acompanhe o mapeamento inteligente georreferenciado e o rastreio automático de surtos locais de doenças de notificação obrigatória como Malária, Cólera ou suspeitas de Ébola.",
    "minsa-hospitals": INTRO + "Na página Hospitais, faça a gestão estratégica e auditoria da capacidade operacional, tempo médio de resposta e recursos humanos da rede nacional de hospitais.",
    "minsa-estatisticas": INTRO + "Na página Estatísticas, analise dados epidemiológicos avançados com base na prevalência de sintomas por região, faixa etária e género.",
    "minsa-relatorios": INTRO + "Na página Relatórios, gere e exporte relatórios consolidados e planos de contingência estratégicos nacionais para apoio a tomadas de decisão governamentais.",
    "minsa-configuracao": INTRO + "Na página Configuração, ajuste parâmetros globais e regras clínicas de funcionamento dos modelos de IA de triagem nacional do Doctor IA.",
    "minsa-conta": INTRO + "Na página Conta, faça a gestão de perfil do administrador central do Ministério da Saúde."
  }
};

export function hasPagePresentation(appMode: AppMode, tab: string | undefined): boolean {
  if (!tab) return false;
  const presentations = PAGE_PRESENTATIONS[appMode];
  return !!presentations && (tab in presentations);
}
