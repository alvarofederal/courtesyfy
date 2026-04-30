import prisma from "../src/lib/prisma";

async function seedLandingContent() {
  console.log("🌱 Criando conteúdo inicial da landing page...");

  const existing = await prisma.landingPage.findFirst();

  if (existing) {
    console.log("✅ Conteúdo já existe");
    return;
  }

  await prisma.landingPage.create({
    data: {
      heroTitle: "Encontre os melhores profissionais em um único local!",
      heroSubtitle: "Nós somos uma plataforma para profissionais da saúde com foco em agilizar seu atendimento de forma simplificada e organizada.",
    },
  });

  console.log("✅ Conteúdo criado com sucesso!");
}

seedLandingContent()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());