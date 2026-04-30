import { PrismaClient } from "../src/generated/prisma"

const db = new PrismaClient()

async function main() {
  const courtesyRows: any = await db.$queryRawUnsafe("SELECT COUNT(*) as n FROM Courtesy")
  const keyRows: any = await db.$queryRawUnsafe("SELECT COUNT(*) as n FROM CourtesyKey")
  console.log("Courtesy rows:", Number(courtesyRows[0].n))
  console.log("CourtesyKey rows:", Number(keyRows[0].n))
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
