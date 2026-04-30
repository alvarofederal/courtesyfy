# Basemedical - Backlog de Funcionalidades

## Como usar este arquivo

Adicione itens neste backlog quando surgir uma nova ideia ou necessidade.
Mova para `features.md` quando iniciar o desenvolvimento.
Use prioridades: 🔴 Crítico | 🟠 Alta | 🟡 Média | 🟢 Baixa

---

## Em Andamento Agora

### 🔴 Relatórios Dinâmicos (TODO.md)
**Descrição:** Tela de relatórios com filtros por data, gráficos e exportação CSV
**Componentes:**
- API route para dados de relatório → ⬜ pendente
- Filtros de data (date pickers) → ⬜ pendente
- Gráficos com Recharts → ✅ biblioteca instalada
- Cards de resumo → ⬜ pendente
- Exportação CSV → ⬜ pendente
**Arquivo:** `src/app/(panel)/dashboard/reports/`

---

## Próximos a Iniciar

### 🟠 Lembretes Automáticos de Consulta
**Descrição:** Envio automático de lembrete 24h antes da consulta via WhatsApp/SMS
**Dependências:** Twilio (já integrado), Cron job ou webhook
**Complexidade:** Média
**Notas:** Sistema de Reminder já existe no banco (`Reminder` model)

### 🟠 Melhoria no Fluxo de Cancelamento
**Descrição:** Permitir cancelamento com motivo e notificar profissional
**Arquivos relevantes:** `src/app/(public)/profissional/[id]/cancelar/`

### 🟠 Notificações Push (Web)
**Descrição:** Notificações no browser para novos agendamentos
**Dependências:** Service Worker, Push API

---

## Backlog Geral

### UX/UI
- 🟡 Tema escuro (dark mode)
- 🟡 Melhorar responsividade mobile do dashboard
- 🟡 Onboarding interativo com tour guiado
- 🟢 Animações de transição entre páginas

### Funcionalidades
- 🟡 Busca avançada com filtros (especialidade, localização, preço)
- 🟡 Sistema de favoritos para pacientes
- 🟡 Histórico de consultas para pacientes (sem login)
- 🟡 QR Code para agenda pública
- 🟢 Integração com Google Calendar
- 🟢 Integração com Outlook Calendar

### Administrativo
- 🟡 Dashboard de métricas mais detalhado (admin)
- 🟡 Sistema de suporte/tickets integrado
- 🟢 Logs de auditoria por usuário

### Performance
- 🟡 Paginação cursor-based nas listas
- 🟡 Cache de perfis públicos com ISR
- 🟢 Otimização de queries N+1

### Segurança
- 🟠 Autenticação 2FA (TOTP)
- 🟡 LGPD - Exportação/exclusão de dados
- 🟡 Rate limiting mais granular por endpoint

---

## Ideias Futuras (não priorizadas)

- Multi-idioma (pt-BR padrão, en-US)
- App mobile React Native
- Marketplace de templates para landing page
- IA para sugestão de horários ideais
- Integração com CFM/CRO para validação de registro profissional
- Módulo financeiro (controle de receitas)
- Prontuário eletrônico simplificado
- Telemedicina (videochamada)

---

## Ideias da Cortesia Condicional (landing → eligibility)

Discutidas durante implementação da feature em 2026-04. Vale priorizar conforme
métricas iniciais de conversão da landing `/para/medicos`.

### 🟡 A) Sequência de pré-expiração crescente
Substituir o banner único de 14 dias por sequência:
- 14d antes: verde discreto + dado social ("3 colegas seus assinaram esta semana")
- 7d: amber "decida nesta semana"
- 3d: vermelho persistente (toast)
- Dia 0: modal bloqueante "escolha um plano pra continuar" (não desliga features, exige ação)

Mais conversivo que aviso único.

### 🟡 B) Email de valor concreto na expiração
Quando cortesia expira (ou 7 dias antes), email com NÚMEROS reais:
> "Você criou 47 agendamentos. Salvou ~7h de WhatsApp. R$ X estimados em consultas."

Reduz fricção de pagar — ROI explícito.

### 🟠 C) Programa de Embaixador (referral)
Profissional com cortesia ativa pode indicar 1 colega via link
`/para/medicos?ref=PROF-ID`. Quando o colega cumpre o desafio, ambos ganham
+30 dias somados na cortesia.
- Métricas: indicações por embaixador, conversão por canal
- Crescimento orgânico baixo custo

### 🟢 D) Cortesia "Pioneer" (escassez controlada)
Primeiros 100 profissionais que ativaram cortesia recebem 15% perpétuo de
desconto ao virarem pagantes. Cria exclusividade + lock-in. Custo limitado.

### 🟡 E) Selo público "Profissional aprovado pela Basemedical"
Selo digital no perfil público (`/profissional/[slug]`) com data de aprovação.
- Pra ele: status → quer manter ativo → assina
- Pra plataforma: marketing duplo (pacientes vendo selo)

---

*Atualizado em: 2026-04-27*
