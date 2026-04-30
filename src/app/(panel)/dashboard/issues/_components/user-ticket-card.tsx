"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronDown, ChevronUp, Send, Loader2, MessageSquare, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { TicketStatusBadge, TicketPriorityBadge } from "./ticket-status-badge"
import { getCategoryEmoji, getCategoryLabel } from "../_utils/categories"
import { addTicketMessage } from "../_actions/add-ticket-message"
import type { UserTicket } from "../_data_access/get-user-tickets"

interface UserTicketCardProps {
  ticket: UserTicket
  currentUserId: string
}

export function UserTicketCard({ ticket, currentUserId }: UserTicketCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [reply, setReply] = useState("")
  const [isPending, startTransition] = useTransition()
  const [lightbox, setLightbox] = useState<string | null>(null)

  const hasWaitingUser = ticket.status === "WAITING_USER"
  const canReply = ticket.status !== "CLOSED"

  function handleReply() {
    if (reply.trim().length < 1) return
    startTransition(async () => {
      const result = await addTicketMessage({ ticketId: ticket.id, body: reply.trim() })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Mensagem enviada")
      setReply("")
    })
  }

  return (
    <>
      <div
        className={`rounded-lg border p-4 shadow-sm transition-all ${
          hasWaitingUser
            ? "border-orange-300 bg-orange-50/50"
            : "border-emerald-200 bg-white hover:border-emerald-400"
        }`}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-start justify-between gap-3 text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-lg leading-none">{getCategoryEmoji(ticket.category)}</span>
              <TicketStatusBadge status={ticket.status} />
              <TicketPriorityBadge priority={ticket.priority} />
            </div>
            <p className="font-semibold text-gray-900 truncate">{ticket.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {getCategoryLabel(ticket.category)} •{" "}
              {formatDistanceToNow(ticket.createdAt, { addSuffix: true, locale: ptBR })}
              {ticket.messages.length > 0 && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {ticket.messages.length}
                </span>
              )}
              {ticket.images.length > 0 && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  {ticket.images.length}
                </span>
              )}
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
        </button>

        {expanded && (
          <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>

            {ticket.images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {ticket.images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setLightbox(img.url)}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-400 transition-colors"
                  >
                    <Image
                      src={img.url}
                      alt="Anexo"
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}

            {ticket.messages.length > 0 && (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {ticket.messages.map((m) => {
                  const mine = m.authorId === currentUserId && !m.isAdmin
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          m.isAdmin
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            : mine
                            ? "bg-gray-100 text-gray-900"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.body}</p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {m.isAdmin ? "Suporte" : "Você"} •{" "}
                          {format(m.createdAt, "dd/MM HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {canReply && (
              <div className="space-y-2">
                {hasWaitingUser && (
                  <p className="text-xs font-semibold text-orange-800 bg-orange-100 border border-orange-200 rounded px-2 py-1">
                    O suporte está aguardando sua resposta
                  </p>
                )}
                <Textarea
                  placeholder="Responder ao suporte..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={2}
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleReply}
                    disabled={isPending || reply.trim().length < 1}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Image
              src={lightbox}
              alt="Anexo ampliado"
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  )
}
