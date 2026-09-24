# ✍️ Salinha Produtiva Redação • Prof.ª Cristine Teixeira

Aplicação frontend interativa (100% mockada) projetada sob medida para a **Prof.ª Cristine Teixeira** acompanhar seus alunos, turmas, propostas de redação e realizar a correção visual com marcador de texto sobre as redações no padrão oficial do ENEM (0 a 1000 pontos).

---

## 🎨 Identidade Visual & Design System

Inspirado diretamente na identidade do curso e nas publicações do Instagram:
- **Cores Principais:** Roxo Intenso (`#581C87` / `#4C1D95`), Amarelo Ouro / Âmbar da Marca (`#F59E0B` / `#FBBF24`), Branco Neve e Ardósia.
- **Tipografia:** Moderna e legível (*Inter* para a interface e *Caveat* para a simulação de caligrafia nas folhas de redação).
- **Fotografias Reais:** Fotos oficiais da Prof.ª Cristine, logo da Salinha Produtiva e alunas em destaque (Sofia Barbosa - Nota 960 no ENEM e Ana Clara - Aprovada em Odontologia UEA).

---

## 🚀 Como Executar

Você pode abrir o projeto de duas formas extremamente simples:

### Opção 1: Servidor Local Node.js (Recomendado)
Basta rodar no terminal dentro da pasta do projeto:
```bash
npm start
# ou
node server.js
```
Em seguida, abra o navegador em: **`http://localhost:3000`**

### Opção 2: Abrir Diretamente no Navegador
Como o projeto foi desenvolvido com tecnologias web modernas nativas (HTML5, CSS3 e JavaScript ES6 puro, sem necessidade de build ou conexão externa):
- Dê um duplo-clique no arquivo `index.html` ou abra-o em qualquer navegador (Chrome, Safari, Edge, Firefox).

---

## 🌟 Funcionalidades Implementadas

### 1. Barra de Simulação no Topo (Alternância de Papéis)
No topo da tela há uma barra fixa que permite alternar instantaneamente entre:
- **👩‍🏫 Painel da Professora (Cristine Teixeira)**: visão completa de gestão, turmas e corretor.
- **🎓 Portal do Aluno**: experimente a visão exata do aluno (com seletor para alternar entre *Sofia Barbosa*, *Ana Clara*, *Pedro Lucas*, etc.).
- **🔄 Restaurar Dados**: botão para redefinir as redações e notas de teste a qualquer momento.

---

### 2. Painel da Professora (Cristine Teixeira)
- **Visão Geral (Dashboard):**
  - Métricas em tempo real: Alunos Ativos, Turmas Produtivas, Redações Aguardando Correção e Média Geral da Salinha.
  - Banner com as alunas em destaque e aprovações.
  - Fila de redações recentes prontas para correção.
- **Gestão de Alunos:**
  - Cadastro de novos alunos com nome, turma, telefone/WhatsApp, e-mail e objetivo (ex: Medicina UEA, Direito UFAM, ENEM 960+).
  - Tabela com histórico individual, quantidade de redações e média atual.
- **Gestão de Turmas:**
  - Organização por turmas: *Extensivo Medicina ENEM 2026*, *UEA Macro Intensivo*, *ENEM Nota 1000 (Sábado)* e *Mentoria Individual VIP*.
  - Criação de novas turmas com horários e foco temático.
  - Alunos matriculados e desempenho médio da turma.
- **Temas & Propostas de Redação:**
  - Criação e envio de novos temas com título, eixo temático, prazo limite com contagem regressiva e textos motivadores de apoio.
  - Destinação para turmas inteiras ou alunos específicos.
- **🖍️ Corretor Interativo de Redação (Destaque Principal):**
  - **Visualizador em Canvas:** carrega a imagem/folha pautada de 30 linhas enviada pelo aluno em alta resolução.
  - **Marcador de Texto Retangular:** clique e arraste para destacar linhas e períodos do texto com transparência suave.
  - **Pincel Livre:** anotações livres manuscritas.
  - **Balões de Comentário (💬):** clique em qualquer ponto da folha para adicionar observações e dicas pontuais da professora.
  - **Cores por Competência do ENEM:**
    - 🟡 **Geral / Atenção** (`#FBBF24`)
    - 🟢 **Ponto Forte / Repertório Nota 1000** (`#10B981`)
    - 🔴 **Desvio Gramatical / C1** (`#EF4444`)
    - 🔵 **Projeto de Texto & Argumentação / C3** (`#3B82F6`)
    - 🟣 **Proposta de Intervenção Completa / C5** (`#8B5CF6`)
  - **Desfazer / Refazer / Limpar:** controle total sobre as anotações.
  - **Grade Oficial ENEM (0 a 1000 pontos):**
    - Seleção de níveis oficiais para cada uma das 5 competências (`0, 40, 80, 120, 160, 200 pts`).
    - Cálculo automático da nota final em tempo real.
    - Chips de sugestão rápida de comentários pedagógicos (*Repertório Produtivo*, *5 Elementos na C5*, *Variar Conectivos*, *Tese Clara*).
    - Campo de parecer pedagógico dissertativo.
    - Simulação de gravação de áudio de mentoria por voz.
    - Botão "Liberar Nota para o Aluno".

---

### 3. Portal do Aluno
- **Boas-vindas Personalizadas:** com foto do aluno, meta acadêmica e destaque para a nota média atual.
- **Gráfico de Evolução:** linha do tempo visual mostrando o crescimento de notas ao longo dos temas trabalhados (ex: 780 ➔ 820 ➔ 880 ➔ 920 ➔ 940 ➔ 960).
- **Envio de Redações:** modal para envio de foto da folha pautada com seleção da proposta ativa e campo para dúvidas.
- **Histórico & Redações Corrigidas:**
  - Status em tempo real (*Pendente*, *Em Correção*, *Corrigida*).
  - **Visualização das Anotações da Professora:** o aluno abre a sua folha de redação e visualiza todos os grifos coloridos e balões de comentário deixados pela Prof.ª Cristine.
  - Reprodutor interativo do feedback em áudio.
  - Barras de pontuação detalhadas de cada uma das 5 competências.

---

## 📁 Estrutura de Arquivos

```
salinha-produtiva/
├── assets/
│   ├── logo.png                       # Logo oficial da Salinha Produtiva
│   ├── student-ana-clara.png          # Foto oficial da aluna Ana Clara (UEA)
│   ├── student-sofia.png              # Foto oficial da aluna Sofia (Nota 960)
│   ├── brand-bottles.png              # Foto dos brindes/garrafas da marca
│   └── mock-essays/
│       ├── redacao-enem-sofia.svg     # Folha oficial ENEM simulada com redação
│       └── redacao-enem-pedro.svg     # Folha oficial ENEM simulada para correção
├── css/
│   └── style.css                      # Design system completo da Salinha Produtiva
├── js/
│   ├── data.js                        # Base de dados mockada e reativa (LocalStorage)
│   ├── canvas-highlighter.js          # Motor interativo do marcador de texto sobre a folha
│   └── app.js                         # Controladora da aplicação, modais e transições
├── index.html                         # Página principal do sistema
├── server.js                          # Servidor HTTP Node.js estático sem dependências
├── package.json
└── README.md
```
