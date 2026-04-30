"use server"

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateSlug } from "@/utils/slug/generateSlug";
import { revalidatePath } from "next/cache";

export async function updateSlug(newSlug: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    // Normalizar slug
    const slug = generateSlug(newSlug);

    if (slug.length < 3) {
      return { success: false, error: "URL deve ter pelo menos 3 caracteres" };
    }

    // Verificar se já existe
    const exists = await prisma.user.findFirst({
      where: {
        urlNameProfessional: slug,
        id: { not: session.user.id }
      }
    });

    if (exists) {
      return { success: false, error: "Esta URL já está em uso" };
    }

    // Atualizar
    await prisma.user.update({
      where: { id: session.user.id },
      data: { urlNameProfessional: slug }
    });

    revalidatePath('/perfil');
    
    return { success: true, slug };

  } catch (error) {
    console.error("Erro ao atualizar slug:", error);
    return { success: false, error: "Erro ao atualizar URL" };
  }
}