import prisma from "../src/lib/prisma";
import { randomBytes } from "crypto";

async function populateTokens() {
  console.log('🔄 Populando tokens...');

  try {
    // Buscar todos os agendamentos
    const appointments = await prisma.appointment.findMany({
      select: {
        id: true,
        name: true,
        confirmationToken: true
      }
    });

    // Filtrar apenas os que não têm token ou têm token vazio
    const appointmentsWithoutToken = appointments.filter(
      apt => !apt.confirmationToken || apt.confirmationToken.trim() === ''
    );

    console.log(`📊 Total de agendamentos: ${appointments.length}`);
    console.log(`📊 Sem token: ${appointmentsWithoutToken.length}\n`);

    if (appointmentsWithoutToken.length === 0) {
      console.log('✨ Todos os agendamentos já têm token!');
      return;
    }

    let count = 0;

    for (const appointment of appointmentsWithoutToken) {
      // Gerar token único (32 caracteres hexadecimais)
      const token = randomBytes(16).toString('hex');

      try {
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { confirmationToken: token }
        });

        console.log(`✅ ${appointment.name.padEnd(30)} → ${token}`);
        count++;
      } catch (error) {
        console.error(`❌ Erro ao atualizar ${appointment.name}:`, error);
      }
    }

    console.log(`\n✅ ${count} tokens gerados com sucesso!`);

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

populateTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());