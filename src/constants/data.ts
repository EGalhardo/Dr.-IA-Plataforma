/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Message, Document, Contact, Slide, AppNotification } from '../types';
import { 
  MOCK_CORRESPONDENCES, 
  MOCK_INSTITUTIONAL_INBOX, 
  MOCK_SENT_MESSAGES, 
  MOCK_DOCUMENTS, 
  MOCK_CONTACTS, 
  MOCK_NOTIFICATIONS,
  MOCK_SESSION_USER
} from './mocks';

// Re-export the consistent domains under standard names for backwards compatibility
export const INBOX: Message[] = MOCK_CORRESPONDENCES;
export const INSTITUTIONAL_INBOX: Message[] = MOCK_INSTITUTIONAL_INBOX;
export const SENT_MESSAGES: Message[] = MOCK_SENT_MESSAGES;
export const DOCUMENTS: Document[] = MOCK_DOCUMENTS;
export const INITIAL_CONTACTS: Contact[] = MOCK_CONTACTS;
export const NOTIFICATIONS: AppNotification[] = MOCK_NOTIFICATIONS;
export const USER_PROFILE_PHOTO = MOCK_SESSION_USER.avatarUrl;

// Verification slides used across the platform and parsed by the background preloader
export const HIGHLIGHT_SLIDES: Slide[] = [
  {
    id: 1,
    title: "Primeiros Socorros Imediatos",
    subtitle: "Muitos cidadãos fazem quilómetros até ao hospital para depois esperar em longas filas. O DR.IA resolve isso dando apoio de primeiros socorros imediato.",
    image: "https://i.postimg.cc/RZpkSWsm/1.png",
    mobileImage: "https://i.postimg.cc/RZpkSWsm/1.png",
    btn: "Iniciar Triagem",
    action: "home"
  },
  {
    id: 2,
    title: "Triagem Inteligente com IA",
    subtitle: "Responda a perguntas simples sobre os seus sintomas e receba uma avaliação clínica precisa em segundos, com recomendações personalizadas.",
    image: "https://i.postimg.cc/GtRN7G2y/2.png",
    mobileImage: "https://i.postimg.cc/GtRN7G2y/2.png",
    btn: "Iniciar Avaliação",
    action: "avaliacao-ia"
  },
  {
    id: 3,
    title: "Fale com o Dr. IA",
    subtitle: "Fale sobre o seu estado de saúde com a Inteligência Artificial e receba as melhores orientações clínicas em segundos.",
    image: "https://i.postimg.cc/1592DG2Y/3.png",
    mobileImage: "https://i.postimg.cc/1592DG2Y/3.png",
    btn: "Conversar com IA",
    action: "home"
  },
  {
    id: 4,
    title: "Envio Direto em Casos Graves",
    subtitle: "Caso seja detetada uma situação grave, o relatório clínico é enviado de imediato para o hospital de destino para que seja atendido sem esperas.",
    image: "https://i.postimg.cc/y8GGqwdM/4.png",
    mobileImage: "https://i.postimg.cc/y8GGqwdM/4.png",
    btn: "Ver Hospitais",
    action: "hospitais"
  },
  {
    id: 5,
    title: "Diminuição das Filas de Espera",
    subtitle: "Com a triagem inteligente à distância, evitamos a sobrecarga das urgências e garantimos que os médicos focam-se nos casos críticos.",
    image: "https://i.postimg.cc/HnTZ4mZs/5.png",
    mobileImage: "https://i.postimg.cc/HnTZ4mZs/5.png",
    btn: "Saber Mais",
    action: "home"
  },
  {
    id: 6,
    title: "Combate Ativo de Pandemias",
    subtitle: "O mapeamento de sintomas em tempo real permite ao Ministério da Saúde detetar e planear o combate a pandemias e surtos locais.",
    image: "https://i.postimg.cc/tCSSPLhq/6.png",
    mobileImage: "https://i.postimg.cc/tCSSPLhq/6.png",
    btn: "Painel de Vigilância",
    action: "home"
  }
];

