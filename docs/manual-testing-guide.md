# Roteiro de Testes Manuais - Portfolio & Analytics

## 🎯 Objetivo
Validar as funcionalidades de Portfolio Digital e Analytics Dashboard através de testes exploratórios.

---

## ⚙️ Pré-requisitos

- ✅ Servidor rodando em `http://localhost:5000`
- ✅ Banco de dados com dados de seed
- ✅ Navegador moderno (Chrome/Firefox/Safari)

---

## 📋 Teste 1: Portfolio Digital (Aluno)

### Setup Inicial
1. Abra `http://localhost:5000`
2. **Login:**
   - Email: `lucas.alves@aluno.com`
   - Senha: `demo123`

### 1.1 Acessar Portfolio
**Passos:**
1. Localize menu lateral esquerdo
2. Clique em **"Meu Portfolio"**

**Critérios de Aceitação:**
- ✅ Página carrega sem erros
- ✅ Seções visíveis: "Configurações", "Projetos no Portfolio", "Adicionar Projetos"

### 1.2 Configurar Slug Personalizado
**Passos:**
1. Na seção "Configurações", localize campo "URL Personalizada"
2. Digite: `lucas-teste-portfolio`
3. Clique em **"Salvar Configurações"**

**Critérios de Aceitação:**
- ✅ Toast de sucesso aparece ("Configurações salvas!")
- ✅ Campo mantém o valor inserido após salvar

### 1.3 Ativar Visibilidade Pública
**Passos:**
1. Localize toggle "Tornar portfolio público"
2. Ative (on)
3. Clique em **"Salvar Configurações"**

**Critérios de Aceitação:**
- ✅ Toggle permanece ativado após salvar
- ✅ Botão "Ver Portfolio Público" aparece no topo

### 1.4 Adicionar Projeto ao Portfolio
**Passos:**
1. Role até seção **"Adicionar Projetos"**
2. Verifique lista de projetos disponíveis
3. Clique em **"Adicionar"** ao lado de um projeto
4. Aguarde confirmação

**Critérios de Aceitação:**
- ✅ Toast de sucesso aparece ("Projeto adicionado ao portfolio!")
- ✅ Projeto some da lista "Adicionar Projetos"
- ✅ Projeto aparece em "Projetos no Portfolio"
- ✅ Card do projeto mostra: título, matéria, data, nota

### 1.5 Visualizar Portfolio Público
**Passos:**
1. Clique no botão **"Ver Portfolio Público"** (topo da página)
2. Nova aba abre com a URL pública
3. Observe conteúdo exibido

**Critérios de Aceitação:**
- ✅ URL contém `/portfolio/lucas-teste-portfolio`
- ✅ Header mostra: avatar, nome "Lucas Alves"
- ✅ Grid mostra projeto(s) adicionado(s)
- ✅ Página é acessível SEM estar logado (teste em aba anônima)

### 1.6 Remover Projeto do Portfolio
**Passos:**
1. Volte para `/portfolio` (área logada)
2. Em "Projetos no Portfolio", localize um projeto
3. Clique no ícone de **lixeira** (canto superior direito do card)

**Critérios de Aceitação:**
- ✅ Toast de confirmação aparece ("Projeto removido do portfolio")
- ✅ Projeto desaparece de "Projetos no Portfolio"
- ✅ Projeto volta para lista "Adicionar Projetos"

---

## 📊 Teste 2: Analytics Dashboard (Coordenador)

### Setup Inicial
1. **Logout** da conta de aluno (menu superior direito)
2. **Login:**
   - Email: `coordenador@escola.com`
   - Senha: `demo123`

### 2.1 Acessar Analytics
**Passos:**
1. Localize menu lateral esquerdo
2. Clique em **"Analytics"**

**Critérios de Aceitação:**
- ✅ Página carrega sem erros
- ✅ 4 cards superiores visíveis
- ✅ 2 gráficos visíveis
- ✅ 1 tabela visível

### 2.2 Verificar Cards de Métricas Gerais
**Passos:**
1. Observe os 4 cards no topo da página

