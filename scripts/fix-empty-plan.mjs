// One-off data cleanup: fix empty/NULL plan values in User and Subscription.
// Uses $executeRawUnsafe to bypass enum validation.
import { PrismaClient } from "../src/generated/prisma/index.js"

const db = new PrismaClient()

async function main() {
  const userBefore = await db.$queryRawUnsafe(
    "SELECT id, email, plan FROM User WHERE plan = '' OR plan IS NULL"
  )
  const subBefore = await db.$queryRawUnsafe(
    "SELECT id, userId, plan FROM Subscription WHERE plan = '' OR plan IS NULL"
  )
  console.log("Users inválidos:", userBefore)
  console.log("Subscriptions inválidas:", subBefore)

  const u = await db.$executeRawUnsafe(
    "UPDATE User SET plan = 'FREE' WHERE plan = '' OR plan IS NULL"
  )
  const s = await db.$executeRawUnsafe(
    "UPDATE Subscription SET plan = 'FREE' WHERE plan = '' OR plan IS NULL"
  )
  console.log(`Atualizados: ${u} user(s), ${s} subscription(s)`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
