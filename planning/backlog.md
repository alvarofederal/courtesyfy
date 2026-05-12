# Courtesyfy - Backlog de Funcionalidades

## Como usar este arquivo

Adicione itens neste backlog quando surgir uma nova ideia ou necessidade.
Mova para `features.md` quando iniciar o desenvolvimento.
Use prioridades: 🔴 Crítico | 🟠 Alta | 🟡 Média | 🟢 Baixa

---

## Em Andamento Agora

### 🔴 Stripe / Cobrança
**Descrição:** Cobrança recorrente por plano. Sem isso não há receita.
→ ver `features.md`

### 🔴 API pública `/api/chaves/validar`
**Descrição:** Endpoint REST para integração com totem/PDV externo.
→ ver `features.md`

---

## Próximos a Iniciar

### 🟠 Email de boas-vindas ao novo lojista
**Descrição:** Ao concluir o onboarding, enviar email com links rápidos (criar campanha, gerar chaves, tutorial).

### 🟠 Notificação ao lojista quando chave é resgatada
**Descrição:** Email ou push para o lojista cada vez que uma chave é resgatada na sua loja.

### 🟠 Cancelamento manual de chaves pelo lojista
**Descrição:** Botão para cancelar chaves individuais ou lotes inteiros no dashboard.

### 🟠 Filtros avançados na lista de chaves
**Descrição:** Filtrar por status, campanha, período, lote. Busca por código.

---

## Backlog Geral

### UX/UI
- 🟡 Onboarding interativo com tour guiado para novos lojistas
- 🟡 Melhorar responsividade mobile do dashboard
- 🟢 Animações de transição entre páginas

### Campanhas e Chaves
- 🟡 Duplicar campanha (clonar configurações)
- 🟡 Múltiplos layouts por campanha (A/B)
- 🟡 Importação de lotes via CSV
- 🟢 QR Code customizado com logo da loja

### Relatórios
- 🟡 Filtros por período nos relatórios
- 🟡 Export CSV dos relatórios
- 🟡 Gráfico de resgates por hora do dia

### Clientes
- 🟡 Área do cliente com histórico de chaves ativadas
- 🟡 Re-envio de email com código para o cliente
- 🟢 Integração com WhatsApp Business API (envio de código por mensagem)

### Administrativo
- 🟡 Logs de auditoria por usuário
- 🟡 Sistema de suporte/tickets integrado
- 🟢 Métricas de uso por plano (para calibrar pricing)

### Performance e Escala
- 🟡 Paginação cursor-based nas listas
- 🟡 Cache das páginas públicas /c/[codigo] com ISR
- 🟢 Otimização de queries N+1

### Segurança
- 🟠 Rate limiting no endpoint /c/[codigo] (anti-bruteforce)
- 🟡 LGPD — exportação e exclusão de dados de clientes
- 🟡 2FA para lojistas

---

## Ideias Futuras (não priorizadas)

- White-label por loja (domínio customizado: cortesias.minhaloja.com.br)
- Multi-unidade e franquias (uma conta, várias lojas)
- API para integração com ecommerce (WooCommerce, Shopify)
- Sorteio automatizado no fechamento da campanha
- Programa de indicação entre lojistas
- App mobile para operadores (validação offline)
- Relatórios avançados com BI embutido

---

*Atualizado em: 2026-05-12*
