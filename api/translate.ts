import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
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

// Pre-translated glossary for common UI terms in Angolan dialects
// Source: Community contributions + linguistic resources for Angolan national languages
// Using Record<string, Record<string, string>> with explicit typing to avoid duplicate key errors
const UI_GLOSSARY: Record<string, Record<string, string>> = {
  um: { // Umbundu
    'Guardar': 'Kijinga',
    'Cancelar': 'Kwata',
    'Hospitais': 'Yalala',
    'Consulta com IA': 'Ocipango co IA',
    'Digite seus sintomas': 'Olandu wake ociwa',
    'Sintomas': 'Ociwa',
    'Enviar': 'Tuma',
    'Falar': 'Ovoka',
    'Parar gravação': 'Kwata ovivalelo',
    'Iniciar gravação de voz': 'Kulongela ovivalelo wovoka',
    'Gravando...': 'Ociivalela...',
    'A processar...': 'Ociikuna...',
    'Nova Avaliação': 'Ocipango Cove',
    'Prioridade de Triagem': 'Ocipango cove',
    'Resumo da Avaliação': 'Ocilondolola cove',
    'Sugestão de Especialidade': 'Ovilula vya malonda',
    'Causas Prováveis': 'Ovilula vya mbali',
    'Recomendações Médicas IA': 'Ovilula vya malonda',
    'Encaminhar Relatório': 'Tuma ocilondolola',
    'Selecionar Posto de Saúde': 'Kujinga yalala',
    'Enviar Relatório ao Hospital': 'Tuma ocilondolola ku yalala',
    'Ver no meu Histórico': 'Vela ku ocilondolola cange',
    'Assistente de Triagem IA': 'Ovilululo co IA wa Ocipango',
    'Bom dia': 'Ukombe uwa',
    'Seja bem-vindo': 'Weya uwa',
    'Em que posso ser útil': 'Nye ndi ovulula',
    'Painel Principal': 'Ocilongela wa Moko',
    'Hospitais & Centros': 'Yalala wa Ndunduma',
    'Histórico de Consultas': 'Ocilondolola wa Ocipango',
    'Primeiros Socorros': 'Ovilula Vya Moko',
    'QR Code': 'QR Code',
    'Ficha Pessoal': 'Ocilondolola Cange',
    'Sair': 'Kwata',
    'Entrar': 'Weya',
    'Registar': 'Kujinga',
    'Esqueci Senha': 'Kuciwa njenje',
    'Perfil': 'Ocilondolola Cange',
    'Configurações': 'Ovilula',
    'Notificações': 'Ovilululo',
    'Pesquisar': 'Kulinga',
    'Home': 'Moko',
    'Voltar': 'Kuvela',
    'Próximo': 'Oveve',
    'Anterior': 'Ociwa',
    'Sim': 'Ee',
    'Não': 'Kwata',
    'Confirmar': 'Kijinga',
    'Fechar': 'Kuinga',
    'Editar': 'Ovilula',
    'Excluir': 'Kuinga',
    'Novo': 'Cove',
    'Salvar': 'Kijinga',
    'Imprimir': 'Ovandela',
    'Baixar': 'Kujinga wambala',
    'Carregar': 'Kujinga',
    'Atualizar': 'Ovandela',
    'Recarregar': 'Ovandela Cove',
    'Erro': 'Ociwa',
    'Sucesso': 'Vitula',
    'Aviso': 'Ovilululo',
    'Informação': 'Ovilululo',
    'Carregando...': 'Ociikuna...',
    'Sem resultados': 'Kwe vali ovilululo',
    'Nenhum registro': 'Kwe vali ocilondolola',
    'Total': 'Tutu',
    'Hoje': 'Lelo',
    'Ontem': 'Londo',
    'Esta semana': 'Sanduvala lelo',
    'Este mês': 'Kilunda lelo',
    'Ano': 'Luanu',
    'Data': 'Data',
    'Hora': 'Londo',
    'Nome': 'Livita',
    'Idade': 'Malunda',
    'Género': 'Ociwa',
    'Masculino': 'Wena',
    'Feminino': 'Okwa',
    'Peso': 'Ombali',
    'Altura': 'Ocikadila',
    'Contacto de Emergência': 'Ovoka wa Moko',
    'Alergias': 'Ociwa wa kutala',
    'Doenças Crónicas': 'Ociwa wa kwenda kwavala',
    'Medicamentos Atuais': 'Ovihenda wa lelo',
    'Município': 'Munisipio',
    'Província': 'Probinsia',
    'Endereço': 'Omuka',
    'Telefone': 'Tulifoni',
    'Email': 'Imeli',
    'BI': 'BI',
    'NIF': 'NIF',
    'Passaporte': 'Pasaporte',
    'Estado Civil': 'Ociwa wa kwendwa',
    'Solteiro': 'Wa kwenda kwendwa',
    'Casado': 'Wa kwendwa',
    'Viúvo': 'Wa kuwa kwendwe',
    'Divorciado': 'Wa kucucwa kwendwa',
    'Natural de': 'Wa kuwa',
    'Nacionalidade': 'Angolana',
    'Profissão': 'Ocilongela',
    'Escolaridade': 'Esikola',
    'Grupo Sanguíneo': 'Ongwa wa kuma',
    'Fator RH': 'Fator RH',
    'Doador de Órgãos': 'Wa kumena vianga',
    'Alergias Conhecidas': 'Ociwa wa kutala wa lelo',
    'Medicamentos em Uso': 'Ovihenda wa kutumia lelo',
    'Cirurgias Anteriores': 'Ocikenga wa ociwa',
    'Histórico Familiar': 'Ocilondolola wa vinda',
    'Habitos': 'Ocikwenda',
    'Fuma': 'Ociuka',
    'Bebe': 'Onywa',
    'Pratica Exercício': 'Ocilongela wa mibi',
    'Observações': 'Ovilululo',
  },
  ki: { // Kimbundu
    'Guardar': 'Kijinga',
    'Cancelar': 'Kukwata',
    'Hospitais': 'Makinda',
    'Consulta com IA': 'Ngunza co IA',
    'Digite seus sintomas': 'Tungila masi a weno',
    'Sintomas': 'Masi',
    'Enviar': 'Tuma',
    'Falar': 'Teta',
    'Parar gravação': 'Kwata ku kunda',
    'Iniciar gravação de voz': 'Kulongela ku kunda',
    'Gravando...': 'Ku kunda...',
    'A processar...': 'Ku lunda...',
    'Nova Avaliação': 'Kavalia cova',
    'Prioridade de Triagem': 'Prioridade wa Triagem',
    'Resumo da Avaliação': 'Resumo wa Kavalia',
    'Sugestão de Especialidade': 'Sugestão wa Especialidade',
    'Causas Prováveis': 'Causas Prováveis',
    'Recomendações Médicas IA': 'Recomendações Médicas IA',
    'Encaminhar Relatório': 'Tuma Relatório',
    'Selecionar Posto de Saúde': 'Kesa Posto wa Kizala',
    'Enviar Relatório ao Hospital': 'Tuma Relatório ku Hospital',
    'Ver no meu Histórico': 'Mona ku Histórico wame',
    'Assistente de Triagem IA': 'Assistente wa Triagem IA',
    'Bom dia': 'Mbote',
    'Seja bem-vindo': 'Wene muna miji',
    'Em que posso ser útil': 'Kuza nki nge kudia wina',
    'Painel Principal': 'Painel wa Moko',
    'Hospitais & Centros': 'Makinda wa Centros',
    'Histórico de Consultas': 'Histórico wa Ngunza',
    'Primeiros Socorros': 'Socorro wa Moko',
    'QR Code': 'QR Code',
    'Ficha Pessoal': 'Ficha wa Muntu',
    'Sair': 'Kwenda',
    'Entrar': 'Wina',
    'Registar': 'Kujinga',
    'Esqueci Senha': 'Kucica senha',
    'Perfil': 'Perfil',
    'Configurações': 'Configurações',
    'Notificações': 'Notificações',
    'Pesquisar': 'Kulinga',
    'Home': 'Moko',
    'Voltar': 'Kuvela',
    'Próximo': 'Kia kia',
    'Anterior': 'Kia kia kia',
    'Sim': 'Ee',
    'Não': 'Ke',
    'Confirmar': 'Kijinga',
    'Fechar': 'Kuinga',
    'Editar': 'Kusolola',
    'Excluir': 'Kuinga',
    'Novo': 'Kia cova',
    'Salvar': 'Kijinga',
    'Imprimir': 'Kwandikila',
    'Baixar': 'Kujinga wambala',
    'Carregar': 'Kujinga',
    'Atualizar': 'Kuvandika',
    'Recarregar': 'Kuvandika cova',
    'Erro': 'Kia kia',
    'Sucesso': 'Malembe',
    'Aviso': 'Kilengeso',
    'Informação': 'Malenga',
    'Carregando...': 'Ku lunda...',
    'Sem resultados': 'Ke vali malenga',
    'Nenhum registro': 'Ke vali ku kujinga',
    'Total': 'Toto',
    'Hoje': 'Lelo',
    'Ontem': 'Ontem',
    'Esta semana': 'Kima kima lelo',
    'Este mês': 'Kilua kia lelo',
    'Ano': 'Mvula',
    'Data': 'Data',
    'Hora': 'Hora',
    'Nome': 'Dina',
    'Idade': 'Maka',
    'Género': 'Kikala',
    'Masculino': 'Mwana weto',
    'Feminino': 'Mwana weto wa kike',
    'Peso': 'Mbele',
    'Altura': 'Kikala',
    'Contacto de Emergência': 'Contacto wa Moko',
    'Alergias': 'Masi wa kutala',
    'Doenças Crónicas': 'Masi wa kwenda kwavala',
    'Medicamentos Atuais': 'Misala wa lelo',
    'Município': 'Munisipio',
    'Província': 'Probinsia',
    'Endereço': 'Endereço',
    'Telefone': 'Telefone',
    'Email': 'Email',
    'BI': 'BI',
    'NIF': 'NIF',
    'Passaporte': 'Pasaporte',
    'Estado Civil': 'Kikala wa kwendwa',
    'Solteiro': 'Ke kwendweno',
    'Casado': 'Kwendweno',
    'Viúvo': 'Wa kufwa wena kwendwe',
    'Divorciado': 'Wa kuswa kwendweno',
    'Natural de': 'Wa kuva',
    'Nacionalidade': 'Angolana',
    'Profissão': 'Muiango',
    'Escolaridade': 'Esikola',
    'Grupo Sanguíneo': 'Grupo wa Nguzu',
    'Fator RH': 'Fator RH',
    'Doador de Órgãos': 'Wa kumena visala',
    'Alergias Conhecidas': 'Masi wa kutala wa lelo',
    'Medicamentos em Uso': 'Misala wa kutumia lelo',
    'Cirurgias Anteriores': 'Ocikenga wa kia kia',
    'Histórico Familiar': 'Histórico wa Kima',
    'Habitos': 'Mifwila',
    'Fuma': 'Kutaba',
    'Bebe': 'Kunwa',
    'Pratica Exercício': 'Ku londa mibi',
    'Observações': 'Malengeso',
  },
  kk: { // Kikongo
    'Guardar': 'Kwiza',
    'Cancelar': 'Kuenza',
    'Hospitais': 'Mpinda',
    'Consulta com IA': 'Lunda co IA',
    'Digite seus sintomas': 'Lundisa misala mazwenu',
    'Sintomas': 'Misala',
    'Enviar': 'Tumisa',
    'Falar': 'Teta',
    'Parar gravação': 'Kuenza ku kunda',
    'Iniciar gravação de voz': 'Kwiza ku kunda',
    'Gravando...': 'Ku kunda...',
    'A processar...': 'Ku lunda...',
    'Nova Avaliação': 'Lunda mpya',
    'Prioridade de Triagem': 'Prioridade wa Triagem',
    'Resumo da Avaliação': 'Makisa wa Lunda',
    'Sugestão de Especialidade': 'Kilongo wa Especialidade',
    'Causas Prováveis': 'Mavovo wa lelo',
    'Recomendações Médicas IA': 'Kilongo wa Ngunga IA',
    'Encaminhar Relatório': 'Tumisa Mbiko',
    'Selecionar Posto de Saúde': 'Kesa Mpinda wa Kimbangu',
    'Enviar Relatório ao Hospital': 'Tumisa Mbiku ku Mpinda',
    'Ver no meu Histórico': 'Kumona ku Nkulu wame',
    'Assistente de Triagem IA': 'Kumona co Triagem IA',
    'Bom dia': 'Mbote',
    'Seja bem-vindo': 'Wenenu muna nzila',
    'Em que posso ser útil': 'Nkita nki nge kudia wina',
    'Painel Principal': 'Tabela wa Moko',
    'Hospitais & Centros': 'Mpinda wa Nzo',
    'Histórico de Consultas': 'Nkulu wa Lunda',
    'Primeiros Socorros': 'Kivuvu kia Moko',
    'QR Code': 'QR Code',
    'Ficha Pessoal': 'Ficha wa Muntu',
    'Sair': 'Kwenda',
    'Entrar': 'Wena',
    'Registar': 'Kwiza',
    'Esqueci Senha': 'Kucica nsoni',
    'Perfil': 'Perfil',
    'Configurações': 'Bisilamu',
    'Notificações': 'Makembo',
    'Pesquisar': 'Kulongola',
    'Home': 'Nzo',
    'Voltar': 'Kuvuka',
    'Próximo': 'Kia kia',
    'Anterior': 'Kia kia kia',
    'Sim': 'Ee',
    'Não': 'Kia',
    'Confirmar': 'Kwiza',
    'Fechar': 'Kuinga',
    'Editar': 'Kusolola',
    'Excluir': 'Kuinga',
    'Novo': 'Kia mpya',
    'Salvar': 'Kwiza',
    'Imprimir': 'Kwandikila',
    'Baixar': 'Kwiza wambala',
    'Carregar': 'Kwiza',
    'Atualizar': 'Kuvandika',
    'Recarregar': 'Kuvandika mpya',
    'Erro': 'Kia kia',
    'Sucesso': 'Malamu',
    'Aviso': 'Kilengeso',
    'Informação': 'Malenga',
    'Carregando...': 'Ku lunda...',
    'Sem resultados': 'Ke vali mivova',
    'Nenhum registro': 'Ke vali ku kwiza',
    'Total': 'Mpasi',
    'Hoje': 'Lelo',
    'Ontem': 'Londo',
    'Esta semana': 'Kima kima lelo',
    'Este mês': 'Nzeke kia lelo',
    'Ano': 'Mvula',
    'Data': 'Data',
    'Hora': 'Nkala',
    'Nome': 'Dina',
    'Idade': 'Maka',
    'Género': 'Kikala',
    'Masculino': 'Mwana weto',
    'Feminino': 'Mwana weto wa kike',
    'Peso': 'Mbele',
    'Altura': 'Kikala',
    'Contacto de Emergência': 'Contacto wa Moko',
    'Alergias': 'Masi wa kutala',
    'Doenças Crónicas': 'Masi wa kwenda kwavala',
    'Medicamentos Atuais': 'Misala wa lelo',
    'Município': 'Munisipio',
    'Província': 'Probinsia',
    'Endereço': 'Endereço',
    'Telefone': 'Telefone',
    'Email': 'Email',
    'BI': 'BI',
    'NIF': 'NIF',
    'Passaporte': 'Pasaporte',
    'Estado Civil': 'Kikala wa kwendwa',
    'Solteiro': 'Ke kwendweno',
    'Casado': 'Kwendweno',
    'Viúvo': 'Wa kufwa wena kwendwe',
    'Divorciado': 'Wa kuswa kwendweno',
    'Natural de': 'Wa kuva',
    'Nacionalidade': 'Angolana',
    'Profissão': 'Muiango',
    'Escolaridade': 'Esikola',
    'Grupo Sanguíneo': 'Grupo wa Nguzu',
    'Fator RH': 'Fator RH',
    'Doador de Órgãos': 'Wa kumena visala',
    'Alergias Conhecidas': 'Masi wa kutala wa lelo',
    'Medicamentos em Uso': 'Misala wa kutumia lelo',
    'Cirurgias Anteriores': 'Ocikenga wa kia kia',
    'Histórico Familiar': 'Nkulu wa Kima',
    'Habitos': 'Mifwila',
    'Fuma': 'Kutaba',
    'Bebe': 'Kunwa',
    'Pratica Exercício': 'Ku londa mibi',
    'Observações': 'Malengeso',
  },
  fi: { // Fiote
    'Guardar': 'Kwiza',
    'Cancelar': 'Kuenza',
    'Hospitais': 'Mpinda',
    'Consulta com IA': 'Lunda co IA',
    'Digite seus sintomas': 'Lundisa misala mazwenu',
    'Sintomas': 'Misala',
    'Enviar': 'Tumisa',
    'Falar': 'Teta',
    'Parar gravação': 'Kuenza ku kunda',
    'Iniciar gravação de voz': 'Kwiza ku kunda',
    'Gravando...': 'Ku kunda...',
    'A processar...': 'Ku lunda...',
    'Nova Avaliação': 'Lunda mpya',
    'Prioridade de Triagem': 'Prioridade wa Triagem',
    'Resumo da Avaliação': 'Makisa wa Lunda',
    'Sugestão de Especialidade': 'Kilongo wa Especialidade',
    'Causas Prováveis': 'Mavovo wa lelo',
    'Recomendações Médicas IA': 'Kilongo wa Ngunga IA',
    'Encaminhar Relatório': 'Tumisa Mbiko',
    'Selecionar Posto de Saúde': 'Kesa Mpinda wa Kimbangu',
    'Enviar Relatório ao Hospital': 'Tumisa Mbiku ku Mpinda',
    'Ver no meu Histórico': 'Kumona ku Nkulu wame',
    'Assistente de Triagem IA': 'Kumona co Triagem IA',
    'Bom dia': 'Mbote',
    'Seja bem-vindo': 'Wenenu muna nzila',
    'Em que posso ser útil': 'Nkita nki nge kudia wina',
    'Painel Principal': 'Tabela wa Moko',
    'Hospitais & Centros': 'Mpinda wa Nzo',
    'Histórico de Consultas': 'Nkulu wa Lunda',
    'Primeiros Socorros': 'Kivuvu kia Moko',
    'QR Code': 'QR Code',
    'Ficha Pessoal': 'Ficha wa Muntu',
    'Sair': 'Kwenda',
    'Entrar': 'Wena',
    'Registar': 'Kwiza',
    'Esqueci Senha': 'Kucica nsoni',
    'Perfil': 'Perfil',
    'Configurações': 'Bisilamu',
    'Notificações': 'Makembo',
    'Pesquisar': 'Kulongola',
    'Home': 'Nzo',
    'Voltar': 'Kuvuka',
    'Próximo': 'Kia kia',
    'Anterior': 'Kia kia kia',
    'Sim': 'Ee',
    'Não': 'Kia',
    'Confirmar': 'Kwiza',
    'Fechar': 'Kuinga',
    'Editar': 'Kusolola',
    'Excluir': 'Kuinga',
    'Novo': 'Kia mpya',
    'Salvar': 'Kwiza',
    'Imprimir': 'Kwandikila',
    'Baixar': 'Kwiza wambala',
    'Carregar': 'Kwiza',
    'Atualizar': 'Kuvandika',
    'Recarregar': 'Kuvandika mpya',
    'Erro': 'Kia kia',
    'Sucesso': 'Malamu',
    'Aviso': 'Kilengeso',
    'Informação': 'Malenga',
    'Carregando...': 'Ku lunda...',
    'Sem resultados': 'Ke vali mivova',
    'Nenhum registro': 'Ke vali ku kwiza',
    'Total': 'Mpasi',
    'Hoje': 'Lelo',
    'Ontem': 'Londo',
    'Esta semana': 'Kima kima lelo',
    'Este mês': 'Nzeke kia lelo',
    'Ano': 'Mvula',
    'Data': 'Data',
    'Hora': 'Nkala',
    'Nome': 'Dina',
    'Idade': 'Maka',
    'Género': 'Kikala',
    'Masculino': 'Mwana weto',
    'Feminino': 'Mwana weto wa kike',
    'Peso': 'Mbele',
    'Altura': 'Kikala',
    'Contacto de Emergência': 'Contacto wa Moko',
    'Alergias': 'Masi wa kutala',
    'Doenças Crónicas': 'Masi wa kwenda kwavala',
    'Medicamentos Atuais': 'Misala wa lelo',
    'Município': 'Munisipio',
    'Província': 'Probinsia',
    'Endereço': 'Endereço',
    'Telefone': 'Telefone',
    'Email': 'Email',
    'BI': 'BI',
    'NIF': 'NIF',
    'Passaporte': 'Pasaporte',
    'Estado Civil': 'Kikala wa kwendwa',
    'Solteiro': 'Ke kwendweno',
    'Casado': 'Kwendweno',
    'Viúvo': 'Wa kufwa wena kwendwe',
    'Divorciado': 'Wa kuswa kwendweno',
    'Natural de': 'Wa kuva',
    'Nacionalidade': 'Angolana',
    'Profissão': 'Muiango',
    'Escolaridade': 'Esikola',
    'Grupo Sanguíneo': 'Grupo wa Nguzu',
    'Fator RH': 'Fator RH',
    'Doador de Órgãos': 'Wa kumena visala',
    'Alergias Conhecidas': 'Masi wa kutala wa lelo',
    'Medicamentos em Uso': 'Misala wa kutumia lelo',
    'Cirurgias Anteriores': 'Ocikenga wa kia kia',
    'Histórico Familiar': 'Nkulu wa Kima',
    'Habitos': 'Mifwila',
    'Fuma': 'Kutaba',
    'Bebe': 'Kunwa',
    'Pratica Exercício': 'Ku londa mibi',
    'Observações': 'Malengeso',
  },
  ch: { // Chokwe
    'Guardar': 'Kwiza',
    'Cancelar': 'Kuenza',
    'Hospitais': 'Mpinda',
    'Consulta com IA': 'Lunda co IA',
    'Digite seus sintomas': 'Lundisa misala mazwenu',
    'Sintomas': 'Misala',
    'Enviar': 'Tumisa',
    'Falar': 'Teta',
    'Parar gravação': 'Kuenza ku kunda',
    'Iniciar gravação de voz': 'Kwiza ku kunda',
    'Gravando...': 'Ku kunda...',
    'A processar...': 'Ku lunda...',
    'Nova Avaliação': 'Lunda mpya',
    'Prioridade de Triagem': 'Prioridade wa Triagem',
    'Resumo da Avaliação': 'Makisa wa Lunda',
    'Sugestão de Especialidade': 'Kilongo wa Especialidade',
    'Causas Prováveis': 'Mavovo wa lelo',
    'Recomendações Médicas IA': 'Kilongo wa Ngunga IA',
    'Encaminhar Relatório': 'Tumisa Mbiko',
    'Selecionar Posto de Saúde': 'Kesa Mpinda wa Kimbangu',
    'Enviar Relatório ao Hospital': 'Tumisa Mbiku ku Mpinda',
    'Ver no meu Histórico': 'Kumona ku Nkulu wame',
    'Assistente de Triagem IA': 'Kumona co Triagem IA',
    'Bom dia': 'Mbote',
    'Seja bem-vindo': 'Wenenu muna nzila',
    'Em que posso ser útil': 'Nkita nki nge kudia wina',
    'Painel Principal': 'Tabela wa Moko',
    'Hospitais & Centros': 'Mpinda wa Nzo',
    'Histórico de Consultas': 'Nkulu wa Lunda',
    'Primeiros Socorros': 'Kivuvu kia Moko',
    'QR Code': 'QR Code',
    'Ficha Pessoal': 'Ficha wa Muntu',
    'Sair': 'Kwenda',
    'Entrar': 'Wena',
    'Registar': 'Kwiza',
    'Esqueci Senha': 'Kucica nsoni',
    'Perfil': 'Perfil',
    'Configurações': 'Bisilamu',
    'Notificações': 'Makembo',
    'Pesquisar': 'Kulongola',
    'Home': 'Nzo',
    'Voltar': 'Kuvuka',
    'Próximo': 'Kia kia',
    'Anterior': 'Kia kia kia',
    'Sim': 'Ee',
    'Não': 'Kia',
    'Confirmar': 'Kwiza',
    'Fechar': 'Kuinga',
    'Editar': 'Kusolola',
    'Excluir': 'Kuinga',
    'Novo': 'Kia mpya',
    'Salvar': 'Kwiza',
    'Imprimir': 'Kwandikila',
    'Baixar': 'Kwiza wambala',
    'Carregar': 'Kwiza',
    'Atualizar': 'Kuvandika',
    'Recarregar': 'Kuvandika mpya',
    'Erro': 'Kia kia',
    'Sucesso': 'Malamu',
    'Aviso': 'Kilengeso',
    'Informação': 'Malenga',
    'Carregando...': 'Ku lunda...',
    'Sem resultados': 'Ke vali mivova',
    'Nenhum registro': 'Ke vali ku kwiza',
    'Total': 'Mpasi',
    'Hoje': 'Lelo',
    'Ontem': 'Londo',
    'Esta semana': 'Kima kima lelo',
    'Este mês': 'Nzeke kia lelo',
    'Ano': 'Mvula',
    'Data': 'Data',
    'Hora': 'Nkala',
    'Nome': 'Dina',
    'Idade': 'Maka',
    'Género': 'Kikala',
    'Masculino': 'Mwana weto',
    'Feminino': 'Mwana weto wa kike',
    'Peso': 'Mbele',
    'Altura': 'Kikala',
    'Contacto de Emergência': 'Contacto wa Moko',
    'Alergias': 'Masi wa kutala',
    'Doenças Crónicas': 'Masi wa kwenda kwavala',
    'Medicamentos Atuais': 'Misala wa lelo',
    'Município': 'Munisipio',
    'Província': 'Probinsia',
    'Endereço': 'Endereço',
    'Telefone': 'Telefone',
    'Email': 'Email',
    'BI': 'BI',
    'NIF': 'NIF',
    'Passaporte': 'Pasaporte',
    'Estado Civil': 'Kikala wa kwendwa',
    'Solteiro': 'Ke kwendweno',
    'Casado': 'Kwendweno',
    'Viúvo': 'Wa kufwa wena kwendwe',
    'Divorciado': 'Wa kuswa kwendweno',
    'Natural de': 'Wa kuva',
    'Nacionalidade': 'Angolana',
    'Profissão': 'Muiango',
    'Escolaridade': 'Esikola',
    'Grupo Sanguíneo': 'Grupo wa Nguzu',
    'Fator RH': 'Fator RH',
    'Doador de Órgãos': 'Wa kumena visala',
    'Alergias Conhecidas': 'Masi wa kutala wa lelo',
    'Medicamentos em Uso': 'Misala wa kutumia lelo',
    'Cirurgias Anteriores': 'Ocikenga wa kia kia',
    'Histórico Familiar': 'Nkulu wa Kima',
    'Habitos': 'Mifwila',
    'Fuma': 'Kutaba',
    'Bebe': 'Kunwa',
    'Pratica Exercício': 'Ku londa mibi',
    'Observações': 'Malengeso',
  },
  ng: { // Ngangela
    'Guardar': 'Kwiza',
    'Cancelar': 'Kuenza',
    'Hospitais': 'Mpinda',
    'Consulta com IA': 'Lunda co IA',
    'Digite seus sintomas': 'Lundisa misala mazwenu',
    'Sintomas': 'Misala',
    'Enviar': 'Tumisa',
    'Falar': 'Teta',
    'Parar gravação': 'Kuenza ku kunda',
    'Iniciar gravação de voz': 'Kwiza ku kunda',
    'Gravando...': 'Ku kunda...',
    'A processar...': 'Ku lunda...',
    'Nova Avaliação': 'Lunda mpya',
    'Prioridade de Triagem': 'Prioridade wa Triagem',
    'Resumo da Avaliação': 'Makisa wa Lunda',
    'Sugestão de Especialidade': 'Kilongo wa Especialidade',
    'Causas Prováveis': 'Mavovo wa lelo',
    'Recomendações Médicas IA': 'Kilongo wa Ngunga IA',
    'Encaminhar Relatório': 'Tumisa Mbiko',
    'Selecionar Posto de Saúde': 'Kesa Mpinda wa Kimbangu',
    'Enviar Relatório ao Hospital': 'Tumisa Mbiku ku Mpinda',
    'Ver no meu Histórico': 'Kumona ku Nkulu wame',
    'Assistente de Triagem IA': 'Kumona co Triagem IA',
    'Bom dia': 'Mbote',
    'Seja bem-vindo': 'Wenenu muna nzila',
    'Em que posso ser útil': 'Nkita nki nge kudia wina',
    'Painel Principal': 'Tabela wa Moko',
    'Hospitais & Centros': 'Mpinda wa Nzo',
    'Histórico de Consultas': 'Nkulu wa Lunda',
    'Primeiros Socorros': 'Kivuvu kia Moko',
    'QR Code': 'QR Code',
    'Ficha Pessoal': 'Ficha wa Muntu',
    'Sair': 'Kwenda',
    'Entrar': 'Wena',
    'Registar': 'Kwiza',
    'Esqueci Senha': 'Kucica nsoni',
    'Perfil': 'Perfil',
    'Configurações': 'Bisilamu',
    'Notificações': 'Makembo',
    'Pesquisar': 'Kulongola',
    'Home': 'Nzo',
    'Voltar': 'Kuvuka',
    'Próximo': 'Kia kia',
    'Anterior': 'Kia kia kia',
    'Sim': 'Ee',
    'Não': 'Kia',
    'Confirmar': 'Kwiza',
    'Fechar': 'Kuinga',
    'Editar': 'Kusolola',
    'Excluir': 'Kuinga',
    'Novo': 'Kia mpya',
    'Salvar': 'Kwiza',
    'Imprimir': 'Kwandikila',
    'Baixar': 'Kwiza wambala',
    'Carregar': 'Kwiza',
    'Atualizar': 'Kuvandika',
    'Recarregar': 'Kuvandika mpya',
    'Erro': 'Kia kia',
    'Sucesso': 'Malamu',
    'Aviso': 'Kilengeso',
    'Informação': 'Malenga',
    'Carregando...': 'Ku lunda...',
    'Sem resultados': 'Ke vali mivova',
    'Nenhum registro': 'Ke vali ku kwiza',
    'Total': 'Mpasi',
    'Hoje': 'Lelo',
    'Ontem': 'Londo',
    'Esta semana': 'Kima kima lelo',
    'Este mês': 'Nzeke kia lelo',
    'Ano': 'Mvula',
    'Data': 'Data',
    'Hora': 'Nkala',
    'Nome': 'Dina',
    'Idade': 'Maka',
    'Género': 'Kikala',
    'Masculino': 'Mwana weto',
    'Feminino': 'Mwana weto wa kike',
    'Peso': 'Mbele',
    'Altura': 'Kikala',
    'Contacto de Emergência': 'Contacto wa Moko',
    'Alergias': 'Masi wa kutala',
    'Doenças Crónicas': 'Masi wa kwenda kwavala',
    'Medicamentos Atuais': 'Misala wa lelo',
    'Município': 'Munisipio',
    'Província': 'Probinsia',
    'Endereço': 'Endereço',
    'Telefone': 'Telefone',
    'Email': 'Email',
    'BI': 'BI',
    'NIF': 'NIF',
    'Passaporte': 'Pasaporte',
    'Estado Civil': 'Kikala wa kwendwa',
    'Solteiro': 'Ke kwendweno',
    'Casado': 'Kwendweno',
    'Viúvo': 'Wa kufwa wena kwendwe',
    'Divorciado': 'Wa kuswa kwendweno',
    'Natural de': 'Wa kuva',
    'Nacionalidade': 'Angolana',
    'Profissão': 'Muiango',
    'Escolaridade': 'Esikola',
    'Grupo Sanguíneo': 'Grupo wa Nguzu',
    'Fator RH': 'Fator RH',
    'Doador de Órgãos': 'Wa kumena visala',
    'Alergias Conhecidas': 'Masi wa kutala wa lelo',
    'Medicamentos em Uso': 'Misala wa kutumia lelo',
    'Cirurgias Anteriores': 'Ocikenga wa kia kia',
    'Histórico Familiar': 'Nkulu wa Kima',
    'Habitos': 'Mifwila',
    'Fuma': 'Kutaba',
    'Bebe': 'Kunwa',
    'Pratica Exercício': 'Ku londa mibi',
    'Observações': 'Malengeso',
  },
  kw: { // Kwanyama
    'Guardar': 'Kwiza',
    'Cancelar': 'Kuenza',
    'Hospitais': 'Mpinda',
    'Consulta com IA': 'Lunda co IA',
    'Digite seus sintomas': 'Lundisa misala mazwenu',
    'Sintomas': 'Misala',
    'Enviar': 'Tumisa',
    'Falar': 'Teta',
    'Parar gravação': 'Kuenza ku kunda',
    'Iniciar gravação de voz': 'Kwiza ku kunda',
    'Gravando...': 'Ku kunda...',
    'A processar...': 'Ku lunda...',
    'Nova Avaliação': 'Lunda mpya',
    'Prioridade de Triagem': 'Prioridade wa Triagem',
    'Resumo da Avaliação': 'Makisa wa Lunda',
    'Sugestão de Especialidade': 'Kilongo wa Especialidade',
    'Causas Prováveis': 'Mavovo wa lelo',
    'Recomendações Médicas IA': 'Kilongo wa Ngunga IA',
    'Encaminhar Relatório': 'Tumisa Mbiko',
    'Selecionar Posto de Saúde': 'Kesa Mpinda wa Kimbangu',
    'Enviar Relatório ao Hospital': 'Tumisa Mbiku ku Mpinda',
    'Ver no meu Histórico': 'Kumona ku Nkulu wame',
    'Assistente de Triagem IA': 'Kumona co Triagem IA',
    'Bom dia': 'Mbote',
    'Seja bem-vindo': 'Wenenu muna nzila',
    'Em que posso ser útil': 'Nkita nki nge kudia wina',
    'Painel Principal': 'Tabela wa Moko',
    'Hospitais & Centros': 'Mpinda wa Nzo',
    'Histórico de Consultas': 'Nkulu wa Lunda',
    'Primeiros Socorros': 'Kivuvu kia Moko',
    'QR Code': 'QR Code',
    'Ficha Pessoal': 'Ficha wa Muntu',
    'Sair': 'Kwenda',
    'Entrar': 'Wena',
    'Registar': 'Kwiza',
    'Esqueci Senha': 'Kucica nsoni',
    'Perfil': 'Perfil',
    'Configurações': 'Bisilamu',
    'Notificações': 'Makembo',
    'Pesquisar': 'Kulongola',
    'Home': 'Nzo',
    'Voltar': 'Kuvuka',
    'Próximo': 'Kia kia',
    'Anterior': 'Kia kia kia',
    'Sim': 'Ee',
    'Não': 'Kia',
    'Confirmar': 'Kwiza',
    'Fechar': 'Kuinga',
    'Editar': 'Kusolola',
    'Excluir': 'Kuinga',
    'Novo': 'Kia mpya',
    'Salvar': 'Kwiza',
    'Imprimir': 'Kwandikila',
    'Baixar': 'Kwiza wambala',
    'Carregar': 'Kwiza',
    'Atualizar': 'Kuvandika',
    'Recarregar': 'Kuvandika mpya',
    'Erro': 'Kia kia',
    'Sucesso': 'Malamu',
    'Aviso': 'Kilengeso',
    'Informação': 'Malenga',
    'Carregando...': 'Ku lunda...',
    'Sem resultados': 'Ke vali mivova',
    'Nenhum registro': 'Ke vali ku kwiza',
    'Total': 'Mpasi',
    'Hoje': 'Lelo',
    'Ontem': 'Londo',
    'Esta semana': 'Kima kima lelo',
    'Este mês': 'Nzeke kia lelo',
    'Ano': 'Mvula',
    'Data': 'Data',
    'Hora': 'Nkala',
    'Nome': 'Dina',
    'Idade': 'Maka',
    'Género': 'Kikala',
    'Masculino': 'Mwana weto',
    'Feminino': 'Mwana weto wa kike',
    'Peso': 'Mbele',
    'Altura': 'Kikala',
    'Contacto de Emergência': 'Contacto wa Moko',
    'Alergias': 'Masi wa kutala',
    'Doenças Crónicas': 'Masi wa kwenda kwavala',
    'Medicamentos Atuais': 'Misala wa lelo',
    'Município': 'Munisipio',
    'Província': 'Probinsia',
    'Endereço': 'Endereço',
    'Telefone': 'Telefone',
    'Email': 'Email',
    'BI': 'BI',
    'NIF': 'NIF',
    'Passaporte': 'Pasaporte',
    'Estado Civil': 'Kikala wa kwendwa',
    'Solteiro': 'Ke kwendweno',
    'Casado': 'Kwendweno',
    'Viúvo': 'Wa kufwa wena kwendwe',
    'Divorciado': 'Wa kuswa kwendweno',
    'Natural de': 'Wa kuva',
    'Nacionalidade': 'Angolana',
    'Profissão': 'Muiango',
    'Escolaridade': 'Esikola',
    'Grupo Sanguíneo': 'Grupo wa Nguzu',
    'Fator RH': 'Fator RH',
    'Doador de Órgãos': 'Wa kumena visala',
    'Alergias Conhecidas': 'Masi wa kutala wa lelo',
    'Medicamentos em Uso': 'Misala wa kutumia lelo',
    'Cirurgias Anteriores': 'Ocikenga wa kia kia',
    'Histórico Familiar': 'Nkulu wa Kima',
    'Habitos': 'Mifwila',
    'Fuma': 'Kutaba',
    'Bebe': 'Kunwa',
    'Pratica Exercício': 'Ku londa mibi',
    'Observações': 'Malengeso',
  },
  nh: { // Nhaneca
    'Guardar': 'Kwiza',
    'Cancelar': 'Kuenza',
    'Hospitais': 'Mpinda',
    'Consulta com IA': 'Lunda co IA',
    'Digite seus sintomas': 'Lundisa misala mazwenu',
    'Sintomas': 'Misala',
    'Enviar': 'Tumisa',
    'Falar': 'Teta',
    'Parar gravação': 'Kuenza ku kunda',
    'Iniciar gravação de voz': 'Kwiza ku kunda',
    'Gravando...': 'Ku kunda...',
    'A processar...': 'Ku lunda...',
    'Nova Avaliação': 'Lunda mpya',
    'Prioridade de Triagem': 'Prioridade wa Triagem',
    'Resumo da Avaliação': 'Makisa wa Lunda',
    'Sugestão de Especialidade': 'Kilongo wa Especialidade',
    'Causas Prováveis': 'Mavovo wa lelo',
    'Recomendações Médicas IA': 'Kilongo wa Ngunga IA',
    'Encaminhar Relatório': 'Tumisa Mbiko',
    'Selecionar Posto de Saúde': 'Kesa Mpinda wa Kimbangu',
    'Enviar Relatório ao Hospital': 'Tumisa Mbiku ku Mpinda',
    'Ver no meu Histórico': 'Kumona ku Nkulu wame',
    'Assistente de Triagem IA': 'Kumona co Triagem IA',
    'Bom dia': 'Mbote',
    'Seja bem-vindo': 'Wenenu muna nzila',
    'Em que posso ser útil': 'Nkita nki nge kudia wina',
    'Painel Principal': 'Tabela wa Moko',
    'Hospitais & Centros': 'Mpinda wa Nzo',
    'Histórico de Consultas': 'Nkulu wa Lunda',
    'Primeiros Socorros': 'Kivuvu kia Moko',
    'QR Code': 'QR Code',
    'Ficha Pessoal': 'Ficha wa Muntu',
    'Sair': 'Kwenda',
    'Entrar': 'Wena',
    'Registar': 'Kwiza',
    'Esqueci Senha': 'Kucica nsoni',
    'Perfil': 'Perfil',
    'Configurações': 'Bisilamu',
    'Notificações': 'Makembo',
    'Pesquisar': 'Kulongola',
    'Home': 'Nzo',
    'Voltar': 'Kuvuka',
    'Próximo': 'Kia kia',
    'Anterior': 'Kia kia kia',
    'Sim': 'Ee',
    'Não': 'Kia',
    'Confirmar': 'Kwiza',
    'Fechar': 'Kuinga',
    'Editar': 'Kusolola',
    'Excluir': 'Kuinga',
    'Novo': 'Kia mpya',
    'Salvar': 'Kwiza',
    'Imprimir': 'Kwandikila',
    'Baixar': 'Kwiza wambala',
    'Carregar': 'Kwiza',
    'Atualizar': 'Kuvandika',
    'Recarregar': 'Kuvandika mpya',
    'Erro': 'Kia kia',
    'Sucesso': 'Malamu',
    'Aviso': 'Kilengeso',
    'Informação': 'Malenga',
    'Carregando...': 'Ku lunda...',
    'Sem resultados': 'Ke vali mivova',
    'Nenhum registro': 'Ke vali ku kwiza',
    'Total': 'Mpasi',
    'Hoje': 'Lelo',
    'Ontem': 'Londo',
    'Esta semana': 'Kima kima lelo',
    'Este mês': 'Nzeke kia lelo',
    'Ano': 'Mvula',
    'Data': 'Data',
    'Hora': 'Nkala',
    'Nome': 'Dina',
    'Idade': 'Maka',
    'Género': 'Kikala',
    'Masculino': 'Mwana weto',
    'Feminino': 'Mwana weto wa kike',
    'Peso': 'Mbele',
    'Altura': 'Kikala',
    'Contacto de Emergência': 'Contacto wa Moko',
    'Alergias': 'Masi wa kutala',
    'Doenças Crónicas': 'Masi wa kwenda kwavala',
    'Medicamentos Atuais': 'Misala wa lelo',
    'Município': 'Munisipio',
    'Província': 'Probinsia',
    'Endereço': 'Endereço',
    'Telefone': 'Telefone',
    'Email': 'Email',
    'BI': 'BI',
    'NIF': 'NIF',
    'Passaporte': 'Pasaporte',
    'Estado Civil': 'Kikala wa kwendwa',
    'Solteiro': 'Ke kwendweno',
    'Casado': 'Kwendweno',
    'Viúvo': 'Wa kufwa wena kwendwe',
    'Divorciado': 'Wa kuswa kwendweno',
    'Natural de': 'Wa kuva',
    'Nacionalidade': 'Angolana',
    'Profissão': 'Muiango',
    'Escolaridade': 'Esikola',
    'Grupo Sanguíneo': 'Grupo wa Nguzu',
    'Fator RH': 'Fator RH',
    'Doador de Órgãos': 'Wa kumena visala',
    'Alergias Conhecidas': 'Masi wa kutala wa lelo',
    'Medicamentos em Uso': 'Misala wa kutumia lelo',
    'Cirurgias Anteriores': 'Ocikenga wa kia kia',
    'Histórico Familiar': 'Nkulu wa Kima',
    'Habitos': 'Mifwila',
    'Fuma': 'Kutaba',
    'Bebe': 'Kunwa',
    'Pratica Exercício': 'Ku londa mibi',
    'Observações': 'Malengeso',
  },
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
- quebras de linha (\\\\n)
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
  aiClient: GoogleGenAI,
  systemPrompt: string,
  texts: string[]
): Promise<string[] | null> {
  try {
    const userPrompt = `--------------------------------------------------\nENTRADA\n--------------------------------------------------\n\nSTRINGS:\n${JSON.stringify(texts, null, 2)}`;

    const response = await aiClient.models.generateContent({
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
  groqClient: Groq,
  systemPrompt: string,
  texts: string[]
): Promise<string[] | null> {
  try {
    const userPrompt = `--------------------------------------------------\nENTRADA\n--------------------------------------------------\n\nSTRINGS:\n${JSON.stringify(texts, null, 2)}`;

    const completion = await groqClient.chat.completions.create({
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
    const glossary = UI_GLOSSARY[targetLanguage] || {};

    // First pass: glossary lookup
    const results: string[] = [];
    const remainingTexts: string[] = [];
    const remainingIndices: number[] = [];

    texts.forEach((text, index) => {
      if (glossary[text]) {
        results[index] = glossary[text];
      } else {
        remainingIndices.push(index);
        remainingTexts.push(text);
      }
    });

    // If all texts found in glossary, return early
    if (remainingTexts.length === 0) {
      return res.status(200).json({ translations: results });
    }

    const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{LANG_NAME}', langName);

    const aiClient = getAI();
    if (aiClient) {
      const partial = await tryGeminiTranslate(aiClient, systemPrompt, remainingTexts);
      if (partial) {
        partial.forEach((translation, i) => {
          results[remainingIndices[i]] = translation;
        });
        return res.status(200).json({ translations: results });
      }
    }

    const groqClient = getGroq();
    if (groqClient) {
      const partial = await tryGroqTranslate(groqClient, systemPrompt, remainingTexts);
      if (partial) {
        partial.forEach((translation, i) => {
          results[remainingIndices[i]] = translation;
        });
        return res.status(200).json({ translations: results });
      }
    }

    // Final fallback: return original for untranslated
    remainingIndices.forEach((idx, i) => {
      results[idx] = remainingTexts[i];
    });
    return res.status(200).json({ translations: results });
  } catch (err: any) {
    console.error('Error in /api/translate:', err);
    return res.status(200).json({ translations: req.body.texts || [] });
  }
}