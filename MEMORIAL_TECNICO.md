# Memorial Técnico de Desenvolvimento

## 1. Apresentação e Objetivo
Este documento compõe a documentação oficial da solução e tem como finalidade registrar e fundamentar o processo decisório, as escolhas tecnológicas e as decisões arquiteturais adotadas no desenvolvimento do Sistema de Gerenciamento de Solicitações Internas. Ao final pontuarei melhorias poderiam ser feitas em um contexto com maior tempo e sem limitações
impostas pelo contexto da avaliação.

---

## 2. Tecnologias Utilizadas e Justificativa Técnica

### 2.1. Linguagem de Programação
* **TypeScript (Fullstack):** Adotado tanto no backend quanto no frontend para estabelecer uma linguagem unificada e fortemente tipada em toda a aplicação. A detecção precoce de inconsistências em tempo de compilação e o compartilhamento de tipos eliminam bugs comuns da tipagem dinâmica do JavaScript puro. Essa abordagem melhora a produtividade através do autocompletion e assegura manutenibilidade contínua ao longo da evolução do projeto.

### 2.2. Backend e Acesso a Dados
* **NestJS:** Escolhido por ser o padrão corporativo mais consolidado no ecossistema Node.js/TypeScript. Sua arquitetura modular e o sistema nativo de injeção de dependências organizam o projeto com separação estrita de responsabilidades, facilitando o onboarding de novos desenvolvedores, a criação de testes e a manutenção.
* **Drizzle ORM:** Escolhido pela proximidade com a sintaxe do SQL nativo, alta performance e constante evolução. O Prisma foi avaliado como alternativa, mas a preferência pessoal e maior controle sobre as queries geradas foram o principal fator.
* **PostgreSQL:** Escolhido como banco de dados relacional por sua maturidade, robustez e conformidade estrita com o padrão ACID, essenciais para a integridade dos dados em um sistema de chamados. Oferece suporte nativo a identificadores UUID e enums declarativos, trazendo vantagens diretas sobre opções NoSQL ou bancos mais simples (como SQLite), garantindo integridade referencial por chaves estrangeiras e escalabilidade a longo prazo.
* **Zod e `nestjs-zod`:** Utilizado para a validação estrita dos contratos de entrada e saída da API. Permite definir as regras em um único schema que valida os dados em tempo de execução e infere os tipos do TypeScript estaticamente, eliminando duplicações entre classes DTO e regras manuais de validação.
* **Swagger / OpenAPI (`@nestjs/swagger`):** Empregado para gerar automaticamente a documentação interativa e os contratos da API a partir dos decoradores do NestJS e dos schemas Zod. Elimina o esforço manual de manter documentações externas sincronizadas e atua como base para a geração dos tipos TypeScript consumidos pelo frontend (`openapi-fetch`), garantindo que qualquer divergência de contrato seja detectada imediatamente durante o build.

### 2.3. Autenticação, Criptografia e Segurança
* **JWT (JSON Web Token) e Passport:** Utilizados para viabilizar uma estratégia de autenticação stateless e desacoplada no backend. A integração com o `@nestjs/passport` permite proteger rotas via Guards declarativos de forma limpa e padronizada. Em relação a sessões tradicionais salvas em memória ou cache (como Redis), o JWT reduz o overhead de infraestrutura no cenário proposto e viabiliza a escalabilidade horizontal da API sem perda de performance.
* **Bcrypt e Cookies HttpOnly:** O Bcrypt é utilizado para gerar hashes das senhas com salt. No login, o JWT é definido em um cookie com as flags HttpOnly e SameSite=Lax; a flag Secure é habilitada em produção. O cookie HttpOnly impede que scripts acessem diretamente o valor armazenado nele. Porém, o endpoint de login também retorna o access_token no corpo da resposta, então o token não é transmitido exclusivamente pelo cookie.

### 2.4. Frontend e Interface
***Vite + React 19:*** Configuração direta e enxuta para uma Single Page Application (SPA) interna. Focado em simplicidade de build, rapidez no ciclo de desenvolvimento local e suporte aos recursos modernos do React.
***TanStack Router:*** Utilizado para organizar as rotas e validar tipadamente parâmetros de busca. Atualmente, a rota de solicitações usa o parâmetro novo; pesquisa, filtros e paginação são mantidos em estado local.
***TanStack Query:*** Gerenciamento do estado assíncrono e controle de cache das requisições à API, simplificando o tratamento de estados de carregamento, erro e atualização dos dados na tela sem a necessidade de criar e sincronizar estados globais manuais (como Redux ou Zustand).
***openapi-fetch:*** Cliente HTTP leve e tipado que consome os tipos gerados diretamente a partir do schema OpenAPI/Swagger do backend, fornecendo autocompletion de rotas, parâmetros e payloads, além de verificação estática de tipos de ponta a ponta.
***Tailwind CSS v4:*** Escolhido como ferramenta de estilização utilitária para acelerar a construção da interface.

### 2.5. Qualidade, Infraestrutura e DevOps
***Jest e Supertest:*** Como o projeto não é extremamente grande, optei por fazer um teste E2E para englobar todas as funcionalidades usando jest, inves de ter varios unitarios. O Supertest permite simular requisições HTTP reais contra a aplicação sem necessidade de subir o servidor em uma porta de rede externa, validando regras de negócio, fluxos de persistência e respostas de status com alta confiabilidade para refatorações.
***Docker e Docker Compose:*** Adotados para containerizar a aplicação e orquestrar múltiplos serviços (Frontend servido com Nginx, Backend Node.js e banco PostgreSQL) de forma isolada e previsível. Eliminam problemas de inconsistência entre ambientes de desenvolvimento e produção, permitindo que qualquer desenvolvedor suba todo o ecossistema com um único comando.
***Railway e GitHub Actions:*** A Railway foi escolhida como plataforma em nuvem (PaaS) pela agilidade de provisionamento e suporte direto a contêineres Docker e instâncias gerenciadas de PostgreSQL, reduzindo o custo operacional de manter servidores dedicados. O GitHub Actions complementa essa esteira automatizando o pipeline de CI/CD, executando rotinas de lint, validação de tipos e testes a cada *push*, garantindo que apenas código estável seja entregue.

---

## 3. Justificativa Conceitual (Decisões Arquiteturais)

### 3.1. Estrutura Geral da Aplicação
A aplicação adota o modelo de **Arquitetura Cliente-Servidor Desacoplada**. O backend funciona como um provedor de dados e regras de negócio stateless, expondo endpoints JSON documentados via OpenAPI. O frontend é uma aplicação cliente de página única (SPA), totalmente desacoplada, servida de forma estática via servidor Nginx de alta performance em contêiner Docker. Essa separação garante independência no ciclo de vida, build e deploy de cada parte do sistema.

### 3.2. Organização das Camadas
* **Backend:** A estrutura segue o modelo modular do NestJS, dividido em domínios de negócio (`modules/auth`, `modules/solicitacoes`, `modules/db`). Cada módulo organiza-se em camadas funcionais:
  * *Controllers:* Responsáveis pelo roteamento HTTP, extração de parâmetros e serialização da resposta de acordo com a documentação OpenAPI.
  * *Services:* Centralizam as regras de negócio, lógica de permissões e orquestração das operações de dados.
  * *Camada de Dados (Drizzle / DB Module):* Responsável pelo schema relacional, mapeamento de tabelas e execução de queries SQL tipadas.
  * *DTOs e Schemas:* Camada de validação na borda da aplicação, assegurando que apenas dados em conformidade com as regras cheguem aos serviços.
* **Frontend:** A base de código é estruturada por responsabilidades técnicas e reutilização:
  * `routes/`: Roteamento e telas mapeadas diretamente em arquivos com TanStack Router.
  * `services/` e `api/`: Camada de rede tipada e esquemas de dados gerados automaticamente do backend.
  * `hooks/`: Encapsulamento de lógica de negócio da interface, mutações e consultas assíncronas via TanStack Query.
  * `components/`: Componentes visuais atômicos e reutilizáveis (modais, caixas de seleção, botões de status).

