import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, status } = body

    const specialty = await prisma.specialty.create({
      data: {
        name,
        description,
        status: status ?? true,
      },
    })

    return NextResponse.json(specialty, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar especialidade:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const specialties = await prisma.specialty.findMany({
      where: {
        status: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(specialties)
  } catch (error) {
    console.error("Erro ao buscar especialidades:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
