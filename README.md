# Sistema de Gerenciamento de Solicitações Internas (Solicita+)

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

Escolha **uma** das duas formas de executar o projeto:

| | Opção A: Docker Compose | Opção B: Local (sem Docker para o app) |
|---|---|---|
| **Indicada para** | Avaliar a aplicação rapidamente | Desenvolver (hot reload) |
| **O que precisa instalar** | Apenas Docker | Node.js 22+ e Docker (só para o banco) |
| **Comando principal** | `docker compose up --build` | `npm run start:dev` (back) + `npm run dev` (front) |
| **Arquivo `.env` usado** | **Opcional**: um só, na raiz (o compose já traz padrões) | **Um em `backend/` e outro em `frontend/`** |
| **Frontend em** | http://localhost | http://localhost:5173 |

> Primeiro, clone o repositório (vale para as duas opções):
>
> ```bash
> git clone https://github.com/SchweetzzZ/requests_project.git
> cd requests_project
> ```

---

### 2.1. Opção A: Docker Compose (recomendada, mais rápida)

Sobe Banco, Backend e Frontend já integrados, sem instalar Node.js nem configurar banco na sua máquina.

> ✅ **Não é necessário criar nenhum `.env` para testar.** O `docker-compose.yml` já traz valores padrão (*fallbacks*) para todas as variáveis (banco de dados, JWT, usuários de demonstração etc.), então basta rodar `docker compose up --build`.
>
> Se preferir usar valores próprios (outra senha, outra porta, outro `JWT_SECRET`), crie um `.env` na raiz a partir do `.env.example` e ajuste. Quando ele existe, o Compose o usa no lugar dos padrões.
>
> ⚠️ Os valores padrão são pensados apenas para teste local.
O Docker Compose lê **somente o `.env` da raiz** do projeto (quando existir). Os arquivos `backend/.env` e `frontend/.env` **não são usados** neste modo.

1. **(Opcional) Personalize com um `.env` na raiz:**
   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env

   # Linux / macOS (Bash)
   cp .env.example .env
   ```

2. **Suba tudo:**
   ```bash
   docker compose up --build
   ```

3. **Acesse** http://localhost (veja a seção [5. Acesso](#5-acesso) para os usuários de teste).

> As migrações e a criação dos usuários de demonstração rodam automaticamente na subida do backend (`RUN_MIGRATIONS=true`).
>
> Para rodar em segundo plano, use `docker compose up -d --build`. Para encerrar, `docker compose down`.

---

### 2.2. Opção B: Execução local para desenvolvimento

Neste modo, **só o banco roda no Docker**; backend e frontend rodam direto no seu terminal, com recarga automática a cada alteração.

Aqui o `.env` da raiz é opcional e serve apenas para o container do PostgreSQL (`POSTGRES_*`); sem ele valem os padrões do compose (`postgres` / `postgrespassword` / `requests_db`). Backend e frontend usam **cada um o seu próprio `.env`**, que você cria manualmente, e o `DATABASE_URL` do `backend/.env` deve usar o mesmo usuário, senha e nome de banco do container.

**Pré-requisitos:** Node.js 22+, npm 10+ e Docker (apenas para o banco).

#### Passo 1: Banco de dados

```bash
# Na raiz do projeto (o .env da raiz é opcional; sem ele valem os padrões do compose)
docker compose up -d postgres
```

#### Passo 2: Backend

```bash
cd backend
npm install
```

Crie o arquivo `backend/.env`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://postgres:postgrespassword@localhost:5432/requests_db
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key
RUN_MIGRATIONS=true
DEMO_USERS=usuario1,usuario2
DEMO_PASSWORD=Senha123!
```

> ⚠️ **Atenção ao host do banco:** fora do Docker, o host em `DATABASE_URL` é **`localhost`** (no `.env` da raiz é `postgres`, o nome do serviço dentro da rede do Compose). Usuário, senha e nome do banco devem ser os mesmos definidos em `POSTGRES_*` na raiz.

Inicie o backend:

```bash
npm run start:dev
```

Com `RUN_MIGRATIONS=true`, as migrações e os usuários de demonstração são aplicados automaticamente ao iniciar. Se preferir rodar as migrações manualmente, deixe `RUN_MIGRATIONS=false` e execute `npm run db:migrate`.

