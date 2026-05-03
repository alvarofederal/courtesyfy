import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { RegisterForm } from "./_components/register-form"

export default async function RegisterPage() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Criar conta</h1>
          <p className="text-gray-600 mt-2">Comece a usar o Courtesyfy</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
