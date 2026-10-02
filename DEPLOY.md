# Guia de Deploy na Railway e Docker

Este documento contém a arquitetura de contêineres e o passo a passo completo para deploy da aplicação na **Railway**, além da execução local com Docker.

---

## 1. Como funciona o Deploy automatizado na Railway

Por padrão, a Railway detecta alterações no repositório do GitHub e realiza o deploy. Para garantir que o deploy só aconteça se todos os testes, lint e validações passarem, o fluxo recomendado é:

1. **Controle de Deploy:** No painel da Railway, em cada serviço: `Settings > Build & Deploy > Automatic Deployments: Turn OFF`.
2. **Validação Automática no GitHub Actions:** Em cada `push` para a branch `main`:
   - Executa testes unitários e de integração (Jest)
   - Executa validações de lint (ESLint no Backend e Frontend)
   - Valida a compilação do TypeScript e do Vite
   - Valida o build dos contêineres Docker
3. **Disparo do Deploy:** Somente após todas as validações passarem com sucesso, o GitHub Actions dispara o deploy na Railway via CLI ou Webhook.

---

## 2. Automação com GitHub Actions (`.github/workflows/deploy.yml`)

Para ativar o workflow automatizado no seu repositório quando desejar, basta criar o arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    name: Lint, Test & Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
          cache-dependency-path: |
            backend/package-lock.json
            frontend/package-lock.json

      # ------------------- BACKEND -------------------
      - name: Install Backend dependencies
        run: npm ci
        working-directory: ./backend

      - name: Run Backend Lint
        run: npm run lint
        working-directory: ./backend

      - name: Run Backend Unit Tests
        run: npm test
        working-directory: ./backend

      - name: Run Backend E2E Tests
        run: npm run test:e2e
        working-directory: ./backend

      - name: Build Backend
        run: npm run build
        working-directory: ./backend

      # ------------------- FRONTEND ------------------
      - name: Install Frontend dependencies
        run: npm ci
        working-directory: ./frontend

      - name: Run Frontend Lint
        run: npm run lint
        working-directory: ./frontend

      - name: Build Frontend
        run: npm run build
        working-directory: ./frontend

  docker-build:
    name: Docker Build Validation
    runs-on: ubuntu-latest
    needs: [lint-and-test]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Backend Docker Image
        uses: docker/build-push-action@v6
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: false
          tags: requests-backend:local

      - name: Build Frontend Docker Image
        uses: docker/build-push-action@v6
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: false
          tags: requests-frontend:local
          build-args: |
            VITE_API_URL=https://api.example.com

  deploy:
    name: Deploy to Railway
    runs-on: ubuntu-latest
    needs: [lint-and-test, docker-build]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # Metodo 1: Railway CLI (Recomendado)
      - name: Deploy via Railway CLI
        if: "${{ secrets.RAILWAY_TOKEN != '' }}"
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
          BACKEND_SERVICE: ${{ vars.RAILWAY_BACKEND_SERVICE || 'backend' }}
          FRONTEND_SERVICE: ${{ vars.RAILWAY_FRONTEND_SERVICE || 'frontend' }}
        run: |
          npm install -g @railway/cli
          echo "Disparando deploy para o servico backend..."
          railway up --service "$BACKEND_SERVICE" --detach
          echo "Disparando deploy para o servico frontend..."
          railway up --service "$FRONTEND_SERVICE" --detach

      # Metodo 2: Webhook de Deploy (Alternativa simplificada)
      - name: Deploy via Railway Webhook
        if: "${{ secrets.RAILWAY_DEPLOY_WEBHOOK != '' && secrets.RAILWAY_TOKEN == '' }}"
        env:
          WEBHOOK_URL: ${{ secrets.RAILWAY_DEPLOY_WEBHOOK }}
        run: |
          echo "Disparando deploy via Railway Webhook..."
          curl -f -X POST "$WEBHOOK_URL"
```

---

## 3. Passo a Passo de Configuração na Railway

### Passo 1: Criar o Projeto e o Banco
1. Acesse [railway.com](https://railway.com) e crie um **Novo Projeto**.
2. Clique em **Add Service > Database > Add PostgreSQL**.
   - Isso criará um banco gerenciado e disponibilizará a variável `${{Postgres.DATABASE_URL}}`.

### Passo 2: Adicionar o Serviço do Backend
1. Clique em **Add Service > GitHub Repo** e selecione o repositório.
2. Nas configurações do serviço:
   - **Root Directory:** `/backend`
   - Em **Settings > Build & Deploy**:
     - Desative **Automatic Deployments** (para que o deploy seja acionado via pipeline após testes).
   - Em **Variables**, configure:
     - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
     - `PORT`: `3000`
     - `NODE_ENV`: `production`
     - `JWT_SECRET`: uma chave secreta segura (ex: `jwt_super_seguro_123`)
     - `CORS_ORIGIN`: URL pública do seu frontend (ex: `https://frontend-production-xxxx.up.railway.app`)
     - `RUN_MIGRATIONS`: `true` (o backend executa as migrações do Drizzle automaticamente no bootstrap).
3. Em **Networking**, clique em **Generate Domain** para gerar o domínio público da API.

### Passo 3: Adicionar o Serviço do Frontend
1. Clique em **Add Service > GitHub Repo** e selecione o mesmo repositório.
2. Nas configurações do serviço:
   - **Root Directory:** `/frontend`
   - Em **Settings > Build & Deploy**:
     - Desative **Automatic Deployments**.
   - Em **Build Variables / Build Args**:
     - `VITE_API_URL`: URL pública gerada no backend (ex: `https://backend-production-xxxx.up.railway.app`).
   - Em **Networking**, clique em **Generate Domain** para expor o frontend.

### Passo 4: Conectar o GitHub Actions com a Railway
No seu repositório no GitHub, acesse **Settings > Secrets and variables > Actions**:

- **Opção A (Railway CLI - Recomendada):**
  - Crie um token no Railway em: **Project Settings > Tokens > New Token**.
  - Adicione no GitHub Secrets com o nome `RAILWAY_TOKEN`.
  - (Opcional) Crie as variáveis `RAILWAY_BACKEND_SERVICE` e `RAILWAY_FRONTEND_SERVICE` caso os nomes dos serviços na Railway sejam diferentes de `backend` e `frontend`.

- **Opção B (Deploy Webhook):**
  - No painel da Railway, em cada serviço: **Settings > Deployments > Deploy Webhook > Create Webhook**.
  - Adicione a URL gerada como Secret `RAILWAY_DEPLOY_WEBHOOK` no GitHub.

---

## 4. Testando os Contêineres Localmente com Docker Compose

Para rodar todo o ambiente de uma só vez (PostgreSQL + Backend + Frontend):

```bash
docker compose up --build
```

- **Frontend:** http://localhost:80
- **Backend / Swagger:** http://localhost:3000/docs
- **PostgreSQL:** localhost:5432
