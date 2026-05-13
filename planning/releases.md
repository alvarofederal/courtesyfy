# Courtesyfy — Histórico de Releases

## Versão Atual: 1.0.0-mvp

---

## v1.0.0-mvp (Maio 2026)
**Branch:** main
**Status:** Em produção (Vercel)

### Funcionalidades entregues

**Infraestrutura & Auth:**
- Autenticação completa (Google OAuth + Credentials)
- Verificação de email no cadastro
- Schema Prisma para o domínio Courtesyfy (Loja, Campanha, Chave, Resgate, Cliente)
- Design system com dark mode completo (tokens `dash-*`)
- Separação de layout: admin vs lojista

**Loja & Planos:**
- Cadastro de loja com logo (Cloudinary)
- Planos: Essencial (free) / Profissional (R$ 99/mês) / Empresarial (R$ 199/mês)
- Integração Stripe com webhook para ativar/bloquear assinatura
- Landing page com CTAs de planos conectados ao Stripe Checkout

**Campanhas:**
- Criação de campanhas com tipo de benefício, validade e quantidade de chaves
- Tipos: desconto percentual, desconto fixo, brinde, sorteio, frete grátis, cashback
- Listagem com filtros, status ativo/expirado e indicadores visuais de vigência
- Bloqueio de geração para campanhas expiradas
- Migração de chaves entre campanhas

**Chaves:**
- Geração de lote de chaves únicas (`XXXX-XXXX-XXXX-XXXX`)
- QR Code por chave apontando para `/c/[codigo]`
- Exportação para impressão em A4 e exportação CSV
- Datas de criação e validade nas listagens

**Landing page pública da chave:**
- Página `/c/[codigo]` com layout e cores da campanha/loja
- Formulário de ativação (coleta tel/email do cliente)
- Email de confirmação ao cliente via Resend
- Página `/resgatar` com scanner QR e campo de digitação

**Validação e Resgate:**
- Tela de validação rápida para operador
- Ciclo completo: GERADA → CONSULTADA → ATIVADA → RESGATADA
- Modo totem para auto-atendimento
- Histórico de resgates com data, hora, canal e operador

**Clientes:**
- Listagem de clientes com busca (nome, email, telefone)
- Detalhe do cliente: dados, stats, campanhas participadas, histórico de chaves
- Item "Clientes" no menu lateral do lojista

**Produtos físicos (kits de impressão):**
- 3 linhas: Papel Offset 240g, MDF Chaveiro 7×3,5cm, MDF Quadrado 9×9cm
- 6 price IDs Stripe configurados no `.env`
- Checkout público via `/api/checkout-produto` (sem autenticação, com allowlist)
- Kits exibidos na landing page com botões de compra + banner de pedido concluído

**Super Admin:**
- Painel Stripe: MRR, assinantes por plano, lojas suspensas, renovações nos próximos 7 dias
- Lista completa de lojas com assinatura (até 100)
- Histórico de eventos Stripe (últimos 12)
- Tela `/dashboard/admin/stripe/produtos`: gerenciar produtos e preços do Stripe
  - Edição inline de nome e descrição do produto
  - Edição inline de nickname de preço
  - Arquivar produto / arquivar preço
  - Criar novo preço num produto existente (retorna ID para copiar ao `.env`)
  - Criar novo produto Stripe

---

## Processo de Release

```bash
# Build e teste local
npm run build

# Commit e push → Vercel faz deploy automático do branch main
git push origin main
```

---

## Próximas Releases Planejadas

| Versão | Foco | Status |
|--------|------|--------|
| v1.1.0 | API pública `/api/chaves/validar` + cron de expiração automática | Backlog |
| v1.2.0 | Dashboard com métricas avançadas (gráficos de conversão) | Backlog |
| v1.3.0 | Portal do cliente Stripe (autogestão de assinatura) | Backlog |
| v2.0.0 | Multi-unidade, white-label, API de integração PDV | Planejado |

---

*Atualizado em: 2026-05-13*
