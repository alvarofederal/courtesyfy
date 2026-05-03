import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { ConfiguracoesForm } from "./_components/configuracoes-form"
import { TotemLinkCard } from "./_components/totem-link-card"

const PLANO_LABELS = {
  ESSENCIAL:     { label: "Essencial",     className: "bg-gray-100 text-gray-600" },
  PROFISSIONAL:  { label: "Profissional",  className: "bg-blue-50 text-blue-600" },
  EMPRESARIAL:   { label: "Empresarial",   className: "bg-emerald-50 text-emerald-700" },
} as const

export default async function ConfiguracoesPage() {
  const session = await auth()
  if (!session?.user?.lojaId) redirect("/login")

  const loja = await db.loja.findUnique({
    where: { id: session.user.lojaId! },
    select: {
      nome: true,
      nomeExibicao: true,
      email: true,
      telefone: true,
      cnpjCpf: true,
      logradouro: true,
      numero: true,
      complemento: true,
      bairro: true,
      cidade: true,
      estado: true,
      cep: true,
      siteUrl: true,
      logoUrl: true,
      corPrimaria: true,
      plano: true,
      status: true,
      criadoEm: true,
    },
  })

  if (!loja) redirect("/onboarding/loja")

  const planoCfg = PLANO_LABELS[loja.plano]

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 text-sm mt-0.5">Dados e identidade visual da sua loja</p>
      </div>

      {/* Plano atual */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Plano atual</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Loja criada em {new Date(loja.criadoEm).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <span className={`text-sm font-semibold px-3 py-1.5 rounded-full flex-shrink-0 ${planoCfg.className}`}>
          {planoCfg.label}
        </span>
      </div>

      {/* Link do Totem */}
      <TotemLinkCard lojaId={session.user.lojaId!} />

      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <ConfiguracoesForm loja={loja} />
      </div>
    </div>
  )
}
