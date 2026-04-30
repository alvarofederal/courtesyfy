"use server"

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateSlug, isSlugBasedOnName, isValidSlug } from "@/utils/slug/generateSlug";
import { revalidatePath } from "next/cache";

interface UpdateSlugResult {
  success: boolean;
  error?: string;
  newSlug?: string;
}

export async function updateUrlSlug(slug: string): Promise<UpdateSlugResult> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, urlNameProfessional: true }
    });

    if (!user || !user.name) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Normalizar slug
    const normalizedSlug = slug.toLowerCase().trim();

    // Validar formato
    if (!isValidSlug(normalizedSlug)) {
      return {
        success: false,
        error: "URL deve conter apenas letras minúsculas e hífens, com pelo menos 3 caracteres"
      };
    }

    // Validar se é baseado no nome
    if (!isSlugBasedOnName(normalizedSlug, user.name)) {
      return {
        success: false,
        error: "A URL personalizada deve ser baseada no seu nome"
      };
    }

    // Verificar se já existe (exceto o próprio usuário)
    const exists = await prisma.user.findFirst({
      where: {
        urlNameProfessional: normalizedSlug,
        id: { not: session.user.id }
      }
    });

    if (exists) {
      return {
        success: false,
        error: "Esta URL já está em uso. Tente adicionar um número ou variação."
      };
    }

    // Atualizar
    await prisma.user.update({
      where: { id: session.user.id },
      data: { urlNameProfessional: normalizedSlug }
    });

    revalidatePath('/perfil');
    
    return {
      success: true,
      newSlug: normalizedSlug
    };

  } catch (error) {
    console.error("Erro ao atualizar slug:", error);
    return {
      success: false,
      error: "Erro ao atualizar URL personalizada"
    };
  }
}

export async function generateSuggestedSlug(): Promise<string> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return "";
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true }
  });

  if (!user?.name) {
    return "";
  }

  return generateSlug(user.name);
}