import { PrismaClient } from "../src/generated/prisma"

const db = new PrismaClient()

async function main() {
  const col: any = await db.$queryRawUnsafe(
    "SHOW COLUMNS FROM Subscription LIKE 'plan'"
  )
  console.log("Coluna Subscription.plan:", col)

  const subBefore: any = await db.$queryRawUnsafe(
    "SELECT id, userId, plan FROM Subscription WHERE plan = '' OR plan IS NULL"
  )
  console.log(`\nSubscriptions com plan vazio/null: ${subBefore.length}`)
  console.log(subBefore)

  if (subBefore.length > 0) {
    const updated = await db.$executeRawUnsafe(
      "UPDATE Subscription SET plan = 'FREE' WHERE plan = '' OR plan IS NULL"
    )
    console.log(`\n✅ Atualizadas ${updated} subscription(s) para plan=FREE`)
  } else {
    console.log("\nNada a corrigir nessa tabela.")
  }
}

main()
  .catch((e) => { console.error("ERRO:", e); process.exit(1) })
  .finally(() => db.$disconnect())
