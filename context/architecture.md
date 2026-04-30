# Basemedical - Arquitetura Técnica

## Visão Geral da Arquitetura

O Basemedical segue a arquitetura do Next.js App Router com separação clara entre camadas.

```
Cliente (Browser)
    ↓
Next.js App Router (React Server Components + Client Components)
    ↓
Server Actions / API Routes
    ↓
Data Access Layer (_data_access/)
    ↓
Prisma ORM
    ↓
MySQL Database
```

---

## Estrutura de Diretórios - Padrão Adotado

```
src/
├── app/
│   ├── (panel)/              # Rotas protegidas (requer autenticação)
│   │   └── dashboard/
│   │       ├── _actions/     # Server Actions desta feature
│   │       ├── _components/  # Componentes desta feature
│   │       ├── _data_access/ # Queries de banco desta feature
│   │       └── [feature]/    # Cada sub-feature tem sua pasta
│   │
│   ├── (public)/             # Rotas públicas
│   │   └── profissional/[id] # Perfil público do profissional
│   │
│   ├── admin/                # Painel administrativo
│   ├── api/                  # API Routes (integrações externas)
│   └── auth/                 # Fluxo de autenticação OAuth
│
├── components/
│   ├── ui/                   # Componentes Shadcn/UI (28 componentes)
│   └── [shared]/             # Componentes reutilizáveis globais
│
├── lib/                      # Configurações e instâncias singleton
│   ├── auth.ts               # Config NextAuth
│   ├── prisma.ts             # Singleton Prisma Client
│   ├── email.ts              # Config Resend
│   ├── jwt.ts                # Funções JWT
│   ├── rate-limit.ts         # Rate limiting
│   └── whatsapp.ts           # Config Twilio
│
├── utils/                    # Lógica de negócio reutilizável
│   ├── permissions/          # Sistema de permissões por plano
│   ├── plans/                # Definições dos planos
│   └── stripe-*.ts           # Integração Stripe
│
└── providers/
    └── queryclient.tsx       # React Query Provider
```

---

## Padrões Arquiteturais

### 1. Data Access Layer (DAL)
Cada feature tem sua própria pasta `_data_access/` com queries Prisma encapsuladas. Isso mantém a separação entre lógica de busca e lógica de apresentação.

### 2. Server Actions
Mutações são feitas via Server Actions (`_actions/`) ao invés de API routes sempre que possível. API Routes são usadas apenas para integrações externas (Stripe webhook, etc.).

### 3. Route Groups
- `(panel)` → rotas protegidas que precisam de sessão
- `(public)` → rotas públicas de acesso a perfis de profissionais

### 4. Autenticação
- NextAuth.js 5 beta com Prisma Adapter
- Provedores: Google, GitHub, Credentials (email/senha)
- Middleware protege rotas via cookie check (sem Prisma no middleware)
- JWT para tokens customizados (verificação de email, reset de senha)

### 5. Sistema de Permissões
Em `src/utils/permissions/`:
- Verifica plano ativo do usuário
- Limita funcionalidades por plano (FREE vs PROFESSIONAL)
- Controla número de serviços, endereços, etc.

### 6. Pagamentos (Stripe)
- Webhook em `/api/webhook` sincroniza status de assinatura
- Subscription model no banco reflete estado do Stripe
- Planos: FREE (padrão) e PROFESSIONAL

---

## Banco de Dados - Grupos de Modelos

### Autenticação
`AuthToken`, `RefreshToken`, `LoginAttempt`, `Account`, `Session`, `Authenticator`

### Usuário e Perfil
`User`, `UserTypeService`, `UserTime`, `UserAddress`, `Profession`, `Specialty`, `Specialist`, `SpecialistLocation`, `SpecialistAttendance`

### Agendamento
`Appointment`, `AvailableSlot`, `AvailableSlotTime`, `TypeService`

### Negócio
`Subscription`, `Review`, `ReviewLike`, `Waitlist`, `Refund`, `Notification`

### Conteúdo
`LandingPage`, `Reminder`

---

## Integrações Externas

| Serviço | Uso | Arquivo de Config |
|---------|-----|-------------------|
| Stripe | Assinaturas e pagamentos | `src/utils/stripe*.ts` |
| Resend | Emails transacionais | `src/lib/email.ts` |
| Twilio | SMS e WhatsApp | `src/lib/whatsapp.ts` |
| Cloudinary | Upload e CDN de imagens | via API Route `/api/upload` |
| NextAuth | OAuth e sessões | `src/lib/auth.ts` |

---

## Configurações de Build

```typescript
// next.config.ts
- output: 'standalone'         // Para containers
- turbopack: enabled           // Build mais rápido em dev
- images: Cloudinary + GitHub + Google
- sourceMap: dev only
```

---

## Middleware

`middleware.ts` protege rotas sem consultar banco:
- Verifica cookie de sessão
- Lista de rotas públicas hardcoded
- Redireciona não-autenticados para `/login`

---

*Atualizado em: 2026-03-10*
