import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, cpf, registro, locations, attendance, specialtyId } = body

    // ✅ Validar dados
    if (!name || !cpf || !specialtyId) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      )
    }

    // ✅ Criar specialist com relações
    const specialist = await prisma.specialist.create({
      data: {
        name,
        cpf,
        registro,
        specialtyId,
        // ✅ Criar locations relacionados
        ...(locations && Array.isArray(locations) && locations.length > 0 && {
          locations: {
            create: locations.map((location: string) => ({
              location: location,
            })),
          }
        }),
        // ✅ Criar attendances relacionados
        ...(attendance && Array.isArray(attendance) && attendance.length > 0 && {
          attendances: {
            create: attendance.map((att: string) => ({
              attendance: att,
            })),
          }
        }),
      },
      include: {
        specialty: true,
        locations: true,
        attendances: true,
      }
    })

    return NextResponse.json(specialist, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar especialista:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const specialists = await prisma.specialist.findMany({
      include: {
        specialty: true,
        locations: true,      // ✅ Incluir locations
        attendances: true,    // ✅ Incluir attendances
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(specialists)
  } catch (error) {
    console.error("Erro ao buscar especialistas:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}