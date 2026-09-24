/**
 * Mock Database & State for Salinha Produtiva Redação
 * Professora: Cristine Teixeira
 */

const INITIAL_DATA = {
  activeRole: 'teacher', // 'teacher' | 'student'
  currentStudentId: 'alu-1', // default student for student view

  turmas: [
    {
      id: 'turma-1',
      nome: 'Extensivo Medicina ENEM 2026',
      dias: 'Segunda e Quarta • 14:00 às 17:00',
      totalAlunos: 18,
      mediaGeral: 924,
      cor: '#7C3AED',
      badge: 'Medicina'
    },
    {
      id: 'turma-2',
      nome: 'UEA Macro Intensivo',
      dias: 'Terça e Quinta • 18:30 às 21:30',
      totalAlunos: 14,
      mediaGeral: 895,
      cor: '#2563EB',
      badge: 'Vestibular Regional'
    },
    {
      id: 'turma-3',
      nome: 'ENEM Nota 1000 - Sábado',
      dias: 'Sábado • 08:30 às 12:30',
      totalAlunos: 16,
      mediaGeral: 878,
      cor: '#D97706',
      badge: 'ENEM Geral'
    },
    {
      id: 'turma-4',
      nome: 'Mentoria Individual VIP',
      dias: 'Horários Flexíveis / Quinzenal',
      totalAlunos: 5,
      mediaGeral: 948,
      cor: '#059669',
      badge: 'Personalizado'
    }
  ],

  alunos: [
    {
      id: 'alu-1',
      nome: 'Sofia Barbosa de Paula',
      turmaId: 'turma-1',
      turmaNome: 'Extensivo Medicina ENEM 2026',
      email: 'sofia.barbosa@gmail.com',
      whatsapp: '(92) 98144-8890',
      meta: 'Medicina (UEA / UFAM / ENEM)',
      avatar: 'assets/student-sofia.png',
      mediaAtual: 960,
      redacoesEnviadas: 14,
      status: 'Ativo',
      evolucao: [
        { data: '05/Jun', nota: 780, tema: 'Saúde Mental na Adolescência' },
        { data: '22/Jun', nota: 820, tema: 'Mobilidade Urbana e Desigualdade' },
        { data: '12/Jul', nota: 880, tema: 'Consumo e Sustentabilidade' },
        { data: '04/Ago', nota: 920, tema: 'Inteligência Artificial no Trabalho' },
        { data: '28/Ago', nota: 940, tema: 'Acesso à Leitura e Cidadania' },
        { data: '22/Set', nota: 960, tema: 'Invisibilidade do Trabalho de Cuidado' }
      ]
    },
    {
      id: 'alu-2',
      nome: 'Ana Clara Viana Castro',
      turmaId: 'turma-2',
      turmaNome: 'UEA Macro Intensivo',
      email: 'anaclara.castro@outlook.com',
      whatsapp: '(92) 99233-5678',
      meta: 'Odontologia UEA (Aprovada!)',
      avatar: 'assets/student-ana-clara.png',
      mediaAtual: 940,
      redacoesEnviadas: 12,
      status: 'Aprovado',
      evolucao: [
        { data: '10/Mai', nota: 760, tema: 'Patrimônio Histórico' },
        { data: '02/Jun', nota: 840, tema: 'Segurança Alimentar' },
        { data: '25/Jun', nota: 880, tema: 'Bioeconomia Amazônica' },
        { data: '15/Jul', nota: 920, tema: 'Direito à Moradia' },
        { data: '18/Set', nota: 940, tema: 'Biomas Amazônicos e Sustentabilidade' }
      ]
    },
    {
      id: 'alu-3',
      nome: 'Pedro Lucas de Oliveira',
      turmaId: 'turma-2',
      turmaNome: 'UEA Macro Intensivo',
      email: 'pedro.lucas.olv@gmail.com',
      whatsapp: '(92) 98411-9988',
      meta: 'Direito UFAM',
      avatar: null,
      iniciais: 'PL',
      avatarBg: '#8B5CF6',
      mediaAtual: 880,
      redacoesEnviadas: 9,
      status: 'Ativo',
      evolucao: [
        { data: '15/Jun', nota: 720, tema: 'Crise Hídrica' },
        { data: '05/Jul', nota: 800, tema: 'Redes Sociais e Fake News' },
        { data: '02/Ago', nota: 840, tema: 'Inclusão de PcD' },
        { data: '10/Set', nota: 880, tema: 'Evasão Escolar no Ensino Médio' }
      ]
    },
    {
      id: 'alu-4',
      nome: 'Beatriz Lima Fernandes',
      turmaId: 'turma-1',
      turmaNome: 'Extensivo Medicina ENEM 2026',
      email: 'bia.lima@hotmail.com',
      whatsapp: '(92) 99122-3344',
      meta: 'Medicina UEA',
      avatar: null,
      iniciais: 'BL',
      avatarBg: '#EC4899',
      mediaAtual: 920,
      redacoesEnviadas: 11,
      status: 'Ativo',
      evolucao: [
        { data: '12/Jun', nota: 800, tema: 'Povos Indígenas' },
        { data: '08/Jul', nota: 860, tema: 'Doação de Órgãos' },
        { data: '18/Ago', nota: 900, tema: 'Educação Financeira' },
        { data: '15/Set', nota: 920, tema: 'Trabalho de Cuidado' }
      ]
    },
    {
      id: 'alu-5',
      nome: 'Gabriel Souza Santos',
      turmaId: 'turma-3',
      turmaNome: 'ENEM Nota 1000 - Sábado',
      email: 'gabriel.santos@gmail.com',
      whatsapp: '(92) 98877-6655',
      meta: 'Engenharia da Computação',
      avatar: null,
      iniciais: 'GS',
      avatarBg: '#0284C7',
      mediaAtual: 860,
      redacoesEnviadas: 8,
      status: 'Ativo',
      evolucao: [
        { data: '20/Jul', nota: 740, tema: 'Cidades Inteligentes' },
        { data: '15/Ago', nota: 820, tema: 'Privacidade Digital' },
        { data: '10/Set', nota: 860, tema: 'Inteligência Artificial' }
      ]
    },
    {
      id: 'alu-6',
      nome: 'Mariana Albuquerque Dias',
      turmaId: 'turma-4',
      turmaNome: 'Mentoria Individual VIP',
      email: 'mariana.dias@gmail.com',
      whatsapp: '(92) 99344-7711',
      meta: 'Psicologia UFAM',
      avatar: null,
      iniciais: 'MA',
      avatarBg: '#10B981',
      mediaAtual: 910,
      redacoesEnviadas: 10,
      status: 'Ativo',
      evolucao: [
        { data: '01/Jul', nota: 780, tema: 'Empatia e Convivência' },
        { data: '01/Ago', nota: 860, tema: 'Burnout e Sociedade do Cansaço' },
        { data: '01/Set', nota: 910, tema: 'Trabalho de Cuidado' }
      ]
    }
  ],

  temas: [
    {
      id: 'tema-1',
      titulo: 'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado no Brasil',
      eixo: 'Sociedade & Cidadania',
      prazo: '2026-09-28T23:59',
      formato: 'ENEM (0 - 1000)',
      turmasDestino: ['turma-1', 'turma-3', 'turma-4'],
      alunosDestino: [],
      status: 'Ativo',
      motivo: 'Tema oficial com enfoque em direitos sociais, sobrecarga de gênero e ausência de suporte estatal.',
      textosMotivadores: [
        {
          titulo: 'Texto I - O Trabalho Invisível',
          conteúdo: 'O trabalho de cuidado inclui o cuidado de crianças, idosos e pessoas com deficiência, além das tarefas domésticas não remuneradas essenciais para a reprodução da força de trabalho.'
        },
        {
          titulo: 'Texto II - Dados do IBGE',
          conteúdo: 'As mulheres dedicam em média 21,3 horas semanais ao trabalho doméstico e de cuidado, enquanto os homens dedicam apenas 10,6 horas semanais.'
        },
        {
          titulo: 'Texto III - Perspectiva Econômica',
          conteúdo: 'Se o trabalho não remunerado fosse contabilizado no PIB brasileiro, ele representaria entre 8,5% e 11% de toda a riqueza nacional produzida anualmente.'
        }
      ]
    },
    {
      id: 'tema-2',
      titulo: 'Caminhos para combater a evasão escolar no ensino médio brasileiro',
      eixo: 'Educação & Juventude',
      prazo: '2026-09-26T23:59',
      formato: 'ENEM (0 - 1000)',
      turmasDestino: ['turma-2'],
      alunosDestino: [],
      status: 'Ativo',
      motivo: 'Abordar vulnerabilidade socioeconômica, descompasso curricular e novas políticas públicas como o Pé-de-Meia.',
      textosMotivadores: [
        {
          titulo: 'Texto I - Censo Escolar',
          conteúdo: 'Mais de 500 mil jovens abandonam o ensino médio a cada ano no Brasil, a maioria para complementar a renda familiar.'
        },
        {
          titulo: 'Texto II - A Atratividade da Escola',
          conteúdo: 'Estudantes apontam o desinteresse pelo modelo tradicional de ensino e a falta de infraestrutura prática como grandes desmotivadores.'
        }
      ]
    },
    {
      id: 'tema-3',
      titulo: 'Impactos do avanço da inteligência artificial generativa na soberania do trabalho humano',
      eixo: 'Ciência & Tecnologia',
      prazo: '2026-10-05T23:59',
      formato: 'ENEM (0 - 1000)',
      turmasDestino: ['turma-1', 'turma-2', 'turma-3', 'turma-4'],
      alunosDestino: [],
      status: 'Ativo',
      motivo: 'Debate contemporâneo sobre automação, ética, precarização e requalificação profissional.',
      textosMotivadores: [
        {
          titulo: 'Texto I - O Futuro dos Empregos (FMI)',
          conteúdo: 'Aproximadamente 40% dos empregos globais serão expostos ao impacto de tecnologias de IA generativa nos próximos anos.'
        }
      ]
    },
    {
      id: 'tema-4',
      titulo: 'A preservação dos biomas amazônicos e o desenvolvimento sustentável regional',
      eixo: 'Meio Ambiente & Amazônia',
      prazo: '2026-09-18T23:59',
      formato: 'UEA Macro / ENEM',
      turmasDestino: ['turma-2'],
      alunosDestino: [],
      status: 'Encerrado',
      motivo: 'Eixo crucial para os vestibulares do Amazonas (UEA / UFAM) e propostas de bioeconomia.',
      textosMotivadores: [
        {
          titulo: 'Texto I - Bioeconomia na Floresta',
          conteúdo: 'Como aliar a conservação da biodiversidade com a geração de emprego e renda digna para os povos da floresta.'
        }
      ]
    }
  ],

  redacoes: [
    {
      id: 'red-1',
      alunoId: 'alu-1',
      alunoNome: 'Sofia Barbosa de Paula',
      alunoAvatar: 'assets/student-sofia.png',
      temaId: 'tema-1',
      temaTitulo: 'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado no Brasil',
      dataEnvio: '22/09/2026 16:42',
      status: 'Corrigida',
      imagemUrl: 'assets/mock-essays/redacao-enem-sofia.svg',
      notas: {
        c1: 200, // Norma culta
        c2: 180, // Compreensão do tema / Repertório
        c3: 180, // Argumentação e projeto de texto
        c4: 200, // Coesão e conectivos
        c5: 200, // Proposta de intervenção
        total: 960
      },
      comentariosGerais: 'Sofia, sua redação está impecável! Você articulou com muita precisão os repertórios de Simone de Beauvoir e Zygmunt Bauman com a realidade brasileira. Sua proposta de intervenção na C5 cumpriu com louvor todos os 5 elementos (Agente: Ministério do Desenvolvimento Social; Ação: instituir plano nacional; Meio: alocação de verbas orçamentárias; Detalhamento: expansão de creches nas periferias; Efeito: superar o silêncio histórico). Para batermos o tão sonhado 1000, recomendo apenas intensificar a criticidade autoral no fechamento do D1. Você está pronta para a nota mil!',
      audioFeedbackUrl: 'mock-audio',
      annotations: [
        {
          id: 'ann-1',
          type: 'highlight',
          color: '#10B981', // Verde = Ponto Forte
          label: 'Ponto Forte • C2',
          x: 70,
          y: 200,
          w: 650,
          h: 30,
          comment: 'Repertório filosófico muito bem contextualizado (Simone de Beauvoir).'
        },
        {
          id: 'ann-2',
          type: 'highlight',
          color: '#3B82F6', // Azul = Argumentação / C3
          label: 'Projeto de Texto • C3',
          x: 44,
          y: 135,
          w: 690,
          h: 30,
          comment: 'Tese clara, bifurcada e perfeitamente antecipada na introdução.'
        },
        {
          id: 'ann-3',
          type: 'highlight',
          color: '#8B5CF6', // Roxo = Proposta C5
          label: 'Intervenção Completa • C5',
          x: 44,
          y: 475,
          w: 690,
          h: 175,
          comment: 'Intervenção nota 200! Todos os 5 elementos presentes e detalhados.'
        },
        {
          id: 'ann-4',
          type: 'comment',
          color: '#F59E0B',
          x: 720,
          y: 215,
          comment: 'Dica da Prof.ª Cristine: esse parágrafo ficou com uma cadência argumentativa excelente!'
        }
      ]
    },
    {
      id: 'red-2',
      alunoId: 'alu-3',
      alunoNome: 'Pedro Lucas de Oliveira',
      alunoAvatar: null,
      alunoIniciais: 'PL',
      alunoBg: '#8B5CF6',
      temaId: 'tema-2',
      temaTitulo: 'Caminhos para combater a evasão escolar no ensino médio brasileiro',
      dataEnvio: '23/09/2026 19:15',
      status: 'Pendente',
      imagemUrl: 'assets/mock-essays/redacao-enem-pedro.svg',
      notas: null,
      comentariosGerais: '',
      audioFeedbackUrl: null,
      annotations: []
    },
    {
      id: 'red-3',
      alunoId: 'alu-2',
      alunoNome: 'Ana Clara Viana Castro',
      alunoAvatar: 'assets/student-ana-clara.png',
      temaId: 'tema-4',
      temaTitulo: 'A preservação dos biomas amazônicos e o desenvolvimento sustentável regional',
      dataEnvio: '18/09/2026 10:10',
      status: 'Corrigida',
      imagemUrl: 'assets/mock-essays/redacao-enem-sofia.svg',
      notas: {
        c1: 200,
        c2: 180,
        c3: 180,
        c4: 180,
        c5: 200,
        total: 940
      },
      comentariosGerais: 'Ana Clara, parabéns pela produção! O foco na UEA Macro foi atingido com maestria. Excelente articulação de vocabulário e repertório regional.',
      audioFeedbackUrl: 'mock-audio',
      annotations: [
        {
          id: 'ann-ac-1',
          type: 'highlight',
          color: '#10B981',
          label: 'Ponto Forte',
          x: 44,
          y: 140,
          w: 690,
          h: 28,
          comment: 'Ótima delimitação da problemática.'
        }
      ]
    },
    {
      id: 'red-4',
      alunoId: 'alu-4',
      alunoNome: 'Beatriz Lima Fernandes',
      alunoAvatar: null,
      alunoIniciais: 'BL',
      alunoBg: '#EC4899',
      temaId: 'tema-1',
      temaTitulo: 'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado no Brasil',
      dataEnvio: '23/09/2026 21:05',
      status: 'Pendente',
      imagemUrl: 'assets/mock-essays/redacao-enem-sofia.svg',
      notas: null,
      comentariosGerais: '',
      audioFeedbackUrl: null,
      annotations: []
    }
  ]
};

