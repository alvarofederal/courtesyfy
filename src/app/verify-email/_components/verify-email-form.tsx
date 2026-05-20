// src/app/verify-email/_components/verify-email-form.tsx - COMPLETO CORRIGIDO
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, Mail, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface VerifyEmailFormProps {
  initialEmail?: string
}

export function VerifyEmailForm({ initialEmail }: VerifyEmailFormProps) {
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [formData, setFormData] = useState({
    email: initialEmail || "", // ✅ CORRIGIDO
    code: "",
  })

  // ✅ Calcular countdown baseado no expiresAt real
  useEffect(() => {
    const calculateCountdown = () => {
      const expiryString = localStorage.getItem('verificationExpiry')
      if (!expiryString) {
        setCountdown(0)
        return
      }

      const expiryTime = new Date(expiryString).getTime()
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000))
      
      setCountdown(remaining)
    }

    calculateCountdown()
    const interval = setInterval(calculateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  // ✅ Atualizar email do localStorage se não vier da prop
  useEffect(() => {
    if (!initialEmail) { // ✅ CORRIGIDO
      const savedEmail = localStorage.getItem('verificationEmail')
      if (savedEmail) {
        setFormData(prev => ({ ...prev, email: savedEmail }))
      }
    }
  }, [initialEmail]) // ✅ CORRIGIDO

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.code.length !== 6) {
      toast.error("O código deve ter 6 dígitos")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          code: formData.code,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Código inválido")
        setLoading(false)
        return
      }

      localStorage.removeItem('verificationExpiry')
      localStorage.removeItem('verificationEmail')

      toast.success("Email verificado com sucesso!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-600" />
      })
      
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (error) {
      toast.error("Erro ao verificar email")
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || !formData.email) return

    setResendLoading(true)

    try {
      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Erro ao reenviar código")
        setResendLoading(false)
        return
      }

      if (data.expiresAt) {
        localStorage.setItem('verificationExpiry', data.expiresAt)
      }

      toast.success("Código reenviado! Verifique seu email.")
      setResendLoading(false)
      setFormData(prev => ({ ...prev, code: "" }))
    } catch (error) {
      toast.error("Erro ao reenviar código")
      setResendLoading(false)
    }
  }

  const canResend = countdown === 0

  return (
    <div className="space-y-6">
      {/* Link voltar */}
      <div>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar ao início
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
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
              readOnly={!!initialEmail} // ✅ CORRIGIDO
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 pl-10 bg-gray-50 border-emerald-200"
            />
          </div>
        </div>

        {/* Código */}
        <div>
          <Label htmlFor="code" className="text-sm font-semibold text-gray-700">
            Código de 6 dígitos
          </Label>
          <Input
            id="code"
            type="text"
            required
            maxLength={6}
            pattern="[0-9]{6}"
            value={formData.code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "")
              setFormData({ ...formData, code: value })
            }}
            placeholder="000000"
            className="h-12 text-center text-2xl font-bold tracking-widest border-emerald-200 focus:border-emerald-500"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-2">
            {countdown > 0
              ? countdown >= 60
                ? `Código expira em ${Math.floor(countdown / 60)}min ${countdown % 60}s`
                : `Código expira em ${countdown}s`
              : "Código expirado — solicite um novo"
            }
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading || formData.code.length !== 6}
          className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-base font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Verificar Email
            </>
          )}
        </Button>
      </form>

      {/* Reenviar */}
      <div className="text-center pt-4 border-t">
        <p className="text-sm text-gray-600 mb-3">
          Não recebeu o código?
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={!canResend || resendLoading}
          onClick={handleResend}
          className="border-emerald-300 hover:bg-emerald-50 text-emerald-700"
        >
          {resendLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Reenviando...
            </>
          ) : canResend ? (
            "Reenviar Código"
          ) : countdown >= 60 ? (
            `Reenviar em ${Math.floor(countdown / 60)}min ${countdown % 60}s`
          ) : (
            `Reenviar em ${countdown}s`
          )}
        </Button>
      </div>
    </div>
  )
}