import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { ChevronLeft } from "lucide-react"
import { LayoutForm } from "../_components/layout-form"
import { criarLayout } from "../_actions/layout-actions"

export default async function NovoLayoutPage() {
  const session = await auth()
  if (!session?.user?.lojaId) redirect("/login")

  const loja = await db.loja.findUnique({
    where: { id: session.user.lojaId },
    select: { nomeExibicao: true, nome: true },
  })

  return (
    <div>
      <Link
        href="/dashboard/layout"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Layouts
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Novo layout</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Configure cores e imagens para personalizar os cards impressos.
        </p>
      </div>

      <LayoutForm
        action={criarLayout}
        nomeLoja={loja?.nomeExibicao ?? loja?.nome ?? "Sua Loja"}
      />
    </div>
  )
}
