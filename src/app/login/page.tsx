// src/app/login/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "./_components/login-form"
import { Footer } from "../(public)/_components/footer"
import { Header } from "../(public)/_components/header"

export default async function LoginPage() {
  const session = await auth()
  
  // ✅ Se está logado, redireciona
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Bem-vindo de volta</h1>
            <p className="text-gray-600 mt-2">Entre na sua conta</p>
          </div>
          <LoginForm />
        </div>
      </div>
      <Footer />
    </div>
  )
}