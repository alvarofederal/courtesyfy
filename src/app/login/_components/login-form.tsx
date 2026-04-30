// src/app/login/_components/login-form.tsx - ARQUIVO COMPLETO
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, Chrome } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // ✅ LOGIN MANUAL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login-and-redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.code === "EMAIL_NOT_VERIFIED") {
          toast.error("Email não verificado", {
            description: "Verifique sua caixa de entrada.",
            action: {
              label: "Reenviar código",
              onClick: () => window.location.href = `/verify-email?email=${encodeURIComponent(formData.email)}`
            }
          })
        } else {
          toast.error(data.error || "Email ou senha incorretos")
        }
        setLoading(false)
        return
      }

      toast.success("Login realizado!")
      window.location.href = data.redirectTo

    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro ao fazer login")
      setLoading(false)
    }
  }

  // ✅ LOGIN GOOGLE - SEM REDIRECT, deixar NextAuth decidir
  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      // Simplesmente fazer login, NextAuth vai criar sessão e redirecionar
      await signIn("google", { 
        callbackUrl: "/dashboard",
        redirect: true 
      })
    } catch (error) {
      console.error("Erro no login Google:", error)
      toast.error("Erro ao fazer login com Google")
      setGoogleLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 border-2 border-gray-300 hover:border-emerald-400 hover:bg-emerald-50"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Chrome className="h-5 w-5 mr-2" />
            Continuar com Google
          </>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">OU</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
            Email
          </Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu@email.com"
              className="h-12 pl-10 border-emerald-200 focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
            Senha
          </Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="h-12 pl-10 border-emerald-200 focus:border-emerald-500"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-base font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-600">
        Ainda não tem uma conta?{" "}
        <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold">
          Cadastre-se aqui
        </Link>
      </div>
    </div>
  )
}