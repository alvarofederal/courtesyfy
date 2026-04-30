import prisma from "../src/lib/prisma";

async function cleanOrphanSessions() {
  console.log('🧹 Limpando sessões e contas órfãs...');

  try {
    // Deletar todas as sessões
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`✅ ${deletedSessions.count} sessões deletadas`);

    // Deletar todas as contas
    const deletedAccounts = await prisma.account.deleteMany({});
    console.log(`✅ ${deletedAccounts.count} contas deletadas`);
    
    console.log('✨ Tente fazer login novamente');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

cleanOrphanSessions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());