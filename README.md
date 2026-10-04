# Sistema de Gerenciamento de Solicitações Internas (Atende)

Plataforma fullstack para abertura, acompanhamento e triagem de solicitações e chamados internos corporativos. A solução foi projetada sob uma arquitetura desacoplada, fortemente tipada de ponta a ponta (*End-to-End Type Safety*), conteinerizada com Docker e pronta para execução imediata sem necessidade de adaptações.

## 1. Pré-requisitos

### 1.1. Linguagem Utilizada
* TypeScript 5.9+ (Fullstack)
* Node.js 22+ (LTS)

### 1.2. Banco de Dados
* PostgreSQL 16+

### 1.3. Dependências
* **Ambiente (Host):** Git, Node.js (v22+), npm (v10+), Docker Engine (v24+) e Docker Compose (v2.20+)
* **Backend:** NestJS 11, Drizzle ORM e Drizzle Kit, Zod e nestjs-zod, Passport e JWT, Bcrypt, Cookie-Parser, Swagger / OpenAPI, Jest e Supertest
* **Frontend:** React 19, Vite 8, TanStack Router, TanStack Query (v5), openapi-fetch e openapi-typescript, Tailwind CSS v4, React Hook Form, Lucide React e Sonner

## 2. Instalação

### 2.1. Execução Automatizada via Docker Compose (Recomendada)
Para avaliar e utilizar a aplicação plena de forma imediata (sem necessidade de configurar Node.js ou banco no host), o Docker Compose provisiona e integra os 3 componentes (Banco PostgreSQL, Backend e Frontend):

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SchweetzzZ/requests_project.git
   cd requests_project
   ```

2. **Crie o arquivo `.env`:**
   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env

   # Linux / macOS (Bash)
   cp .env.example .env
   ```

3. **Suba todo o ambiente:**
   ```bash
   docker compose up --build
   ```
   > **Nota:** As migrações do banco são aplicadas automaticamente no bootstrap do backend (`RUN_MIGRATIONS=true`). Backend, Frontend e Banco já sobem integrados e funcionais.

---

### 2.2. Instalação Manual Passo a Passo (Ambiente de Desenvolvimento)
Caso queira rodar os serviços individualmente no terminal para desenvolvimento:

#### ● Banco de Dados
Inicie o serviço do PostgreSQL pelo Docker (ou utilize uma instância local na porta 5432):
```bash
docker compose up -d postgres
```

#### ● Backend
1. Acesse o diretório e instale as dependências:
   ```bash
   cd backend
   npm install
   ```
