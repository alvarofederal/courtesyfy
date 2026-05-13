# Courtesyfy — Bugs e Issues

## Como usar este arquivo

Registre bugs conhecidos aqui com contexto suficiente para reproduzir e corrigir.
Severidade: 🔴 Crítico (quebra funcionalidade) | 🟠 Alto (impacta UX) | 🟡 Médio | 🟢 Baixo

---

## Bugs Ativos

*Nenhum bug crítico registrado no momento.*

---

## Issues de Performance Conhecidas

- Potencial N+1 em queries de listagem de chaves (monitorar com crescimento)
- Falta de cache (ISR) nas páginas públicas `/c/[codigo]`

---

## Issues de UX Conhecidas

- Mobile: algumas telas do dashboard ainda não estão totalmente otimizadas
- Formulários longos sem auto-save (dados perdidos se página fechar)

---

## Template para registrar novo bug

```markdown
### [ID] Nome do Bug
**Severidade:** 🔴/🟠/🟡/🟢
**Status:** Identificado / Em análise / Em correção / Aguardando validação
**Data:** [data]

**Descrição:**
[O que está acontecendo de errado]

**Como reproduzir:**
1. Passo 1
2. Resultado observado vs esperado

**Arquivos suspeitos:**
- [caminhos]
```

---

## Bugs Resolvidos

### Role SUPER_ADMIN na tela de produtos Stripe
**Severidade:** 🔴
**Resolvido em:** Maio 2026
**Descrição:** Página `/dashboard/admin/stripe/produtos` usava `"ADMIN"` para verificar permissão,
causando redirect para `/dashboard` (lista de lojas) para o super admin.
**Correção:** Trocado para `"SUPER_ADMIN"` em `page.tsx` e `_actions.ts`.

---

*Atualizado em: 2026-05-13*
