"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Mail, Calendar, Clock, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { approveEligibility, rejectEligibility } from "../_actions/approve-eligibility"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type Props = {
  id: string
  name: string | null
  email: string
  image: string | null
  landing: string
  cta: string | null
  registeredAt: string
  firstAppointmentAt: string | null
}

function formatBR(iso: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
}

export function EligibleRow({
  id,
  name,
  email,
  image,
  landing,
  cta,
  registeredAt,
  firstAppointmentAt,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState("")

  function handleApprove() {
    if (!confirm(`Aprovar 3 meses de cortesia para ${name || email}?`)) return
    startTransition(async () => {
      const res = await approveEligibility(id)
      if (res.error) {
        toast.error(res.error)
        return
      }
      if (res.emailSent) {
        toast.success(`Cortesia aprovada! Código ${res.code}. Email enviado ao profissional.`)
      } else {
        toast.warning(
          `Cortesia aprovada (código ${res.code}), mas o EMAIL NÃO FOI ENVIADO: ${res.emailError ?? "erro desconhecido"}. Use o botão "Reenviar email" no histórico.`,
          { duration: 12000 }
        )
      }
    })
  }

  function handleReject() {
    startTransition(async () => {
      const res = await rejectEligibility(id, reason)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Elegibilidade rejeitada")
        setRejectOpen(false)
        setReason("")
      }
    })
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-lg border border-emerald-200 bg-gradient-to-r from-white to-emerald-50/30">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-lg">
              {(name || email).charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="font-bold text-gray-900 truncate">{name || "Sem nome cadastrado"}</div>
            <div className="text-sm text-gray-600 flex items-center gap-1 truncate">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{email}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                Landing: {landing}
              </span>
              {cta && (
                <span className="px-2 py-0.5 rounded-full bg-gray-100">
                  CTA: {cta}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Cadastrou {formatBR(registeredAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                1º agendamento {formatBR(firstAppointmentAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 md:flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRejectOpen(true)}
            disabled={isPending}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-1" /> Rejeitar
          </Button>
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isPending}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Check className="w-4 h-4 mr-1" />
            )}
            Aprovar 3 meses
          </Button>
        </div>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar elegibilidade</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Informe o motivo. Ficará no histórico (não é enviado pro profissional).
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ex: agendamento de teste, suspeita de abuso, etc."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isPending || !reason.trim()}
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Confirmar rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
