// prisma/seed.ts

import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Create professions first
  const professions = [
    {
      id: 'medico',
      name: 'Médico',
      description: 'Profissional médico',
      status: true,
    },
    {
      id: 'dentista',
      name: 'Dentista',
      description: 'Profissional odontológico',
      status: true,
    },
    {
      id: 'enfermeiro',
      name: 'Enfermeiro',
      description: 'Profissional de enfermagem',
      status: true,
    },
  ]

  for (const professionData of professions) {
    await prisma.profession.upsert({
      where: { id: professionData.id },
      update: {},
      create: professionData,
    })
    console.log(`Created profession: ${professionData.name}`)
  }

  console.log('✅ Profissões criadas');

  // 2. Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@basemedical.com' },
    update: {},
    create: {
      email: 'admin@basemedical.com',
      password: hashedPassword,
      name: 'Admin BaseMedical',
      role: 'ADMIN',
      status: true,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Usuário admin criado');

  // 3. Criar usuários de teste com subscriptions
  const testProfession = await prisma.profession.findFirst();

  if (testProfession) {
    const testUsers = [
      {
        email: 'profissional.free@test.com',
        name: 'Dr. João Silva',
        plan: 'FREE',
        status: 'active', // ✅ Será convertido para enum
        typeProfile: 'INFO',
      },
      {
        email: 'profissional.pro@test.com',
        name: 'Dra. Maria Santos',
        plan: 'PROFESSIONAL',
        status: 'active', // ✅ Será convertido para enum
        typeProfile: 'TOTAL',
      },
    ];

    for (const userData of testUsers) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: 'PROFESSIONAL',
          status: true,
          professionId: testProfession.id,
          typeProfile: userData.typeProfile as any,
          emailVerified: new Date(),
        },
      });

      // Criar subscription
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          stripeCustomerId: `cus_test_${user.id}`,
          stripeSubscriptionId: `sub_test_${user.id}`,
          plan: userData.plan as any,
          status: 'active', // ✅ String literal que corresponde ao enum
          stripePriceId: userData.plan === 'PROFESSIONAL' ? 'price_test_pro' : 'price_test_free',
        },
      });
    }

    console.log('✅ Usuários de teste criados');
  }

  // 4. Criar landing page padrão
  await prisma.landingPage.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      heroTitle: 'Encontre os melhores profissionais em um único local!',
      heroSubtitle: 'Nós somos uma plataforma para profissionais da saúde com foco em agilizar seu atendimento de forma simplificada e organizada.',
    },
  });

  console.log('✅ Landing page criada');

  console.log('🎉 Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });