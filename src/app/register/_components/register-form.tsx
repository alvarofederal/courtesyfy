// src/app/register/_components/register-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, Chrome } from "lucide-react"
import { toast } from "sonner"
import { signIn } from "next-auth/react"
import { Separator } from "@radix-ui/react-select"
import Link from "next/link"
import { consumeLandingSource, clearLandingSource } from "@/lib/tracking-client"

export function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres")
      return
    }

    setLoading(true)

    try {

    const source = consumeLandingSource()
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (source) {
      headers["x-landing-source"] = JSON.stringify({
        landing: source.landing,
        cta: source.cta ?? null,
      })
    }

    const response = await fetch("/api/register", {
        method: "POST",
        headers,
        body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword, // ✅ ADICIONAR
        }),
    })

        const data = await response.json()

        if (!response.ok) {
            toast.error(data.error || "Erro ao criar conta")
            setLoading(false)
            return
        }

        // ✅ Salvar no localStorage
        if (data.expiresAt) {
          localStorage.setItem('verificationExpiry', data.expiresAt)
          localStorage.setItem('verificationEmail', formData.email)
        }

        toast.success("Conta criada! Verifique seu email.")

        // Origem ja foi consumida e enviada via header pro backend criar
        // CourtesyEligibility + TrackingEvent. Limpa garantindo nao reusar.
        clearLandingSource()

        // Redirecionar para verificação
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
    } catch (error) {
      toast.error("Erro ao criar conta")
      setLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setGoogleLoading(true)
    // Persiste a origem em cookie pro callback do Google capturar e criar
    // CourtesyEligibility apos OAuth completar.
    const source = consumeLandingSource()
    if (source) {
      document.cookie = `bm_landing_source=${encodeURIComponent(
        JSON.stringify({ landing: source.landing, cta: source.cta ?? null })
      )}; path=/; max-age=600; samesite=lax`
    }
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="space-y-6">
      {/* Cadastro com Google */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 border-2 border-gray-300 hover:border-emerald-400 hover:bg-emerald-50"
        onClick={handleGoogleRegister}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Chrome className="h-5 w-5 mr-2" />
            Cadastrar com Google
          </>
        )}
      </Button>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
          OU
        </span>
      </div>

      {/* Cadastro Manual */}
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
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="h-12 pl-10 border-emerald-200 focus:border-emerald-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
            Confirmar Senha
          </Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
              Criando conta...
            </>
          ) : (
            "Criar Conta"
          )}
        </Button>
      </form>
      <div className="text-center text-sm text-gray-600">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
          Entrar aqui
        </Link>
      </div>
    </div>
  )
}