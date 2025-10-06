# Sistema de Gerenciamento Colaborativo de Tarefas

Uma plataforma moderna e escalável de gerenciamento de tarefas baseada em microsserviços, construída com NestJS, React e comunicação em tempo real.

## 🏗️ Visão Geral da Arquitetura

Este projeto implementa uma **arquitetura de microsserviços** com padrão API Gateway, projetada para escalabilidade, manutenibilidade e colaboração em tempo real.

### Arquitetura de Alto Nível

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

## 🔧 Stack de Tecnologias

### Backend

- **Framework**: NestJS (Node.js)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL com TypeORM
- **Message Broker**: RabbitMQ
- **Documentação de API**: Swagger/OpenAPI
- **Autenticação**: JWT (Passport)
- **Logging**: Pino
- **Tempo Real**: Socket.io

### Frontend

- **Framework**: React
- **Roteamento**: TanStack Router
- **Gerenciamento de Estado**: Zustand + TanStack Query
- **Componentes UI**: Radix UI + shadcn/ui
- **Estilização**: Tailwind CSS
- **Formulários**: React Hook Form + Zod
- **Ferramenta de Build**: Vite

### DevOps & Ferramentas

- **Monorepo**: Turborepo + pnpm workspaces
- **Containerização**: Docker + Docker Compose
- **Linting**: ESLint
- **Formatação**: Prettier
- **Git Hooks**: Husky + lint-staged
- **Convenção de Commits**: Commitlint

## 📦 Estrutura do Projeto

```
collaborative-task-management/
├── apps/                           # Serviços da aplicação
│   ├── api-gateway/               # API Gateway Central
│   │   ├── src/
│   │   │   ├── auth/             # Proxy de autenticação
│   │   │   ├── tasks/            # Proxy de tarefas
│   │   │   ├── comments/         # Proxy de comentários
│   │   │   ├── notifications/    # Proxy de notificações
│   │   │   └── websocket/        # Gateway WebSocket
│   │   └── Dockerfile
│   │
│   ├── auth-service/             # Autenticação & Gerenciamento de Usuários
│   │   ├── src/
│   │   │   ├── auth/             # Autenticação JWT
│   │   │   └── users/            # CRUD de usuários
│   │   ├── migrations/           # Migrações do banco de dados
│   │   └── Dockerfile
│   │
│   ├── tasks-service/            # Gerenciamento de Tarefas & Comentários
│   │   ├── src/
│   │   │   ├── tasks/            # CRUD de tarefas & atribuições
│   │   │   └── comments/         # Gerenciamento de comentários
│   │   ├── migrations/           # Migrações do banco de dados
│   │   └── Dockerfile
│   │
│   ├── notifications-service/    # Notificações em Tempo Real
│   │   ├── src/
│   │   │   ├── notifications/    # CRUD de notificações
│   │   │   ├── websocket/        # Servidor WebSocket
│   │   │   └── events/           # Consumidores de eventos
│   │   ├── migrations/           # Migrações do banco de dados
│   │   └── Dockerfile
│   │
│   └── web/                      # Frontend React
│       ├── src/
│       │   ├── components/       # Componentes UI reutilizáveis
│       │   ├── pages/            # Componentes de páginas
│       │   ├── hooks/            # Hooks React customizados
│       │   ├── stores/           # Stores Zustand
│       │   └── lib/              # Utilitários & cliente API
│       └── Dockerfile
│
├── packages/                      # Pacotes compartilhados
│   ├── types/                    # Tipos TypeScript compartilhados
│   ├── utils/                    # Utilitários compartilhados
│   ├── tsconfig/                 # Configurações TypeScript compartilhadas
│   └── eslint-config/            # Configurações ESLint compartilhadas
│
├── docker/                        # Configuração Docker
│   └── postgres/
│       └── init.sql              # Inicialização do banco de dados
│
├── scripts/                       # Scripts utilitários
│   └── setup.sh                  # Configuração do ambiente
│
├── docker-compose.yml            # Orquestração de serviços
├── turbo.json                    # Configuração Turborepo
├── pnpm-workspace.yaml           # Configuração workspace PNPM
└── package.json                  # Configuração pacote raiz
```

