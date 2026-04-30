import prisma from "../src/lib/prisma";
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function deleteUserByEmail() {
  const email = await new Promise<string>((resolve) => {
    rl.question('Digite o email do usuário para deletar: ', (answer) => {
      resolve(answer);
    });
  });

  if (!email) {
    console.log('❌ Email não informado');
    rl.close();
    return;
  }

  console.log(`\n🔍 Procurando usuário com email: ${email}`);

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      rl.close();
      return;
    }

    console.log(`\n👤 Usuário encontrado:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Email: ${user.email}\n`);

    const confirm = await new Promise<string>((resolve) => {
      rl.question('Tem certeza que deseja deletar? (s/n): ', (answer) => {
        resolve(answer.toLowerCase());
      });
    });

    if (confirm !== 's' && confirm !== 'sim') {
      console.log('❌ Operação cancelada');
      rl.close();
      return;
    }

    // Deletar tudo relacionado
    await prisma.account.deleteMany({ where: { userId: user.id } });
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.appointment.deleteMany({ where: { userId: user.id } });
    await prisma.availableSlot.deleteMany({ where: { userId: user.id } });
    await prisma.userTypeService.deleteMany({ where: { userId: user.id } });
    await prisma.userAddress.deleteMany({ where: { userId: user.id } });
    await prisma.userTime.deleteMany({ where: { userId: user.id } });
    
    await prisma.user.delete({ where: { id: user.id } });

    console.log('\n✅ Usuário deletado com sucesso!');
    console.log('✨ Agora você pode fazer login novamente\n');

  } catch (error) {
    console.error('\n❌ Erro:', error);
  } finally {
    rl.close();
  }
}

deleteUserByEmail()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());