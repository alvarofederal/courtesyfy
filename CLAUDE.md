# Courtesyfy — Guia para Claude Code

> Este arquivo é carregado automaticamente pelo Claude Code em toda sessão.
> Leia-o completamente antes de fazer qualquer alteração no projeto.

---

## O que é este projeto?

**Courtesyfy** é um SaaS B2B para gestão de campanhas promocionais com chaves únicas (cortesias).
Lojistas criam campanhas, geram chaves com QR Code, distribuem para clientes e validam resgates.
Stack: Next.js 15 (App Router) + TypeScript + MySQL (Prisma) + Stripe + Vercel.
**Versão atual:** 1.0.0-mvp | **Branch ativo:** develop

---

## Arquivos de Contexto - LEIA ANTES DE CODAR

Consulte estes arquivos para entender o projeto em profundidade:

| Arquivo | Quando ler |
|---------|-----------|
| `context/system.md` | Visão geral, atores, stack, planos, integrações |
| `context/architecture.md` | Estrutura de pastas, padrões de código |
| `context/rules.md` | Convenções, checklist, o que nunca fazer |
| `planning/roadmap.md` | MVP, P0, P1, P2 — o que foi feito e o que está planejado |
| `planning/backlog.md` | Funcionalidades priorizadas |
| `planning/releases.md` | Histórico de versões |
| `development/features.md` | Features em andamento agora |
| `development/bugs.md` | Bugs conhecidos |
| `development/improvements.md` | Melhorias técnicas planejadas |
| `knowledge/database.md` | Schema Prisma completo, enums, queries comuns |
| `knowledge/api.md` | Endpoints, padrões de Server Actions |
| `knowledge/domain.md` | Vocabulário, regras de negócio, fluxos, estados da chave |

---

## Regras Críticas - NUNCA ignore

1. **Não alterar schema Prisma** sem confirmar com o usuário — `db push --accept-data-loss` pode apagar dados
2. **Não mudar sistema de autenticação** (NextAuth) sem discussão
3. **Não mexer em lógica de cobrança/Stripe** sem entender o impacto
4. **Sempre usar** `import { db } from "@/lib/prisma"` para Prisma
5. **Sempre usar** `import { auth } from "@/lib/auth"` para sessão
6. **Sempre validar** inputs com Zod nas Server Actions e API Routes
7. **Sempre verificar permissões** por plano da loja antes de criar recursos
8. **Chave resgatada é imutável** — nunca alterar status de RESGATADA para outro
9. **Código da chave é único global** — sempre verificar duplicata antes de persistir

---

## Padrões Obrigatórios

### Server Action
```typescript
"use server"
const session = await auth()
if (!session?.user) return { error: "Não autorizado" }
// valida com Zod → verifica permissão de plano → executa → revalidatePath
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

**Resumo rápido (atualizado 2026-05-12):**
- MVP do sistema de cortesias concluído e em produção
- Próximas prioridades: Stripe/cobrança e API pública de validação
- Ver `development/features.md` e `planning/backlog.md` para detalhes

---

## ⚡ Comando rápido para iniciar contexto

Em uma nova sessão, para carregar todo o contexto do projeto, rode:

```
/iniciar-contexto
```

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

*Criado em: 2026-05-02 | Migrado de Basemedical para Courtesyfy*