## 🎯 Responsabilidades dos Serviços

### API Gateway (Porta 3001)

**Propósito**: Ponto de entrada único para todas as requisições do cliente

**Responsabilidades**:

- Roteia requisições para os microsserviços apropriados
- Valida tokens JWT e aplica autenticação
- Agrega respostas de múltiplos serviços
- Gerencia conexões WebSocket para atualizações em tempo real
- Fornece documentação de API unificada via Swagger

**Recursos Principais**:

- Configuração CORS
- Pipes de validação global
- Tratamento de erros centralizado
- Transformação de requisição/resposta

### Auth Service (Porta 3002)

**Propósito**: Autenticação e autorização de usuários

**Responsabilidades**:

- Registro e login de usuários
- Geração de tokens JWT (tokens de acesso e atualização)
- Hash e validação de senha (bcrypt)
- Gerenciamento de perfil de usuário
- Endpoint de verificação de token

**Banco de Dados**: `auth_service` (PostgreSQL)

- Tabelas: `users`

### Tasks Service (Porta 3003)

**Propósito**: Funcionalidade principal de gerenciamento de tarefas

**Responsabilidades**:

- Operações CRUD de tarefas
- Atribuição de tarefas a usuários
- Gerenciamento de comentários em tarefas
- Atualizações de status de tarefas
- Publica eventos para RabbitMQ para notificações

**Banco de Dados**: `tasks_service` (PostgreSQL)

- Tabelas: `tasks`, `comments`, `task_assignments`

**Publicação de Eventos**:

- `task.created`, `task.updated`, `task.deleted`
- `task.assigned`, `task.unassigned`
- `comment.created`

### Notifications Service (Porta 3004)

**Propósito**: Entrega de notificações em tempo real

**Responsabilidades**:

- Consome eventos do RabbitMQ
- Cria registros de notificação
- Entrega notificações em tempo real via WebSocket
- CRUD de notificações e gerenciamento de status
- Mantém conexões WebSocket

**Banco de Dados**: `notifications_service` (PostgreSQL)

- Tabelas: `notifications`

**Consumidores de Eventos**:

- Escuta eventos de tarefas e comentários
- Cria notificações específicas por usuário

### Aplicação Web (Porta 3000)

**Propósito**: Interface do usuário

**Responsabilidades**:

- UI de autenticação (login/registro)
- Dashboard e gerenciamento de tarefas
- Exibição de notificações em tempo real
- Formulários de criação e edição de tarefas
- Threads de comentários

**Tecnologias Principais**:

- TanStack Query para gerenciamento de estado do servidor
- Zustand para gerenciamento de estado do cliente
- Cliente Socket.io para conexões WebSocket
- Radix UI para componentes acessíveis

## 🔄 Padrões de Comunicação

### Comunicação Síncrona (HTTP/REST)

- **Cliente ↔ API Gateway**: Chamadas API REST
- **API Gateway ↔ Serviços**: Requisições proxy HTTP via Axios

### Comunicação Assíncrona (Fila de Mensagens)

- **Tasks Service → RabbitMQ**: Publica eventos de domínio
- **Notifications Service ← RabbitMQ**: Consome eventos e cria notificações

### Comunicação em Tempo Real (WebSocket)

- **Cliente ↔ API Gateway**: Conexão Socket.io
- **API Gateway ↔ Notifications Service**: Conexão interna Socket.io
- **Fluxo**: Notification Service → API Gateway → Cliente

## 🗄️ Arquitetura do Banco de Dados

Cada serviço possui seu próprio banco de dados PostgreSQL seguindo o padrão **database-per-service**:

### auth_service

```sql
users (id, email, password_hash, name, created_at, updated_at)
```

### tasks_service

