import prisma from "../src/lib/prisma";
// Script para deletar todas as contas órfãs
//npx tsx scripts/clean-orphan-accounts.ts

async function cleanOrphanAccounts() {
  console.log('🧹 Limpando contas órfãs...');

  try {
    // Deletar todas as contas
    const deleted = await prisma.account.deleteMany({});
    
    console.log(`✅ ${deleted.count} contas deletadas`);
    console.log('✨ Tente fazer login novamente');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

cleanOrphanAccounts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());