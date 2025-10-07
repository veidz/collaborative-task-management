# Sistema de Gerenciamento Colaborativo de Tarefas

Uma plataforma de gerenciamento de tarefas baseada em microsserviços com comunicação em tempo real.

## 📋 Índice

- [Arquitetura](#-arquitetura)
- [Decisões Técnicas e Trade-offs](#-decisões-técnicas-e-trade-offs)
- [Problemas Conhecidos e Melhorias](#-problemas-conhecidos-e-melhorias)
- [Tempo Gasto](#-tempo-gasto)
- [Como Executar o Projeto](#-como-executar-o-projeto)

## 🏗️ Arquitetura

### Diagrama da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      Camada Cliente                          │
│                    (React + TanStack)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST & WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Gateway                            │
│              (Porta 3001 - NestJS)                          │
│  • Autenticação & Autorização                               │
│  • Roteamento e Agregação de Requisições                   │
│  • Gerenciamento WebSocket                                   │
└──────┬────────┬────────────────┬─────────────────────────────┘
       │        │                 │
       ▼        ▼                 ▼
┌──────────┐ ┌──────────┐ ┌───────────────┐
│   Auth   │ │  Tasks   │ │ Notifications │
│ Service  │ │ Service  │ │   Service     │
│  :3002   │ │  :3003   │ │     :3004     │
└────┬─────┘ └────┬─────┘ └───────┬───────┘
     │            │                │
     └────────────┴────────────────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
    ┌─────────┐      ┌──────────┐
    │PostgreSQL│      │RabbitMQ  │
    │  :5432  │      │  :5672   │
    └─────────┘      └──────────┘
```

### Componentes

- **Web App** (React + Vite): Interface do usuário com comunicação em tempo real
- **API Gateway**: Ponto de entrada único, gerencia autenticação e roteamento
- **Auth Service**: Gerenciamento de usuários e autenticação JWT
- **Tasks Service**: CRUD de tarefas, comentários e atribuições
- **Notifications Service**: Processamento e entrega de notificações em tempo real
- **PostgreSQL**: Banco de dados relacional (database-per-service)
- **RabbitMQ**: Message broker para comunicação assíncrona

### Stack Tecnológico

**Backend:**

- NestJS (Node.js/TypeScript)
- TypeORM
- JWT (Passport)
- Socket.io
- Pino (logging)

**Frontend:**

- React 19
- TanStack Router & Query
- Zustand
- Tailwind CSS + shadcn/ui
- Socket.io client

**Infraestrutura:**

- Docker & Docker Compose
- PostgreSQL 17.5
- RabbitMQ 3.13
- Turborepo (monorepo)

## 🎯 Decisões Técnicas e Trade-offs

### 1. Arquitetura de Microsserviços

**Decisão:** Dividir a aplicação em serviços independentes (auth, tasks, notifications).

**Vantagens:**

- Escalabilidade independente de cada serviço
- Isolamento de falhas
- Times podem trabalhar em paralelo
- Tecnologias específicas por serviço (se necessário)

**Trade-offs:**

- Maior complexidade operacional
- Overhead de comunicação entre serviços
- Transações distribuídas são complexas
- Mais difícil de debugar

**Alternativa considerada:** Monolito modular (mais simples, mas menos escalável)

### 2. Database-per-Service

**Decisão:** Cada serviço tem seu próprio banco de dados PostgreSQL.

**Vantagens:**

- Isolamento completo de dados
- Serviços podem evoluir schemas independentemente
- Melhor performance (sem contenção)

**Trade-offs:**

- Joins entre serviços impossíveis
- Consistência eventual (não ACID entre serviços)
- Duplicação de dados pode ser necessária

**Alternativa considerada:** Banco de dados compartilhado (mais simples, mas acoplamento alto)

### 3. RabbitMQ para Comunicação Assíncrona

**Decisão:** Usar RabbitMQ para eventos entre serviços (ex: task.created → notification).

**Vantagens:**

- Desacoplamento temporal
- Resiliência (retry automático)
- Backpressure handling
- Garante entrega de mensagens

**Trade-offs:**

- Adiciona complexidade
- Consistência eventual
- Precisa monitorar filas

**Alternativa considerada:** HTTP direto entre serviços (mais simples, mas menos resiliente)

### 4. API Gateway Pattern

**Decisão:** Usar um gateway central para todas as requisições do cliente.

**Vantagens:**

- Ponto único de entrada
- Autenticação centralizada
- Rate limiting centralizado
- Simplifica o cliente

**Trade-offs:**

- Single point of failure
- Pode virar gargalo
- Adiciona latência

**Alternativa considerada:** Cliente comunica direto com cada serviço (mais complexo no frontend)

### 5. Monorepo com Turborepo

**Decisão:** Todos os serviços e frontend em um único repositório.

**Vantagens:**

- Código compartilhado fácil (types, utils)
- Refactoring atômico
- CI/CD simplificado
- Versioning unificado

**Trade-offs:**

- Repositório grande
- Build pode ser lento (mitigado por Turborepo)
- Permissões granulares difíceis

**Alternativa considerada:** Multi-repo (mais isolamento, mas complexidade de versionamento)

### 6. TypeScript em Todo o Stack

**Decisão:** TypeScript tanto no backend quanto frontend.

**Vantagens:**

- Type safety end-to-end
- Melhor DX (autocomplete, refactoring)
- Menos bugs em runtime
- Código compartilhado entre frontend/backend

**Trade-offs:**

- Curva de aprendizado
- Build step necessário
- Configuração mais complexa

**Alternativa considerada:** JavaScript puro (mais simples, mas menos seguro)

## ⚠️ Problemas Conhecidos e Melhorias

### Problemas Conhecidos

1. **Falta de Testes**
   - **Impacto:** Alto risco de regressões
   - **Solução:** Implementar testes unitários (Jest), integração (Supertest) e E2E (Playwright)

2. **Sem Rate Limiting**
   - **Impacto:** Vulnerável a ataques DDoS
   - **Solução:** Adicionar rate limiting no API Gateway (ex: @nestjs/throttler)

3. **Logs Não Centralizados**
   - **Impacto:** Difícil debugar problemas em produção
   - **Solução:** Integrar com ELK Stack ou similar (Datadog, New Relic)

4. **Sem Monitoramento/Observabilidade**
   - **Impacto:** Não sabemos se serviços estão saudáveis
   - **Solução:** Prometheus + Grafana para métricas

5. **Migrations Não Versionadas Adequadamente**
   - **Impacto:** Pode causar problemas em deploys
   - **Solução:** Automatizar migrations em CI/CD com rollback

6. **Sem Backup Automatizado**
   - **Impacto:** Perda de dados catastrófica
   - **Solução:** Configurar backups automáticos do PostgreSQL

### Melhorias Futuras

#### Curto Prazo (1-2 semanas)

- [ ] **Adicionar validação de entrada rigorosa** em todos os endpoints
- [ ] **Implementar refresh token rotation** para maior segurança
- [ ] **Adicionar health checks** mais robustos (verificar DB, RabbitMQ)
- [ ] **Documentar APIs** com mais exemplos no Swagger
- [ ] **Adicionar seed data** para facilitar desenvolvimento

#### Médio Prazo (1-2 meses)

- [ ] **Implementar caching** (Redis) para reduzir carga no DB
- [ ] **Adicionar busca full-text** nas tarefas (Elasticsearch ou pg_trgm)
- [ ] **Implementar soft delete** para recuperação de dados
- [ ] **Adicionar paginação** em todas as listagens
- [ ] **Implementar upload de arquivos** (S3/MinIO)
- [ ] **Circuit breaker** para chamadas entre serviços

#### Longo Prazo (3+ meses)

- [ ] **Migrar para Kubernetes** para melhor orquestração
- [ ] **Implementar service mesh** (Istio) para observabilidade
- [ ] **Event Sourcing** para auditoria completa
- [ ] **GraphQL API** como alternativa ao REST
- [ ] **Multi-tenancy** para suportar múltiplas organizações

### Débito Técnico

| Item               | Severidade | Esforço   | Prioridade |
| ------------------ | ---------- | --------- | ---------- |
| Testes             | 🔴 Alta    | 3 semanas | Alta       |
| Rate Limiting      | 🟡 Média   | 2 dias    | Alta       |
| Monitoring         | 🟡 Média   | 1 semana  | Média      |
| Logs Centralizados | 🟡 Média   | 1 semana  | Média      |
| Backups            | 🔴 Alta    | 2 dias    | Alta       |
| Caching            | 🟢 Baixa   | 1 semana  | Baixa      |

## ⏱️ Tempo Gasto

### Planejamento e Design (8 horas)

- Definição da arquitetura de microsserviços: 2h
- Modelagem do banco de dados: 2h
- Definição de APIs e contratos: 2h
- Setup do monorepo e estrutura: 2h

### Backend Development (39 horas)

- **Auth Service** (7h)
  - Setup NestJS + TypeORM: 2h
  - Implementação JWT + refresh tokens: 3h
  - CRUD de usuários: 2h

- **Tasks Service** (12h)
  - Setup + TypeORM entities: 2h
  - CRUD de tarefas: 4h
  - Sistema de comentários: 3h
  - Atribuições de usuários: 2h
  - Integração RabbitMQ: 1h

- **Notifications Service** (10h)
  - Setup + TypeORM: 2h
  - Consumer RabbitMQ: 3h
  - WebSocket server: 3h
  - CRUD notificações: 2h

- **API Gateway** (10h)
  - Setup NestJS: 1h
  - Proxy para serviços: 3h
  - Autenticação centralizada: 3h
  - WebSocket gateway: 2h
  - Documentação Swagger: 1h

### Frontend Development (20 horas)

- Setup React + Vite + Tailwind: 2h
- Configuração TanStack Router: 2h
- Sistema de autenticação: 2h
- Interface de tarefas (listagem/criação/edição): 6h
- Sistema de comentários: 4h
- WebSocket integration + notificações: 4h

### DevOps e Infraestrutura (11 horas)

- Docker Compose configuration: 3h
- Dockerfiles para cada serviço: 3h
- Setup PostgreSQL + RabbitMQ: 1h
- Scripts de setup e migrations: 2h
- Health checks e dependências: 2h

### Documentação (5 horas)

- README principal: 3h
- Documentação de APIs: 2h

### Debugging e Ajustes (10 horas)

- Correção de bugs: 5h
- Ajustes de configuração: 3h
- Otimizações: 2h

**Total: ~90 horas (~2 semanas de trabalho)**

## 🚀 Como Executar o Projeto

### Pré-requisitos

- **Node.js** 20+ e **pnpm** (para build local dos pacotes compartilhados)
- **Docker Desktop** (ou Docker Engine + Docker Compose)
- **Git**

### Instalação do pnpm

```bash
# Via npm
npm install -g pnpm

# Via Homebrew (macOS)
brew install pnpm

# Via Corepack (recomendado - já vem com Node.js 16+)
corepack enable
corepack prepare pnpm@latest --activate
```

### Passo a Passo

#### 1. Clone o Repositório

```bash
git clone git@github.com:veidz/collaborative-task-management.git
cd collaborative-task-management
```

#### 2. Instale Dependências e Build dos Pacotes

```bash
# Instala todas as dependências do monorepo
pnpm install

# Faz build dos pacotes compartilhados (@packages/types e @packages/utils)
pnpm --filter @packages/types build
pnpm --filter @packages/utils build
```

> **Por que fazer build antes?** Os serviços NestJS importam os pacotes compartilhados (`@packages/types` e `@packages/utils`). O build local garante que os arquivos `.d.ts` e `.js` estejam disponíveis antes de iniciar os containers. Note que `@packages/utils` contém utilitários como logger config e health checks, mas NÃO contém providers/guards/decorators NestJS (que precisam ficar locais por questões de injeção de dependência).

#### 3. Inicie Todos os Serviços com Docker

```bash
docker-compose up
```

**O que acontece automaticamente:**

1. ✅ Container `setup` cria arquivos `.env` baseado nos `.env.example` de cada serviço
2. ✅ PostgreSQL inicializa e cria os bancos de dados necessários:
   - `auth_service`
   - `tasks_service`
   - `notifications_service`
3. ✅ RabbitMQ inicia o message broker
4. ✅ Cada serviço backend:
   - Usa as dependências já instaladas (via volume mount)
   - Executa migrations do banco de dados
   - Inicia em modo desenvolvimento com hot-reload
5. ✅ API Gateway aguarda todos os serviços estarem saudáveis (health checks)
6. ✅ Frontend compila e inicia com Vite

**Primeira execução:** Pode levar 5-10 minutos (build das imagens Docker)

**Execuções seguintes:** ~1 minuto (usa cache)

#### 4. Acesse a Aplicação

Aguarde até ver as mensagens de sucesso nos logs. Então acesse:

| Serviço            | URL                            | Credenciais                          |
| ------------------ | ------------------------------ | ------------------------------------ |
| **Interface Web**  | http://localhost:3000          | -                                    |
| **API Gateway**    | http://localhost:3001          | -                                    |
| **Swagger Docs**   | http://localhost:3001/api/docs | -                                    |
| **RabbitMQ Admin** | http://localhost:15672         | user: `rabbitmq`<br>pass: `rabbitmq` |

**Para criar uma conta:**

1. Acesse http://localhost:3000
2. Clique em "Registrar"
3. Preencha o formulário
4. Faça login e comece a usar!

### Comandos Úteis

```bash
# Rebuild dos pacotes após mudanças
pnpm --filter @packages/types build
pnpm --filter @packages/utils build

# Limpar arquivos compilados localmente
pnpm clean

# Iniciar Docker em modo background (detached)
docker-compose up -d

# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api-gateway
docker-compose logs -f web

# Parar todos os serviços
docker-compose down

# Parar e REMOVER volumes (limpa banco de dados)
docker-compose down -v

# Rebuild Docker após mudanças no código ou dependências
docker-compose up --build

# Rebuild de um serviço específico
docker-compose up --build tasks-service

# Restart de um serviço
docker-compose restart notifications-service

# Executar comando dentro de um container
docker-compose exec tasks-service sh
docker-compose exec tasks-service pnpm migration:run
```

### Troubleshooting

#### ❌ Porta já está em uso

```bash
# Verifique qual processo está usando a porta
lsof -i :3000  # ou :3001, :3002, etc

# Pare os containers
docker-compose down

# Ou mude a porta no docker-compose.yml
```

#### ❌ Serviço não inicia ou fica reiniciando

```bash
# Veja os logs do serviço
docker-compose logs -f <nome-do-servico>

# Exemplos comuns:
# - Arquivo .env não foi criado (execute: docker-compose up setup)
# - Porta em uso (veja solução acima)
# - Erro de migration (verifique logs do PostgreSQL)
```

#### ❌ Erro de conexão com banco de dados

```bash
# Verifique se o PostgreSQL está rodando
docker-compose ps postgres

# Veja os logs
docker-compose logs -f postgres

# Recrie o banco (ATENÇÃO: apaga todos os dados)
docker-compose down -v
docker-compose up
```

#### ❌ Mudanças no código não aparecem

**Backend (NestJS):** Hot-reload automático, mas às vezes precisa rebuild:

```bash
docker-compose up --build <servico>
```

**Frontend (Vite):** Hot-reload funciona automaticamente. Se não funcionar:

```bash
docker-compose restart web
```

#### 🔄 Resetar Tudo e Começar do Zero

```bash
# Remove containers, volumes e imagens
docker-compose down -v --rmi local

# Inicia novamente
docker-compose up --build
```

### Verificação de Saúde

Cada serviço expõe um endpoint `/health`:

```bash
curl http://localhost:3001/health  # API Gateway
curl http://localhost:3002/health  # Auth Service
curl http://localhost:3003/health  # Tasks Service
curl http://localhost:3004/health  # Notifications Service
```

Resposta esperada: `{"status":"ok"}`

### Estrutura de Portas

| Serviço       | Porta | Descrição       |
| ------------- | ----- | --------------- |
| Web           | 3000  | Frontend React  |
| API Gateway   | 3001  | Gateway central |
| Auth Service  | 3002  | Autenticação    |
| Tasks Service | 3003  | Tarefas         |
| Notifications | 3004  | Notificações    |
| PostgreSQL    | 5432  | Banco de dados  |
| RabbitMQ      | 5672  | AMQP            |
| RabbitMQ UI   | 15672 | Interface web   |

### Variáveis de Ambiente

Cada serviço tem seu próprio arquivo `.env` em `apps/<servico>/.env`, criado automaticamente pelo container `setup` baseado no `.env.example`.
