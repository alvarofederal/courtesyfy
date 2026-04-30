# Basemedical - System Context

## O que é o Basemedical?

Basemedical é uma plataforma SaaS B2B para profissionais de saúde (médicos, dentistas, fisioterapeutas, etc.) gerenciarem seus agendamentos, disponibilidade, avaliações e presença online.

**Modelo de negócio:** Assinatura mensal (FREE e PROFESSIONAL via Stripe)
**Público-alvo:** Profissionais de saúde autônomos no Brasil
**Status:** Produto em produção, em evolução contínua
**Versão atual:** 1.0.2

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16.0.7 (App Router) |
| Linguagem | TypeScript 5+ (strict mode) |
| Runtime | React 19.1.0 |
| Banco de Dados | MySQL (Prisma ORM 5.17.0) |
| Autenticação | NextAuth.js 5.0.0-beta.30 |
| Pagamentos | Stripe 19.2.1 |
| Email | Resend 6.5.2 |
| SMS/WhatsApp | Twilio 5.10.6 |
| Upload de Imagens | Cloudinary 2.8.0 |
| UI Base | Shadcn/UI + Radix UI |
| Styling | Tailwind CSS 4 |
| Formulários | React Hook Form 7 + Zod 3 |
| Estado Servidor | TanStack React Query 5 |
| Gráficos | Recharts 3.3.0 |
| Build | Turbopack |
| Deploy | Vercel |
| Package Manager | npm |

---

## Planos e Funcionalidades

### FREE
- Perfil básico
- Número limitado de serviços e endereços
- Agendamentos básicos
- Acesso à waitlist

### PROFESSIONAL
- Perfil completo
- Serviços ilimitados
- Múltiplos endereços
- Relatórios avançados
- Customização da landing page
- Notificações

---

## Fluxo Principal do Usuário

1. **Registro** → Verificação de email → Onboarding (seleção de perfil)
2. **Onboarding** → Completar perfil (profissão, especialidade, serviços)
3. **Dashboard** → Gerenciar agenda, serviços, perfil
4. **Paciente** → Busca profissional → Agenda consulta → Confirmação/Cancelamento

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
```

---

## Infraestrutura de Deploy

- **Plataforma:** Vercel
- **Build:** `npm run build:double` (build duplo para estabilidade)
- **Funções:** Timeout máximo de 30s
- **Banco:** MySQL (externo, acessado via Prisma)
- **Imagens:** Cloudinary CDN

---

## Comandos Principais

```bash
npm run dev          # Desenvolvimento com Turbopack
npm run build        # Build completo (version bump + prisma + next build)
npm run db:seed      # Popular banco com dados iniciais
npm run stripe:listen # Escutar webhooks Stripe localmente
```

---

*Atualizado em: 2026-03-10*
