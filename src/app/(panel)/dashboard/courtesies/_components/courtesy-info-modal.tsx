"use client"

import { useState, useTransition } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import { Gift, Sparkles, CheckCircle2, Loader2, Key } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { activateCourtesy } from "../_actions/courtesy-actions"
import {
  previewCourtesyKey,
  redeemCourtesyKey,
} from "../_actions/redeem-courtesy-key"
import { normalizeKeyInput } from "@/utils/courtesy/generate-key"

interface CourtesyInfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasActiveCourtesy: boolean
  expiresAt?: Date | string | null
  daysRemaining?: number
}

export function CourtesyInfoModal({
  open,
  onOpenChange,
  hasActiveCourtesy,
  expiresAt,
  daysRemaining,
}: CourtesyInfoModalProps) {
  const [message, setMessage] = useState("")
  const [keyInput, setKeyInput] = useState("")
  const [preview, setPreview] = useState<{ validUntil: Date } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isKeyPending, startKeyTransition] = useTransition()

  const formattedExpiry = expiresAt
    ? format(new Date(expiresAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null

  function handleSubmit() {
    startTransition(async () => {
      const response = await activateCourtesy({ message })
      if (response.error) {
        toast.error(response.error)
        return
      }
      toast.success(response.message ?? "Pedido registrado com sucesso!")
      setMessage("")
      onOpenChange(false)
    })
  }

  function handlePreview() {
    startKeyTransition(async () => {
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
    startKeyTransition(async () => {
      const response = await redeemCourtesyKey({ code: keyInput })
      if (response.error) {
        toast.error(response.error)
        return
      }
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } })
      toast.success("Cortesia ativada com sucesso! ✨")
      setKeyInput("")
      setPreview(null)
      onOpenChange(false)
    })
  }

  if (hasActiveCourtesy) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6 text-emerald-600" />
              Cortesia Ativa
            </DialogTitle>
            <DialogDescription>
              Você tem acesso completo como parceiro divulgador do Basemedical.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-100 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-emerald-900">
                  Todas as funcionalidades Profissionais liberadas
                </p>
                <p className="text-sm text-emerald-700">
                  Múltiplos endereços, 10 tipos de atendimento e mais.
                </p>
              </div>
            </div>

            {formattedExpiry && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Válida até</p>
                <p className="text-lg font-bold text-gray-900">{formattedExpiry}</p>
                {typeof daysRemaining === "number" && daysRemaining > 0 && (
                  <p className="text-sm text-emerald-600 font-medium mt-1">
                    {daysRemaining} {daysRemaining === 1 ? "dia restante" : "dias restantes"}
                  </p>
                )}
              </div>
            )}

            <p className="text-sm text-gray-600 text-center pt-2">
              Obrigado por divulgar o Basemedical! ✨
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[500px] h-[560px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Gift className="w-6 h-6 text-emerald-600" />
            Ganhe uma Cortesia
          </DialogTitle>
          <DialogDescription>
            Ajude a divulgar o Basemedical e receba acesso completo ao plano
            Profissional sem custo por um período.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="key" className="py-2 flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="key">
              <Key className="w-4 h-4 mr-2" /> Já tenho uma chave
            </TabsTrigger>
            <TabsTrigger value="request">
              <Gift className="w-4 h-4 mr-2" /> Solicitar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="space-y-4 pt-4 flex-1 overflow-y-auto">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-900">
                Conte como você pretende divulgar a plataforma (redes sociais,
                indicações a colegas, etc). Nossa equipe analisa e entra em contato.
              </p>
            </div>

            <Textarea
              placeholder="Ex: Sou dentista com 5 mil seguidores no Instagram e posso fazer um story apresentando a plataforma..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] focus:ring-2 focus:ring-emerald-500"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right">{message.length}/500</p>

            <Button
              onClick={handleSubmit}
              disabled={isPending || message.length < 20}
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Solicitar Cortesia
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="key" className="space-y-4 pt-4 flex-1 overflow-y-auto">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-900">
                Digite a chave de 16 caracteres que você recebeu no card da Basemedical.
              </p>
            </div>

            <Input
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(normalizeKeyInput(e.target.value))
                setPreview(null)
              }}
              className="font-mono text-center tracking-widest text-lg h-12 focus:ring-2 focus:ring-emerald-500"
              maxLength={19}
            />

            {preview && (
              <div className="p-4 bg-white rounded-lg border-2 border-emerald-300">
                <p className="text-sm text-gray-600">Chave válida! Cortesia até</p>
                <p className="text-lg font-bold text-emerald-700">
                  {format(new Date(preview.validUntil), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            )}

            {!preview ? (
              <Button
                onClick={handlePreview}
                disabled={isKeyPending || keyInput.length < 19}
                className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                {isKeyPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Verificar chave
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleRedeem}
                disabled={isKeyPending}
                className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                {isKeyPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ativando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Resgatar Cortesia
                  </>
                )}
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
