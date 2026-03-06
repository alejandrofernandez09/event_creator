# EaaS  Event-as-a-Service (POC)

Plataforma que transforma eventos sociais (aniversários, casamentos, formaturas) em hubs digitais de alta conversão, unindo site premium gerado por IA com fintech de nicho via Pix.

## Stack

- **Frontend**: Next.js 15 (App Router + PPR) + Tailwind CSS
- **Backend**: Serverless Functions (Node.js TypeScript)
- **Banco de dados**: PostgreSQL (Drizzle ORM)
- **Pagamentos**: Asaas API  Pix dinâmico + Webhook
- **IA / Temas**: OpenAI  `theme_json`  CSS custom properties
- **E-mail**: Resend

## Pré-requisitos

- Node.js 20+
- PostgreSQL acessível (RDS, Docker ou local)

## Configuração

Copie o arquivo de exemplo e preencha as variáveis:

```bash
cp .env.example .env.local
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL |
| `ASAAS_API_KEY` | Chave da API Asaas (sandbox ou produção) |
| `ASAAS_WEBHOOK_SECRET` | Token de validação do webhook Asaas |
| `ASAAS_ENV` | `sandbox` ou `production` |
| `OPENAI_API_KEY` | Chave OpenAI para geração de temas |
| `RESEND_API_KEY` | Chave Resend para envio de e-mails |
| `EMAIL_FROM` | Endereço remetente dos e-mails |
| `NEXT_PUBLIC_BASE_URL` | URL base pública da aplicação |
| `DASHBOARD_SECRET` | Token de acesso ao dashboard |
| `ENABLE_PAYMENTS` | `true` para habilitar pagamentos via Asaas |

## Rodando localmente

```bash
npm install
npm run db:push   # aplica o schema no banco
npm run dev       # inicia em http://localhost:3000
```

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Inicia build de produção |
| `npm run db:push` | Aplica schema no banco sem migrations |
| `npm run db:migrate` | Executa migrations geradas |
| `npm run db:generate` | Gera arquivos de migration |
| `npm run db:studio` | Abre Drizzle Studio (UI do banco) |

## Rotas principais

| Rota | Descrição |
|---|---|
| `/` | Landing page da plataforma |
| `/criar` | Criar novo evento |
| `/[slug]` | Site público do evento |
| `/dashboard/[slug]` | Dashboard do aniversariante |
| `/api/events` | CRUD de eventos |
| `/api/products` | CRUD de produtos/presentes |
| `/api/checkout` | Gerar cobrança Pix |
| `/api/rsvp` | Confirmação de presença |
| `/api/generate-theme` | Geração de tema via IA |
| `/api/webhook/asaas` | Webhook de confirmação de pagamento |

## Modelo de negócio

Comissão de **10%** sobre o total transacionado confirmado por evento. O dashboard exibe `Total arrecadado` e `Comissão devida`.

> **Invariante crítica:** `orders.status` é atualizado **apenas** pelo webhook Asaas  nunca pelo frontend ou fluxo síncrono.
