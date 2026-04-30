"use client"

// Formulario de resgate. Reusa as Server Actions ja existentes
// (previewCourtesyKey, redeemCourtesyKey) — zero logica nova de negocio.
// So a UI standalone, espelhando a aba "Já tenho uma chave" do
// CourtesyInfoModal mas como pagina dedicada.

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import { Loader2, Key, Sparkles, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { normalizeKeyInput } from "@/utils/courtesy/generate-key"
import {
  previewCourtesyKey,
  redeemCourtesyKey,
} from "../../_actions/redeem-courtesy-key"

export function RedeemForm() {
  const router = useRouter()
  const [keyInput, setKeyInput] = useState("")
  const [preview, setPreview] = useState<{ validUntil: Date } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handlePreview() {
    startTransition(async () => {
      const response = await previewCourtesyKey({ code: keyInput })
      if (response.error || !response.validUntil) {
        toast.error(response.error ?? "Chave inválida ou já utilizada")
        setPreview(null)
        return
      }
      setPreview({ validUntil: response.validUntil })
    })
  }

  function handleRedeem() {
    startTransition(async () => {
      const response = await redeemCourtesyKey({ code: keyInput })
      if (response.error) {
        toast.error(response.error)
        return
      }
      confetti({
        particleCount: 180,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#10b981", "#14b8a6", "#059669", "#0d9488"],
      })
      toast.success("Cortesia ativada com sucesso! ✨")
      // pequena pausa pra ver o confete antes de navegar
      setTimeout(() => router.push("/dashboard"), 1200)
    })
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <p className="text-sm text-emerald-900">
          A chave tem 16 caracteres no formato{" "}
          <span className="font-mono font-semibold">XXXX-XXXX-XXXX-XXXX</span>.
          Você recebeu por email após cumprir o desafio da cortesia condicional.
        </p>
      </div>

      <Input
        placeholder="XXXX-XXXX-XXXX-XXXX"
        value={keyInput}
        onChange={(e) => {
          setKeyInput(normalizeKeyInput(e.target.value))
          setPreview(null)
        }}
        className="font-mono text-center tracking-widest text-lg h-14 focus:ring-2 focus:ring-emerald-500"
        maxLength={19}
        disabled={isPending}
      />

      {preview && (
        <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-emerald-300">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-600">Chave válida — sua cortesia será ativada até</p>
            <p className="text-lg font-bold text-emerald-700">
              {format(new Date(preview.validUntil), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
      )}

      {!preview ? (
        <Button
          onClick={handlePreview}
          disabled={isPending || keyInput.length < 19}
          className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-base font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verificando...
            </>
          ) : (
            <>
              <Key className="w-4 h-4 mr-2" /> Verificar chave
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={handleRedeem}
          disabled={isPending}
          className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-base font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Ativando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" /> Resgatar cortesia
            </>
          )}
        </Button>
      )}

      <p className="text-xs text-gray-500 text-center pt-2">
        Limite de 5 tentativas por hora. Não sabe onde achou seu código? Veja
        seu email da Basemedical.
      </p>
    </div>
  )
}
