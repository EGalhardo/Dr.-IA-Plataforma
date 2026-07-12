/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DriaEvaluation, DriaHospital, FirstAidTopic } from '../types/dria';

export const MOCK_HOSPITALS: DriaHospital[] = [
  {
    id: 'h1',
    name: 'Hospital Geral de Luanda',
    municipality: 'Talatona',
    distance: '2.4 km',
    specialties: ['Infectologia', 'Clínica Geral', 'Pediatria', 'Urgência Médica'],
    avgWaitTime: '15 min',
    doctorsCount: 42,
    hours: '24h/24h',
    integrationState: 'Ativo'
  },
  {
    id: 'h2',
    name: 'Hospital Américo Boavida',
    municipality: 'Rangel',
    distance: '5.1 km',
    specialties: ['Cirurgia Geral', 'Cardiologia', 'Traumatologia', 'Medicina Interna'],
    avgWaitTime: '35 min',
    doctorsCount: 38,
    hours: '24h/24h',
    integrationState: 'Ativo'
  },
  {
    id: 'h3',
    name: 'Centro de Saúde de Cacuaco',
    municipality: 'Cacuaco',
    distance: '12.8 km',
    specialties: ['Pediatria', 'Enfermagem Geral', 'Maternidade', 'Vacinação'],
    avgWaitTime: '10 min',
    doctorsCount: 14,
    hours: '08:00 - 18:00',
    integrationState: 'Ativo'
  },
  {
    id: 'h4',
    name: 'Hospital Josina Machel',
    municipality: 'Ingombota',
    distance: '6.7 km',
    specialties: ['Neurologia', 'Cardiologia', 'Oftalmologia', 'Urgência Geral'],
    avgWaitTime: '45 min',
    doctorsCount: 55,
    hours: '24h/24h',
    integrationState: 'Ativo'
  },
  {
    id: 'h5',
    name: 'Centro de Saúde do Cazenga',
    municipality: 'Cazenga',
    distance: '8.2 km',
    specialties: ['Clínica Geral', 'Apoio Nutricional', 'Triagem de Malária'],
    avgWaitTime: '20 min',
    doctorsCount: 19,
    hours: '07:30 - 20:00',
    integrationState: 'Ativo'
  },
  {
    id: 'h6',
    name: 'Clínica Sagrada Esperança',
    municipality: 'Maianga',
    distance: '4.9 km',
    specialties: ['Medicina de Diagnóstico', 'Ginecologia', 'Pediatria', 'Cardiologia'],
    avgWaitTime: '12 min',
    doctorsCount: 50,
    hours: '24h/24h',
    integrationState: 'Ativo'
  }
];

