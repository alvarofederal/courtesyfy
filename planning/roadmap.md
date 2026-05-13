# Courtesyfy — Roadmap do Produto

## Visão de Longo Prazo

Tornar o Courtesyfy a plataforma de referência para gestão de campanhas promocionais com chaves únicas no Brasil — do pequeno lojista ao grande varejista com múltiplas unidades.

---

## MVP (v1.0.0 — Concluído, Maio 2026)

### P0 — Essenciais para o MVP ✅ TODOS ENTREGUES

**Infraestrutura:**
- [x] Autenticação (email, Google)
- [x] Verificação de email
- [x] Schema Prisma para o domínio Courtesyfy

**Loja:**
- [x] Cadastro de loja com dados básicos e logo
- [x] Planos: Essencial / Profissional / Empresarial
- [x] Cobrança via Stripe (assinatura mensal)
- [x] Webhook Stripe (ativar/suspender assinatura)

**Campanhas:**
- [x] Criação de campanha (nome, tipo de benefício, validade, quantidade)
- [x] Tipos: desconto percentual, desconto fixo, brinde, sorteio, frete grátis, cashback
- [x] Listagem e gestão de campanhas com indicadores de vigência
- [x] Migração de chaves entre campanhas

**Chaves:**
- [x] Geração de lote de chaves únicas (`XXXX-XXXX-XXXX-XXXX`)
- [x] QR Code por chave apontando para `/c/[codigo]`
- [x] Exportação para impressão em A4 e CSV

**Landing page pública:**
- [x] Página `/c/[codigo]` com identidade visual da campanha/loja
- [x] Formulário de ativação (coleta tel/email do cliente)
- [x] Email de confirmação ao cliente (Resend)

**Validação e Resgate:**
- [x] Tela de validação rápida para operador
- [x] Ciclo completo: GERADA → ATIVADA → RESGATADA
- [x] Modo totem para auto-atendimento
- [x] Histórico de resgates

**Clientes:**
- [x] Listagem de clientes com busca
- [x] Detalhe do cliente com histórico de chaves

**Produtos físicos:**
- [x] Kits de impressão (Offset, Chaveiro MDF, Quadrado MDF)
- [x] Checkout público sem autenticação
- [x] Landing page com CTAs conectados ao Stripe

**Super Admin:**
- [x] Painel Stripe com MRR, assinantes, renovações, eventos
- [x] Gerenciamento de produtos/preços Stripe no dashboard

---

## P1 — Pós-MVP (Q3 2026)

- [ ] **API pública `/api/chaves/validar`** — endpoint REST com API Key para PDV/totem externo
- [ ] **Cron de expiração automática** — `GET /api/cron/expirar-chaves` via Vercel Cron
- [ ] **Dashboard com gráficos** — taxa de ativação, conversão, chaves por campanha (Recharts)
- [ ] **Cancelamento manual de chaves** em lote pelo lojista
- [ ] **Portal do cliente Stripe** — lojista gerencia própria assinatura (upgrade/downgrade/cancelar)
- [ ] **Layouts de impressão** adicionais (adesivo, etiqueta, cartão de visita)
- [ ] **Filtros avançados** por status, campanha, período e lote nas listagens

---

## P2 — Expansão Comercial (Q4 2026+)

- [ ] White-label por loja (domínio customizado)
- [ ] Múltiplos benefícios por campanha
- [ ] API de integração com ecommerce e PDV
- [ ] Sorteio automatizado no fechamento do período
- [ ] Regras avançadas (produto, categoria, valor mínimo, período)
- [ ] Multi-unidade e franquias
- [ ] App mobile para operadores (PWA ou React Native)
- [ ] LGPD — export/delete de dados do cliente

---

## KPIs a Monitorar

- Número de lojas cadastradas e ativas (com assinatura paga)
- MRR (receita recorrente mensal)
- Campanhas ativas no período
- Taxa de ativação: chaves ativadas / geradas
- Taxa de conversão: chaves resgatadas / ativadas
- Churn de assinaturas
- Volume de kits físicos vendidos

---

*Atualizado em: 2026-05-13*
