"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Bell, Plus, Trash2, Calendar, Image as ImageIcon, Archive, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

import { TicketImageDropzone, type UploadedImage } from "../../issues/_components/ticket-image-dropzone"
import { getReminders } from "../../_data_access/get-reminders"
import { createReminder } from "../../_actions/create-reminder"
import { deleteReminder } from "../../_actions/delete-reminder"

interface DialogRemindersProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string
  patientName: string
  appointmentDate: Date
  time: string
  userId: string
}

function defaultExpiresAt(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

export function DialogReminders({
  open,
  onOpenChange,
  appointmentId,
  patientName,
  appointmentDate,
  time,
  userId,
}: DialogRemindersProps) {
  const queryClient = useQueryClient()
  const [showArchived, setShowArchived] = useState(false)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [expiresAt, setExpiresAt] = useState(defaultExpiresAt())
  const [images, setImages] = useState<UploadedImage[]>([])

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["reminders", appointmentId, showArchived],
    queryFn: () => getReminders({ appointmentId, includeArchived: showArchived }),
    enabled: open && !!appointmentId,
  })

  const active = reminders.filter((r) => !r.archived)
  const archived = reminders.filter((r) => r.archived)

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await createReminder({
        appointmentId,
        title,
        description,
        expiresAt: new Date(expiresAt + "T23:59:59"),
        images,
      })
      if (res.error) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      toast.success("Lembrete criado!")
      setTitle("")
      setDescription("")
      setExpiresAt(defaultExpiresAt())
      setImages([])
      setCreating(false)
      queryClient.invalidateQueries({ queryKey: ["reminders", appointmentId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const res = await deleteReminder({ reminderId })
      if (res.error) throw new Error(res.error)
      return res
    },
    onSuccess: () => {
      toast.success("Lembrete excluído!")
      queryClient.invalidateQueries({ queryKey: ["reminders", appointmentId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const formattedAppointment = `${format(new Date(appointmentDate), "dd/MM/yyyy", { locale: ptBR })} ${time}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[640px] sm:max-w-[640px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="min-w-0 break-words">Lembretes</span>
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base pt-1">
            <span className="font-semibold">{patientName}</span> — {formattedAppointment}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!creating && (
            <Button
              onClick={() => setCreating(true)}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Lembrete
            </Button>
          )}

          {creating && (
            <div className="border-2 border-amber-200 bg-amber-50/40 rounded-xl p-4 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="reminder-title">Título</Label>
                <Input
                  id="reminder-title"
                  value={title}
                  maxLength={120}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Trazer exame de sangue"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="reminder-desc">Descrição</Label>
                <Textarea
                  id="reminder-desc"
                  value={description}
                  maxLength={500}
                  rows={3}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes do lembrete..."
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="reminder-expires">Validade (após esta data o lembrete é arquivado)</Label>
                <Input
                  id="reminder-expires"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>

              <div className="space-y-1">
                <Label>Imagens (opcional, até 2)</Label>
                <TicketImageDropzone
                  userId={userId}
                  maxImages={2}
                  value={images}
                  onChange={setImages}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setCreating(false)
                    setTitle("")
                    setDescription("")
                    setExpiresAt(defaultExpiresAt())
                    setImages([])
                  }}
                  disabled={createMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white"
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !title.trim() || !description.trim()}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </div>
          )}

          <ScrollArea className="max-h-[50vh]">
            <div className="space-y-3 pr-2">
              {isLoading && (
                <div className="text-center py-6 text-sm text-gray-500">Carregando...</div>
              )}

              {!isLoading && active.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-500">
                  Nenhum lembrete ativo para este agendamento.
                </div>
              )}

              {active.map((r) => (
                <ReminderCard
                  key={r.id}
                  reminder={r}
                  onDelete={() => deleteMutation.mutate(r.id)}
                />
              ))}

              {archived.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowArchived((s) => !s)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 py-2 border-t border-dashed"
                >
                  <Archive className="w-4 h-4" />
                  {showArchived ? (
                    <>
                      Ocultar arquivados <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      Mostrar arquivados ({archived.length}) <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}

              {showArchived &&
                archived.map((r) => (
                  <ReminderCard
                    key={r.id}
                    reminder={r}
                    onDelete={() => deleteMutation.mutate(r.id)}
                    archived
                  />
                ))}

              {!showArchived && archived.length === 0 && !isLoading && (
                <button
                  type="button"
                  onClick={() => setShowArchived(true)}
                  className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1"
                >
                  Sem arquivados
                </button>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ReminderCardProps {
  reminder: {
    id: string
    title: string
    description: string
    images: unknown
    expiresAt: Date
    createdAt: Date
    archived: boolean
  }
  onDelete: () => void
  archived?: boolean
}

function ReminderCard({ reminder, onDelete, archived }: ReminderCardProps) {
  const imgs = Array.isArray(reminder.images)
    ? (reminder.images as { url: string; publicId?: string | null }[])
    : []

  return (
    <div
      className={`rounded-xl border-2 p-3 sm:p-4 ${
        archived
          ? "border-gray-200 bg-gray-50 opacity-75"
          : "border-amber-200 bg-gradient-to-br from-yellow-50 to-amber-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-sm sm:text-base break-words ${archived ? "text-gray-600" : "text-amber-900"}`}>
            {reminder.title}
          </h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 shrink-0"
          aria-label="Excluir lembrete"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <p className={`text-sm whitespace-pre-wrap break-words ${archived ? "text-gray-500" : "text-gray-700"}`}>
        {reminder.description}
      </p>

      {imgs.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {imgs.map((img, idx) => (
            <a
              key={`${img.url}-${idx}`}
              href={img.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block aspect-video rounded-md overflow-hidden border border-amber-200 bg-white"
            >
              <Image
                src={img.url}
                alt={`Anexo ${idx + 1}`}
                fill
                className="object-cover"
                sizes="200px"
                unoptimized
              />
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] rounded px-1.5 py-0.5 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> {idx + 1}
              </div>
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-amber-100 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Criado: {format(new Date(reminder.createdAt), "dd/MM/yyyy", { locale: ptBR })}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Validade: {format(new Date(reminder.expiresAt), "dd/MM/yyyy", { locale: ptBR })}
        </span>
        {archived && <Badge variant="secondary" className="text-[10px]">Arquivado</Badge>}
      </div>
    </div>
  )
}
