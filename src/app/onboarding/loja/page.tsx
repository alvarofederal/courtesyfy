import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { LojaForm } from "./_components/loja-form"
import { Store } from "lucide-react"

export default async function OnboardingLojaPage() {
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (session.user.lojaId) redirect("/dashboard")

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-full mb-4">
            <Store className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Configure sua loja</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Antes de criar campanhas, precisamos das informações básicas da sua loja.
          </p>
        </div>

        <LojaForm />
      </div>
    </div>
  )
}
