# ⚡ TaskFlow — Gerenciador de Tarefas

Aplicação web completa de gerenciamento de tarefas com **frontend em HTML/CSS/JS**, **backend em Express.js** e **testes automatizados com Cypress**.

---

## 🏗️ Estrutura do Projeto

```
taskflow/
├── frontend/
│   └── index.html          # Interface do usuário (HTML + CSS + JS)
├── backend/
│   ├── server.js           # API REST com Express
│   └── package.json
├── cypress/
│   └── e2e/
│       ├── backend.cy.js   # Testes da API (HTTP requests)
│       └── frontend.cy.js  # Testes de interface (browser)
├── .github/
│   └── workflows/
│       ├── backend-tests.yml   # CI para testes do backend
│       └── frontend-tests.yml  # CI para testes do frontend
├── cypress.config.js
└── package.json
```

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm

### 1. Instalar dependências

```bash
# Na raiz do projeto
npm install

# No backend
cd backend && npm install
```

### 2. Iniciar o backend

```bash
cd backend
node server.js
# Servidor rodando em http://localhost:3001
```

### 3. Iniciar o frontend

Opção A — Com http-server:
```bash
npm install -g http-server
http-server frontend -p 8080
# Frontend em http://localhost:8080
```

Opção B — Abrir direto no browser:
```bash
open frontend/index.html
# Nota: o CORS pode bloquear requisições sem servidor HTTP
```

---

## 🧪 Testes com Cypress

> **Importante:** os testes requerem backend (porta 3001) e frontend (porta 8080) rodando.

### Executar testes do backend
```bash
npx cypress run --spec "cypress/e2e/backend.cy.js"
```

### Executar testes do frontend
```bash
npx cypress run --spec "cypress/e2e/frontend.cy.js"
```

### Executar todos os testes
```bash
npx cypress run
```

### Interface gráfica do Cypress
```bash
npx cypress open
```

---

## 📋 API Endpoints

| Método | Rota              | Descrição                  |
|--------|-------------------|----------------------------|
| GET    | /api/health       | Status da API              |
| GET    | /api/tasks        | Listar todas as tarefas    |
| GET    | /api/tasks/:id    | Buscar tarefa por ID       |
| POST   | /api/tasks        | Criar nova tarefa          |
| PUT    | /api/tasks/:id    | Atualizar tarefa           |
| DELETE | /api/tasks/:id    | Deletar tarefa             |
| POST   | /api/reset        | Resetar dados (para testes)|

### Exemplo de payload (POST /api/tasks)
```json
{
  "title": "Minha tarefa",
  "description": "Descrição opcional"
}
```

---

## ✅ Cobertura de Testes

### Backend (18 testes)
- ✅ Health check
- ✅ GET /tasks — lista vazia e com dados
- ✅ POST /tasks — criação válida, sem título, título vazio
- ✅ GET /tasks/:id — busca por ID e ID inexistente
- ✅ PUT /tasks/:id — atualização de status e título
- ✅ DELETE /tasks/:id — deleção e ID inexistente
- ✅ Fluxo CRUD completo

### Frontend (17 testes)
- ✅ Layout e elementos da página
- ✅ Criação de tarefas (com e sem descrição, Enter, validação)
- ✅ Conclusão de tarefas
- ✅ Deleção de tarefas
- ✅ Filtros (Todas, Pendentes, Concluídas)

---

## 🔄 GitHub Actions (CI)

Dois workflows são disparados automaticamente a cada **push**:

- **backend-tests.yml** → Inicia o servidor e roda `cypress/e2e/backend.cy.js`
- **frontend-tests.yml** → Inicia backend + frontend e roda `cypress/e2e/frontend.cy.js`

---

## 🛠️ Tecnologias

| Camada    | Tecnologia        |
|-----------|-------------------|
| Frontend  | HTML5, CSS3, JS   |
| Backend   | Node.js, Express  |
| Testes    | Cypress 13        |
| CI/CD     | GitHub Actions    |
