# Basemedical - Features em Desenvolvimento

## Como usar este arquivo

Liste aqui as features que estão **ativamente em desenvolvimento**.
Quando concluir, mova o item para `releases.md` ou archive.

---

## 🔴 Em Andamento

### Sistema de Cortesias (Plano COURTESY)
**Início:** Abril 2026
**Branch:** claude/bold-yonath-fcaa13
**Prioridade:** Alta

**Contexto:**
Novo plano `COURTESY` para conceder acesso gratuito ao nível PROFESSIONAL a parceiros/divulgadores. Admin concede via `/admin/courtesies`. Usuário vê botão flutuante no perfil com status e expiração.

**Progresso:**
- [x] Adicionar `COURTESY` ao enum `Plan` (schema Prisma)
- [x] Criar model `Courtesy` (userId, grantedByAdminId, expiresAt, revokedAt, reason)
- [x] Estender `PLANS` config com COURTESY (espelha PROFESSIONAL: 10 serviços, 10 endereços)
- [x] Helper `isPremiumPlan()` em `src/utils/permissions/`
- [x] Página admin `/admin/courtesies` (concede + revoga + lista)
- [x] `FloatingCourtesyButton` no perfil do usuário
- [x] Modal com info/solicitação
- [ ] Rodar `npx prisma db push` + `prisma generate` (manual do dev)
- [ ] Atualizar hardcoded `=== 'PROFESSIONAL'` (18 pontos) para usar `isPremiumPlan()` — Fase 2
- [ ] Teste E2E: admin concede → usuário vê botão com status ativo

**Arquivos criados:**
- `src/app/(panel)/dashboard/courtesies/_components/floating-courtesy-button.tsx`
- `src/app/(panel)/dashboard/courtesies/_components/courtesy-info-modal.tsx`
- `src/app/(panel)/dashboard/courtesies/_actions/courtesy-actions.ts`
- `src/app/(panel)/dashboard/courtesies/_data_access/get-courtesy.ts`
- `src/app/admin/courtesies/page.tsx`
- `src/app/admin/courtesies/_components/grant-courtesy-form.tsx`
- `src/app/admin/courtesies/_components/courtesies-table.tsx`
- `src/app/admin/courtesies/_actions/grant-courtesy.ts`
- `src/app/admin/courtesies/_data_access/list-courtesies.ts`
- `src/app/api/admin/courtesies/search/route.ts`
- `src/utils/permissions/isPremiumPlan.ts`

**Arquivos modificados (mínimo):**
- `prisma/schema.prisma` (enum Plan + model Courtesy + relation User.courtesy)
- `src/utils/plans/index.ts` (PLANS.COURTESY)
- `src/utils/permissions/get-plans.ts` (PLANS_LIMITS.COURTESY)
- `src/utils/permissions/canPermission.ts` (PLAN_PROP com "COURTESY")
- `src/app/(panel)/dashboard/profile/page.tsx` (renderiza FloatingCourtesyButton)

**Regra de concessão:**
Admin só pode conceder se usuário NÃO tiver Subscription Stripe ativa real (não-placeholder). A concessão cria `Courtesy` + faz upsert de `Subscription` com `plan=COURTESY`, `stripeCustomerId=courtesy_<userId>`, `stripeSubscriptionId=courtesy_<userId>`, `stripeCurrentPeriodEnd=expiresAt`.

---

### Relatórios Dinâmicos
**Início:** Março 2026
**Branch:** develop
**Responsável:** Time de dev

**Contexto:**
Tela de relatórios em `/dashboard/reports/` com dados dinâmicos, filtros e export.

**Progresso:**
- [x] Análise e brainstorming
- [x] Aprovação do layout
- [x] Instalação do Recharts
- [ ] API route `/api/reports` para buscar dados
- [ ] Date pickers para filtro de período
- [ ] Gráficos de agendamentos (Recharts)
- [ ] Cards de resumo (total, receita, cancelamentos)
- [ ] Tabela de dados detalhada
- [ ] Export CSV

**Arquivos relevantes:**
- `src/app/(panel)/dashboard/reports/page.tsx`
- `src/app/api/reports/route.ts` (a criar)
- `src/app/(panel)/dashboard/reports/_components/` (a criar)
- `src/app/(panel)/dashboard/reports/_data_access/` (a criar)

**Dados necessários da API:**
```typescript
// Estrutura esperada
{
  appointments: {
    total: number
    completed: number
    cancelled: number
    pending: number
    byMonth: { month: string, count: number }[]
  }
  revenue: {
    total: number
    byMonth: { month: string, amount: number }[]
  }
  topServices: { name: string, count: number }[]
  period: { from: Date, to: Date }
}
```

---

## ✅ Concluídas Recentemente

### Perfil em Acordion
**Concluído:** Março 2026
**Descrição:** Perfil do usuário refatorado para usar accordion sem valor padrão aberto.
**Arquivo:** `src/app/(panel)/dashboard/profile/`

### Correção Confeti
**Concluído:** Março 2026
**Descrição:** Ajuste no tempo de explosão do confeti (UX de celebração)

---

## ⏸️ Pausadas / Em Espera

*Nenhuma no momento*

---

## Padrão para adicionar nova feature

```markdown
### Nome da Feature
**Início:** [data]
**Branch:** feature/nome-da-feature
**Prioridade:** Alta/Média/Baixa

**Contexto:**
[Descrição do problema que resolve e por que é necessária]

**Progresso:**
- [ ] Item 1
- [ ] Item 2

**Arquivos relevantes:**
- [lista de arquivos]
```

---

*Atualizado em: 2026-03-10*