export const GOV_HIGHLIGHT_SLIDES: Slide[] = [
  {
    id: 1,
    title: "Centro de Comando Epidemiológico Nacional",
    subtitle: "Visão consolidada em tempo real da rede hospitalar, surtos epidemiológicos e indicadores de saúde pública de Angola.",
    image: "https://i.postimg.cc/RZpkSWsm/1.png",
    mobileImage: "https://i.postimg.cc/RZpkSWsm/1.png",
    btn: "Abrir Dashboard",
    action: "minsa-dashboard"
  },
  {
    id: 2,
    title: "Vigilância Epidemiológica Territorial",
    subtitle: "Mapa interativo das 19 províncias com monitorização de surtos — Cólera, Malária, Ébola, Sarampo e Tuberculose em tempo real.",
    image: "https://i.postimg.cc/1RJXGH4r/2.png",
    mobileImage: "https://i.postimg.cc/1RJXGH4r/2.png",
    btn: "Mapa de Vigilância",
    action: "minsa-vigilancia"
  },
  {
    id: 3,
    title: "IA Preditiva Nacional",
    subtitle: "Modelos de inteligência artificial analisam sintomas reportados pelos utentes para prever e antecipar surtos epidémicos.",
    image: "https://i.postimg.cc/1zh3m770/3.png",
    mobileImage: "https://i.postimg.cc/1zh3m770/3.png",
    btn: "Módulo IA",
    action: "minsa-ia"
  },
  {
    id: 4,
    title: "Rede Hospitalar Integrada",
    subtitle: "Monitorize a taxa de ocupação de camas, tempos de espera e nível de integração Dr.IA em todas as unidades de saúde do país.",
    image: "https://i.postimg.cc/bJLyRyyV/4.png",
    mobileImage: "https://i.postimg.cc/bJLyRyyV/4.png",
    btn: "Gerir Hospitais",
    action: "minsa-hospitals"
  },
  {
    id: 5,
    title: "Estatísticas e Relatórios Executivos",
    subtitle: "Gere relatórios consolidados de prevalência de doenças, distribuição demográfica e tendências epidemiológicas por província.",
    image: "https://i.postimg.cc/66j62p1j/5.png",
    mobileImage: "https://i.postimg.cc/66j62p1j/5.png",
    btn: "Ver Estatísticas",
    action: "minsa-estatisticas"
  },
  {
    id: 6,
    title: "Resposta Nacional de Emergência",
    subtitle: "Active planos de contingência, coordene equipas de resposta rápida monitorize indicadores-chave durante crises de saúde pública.",
    image: "https://i.postimg.cc/XYFnzcNg/6.png",
    mobileImage: "https://i.postimg.cc/XYFnzcNg/6.png",
    btn: "Relatórios Executivos",
    action: "minsa-relatorios"
  }
];

export const INST_HIGHLIGHT_SLIDES: Slide[] = [
  {
    id: 1,
    title: "Triagem Pré-Hospitalar Inteligente",
    subtitle: "Receba relatórios clínicos de pacientes gerados pela IA antes mesmo da entrada na unidade — priorize atendimentos e reduza tempos de espera.",
    image: "https://i.postimg.cc/RZpkSWsm/1.png",
    mobileImage: "https://i.postimg.cc/RZpkSWsm/1.png",
    btn: "Ver Pacientes",
    action: "hospital-pacientes"
  },
  {
    id: 2,
    title: "Protocolo Manchester Digital",
    subtitle: "Cores de prioridade aplicadas automaticamente pela IA: Emergência, Muito Urgente, Urgente, Standard e Não Urgente — tudo em tempo real.",
    image: "https://i.postimg.cc/bNxbfbvv/2.png",
    mobileImage: "https://i.postimg.cc/bNxbfbvv/2.png",
    btn: "Painel de Controle",
    action: "hospital-dashboard"
  },
  {
    id: 3,
    title: "Workstation de Atendimento",
    subtitle: "Confirme diagnósticos, solicite exames, registe prescrições e emita altas digitais diretamente na ficha clínica de cada paciente.",
    image: "https://i.postimg.cc/3wRDGcF4/3.png",
    mobileImage: "https://i.postimg.cc/3wRDGcF4/3.png",
    btn: "Atender Pacientes",
    action: "hospital-pacientes"
  },
  {
    id: 4,
    title: "Leitura QR Code de Utentes",
    subtitle: "Leia o QR Code de saúde do utente à entrada e aceda instantaneamente a alergias, medicação, histórico e triagens recentes.",
    image: "https://i.postimg.cc/L6pYDXVp/4.png",
    mobileImage: "https://i.postimg.cc/L6pYDXVp/4.png",
    btn: "Abrir Scanner",
    action: "hospital-qr-scanner"
  },
  {
    id: 5,
    title: "Ocupação de Camas em Tempo Real",
    subtitle: "Monitorize a taxa de ocupação de camas, equipa de turno e tempo médio de espera por urgência — decisões com dados ao minuto.",
    image: "https://i.postimg.cc/tgw7xCgL/5.png",
    mobileImage: "https://i.postimg.cc/tgw7xCgL/5.png",
    btn: "Ver Dashboard",
    action: "hospital-dashboard"
  },
  {
    id: 6,
    title: "Histórico Clínico Integrado",
    subtitle: "Todas as triagens, diagnósticos e altas arquivadas por utente, com exportação e auditoria para controlo de qualidade clínica.",
    image: "https://i.postimg.cc/dQ8DhFck/6.png",
    mobileImage: "https://i.postimg.cc/dQ8DhFck/6.png",
    btn: "Ver Histórico",
    action: "hospital-historico"
  }
];
