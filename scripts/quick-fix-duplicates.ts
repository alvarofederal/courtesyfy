// scripts/quick-fix-duplicates.ts
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log("🧹 Limpando duplicatas rapidamente...")

  // Limpar todos os CPFs e registros (deixar NULL)
  await prisma.$executeRaw`
    UPDATE User 
    SET cpf = NULL, registration = NULL 
    WHERE cpf IS NOT NULL OR registration IS NOT NULL
  `

  console.log("✅ Todos os CPFs e registros foram limpos!")
  console.log("🚀 Agora rode: npx prisma db push --accept-data-loss")
  console.log("📝 Os usuários preencherão novamente no onboarding")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())