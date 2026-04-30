// /dashboard/courtesies/eligibles
// Lista de profissionais elegiveis a cortesia condicional (vindos das landings).

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { expireStaleEligibilities } from "@/lib/courtesy-eligibility"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EligibleRow } from "./_components/eligible-row"
import { ResendEmailButton } from "./_components/resend-email-button"

export const dynamic = "force-dynamic"

export default async function EligiblesPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Lazy expire antes de listar — sem cron
  await expireStaleEligibilities()

  const [eligible, recent, auditLogs] = await Promise.all([
    prisma.courtesyEligibility.findMany({
      where: { status: "ELIGIBLE" },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { firstAppointmentAt: "desc" },
    }),
    prisma.courtesyEligibility.findMany({
      where: { status: { in: ["APPROVED", "REJECTED", "EXPIRED"] } },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }).then(async (rows) => {
      // Enriquecer com dados da chave + admin que aprovou + status do email
      const enriched = await Promise.all(rows.map(async (r) => {
        const key = r.courtesyKeyId
          ? await prisma.courtesyKey.findUnique({
              where: { id: r.courtesyKeyId },
              select: { code: true, validUntil: true, batchId: true, redeemedAt: true, redeemedByUserId: true },
            })
          : null
        const approver = r.approvedByUserId
          ? await prisma.user.findUnique({
              where: { id: r.approvedByUserId },
              select: { name: true, email: true },
            })
          : null
        // Pega o ultimo evento de email pra essa eligibility
        const lastEmailLog = await prisma.courtesyAuditLog.findFirst({
          where: {
            eligibilityId: r.id,
            event: { in: ["approval.email_sent", "approval.email_failed"] },
          },
          orderBy: { createdAt: "desc" },
          select: { event: true, message: true, createdAt: true },
        })
        return { ...r, key, approver, lastEmailLog }
      }))
      return enriched
    }),
    prisma.courtesyAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/courtesies" className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline mb-2">
            <ArrowLeft className="h-4 w-4" /> Voltar para Cortesias
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-emerald-600" />
            Cortesias Elegíveis
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Profissionais que vieram das landings, cadastraram e receberam o 1º agendamento público em até 48h.
          </p>
        </div>
      </div>

      <Card className="border-emerald-200">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardTitle className="text-lg flex items-center gap-2">
            Aguardando aprovação
            <span className="ml-2 inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-red-500 text-white text-xs font-bold">
              {eligible.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {eligible.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhum profissional elegível no momento.</p>
              <p className="text-sm mt-1">Quando alguém cumprir o desafio, aparece aqui.</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {eligible.map((e) => (
                <EligibleRow
                  key={e.id}
                  id={e.id}
                  name={e.user?.name ?? null}
                  email={e.email ?? e.user?.email ?? ""}
                  image={e.user?.image ?? null}
                  landing={e.landing}
                  cta={e.cta}
                  registeredAt={e.registeredAt.toISOString()}
                  firstAppointmentAt={e.firstAppointmentAt?.toISOString() ?? null}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trilha de auditoria — debug e visibilidade total do fluxo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-700">
            Trilha de auditoria (últimos 50 eventos)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {auditLogs.length === 0 ? (
            <p className="text-sm text-gray-500">Sem eventos registrados ainda.</p>
          ) : (
            <div className="space-y-1 max-h-[600px] overflow-y-auto font-mono text-xs">
              {auditLogs.map((log) => {
                const isError =
                  log.event === "approval.email_failed" ||
                  log.event === "eligibility.expired"
                const isSuccess =
                  log.event === "approval.email_sent" ||
                  log.event === "approval.completed" ||
                  log.event === "eligibility.first_appointment" ||
                  log.event === "eligibility.created" ||
                  log.event === "redemption.completed"
                return (
                  <div
                    key={log.id}
                    className={
                      "p-2 rounded border " +
                      (isError
                        ? "bg-red-50 border-red-200"
                        : isSuccess
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-gray-50 border-gray-200")
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold">{log.event}</span>
                      <span className="text-gray-500">
                        {log.createdAt.toLocaleString("pt-BR")}
                      </span>
                    </div>
                    {log.email && (
                      <div className="text-gray-700">📧 {log.email}</div>
                    )}
                    {log.message && (
                      <div className="text-gray-800 break-words">{log.message}</div>
                    )}
                    {log.payload != null && (
                      <pre className="text-[10px] text-gray-600 whitespace-pre-wrap break-all mt-1">
                        {JSON.stringify(log.payload, null, 0)}
                      </pre>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico curto */}
      {recent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-700">Histórico recente</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{r.user?.name || r.user?.email || r.email || "(usuário removido)"}</div>
                    <div className="text-xs text-gray-500">
                      {r.landing}
                      {r.cta ? ` · ${r.cta}` : ""}
                      {r.rejectedReason ? ` · "${r.rejectedReason}"` : ""}
                    </div>
                  </div>
                  {r.status === "APPROVED" && (
                    <ResendEmailButton eligibilityId={r.id} />
                  )}
                  <span
                    className={
                      "text-xs font-semibold px-2 py-0.5 rounded " +
                      (r.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-800"
                        : r.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-700")
                    }
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