export const MOCK_FIRST_AID: FirstAidTopic[] = [
  {
    id: 'fa-burn',
    title: 'Queimaduras',
    icon: 'Flame',
    description: 'Lesões na pele causadas pelo calor, eletricidade, produtos químicos ou radiação. A intervenção rápida reduz as sequelas.',
    steps: [
      'Arrefeça a área queimada com água fria corrente (não gelada) durante pelo menos 10 a 15 minutos.',
      'Não aplique pasta de dentes, manteiga, óleos ou pomadas caseiras na queimadura.',
      'Remova anéis, pulseiras ou roupas apertadas antes que a zona comece a inchar.',
      'Não rompa as bolhas de água que possam surgir, para evitar infeções na pele exposta.',
      'Cubra a queimadura levemente com uma gaze estéril ou um pano limpo e húmido.'
    ],
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400',
    dangerSignals: [
      'Queimaduras no rosto, mãos, pés, articulações ou genitais.',
      'Queimadura profunda (pele esbranquiçada ou carbonizada/negra).',
      'Queimadura de extensão superior à palma da mão da vítima.'
    ]
  },
  {
    id: 'fa-cuts',
    title: 'Cortes & Hemorragias',
    icon: 'Scissors',
    description: 'Rupturas na pele com perda de sangue. O objetivo principal é conter o sangramento e evitar infeções bacterianas.',
    steps: [
      'Lave as suas mãos e, se possível, coloque luvas de proteção para evitar contaminações.',
      'Pressione firmemente a ferida com uma gaze estéril, pano limpo ou compressa.',
      'Se o sangue passar pela compressa, coloque outra por cima sem retirar a primeira.',
      'Se a ferida for num braço ou perna, eleve o membro acima do nível do coração para abrandar o fluxo.',
      'Após parar o sangramento, lave suavemente a ferida com água corrente e sabão neutro.',
      'Aplique um penso rápido ou gaze protetora limpa sobre o corte.'
    ],
    image: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=400',
    dangerSignals: [
      'Sangue que jorra com força ou pulsa de forma ritmada da ferida.',
      'Sangramento que não cessa após 10 minutos de pressão direta contínua.',
      'Corte profundo onde se avista gordura, músculo ou osso.'
    ]
  },
  {
    id: 'fa-seizure',
    title: 'Convulsões',
    icon: 'Activity',
    description: 'Atividade elétrica desordenada no cérebro que causa espasmos musculares violentos e perda temporária de consciência.',
    steps: [
      'Mantenha a calma e ajude a deitar a pessoa de lado para facilitar a respiração e escoamento de saliva.',
      'Proteja a cabeça da pessoa colocando uma almofada, casaco dobrado ou pano macio por baixo.',
      'Afaste todos os objetos duros, pontiagudos ou perigosos ao redor da pessoa em convulsão.',
      'Nunca tente segurar a pessoa ou impedir os seus movimentos musculares involuntários.',
      'Nunca introduza nada na boca da pessoa (incluindo colheres, dedos ou panos).'
    ],
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400',
    dangerSignals: [
      'A crise convulsiva dura mais de 5 minutos seguidos.',
      'A pessoa não recupera a consciência ou tem uma segunda crise logo a seguir.',
      'A vítima está grávida, é diabética ou sofreu ferimentos graves durante os espasmos.'
    ]
  },
  {
    id: 'fa-choking',
    title: 'Engasgamento',
    icon: 'AlertCircle',
    description: 'Obstrução súbita das vias respiratórias por comida ou pequenos objetos, impedindo a passagem de ar para os pulmões.',
    steps: [
      'Se a vítima estiver a tossir de forma eficaz, incentive-a a continuar a tossir fortemente.',
      'Se não conseguir falar ou respirar, coloque-se atrás dela e incline-a ligeiramente para a frente.',
      'Aplique até 5 palmadas firmes nas costas, entre as omoplatas, com a base da mão.',
      'Se não resolver, realize a Manobra de Heimlich: posicione o punho fechado acima do umbigo.',
      'Pressione o abdómen com movimentos rápidos para dentro e para cima, simulando uma tosse.',
      'Repita até 5 vezes a manobra abdominal e alterne com as palmadas.'
    ],
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400',
    dangerSignals: [
      'A vítima deixa de emitir qualquer som, tossir ou respirar de todo.',
      'Os lábios, unhas ou rosto começam a ficar azulados (cianose).',
      'A pessoa perde os sentidos e desmaia por falta de oxigénio.'
    ]
  },
  {
    id: 'fa-stroke',
    title: 'Acidente Vascular Cerebral (AVC)',
    icon: 'ShieldAlert',
    description: 'Interrupção ou redução do fluxo sanguíneo para o cérebro, privando-o de oxigénio e nutrientes básicos.',
    steps: [
      'Lembre-se do teste dos 3 "F": Face, Força e Fala.',
      'Peça à pessoa para sorrir: verifique se um dos lados do rosto está descaído ou paralisado.',
      'Peça para levantar ambos os braços: verifique se um dos membros descai por falta de força.',
      'Peça para dizer uma frase simples: note se a fala está arrastada, confusa ou impercetível.',
      'Se algum destes sinais estiver presente, registe imediatamente a hora em que os sintomas começaram.',
      'Deite a pessoa confortavelmente com a cabeça ligeiramente elevada e desaperte roupas apertadas.'
    ],
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=400',
    dangerSignals: [
      'Paralisia repentina de um dos lados do corpo ou fraqueza severa nas pernas ou braços.',
      'Dificuldade súbita de equilíbrio, tontura extrema ou perda súbita de visão.',
      'Dor de cabeça extremamente forte e sem causa aparente, de início súbito.'
    ]
  },
  {
    id: 'fa-heart',
    title: 'Ataque Cardíaco (Infarto)',
    icon: 'Heart',
    description: 'Bloqueio de uma artéria coronária que irriga o coração, podendo provocar danos irreversíveis no músculo cardíaco.',
    steps: [
      'Peça à pessoa para se sentar e repousar calmamente para reduzir o esforço cardíaco.',
      'Desaperte a camisa, gravata, cinto ou qualquer peça de roupa que dificulte a respiração livre.',
      'Pergunte se ela toma medicação cardíaca receitada (como nitroglicerina) e ajude-a a tomá-la.',
      'Se estiver consciente e não tiver alergia, mastigar uma aspirina (AAS) pode ajudar a diluir coágulos.',
      'Mantenha vigilância contínua na respiração e batimento cardíaco da vítima.',
      'Prepare-se para iniciar manobras de reanimação cardiopulmonar (RCP) caso ela perca a consciência.'
    ],
    image: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=400',
    dangerSignals: [
      'Dor ou aperto forte no peito que se espalha para o pescoço, mandíbula, costas ou braço esquerdo.',
      'Falta de ar intensa, palpitações rápidas, suor frio abundante e palidez cutânea.',
      'Sensação iminente de desmaio, tontura súbita ou náuseas extremas acompanhadas de dor torácica.'
    ]
  },
  {
    id: 'fa-malaria',
    title: 'Prevenção da Malária',
    icon: 'Bug',
    description: 'A malária é uma doença infecciosa causada por parasitas do género Plasmodium, transmitida pela picada de mosquitos Anopheles infectados.',
    steps: [
      'Redes Mosquiteiras: Use redes tratadas com inseticida ao dormir',
      'Repelentes: Aplique repelente de mosquitos na pele exposta',
      'Roupas Adequadas: Use roupas de manga comprida ao anoitecer',
      'Medicação Preventiva: Consulte um médico sobre profilaxia'
    ],
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400',
    dangerSignals: [
      'Febre alta e calafrios',
      'Dores de cabeça intensas',
      'Dores musculares e articulares',
      'Náuseas e vómitos',
      'Cansaço extremo'
    ]
  }
];

