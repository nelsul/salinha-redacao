/**
 * Salinha Produtiva Redação - Application Controller
 * Prof.ª Cristine Teixeira
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.appStore;
  let activeTab = 'dashboard';
  let currentHighlighter = null;
  let currentGradingRedacaoId = null;

  // DOM Elements
  const appContainer = document.getElementById('app-main');
  const roleButtons = document.querySelectorAll('.role-btn');
  const studentSelector = document.getElementById('global-student-select');
  const studentSelectWrap = document.getElementById('student-select-wrap');
  const navTabsContainer = document.getElementById('nav-tabs-container');
  const userProfileDisplay = document.getElementById('user-profile-display');

  // Initialize
  initRoleAndNav();
  renderApp();

  // Role Switchers
  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      store.setRole(role);
      roleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      initRoleAndNav();
      renderApp();
      showToast(`Alternado para ${role === 'teacher' ? 'Visão da Professora Cristine' : 'Visão do Aluno'}`);
    });
  });

  // Student Switcher (in Student Mode)
  if (studentSelector) {
    populateStudentSelector();
    studentSelector.addEventListener('change', (e) => {
      store.setCurrentStudent(e.target.value);
      initRoleAndNav();
      renderApp();
      showToast(`Visualizando como ${getSelectedStudent().nome}`);
    });
  }

  // Demo Reset
  const resetBtn = document.getElementById('btn-reset-demo');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Deseja restaurar os dados de demonstração da Salinha Produtiva?')) {
        store.reset();
      }
    });
  }

  function populateStudentSelector() {
    studentSelector.innerHTML = '';
    store.data.alunos.forEach(aluno => {
      const opt = document.createElement('option');
      opt.value = aluno.id;
      opt.textContent = `${aluno.nome} (${aluno.turmaNome})`;
      if (aluno.id === store.data.currentStudentId) opt.selected = true;
      studentSelector.appendChild(opt);
    });
  }

  function getSelectedStudent() {
    return store.data.alunos.find(a => a.id === store.data.currentStudentId) || store.data.alunos[0];
  }

  function initRoleAndNav() {
    const isTeacher = store.data.activeRole === 'teacher';
    studentSelectWrap.style.display = isTeacher ? 'none' : 'flex';

    // Update Header Profile Badge
    if (isTeacher) {
      userProfileDisplay.innerHTML = `
        <img src="assets/logo.png" class="user-avatar-small" alt="Prof.ª Cristine">
        <div class="user-name-role">
          <span class="name">Prof.ª Cristine Teixeira</span>
          <span class="role-label">Fundadora &amp; Mentora</span>
        </div>
      `;
    } else {
      const student = getSelectedStudent();
      const avatarHtml = student.avatar
        ? `<img src="${student.avatar}" class="user-avatar-small" alt="${student.nome}">`
        : `<div class="user-avatar-small" style="background:${student.avatarBg || '#7C3AED'}">${student.iniciais}</div>`;

      userProfileDisplay.innerHTML = `
        ${avatarHtml}
        <div class="user-name-role">
          <span class="name">${student.nome}</span>
          <span class="role-label">${student.turmaNome}</span>
        </div>
      `;
    }

    // Render Nav Tabs
    renderNavTabs(isTeacher);
  }

  function renderNavTabs(isTeacher) {
    const pendingCount = store.data.redacoes.filter(r => r.status === 'Pendente').length;

    if (isTeacher) {
      navTabsContainer.innerHTML = `
        <button class="nav-tab ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
          <span>📊</span> Visão Geral
        </button>
        <button class="nav-tab ${activeTab === 'fila' ? 'active' : ''}" data-tab="fila">
          <span>✍️</span> Fila de Correção
          ${pendingCount > 0 ? `<span class="nav-counter">${pendingCount}</span>` : ''}
        </button>
        <button class="nav-tab ${activeTab === 'alunos' ? 'active' : ''}" data-tab="alunos">
          <span>👥</span> Alunos Cadastrados
        </button>
        <button class="nav-tab ${activeTab === 'turmas' ? 'active' : ''}" data-tab="turmas">
          <span>🏫</span> Turmas
        </button>
        <button class="nav-tab ${activeTab === 'temas' ? 'active' : ''}" data-tab="temas">
          <span>📚</span> Temas &amp; Prazos
        </button>
      `;
    } else {
      navTabsContainer.innerHTML = `
        <button class="nav-tab ${activeTab === 'aluno-dashboard' ? 'active' : ''}" data-tab="aluno-dashboard">
          <span>🎯</span> Meu Painel
        </button>
        <button class="nav-tab ${activeTab === 'aluno-redacoes' ? 'active' : ''}" data-tab="aluno-redacoes">
          <span>📝</span> Minhas Redações &amp; Notas
        </button>
        <button class="nav-tab ${activeTab === 'aluno-temas' ? 'active' : ''}" data-tab="aluno-temas">
          <span>⏳</span> Temas Disponíveis
        </button>
      `;
      if (!activeTab.startsWith('aluno-')) {
        activeTab = 'aluno-dashboard';
      }
    }

    navTabsContainer.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        navTabsContainer.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderApp();
      });
    });
  }

  function renderApp() {
    const isTeacher = store.data.activeRole === 'teacher';

    if (isTeacher) {
      switch (activeTab) {
        case 'dashboard':
          renderTeacherDashboard();
          break;
        case 'fila':
          renderCorrecoesFila();
          break;
        case 'alunos':
          renderAlunosList();
          break;
        case 'turmas':
          renderTurmasList();
          break;
        case 'temas':
          renderTemasList();
          break;
        default:
          renderTeacherDashboard();
      }
    } else {
      switch (activeTab) {
        case 'aluno-dashboard':
          renderStudentDashboard();
          break;
        case 'aluno-redacoes':
          renderStudentRedacoes();
          break;
        case 'aluno-temas':
          renderStudentTemas();
          break;
        default:
          renderStudentDashboard();
      }
    }
  }

  // =========================================================================
  // TEACHER SCREENS
  // =========================================================================

  function renderTeacherDashboard() {
    const pendingRedacoes = store.data.redacoes.filter(r => r.status === 'Pendente');
    const totalCorrigidas = store.data.redacoes.filter(r => r.status === 'Corrigida').length;
    const mediaGeralSalinha = 918;

    appContainer.innerHTML = `
      <!-- Brand Celebration Hero Banner -->
      <div class="brand-hero-banner">
        <div class="hero-text">
          <h3>Salinha Produtiva Redação • Painel Pedagógico</h3>
          <p>Acompanhamento individualizado e rigor ENEM/UEA para lapidar o texto de cada aluno rumo à nota 900+ e aprovações de destaque.</p>
          <div class="hero-badges">
            <span class="hero-tag">✨ Alunos Nota 960+ no ENEM</span>
            <span class="hero-tag">🏆 Aprovações em Medicina e Odontologia UEA</span>
            <span class="hero-tag">📍 Manaus / AM</span>
          </div>
        </div>
        <div class="hero-right-photos">
          <img src="assets/student-sofia.png" class="hero-student-photo" title="Sofia Barbosa (Nota 960)" alt="Sofia">
          <img src="assets/student-ana-clara.png" class="hero-student-photo" title="Ana Clara (Aprovada UEA)" alt="Ana Clara">
          <img src="assets/logo.png" class="hero-student-photo" title="Salinha Produtiva" alt="Logo">
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-value">${store.data.alunos.length}</div>
            <div class="stat-label">Alunos Ativos</div>
          </div>
        </div>
        <div class="stat-card blue">
          <div class="stat-icon">🏫</div>
          <div class="stat-info">
            <div class="stat-value">${store.data.turmas.length}</div>
            <div class="stat-label">Turmas Produtivas</div>
          </div>
        </div>
        <div class="stat-card yellow">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <div class="stat-value">${pendingRedacoes.length}</div>
            <div class="stat-label">Aguardando Correção</div>
          </div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon">🎯</div>
          <div class="stat-info">
            <div class="stat-value">${mediaGeralSalinha}</div>
            <div class="stat-label">Média Geral Salinha</div>
          </div>
        </div>
      </div>

      <!-- Section: Redações Pendentes com Ação Rápida de Correção -->
      <div class="section-header">
        <div class="section-title-wrap">
          <h2>Fila de Redações Recentes</h2>
          <p>Redações enviadas pelos alunos prontas para correção com marcador interativo e grade ENEM</p>
        </div>
        <div class="section-actions">
          <button class="btn btn-secondary btn-sm" id="btn-quick-new-tema">+ Lançar Novo Tema</button>
        </div>
      </div>

      <div class="table-container" style="margin-bottom: 32px;">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Aluno(a)</th>
              <th>Tema da Proposta</th>
              <th>Data de Envio</th>
              <th>Status</th>
              <th>Nota</th>
              <th style="text-align: right;">Ação</th>
            </tr>
          </thead>
          <tbody>
            ${store.data.redacoes.map(red => `
              <tr>
                <td>
                  <div class="student-cell">
                    ${red.alunoAvatar
                      ? `<img src="${red.alunoAvatar}" class="student-avatar" alt="${red.alunoNome}">`
                      : `<div class="student-avatar" style="background:${red.alunoBg || '#7C3AED'}">${red.alunoIniciais || 'AL'}</div>`
                    }
                    <div class="student-meta-info">
                      <div class="name">${red.alunoNome}</div>
                      <div class="sub">ID: #${red.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style="font-weight: 600; color: var(--dark); max-width: 320px; line-height: 1.35;">${red.temaTitulo}</div>
                </td>
                <td><span style="color: var(--slate-500); font-size: 13px;">${red.dataEnvio}</span></td>
                <td>
                  <span class="badge ${red.status === 'Corrigida' ? 'badge-success' : 'badge-warning'}">
                    ${red.status === 'Corrigida' ? '✓ Corrigida' : '⏳ Pendente'}
                  </span>
                </td>
                <td>
                  ${red.notas
                    ? `<span class="score-pill ${red.notas.total >= 900 ? 'grade-1000' : ''}">${red.notas.total} <small>/1000</small></span>`
                    : `<span class="score-pill pending">—</span>`
                  }
                </td>
                <td style="text-align: right;">
                  <button class="btn ${red.status === 'Corrigida' ? 'btn-outline' : 'btn-primary'} btn-sm btn-open-correcao" data-redacao-id="${red.id}">
                    ${red.status === 'Corrigida' ? '👁️ Ver/Editar Correção' : '✏️ Corrigir Redação'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Quick Turmas Summary -->
      <div class="section-header">
        <div class="section-title-wrap">
          <h2>Turmas em Andamento</h2>
          <p>Organização por objetivos e horários das aulas</p>
        </div>
      </div>
      <div class="turmas-grid">
        ${store.data.turmas.map(turma => `
          <div class="turma-card">
            <div>
              <div class="turma-header">
                <span class="badge badge-purple">${turma.badge}</span>
                <span style="font-size: 11.5px; font-weight: 700; color: var(--secondary-dark);">Média: ${turma.mediaGeral}</span>
              </div>
              <h3 class="turma-title">${turma.nome}</h3>
              <div class="turma-schedule">🗓️ ${turma.dias}</div>
            </div>
            <div>
              <div class="turma-stats-row">
                <div class="turma-stat-item">
                  <div class="val">${turma.totalAlunos}</div>
                  <div class="lbl">Alunos</div>
                </div>
                <div class="turma-stat-item">
                  <div class="val">${turma.mediaGeral}</div>
                  <div class="lbl">Média da Turma</div>
                </div>
                <div class="turma-stat-item">
                  <div class="val" style="color: var(--success);">94%</div>
                  <div class="lbl">Entregas</div>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    bindDashboardEvents();
  }

  function renderCorrecoesFila() {
    appContainer.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h2>Fila de Correção &amp; Avaliação ENEM</h2>
          <p>Selecione qualquer redação para abrir o corretor com marcador de texto e atribuição de notas</p>
        </div>
      </div>

      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Tema</th>
              <th>Envio</th>
              <th>Status</th>
              <th>Pontuação ENEM</th>
              <th style="text-align: right;">Ação</th>
            </tr>
          </thead>
          <tbody>
            ${store.data.redacoes.map(red => `
              <tr>
                <td>
                  <div class="student-cell">
                    ${red.alunoAvatar
                      ? `<img src="${red.alunoAvatar}" class="student-avatar" alt="${red.alunoNome}">`
                      : `<div class="student-avatar" style="background:${red.alunoBg || '#7C3AED'}">${red.alunoIniciais || 'AL'}</div>`
                    }
                    <div class="student-meta-info">
                      <div class="name">${red.alunoNome}</div>
                      <div class="sub">${red.status}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style="font-weight: 600; color: var(--dark); max-width: 380px;">${red.temaTitulo}</div>
                </td>
                <td><span style="color: var(--slate-500); font-size: 13px;">${red.dataEnvio}</span></td>
                <td>
                  <span class="badge ${red.status === 'Corrigida' ? 'badge-success' : 'badge-warning'}">
                    ${red.status === 'Corrigida' ? '✓ Corrigida' : '⏳ Aguardando'}
                  </span>
                </td>
                <td>
                  ${red.notas
                    ? `<span class="score-pill ${red.notas.total >= 900 ? 'grade-1000' : ''}">${red.notas.total} pts</span>`
                    : `<span class="score-pill pending">Sem nota</span>`
                  }
                </td>
                <td style="text-align: right;">
                  <button class="btn ${red.status === 'Corrigida' ? 'btn-outline' : 'btn-primary'} btn-sm btn-open-correcao" data-redacao-id="${red.id}">
                    ${red.status === 'Corrigida' ? 'Ver / Editar Correção' : '✏️ Corrigir Agora'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    bindDashboardEvents();
  }

  function renderAlunosList() {
    appContainer.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h2>Cadastro &amp; Acompanhamento de Alunos</h2>
          <p>Organize os alunos em turmas, acompanhe médias e metas individuais</p>
        </div>
        <div class="section-actions">
          <button class="btn btn-primary" id="btn-open-modal-novo-aluno">
            <span>+</span> Cadastrar Novo Aluno
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Aluno(a)</th>
              <th>Turma</th>
              <th>Contato</th>
              <th>Objetivo / Foco</th>
              <th>Redações</th>
              <th>Média Atual</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${store.data.alunos.map(aluno => `
              <tr>
                <td>
                  <div class="student-cell">
                    ${aluno.avatar
                      ? `<img src="${aluno.avatar}" class="student-avatar" alt="${aluno.nome}">`
                      : `<div class="student-avatar" style="background:${aluno.avatarBg || '#7C3AED'}">${aluno.iniciais || 'AL'}</div>`
                    }
                    <div class="student-meta-info">
                      <div class="name">${aluno.nome}</div>
                      <div class="sub">${aluno.email}</div>
                    </div>
                  </div>
                </td>
                <td><span class="badge badge-purple">${aluno.turmaNome}</span></td>
                <td><span style="font-size: 13px; color: var(--slate-600);">${aluno.whatsapp}</span></td>
                <td><span style="font-weight: 600; color: var(--dark); font-size: 13px;">${aluno.meta}</span></td>
                <td><span style="font-weight: 700; color: var(--primary);">${aluno.redacoesEnviadas}</span></td>
                <td>
                  <span class="score-pill ${aluno.mediaAtual >= 900 ? 'grade-1000' : ''}">
                    ${aluno.mediaAtual > 0 ? aluno.mediaAtual : '—'}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button class="btn btn-outline btn-sm btn-view-student-profile" data-student-id="${aluno.id}">
                    Ver Histórico
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btn-open-modal-novo-aluno').addEventListener('click', openModalNovoAluno);
    document.querySelectorAll('.btn-view-student-profile').forEach(btn => {
      btn.addEventListener('click', () => {
        store.setCurrentStudent(btn.dataset.studentId);
        store.setRole('student');
        initRoleAndNav();
        renderApp();
        showToast(`Visualizando histórico de ${getSelectedStudent().nome}`);
      });
    });
  }

  function renderTurmasList() {
    appContainer.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h2>Gestão de Turmas</h2>
          <p>Organize turmas temáticas para envio conjunto de temas e análise coletiva</p>
        </div>
        <div class="section-actions">
          <button class="btn btn-primary" id="btn-open-modal-nova-turma">
            <span>+</span> Criar Nova Turma
          </button>
        </div>
      </div>

      <div class="turmas-grid">
        ${store.data.turmas.map(turma => {
          const alunosNaTurma = store.data.alunos.filter(a => a.turmaId === turma.id);
          return `
            <div class="turma-card">
              <div>
                <div class="turma-header">
                  <span class="badge badge-purple">${turma.badge}</span>
                  <span class="badge badge-success">Ativa</span>
                </div>
                <h3 class="turma-title">${turma.nome}</h3>
                <div class="turma-schedule">🗓️ ${turma.dias}</div>

                <div class="turma-stats-row">
                  <div class="turma-stat-item">
                    <div class="val">${alunosNaTurma.length}</div>
                    <div class="lbl">Alunos</div>
                  </div>
                  <div class="turma-stat-item">
                    <div class="val">${turma.mediaGeral}</div>
                    <div class="lbl">Média da Turma</div>
                  </div>
                  <div class="turma-stat-item">
                    <div class="val" style="color: var(--success);">100%</div>
                    <div class="lbl">Frequência</div>
                  </div>
                </div>

                <div style="margin-top: 14px;">
                  <div style="font-size: 12px; font-weight: 700; color: var(--slate-600); margin-bottom: 8px;">Alunos Inscritos:</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${alunosNaTurma.map(a => `
                      <span style="background: var(--slate-100); padding: 2px 8px; border-radius: var(--radius-full); font-size: 11.5px; color: var(--slate-700);">
                        ${a.nome.split(' ')[0]}
                      </span>
                    `).join('')}
                    ${alunosNaTurma.length === 0 ? '<span style="font-size: 12px; color: var(--slate-400);">Nenhum aluno cadastrado ainda</span>' : ''}
                  </div>
                </div>
              </div>

              <div style="margin-top: 20px; display: flex; gap: 8px;">
                <button class="btn btn-outline btn-sm" style="flex:1;" onclick="alert('Relatório de notas da turma ${turma.nome} gerado com sucesso!')">📊 Desempenho</button>
                <button class="btn btn-primary btn-sm btn-turma-send-tema" data-turma-id="${turma.id}">✉️ Enviar Tema</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    document.getElementById('btn-open-modal-nova-turma').addEventListener('click', openModalNovaTurma);
    document.querySelectorAll('.btn-turma-send-tema').forEach(btn => {
      btn.addEventListener('click', () => {
        openModalNovoTema(btn.dataset.turmaId);
      });
    });
  }

  function renderTemasList() {
    appContainer.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h2>Temas de Redação &amp; Prazos</h2>
          <p>Disponibilize temas com textos motivadores para turmas inteiras ou alunos específicos</p>
        </div>
        <div class="section-actions">
          <button class="btn btn-primary" id="btn-open-modal-novo-tema">
            <span>+</span> Cadastrar Novo Tema
          </button>
        </div>
      </div>

      <div class="temas-grid">
        ${store.data.temas.map(tema => {
          const entregas = store.data.redacoes.filter(r => r.temaId === tema.id).length;
          const prazoDate = new Date(tema.prazo);
          const prazoFormatado = prazoDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

          return `
            <div class="tema-card">
              <div>
                <div class="tema-badge-row">
                  <span class="badge badge-purple">${tema.eixo}</span>
                  <span class="badge ${tema.status === 'Ativo' ? 'badge-success' : 'badge-gray'}">${tema.status}</span>
                </div>
                <h3 class="tema-title">${tema.titulo}</h3>
                <p class="tema-description">${tema.motivo || 'Tema selecionado pela Prof.ª Cristine para fortalecer a argumentação.'}</p>
                
                <div class="tema-meta-box">
                  <div>
                    <span style="color: var(--slate-500);">Prazo de Entrega:</span>
                    <div class="prazo-highlight">⏰ ${prazoFormatado}</div>
                  </div>
                  <div style="text-align: right;">
                    <span style="color: var(--slate-500);">Entregas:</span>
                    <div style="font-weight: 800; color: var(--primary);">${entregas} redações</div>
                  </div>
                </div>

                <div style="font-size: 11.5px; color: var(--slate-500); margin-bottom: 14px;">
                  <strong>Turmas Atribuídas:</strong>
                  ${tema.turmasDestino.map(tid => {
                    const t = store.data.turmas.find(x => x.id === tid);
                    return t ? `<span style="background: var(--slate-100); padding: 2px 6px; border-radius: 4px; margin-left: 4px;">${t.nome}</span>` : '';
                  }).join('')}
                </div>
              </div>

              <div style="display: flex; gap: 8px;">
                <button class="btn btn-outline btn-sm btn-ver-motivadores" style="flex: 1;" data-tema-id="${tema.id}">📖 Ver Textos de Apoio</button>
                <button class="btn btn-secondary btn-sm" onclick="alert('Lembrete enviado para todos os alunos com pendência neste tema!')">🔔 Cobrar Alunos</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    document.getElementById('btn-open-modal-novo-tema').addEventListener('click', () => openModalNovoTema());
    document.querySelectorAll('.btn-ver-motivadores').forEach(btn => {
      btn.addEventListener('click', () => {
        const tema = store.data.temas.find(t => t.id === btn.dataset.temaId);
        if (tema) {
          openModalVisualizarTema(tema);
        }
      });
    });
  }

  function bindDashboardEvents() {
    document.querySelectorAll('.btn-open-correcao').forEach(btn => {
      btn.addEventListener('click', () => {
        openCorrectionWorkspace(btn.dataset.redacaoId);
      });
    });

    const quickNewTema = document.getElementById('btn-quick-new-tema');
    if (quickNewTema) {
      quickNewTema.addEventListener('click', () => openModalNovoTema());
    }
  }

  // =========================================================================
  // STUDENT SCREENS
  // =========================================================================

  function renderStudentDashboard() {
    const student = getSelectedStudent();
    const studentRedacoes = store.data.redacoes.filter(r => r.alunoId === student.id);
    const activeTemas = store.data.temas.filter(t => t.status === 'Ativo');

    appContainer.innerHTML = `
      <!-- Student Hero Banner -->
      <div class="student-dashboard-hero">
        <div class="student-hero-profile">
          ${student.avatar
            ? `<img src="${student.avatar}" class="student-hero-avatar" alt="${student.nome}">`
            : `<div class="student-hero-avatar" style="background:${student.avatarBg || '#7C3AED'}; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:800; color:#fff;">${student.iniciais}</div>`
          }
          <div class="student-hero-info">
            <h2>Olá, ${student.nome.split(' ')[0]}! ✨</h2>
            <p>Seu espaço de evolução na <strong>Salinha Produtiva</strong> com a Prof.ª Cristine Teixeira.</p>
            <div class="student-hero-badge">🎯 Meta: ${student.meta} • ${student.turmaNome}</div>
          </div>
        </div>

        <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
          <div class="student-score-spotlight">
            <div class="lbl">Sua Média Atual</div>
            <div class="val">${student.mediaAtual}</div>
            <div class="sub">padrão ENEM (0 a 1000)</div>
          </div>
          <button class="btn btn-secondary" id="btn-student-submit-redacao" style="padding: 14px 22px; font-size: 15px; font-weight: 800;">
            📤 Enviar Nova Redação
          </button>
        </div>
      </div>

      <!-- Evolution Chart -->
      <div class="evolution-chart-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h3 style="font-size: 17px; font-weight: 800; color: var(--dark);">📈 Sua Linha do Tempo e Evolução de Notas</h3>
            <p style="font-size: 12.5px; color: var(--slate-500);">Acompanhe o salto no desempenho a cada tema trabalhado com as mentorias</p>
          </div>
          <span class="badge badge-success">+180 pontos de salto</span>
        </div>

        <div class="chart-bars-wrap">
          ${student.evolucao.map((item, idx) => {
            const heightPercent = Math.max(30, ((item.nota - 600) / 400) * 100);
            const isLatest = idx === student.evolucao.length - 1;
            return `
              <div class="chart-bar-col" title="${item.tema}">
                <div class="chart-bar-score">${item.nota}</div>
                <div class="chart-bar-fill ${isLatest ? 'highlight' : ''}" style="height: ${heightPercent}%;"></div>
                <div class="chart-bar-label">${item.data}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Temas Pendentes & Redações Recentes (Two-column layout) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px; margin-bottom: 28px;">
        <!-- Available Themes -->
        <div class="card">
          <div class="section-header" style="margin-bottom: 16px;">
            <div class="section-title-wrap">
              <h3 style="font-size: 16px; font-weight: 800;">⏳ Temas Disponíveis para Entrega</h3>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${activeTemas.slice(0, 2).map(tema => `
              <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 14px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <span class="badge badge-purple">${tema.eixo}</span>
                  <span class="prazo-highlight" style="font-size: 12px;">Prazo: 28/Set</span>
                </div>
                <div style="font-weight: 700; font-size: 14px; color: var(--dark); margin-bottom: 10px;">${tema.titulo}</div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-outline btn-sm btn-student-read-tema" data-tema-id="${tema.id}">Ver Proposta</button>
                  <button class="btn btn-primary btn-sm btn-student-enviar-especifico" data-tema-id="${tema.id}">Enviar Redação</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Recent Corrections -->
        <div class="card">
          <div class="section-header" style="margin-bottom: 16px;">
            <div class="section-title-wrap">
              <h3 style="font-size: 16px; font-weight: 800;">📝 Minhas Redações Enviadas</h3>
            </div>
            <button class="btn btn-outline btn-sm" id="btn-see-all-student-essays">Ver Todas</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${studentRedacoes.map(red => `
              <div style="background: #ffffff; border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 14px; display: flex; justify-content: space-between; align-items: center;">
                <div style="max-width: 65%;">
                  <div style="font-weight: 700; font-size: 13.5px; color: var(--dark); margin-bottom: 2px;">${red.temaTitulo}</div>
                  <div style="font-size: 11.5px; color: var(--slate-500);">Enviada em ${red.dataEnvio}</div>
                </div>
                <div style="text-align: right;">
                  ${red.status === 'Corrigida'
                    ? `<span class="score-pill grade-1000" style="margin-bottom: 6px; display: inline-block;">${red.notas.total}</span><br>
                       <button class="btn btn-primary btn-sm btn-student-view-corrected" data-redacao-id="${red.id}">Ver Correção</button>`
                    : `<span class="badge badge-warning">Em Correção</span>`
                  }
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-student-submit-redacao').addEventListener('click', openModalEnviarRedacao);
    document.querySelectorAll('.btn-student-enviar-especifico').forEach(btn => {
      btn.addEventListener('click', () => openModalEnviarRedacao(btn.dataset.temaId));
    });
    document.querySelectorAll('.btn-student-read-tema').forEach(btn => {
      btn.addEventListener('click', () => {
        const tema = store.data.temas.find(t => t.id === btn.dataset.temaId);
        if (tema) openModalVisualizarTema(tema);
      });
    });
    document.querySelectorAll('.btn-student-view-corrected').forEach(btn => {
      btn.addEventListener('click', () => {
        openStudentFeedbackModal(btn.dataset.redacaoId);
      });
    });
    const seeAllBtn = document.getElementById('btn-see-all-student-essays');
    if (seeAllBtn) {
      seeAllBtn.addEventListener('click', () => {
        activeTab = 'aluno-redacoes';
        renderNavTabs(false);
        renderApp();
      });
    }
  }

  function renderStudentRedacoes() {
    const student = getSelectedStudent();
    const studentRedacoes = store.data.redacoes.filter(r => r.alunoId === student.id);

    appContainer.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h2>Minhas Redações &amp; Pareceres</h2>
          <p>Confira todo o histórico das suas produções e veja as anotações visuais da Prof.ª Cristine</p>
        </div>
        <div class="section-actions">
          <button class="btn btn-secondary" id="btn-student-nova-redacao-tab">+ Enviar Nova Redação</button>
        </div>
      </div>

      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Tema</th>
              <th>Data de Envio</th>
              <th>Status</th>
              <th>Nota ENEM</th>
              <th>Parecer Pedagógico</th>
              <th style="text-align: right;">Ação</th>
            </tr>
          </thead>
          <tbody>
            ${studentRedacoes.map(red => `
              <tr>
                <td>
                  <div style="font-weight: 700; color: var(--dark); max-width: 340px;">${red.temaTitulo}</div>
                </td>
                <td><span style="color: var(--slate-500); font-size: 13px;">${red.dataEnvio}</span></td>
                <td>
                  <span class="badge ${red.status === 'Corrigida' ? 'badge-success' : 'badge-warning'}">
                    ${red.status === 'Corrigida' ? '✓ Corrigida' : '⏳ Aguardando'}
                  </span>
                </td>
                <td>
                  ${red.notas
                    ? `<span class="score-pill ${red.notas.total >= 900 ? 'grade-1000' : ''}">${red.notas.total} pts</span>`
                    : `<span class="score-pill pending">—</span>`
                  }
                </td>
                <td>
                  <div style="font-size: 12.5px; color: var(--slate-600); max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${red.comentariosGerais || 'Aguardando parecer da professora...'}
                  </div>
                </td>
                <td style="text-align: right;">
                  ${red.status === 'Corrigida'
                    ? `<button class="btn btn-primary btn-sm btn-student-view-corrected" data-redacao-id="${red.id}">
                        👁️ Ver com Marcações
                       </button>`
                    : `<button class="btn btn-outline btn-sm" disabled style="opacity:0.6;">Aguardando</button>`
                  }
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btn-student-nova-redacao-tab').addEventListener('click', openModalEnviarRedacao);
    document.querySelectorAll('.btn-student-view-corrected').forEach(btn => {
      btn.addEventListener('click', () => openStudentFeedbackModal(btn.dataset.redacaoId));
    });
  }

  function renderStudentTemas() {
    const activeTemas = store.data.temas;

    appContainer.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h2>Temas &amp; Propostas de Redação</h2>
          <p>Consulte as propostas lançadas para a sua turma e submeta a tempo</p>
        </div>
      </div>

      <div class="temas-grid">
        ${activeTemas.map(tema => `
          <div class="tema-card">
            <div>
              <div class="tema-badge-row">
                <span class="badge badge-purple">${tema.eixo}</span>
                <span class="badge ${tema.status === 'Ativo' ? 'badge-success' : 'badge-gray'}">${tema.status}</span>
              </div>
              <h3 class="tema-title">${tema.titulo}</h3>
              <p class="tema-description">${tema.motivo || 'Tema selecionado pela Prof.ª Cristine.'}</p>
              
              <div class="tema-meta-box">
                <div>
                  <span style="color: var(--slate-500);">Prazo Limite:</span>
                  <div class="prazo-highlight">⏰ ${tema.prazo.replace('T', ' às ')}</div>
                </div>
                <div>
                  <span class="badge badge-purple">${tema.formato}</span>
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 8px;">
              <button class="btn btn-outline btn-sm btn-student-read-tema" style="flex:1;" data-tema-id="${tema.id}">📖 Ler Proposta</button>
              <button class="btn btn-primary btn-sm btn-student-enviar-especifico" style="flex:1;" data-tema-id="${tema.id}">📤 Enviar Redação</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    document.querySelectorAll('.btn-student-read-tema').forEach(btn => {
      btn.addEventListener('click', () => {
        const tema = store.data.temas.find(t => t.id === btn.dataset.temaId);
        if (tema) openModalVisualizarTema(tema);
      });
    });
    document.querySelectorAll('.btn-student-enviar-especifico').forEach(btn => {
      btn.addEventListener('click', () => openModalEnviarRedacao(btn.dataset.temaId));
    });
  }

  // =========================================================================
  // CORRECTION WORKSPACE MODAL (The Core Teacher Feature)
  // =========================================================================

  function openCorrectionWorkspace(redacaoId) {
    const redacao = store.data.redacoes.find(r => r.id === redacaoId);
    if (!redacao) return;

    currentGradingRedacaoId = redacaoId;
    const aluno = store.data.alunos.find(a => a.id === redacao.alunoId) || { nome: redacao.alunoNome, turmaNome: 'Turma Salinha' };

    // Default or existing scores
    const currentScores = redacao.notas || {
      c1: 160,
      c2: 160,
      c3: 160,
      c4: 160,
      c5: 160,
      total: 800
    };

    const modal = document.createElement('div');
    modal.className = 'correction-modal-overlay';
    modal.id = 'modal-correction-workspace';

    modal.innerHTML = `
      <div class="correction-workspace-box">
        <!-- Top Action Bar -->
        <div class="correction-top-bar">
          <div class="correction-student-summary">
            <div class="student-avatar" style="background:#7C3AED; color:#fff; font-weight:bold;">
              ${redacao.alunoIniciais || 'SP'}
            </div>
            <div>
              <h3>${redacao.alunoNome}</h3>
              <p>Tema: <strong>${redacao.temaTitulo}</strong> • Enviado em ${redacao.dataEnvio}</p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="badge ${redacao.status === 'Corrigida' ? 'badge-success' : 'badge-warning'}">
              ${redacao.status === 'Corrigida' ? '✓ Já Corrigida' : '⏳ Em Correção'}
            </span>
            <button class="btn btn-outline btn-sm" id="btn-close-correction-workspace">Fechar</button>
          </div>
        </div>

        <!-- Body: Left Canvas, Right Grading Panel -->
        <div class="correction-workspace-body">
          <!-- Canvas & Highlighting Toolbar -->
          <div class="canvas-column">
            <!-- Toolbar -->
            <div class="canvas-toolbar">
              <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <!-- Tool modes -->
                <div class="tools-group">
                  <button class="tool-btn active" data-tool="highlight" title="Marcador de Texto Retangular">
                    🖍️ Marca-Texto
                  </button>
                  <button class="tool-btn" data-tool="brush" title="Caneta / Pincel Livre">
                    ✏️ Pincel Livre
                  </button>
                  <button class="tool-btn" data-tool="comment" title="Adicionar Comentário Pontual">
                    💬 Balão Nota
                  </button>
                  <button class="tool-btn" data-tool="eraser" title="Borracha">
                    🧹 Apagar
                  </button>
                </div>

                <!-- Competency Color Palettes for Highlighter -->
                <div style="display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 600; color: var(--slate-600);">
                  <span>Cor / Eixo:</span>
                  <div class="color-swatches-group">
                    <button class="color-swatch-btn active" data-color="#FBBF24" data-comp="Geral" style="background: #FBBF24;" title="🟡 Amarelo: Atenção / Geral"></button>
                    <button class="color-swatch-btn" data-color="#10B981" data-comp="Ponto Forte" style="background: #10B981;" title="🟢 Verde: Ponto Forte / Repertório"></button>
                    <button class="color-swatch-btn" data-color="#EF4444" data-comp="C1 Gramática" style="background: #EF4444;" title="🔴 Vermelho: Desvio Gramatical / C1"></button>
                    <button class="color-swatch-btn" data-color="#3B82F6" data-comp="C3 Argumento" style="background: #3B82F6;" title="🔵 Azul: Coesão &amp; Argumentação"></button>
                    <button class="color-swatch-btn" data-color="#8B5CF6" data-comp="C5 Proposta" style="background: #8B5CF6;" title="🟣 Roxo: Proposta de Intervenção (C5)"></button>
                  </div>
                </div>
              </div>

              <!-- History actions -->
              <div style="display: flex; align-items: center; gap: 6px;">
                <button class="btn btn-outline btn-sm" id="btn-canvas-undo" title="Desfazer (Ctrl+Z)">↩️</button>
                <button class="btn btn-outline btn-sm" id="btn-canvas-redo" title="Refazer">↪️</button>
                <button class="btn btn-outline btn-sm" id="btn-canvas-clear" style="color: var(--danger);" title="Limpar todas as marcações">🗑️</button>
              </div>
            </div>

            <!-- Scrollable Canvas Viewer -->
            <div class="canvas-scroll-area">
              <div id="essay-canvas-container"></div>
            </div>
          </div>

          <!-- Right: ENEM Grading Card -->
          <div class="grading-panel-column">
            <div class="grading-header">
              <div>
                <h4 style="font-size: 15px; font-weight: 800; color: var(--dark);">Grade de Avaliação ENEM</h4>
                <p style="font-size: 11.5px; color: var(--slate-500);">5 Competências Oficiais (0 a 200)</p>
              </div>
              <div class="total-score-box">
                <div class="label">Nota Final ENEM</div>
                <div class="score" id="live-total-score">${currentScores.total || 800}</div>
                <div class="max">de 1000 pontos</div>
              </div>
            </div>

            <div class="competencies-list">
              <!-- Competency 1 -->
              ${renderCompetencySelector('c1', 'Competência 1', 'Domínio da modalidade escrita formal da língua portuguesa (gramática, crase, concordância, pontuação)', currentScores.c1)}
              
              <!-- Competency 2 -->
              ${renderCompetencySelector('c2', 'Competência 2', 'Compreensão da proposta de redação e aplicação de conceitos das várias áreas do conhecimento (repertório sociocultural legítimo e produtivo)', currentScores.c2)}
              
              <!-- Competency 3 -->
              ${renderCompetencySelector('c3', 'Competência 3', 'Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos em defesa de um ponto de vista (projeto de texto)', currentScores.c3)}
              
              <!-- Competency 4 -->
              ${renderCompetencySelector('c4', 'Competência 4', 'Demonstração de conhecimento dos mecanismos linguísticos necessários para a construção da argumentação (coesão, conectivos)', currentScores.c4)}
              
              <!-- Competency 5 -->
              ${renderCompetencySelector('c5', 'Competência 5', 'Elaboração de proposta de intervenção para o problema abordado (5 elementos: Agente, Ação, Meio/Modo, Efeito e Detalhamento)', currentScores.c5)}
            </div>

            <!-- Written & Audio Feedback -->
            <div class="grading-observations">
              <label for="prof-general-comments">Comentários &amp; Dicas da Prof.ª Cristine:</label>
              <textarea id="prof-general-comments" class="grading-textarea" placeholder="Escreva o parecer pedagógico geral, destacando os pontos fortes e o que precisa ser ajustado para a próxima redação...">${redacao.comentariosGerais || ''}</textarea>

              <!-- Quick Chips Suggestions -->
              <div class="quick-chips-wrap">
                <button type="button" class="quick-chip" data-text="Excelente repertório sociocultural, muito bem legitimado e produtivo!">✨ Repertório Produtivo</button>
                <button type="button" class="quick-chip" data-text="Atenção à proposta de intervenção: certifique-se de apresentar todos os 5 elementos (agente, ação, meio, efeito e detalhamento).">⚠️ 5 Elementos na C5</button>
                <button type="button" class="quick-chip" data-text="Cuidado com a repetição frequente de conectivos no desenvolvimento. Varie o uso de conjunções.">🔗 Variar Conectivos</button>
                <button type="button" class="quick-chip" data-text="Ótimo projeto de texto com tese clara antecipada na introdução!">🎯 Tese Clara</button>
              </div>

              <!-- Audio Recording Mock -->
              <div class="audio-feedback-mock-box">
                <div class="audio-label">
                  <span>🎙️</span>
                  <span>Feedback por Voz (Áudio)</span>
                </div>
                <button type="button" class="btn-record-audio" id="btn-record-voice">
                  🔴 Gravar Áudio (01:45)
                </button>
              </div>
            </div>

            <!-- Footer Save Actions -->
            <div class="grading-footer">
              <button class="btn btn-outline" style="flex:1;" id="btn-save-draft">Salvar Rascunho</button>
              <button class="btn btn-primary" style="flex:2;" id="btn-finish-correction">
                ✓ Liberar Nota para o Aluno
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Initialize the canvas highlighter
    const canvasContainer = document.getElementById('essay-canvas-container');
    currentHighlighter = new EssayHighlighter('essay-canvas-container', {
      initialAnnotations: redacao.annotations || []
    });

    currentHighlighter.loadImage(redacao.imagemUrl || 'assets/mock-essays/redacao-enem-sofia.svg');

    // Bind Canvas Toolbar Buttons
    modal.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentHighlighter.setTool(btn.dataset.tool);
      });
    });

    modal.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentHighlighter.setColor(btn.dataset.color, btn.dataset.comp);
      });
    });

    document.getElementById('btn-canvas-undo').addEventListener('click', () => currentHighlighter.undo());
    document.getElementById('btn-canvas-redo').addEventListener('click', () => currentHighlighter.redo());
    document.getElementById('btn-canvas-clear').addEventListener('click', () => currentHighlighter.clear());

    // Bind Competency Score Buttons
    modal.querySelectorAll('.score-radio-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const comp = btn.dataset.comp;
        const val = parseInt(btn.dataset.val, 10);
        const group = btn.closest('.score-radio-group');
        group.querySelectorAll('.score-radio-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update score badge on card
        const card = btn.closest('.competency-card');
        card.querySelector('.comp-score-tag').textContent = `${val} pts`;

        updateTotalScore();
      });
    });

    function updateTotalScore() {
      let total = 0;
      ['c1', 'c2', 'c3', 'c4', 'c5'].forEach(comp => {
        const activeBtn = modal.querySelector(`.score-radio-btn[data-comp="${comp}"].active`);
        if (activeBtn) total += parseInt(activeBtn.dataset.val, 10);
      });
      document.getElementById('live-total-score').textContent = total;
    }

    // Quick chip inserts
    modal.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const txtArea = document.getElementById('prof-general-comments');
        if (txtArea.value.trim() !== '') {
          txtArea.value += '\n\n' + chip.dataset.text;
        } else {
          txtArea.value = chip.dataset.text;
        }
      });
    });

    // Voice record mock
    const recordBtn = document.getElementById('btn-record-voice');
    recordBtn.addEventListener('click', () => {
      recordBtn.innerHTML = '✅ Áudio Gravado (02:14)';
      recordBtn.style.background = 'var(--success)';
      showToast('Áudio da mentoria gravado e anexado com sucesso!');
    });

    // Close Modal
    document.getElementById('btn-close-correction-workspace').addEventListener('click', () => {
      modal.remove();
    });

    // Save Action
    document.getElementById('btn-finish-correction').addEventListener('click', () => {
      const c1 = parseInt(modal.querySelector(`.score-radio-btn[data-comp="c1"].active`).dataset.val, 10);
      const c2 = parseInt(modal.querySelector(`.score-radio-btn[data-comp="c2"].active`).dataset.val, 10);
      const c3 = parseInt(modal.querySelector(`.score-radio-btn[data-comp="c3"].active`).dataset.val, 10);
      const c4 = parseInt(modal.querySelector(`.score-radio-btn[data-comp="c4"].active`).dataset.val, 10);
      const c5 = parseInt(modal.querySelector(`.score-radio-btn[data-comp="c5"].active`).dataset.val, 10);
      const total = c1 + c2 + c3 + c4 + c5;

      const comentarios = document.getElementById('prof-general-comments').value;
      const annotations = currentHighlighter.getAnnotations();

      store.saveCorrecao(redacaoId, { c1, c2, c3, c4, c5, total }, comentarios, annotations);
      modal.remove();
      renderApp();
      showToast(`Correção de ${redacao.alunoNome} salva com sucesso! Nota: ${total}/1000`);
    });

    document.getElementById('btn-save-draft').addEventListener('click', () => {
      showToast('Rascunho de anotações salvo localmente.');
      modal.remove();
    });
  }

  function renderCompetencySelector(id, title, desc, defaultVal = 160) {
    const scores = [0, 40, 80, 120, 160, 200];
    return `
      <div class="competency-card">
        <div class="comp-header">
          <span class="comp-title">${title}</span>
          <span class="comp-score-tag">${defaultVal} pts</span>
        </div>
        <div class="comp-desc">${desc}</div>
        <div class="score-radio-group">
          ${scores.map(val => `
            <button type="button" class="score-radio-btn ${val === defaultVal ? 'active' : ''}" data-comp="${id}" data-val="${val}">
              ${val}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // STUDENT VIEW CORRECTION FEEDBACK MODAL
  // =========================================================================

  function openStudentFeedbackModal(redacaoId) {
    const redacao = store.data.redacoes.find(r => r.id === redacaoId);
    if (!redacao || !redacao.notas) return;

    const modal = document.createElement('div');
    modal.className = 'correction-modal-overlay';
    modal.id = 'modal-student-feedback-view';

    modal.innerHTML = `
      <div class="correction-workspace-box">
        <!-- Top Bar -->
        <div class="correction-top-bar">
          <div class="correction-student-summary">
            <img src="assets/logo.png" class="user-avatar-small" alt="Logo">
            <div>
              <h3>Parecer Pedagógico da Prof.ª Cristine Teixeira</h3>
              <p>Tema: <strong>${redacao.temaTitulo}</strong></p>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" id="btn-close-student-feedback">Fechar</button>
        </div>

        <!-- Body -->
        <div class="correction-workspace-body">
          <!-- Canvas with Read-Only Highlighting -->
          <div class="canvas-column">
            <div class="canvas-toolbar" style="background:#FAF5FF; border-bottom:1px solid var(--primary-border);">
              <div style="font-size: 13px; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                <span>🖍️ Folha de Redação Corrigida</span>
                <span style="font-size: 11px; font-weight: normal; color: var(--slate-600);">(Passe o mouse ou clique nas marcações coloridas para ver as dicas da professora)</span>
              </div>
              <div style="display: flex; gap: 8px;">
                <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #047857;">🟢 Ponto Forte</span>
                <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #1d4ed8;">🔵 Argumentação</span>
                <span class="badge" style="background: rgba(139, 92, 246, 0.2); color: #6d28d9;">🟣 Intervenção C5</span>
              </div>
            </div>

            <div class="canvas-scroll-area">
              <div id="student-view-canvas-container"></div>
            </div>
          </div>

          <!-- Right Column: Scores & Comments -->
          <div class="grading-panel-column">
            <div class="grading-header">
              <div>
                <h4 style="font-size: 15px; font-weight: 800; color: var(--dark);">Sua Pontuação ENEM</h4>
                <p style="font-size: 11.5px; color: var(--slate-500);">Avaliação oficial Salinha Produtiva</p>
              </div>
              <div class="total-score-box">
                <div class="label">Sua Nota</div>
                <div class="score">${redacao.notas.total}</div>
                <div class="max">de 1000 pontos</div>
              </div>
            </div>

            <div class="competencies-list">
              <div class="competency-card">
                <div class="comp-header">
                  <span class="comp-title">Competência 1 • Gramática &amp; Norma Culta</span>
                  <span class="comp-score-tag">${redacao.notas.c1} / 200</span>
                </div>
                <div style="height: 6px; background: var(--slate-100); border-radius: 3px; overflow: hidden; margin-top: 6px;">
                  <div style="width: ${(redacao.notas.c1 / 200) * 100}%; height: 100%; background: var(--primary);"></div>
                </div>
              </div>

              <div class="competency-card">
                <div class="comp-header">
                  <span class="comp-title">Competência 2 • Compreensão &amp; Repertório</span>
                  <span class="comp-score-tag">${redacao.notas.c2} / 200</span>
                </div>
                <div style="height: 6px; background: var(--slate-100); border-radius: 3px; overflow: hidden; margin-top: 6px;">
                  <div style="width: ${(redacao.notas.c2 / 200) * 100}%; height: 100%; background: var(--primary);"></div>
                </div>
              </div>

              <div class="competency-card">
                <div class="comp-header">
                  <span class="comp-title">Competência 3 • Projeto de Texto &amp; Argumentação</span>
                  <span class="comp-score-tag">${redacao.notas.c3} / 200</span>
                </div>
                <div style="height: 6px; background: var(--slate-100); border-radius: 3px; overflow: hidden; margin-top: 6px;">
                  <div style="width: ${(redacao.notas.c3 / 200) * 100}%; height: 100%; background: var(--primary);"></div>
                </div>
              </div>

              <div class="competency-card">
                <div class="comp-header">
                  <span class="comp-title">Competência 4 • Coesão &amp; Conectivos</span>
                  <span class="comp-score-tag">${redacao.notas.c4} / 200</span>
                </div>
                <div style="height: 6px; background: var(--slate-100); border-radius: 3px; overflow: hidden; margin-top: 6px;">
                  <div style="width: ${(redacao.notas.c4 / 200) * 100}%; height: 100%; background: var(--primary);"></div>
                </div>
              </div>

              <div class="competency-card">
                <div class="comp-header">
                  <span class="comp-title">Competência 5 • Proposta de Intervenção</span>
                  <span class="comp-score-tag">${redacao.notas.c5} / 200</span>
                </div>
                <div style="height: 6px; background: var(--slate-100); border-radius: 3px; overflow: hidden; margin-top: 6px;">
                  <div style="width: ${(redacao.notas.c5 / 200) * 100}%; height: 100%; background: var(--primary);"></div>
                </div>
              </div>
            </div>

            <!-- Voice Feedback Simulation -->
            <div style="padding: 0 24px 16px;">
              <div style="background: linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 100%); border: 1px solid var(--primary-border); border-radius: var(--radius-lg); padding: 14px 18px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 13px; font-weight: 700; color: var(--primary);">🎙️ Mensagem de Voz da Prof.ª Cristine</span>
                  <span style="font-size: 11px; color: var(--slate-500);">02:14</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <button class="btn btn-primary btn-sm btn-icon" id="btn-play-audio-feedback">▶</button>
                  <div style="flex:1; height: 6px; background: var(--slate-200); border-radius: 3px; overflow: hidden;">
                    <div id="audio-progress-bar" style="width: 35%; height: 100%; background: var(--secondary);"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Written Comment -->
            <div style="padding: 0 24px 24px;">
              <div style="background: #ffffff; border: 1px solid var(--slate-200); border-radius: var(--radius-lg); padding: 18px;">
                <h5 style="font-size: 13.5px; font-weight: 800; color: var(--dark); margin-bottom: 8px;">Comentário Detalhado:</h5>
                <p style="font-size: 13px; color: var(--slate-700); line-height: 1.5; white-space: pre-line;">${redacao.comentariosGerais}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Init Read-Only Canvas
    const hl = new EssayHighlighter('student-view-canvas-container', {
      readOnly: true,
      initialAnnotations: redacao.annotations || []
    });
    hl.loadImage(redacao.imagemUrl || 'assets/mock-essays/redacao-enem-sofia.svg');

    // Audio Play simulation
    let isPlaying = false;
    const playBtn = modal.querySelector('#btn-play-audio-feedback');
    const progBar = modal.querySelector('#audio-progress-bar');
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      playBtn.textContent = isPlaying ? '⏸' : '▶';
      showToast(isPlaying ? 'Reproduzindo áudio da mentoria da Prof.ª Cristine...' : 'Áudio pausado.');
    });

    modal.querySelector('#btn-close-student-feedback').addEventListener('click', () => modal.remove());
  }

  // =========================================================================
  // MODALS (Create Student, Turma, Tema, Submission)
  // =========================================================================

  function openModalNovoAluno() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Cadastrar Novo Aluno</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <form id="form-novo-aluno">
          <div class="modal-body">
            <div class="form-group">
              <label>Nome Completo do Aluno(a):</label>
              <input type="text" class="form-control" name="nome" placeholder="Ex: Lucas Ferreira dos Santos" required>
            </div>
            <div class="form-group">
              <label>Turma Designada:</label>
              <select class="form-control" name="turmaId" required>
                ${store.data.turmas.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
              </select>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <div class="form-group">
                <label>WhatsApp / Telefone:</label>
                <input type="text" class="form-control" name="whatsapp" placeholder="(92) 99999-0000" required>
              </div>
              <div class="form-group">
                <label>E-mail:</label>
                <input type="email" class="form-control" name="email" placeholder="aluno@email.com" required>
              </div>
            </div>
            <div class="form-group">
              <label>Meta / Curso Desejado:</label>
              <input type="text" class="form-control" name="meta" placeholder="Ex: Medicina UEA / Nota 960+ no ENEM" required>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline modal-close-btn">Cancelar</button>
            <button type="submit" class="btn btn-primary">Cadastrar Aluno</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelectorAll('.modal-close-btn').forEach(b => b.addEventListener('click', () => modal.remove()));

    modal.querySelector('#form-novo-aluno').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const turma = store.data.turmas.find(t => t.id === formData.get('turmaId'));

      const initials = formData.get('nome').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

      store.addStudent({
        nome: formData.get('nome'),
        turmaId: formData.get('turmaId'),
        turmaNome: turma ? turma.nome : 'Turma Geral',
        email: formData.get('email'),
        whatsapp: formData.get('whatsapp'),
        meta: formData.get('meta'),
        avatar: null,
        iniciais: initials,
        avatarBg: '#7C3AED'
      });

      populateStudentSelector();
      modal.remove();
      renderApp();
      showToast('Aluno(a) cadastrado com sucesso na Salinha Produtiva!');
    });
  }

  function openModalNovaTurma() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Criar Nova Turma</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <form id="form-nova-turma">
          <div class="modal-body">
            <div class="form-group">
              <label>Nome da Turma:</label>
              <input type="text" class="form-control" name="nome" placeholder="Ex: Turma Noturna - Reta Final ENEM" required>
            </div>
            <div class="form-group">
              <label>Dias e Horários de Aula:</label>
              <input type="text" class="form-control" name="dias" placeholder="Ex: Sexta-feira • 18:30 às 21:30" required>
            </div>
            <div class="form-group">
              <label>Foco / Badge da Turma:</label>
              <input type="text" class="form-control" name="badge" placeholder="Ex: Reta Final ENEM / Medicina" required>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline modal-close-btn">Cancelar</button>
            <button type="submit" class="btn btn-primary">Criar Turma</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelectorAll('.modal-close-btn').forEach(b => b.addEventListener('click', () => modal.remove()));

    modal.querySelector('#form-nova-turma').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      store.addTurma({
        nome: formData.get('nome'),
        dias: formData.get('dias'),
        badge: formData.get('badge')
      });
      modal.remove();
      renderApp();
      showToast('Nova turma criada com sucesso!');
    });
  }

  function openModalNovoTema(defaultTurmaId = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 680px;">
        <div class="modal-header">
          <h3>Lançar Nova Proposta de Redação</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <form id="form-novo-tema">
          <div class="modal-body">
            <div class="form-group">
              <label>Tema da Redação (Título Oficial):</label>
              <input type="text" class="form-control" name="titulo" placeholder="Ex: Caminhos para a preservação dos saberes ancestrais no Brasil" required>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <div class="form-group">
                <label>Eixo Temático:</label>
                <input type="text" class="form-control" name="eixo" placeholder="Ex: Cultura &amp; Memória" required>
              </div>
              <div class="form-group">
                <label>Prazo Limite de Entrega:</label>
                <input type="datetime-local" class="form-control" name="prazo" value="2026-10-02T23:59" required>
              </div>
            </div>

            <div class="form-group">
              <label>Destinatários da Proposta:</label>
              <div style="font-size: 12px; color: var(--slate-500); margin-bottom: 6px;">Selecione uma turma inteira ou envie para alunos específicos:</div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${store.data.turmas.map(t => `
                  <label style="display: flex; align-items: center; gap: 8px; font-weight: normal; font-size: 13px; cursor: pointer;">
                    <input type="checkbox" name="turmas" value="${t.id}" ${t.id === defaultTurmaId || !defaultTurmaId ? 'checked' : ''}>
                    <strong>${t.nome}</strong> (${t.totalAlunos} alunos)
                  </label>
                `).join('')}
              </div>
            </div>

            <div class="form-group">
              <label>Texto Motivador de Apoio (I):</label>
              <textarea class="form-control" name="motivador" rows="3" placeholder="Insira o texto motivador ou reflexão de apoio para os alunos..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline modal-close-btn">Cancelar</button>
            <button type="submit" class="btn btn-primary">Publicar e Enviar Tema</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelectorAll('.modal-close-btn').forEach(b => b.addEventListener('click', () => modal.remove()));

    modal.querySelector('#form-novo-tema').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const turmasSelecionadas = [];
      modal.querySelectorAll('input[name="turmas"]:checked').forEach(c => turmasSelecionadas.push(c.value));

      store.addTema({
        titulo: formData.get('titulo'),
        eixo: formData.get('eixo'),
        prazo: formData.get('prazo'),
        formato: 'ENEM (0 - 1000)',
        turmasDestino: turmasSelecionadas,
        motivo: formData.get('motivador') || 'Proposta oficial Salinha Produtiva',
        textosMotivadores: [
          { titulo: 'Texto Motivador I', conteúdo: formData.get('motivador') || 'Texto reflexivo.' }
        ]
      });

      modal.remove();
      renderApp();
      showToast('Tema de redação publicado e enviado aos alunos com sucesso!');
    });
  }

  function openModalVisualizarTema(tema) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 680px;">
        <div class="modal-header">
          <div>
            <span class="badge badge-purple">${tema.eixo}</span>
            <h3 style="margin-top: 4px;">${tema.titulo}</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="tema-meta-box" style="margin-bottom: 20px;">
            <div>
              <span style="color: var(--slate-500);">Prazo de Envio:</span>
              <div class="prazo-highlight">⏰ ${tema.prazo.replace('T', ' às ')}</div>
            </div>
            <div>
              <span class="badge badge-success">Formato ENEM</span>
            </div>
          </div>

          <h4 style="font-size: 14px; font-weight: 800; color: var(--dark); margin-bottom: 12px;">Textos Motivadores:</h4>
          ${(tema.textosMotivadores || []).map(txt => `
            <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px;">
              <strong style="color: var(--primary); font-size: 13px; display: block; margin-bottom: 6px;">${txt.titulo}</strong>
              <p style="font-size: 13px; color: var(--slate-700); line-height: 1.5;">${txt.conteúdo}</p>
            </div>
          `).join('')}

          <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: var(--radius-md); padding: 12px 14px; font-size: 12.5px; color: #92400E; margin-top: 14px;">
            💡 <strong>Instruções da Prof.ª Cristine:</strong> Escreva sua redação na folha pautada padrão (30 linhas), fotografe com boa iluminação e envie pelo sistema até o horário limite.
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline modal-close-btn">Fechar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelectorAll('.modal-close-btn').forEach(b => b.addEventListener('click', () => modal.remove()));
  }

  function openModalEnviarRedacao(defaultTemaId = null) {
    const student = getSelectedStudent();
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h3>Enviar Redação para Correção</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <form id="form-enviar-redacao">
          <div class="modal-body">
            <div class="form-group">
              <label>Selecione a Proposta / Tema:</label>
              <select class="form-control" name="temaId" required>
                ${store.data.temas.filter(t => t.status === 'Ativo').map(t => `
                  <option value="${t.id}" ${t.id === defaultTemaId ? 'selected' : ''}>${t.titulo}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label>Foto ou PDF da Folha de Redação:</label>
              <div class="file-upload-box" id="drop-area-essay">
                <div class="upload-icon">📸</div>
                <div style="font-weight: 700; color: var(--dark); font-size: 14px; margin-bottom: 4px;">
                  Clique para anexar foto da folha ou arraste o arquivo
                </div>
                <div style="font-size: 12px; color: var(--slate-500);">
                  Formatos suportados: JPG, PNG, PDF (com boa nitidez)
                </div>
                <input type="file" id="file-essay-input" accept="image/*,.pdf" style="display: none;">
                <div id="file-selected-name" style="margin-top: 8px; font-weight: 700; color: var(--primary); font-size: 12.5px;">
                  Folha padrão simulada pronta (redacao-manuscrita-sofia.svg)
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Observação ou Dúvida para a Prof.ª Cristine (Opcional):</label>
              <textarea class="form-control" name="duvida" rows="2" placeholder="Ex: Professora, fiquei em dúvida se o repertório do segundo parágrafo ficou muito distante do tema..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline modal-close-btn">Cancelar</button>
            <button type="submit" class="btn btn-primary" id="btn-submit-essay-action">
              🚀 Enviar Redação
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelectorAll('.modal-close-btn').forEach(b => b.addEventListener('click', () => modal.remove()));

    const uploadBox = modal.querySelector('#drop-area-essay');
    const fileInput = modal.querySelector('#file-essay-input');
    const fileNameDisplay = modal.querySelector('#file-selected-name');

    uploadBox.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        fileNameDisplay.textContent = `✓ Arquivo anexado: ${fileInput.files[0].name}`;
      }
    });

    modal.querySelector('#form-enviar-redacao').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const temaId = formData.get('temaId');
      const tema = store.data.temas.find(t => t.id === temaId);

      store.submitRedacao({
        alunoId: student.id,
        alunoNome: student.nome,
        alunoAvatar: student.avatar,
        alunoIniciais: student.iniciais,
        temaId: temaId,
        temaTitulo: tema ? tema.titulo : 'Tema de Redação',
        imagemUrl: 'assets/mock-essays/redacao-enem-pedro.svg'
      });

      modal.remove();
      renderApp();
      showToast('Sua redação foi enviada com sucesso para a Prof.ª Cristine!');
    });
  }

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================

  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : 'toast-warning'}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✨' : 'ℹ️'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  window.showToast = showToast;
});
