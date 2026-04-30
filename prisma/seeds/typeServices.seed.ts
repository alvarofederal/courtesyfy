// prisma/seeds/typeServices.seed.ts

import { PrismaClient } from "@/generated/prisma"

const prisma = new PrismaClient()

export async function seedTypeServices() {
  console.log('🌱 Seeding TypeServices...')

  const typeServices = [
    {
      id: 'acompanhamento',
      name: 'Acompanhamento',
      description: 'Acompanhamento clínico / terapêutico / periódico / remoto',
      duration: 30,
      status: true
    },
    {
      id: 'aconselhamento',
      name: 'Aconselhamento',
      description: 'Aconselhamento individual / familiar / em saúde',
      duration: 40,
      status: true
    },
    {
      id: 'anamnese',
      name: 'Anamnese',
      description: 'Anamnese inicial / complementar / dirigida',
      duration: 30,
      status: true
    },
    {
      id: 'atendimento',
      name: 'Atendimento',
      description: 'Atendimento ambulatorial / domiciliar / hospitalar / remoto',
      duration: 30,
      status: true
    },
    {
      id: 'avaliacao',
      name: 'Avaliação',
      description: 'Avaliação clínica / funcional / psicológica / nutricional',
      duration: 40,
      status: true
    },
    {
      id: 'consulta',
      name: 'Consulta',
      description: 'Consulta inicial / de seguimento / preventiva',
      duration: 40,
      status: true
    },
    {
      id: 'estimulacao',
      name: 'Estimulação',
      description: 'Estimulação cognitiva / motora / sensorial',
      duration: 40,
      status: true
    },
    {
      id: 'exame-clinico',
      name: 'Exame clínico',
      description: 'Exame físico / funcional / preventivo',
      duration: 20,
      status: true
    },
    {
      id: 'habilitacao',
      name: 'Habilitação',
      description: 'Habilitação funcional / motora / cognitiva',
      duration: 40,
      status: true
    },
    {
      id: 'orientacao',
      name: 'Orientação',
      description: 'Orientação clínica / familiar / em saúde',
      duration: 20,
      status: true
    },
    {
      id: 'planejamento',
      name: 'Planejamento',
      description: 'Planejamento terapêutico / de cuidados / de tratamento',
      duration: 30,
      status: true
    },
    {
      id: 'procedimento',
      name: 'Procedimento',
      description: 'Procedimento ambulatorial / técnico / terapêutico',
      duration: 30,
      status: true
    },
    {
      id: 'sessao',
      name: 'Sessão',
      description: 'Sessão terapêutica / de estimulação / de acompanhamento',
      duration: 50,
      status: true
    },
    {
      id: 'teleconsulta',
      name: 'Teleconsulta',
      description: 'Teleconsulta inicial / de retorno / de orientação',
      duration: 30,
      status: true
    },
    {
      id: 'terapia',
      name: 'Terapia',
      description: 'Terapia individual / em grupo / intensiva',
      duration: 50,
      status: true
    },
    {
      id: 'triagem',
      name: 'Triagem',
      description: 'Triagem clínica / de risco / funcional',
      duration: 15,
      status: true
    },
    {
      id: 'tratamento',
      name: 'Tratamento',
      description: 'Tratamento clínico / terapêutico / contínuo',
      duration: 40,
      status: true
    },
    {
      id: 'reabilitacao',
      name: 'Reabilitação',
      description: 'Reabilitação física / funcional / cognitiva',
      duration: 50,
      status: true
    },
    {
      id: 'reavaliacao',
      name: 'Reavaliação',
      description: 'Reavaliação clínica / funcional / periódica',
      duration: 30,
      status: true
    },
    {
      id: 'retorno',
      name: 'Retorno',
      description: 'Retorno clínico / terapêutico / de acompanhamento',
      duration: 20,
      status: true
    },
    {
      id: 'revisao',
      name: 'Revisão',
      description: 'Revisão de tratamento / terapêutica / de plano de cuidados',
      duration: 20,
      status: true
    }
  ]

  for (const typeService of typeServices) {
    await prisma.typeService.upsert({
      where: { id: typeService.id },
      update: typeService,
      create: typeService
    })
  }

  console.log(`✅ ${typeServices.length} TypeServices criados/atualizados`)
}

// Se executar diretamente
if (require.main === module) {
  seedTypeServices()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}