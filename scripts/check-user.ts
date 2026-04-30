// scripts/check-user.ts
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const email = "alvaropgomes@gmail.com"
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      typeProfile: true,
      name: true,
      cpf: true,
      phone: true,
      professionId: true,
      registration: true,
      role: true,
      status: true,
    }
  })

  console.log("\n📊 Dados do usuário:")
  console.log("=====================================")
  console.log(JSON.stringify(user, null, 2))
  console.log("=====================================\n")

  if (user) {
    console.log("✅ Checklist de Onboarding:")
    console.log(`   Email Verificado: ${user.emailVerified ? '✅' : '❌'}`)
    console.log(`   TypeProfile: ${user.typeProfile ? '✅ ' + user.typeProfile : '❌ NULL'}`)
    console.log(`   Nome: ${user.name ? '✅' : '❌ NULL'}`)
    console.log(`   CPF: ${user.cpf ? '✅' : '❌ NULL'}`)
    console.log(`   Telefone: ${user.phone ? '✅' : '❌ NULL'}`)
    console.log(`   Profissão: ${user.professionId ? '✅' : '❌ NULL'}`)
    console.log(`   Registro: ${user.registration ? '✅' : '❌ NULL'}`)
    console.log(`   Role: ${user.role ? '✅ ' + user.role : '❌ NULL'}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())