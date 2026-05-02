"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, Chrome } from "lucide-react"
import { toast } from "sonner"
import { signIn } from "next-auth/react"
import Link from "next/link"

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

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (formData.password.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Erro ao criar conta")
        setLoading(false)
        return
      }

      if (data.devAutoVerified) {
        toast.success("Conta criada! Redirecionando...")
        router.push("/login")
        return
      }

      if (data.expiresAt) {
        localStorage.setItem("verificationExpiry", data.expiresAt)
        localStorage.setItem("verificationEmail", formData.email)
      }

      toast.success("Conta criada! Verifique seu email.")
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
    } catch {
      toast.error("Erro ao criar conta")
      setLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setGoogleLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleRegister}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Chrome className="h-4 w-4 mr-2" />
            Cadastrar com Google
          </>
        )}
      </Button>

      <div className="relative text-center text-xs text-muted-foreground">
        <span className="bg-background px-2">OU</span>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu@email.com"
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Mín. 8 caracteres, com maiúscula, número e símbolo</p>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              className="pl-9"
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando conta...
            </>
          ) : (
            "Criar Conta"
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-foreground font-semibold hover:underline">
          Entrar aqui
        </Link>
      </div>
    </div>
  )
}
