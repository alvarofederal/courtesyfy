import { PrismaClient } from "../src/generated/prisma"

const db = new PrismaClient()

async function main() {
  console.log("Adicionando COURTESY ao enum Subscription.plan...")
  await db.$executeRawUnsafe(
    "ALTER TABLE Subscription MODIFY plan ENUM('FREE','PROFESSIONAL','COURTESY') NOT NULL DEFAULT 'FREE'"
  )
  const col: any = await db.$queryRawUnsafe(
    "SHOW COLUMNS FROM Subscription LIKE 'plan'"
  )
  console.log("✅ Atualizado:", col)
}

main()
  .catch((e) => { console.error("ERRO:", e); process.exit(1) })
  .finally(() => db.$disconnect())
