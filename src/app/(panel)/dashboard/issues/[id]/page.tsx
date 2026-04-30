import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Calendar,
  Clock,
  Monitor,
  Globe,
  Smartphone,
  Briefcase,
  Info,
  ShieldAlert,
} from "lucide-react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTicketDetail } from "../_data_access/get-ticket-detail"
import { TicketImageCarousel } from "../_components/ticket-image-carousel"
import { TicketStatusBadge, TicketPriorityBadge } from "../_components/ticket-status-badge"
import { AdminTicketActions } from "../_components/admin-ticket-actions"
import { getCategoryEmoji, getCategoryLabel } from "../_utils/categories"

interface PageProps {
  params: Promise<{ id: string }>
}

// Helpers para extrair campos do metadata JSON
function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null
}

export default async function TicketDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const isAdmin = session.user.role === "ADMIN"
  if (!isAdmin) redirect("/dashboard/profile")

  const ticket = await getTicketDetail(id, session.user.id, true)
  if (!ticket) notFound()

  const meta = asRecord(ticket.metadata as unknown)
  const technical = meta ? asRecord(meta.technical) : null
  const contextual = meta ? asRecord(meta.contextual) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full space-y-4 md:space-y-6">
      {/* Faixa Modo Administrador */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm px-4 py-3 rounded-lg flex items-center gap-2 shadow-md">
        <ShieldAlert className="w-5 h-5" />
        <div>
          <p className="font-semibold">Modo Administrador</p>
          <p className="text-xs text-purple-100">Você está gerenciando tipos de atendimento do sistema</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/dashboard/issues">
          <Button variant="ghost" size="sm" className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos chamados
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card principal do chamado */}
          <Card className="border-emerald-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <span>{getCategoryEmoji(ticket.category)}</span>
                    {getCategoryLabel(ticket.category)}
                  </p>
                  <CardTitle className="text-xl text-gray-900">{ticket.title}</CardTitle>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <TicketStatusBadge status={ticket.status} />
                  <TicketPriorityBadge priority={ticket.priority} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Aberto em {format(ticket.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Atualizado {format(ticket.updatedAt, "dd/MM HH:mm", { locale: ptBR })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Imagens */}
          <Card className="border-emerald-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Prints enviados</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketImageCarousel images={ticket.images} />
            </CardContent>
          </Card>

          {/* Thread de mensagens */}
          <Card className="border-emerald-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Conversa ({ticket.messages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.messages.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Nenhuma mensagem ainda.</p>
              ) : (
                <div className="space-y-3">
                  {ticket.messages.map((m) => (
                    <div key={m.id} className={`flex ${m.isAdmin ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                          m.isAdmin
                            ? "bg-emerald-100 border border-emerald-200"
                            : "bg-gray-100"
                        }`}
                      >
                        <p className="text-xs font-semibold text-gray-700 mb-0.5">
                          {m.isAdmin ? "Suporte" : m.author.name ?? m.author.email}
                          <span className="font-normal text-gray-500 ml-2">
                            {format(m.createdAt, "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                        </p>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{m.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações do admin */}
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardHeader>
              <CardTitle className="text-sm">Ações do atendimento</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminTicketActions
                ticketId={ticket.id}
                currentStatus={ticket.status}
                currentPriority={ticket.priority}
              />
            </CardContent>
          </Card>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-6">
          {/* Usuário */}
          <Card className="border-emerald-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                {ticket.user.image ? (
                  <Image
                    src={ticket.user.image}
                    alt={ticket.user.name ?? ""}
                    width={48}
                    height={48}
                    className="rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    {(ticket.user.name ?? ticket.user.email)[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{ticket.user.name ?? "—"}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3" />
                    {ticket.user.email}
                  </p>
                </div>
              </div>
              {ticket.user.subscription && (
                <div className="text-xs text-gray-600 inline-flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  Plano: <span className="font-semibold">{ticket.user.subscription.plan}</span> ({ticket.user.subscription.status})
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contexto técnico */}
          {technical && (
            <Card className="border-blue-200 bg-blue-50/40">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Contexto técnico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-gray-700">
                {asString(technical.userAgent) && (
                  <div className="flex items-start gap-2">
                    <Smartphone className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-600" />
                    <span className="break-all">{asString(technical.userAgent)}</span>
                  </div>
                )}
                {asString(technical.url) && (
                  <div className="flex items-start gap-2">
                    <Globe className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-600" />
                    <span className="break-all">{asString(technical.url)}</span>
                  </div>
                )}
                {asString(technical.screenSize) && (
                  <p>📐 Tela: {asString(technical.screenSize)}</p>
                )}
                {asString(technical.language) && (
                  <p>🌍 Idioma: {asString(technical.language)}</p>
                )}
                {asString(technical.plan) && (
                  <p>💼 Plano no momento: {asString(technical.plan)}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contexto reportado */}
          {contextual && Object.keys(contextual).length > 0 && (
            <Card className="border-emerald-200 bg-emerald-50/40">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Informações reportadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-gray-700">
                {asString(contextual.whenHappened) && (
                  <p><strong>Quando:</strong> {asString(contextual.whenHappened)}</p>
                )}
                {asString(contextual.device) && (
                  <p><strong>Dispositivo:</strong> {asString(contextual.device)}</p>
                )}
                {asString(contextual.errorMessage) && (
                  <p><strong>Erro na tela:</strong> {asString(contextual.errorMessage)}</p>
                )}
                {asString(contextual.triedRecovery) && (
                  <p><strong>Recuperação de senha:</strong> {asString(contextual.triedRecovery)}</p>
                )}
                {asString(contextual.appointmentDate) && (
                  <p><strong>Data do agendamento:</strong> {asString(contextual.appointmentDate)}</p>
                )}
                {asString(contextual.patientName) && (
                  <p><strong>Paciente:</strong> {asString(contextual.patientName)}</p>
                )}
                {asString(contextual.whatWasTrying) && (
                  <p><strong>Tentava fazer:</strong> {asString(contextual.whatWasTrying)}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
