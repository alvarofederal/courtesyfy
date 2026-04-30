"use client"

import { useState, useEffect } from "react"
import { LifeBuoy, Plus, Inbox } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { NewTicketForm } from "./new-ticket-form"
import { UserTicketCard } from "./user-ticket-card"
import type { UserTicket } from "../_data_access/get-user-tickets"

interface TicketsModalProps {
  userId: string
  userPlan?: string | null
  initialTickets: UserTicket[]
  trigger: React.ReactNode
}

export function TicketsModal({ userId, userPlan, initialTickets, trigger }: TicketsModalProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"list" | "new">(initialTickets.length === 0 ? "new" : "list")

  // Sempre que a lista for atualizada do server (via revalidatePath),
  // o componente remonta e reseta a aba inicial de acordo.
  useEffect(() => {
    if (open) {
      setTab(initialTickets.length === 0 ? "new" : "list")
    }
  }, [open, initialTickets.length])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="!max-w-[90vw] w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-rose-500" />
            Central de Chamados
          </DialogTitle>
          <DialogDescription>
            Abra um chamado para problemas com acesso, agendamentos ou outros erros que encontrar.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "list" | "new")} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="list">
              <Inbox className="w-4 h-4 mr-2" />
              Meus Chamados ({initialTickets.length})
            </TabsTrigger>
            <TabsTrigger value="new">
              <Plus className="w-4 h-4 mr-2" />
              Novo Chamado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="flex-1 overflow-y-auto pt-4 space-y-3">
            {initialTickets.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">Você ainda não abriu nenhum chamado.</p>
                <Button
                  onClick={() => setTab("new")}
                  className="bg-rose-500 hover:bg-rose-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Abrir primeiro chamado
                </Button>
              </div>
            ) : (
              initialTickets.map((t) => (
                <UserTicketCard key={t.id} ticket={t} currentUserId={userId} />
              ))
            )}
          </TabsContent>

          <TabsContent value="new" className="flex-1 overflow-y-auto pt-4">
            <NewTicketForm
              userId={userId}
              userPlan={userPlan}
              onSuccess={() => setTab("list")}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
