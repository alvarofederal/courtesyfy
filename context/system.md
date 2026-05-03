# Courtesyfy — Visão Geral do Sistema

## O que é o Courtesyfy?

**Courtesyfy** é um SaaS B2B para gestão de campanhas promocionais com chaves únicas (cortesias).
Permite que lojistas criem campanhas, gerem lotes de chaves únicas com QR Code, distribuam para
clientes (físico ou digital) e validem resgates de forma segura e rastreável.

**Modelo de negócio:** Assinatura mensal por plano (Essencial / Profissional / Empresarial via Stripe)
**Público-alvo:** Lojistas, marcas e empresas que fazem promoções físicas ou digitais no Brasil
**Status:** MVP em desenvolvimento
**Versão atual:** 1.0.0-mvp

---

## Conceito Central

O sistema gira em torno do ciclo de vida de uma **chave única**:

```
GERADA → CONSULTADA → ATIVADA → RESGATADA  (estado final, imutável)
           ↘ EXPIRADA  (automático quando a data da campanha passa)
           ↘ CANCELADA (manual pelo lojista)
```

**Fluxo resumido:**
1. Lojista cria campanha → gera lote de chaves com QR Code → distribui (física ou digitalmente)
2. Cliente recebe chave → escaneia QR ou acessa URL → ativa com telefone/e-mail
3. Operador valida a chave no balcão → registra resgate → benefício entregue

---

## Atores do Sistema

| Ator | O que faz |
|------|-----------|
| **Lojista (Admin da Loja)** | Cria campanhas, gera chaves, exporta para impressão, vê métricas |
| **Operador** | Valida chaves no balcão, registra resgates |
| **Cliente (Portador)** | Consulta benefício via landing pública, ativa chave com tel/email |
| **Super Admin** | Gerencia lojas cadastradas, planos, monitora logs globais |

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript 5+ (strict mode) |
| Runtime | React 19 |
| Banco de Dados | MySQL + Prisma ORM 5 |
| Autenticação | NextAuth.js 5 (OAuth Google/GitHub + Credentials) |
| Pagamentos | Stripe (assinaturas de plano) |
| Email | Resend |
| WhatsApp | Twilio |
| Upload | Cloudinary |
| QR Code | qrcode (lib) |
| UI Base | Shadcn/UI + Radix UI |
| Styling | Tailwind CSS 4 |
| Formulários | React Hook Form 7 + Zod 3 |
| Estado | TanStack React Query 5 |
| Gráficos | Recharts |
| Build | Turbopack |
| Deploy | Vercel |

---

## Planos da Plataforma

| Plano | Descrição |
|-------|-----------|
| **ESSENCIAL** | Campanhas básicas, limite de chaves por mês |
| **PROFISSIONAL** | Campanhas ilimitadas, landing page personalizada, exportação |
| **EMPRESARIAL** | Multi-unidade, white-label, API de integração externa |

---

## Tipos de Benefício em Campanhas

- `DESCONTO_PERCENTUAL` — ex: 15% de desconto
- `DESCONTO_FIXO` — ex: R$ 30 de desconto
- `BRINDE` — produto/item gratuito
- `SORTEIO` — participação em sorteio
- `FRETE_GRATIS` — frete isento
- `CASHBACK` — devolução de valor

---

## URLs Públicas Importantes

| Rota | Finalidade |
|------|-----------|
| `/c/[codigo]` | Landing page da chave (consulta pública pelo cliente) |
| `/c/[codigo]/ativar` | Ativação da chave (coleta tel/email do cliente) |
| `/api/chaves/validar` | API externa para validação via QR (PDV, app) |
| `/api/cron/expirar-chaves` | Job automático de expiração (Vercel Cron ou similar) |
| `/api/webhook` | Stripe webhook (sincroniza assinaturas) |
| `/api/upload` | Cloudinary upload (logos) |

---

## Variáveis de Ambiente Necessárias

```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
GITHUB_ID / GITHUB_SECRET
STRIPE_SECRET_KEY / STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN
CLOUDINARY_URL
JWT_SECRET
CRON_SECRET                   ← protege o endpoint de expiração automática
```

---

## Comandos Principais

```bash
npm run dev           # Desenvolvimento com Turbopack
npm run build         # Build completo
npm run db:push       # Aplicar schema ao banco (dev)
npm run db:seed       # Popular banco com dados iniciais
npm run stripe:listen # Escutar webhooks Stripe localmente
```

---

*Criado em: 2026-05-02 | Baseado na especificação técnica do sistema de cortesias*