**Critérios de Aceitação:**
- ✅ **Card 1 - Total de Alunos:** Número > 0 (ex: 3)
- ✅ **Card 2 - Projetos Ativos:** Número > 0 (ex: 2-4)
- ✅ **Card 3 - Taxa de Entrega:** Percentual exibido (0-100%)
- ✅ **Card 4 - Nota Média:** Valor numérico (0-100)
- ✅ Ícones corretos em cada card (Users, BookOpen, CheckCircle, TrendingUp)

### 2.3 Verificar Gráfico de Engajamento
**Passos:**
1. Localize gráfico "Engajamento por Turma"
2. Observe barras e legenda

**Critérios de Aceitação:**
- ✅ Gráfico de barras visível
- ✅ Eixo X mostra nomes de turmas (ex: "1º Ano A")
- ✅ Eixo Y mostra percentuais (0-100)
- ✅ Duas séries de barras:
  - Azul: "Taxa de Entrega (%)"
  - Verde: "Presença (%)"
- ✅ Tooltip aparece ao passar mouse sobre barras

### 2.4 Verificar Gráfico BNCC
**Passos:**
1. Localize gráfico "Competências BNCC Mais Trabalhadas"
2. Observe pizza e legenda

**Critérios de Aceitação:**
- ✅ Gráfico de pizza visível
- ✅ Até 5 fatias com cores diferentes
- ✅ Percentuais dentro das fatias
- ✅ Legenda mostra nomes das competências
- ✅ Tooltip ao passar mouse

### 2.5 Verificar Tabela de Alunos em Risco
**Passos:**
1. Role até "Alunos em Risco"
2. Observe conteúdo da tabela

**Critérios de Aceitação:**
- ✅ Cabeçalhos: Nome, Turma, XP, Faltas, Status
- ✅ Pelo menos 1 aluno listado (ou mensagem "Nenhum aluno em risco")
- ✅ Badge "Atenção Necessária" visível (cor vermelha)
- ✅ Dados consistentes (valores numéricos corretos)

---

## 🧪 Teste 3: Validação de Dados

### 3.1 Consistência entre Aluno e Coordenador
**Passos:**
1. Como **aluno**, adicione 2 projetos ao portfolio
2. Faça **logout**
3. Login como **coordenador**
4. Vá para Analytics
5. Verifique se "Taxa de Entrega" reflete as novas submissões

**Critérios de Aceitação:**
- ✅ Métricas atualizam em tempo real
- ✅ Dados são consistentes entre visões

### 3.2 Portfolio Privado
**Passos:**
1. Como **aluno**, desative "Tornar portfolio público"
2. Salve
3. Copie URL pública
4. Abra em **aba anônima** (sem login)
5. Cole a URL

**Critérios de Aceitação:**
- ✅ Mensagem de erro aparece: "Portfolio não encontrado ou privado"
- ✅ Conteúdo do portfolio NÃO é exibido

---

## 📸 Evidências Esperadas

### Capturas Recomendadas
1. **Portfolio do Aluno** - Configurações salvas
2. **Portfolio Público** - Visualização externa
3. **Analytics Dashboard** - Visão geral completa
4. **Gráfico de Engajamento** - Com dados
5. **Tabela de Alunos em Risco** - Lista populada

---

## ✅ Checklist Final

### Portfolio Digital
- [ ] Slug personalizado funciona
- [ ] Toggle público/privado funciona
- [ ] Adicionar projeto funciona
- [ ] Remover projeto funciona
- [ ] Página pública acessível (quando público)
- [ ] Página pública bloqueada (quando privado)

### Analytics Dashboard
- [ ] Todos os 4 cards carregam
- [ ] Gráfico de engajamento renderiza
- [ ] Gráfico BNCC renderiza
- [ ] Tabela de alunos em risco carrega
- [ ] Dados são consistentes
- [ ] Performance aceitável (< 2s para carregar)

---

## 🐛 Registro de Bugs

Se encontrar problemas, anote aqui:

| # | Página | Descrição | Severidade |
|---|--------|-----------|------------|
| 1 |        |           | Crítico/Alto/Médio/Baixo |
| 2 |        |           |            |
| 3 |        |           |            |

---

## ⏱️ Tempo Estimado

- **Portfolio:** 10 minutos
- **Analytics:** 8 minutos
- **Validações:** 5 minutos
- **TOTAL:** ~25 minutos