### 3.3. Estratégia de Modelagem de Dados
O modelo de dados é relacional e normalizado em torno de duas entidades centrais: `users` e `solicitacoes`.
***Identificadores UUID:*** As tabelas utilizam identificadores UUID como chaves primárias. Por não serem sequenciais, eles tornam os identificadores menos previsíveis.
***Enums Nativos no Banco de Dados:*** Campos com valores restritos e padronizados — como o status (`Aberto`, `Em Atendimento`, `Concluído`) e a categoria (`TI`, `RH`, `Compras`, etc.) — foram modelados com `pgEnum` diretamente no PostgreSQL, garantindo integridade e consistência a nível de banco.
***Integridade Referencial:*** A relação entre solicitações e usuários é garantida por Foreign Key estrita (`solicitacoes.usuario_id -> users.id`), garantindo rastreabilidade do autor da solicitação e prevenindo registros órfãos.

### 3.4. Padrões de Projeto (Design Patterns) Utilizados
***Injeção de Dependências e Inversão de Controle (IoC/DI):*** Utilizado de forma nativa através do NestJS para desacoplar a inicialização de classes e serviços, facilitando a substituição por mocks durante a execução de testes automatizados.
***Strategy Pattern:** Implementado na autenticação através do Passport (`JwtStrategy`), isolando o algoritmo e as regras de extração e validação do token JWT do restante dos controllers e regras de negócio.
***Guards e Decorators:** Uso de `JwtAuthGuard` para proteção declarativa de endpoints e criação de decoradores customizados (como `@currentUser()`) para injeção limpa dos dados do usuário autenticado diretamente nos métodos do controller.
***Single Source of Truth para Contratos:** O Zod atua como fonte única de verdade, inferindo tipos estáticos para o TypeScript (`z.infer`) a partir do mesmo schema responsável pela validação em tempo de execução.

### 3.5. Estratégia de Autenticação e Segurança
A solução adota autenticação stateless via JWT. No login, o servidor assina um token contendo os identificadores essenciais do usuário e o define em um cookie com as flags HttpOnly e SameSite=Lax; a flag Secure é habilitada em produção. O endpoint também retorna o access_token no corpo da resposta. As rotas sensíveis são protegidas pelo JwtAuthGuard, que valida a assinatura e a validade temporal do token. As senhas de acesso são armazenadas como hashes unidirecionais gerados pelo bcrypt com salt.

### 3.6. Estratégia de Comunicação Frontend-Backend
A comunicação baseia-se em APIs RESTful. O backend gera sua especificação via @nestjs/swagger. O frontend usa openapi-typescript para gerar tipos TypeScript a partir dessa especificação e openapi-fetch para realizar chamadas tipadas à API. Alterações no contrato podem ser identificadas pelo build depois que os tipos forem atualizados; a geração desses tipos é uma etapa separada. A rota de solicitações usa o TanStack Rou ter para validar o parâmetro novo; os filtros e a paginação permanecem em estado local e não são sincronizados com a URL.

### 3.7. Organização do Código-Fonte
O projeto adota uma estrutura em repositório único dividido por domínios (`/backend` e `/frontend`). Embora compartilhem o repositório para facilitar a orquestração do ambiente local com Docker Compose e o pipeline de CI/CD no GitHub Actions, cada aplicação possui dependências e scripts isolados (`package.json` próprio). No backend, os arquivos são agrupados por domínio funcional (`auth`, `solicitacoes`, `db`), garantindo alta coesão e baixo acoplamento entre os módulos.

### 4. Análise Crítica do Projeto

