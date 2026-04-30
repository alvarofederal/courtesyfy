# Basemedical - Melhorias Técnicas

## O que é este arquivo?

Diferente de features (novas funcionalidades) e bugs (correções), este arquivo lista melhorias técnicas — refactorings, otimizações de performance, segurança, DX (developer experience) e qualidade de código.

---

## Melhorias Prioritárias

### 🟠 Cache de Páginas Públicas (ISR)
**Tipo:** Performance
**Descrição:** As páginas `/profissional/[id]` são públicas e poderiam se beneficiar de cache estático com revalidação.
**Benefício:** Redução de carga no banco e latência para pacientes que buscam profissionais.
**Como implementar:**
```typescript
// page.tsx
export const revalidate = 300 // 5 minutos
```

### 🟠 Rate Limiting por Endpoint
**Tipo:** Segurança
**Descrição:** Endpoints críticos (login, register, send-email) precisam de rate limiting mais robusto.
**Arquivo atual:** `src/lib/rate-limit.ts`
**Melhorar:** Aplicar em todos os endpoints públicos de mutação.

### 🟡 Queries Prisma com `select` explícito
**Tipo:** Performance
**Descrição:** Algumas queries buscam o objeto inteiro quando só precisam de alguns campos.
**Benefício:** Menos dados trafegados, queries mais rápidas.
**Padrão:** Sempre usar `select: { campo1: true, campo2: true }` nas queries.

### 🟡 Tratamento de Erros Padronizado
**Tipo:** DX / Qualidade
**Descrição:** Criar um padrão único de tratamento e retorno de erros nas Server Actions.
**Proposta:**
```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }
```

### 🟡 Variáveis de Ambiente com Validação
**Tipo:** Segurança / DX
**Descrição:** Validar todas as variáveis de ambiente no startup usando Zod.
**Benefício:** Falha rápida e mensagem clara se falta uma env var.
**Referência:** Padrão T3 Stack (`env.mjs`)

---

## Melhorias de Developer Experience

### Testes Automatizados
**Tipo:** DX / Qualidade
**Prioridade:** 🟡 Médio
**Situação atual:** Sem testes
**Sugestão inicial:**
- Testes unitários para utils/permissions (crítico para billing)
- Testes E2E básicos para fluxo de agendamento (Playwright)

### Documentação de API
**Tipo:** DX
**Prioridade:** 🟢 Baixo
**Descrição:** Documentar os endpoints da API pública para futura abertura.

---

## Melhorias de Segurança

| Item | Prioridade | Status |
|------|-----------|--------|
| 2FA (TOTP) | 🟠 Alta | Backlog |
| LGPD - Export/Delete de dados | 🟡 Média | Backlog |
| Headers de segurança (CSP) | 🟡 Média | Não iniciado |
| Audit log de ações admin | 🟢 Baixa | Backlog |
| Sanitização de inputs no cliente | 🟠 Alta | Parcialmente feito (Zod) |

---

## Refactorings Identificados

| Área | Descrição | Esforço |
|------|-----------|---------|
| `_data_access/` | Algumas features não têm DAL separado | Médio |
| Forms | Padronizar uso de Server Actions vs API Routes | Médio |
| Types | Consolidar tipos duplicados em `type/` | Pequeno |

---

*Atualizado em: 2026-03-10*
