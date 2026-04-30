# Basemedical - Conhecimento das APIs

## Arquitetura de API

O Basemedical usa dois padrões de comunicação servidor-cliente:

1. **Server Actions** → para mutações internas (formulários, CRUD)
2. **API Routes** (`/api/*`) → para integrações externas e webhooks

---

## API Routes Disponíveis

### Autenticação
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/[...nextauth]` | GET/POST | Handlers NextAuth (OAuth, signin, signout) |
| `/api/verify-email` | POST | Verificação de email com token |
| `/api/resend-verification` | POST | Reenviar email de verificação |
| `/api/register` | POST | Registro de novo usuário |

### Perfil e Profissionais
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/profile` | GET/PATCH | Perfil do usuário autenticado |
| `/api/profissional/[id]` | GET | Dados públicos de profissional |
| `/api/search` | GET | Busca de profissionais |
| `/api/upload` | POST | Upload de imagem (Cloudinary) |
| `/api/image` | GET | Servir imagem |

### Agenda e Agendamentos
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/schedule` | GET | Listar disponibilidade |
| `/api/schedule/slots` | POST | Criar slots disponíveis |
| `/api/schedule/[id]` | PATCH/DELETE | Editar/remover slot |
| `/api/appointments` | GET/POST | Listar/criar agendamentos |

### Planos e Assinaturas
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/plans` | GET | Listar planos disponíveis |
| `/api/webhook` | POST | Webhook do Stripe (pagamentos) |
| `/api/webhook/whatsapp` | POST | Webhook do Twilio (WhatsApp) |

### Conteúdo e Features
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/reviews` | GET/POST | Reviews de profissional |
| `/api/reviews/[id]` | PATCH/DELETE | Moderar review |
| `/api/landing-page` | GET/PATCH | Customização de landing page |
| `/api/waitlist/add` | POST | Adicionar à waitlist |
| `/api/send` | POST | Envio de email/notificação |

### Administração
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/admin/courtesies/search` | GET | Buscar usuários para conceder cortesia (admin) |
| `/api/users` | GET | Listar usuários (admin) |
| `/api/users/[id]` | GET/PATCH/DELETE | Gerenciar usuário (admin) |
| `/api/professions` | GET/POST | Gerenciar profissões |
| `/api/specialty` | GET/POST | Gerenciar especialidades |
| `/api/type-services` | GET/POST | Gerenciar tipos de serviço |
| `/api/onboarding` | POST | Completar onboarding |
| `/api/reports` | GET | Dados de relatórios *(a criar)* |
| `/api/revalidate` | POST | Revalidar cache Next.js |

---

## Integrações Externas

### Stripe
**Config:** `src/utils/stripe.ts`, `src/utils/stripe-config.ts`
**Webhook:** `/api/webhook`

Eventos tratados no webhook:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Como verificar assinatura:**
```typescript
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
```

**Preços dos planos (configurado no Stripe Dashboard):**
- FREE: gratuito
- PROFESSIONAL: valor mensal (configurado no Stripe)

### Resend (Email)
**Config:** `src/lib/email.ts`
**Templates:** `src/components/emails/`

```typescript
import { sendEmail } from "@/lib/email"

await sendEmail({
  to: "user@example.com",
  subject: "Assunto",
  react: <EmailTemplate ... />
})
```

### Twilio (SMS/WhatsApp)
**Config:** `src/lib/whatsapp.ts`
**Webhook:** `/api/webhook/whatsapp`

```typescript
import { sendWhatsApp } from "@/lib/whatsapp"

await sendWhatsApp({
  to: "+5511999999999",
  message: "Sua consulta é amanhã às 10h"
})
```

### Cloudinary (Upload)
**Uso:** Via API Route `/api/upload`

```typescript
// Client-side: enviar FormData para /api/upload
const formData = new FormData()
formData.append('file', file)
const res = await fetch('/api/upload', { method: 'POST', body: formData })
const { url } = await res.json()
```

---

## Padrão de Response das API Routes

```typescript
// Sucesso
return NextResponse.json({ data: result }, { status: 200 })

// Erro de validação
return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

// Não autenticado
return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

// Não encontrado
return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

// Erro interno
return NextResponse.json({ error: "Erro interno" }, { status: 500 })
```

---

## Autenticação nas API Routes

```typescript
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const userId = session.user.id
  // ...
}
```

---

## Server Actions - Padrão

```typescript
"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const Schema = z.object({ ... })

export async function action(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Não autorizado" }

  const parsed = Schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten() }

  await db.model.create({ data: { ...parsed.data, userId: session.user.id } })
  revalidatePath("/dashboard/feature")

  return { success: true }
}
```

---

*Atualizado em: 2026-03-10*
