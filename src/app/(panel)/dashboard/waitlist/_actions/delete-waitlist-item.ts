// src/app/dashboard/waitlist/_actions/delete-waitlist-item.ts
"use server"

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteWaitlistItem(itemId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Não autenticado" };
    }

    // Verificar se o item pertence ao profissional
    const item = await prisma.waitlist.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return { error: "Item não encontrado" };
    }

    if (item.professionalId !== session.user.id) {
      return { error: "Não autorizado" };
    }

    // Deletar
    await prisma.waitlist.delete({
      where: { id: itemId },
    });

    revalidatePath("/dashboard/waitlist");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar item da waitlist:", error);
    return { error: "Erro ao deletar item" };
  }
}