// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({ professionals: [] });
    }

    // Buscar profissionais por nome, especialidade ou endereço
    const professionals = await prisma.user.findMany({
      where: {
        AND: [
          { status: true }, // Apenas ativos
          {
            OR: [
              // ✅ Buscar por nome (SEM mode)
              { 
                name: { 
                  contains: query
                } 
              },
              // ✅ Buscar por especialidade (SEM mode)
              { 
                specialty: { 
                  contains: query
                } 
              },
              // ✅ Buscar por endereço (SEM mode)
              {
                addresses: {
                  some: {
                    address: {
                      contains: query
                    }
                  }
                }
              },
              // ✅ Buscar por profissão (SEM mode)
              {
                profession: {
                  name: {
                    contains: query
                  }
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        urlNameProfessional: true,
        image: true,
        specialty: true,
        presentation: true,
        profession: {
          select: {
            name: true
          }
        },
        addresses: {
          select: {
            address: true
          },
          take: 1
        }
      },
      take: 50, // Limitar a 50 resultados
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ 
      professionals,
      total: professionals.length,
      query 
    });
  } catch (error) {
    console.error('Erro na busca:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar profissionais' },
      { status: 500 }
    );
  }
}