// Global Store Helper with LocalStorage Persistence
class Store {
  constructor() {
    const saved = localStorage.getItem('salinha_produtiva_state_v1');
    if (saved) {
      try {
        this.data = JSON.parse(saved);
      } catch (e) {
        this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
      }
    } else {
      this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    }
  }

  save() {
    localStorage.setItem('salinha_produtiva_state_v1', JSON.stringify(this.data));
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.save();
    window.location.reload();
  }

  setRole(role) {
    this.data.activeRole = role;
    this.save();
  }

  setCurrentStudent(studentId) {
    this.data.currentStudentId = studentId;
    this.save();
  }

  addStudent(student) {
    student.id = 'alu-' + Date.now();
    student.mediaAtual = 0;
    student.redacoesEnviadas = 0;
    student.evolucao = [];
    student.status = 'Ativo';
    this.data.alunos.unshift(student);
    // increment turma count
    const turma = this.data.turmas.find(t => t.id === student.turmaId);
    if (turma) turma.totalAlunos++;
    this.save();
    return student;
  }

  addTurma(turma) {
    turma.id = 'turma-' + Date.now();
    turma.totalAlunos = 0;
    turma.mediaGeral = 0;
    this.data.turmas.push(turma);
    this.save();
    return turma;
  }

  addTema(tema) {
    tema.id = 'tema-' + Date.now();
    tema.status = 'Ativo';
    this.data.temas.unshift(tema);
    this.save();
    return tema;
  }

