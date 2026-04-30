import { redirect } from "next/navigation"
import Link from "next/link"
import { Gift, Sparkles, KeyRound, CheckCircle2, Archive, ShieldAlert, ArrowRight } from "lucide-react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listKeys, listBatches } from "./_data_access/list-keys"
import { KeyGeneratorForm } from "./_components/key-generator-form"
import { KeysTable } from "./_components/keys-table"
import prisma from "@/lib/prisma"
import { expireStaleEligibilities } from "@/lib/courtesy-eligibility"

export default async function CourtesiesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard/profile")

  await expireStaleEligibilities()

  const [keys, batches, archivedKeys, eligibleCount] = await Promise.all([
    listKeys(),
    listBatches(),
    listKeys({ status: "archived" }),
    prisma.courtesyEligibility.count({ where: { status: "ELIGIBLE" } }),
  ])

  // `keys` já exclui arquivadas; somamos para ter o total geral.
  const total = keys.length + archivedKeys.length
  const active = keys.filter((k) => k.status === "generated" || k.status === "printed").length
  const printedUnused = keys.filter((k) => k.status === "printed").length
  const redeemed = keys.filter((k) => k.status === "redeemed").length
  const archived = archivedKeys.length

  const metrics = [
    {
      title: "Total de Chaves",
      value: total,
      icon: Gift,
      cardClass: "border-emerald-200 bg-white",
      iconClass: "text-emerald-600",
    },
    {
      title: "Ativas",
      value: active,
      icon: Sparkles,
      cardClass: "border-emerald-200 bg-emerald-50",
      iconClass: "text-emerald-700",
    },
    {
      title: "Impressas não resgatadas",
      value: printedUnused,
      icon: KeyRound,
      cardClass: "border-teal-200 bg-teal-50",
      iconClass: "text-teal-700",
    },
    {
      title: "Resgatadas",
      value: redeemed,
      icon: CheckCircle2,
      cardClass: "border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50",
      iconClass: "text-emerald-700",
    },
    {
      title: "Arquivadas",
      value: archived,
      icon: Archive,
      cardClass: "border-amber-200 bg-amber-50",
      iconClass: "text-amber-700",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto space-y-4 md:space-y-6">
        {/* Faixa Modo Administrador */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm px-4 py-3 rounded-lg flex items-center gap-2 shadow-md">
          <ShieldAlert className="w-5 h-5" />
          <div>
            <p className="font-semibold">Modo Administrador</p>
            <p className="text-xs text-purple-100">Você está gerenciando tipos de atendimento do sistema</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 md:mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Gift className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 shrink-0" />
              Cortesias
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Gere chaves únicas para cards físicos. Cada chave é anônima e intransferível.
            </p>
          </div>
        </div>

        {eligibleCount > 0 && (
          <Link
            href="/dashboard/courtesies/eligibles"
            className="block group rounded-xl border-2 border-red-300 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 p-4 md:p-5 mb-6 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                {eligibleCount}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">
                  {eligibleCount === 1
                    ? "1 profissional aguardando aprovação"
                    : `${eligibleCount} profissionais aguardando aprovação`}
                </p>
                <p className="text-sm text-gray-600">
                  Cumpriram o desafio da landing — clique para revisar e liberar 3 meses de cortesia.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </Link>
        )}

        <div className="grid gap-3 md:gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          {metrics.map((m) => (
            <Card key={m.title} className={`${m.cardClass} shadow-sm`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">{m.title}</CardTitle>
                <m.icon className={`h-5 w-5 ${m.iconClass}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{m.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <KeyGeneratorForm />
          <KeysTable keys={keys} batches={batches} />
        </div>
      </div>
    </div>
  )
}
