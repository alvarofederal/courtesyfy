# Basemedical - Guia para Claude Code

> Este arquivo é carregado automaticamente pelo Claude Code em toda sessão.
> Leia-o completamente antes de fazer qualquer alteração no projeto.

---

## O que é este projeto?

**Basemedical** é um SaaS B2B de agendamento para profissionais de saúde no Brasil.
Stack: Next.js 16 (App Router) + TypeScript + MySQL (Prisma) + Stripe + Vercel.
**Versão atual:** 1.0.2 | **Branch ativo:** develop

---

## Arquivos de Contexto - LEIA ANTES DE CODAR

Consulte estes arquivos para entender o projeto em profundidade:

| Arquivo | Quando ler |
|---------|-----------|
| `context/system.md` | Visão geral, stack, planos, infraestrutura |
| `context/architecture.md` | Estrutura de pastas, padrões, integrações |
| `context/rules.md` | Convenções, checklist, o que nunca fazer |
| `planning/roadmap.md` | O que já foi feito e o que está planejado |
| `planning/backlog.md` | Funcionalidades priorizadas |
| `planning/releases.md` | Histórico de versões |
| `development/features.md` | Features em andamento agora |
| `development/bugs.md` | Bugs conhecidos |
| `development/improvements.md` | Melhorias técnicas planejadas |
| `knowledge/database.md` | Schema, queries comuns, cuidados com banco |
| `knowledge/api.md` | Endpoints, padrões de Server Actions |
| `knowledge/domain.md` | Vocabulário, regras de negócio, fluxos |

---

## Regras Críticas - NUNCA ignore

1. **Não alterar schema Prisma** sem confirmar com o usuário — `db push --accept-data-loss` pode apagar dados em produção
2. **Não mudar sistema de autenticação** (NextAuth) sem discussão
3. **Não mexer em lógica de cobrança/Stripe** sem entender o impacto
4. **Sempre usar** `import { db } from "@/lib/prisma"` para Prisma
5. **Sempre usar** `import { auth } from "@/lib/auth"` para sessão
6. **Sempre validar** inputs com Zod nas Server Actions e API Routes
7. **Sempre verificar permissões** por plano antes de criar recursos

---

## Padrões Obrigatórios

### Server Action
```typescript
"use server"
const session = await auth()
if (!session?.user) return { error: "Não autorizado" }
// valida com Zod → executa → revalidatePath
```

### Componente com dados
```typescript
// Server Component (padrão) → busca dados direto
// Client Component → usa React Query ou Server Action
"use client" // só quando necessário (hooks, eventos, formulários)
```

### Importações
```typescript
import { db } from "@/lib/prisma"       // sempre assim
import { auth } from "@/lib/auth"       // sempre assim
import { cn } from "@/lib/utils"        // para classnames
```

---

## Branch e Workflow

```bash
# Desenvolvimento
git checkout develop
git checkout -b feature/nome-da-feature

# Commit em português
git commit -m "descrição clara do que foi feito"

# Build local
npm run dev  # Turbopack
npm run build  # Verifica antes de enviar
```

---

## O que está sendo desenvolvido AGORA

Ver `development/features.md` para o status atual.

**Resumo rápido (atualizado 2026-04-22):**
- Sistema de Cortesias (plano COURTESY) implementado — admin concede via `/admin/courtesies`
- Relatórios dinâmicos com filtros e export CSV em `/dashboard/reports/` (em andamento)

---

## ⚡ Comando rápido para iniciar contexto

Em uma nova sessão, para carregar todo o contexto do projeto, rode:

```
/iniciar-contexto
```

Esse slash command (`.claude/commands/iniciar-contexto.md`) lê em paralelo todos os `.md` de `context/`, `planning/`, `development/`, `knowledge/` e me retorna um resumo curto do estado atual antes de eu começar a trabalhar.

---

## Como atualizar os arquivos de contexto

Quando houver mudanças significativas, atualize os arquivos relevantes:
- Nova feature concluída → `planning/releases.md` + `development/features.md`
- Bug encontrado → `development/bugs.md`
- Decisão arquitetural → `context/architecture.md`
- Nova regra de negócio → `knowledge/domain.md`
- Novo endpoint → `knowledge/api.md`
- Mudança no banco → `knowledge/database.md`

---

*Criado em: 2026-03-10 | Atualizar quando houver mudanças relevantes*
