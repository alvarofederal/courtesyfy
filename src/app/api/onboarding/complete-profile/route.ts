// src/app/api/onboarding/complete-profile/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      userId, 
      name, 
      cpf, 
      phone, 
      professionId, 
      specialty, 
      registration,
      typeServiceIds // 🔥 NOVO
    } = body

    // Validações
    if (!name || !cpf || !phone || !professionId || !registration) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      )
    }
    
    // 🔥 NOVO: Validar tipos de atendimento
    if (!typeServiceIds || !Array.isArray(typeServiceIds) || typeServiceIds.length === 0) {
      return NextResponse.json(
        { error: "Selecione pelo menos 1 tipo de atendimento" },
        { status: 400 }
      )
    }

    // Verificar se usuário é o mesmo da sessão
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      )
    }
    
    // Buscar subscription para validar limite
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }
    
    // 🔥 NOVO: Validar limite de tipos baseado no plano
    const plan = user.subscription?.plan || 'FREE'
    const maxTypeServices = plan === 'PROFESSIONAL' ? 5 : 1
    
    if (typeServiceIds.length > maxTypeServices) {
      return NextResponse.json(
        { error: `Plano ${plan} permite até ${maxTypeServices} tipo(s) de atendimento` },
        { status: 400 }
      )
    }

    // Atualizar dados do usuário
    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        cpf,
        phone,
        professionId,
        specialty: specialty || null,
        registration,
      }
    })
    
    // 🔥 NOVO: Salvar tipos de atendimento selecionados
    // 1. Remover tipos antigos (se houver)
    await prisma.userTypeService.deleteMany({
      where: { userId }
    })
    
    // 2. Criar novos registros
    await prisma.userTypeService.createMany({
      data: typeServiceIds.map((typeServiceId: string) => ({
        userId,
        typeServiceId,
        active: true
      }))
    })

    return NextResponse.json({ 
      success: true,
      message: "Cadastro completado com sucesso"
    })
    
  } catch (error) {
    console.error("❌ Erro ao completar cadastro:", error)
    return NextResponse.json(
      { error: "Erro ao completar cadastro" },
      { status: 500 }
    )
  }
}