  submitRedacao(submission) {
    const redacao = {
      id: 'red-' + Date.now(),
      alunoId: submission.alunoId,
      alunoNome: submission.alunoNome,
      alunoAvatar: submission.alunoAvatar || null,
      alunoIniciais: submission.alunoIniciais || 'AL',
      alunoBg: '#7C3AED',
      temaId: submission.temaId,
      temaTitulo: submission.temaTitulo,
      dataEnvio: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      status: 'Pendente',
      imagemUrl: submission.imagemUrl || 'assets/mock-essays/redacao-enem-sofia.svg',
      notas: null,
      comentariosGerais: '',
      audioFeedbackUrl: null,
      annotations: []
    };
    this.data.redacoes.unshift(redacao);

    // Update student stats
    const aluno = this.data.alunos.find(a => a.id === submission.alunoId);
    if (aluno) {
      aluno.redacoesEnviadas++;
    }

    this.save();
    return redacao;
  }

  saveCorrecao(redacaoId, notas, comentariosGerais, annotations) {
    const redacao = this.data.redacoes.find(r => r.id === redacaoId);
    if (!redacao) return false;

    redacao.status = 'Corrigida';
    redacao.notas = notas;
    redacao.comentariosGerais = comentariosGerais;
    redacao.annotations = annotations;
    redacao.audioFeedbackUrl = 'mock-audio';

    // Update student stats and evolution
    const aluno = this.data.alunos.find(a => a.id === redacao.alunoId);
    if (aluno) {
      const now = new Date();
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const dataLabel = `${String(now.getDate()).padStart(2, '0')}/${monthNames[now.getMonth()]}`;

      aluno.evolucao.push({
        data: dataLabel,
        nota: notas.total,
        tema: redacao.temaTitulo
      });

      // Recalculate average
      const totalNotas = aluno.evolucao.reduce((acc, curr) => acc + curr.nota, 0);
      aluno.mediaAtual = Math.round(totalNotas / aluno.evolucao.length);
    }

    this.save();
    return true;
  }
}

window.appStore = new Store();