2. Crie o arquivo `backend/.env` com as configurações de banco (vide seção [Configuração](#3-configuração)).
3. Execute as migrações no banco:
   ```bash
   npm run db:migrate
   ```

#### ● Frontend
1. Acesse o diretório e instale as dependências:
   ```bash
   cd frontend
   npm install
   ```
2. Crie o arquivo `frontend/.env` apontando para a API:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

---

## 3. Configuração

### 3.1. Variáveis de Ambiente

Abaixo estão detalhadas todas as variáveis de configuração suportadas pelo sistema:

#### Variáveis do Docker / Raiz (`.env`):
| Variável | Descrição | Valor Padrão / Sugerido |
| :--- | :--- | :--- |
| `POSTGRES_USER` | Usuário administrador do PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Senha de acesso do PostgreSQL | `postgrespassword` |
| `POSTGRES_DB` | Nome da base de dados relacional | `requests_db` |
| `POSTGRES_PORT` | Porta de publicação do PostgreSQL no host | `5432` |
| `NODE_ENV` | Modo de execução da aplicação | `production` (ou `development`) |
| `PORT` | Porta interna em que o backend escuta | `3000` |
| `DATABASE_URL` | String de conexão JDBC/Postgres completa | `postgres://postgres:postgrespassword@postgres:5432/requests_db` |
| `CORS_ORIGIN` | Domínios autorizados para Cross-Origin | `http://localhost,http://localhost:80,http://localhost:5173,http://localhost:3000` |
| `JWT_SECRET` | Segredo para assinatura dos tokens JWT | `your_super_secret_jwt_key` |
| `RUN_MIGRATIONS` | Executar migrações do Drizzle no startup | `true` |
| `FRONTEND_PORT` | Porta em que o Frontend web é exposto | `80` |
| `VITE_API_URL` | URL de consumo da API consumida pelo cliente | `http://localhost:3000` |

---

### 3.2. Credenciais de Demonstração

O sistema adota um modelo de permissões direto (sem distinção por papéis/roles). Qualquer usuário autenticado tem acesso pleno para criar chamados, acompanhar a listagem e atualizar status. A regra de autorização restringe apenas a edição e exclusão de conteúdo ao autor da solicitação (enquanto com status `Aberto`).

Para testes e validação da autoria entre contas distintas, sugerimos os seguintes usuários de exemplo:

| Usuário (`user`) | Senha (`password`) | Finalidade |
| :--- | :--- | :--- |
| `usuario1` | `Senha123!` | Criação e gestão de solicitações próprias |
| `usuario2` | `Senha123!` | Validação de restrição de edição/exclusão por outros usuários |

#### Regras de Validação de Credenciais:
* **Usuário (`user`):** Mínimo de **3 caracteres**.
* **Senha (`password`):** Mínimo de **8 caracteres**.

> **Como cadastrar:** O cadastro é realizado diretamente na tela inicial (`/login`), clicando no link **"Criar conta"**, ou via Swagger no endpoint `POST /auth/register`. O login é liberado imediatamente após o cadastro.

---

## 4. Execução

### 4.1. Execução Completa da Aplicação (Docker Compose)
Para rodar a aplicação pronta de ponta a ponta (Banco + Backend + Frontend integrados):

```bash
docker compose up --build
```
> Para rodar em segundo plano (*detached mode*), adicione `-d`: `docker compose up -d --build`.  
> Para encerrar a execução: `docker compose down`.

---

### 4.2. Execução Individual para Desenvolvimento (Terminal)
> **Atenção:** Para executar os serviços individualmente via terminal (`npm`), certifique-se de que o banco de dados PostgreSQL está rodando em segundo plano:
> ```bash
> docker compose up -d postgres
> ```

#### ● Backend
No terminal do diretório `/backend`:
```bash
# Iniciar em modo desenvolvimento (recarrega automaticamente a cada alteração de código):
npm run start:dev

# Ou compilar e rodar a versão de produção:
npm run build
npm run start:prod
```

#### ● Frontend
No terminal do diretório `/frontend`:
```bash
# Iniciar o servidor de desenvolvimento com Vite (http://localhost:5173):
npm run dev

# Ou gerar o bundle final e pré-visualizar:
npm run build
npm run preview
```

---

### 4.3. Suíte de Testes Automatizados

O backend conta com testes automatizados abrangentes, cobrindo o fluxo completo de autenticação, proteção de rotas e ciclo de vida das solicitações.

Para executar os testes:
```bash
cd backend

# Executar testes unitários:
npm test

# Executar testes de integração / End-to-End (E2E):
npm run test:e2e

# Executar cobertura de testes (Coverage):
npm run test:cov
```

---

## 5. Acesso

### 5.1. URLs da Aplicação

Após inicializar os serviços, acesse os componentes nos seguintes endereços:

| Serviço / Recurso | URL | Descrição |
| :--- | :--- | :--- |
| **Frontend (Docker / Produção)** | [http://localhost:80](http://localhost:80) | Interface do usuário principal servida pelo Nginx |
| **Frontend (Vite / Dev)** | [http://localhost:5173](http://localhost:5173) | Interface em modo de desenvolvimento local |
| **Backend API** | [http://localhost:3000](http://localhost:3000) | Ponto de entrada da API REST NestJS |
| **Documentação Swagger (OpenAPI)** | [http://localhost:3000/docs](http://localhost:3000/docs) | Interface interativa com todos os endpoints documentados |
| **Especificação OpenAPI JSON** | [http://localhost:3000/docs-json](http://localhost:3000/docs-json) | Contrato bruto utilizado na geração de tipos |
| **PostgreSQL** | `localhost:5432` | Acesso direto ao banco de dados relacional |

---

### 5.2. Informações de Acesso aos Usuários de Teste

1. **Primeiro Acesso:**
   - Acesse o Frontend em `http://localhost:80` (Docker) ou `http://localhost:5173` (Dev).
   - Como o banco de dados é inicializado zerado com as tabelas criadas pelas migrações, basta criar uma conta na própria tela clicando em **"Criar conta"**.
   - Use uma das credenciais sugeridas (por exemplo, usuário `usuario1` e senha `Senha123!`).
   - Após criar a conta, faça login com as credenciais cadastradas. O token JWT será atribuído automaticamente.

2. **Testando com Múltiplos Usuários:**
   - Para validar o isolamento e as regras de autoria, registre um segundo usuário (por exemplo, `usuario2` / `Senha123!`).
   - Observe que as regras de negócio do sistema garantem que apenas o autor original da solicitação pode **editar o conteúdo** ou **excluir** o chamado enquanto ele estiver com status `Aberto`.
   - A **alteração de status** (`Aberto` -> `Em Atendimento` -> `Concluído`) pode ser realizada para fins de triagem por qualquer membro da equipe.

---

### 5.3. Roteiro de Teste do Avaliador

Para avaliar todas as funcionalidades implementadas na aplicação:

1. **Abertura de Solicitação:**
   - No painel superior, clique no botão **"Nova Solicitação"**.
   - Preencha o formulário com **Título**, **Descrição** e selecione a **Categoria** (`TI`, `RH`, `Compras`, `Financeiro`, `Infraestrutura`).
   - Ao submeter, a solicitação é salva no PostgreSQL e surge instantaneamente na lista com o status `Aberto`.

2. **Filtros e Busca em Tempo Real:**
   - Utilize a barra de busca para filtrar solicitações pelo título ou descrição.
   - Utilize os filtros de **Status** (`Todos`, `Aberto`, `Em Atendimento`, `Concluído`) e **Categoria**.
   - Note que os parâmetros de pesquisa e paginação são refletidos diretamente na URL via TanStack Router, permitindo recarregar ou compartilhar a visualização.

3. **Ciclo de Vida do Chamado (Status):**
   - No card ou na linha da solicitação, altere o status de `Aberto` para `Em Atendimento` e, em seguida, para `Concluído`.
   - Observe a atualização dos contadores de resumo no topo do painel.

4. **Validação das Regras de Negócio e Permissões:**
   - Solicitações em `Em Atendimento` ou `Concluído` bloqueiam a edição de conteúdo e a exclusão.
   - Um usuário diferente não consegue alterar ou excluir chamados de outro autor.

5. **Documentação Swagger:**
   - Acesse [http://localhost:3000/docs](http://localhost:3000/docs) para inspecionar e testar diretamente todas as rotas da API (`/auth/register`, `/auth/login`, `/auth/me`, `/solicitacoes`).

---

## 6. Documentação Complementar
* **[MEMORIAL_TECNICO.md](MEMORIAL_TECNICO.md):** Memorial descritivo com fundamentação arquitetural, justificativas das escolhas tecnológicas, análise crítica e roadmap de melhorias.
