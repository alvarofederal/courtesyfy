# Basemedical - Conhecimento de Domínio

## Vocabulário do Domínio

### Entidades Principais

| Termo no Sistema | Significado no Mundo Real |
|-----------------|--------------------------|
| `User` | Profissional de saúde cadastrado na plataforma |
| `Profession` | Área de atuação (Medicina, Odontologia, Fisioterapia...) |
| `Specialty` | Especialidade dentro da profissão (Cardiologia, Ortopedia...) |
| `Specialist` | Especialista vinculado a um profissional (pode ser um assistente/sócio) |
| `TypeService` | Tipo de atendimento (Consulta, Retorno, Avaliação...) |
| `UserTypeService` | Relacionamento entre profissional e seus tipos de serviço com preços |
| `AvailableSlot` | Bloco de disponibilidade do profissional (um dia ou período) |
| `AvailableSlotTime` | Horário específico dentro de um bloco (ex: 09:00, 09:30) |
| `Appointment` | Consulta agendada por um paciente |
| `Review` | Avaliação deixada por um paciente |
| `Waitlist` | Lista de espera de pacientes para profissional sem disponibilidade imediata |
| `LandingPage` | Página personalizada do profissional acessível publicamente |
| `Subscription` | Assinatura do plano (FREE/PROFESSIONAL/COURTESY) via Stripe ou admin |
| `Courtesy` | Cortesia do plano Profissional concedida por admin a parceiros/divulgadores (com expiração) |
| `Reminder` | Lembrete configurado pelo profissional |
| `Notification` | Notificação interna do sistema para o profissional |

---

## Fluxo de Agendamento

### Perspectiva do Profissional
```
1. Configurar TypeServices (tipos de atendimento e preços)
2. Configurar UserAddress (endereços de atendimento)
3. Criar AvailableSlot (dia disponível)
   → Gera AvailableSlotTime (horários específicos)
4. Gerenciar Appointments (confirmar, cancelar)
5. Ver Reviews dos pacientes
```

### Perspectiva do Paciente (sem login)
```
1. Buscar profissional em /buscar (por nome, profissão, localidade)
2. Acessar perfil em /profissional/[id]
3. Ver disponibilidade e serviços
4. Escolher horário → Preencher dados → Confirmar agendamento
5. Receber confirmação por email/WhatsApp
6. Cancelar em /profissional/[id]/cancelar/[token]
7. Confirmar em /profissional/[id]/confirmar/[token]
```

---

## Regras de Negócio

### Planos
- **FREE:** Número limitado de serviços, endereços e funcionalidades
- **PROFESSIONAL:** Acesso completo (pago via Stripe)
- **COURTESY:** Acesso equivalente ao PROFESSIONAL concedido por admin a parceiros/divulgadores, com expiração
- Trial disponível ao criar conta (definido em `src/utils/permissions/trial-limits.ts`)
- Verificação de plano em toda ação que cria recurso: `canCreateService()`, `canAddAddress()`
- Helper `isPremiumPlan(plan)` em `src/utils/permissions/isPremiumPlan.ts` → `true` para PROFESSIONAL ou COURTESY

### Perfis de Acesso
- `TypeProfile.TOTAL` → Perfil completo com todos os recursos
- `TypeProfile.INFO` → Apenas informações, sem agendamento
- `TypeProfile.WAITLIST` → Apenas lista de espera, sem agendamento

### Reviews
- Criadas por pacientes após consulta
- Status inicial: `PENDING` (aguarda moderação)
- Profissional pode ver todas; público vê apenas `APPROVED`
- Limite de likes por IP (anti-spam via `ReviewLike`)

### Disponibilidade
- Profissional define blocos de horário (`AvailableSlot`)
- Sistema gera slots individuais (`AvailableSlotTime`)
- Status: `AVAILABLE` → `BOOKED` (quando agendado) → `CANCELLED`

### Autenticação
- Email deve ser verificado antes de acessar o dashboard
- Onboarding obrigatório na primeira entrada (selecionar tipo de perfil)
- OAuth (Google/GitHub) cria usuário automaticamente
- Login tradicional requer senha bcrypt

---

## Localização e Idioma

- **Idioma:** Português Brasileiro (pt-BR)
- **Moeda:** Real (BRL)
- **Fuso horário:** A definir (importante para agendamentos)
- **Formatação de datas:** `date-fns` com locale `pt-BR`
- **Formatação de moeda:** `src/utils/formatCurrency.ts`
- **Formatação de telefone:** `src/utils/formatPhone.ts` (padrão brasileiro)

---

## Hierarquia de Usuários

```
SuperAdmin (acesso total via /admin)
    └── Admin (acesso ao painel /administration)
        └── Professional (acesso ao /dashboard)
            └── Patient (sem login, acessa /profissional/[id])
```

---

## Conceitos Técnicos do Domínio

### Slug do Profissional
- URL amigável gerada automaticamente: `dr-joao-silva-cardiologista`
- Função: `src/utils/slug/generateSlug.ts`
- Usado em: `/profissional/[slug]`

### Registro Profissional (CRM/CRO)
- Campo `crm` no `User` model
- Identifica o profissional pela entidade reguladora
- Médicos: CRM | Dentistas: CRO | Fisios: CREFITO

### Endereços Múltiplos
- Profissional pode atender em múltiplos locais (`UserAddress`)
- Cada endereço pode ter horários específicos
- Limitado por plano (FREE tem menos endereços)

---

## Terminologia em Português

Quando comunicar com o usuário e nomear variáveis UI:
- `profissional` (não "professional")
- `agendamento` ou `consulta` (não "appointment")
- `avaliação` (não "review")
- `plano` (não "plan")
- `assinatura` (não "subscription")
- `disponibilidade` (não "availability")
- `lista de espera` (não "waitlist")

---

*Atualizado em: 2026-03-10*