#### Passo 3: Frontend

Em **outro terminal**:

```bash
cd frontend
npm install
```

Crie o arquivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Inicie o frontend:

```bash
npm run dev
```

#### Passo 4: Acessar

Frontend em http://localhost:5173 e API em http://localhost:3000 (Swagger em `/docs`).

---

### Resumo: qual `.env` usar em cada caso

| Modo | `.env` raiz | `backend/.env` | `frontend/.env` |
|---|---|---|---|
| **Opção A:** `docker compose up --build` | ⚙️ opcional (sem ele valem os padrões do compose) | ❌ ignorado | ❌ ignorado |
| **Opção B:** local (`start:dev` + `dev`) | ⚙️ opcional, só para o container do Postgres | ✅ obrigatório | ✅ obrigatório |

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
| `RUN_MIGRATIONS` | Executar migrações do Drizzle no startup (e o seed dos usuários de demonstração) | `true` |
| `DEMO_USERS` | Usuários de demonstração a criar no primeiro start, separados por vírgula. Vazio = não cria | `usuario1,usuario2` |
| `DEMO_PASSWORD` | Senha (mín. 8 caracteres) comum a todos os usuários de `DEMO_USERS` | `Senha123!` |
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

> **Usuários já criados:** `usuario1` e `usuario2` são criados automaticamente na primeira inicialização do backend, a partir das variáveis `DEMO_USERS` e `DEMO_PASSWORD` (o `docker compose` já traz esses valores como padrão; o seed roda junto com as migrações, quando `RUN_MIGRATIONS=true`). Nas inicializações seguintes, quem já existe é ignorado. Se as variáveis não forem informadas, nenhum usuário é criado e o backend apenas registra um aviso no log; nesse caso, use **"Criar conta"**.
>
> **Cadastro de novos usuários (opcional):** O cadastro é realizado diretamente na tela inicial (`/login`), clicando no link **"Criar conta"**, ou via Swagger no endpoint `POST /auth/register`. O login é liberado imediatamente após o cadastro.

---

## 4. Execução

### 4.1. Execução Completa da Aplicação (Docker Compose)
Para rodar a aplicação pronta de ponta a ponta (Banco + Backend + Frontend integrados):

```bash
docker compose up --build
```
> Não é preciso criar `.env`: o `docker-compose.yml` já traz valores padrão para teste (veja a [seção 2.1](#21-opção-a-docker-compose-recomendada-mais-rápida)).
>
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

#### ● Atualizar os tipos da API (apenas se o backend mudar)
O arquivo `frontend/src/api/schema.ts` já está versionado no repositório, então **não é necessário gerá-lo** para rodar ou avaliar o projeto. Se você alterar rotas ou DTOs do backend, com o backend rodando em `http://localhost:3000`, execute no diretório `/frontend`:
```bash
npm run generate:api
```
O comando lê o contrato OpenAPI em `/docs-json` e regenera os tipos usados pelo `openapi-fetch`.

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
   - Os usuários de demonstração `usuario1` e `usuario2` (senha `Senha123!`) já são criados automaticamente na primeira inicialização (via `DEMO_USERS` e `DEMO_PASSWORD`), então não é preciso se cadastrar.
   - Faça login com uma dessas credenciais. O token JWT será atribuído automaticamente.
   - Se preferir, também é possível criar uma conta nova pelo link **"Criar conta"**.

2. **Testando com Múltiplos Usuários:**
   - Para validar o isolamento e as regras de autoria, entre com `usuario1` em uma janela e com `usuario2` em outra (use uma janela anônima, para não compartilhar o cookie de sessão).
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
   - Utilize a barra de busca para filtrar solicitações pelo título ou pelo código (ex.: `SOL-0001`), e os campos de data inicial e final para filtrar por período.
   - Utilize os filtros de **Status** (`Todos`, `Aberto`, `Em Atendimento`, `Concluído`) e **Categoria**.
   - Os filtros e a paginação são mantidos em estado local da página.
   - Clique no ícone de olho na linha de uma solicitação para abrir o modal de detalhes.

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
* **[DICIONARIO_DE_DADOS.md](DICIONARIO_DE_DADOS.md):** Dicionário de dados com diagrama ER, tabelas, colunas, enums, relacionamentos e regras de negócio que afetam o banco.
