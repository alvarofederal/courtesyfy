"use client"

import { useState, useTransition, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TicketImageDropzone, type UploadedImage } from "./ticket-image-dropzone"
import { TICKET_CATEGORIES } from "../_utils/categories"
import { createTicket } from "../_actions/create-ticket"
import type { TicketCategory, TicketPriority } from "@/generated/prisma"

type SubmitResult = { error?: string; success?: boolean; id?: string }

interface NewTicketFormProps {
  userId: string
  userPlan?: string | null
  onSuccess?: () => void
  /** Override opcional para admin criar chamado em nome de outro usuário */
  submitOverride?: (payload: {
    title: string
    description: string
    category: TicketCategory
    priority: TicketPriority
    metadata: Record<string, unknown>
    images: { url: string; publicId: string | null }[]
  }) => Promise<SubmitResult>
  submitLabel?: string
  /** Esconde o bloco de contexto técnico automático (quando admin cria em nome de alguém, não faz sentido) */
  skipTechnicalContext?: boolean
}

const PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: "LOW", label: "Baixa — não urgente" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "Alta — está me atrapalhando" },
  { value: "URGENT", label: "Urgente — não consigo trabalhar" },
]

export function NewTicketForm({
  userId,
  userPlan,
  onSuccess,
  submitOverride,
  submitLabel,
  skipTechnicalContext,
}: NewTicketFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<TicketCategory>("ACCESS_LOGIN")
  const [priority, setPriority] = useState<TicketPriority>("NORMAL")
  const [images, setImages] = useState<UploadedImage[]>([])

  // Campos contextuais por categoria
  const [whenHappened, setWhenHappened] = useState("")
  const [device, setDevice] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [triedRecovery, setTriedRecovery] = useState("")
  const [appointmentDate, setAppointmentDate] = useState("")
  const [patientName, setPatientName] = useState("")
  const [whatWasTrying, setWhatWasTrying] = useState("")

  const [isPending, startTransition] = useTransition()

  const isAccess = category.startsWith("ACCESS_")
  const isScheduling = category.startsWith("SCHEDULING_")

  // Reseta campos contextuais ao mudar categoria
  useEffect(() => {
    setWhenHappened("")
    setDevice("")
    setErrorMessage("")
    setTriedRecovery("")
    setAppointmentDate("")
    setPatientName("")
    setWhatWasTrying("")
  }, [category])

  function buildMetadata(): Record<string, unknown> {
    const contextual: Record<string, unknown> = {}
    if (isAccess) {
      if (whenHappened) contextual.whenHappened = whenHappened
      if (device) contextual.device = device
      if (errorMessage) contextual.errorMessage = errorMessage
      if (triedRecovery) contextual.triedRecovery = triedRecovery
    }
    if (isScheduling) {
      if (appointmentDate) contextual.appointmentDate = appointmentDate
      if (patientName) contextual.patientName = patientName
      if (whatWasTrying) contextual.whatWasTrying = whatWasTrying
    }

    // Contexto técnico automático (só no browser) — pulado quando admin cria em nome de outro
    const technical: Record<string, unknown> = {}
    if (!skipTechnicalContext && typeof window !== "undefined") {
      technical.userAgent = window.navigator.userAgent
      technical.url = window.location.href
      technical.screenSize = `${window.innerWidth}x${window.innerHeight}`
      technical.language = window.navigator.language
      if (userPlan) technical.plan = userPlan
    }

    return { contextual, technical }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (title.trim().length < 3) {
      toast.error("Título muito curto (mínimo 3 caracteres)")
      return
    }
    if (description.trim().length < 20) {
      toast.error("Descrição muito curta (mínimo 20 caracteres)")
      return
    }

    startTransition(async () => {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        metadata: buildMetadata(),
        images,
      }
      const result: SubmitResult = submitOverride
        ? await submitOverride(payload)
        : await createTicket(payload)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(submitOverride ? "Chamado criado para o usuário!" : "Chamado aberto! Responderemos o quanto antes.")
      setTitle("")
      setDescription("")
      setImages([])
      setCategory("ACCESS_LOGIN")
      setPriority("NORMAL")
      onSuccess?.()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Categoria */}
      <div className="space-y-2">
        <Label htmlFor="category">O que está acontecendo?</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TICKET_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                <span className="mr-2">{c.emoji}</span>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Prioridade */}
      <div className="space-y-2">
        <Label htmlFor="priority">Urgência</Label>
        <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
          <SelectTrigger id="priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="title">Resumo do problema</Label>
        <Input
          id="title"
          placeholder="Ex: Não consigo editar o horário de atendimento"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
        <p className="text-xs text-gray-500">{title.length}/120</p>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descreva com detalhes</Label>
        <Textarea
          id="description"
          placeholder="Quanto mais detalhes, mais rápido resolvemos. Descreva o que aconteceu, o que você esperava que acontecesse e os passos para reproduzir."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          maxLength={5000}
        />
        <p className="text-xs text-gray-500">{description.length} caracteres (mínimo 20)</p>
      </div>

      {/* Campos contextuais — ACCESS */}
      {isAccess && (
        <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-4 space-y-3">
          <p className="text-xs font-semibold text-emerald-900">Ajude-nos a entender o problema de acesso</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="when" className="text-xs">Quando aconteceu?</Label>
              <Input
                id="when"
                type="datetime-local"
                value={whenHappened}
                onChange={(e) => setWhenHappened(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="device" className="text-xs">Dispositivo</Label>
              <Select value={device} onValueChange={setDevice}>
                <SelectTrigger id="device">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computador">Computador</SelectItem>
                  <SelectItem value="Celular">Celular</SelectItem>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="errormsg" className="text-xs">Apareceu alguma mensagem de erro?</Label>
            <Input
              id="errormsg"
              placeholder="Ex: E-mail ou senha incorretos"
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
            />
          </div>
          {category === "ACCESS_LOGIN" && (
            <div className="space-y-1.5">
              <Label htmlFor="recovery" className="text-xs">Já tentou recuperar a senha?</Label>
              <Select value={triedRecovery} onValueChange={setTriedRecovery}>
                <SelectTrigger id="recovery">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sim, funcionou">Sim, funcionou</SelectItem>
                  <SelectItem value="Sim, não funcionou">Sim, não funcionou</SelectItem>
                  <SelectItem value="Não tentei">Não tentei</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Campos contextuais — SCHEDULING */}
      {isScheduling && (
        <div className="rounded-lg bg-teal-50/50 border border-teal-200 p-4 space-y-3">
          <p className="text-xs font-semibold text-teal-900">Informações do agendamento</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="apdate" className="text-xs">Data do agendamento (opcional)</Label>
              <Input
                id="apdate"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="patient" className="text-xs">Nome do paciente (opcional)</Label>
              <Input
                id="patient"
                placeholder="Para localizar o agendamento"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wastrying" className="text-xs">O que você estava tentando fazer?</Label>
            <Input
              id="wastrying"
              placeholder="Ex: alterar o horário de um agendamento"
              value={whatWasTrying}
              onChange={(e) => setWhatWasTrying(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Upload */}
      <div className="space-y-2">
        <Label>Anexar print(s) da tela <span className="text-gray-400 font-normal">— opcional, até 2</span></Label>
        <TicketImageDropzone
          userId={userId}
          maxImages={2}
          value={images}
          onChange={setImages}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-rose-500 hover:bg-rose-600 text-white"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {submitLabel ?? "Abrir Chamado"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
