# Courtesyfy — Visão Geral do Sistema

## O que é o Courtesyfy?

**Courtesyfy** é um SaaS B2B para gestão de campanhas promocionais com chaves únicas (cortesias).
Permite que lojistas criem campanhas, gerem lotes de chaves únicas com QR Code, distribuam para
clientes (físico ou digital) e validem resgates de forma segura e rastreável.

**Modelo de negócio:** Assinatura mensal por plano (Essencial / Profissional / Empresarial via Stripe)
+ venda avulsa de kits de impressão física (Offset, Chaveiro MDF, Quadrado MDF)
**Público-alvo:** Lojistas, marcas e empresas que fazem promoções físicas ou digitais no Brasil
**Status:** MVP em produção (Vercel)
**Versão atual:** 1.0.0-mvp

---

## Conceito Central

O sistema gira em torno do ciclo de vida de uma **chave única**:

```
GERADA → CONSULTADA → ATIVADA → RESGATADA  (estado final, imutável)
           ↘ EXPIRADA  (automático quando a campanha encerra)
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
| **Super Admin** | Gerencia lojas cadastradas, planos, monitora Stripe e logs globais |

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript 5+ (strict mode) |
| Runtime | React 19 |
| Banco de Dados | MySQL + Prisma ORM 5 |
| Autenticação | NextAuth.js 5 (OAuth Google + Credentials) |
| Pagamentos | Stripe (assinaturas + pagamentos únicos de produtos físicos) |
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
| Deploy | Vercel (branch main → produção automática) |

---

## Planos de Assinatura

| Plano | Preço | Stripe Price ID |
|-------|-------|----------------|
| **ESSENCIAL** | Grátis | — |
| **PROFISSIONAL** | R$ 99/mês | `STRIPE_PLAN_PROFESSIONAL` |
| **EMPRESARIAL** | R$ 199/mês | `STRIPE_PLAN_EMPRESARIAL` |

## Produtos Físicos (Kits de Impressão)

| Produto | Variantes | Env vars |
|---------|-----------|---------|
| Papel Offset 240g | Kit 50 / Kit 100 | `STRIPE_PRICE_IMPRESSAO_KIT50/100` |
| MDF Chaveiro 7×3,5cm | Kit 10 / Kit 100 | `STRIPE_PRICE_CHAVEIRO_KIT10/100` |
| MDF Quadrado 9×9cm | Kit 10 / Kit 50 | `STRIPE_PRICE_MDF_QUADRADO_KIT10/50` |

---

## Tipos de Benefício em Campanhas

- `DESCONTO_PERCENTUAL` — ex: 15% de desconto
- `DESCONTO_FIXO` — ex: R$ 30,00 de desconto
- `BRINDE` — produto/item gratuito
- `SORTEIO` — participação em sorteio
- `FRETE_GRATIS` — frete isento
- `CASHBACK` — devolução de valor

---

## URLs Públicas Importantes

| Rota | Finalidade |
|------|-----------|
| `/` | Landing page (planos + kits de impressão) |
| `/c/[codigo]` | Landing page da chave (consulta pública pelo cliente) |
| `/c/[codigo]/ativar` | Ativação da chave (coleta tel/email do cliente) |
| `/resgatar` | Scanner / digitação de código pelo cliente |
| `/api/checkout-produto` | Checkout público de kits físicos (allowlist de price IDs) |
| `/api/chaves/validar` | API externa para validação via QR (PDV, app) — a implementar |
| `/api/cron/expirar-chaves` | Job automático de expiração — a implementar |
| `/api/webhook` | Stripe webhook (sincroniza assinaturas) |
| `/api/upload` | Cloudinary upload (logos) |

---

## Variáveis de Ambiente Necessárias

```
# Banco
DATABASE_URL

# Auth
AUTH_SECRET
AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
NEXTAUTH_URL / NEXTAUTH_SECRET

# Stripe (conta acct_1TWPs2ADOPgqdFsc)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY
STRIPE_SECRET_KEY
STRIPE_SECRET_WEBHOOK_KEY
STRIPE_PLAN_PROFESSIONAL
STRIPE_PLAN_EMPRESARIAL
STRIPE_PRICE_IMPRESSAO_KIT50 / KIT100
STRIPE_PRICE_CHAVEIRO_KIT10 / KIT100
STRIPE_PRICE_MDF_QUADRADO_KIT10 / KIT50

# Serviços
RESEND_API_KEY
CLOUDINARY_NAME / CLOUDINARY_KEY / CLOUDINARY_SECRET
TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_NUMBER

# JWT
JWT_SECRET / JWT_REFRESH_SECRET

# (futuro) Cron
CRON_SECRET  ← protegerá o endpoint de expiração automática
```

---

## Comandos Principais

```bash
npm run dev           # Desenvolvimento com Turbopack
npm run build         # Build completo
npm run db:push       # Aplicar schema ao banco (dev)
npm run db:seed       # Popular banco com dados iniciais

# Webhook Stripe local
stripe listen --api-key sk_test_... --forward-to localhost:3000/api/webhook
```

---

*Criado em: 2026-05-02 | Atualizado em: 2026-05-13*
