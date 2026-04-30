import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ pending: 0 }, { status: 401 })
    }

    if (session.user.role === "ADMIN") {
      const pending = await prisma.supportTicket.count({
        where: { status: "OPEN" },
      })
      return NextResponse.json({ pending })
    }

    const pending = await prisma.supportTicket.count({
      where: {
        userId: session.user.id,
        status: "WAITING_USER",
      },
    })

    return NextResponse.json({ pending })
  } catch (error) {
    console.error("Erro ao contar chamados:", error)
    return NextResponse.json({ pending: 0 })
  }
}
