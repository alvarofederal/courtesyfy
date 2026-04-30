import prisma from "@/lib/prisma";

/**
 * Gera um slug URL-friendly baseado no nome do usuário
 */
function generateSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function generateUniqueSlug(name: string): Promise<string> {
  let slug = generateSlug(name);
  let counter = 1;

  while (true) {
    const exists = await prisma.user.findFirst({
      where: { urlNameProfessional: slug },
      select: { id: true }
    });

    if (!exists) {
      return slug;
    }

    slug = `${generateSlug(name)}-${counter}`;
    counter++;

    if (counter > 999) {
      throw new Error(`Não foi possível gerar slug único para: ${name}`);
    }
  }
}

async function populateSlugsForExistingUsers() {
  console.log('🔄 Iniciando população de slugs...\n');

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { urlNameProfessional: null },
          { urlNameProfessional: '' }
        ]
      },
      select: {
        id: true,
        name: true,
        urlNameProfessional: true
      }
    });

    console.log(`📊 Encontrados ${users.length} usuários sem slug\n`);

    let success = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        if (!user.name) {
          console.log(`⚠️  Usuário ${user.id} sem nome, pulando...`);
          skipped++;
          continue;
        }

        const slug = await generateUniqueSlug(user.name);

        await prisma.user.update({
          where: { id: user.id },
          data: { urlNameProfessional: slug }
        });

        console.log(`✅ ${user.name.padEnd(30)} → ${slug}`);
        success++;

      } catch (error) {
        console.error(`❌ Erro ao atualizar ${user.name}:`, error);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Sucesso: ${success}`);
    console.log(`⚠️  Pulados: ${skipped}`);
    console.log('🎉 População de slugs concluída!');

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    throw error;
  }
}

populateSlugsForExistingUsers()
  .then(() => {
    console.log('\n✨ Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });