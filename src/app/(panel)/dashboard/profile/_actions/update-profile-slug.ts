"use server"

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfileSlug(slug: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    // Normalizar slug
    const normalizedSlug = slug
      .toLowerCase()
      .replace(/[^a-z-]/g, '')
      .trim();

    if (normalizedSlug.length < 3) {
      return { 
        success: false, 
        error: "URL deve ter pelo menos 3 caracteres" 
      };
    }

    // Verificar se já existe
    const exists = await prisma.user.findFirst({
      where: {
        urlNameProfessional: normalizedSlug,
        id: { not: session.user.id }
      }
    });

    if (exists) {
      return {
        success: false,
        error: "Esta URL já está em uso. Tente outra variação."
      };
    }

    // Atualizar
    await prisma.user.update({
      where: { id: session.user.id },
      data: { urlNameProfessional: normalizedSlug }
    });

    revalidatePath('/profile');
    
    return {
      success: true,
      slug: normalizedSlug
    };

  } catch (error) {
    console.error("Erro ao atualizar slug:", error);
    return {
      success: false,
      error: "Erro ao atualizar URL"
    };
  }
}