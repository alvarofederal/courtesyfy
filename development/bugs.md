# Courtesyfy - Bugs e Issues

## Como usar este arquivo

Registre bugs conhecidos aqui com contexto suficiente para reproduced e corrigido.
Formato de severidade: 🔴 Crítico (quebra funcionalidade) | 🟠 Alto (impacta UX) | 🟡 Médio | 🟢 Baixo

---

## Bugs Ativos

*Registre bugs aqui quando identificados*

### Template para registro de bug:

```markdown
### [ID] Nome do Bug
**Severidade:** 🔴/🟠/🟡/🟢
**Status:** Identificado / Em análise / Em correção / Aguardando validação
**Data:** [data de identificação]

**Descrição:**
[O que está acontecendo de errado]

**Como reproduzir:**
1. Passo 1
2. Passo 2
3. Resultado observado
4. Resultado esperado

**Ambiente:**
- Browser/device onde ocorre
- Dados necessários para reproduzir

**Arquivos suspeitos:**
- [caminhos dos arquivos]

**Possível causa:**
[Hipótese sobre a causa]
```

---

## Bugs Resolvidos

### Confeti - Tempo de explosão
**Severidade:** 🟢
**Resolvido em:** v1.0.2 (Março 2026)
**Descrição:** O confeti estava disparando no tempo errado após ação de sucesso.
**Correção:** Ajuste no timeout/delay da animação.

---

## Issues de Performance Conhecidas

- Potencial N+1 em queries de listagem (não crítico ainda, monitorar com crescimento)
- Falta de cache nas páginas públicas de profissionais (ISR ainda não configurado)

---

## Issues de UX Conhecidas

- Mobile: algumas telas do dashboard não estão totalmente otimizadas para mobile
- Formulários longos sem auto-save (dados perdidos se página fechar acidentalmente)

---

*Atualizado em: 2026-03-10*
