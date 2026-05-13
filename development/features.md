# Courtesyfy — Features em Desenvolvimento

## Como usar este arquivo

Liste aqui as features que estão **ativamente em desenvolvimento**.
Quando concluir, mova o item para `releases.md`.

---

## 🔴 Em Andamento

### API pública `/api/chaves/validar`
**Início:** —
**Prioridade:** Alta

**Contexto:**
Endpoint REST para lojistas que têm totem ou PDV próprio integrarem a validação de chaves
sem usar o dashboard do Courtesyfy.

**Progresso:**
- [ ] `POST /api/chaves/validar` — recebe código, retorna status + benefício
- [ ] Autenticação via API Key da loja
- [ ] Rate limiting por loja
- [ ] Documentação básica do endpoint

---

### Expiração automática de chaves (cron)
**Início:** —
**Prioridade:** Alta

**Contexto:**
Chaves de campanhas encerradas devem mudar automaticamente para status EXPIRADA.
Hoje depende de ação manual ou trigger no acesso.

**Progresso:**
- [ ] `GET /api/cron/expirar-chaves` — atualiza chaves GERADA/ATIVADA de campanhas vencidas
- [ ] Proteger endpoint com `CRON_SECRET` no header
- [ ] Configurar Vercel Cron Job (diário, madrugada)

---

## ✅ Concluídas Recentemente

### Gerenciamento de produtos Stripe no dashboard
**Concluído:** Maio 2026
**Descrição:** Tela `/dashboard/admin/stripe/produtos` permite editar nome/descrição de produtos,
editar nickname de preços, arquivar preço/produto e criar novos — tudo via Stripe API sem sair do Courtesyfy.
**Arquivos:** `src/app/(panel)/dashboard/admin/stripe/produtos/`

### Tela de Clientes
**Concluído:** Maio 2026
**Descrição:** Lista de clientes com busca por nome/email/telefone e detalhe por cliente
com histórico completo de chaves, stats e campanhas participadas.
**Arquivos:** `src/app/(panel)/dashboard/clientes/`

### Produtos físicos (kits de impressão) + landing page CTAs
**Concluído:** Maio 2026
**Descrição:** 3 linhas de produtos físicos (Offset, Chaveiro, Quadrado) com 6 price IDs no Stripe.
Checkout público via `/api/checkout-produto` com allowlist. Landing page com preços e botões de compra.
**Arquivos:** `src/app/api/checkout-produto/route.ts`, `src/app/page.tsx`

### Admin Stripe expandido
**Concluído:** Maio 2026
**Descrição:** Painel Stripe com MRR calculado por plano, renovações nos próximos 7 dias,
lojas suspensas, lista completa de assinantes (até 100) e histórico de eventos.
**Arquivos:** `src/app/(panel)/dashboard/admin/stripe/page.tsx`

### Stripe — nova conta Courtesyfy
**Concluído:** Maio 2026
**Descrição:** Migração para conta `acct_1TWPs2ADOPgqdFsc`. Planos Profissional (R$99) e Empresarial (R$199)
criados. Webhook configurado. Todos os price IDs no `.env`.

### Email de confirmação ao cliente na ativação
**Concluído:** Maio 2026
**Descrição:** Ao ativar uma chave, dispara email com código, benefício, validade e instruções. Fire-and-forget.

### Página /c/[codigo] com layout da campanha
**Concluído:** Maio 2026
**Descrição:** A página pública carrega o layout vinculado à campanha (cores, imagem, estilo).

### Migração de chaves entre campanhas
**Concluído:** Maio 2026
**Descrição:** Lojista pode migrar chaves não resgatadas para campanhas ativas.

### Vigência de campanhas + trava de geração
**Concluído:** Maio 2026
**Descrição:** Indicadores visuais de campanha expirada. Bloqueio de geração para campanhas expiradas.

### Dark mode completo + separação admin vs lojista
**Concluído:** Maio 2026
**Descrição:** Design system com tokens dark mode em todas as páginas.

---

## ⏸️ Pausadas / Em Espera

*Nenhuma no momento*

---

*Atualizado em: 2026-05-13*
