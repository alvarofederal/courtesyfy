"use client"

import { useTransition } from "react"
import { Mail, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { resendCourtesyEmail } from "../_actions/approve-eligibility"

export function ResendEmailButton({ eligibilityId }: { eligibilityId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleResend() {
    startTransition(async () => {
      const res = await resendCourtesyEmail(eligibilityId)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Email reenviado com sucesso")
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={isPending}
      title="Reenviar email com a chave"
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Mail className="w-3 h-3" />
      )}
      Reenviar
    </button>
  )
}