```sql
tasks (id, title, description, status, priority, due_date, created_by, created_at, updated_at)
comments (id, task_id, user_id, content, created_at, updated_at)
task_assignments (id, task_id, user_id, assigned_at)
```

### notifications_service

```sql
notifications (id, user_id, type, title, message, is_read, related_id, created_at)
```

**Migrações**: Cada serviço gerencia suas próprias migrações usando TypeORM CLI.

## 🚀 Começando

### Pré-requisitos

- Node.js >= 20.0.0
- pnpm >= 10.0.0
- Docker & Docker Compose

### Instalação

1. **Clone o repositório**

```bash
git clone git@github.com:veidz/collaborative-task-management.git
cd collaborative-task-management
```

2. **Instale as dependências**

```bash
pnpm install
```

3. **Inicie todos os serviços**

```bash
docker-compose up
```

Isto irá iniciar:

- PostgreSQL (porta 5432)
- RabbitMQ (porta 5672, interface de gerenciamento na porta 15672)
- Auth Service (porta 3002)
- Tasks Service (porta 3003)
- Notifications Service (porta 3004)
- API Gateway (porta 3001)
- Aplicação Web (porta 3000)

4. **Acesse a aplicação**

- Interface Web: http://localhost:3000
- API Gateway: http://localhost:3001
- Documentação da API: http://localhost:3001/api/docs
- Gerenciamento RabbitMQ: http://localhost:15672 (usuário: rabbitmq, senha: rabbitmq)

## 📊 Monitoramento & Verificações de Saúde (Health Check)

Cada serviço expõe um endpoint de health check:

- Auth Service: `http://localhost:3002/health`
- Tasks Service: `http://localhost:3003/health`
- Notifications Service: `http://localhost:3004/health`
- API Gateway: `http://localhost:3001/health`

O Docker Compose está configurado com health check para todos os serviços com políticas de reinicialização automática.

## 🎨 Padrões de Design & Melhores Práticas

### Padrões Arquiteturais

- **Arquitetura de Microsserviços**: Serviços independentes e fracamente acoplados
- **Padrão API Gateway**: Ponto de entrada único para clientes
- **Arquitetura Orientada a Eventos**: Comunicação assíncrona via filas de mensagens
- **Banco de Dados por Serviço**: Cada serviço possui seus próprios dados

### Padrões de Desenvolvimento

- **Padrão Repository**: Abstração de acesso a dados (TypeORM)
- **Padrão DTO**: Validação e transformação de dados
- **Injeção de Dependência**: Gerenciada pelo NestJS
- **Padrão Strategy**: Autenticação JWT via Passport

### Organização de Código

- **Estrutura Modular**: Módulos baseados em funcionalidades no NestJS
- **Monorepo**: Código compartilhado em pacotes
- **Type Safety**: Tipos compartilhados entre serviços
- **Gerenciamento de Configuração**: Configuração baseada em ambiente com validação

## 🔒 Segurança

- **Autenticação JWT**: Autenticação stateless com tokens de acesso/atualização
- **Hash de Senha**: Bcrypt com salt rounds
- **Validação de Entrada**: DTOs com class-validator
- **Configuração CORS**: Acesso controlado por origem
- **Rate Limiting**: (Recomendado para produção)
- **Segredos de Ambiente**: Nunca commitados no controle de versão

## 📈 Considerações de Escalabilidade

- **Escalonamento Horizontal**: Serviços podem ser escalados independentemente
- **Fila de Mensagens**: Desacopla serviços e habilita processamento assíncrono
- **Banco de Dados por Serviço**: Escalonamento e otimização independentes
- **Serviços Stateless**: Sem estado de sessão nos serviços
- **WebSocket Gateway**: Gerenciamento de conexão centralizado

## 📝 Documentação da API

A documentação interativa da API está disponível via Swagger UI:

- http://localhost:3001/api/docs

Todos os endpoints estão documentados com schemas de requisição/resposta, requisitos de autenticação e exemplos de payloads.
