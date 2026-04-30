import prisma from "../src/lib/prisma";

async function checkContent() {
  console.log("🔍 Verificando conteúdo da landing page...\n");

  const content = await prisma.landingPage.findFirst(); // ✅ Corrigido

  if (!content) {
    console.log("❌ Nenhum conteúdo encontrado no banco");
    return;
  }

  console.log("✅ Conteúdo encontrado:");
  console.log(JSON.stringify(content, null, 2));
}

checkContent()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());