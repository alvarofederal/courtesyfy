// scripts/fix-duplicate-cpf.ts
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log("🔍 Verificando CPFs duplicados...")

  // 1. Buscar todos os usuários com CPF duplicado ou vazio
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      cpf: true,
      registration: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  console.log(`📊 Total de usuários: ${users.length}`)

  // 2. Encontrar CPFs duplicados
  const cpfMap = new Map<string, string[]>()
  let nullCpfCount = 0

  for (const user of users) {
    if (!user.cpf || user.cpf.trim() === '') {
      nullCpfCount++
      continue
    }

    if (!cpfMap.has(user.cpf)) {
      cpfMap.set(user.cpf, [])
    }
    cpfMap.get(user.cpf)!.push(user.id)
  }

  // 3. Mostrar duplicatas
  const duplicates = Array.from(cpfMap.entries()).filter(([_, ids]) => ids.length > 1)
  
  if (duplicates.length > 0) {
    console.log(`\n⚠️  Encontrados ${duplicates.length} CPFs duplicados:`)
    for (const [cpf, ids] of duplicates) {
      console.log(`   CPF: ${cpf} → ${ids.length} usuários`)
    }
  }

  console.log(`\n❌ Usuários sem CPF: ${nullCpfCount}`)

  // 4. Limpar CPFs duplicados (manter apenas o primeiro, limpar os outros)
  let cleanedCount = 0

  for (const [cpf, ids] of duplicates) {
    // Manter o primeiro (mais antigo), limpar os outros
    const [keep, ...remove] = ids
    
    console.log(`\n🧹 Limpando CPF ${cpf}:`)
    console.log(`   ✓ Mantendo: ${keep}`)
    console.log(`   ❌ Limpando: ${remove.join(', ')}`)

    for (const userId of remove) {
      await prisma.user.update({
        where: { id: userId },
        data: { cpf: null }
      })
      cleanedCount++
    }
  }

  // 5. Verificar registros duplicados também
  console.log("\n🔍 Verificando registros profissionais duplicados...")
  
  const regMap = new Map<string, string[]>()
  let nullRegCount = 0

  for (const user of users) {
    if (!user.registration || user.registration.trim() === '') {
      nullRegCount++
      continue
    }

    if (!regMap.has(user.registration)) {
      regMap.set(user.registration, [])
    }
    regMap.get(user.registration)!.push(user.id)
  }

  const regDuplicates = Array.from(regMap.entries()).filter(([_, ids]) => ids.length > 1)
  
  if (regDuplicates.length > 0) {
    console.log(`\n⚠️  Encontrados ${regDuplicates.length} registros duplicados:`)
    for (const [reg, ids] of regDuplicates) {
      console.log(`   Registro: ${reg} → ${ids.length} usuários`)
    }

    // Limpar duplicatas
    for (const [reg, ids] of regDuplicates) {
      const [keep, ...remove] = ids
      
      console.log(`\n🧹 Limpando Registro ${reg}:`)
      console.log(`   ✓ Mantendo: ${keep}`)
      console.log(`   ❌ Limpando: ${remove.join(', ')}`)

      for (const userId of remove) {
        await prisma.user.update({
          where: { id: userId },
          data: { registration: null }
        })
        cleanedCount++
      }
    }
  }

  console.log(`\n✅ Limpeza concluída!`)
  console.log(`   CPFs duplicados limpos: ${cleanedCount}`)
  console.log(`   Registros duplicados limpos: ${regDuplicates.length}`)
  console.log(`\n🚀 Agora você pode rodar: npx prisma db push --accept-data-loss`)
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })