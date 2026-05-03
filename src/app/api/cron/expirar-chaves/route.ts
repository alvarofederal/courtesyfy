import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"

// Chamado pelo Vercel Cron ou qualquer agendador externo.
// Protegido por CRON_SECRET para evitar execuções não autorizadas.
export async function GET(request: Request) {
  const secret = request.headers.get("x-cron-secret")
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const agora = new Date()

  // 1. Expirar chaves cujas campanhas já venceram
  const { count: chavesExpiradas } = await db.chave.updateMany({
    where: {
      status: { in: ["GERADA", "CONSULTADA", "ATIVADA"] },
      campanha: { expiraEm: { lt: agora } },
    },
    data: { status: "EXPIRADA" },
  })

  // 2. Encerrar campanhas vencidas que ainda estão ATIVA ou PAUSADA
  const { count: campanhasEncerradas } = await db.campanha.updateMany({
    where: {
      status: { in: ["ATIVA", "PAUSADA"] },
      expiraEm: { lt: agora },
    },
    data: { status: "ENCERRADA" },
  })

  // 3. Registrar log de expiração (um log por campanha encerrada, se necessário)
  // Evitamos N logs individuais por chave — apenas contamos

  console.log(
    `[cron/expirar-chaves] ${chavesExpiradas} chaves expiradas, ${campanhasEncerradas} campanhas encerradas`,
  )

  return NextResponse.json({
    ok: true,
    chavesExpiradas,
    campanhasEncerradas,
    executadoEm: agora.toISOString(),
  })
}
