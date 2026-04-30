# Basemedical - Conhecimento do Banco de Dados

## Configuração

- **Banco:** MySQL
- **ORM:** Prisma 5.17.0
- **Schema:** `prisma/schema.prisma`
- **Client gerado:** `src/generated/prisma/`
- **Import no código:** `import { db } from "@/lib/prisma"`
- **Relation mode:** `prisma` (sem foreign keys nativas no MySQL)

---

## Modelos e Relacionamentos

### Autenticação

```
User (1) ──< Account (N)        # OAuth providers vinculados
User (1) ──< Session (N)        # Sessões ativas
User (1) ──< AuthToken (N)      # Tokens de email verify / reset senha
User (1) ──< RefreshToken (N)   # Refresh tokens para sessão
User (1) ──< LoginAttempt (N)   # Log de tentativas de login
User (1) ──< Authenticator (N)  # WebAuthn/FIDO2
```

### Perfil do Profissional

```
User (1) ──< UserAddress (N)      # Endereços do profissional
User (1) ──< UserTime (N)         # Horários disponíveis
User (1) ──< UserTypeService (N)  # Serviços que oferece
User (N) ──> Profession (1)       # Profissão (médico, dentista...)
User (N) ──> Specialty (1)        # Especialidade principal
User (1) ──< Specialist (N)       # Especialistas vinculados
```

### Agendamento

```
User (1) ──< AvailableSlot (N)          # Blocos de disponibilidade
AvailableSlot (1) ──< AvailableSlotTime (N)  # Slots individuais de horário
AvailableSlotTime (1) ──< Appointment (N)    # Consultas agendadas
TypeService (N) ──< UserTypeService (N) ──> User (N)  # M:M
```

### Negócio

```
User (1) ──< Subscription (N)    # Assinaturas Stripe (FREE/PROFESSIONAL/COURTESY)
User (1) ──< Courtesy (0..1)     # Cortesia concedida por admin (expira)
User (1) ──< Review (N)          # Avaliações recebidas
Review (1) ──< ReviewLike (N)    # Likes nas avaliações
User (1) ──< Waitlist (N)        # Entradas na waitlist
User (1) ──< Notification (N)    # Notificações do sistema
User (1) ──< LandingPage (N)     # Customização da landing
User (1) ──< Reminder (N)        # Lembretes configurados
```

---

## Enums Importantes

```prisma
enum Plan {
  FREE
  PROFESSIONAL
  COURTESY        // concedido por admin a parceiros/divulgadores
}

enum SubscriptionStatus {
  active
  canceled
  incomplete
  incomplete_expired
  past_due
  trialing
  unpaid
}

enum ReviewStatus {
  PENDING    // aguardando moderação
  APPROVED   // publicada
  REJECTED   // rejeitada pelo admin
}

enum SlotStatus {
  AVAILABLE
  BOOKED
  CANCELLED
}

enum TokenType {
  EMAIL_VERIFICATION
  PASSWORD_RESET
}

enum TypeProfile {
  TOTAL      // perfil completo
  INFO       // só informações
  WAITLIST   // só waitlist
}

enum NotificationType {
  APPOINTMENT_SOON
  NEW_REVIEW
  REVIEW_APPROVED
  SUBSCRIPTION_EXPIRING
  APPOINTMENT_CANCELLED
  NEW_APPOINTMENT
  REMINDER
}

enum NotificationPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```

---

## Campos Críticos do Model User

```prisma
model User {
  id            String   // UUID primário
  name          String?
  email         String   @unique
  emailVerified DateTime? // null = não verificado
  image         String?  // URL do avatar
  password      String?  // null se OAuth

  // Perfil profissional
  phone         String?
  bio           String?
  professionId  String?
  specialtyId   String?
  crm           String?  // Registro profissional
  slug          String?  @unique  // URL amigável

  // Plano
  plan          Plan     @default(FREE)

  // Relacionamentos
  subscription  Subscription[]
  addresses     UserAddress[]
  appointments  Appointment[]  // como profissional
  reviews       Review[]       // recebidas
  // ...
}
```

---

## Queries Comuns

### Buscar profissional com dados completos
```typescript
const professional = await db.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true,
    email: true,
    phone: true,
    bio: true,
    image: true,
    profession: { select: { name: true } },
    specialty: { select: { name: true } },
    addresses: { select: { street: true, city: true, state: true } },
    subscription: {
      where: { status: { in: ['active', 'trialing'] } },
      select: { plan: true, status: true }
    }
  }
})
```

### Verificar plano ativo
```typescript
const subscription = await db.subscription.findFirst({
  where: {
    userId,
    status: { in: ['active', 'trialing'] }
  }
})
const isPro = subscription?.plan === 'PROFESSIONAL'
```

### Buscar slots disponíveis
```typescript
const slots = await db.availableSlot.findMany({
  where: {
    userId,
    date: { gte: new Date() }
  },
  include: {
    times: {
      where: { status: 'AVAILABLE' }
    }
  }
})
```

---

## Cuidados com o Banco

1. **Nunca usar `db.model.findMany()` sem `select`** em produção — pode retornar dados sensíveis e sobrecarregar a rede.
2. **Relation mode Prisma** (sem FK nativas) → cascades precisam ser feitas manualmente.
3. **O build faz `prisma db push --accept-data-loss`** → mudanças no schema em produção podem ser destrutivas. Cuidado!
4. **Índices:** Verificar se campos usados em `where` frequentes têm `@@index`.

---

## Scripts de Banco

```bash
npm run db:seed          # Popular dados iniciais
npx prisma studio        # GUI visual do banco
npx prisma generate      # Regenerar client após mudar schema
npx prisma db push       # Sincronizar schema sem migrations
npx prisma migrate dev   # Criar migration (não usado em produção atualmente)
npm run migrate:status   # Ver status das migrations
npm run migrate:deploy   # Deploy de migrations pendentes
```

---

*Atualizado em: 2026-03-10*