export const INITIAL_EVALUATIONS: DriaEvaluation[] = [
  {
    id: 'ev_ebola',
    patientName: 'João Bernardo',
    patientAge: 34,
    patientGender: 'Masculino',
    patientWeight: 70,
    patientHeight: 1.75,
    patientMunicipality: 'Maianga',
    symptoms: 'Febre elevada de início repentino medida em 39.8ºC, vómitos frequentes, diarreia e contacto recente com um caso confirmado que faleceu de febre hemorrágica há 6 dias. Dor de cabeça severa, mialgias intensas e fraqueza debilitante.',
    photos: [],
    allergies: 'Sem alergias conhecidas.',
    diseases: 'Nenhuma doença crónica conhecida.',
    medications: 'Nenhuma medicação de uso habitual.',
    aiSummary: 'Com base nas informações fornecidas, foram identificados sintomas compatíveis com um caso suspeito de Doença por Vírus Ébola, incluindo febre elevada, vómitos e contacto recente com um caso confirmado. Recomenda-se isolamento imediato, evitar contacto com outras pessoas e dirigir-se urgentemente à unidade de saúde indicada. A equipa hospitalar será previamente notificada para preparar o atendimento em segurança.',
    possibleCauses: ['Doença por Vírus Ébola (Suspeito)', 'Febre de Lassa', 'Malária Grave Hemorrágica'],
    suggestedSpecialty: 'Infectologia / Unidade de Isolamento de Biossegurança',
    priority: 'Emergência',
    recommendations: [
      'Isolamento imediato de forma a evitar qualquer contacto físico com outras pessoas.',
      'Evitar a partilha de utensílios, talheres, roupas ou instalações sanitárias.',
      'Dirigir-se de forma urgente à unidade de saúde indicada de forma segura.',
      'A equipa hospitalar e a equipa de resposta rápida (MINSA) foram previamente notificadas.'
    ],
    goToHospital: true,
    submittedHospitalId: 'h4',
    submittedHospitalName: 'Hospital Josina Machel',
    submissionTime: '04/07/2026 08:30',
    doctorConfirmedDiagnosis: null,
    doctorExams: ['RT-PCR para Vírus Ébola', 'Hemograma Completo', 'Bioquímica Sanguínea'],
    doctorObservations: 'Paciente aguarda isolamento no pavilhão de contingência de alto risco. Preparados todos os protocolos de biossegurança de nível 4.',
    doctorStatus: 'Aguardando',
    emergencyContact: '+244 923 000 444'
  },
  {
    id: 'ev1',
    patientName: 'Edlasio Galhardo',
    patientAge: 28,
    patientGender: 'Masculino',
    patientWeight: 74,
    patientHeight: 1.78,
    patientMunicipality: 'Viana',
    symptoms: 'Febre alta constante medida em 39.2ºC, calafrios severos e tremores intensos por episódios. Sinto fortes dores musculares por todo o corpo, fadiga extrema e dor de cabeça pulsante há cerca de 3 dias. Hoje de manhã tive episódios de náuseas.',
    photos: ['https://i.postimg.cc/ s24k4tkd/1-Desktop.png'],
    allergies: 'Nenhuma alergia conhecida a medicamentos.',
    diseases: 'Hipertensão leve controlada.',
    medications: 'Nenhum medicamento de uso contínuo.',
    aiSummary: 'O paciente apresenta um quadro clínico clássico compatível com infeção parasitária por Plasmodium (Malária). A febre alta cíclica associada a tremores intensos e mialgia severa em região endémica (Angola) aponta fortemente para este diagnóstico preliminar. Apresenta ainda sinais moderados de desidratação devido ao esforço térmico.',
    possibleCauses: ['Malária por P. falciparum', 'Dengue Clássica', 'Febre Tifóide'],
    suggestedSpecialty: 'Infectologia / Medicina Interna',
    priority: 'Urgente',
    recommendations: [
      'Realizar imediatamente um teste rápido de Malária (gota espessa).',
      'Manter hidratação oral rigorosa com água e sais de reidratação oral.',
      'Evitar a auto-medicação com anti-inflamatórios que possam agravar eventuais quadros hemorrágicos.',
      'Dirigir-se ao posto de saúde mais próximo para confirmação laboratorial e início de terapêutica com derivados de artemisinina.'
    ],
    goToHospital: true,
    submittedHospitalId: 'h1',
    submittedHospitalName: 'Hospital Geral de Luanda',
    submissionTime: '14/06/2026 09:20',
    doctorConfirmedDiagnosis: 'Malária por Plasmodium falciparum confirmada por gota espessa.',
    doctorExams: ['Gota Espessa (Positiva +++)', 'Hemograma Completo', 'Função Renal & Hepática'],
    doctorObservations: 'Paciente deu entrada estável, confirmou-se malária. Iniciou tratamento com Coartem (artemether + lumefantrina). Recomenda-se repouso de 5 dias e controlo de febre com Paracetamol.',
    doctorStatus: 'Alta',
    emergencyContact: '+244 923 000 111'
  },
  {
    id: 'ev2',
    patientName: 'Maria Manuel',
    patientAge: 32,
    patientGender: 'Feminino',
    patientWeight: 62,
    patientHeight: 1.65,
    patientMunicipality: 'Cazenga',
    symptoms: 'Início repentino de diarreia aquosa extremamente abundante, assemelhando-se a água de arroz, sem dor abdominal, acompanhada de vómitos frequentes e sede insaciável nas últimas 12 horas. Apresento cãibras musculares severas nas pernas e sinto-me extremamente fraca, com dificuldades em manter-me de pé.',
    photos: [],
    allergies: 'Alergia à Penicilina.',
    diseases: 'Sem antecedentes de doenças crónicas relevantes.',
    medications: 'Não toma medicação habitual.',
    aiSummary: 'O quadro de diarreia aquosa profusa ("água de arroz") de início abrupto com vómitos e desidratação grave (sede, cãibras, fraqueza) em área periurbana levanta forte suspeita epidemiológica de Cólera. Risco imediato de choque hipovolémico por depleção rápida de fluidos.',
    possibleCauses: ['Cólera Humana (Infeção por V. cholerae)', 'Gastroenterite Aguda Severa', 'Infeção por Escherichia coli Enterotoxigénica'],
    suggestedSpecialty: 'Infectologia / Cuidados Intensivos',
    priority: 'Urgente',
    recommendations: [
      'Ingestão imediata e contínua de Soro de Reidratação Oral (SRO) em grandes volumes.',
      'Deslocação urgente em ambulância ou transporte direto para uma Unidade de Tratamento de Cólera (UTC).',
      'Não administrar anti-diarreicos (loperamida) que bloqueiam o trânsito intestinal e retêm a toxina no organismo.',
      'Isolamento de utensílios e higienização rigorosa das mãos com água tratada ou álcool em gel para evitar contágio familiar.'
    ],
    goToHospital: true,
    submittedHospitalId: 'h2',
    submittedHospitalName: 'Hospital Américo Boavida',
    submissionTime: '14/06/2026 10:15',
    doctorConfirmedDiagnosis: null,
    doctorExams: [],
    doctorObservations: null,
    doctorStatus: 'Aguardando',
    emergencyContact: '+244 912 345 678'
  },
  {
    id: 'ev3',
    patientName: 'Pedro Neto',
    patientAge: 45,
    patientGender: 'Masculino',
    patientWeight: 68,
    patientHeight: 1.72,
    patientMunicipality: 'Cacuaco',
    symptoms: 'Tosse seca e produtiva há mais de 3 semanas, por vezes com esputo amarelado e vestígios ligeiros de sangue. Sinto febre baixa ao final da tarde, suores noturnos abundantes que molham a cama e perdi cerca de 6 kg de peso no último mês sem fazer dieta. Fadiga diária constante.',
    photos: [],
    allergies: 'Sem alergias conhecidas.',
    diseases: 'Fumador ativo (10 cigarros/dia).',
    medications: 'Toma paracetamol esporádico para febre.',
    aiSummary: 'A tríade clássica de tosse crónica produtiva (há mais de 21 dias), febre vespertina com suores noturnos e perda de peso acentuada em Angola é altamente sugestiva de Tuberculose Pulmonar Ativa. A tosse com sangue (hemoptise ligeira) corrobora a gravidade do acometimento pulmonar.',
    possibleCauses: ['Tuberculose Pulmonar (M. tuberculosis)', 'Pneumonia Bacteriana Crónica', 'Neoplasia Pulmonar'],
    suggestedSpecialty: 'Pneumologia / Infectologia',
    priority: 'Moderado',
    recommendations: [
      'Agendar consulta para realização de teste de expetoração (Pesquisa de BAAR / GeneXpert).',
      'Utilizar máscara cirúrgica em casa para evitar a transmissão por gotículas a familiares.',
      'Manter divisões da casa bem ventiladas e ensolaradas (o sol destrói a bactéria).',
      'Não interromper a avaliação clínica mesmo que os sintomas aliviem.'
    ],
    goToHospital: true,
    submittedHospitalId: 'h3',
    submittedHospitalName: 'Centro de Saúde de Cacuaco',
    submissionTime: '14/06/2026 11:45',
    doctorConfirmedDiagnosis: 'Tuberculose Pulmonar Ativa Bacilífera.',
    doctorExams: ['GeneXpert em Expetoração (Positivo)', 'Radiografia de Tórax (Infiltrado apical esquerdo)'],
    doctorObservations: 'Paciente encaminhado para o Programa Nacional de Controlo da Tuberculose. Iniciado esquema terapêutico padrão de 6 meses (Rifampicina, Isoniazida, Pirazinamida, Etambutol). Notificação obrigatória efetuada.',
    doctorStatus: 'Alta',
    emergencyContact: '+244 934 111 222'
  },
  {
    id: 'ev4',
    patientName: 'Ana Sousa',
    patientAge: 18,
    patientGender: 'Feminino',
    patientWeight: 54,
    patientHeight: 1.62,
    patientMunicipality: 'Belas',
    symptoms: 'Febre alta medida em 38.8ºC iniciada há 4 dias, conjuntivite (olhos vermelhos, lacrimejantes e com sensibilidade à luz), coriza intensa e tosse seca irritativa. Há 24 horas surgiram manchas vermelhas planas (exantema maculopapular) na pele, começando atrás das orelhas e no rosto, espalhando-se agora pelo pescoço e tórax.',
    photos: [],
    allergies: 'Nenhuma alergia relatada.',
    diseases: 'Asma na infância.',
    medications: 'Inalador de resgate em SOS.',
    aiSummary: 'A apresentação clínica combinando pródromo febril, sintomas respiratórios acentuados (tosse, coriza), conjuntivite fotofóbica intensa e o padrão de progressão cefalocaudal do exantema maculopapular é patognomónico de Sarampo. Altamente contagioso.',
    possibleCauses: ['Sarampo', 'Rubéola', 'Roséola Infantil (menos comum nesta idade)'],
    suggestedSpecialty: 'Pediatria / Clínica Geral / Infectologia',
    priority: 'Urgente',
    recommendations: [
      'Isolamento domiciliário estrito imediato para prevenir propagação comunitária.',
      'Administração de Vitamina A sob recomendação médica para prevenir complicações oculares e pulmonares.',
      'Controlo sintomático da febre com antipiréticos recomendados (evitar aspirina em jovens pelo risco de Síndrome de Reye).',
      'Hidratação abundante e repouso absoluto.'
    ],
    goToHospital: true,
    submittedHospitalId: 'h5',
    submittedHospitalName: 'Centro de Saúde do Cazenga',
    submissionTime: '14/06/2026 14:02',
    doctorConfirmedDiagnosis: 'Sarampo Clínico.',
    doctorExams: ['Sorologia IgM para Sarampo (Pendente)', 'Hemograma'],
    doctorObservations: 'Quadro clínico típico. Administrada primeira dose de Vitamina A (200.000 UI) e prescrito Paracetamol. Emitida baixa médica de isolamento por 7 dias. Monitorar sinais de esforço respiratório.',
    doctorStatus: 'Alta',
    emergencyContact: '+244 921 777 888'
  }
];
