"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateTicketStatus } from "../_actions/update-ticket-status"
import { addTicketMessage } from "../_actions/add-ticket-message"
import type { TicketStatus, TicketPriority } from "@/generated/prisma"
import { TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS } from "../_utils/categories"

interface AdminTicketActionsProps {
  ticketId: string
  currentStatus: TicketStatus
  currentPriority: TicketPriority
}

const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING_USER", "RESOLVED", "CLOSED"]
const PRIORITIES: TicketPriority[] = ["LOW", "NORMAL", "HIGH", "URGENT"]

export function AdminTicketActions({
  ticketId,
  currentStatus,
  currentPriority,
}: AdminTicketActionsProps) {
  const [status, setStatus] = useState<TicketStatus>(currentStatus)
  const [priority, setPriority] = useState<TicketPriority>(currentPriority)
  const [reply, setReply] = useState("")
  const [isPendingStatus, startStatusTransition] = useTransition()
  const [isPendingReply, startReplyTransition] = useTransition()

  function handleStatusChange(newStatus: TicketStatus) {
    setStatus(newStatus)
    startStatusTransition(async () => {
      const res = await updateTicketStatus({ ticketId, status: newStatus })
      if (res.error) {
        setStatus(currentStatus)
        toast.error(res.error)
        return
      }
      toast.success("Status atualizado")
    })
  }

  function handlePriorityChange(newPriority: TicketPriority) {
    setPriority(newPriority)
    startStatusTransition(async () => {
      const res = await updateTicketStatus({ ticketId, priority: newPriority })
      if (res.error) {
        setPriority(currentPriority)
        toast.error(res.error)
        return
      }
      toast.success("Prioridade atualizada")
    })
  }

  function handleReply() {
    if (reply.trim().length < 1) return
    startReplyTransition(async () => {
      const res = await addTicketMessage({ ticketId, body: reply.trim() })
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success("Resposta enviada")
      setReply("")
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => handleStatusChange(v as TicketStatus)} disabled={isPendingStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {TICKET_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Prioridade</Label>
          <Select value={priority} onValueChange={(v) => handlePriorityChange(v as TicketPriority)} disabled={isPendingStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {TICKET_PRIORITY_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Responder ao usuário</Label>
        <Textarea
          placeholder="Escreva sua resposta..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={4}
        />
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleReply}
            disabled={isPendingReply || reply.trim().length < 1}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {isPendingReply ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar resposta
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
