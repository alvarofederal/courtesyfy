import prisma from "../src/lib/prisma";

async function cleanAllAuth() {
  console.log('🧹 Limpando todo o sistema de autenticação...');

  try {
    // Deletar verificações
    const deletedVerifications = await prisma.verificationToken.deleteMany({});
    console.log(`✅ ${deletedVerifications.count} verificações deletadas`);

    // Deletar sessões
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`✅ ${deletedSessions.count} sessões deletadas`);

    // Deletar contas OAuth
    const deletedAccounts = await prisma.account.deleteMany({});
    console.log(`✅ ${deletedAccounts.count} contas OAuth deletadas`);
    
    console.log('✨ Sistema de autenticação limpo! Tente fazer login novamente.');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

cleanAllAuth()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());