### 4.1. Limitações da Solução Implementada
***Modelo de Permissões Plano (Flat Permissions):** No escopo atual, qualquer usuário autenticado possui as mesmas permissões para listar, criar e alterar o status das solicitações, inexistindo a diferenciação entre quem solicita e quem atende. O ideal seria evoluir para um sistema de permissões mais robusto, como o RBAC (Role-Based Access Control).
***Ciclo de Vida da Sessão:** A autenticação utiliza um único token JWT estático gravado em cookie, sem rotação periódica via Refresh Token, o que exige novo login manual após a expiração.
***Comunicação Unidirecional (Polling/Refetch):** A atualização dos dados na tela depende de revalidação pelo TanStack Query no frontend, sem o uso de WebSockets ou SSE para refletir alterações de status em tempo real. Dependendo da demanda, poderíamos adicionar um SSE para atualização em tempo real.
***Ausência de Trilha de Auditoria:** O banco de dados registra apenas a data de criação do chamado e o autor original, sem histórico cronológico das mutações intermediárias de status. Seria ideal adicionar uma tabela de auditoria para rastrear as alterações de status e outras informações relevantes.

#### 4.2. Requisitos que Poderiam ser Aperfeiçoados
***Classificação por Prioridade/Gravidade:** O escopo atual não contempla níveis de urgência (como Baixa, Média, Alta ou Crítica). Em um cenário real, a fila de chamados não deve depender apenas da ordem cronológica de abertura, mas sim do impacto da solicitação na operação da empresa.
***Justificativa e Parecer de Encerramento:** O fluxo atual permite transitar uma solicitação diretamente para `Concluído` sem a obrigatoriedade de registrar uma resposta ou solução técnica. Exigir um campo de resolução no fechamento agregaria rastreabilidade e permitiria criar uma base de conhecimento para problemas recorrentes.
***Máquina de Estados e Transições Obrigatórias:** A especificação não impõe travas de transição de status. Poderia ser aperfeiçoada com regras formais de máquina de estados, impedindo, por exemplo, que um chamado seja concluído sem antes passar por `Em Atendimento`.

#### 4.3. Melhorias Futuras
***Controle de Acesso Baseado em Funções (RBAC Completo):** Implementação de perfis de usuário (`SOLICITANTE`, `ATENDENTE`, `ADMIN`) com permissões validadas no backend através de decoradores customizados e de um `RolesGuard` dedicado no NestJS.
***Sessão com Refresh Token e Login Social (SSO):** Adoção de Refresh Tokens rotativos armazenados em banco ou Redis para renovação silenciosa de sessão. Em um contexto corporativo, integração com provedores de identidade OAuth2.
***Painel Administrativo e Métricas:** Criação de um dashboard gerencial com indicadores-chave de desempenho (KPIs), como Tempo Médio de Atendimento (TMA), volume de solicitações por categoria e gargalos departamentais.
***Operações em Lote e Relatórios:** Suporte a importação massiva de solicitações via upload e processamento de planilhas (CSV/XLSX), além de exportação de dados filtrados para relatórios em PDF e Excel.
***Organização do Monorepo e Orquestração de Builds:** Com o crescimento da aplicação, poderia ser adotado o npm workspaces para centralizar a gestão das dependências e facilitar o compartilhamento de pacotes entre frontend e backend. Caso o número de aplicações e a complexidade do pipeline aumentassem, ferramentas como Turborepo poderiam otimizar a execução e o cache de builds e testes.

#### 4.4. Decisões que Seriam Diferentes em um Ambiente Corporativo de Produção
***Observabilidade e Telemetria:** Em produção de larga escala, a aplicação contaria com monitoramento via OpenTelemetry (Datadog ou Grafana Loki/Prometheus).
***Filas Assíncronas e Cache com Redis:** O envio de e-mails, o processamento de planilhas e a geração de relatórios pesados seriam desacoplados do ciclo de requisição HTTP da API, sendo delegados a filas assíncronas em segundo plano com **BullMQ / Redis**.
***Armazenamento de Arquivos em Object Storage:*** Uploads de anexos seriam gerenciados via URLs pré-assinadas (*Presigned URLs*) diretamente para um bucket seguro (AWS S3 ou Cloudflare R2), retirando do banco de dados a responsabilidade de armazenar arquivos volumosos.
