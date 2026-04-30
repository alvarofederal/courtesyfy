# Basemedical - Regras e Convenções de Desenvolvimento

## Regras Fundamentais

### NUNCA fazer sem pedir:
- Alterar schema do banco de dados sem discussão prévia
- Mudar o sistema de autenticação
- Alterar lógica de cobrança/Stripe
- Renomear modelos Prisma existentes
- Remover campos de modelos existentes (pode quebrar dados em produção)

### SEMPRE fazer:
- Usar TypeScript strict (sem `any` desnecessário)
- Validar inputs do usuário com Zod
- Usar Server Actions para mutações internas
- Usar `src/lib/prisma.ts` (singleton) — nunca instanciar Prisma diretamente
- Verificar permissões por plano antes de criar recursos (`src/utils/permissions/`)
- Usar `date-fns` para manipulação de datas

---

## Convenções de Código

### Nomenclatura
- Componentes React: PascalCase (`UserProfileCard.tsx`)
- Funções/variáveis: camelCase (`getUserProfile`)
- Constantes: UPPER_SNAKE_CASE (`MAX_SERVICES_FREE`)
- Tipos/Interfaces: PascalCase (`UserProfile`)
- Arquivos de componentes: kebab-case (`user-profile-card.tsx`)
- Server Actions: verbos descritivos (`createAppointment`, `updateProfile`)

### Estrutura de Componentes
```
feature/
├── page.tsx              # Página (Server Component por padrão)
├── _components/          # Componentes desta feature
│   ├── feature-form.tsx  # Formulário client-side
│   └── feature-list.tsx  # Lista server-side
├── _actions/             # Server Actions
│   └── index.ts
└── _data_access/         # Queries Prisma
    └── index.ts
```

### Server vs Client Components
- Páginas são Server Components por padrão
- Componentes com estado, eventos, hooks → `"use client"`
- Formulários com React Hook Form → sempre `"use client"`
- Busca de dados → preferencialmente no Server Component (sem React Query)
- Mutações → Server Actions ou API Routes

### Importações
- Alias `@/` para `src/` sempre (nunca `../../`)
- Importar Prisma: `import { db } from "@/lib/prisma"`
- Importar Auth: `import { auth } from "@/lib/auth"`

---

## Padrão de Server Actions

```typescript
"use server"

import { z } from "zod"
import { db } from "@/lib/prisma"
import { auth } from "@/lib/auth"

const schema = z.object({ ... })

export async function actionName(data: FormData) {
  const session = await auth()
  if (!session) return { error: "Não autorizado" }

  const validated = schema.safeParse(Object.fromEntries(data))
  if (!validated.success) return { error: "Dados inválidos" }

  try {
    // lógica
    return { success: true }
  } catch (error) {
    return { error: "Erro interno" }
  }
}
```

---

## Padrão de Data Access Layer

```typescript
// _data_access/index.ts
import { db } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function getFeatureData(userId: string) {
  return db.model.findMany({
    where: { userId },
    select: { ... }  // sempre usar select, nunca buscar tudo
  })
}
```

---

## UI e Componentes

### Usar Shadcn/UI existente
Componentes disponíveis em `src/components/ui/`:
accordion, alert-dialog, badge, button, card, checkbox, collapsible, dialog, dropdown-menu, form, input, label, pagination, radio-group, scroll-area, select, sheet, switch, table, tabs, textarea, tooltip

### Adicionar novos componentes Shadcn:
```bash
npx shadcn@latest add [component-name]
```

### Toast Notifications
Usar `sonner` para toasts:
```typescript
import { toast } from "sonner"
toast.success("Salvo com sucesso!")
toast.error("Ocorreu um erro")
```

---

## Git Workflow

Seguir Git Flow:
- `main` → produção
- `develop` → desenvolvimento ativo
- `feature/nome-da-feature` → novas funcionalidades
- `hotfix/descricao` → correções urgentes
- `release/x.x.x` → preparação de release

**Commits em português** com descrição clara do que foi feito.

---

## Checklist antes de commitar

- [ ] Sem erros de TypeScript (`tsc --noEmit`)
- [ ] Sem console.log desnecessários
- [ ] Inputs validados com Zod
- [ ] Permissões verificadas nas actions
- [ ] Sem dados hardcoded que deveriam vir do banco
- [ ] Componentes que usam hooks têm `"use client"`

---

*Atualizado em: 2026-03-10*
