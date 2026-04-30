import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
export const dynamic = 'force-dynamic';  // Força runtime dinâmico pra essa rota

export async function GET() {
  try {
    const professions = await prisma.profession.findMany({
      where: {
        status: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(professions)
  } catch (error) {
    console.error("Erro ao buscar profissões:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, status } = body

    const profession = await prisma.profession.create({
      data: {
        name,
        description,
        status: status ?? true,
      },
    })

    return NextResponse.json(profession, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar profissão:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID da profissão é obrigatório" },
        { status: 400 }
      )
    }

    await prisma.profession.update({
      where: { id },
      data: { status: false },
    })

    return NextResponse.json({ message: "Profissão excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir profissão:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}


