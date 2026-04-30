// src/app/(public)/_data_access/get-landing-content.ts
import prisma from "@/lib/prisma";

export async function getLandingContent() {
  try {
    const content = await prisma.landingPage.findFirst({
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return {
      heroTitle: content?.heroTitle || "Encontre os melhores profissionais em um único local!",
      heroSubtitle: content?.heroSubtitle || "Nós somos uma plataforma para profissionais da saúde com foco em agilizar seu atendimento de forma simplificada e organizada.",
      heroImage: content?.heroImage && content.heroImage.trim() !== "" ? content.heroImage : null,
    };
  } catch (error) {
    console.error('Erro ao buscar conteúdo da landing page:', error);
    return {
      heroTitle: "Encontre os melhores profissionais em um único local!",
      heroSubtitle: "Nós somos uma plataforma para profissionais da saúde com foco em agilizar seu atendimento de forma simplificada e organizada.",
      heroImage: null,
    };
  }
}