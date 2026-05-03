# Courtesyfy — Roadmap do Produto

## Visão de Longo Prazo

Tornar o Courtesyfy a plataforma de referência para gestão de campanhas promocionais com chaves únicas no Brasil — do pequeno lojista ao grande varejista com múltiplas unidades.

---

## MVP (v1.0.0 — Em desenvolvimento, maio 2026)

### P0 — Essenciais para o MVP

**Infraestrutura:**
- [x] Autenticação (email, Google, GitHub) — herdado do Basemedical
- [x] Verificação de email
- [ ] Limpar código do domínio médico (Basemedical)
- [ ] Novo schema Prisma para o domínio Courtesyfy

**Loja:**
- [ ] Cadastro de loja com dados básicos e logo
- [ ] Cadastro de usuários operadores da loja
- [ ] Configuração de identidade visual (cor primária, logo)

**Campanhas:**
- [ ] Criação de campanha (nome, tipo de benefício, validade, quantidade de chaves)
- [ ] Tipos: desconto percentual, desconto fixo, brinde, sorteio, frete grátis, cashback
- [ ] Listagem e gestão de campanhas

**Chaves:**
- [ ] Geração de lote de chaves únicas (formato `XXXX-XXXX-XXXX-XXXX`)
- [ ] Geração de QR Code por chave apontando para `/c/[codigo]`
- [ ] Exportação para impressão em A4
- [ ] Exportação CSV com chaves e URLs

**Landing page pública:**
- [ ] Página `/c/[codigo]` com identidade visual da loja
- [ ] Exibição do benefício, regras e validade
- [ ] Formulário de ativação (coleta tel/email do cliente)

**Validação e Resgate:**
- [ ] Tela de validação rápida para operador (digitar ou escanear QR)
- [ ] Ciclo completo: GERADA → ATIVADA → RESGATADA
- [ ] Histórico de resgates com data, hora e operador

**Sistema:**
- [ ] Transições de status da chave
- [ ] Logs de eventos em todas as ações relevantes
- [ ] API pública `/api/chaves/validar` para QR externos

---

## P1 — Logo após o MVP (Q3 2026)

- [ ] Dashboard com métricas por campanha (taxa de ativação, conversão)
- [ ] Filtros por status, campanha, período e lote
- [ ] Cancelamento manual de chaves pelo lojista
- [ ] Expiração automática via cron job (`/api/cron/expirar-chaves`)
- [ ] Landing page personalizada com logo e cores da loja
- [ ] Layouts de impressão para adesivo, cartão e etiqueta
- [ ] Importação e exportação CSV de lotes de chaves
- [ ] Painel super admin da plataforma

---

## P2 — Expansão comercial (Q4 2026+)

- [ ] White-label por loja (domínio customizado)
- [ ] Múltiplos benefícios por campanha
- [ ] API para integração com ecommerce e PDV
- [ ] Sorteio automatizado no fechamento do período
- [ ] Área do cliente com histórico de chaves
- [ ] Regras avançadas (produto, categoria, valor mínimo, período)
- [ ] Multi-unidade e franquias
- [ ] Cobrança recorrente por plano (Stripe)
- [ ] App mobile para operadores

---

## KPIs a Monitorar

- Número de lojas cadastradas
- Campanhas ativas no período
- Taxa de ativação: chaves ativadas / geradas
- Taxa de conversão: chaves resgatadas / ativadas
- Churn de assinaturas
- NPS dos lojistas

---

*Criado em: 2026-05-02 | Migrado de Basemedical para Courtesyfy*
