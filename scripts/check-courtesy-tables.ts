import { PrismaClient } from "../src/generated/prisma"

const db = new PrismaClient()

async function main() {
  const tables: any = await db.$queryRawUnsafe(
    "SHOW TABLES LIKE 'Courtesy%'"
  )
  console.log("Tabelas Courtesy existentes:", tables)
}

main()
  .catch((e) => { console.error("ERRO:", e); process.exit(1) })
  .finally(() => db.$disconnect())
