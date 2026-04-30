"use server"

import prisma from "@/lib/prisma";
import { generateSlug, isSlugBasedOnName, isValidSlug } from "@/utils/slug/generateSlug";

interface CheckSlugResult {
  available: boolean;
  error?: string;
  suggestion?: string;
}

export async function checkSlugAvailability(
  slug: string,
  userName: string,
  currentUserId?: string
): Promise<CheckSlugResult> {
  
  // 1. Validar formato
  if (!isValidSlug(slug)) {
    return {
      available: false,
      error: "O slug deve conter apenas letras minúsculas e hífens, com pelo menos 3 caracteres",
      suggestion: generateSlug(userName)
    };
  }

  // 2. Validar se é baseado no nome
  if (!isSlugBasedOnName(slug, userName)) {
    return {
      available: false,
      error: "O slug deve ser baseado no seu nome",
      suggestion: generateSlug(userName)
    };
  }

  // 3. Verificar se já existe (exceto para o próprio usuário)
  const existingUser = await prisma.user.findFirst({
    where: {
      urlNameProfessional: slug,
      ...(currentUserId && { id: { not: currentUserId } })
    },
    select: { id: true }
  });

  if (existingUser) {
    // Sugerir alternativa com número
    const suggestion = await generateUniqueSlug(slug);
    return {
      available: false,
      error: "Este slug já está em uso",
      suggestion
    };
  }

  return { available: true };
}

/**
 * Gera um slug único adicionando números se necessário
 */
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let counter = 1;
  let slug = baseSlug;

  while (true) {
    const exists = await prisma.user.findFirst({
      where: { urlNameProfessional: slug },
      select: { id: true }
    });

    if (!exists) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;

    // Limite de segurança
    if (counter > 100) {
      return `${baseSlug}-${Date.now()}`;
    }
  }
}