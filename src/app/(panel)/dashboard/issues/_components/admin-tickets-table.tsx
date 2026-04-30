"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Eye, ArrowRight, Mail, MessageSquare, Paperclip, X, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TicketStatusBadge, TicketPriorityBadge } from "./ticket-status-badge"
import {
  getCategoryLabel,
  getCategoryArea,
  getCategoryEmoji,
  TICKET_CATEGORIES,
} from "../_utils/categories"
import type { AdminTicketRow } from "../_data_access/get-admin-tickets"
import type { TicketStatus, TicketCategory } from "@/generated/prisma"

interface AdminTicketsTableProps {
  tickets: AdminTicketRow[]
}

const STATUS_FILTERS: { value: TicketStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos os status" },
  { value: "OPEN", label: "Aberto" },
  { value: "IN_PROGRESS", label: "Em análise" },
  { value: "WAITING_USER", label: "Aguardando usuário" },
  { value: "RESOLVED", label: "Resolvido" },
  { value: "CLOSED", label: "Fechado" },
]

const AREA_FILTERS: { value: "ALL" | "ACCESS" | "SCHEDULING" | "OTHER"; label: string }[] = [
  { value: "ALL", label: "Todas as áreas" },
  { value: "ACCESS", label: "🔐 Acesso" },
  { value: "SCHEDULING", label: "📅 Agendamento" },
  { value: "OTHER", label: "❓ Outros" },
]

export function AdminTicketsTable({ tickets }: AdminTicketsTableProps) {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL")
  const [areaFilter, setAreaFilter] = useState<"ALL" | "ACCESS" | "SCHEDULING" | "OTHER">("ALL")
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "ALL">("ALL")
  const [search, setSearch] = useState("")
  const [preview, setPreview] = useState<AdminTicketRow | null>(null)

  const filtered = tickets.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false
    if (areaFilter !== "ALL" && getCategoryArea(t.category) !== areaFilter) return false
    if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      const hay = `${t.title} ${t.user.name ?? ""} ${t.user.email}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  return (
    <>
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Buscar por título, nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs h-11 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
        <Select value={areaFilter} onValueChange={(v) => setAreaFilter(v as typeof areaFilter)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AREA_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | "ALL")}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as TicketCategory | "ALL")}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas as categorias</SelectItem>
            {TICKET_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.emoji} {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-gray-500 ml-auto">
          {filtered.length} de {tickets.length} chamados
        </span>
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden rounded-lg border border-emerald-100 divide-y divide-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-10">
            Nenhum chamado encontrado com os filtros atuais.
          </div>
        ) : (
          filtered.map((t) => (
            <div key={t.id} className="p-4 hover:bg-emerald-50/40">
              <div className="flex items-start gap-3">
                {t.user.image ? (
                  <Image
                    src={t.user.image}
                    alt={t.user.name ?? ""}
                    width={40}
                    height={40}
                    className="rounded-full shrink-0"
                    unoptimized
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-600 shrink-0">
                    {(t.user.name ?? t.user.email)[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {t.user.name ?? "—"}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        {t.user.email}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setPreview(t)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview rápido
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/issues/${t.id}`}>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Abrir detalhe
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-base">{getCategoryEmoji(t.category)}</span>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {t.title}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {getCategoryLabel(t.category)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <TicketStatusBadge status={t.status} />
                    <TicketPriorityBadge priority={t.priority} />
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      {t._count.messages > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {t._count.messages}
                        </span>
                      )}
                      {t._count.images > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          {t._count.images}
                        </span>
                      )}
                    </div>
                    <span>{format(t.createdAt, "dd/MM/yy HH:mm", { locale: ptBR })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: Tabela */}
      <div className="hidden md:block rounded-lg border border-emerald-100 overflow-hidden">
        <div className="overflow-x-auto px-4 lg:px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Chamado</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aberto em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-gray-500 py-10">
                  Nenhum chamado encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => {
                const area = getCategoryArea(t.category)
                const areaBg =
                  area === "ACCESS"
                    ? "hover:bg-emerald-50/40"
                    : area === "SCHEDULING"
                    ? "hover:bg-teal-50/40"
                    : "hover:bg-gray-50"
                return (
                  <TableRow key={t.id} className={areaBg}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {t.user.image ? (
                          <Image
                            src={t.user.image}
                            alt={t.user.name ?? ""}
                            width={28}
                            height={28}
                            className="rounded-full"
                            unoptimized
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                            {(t.user.name ?? t.user.email)[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {t.user.name ?? "—"}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[200px]">
                            <Mail className="w-3 h-3" />
                            {t.user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{getCategoryEmoji(t.category)}</span>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[260px]">
                          {t.title}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t._count.messages > 0 && (
                          <span className="inline-flex items-center gap-1 mr-2">
                            <MessageSquare className="w-3 h-3" />
                            {t._count.messages}
                          </span>
                        )}
                        {t._count.images > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            {t._count.images}
                          </span>
                        )}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 max-w-[180px] truncate">
                      {getCategoryLabel(t.category)}
                    </TableCell>
                    <TableCell>
                      <TicketPriorityBadge priority={t.priority} />
                    </TableCell>
                    <TableCell>
                      <TicketStatusBadge status={t.status} />
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      <p>{format(t.createdAt, "dd/MM/yy HH:mm", { locale: ptBR })}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreview(t)}
                          title="Preview rápido"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Link href={`/dashboard/issues/${t.id}`}>
                          <Button type="button" size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Preview modal simples */}
      {preview && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-xl max-w-lg w-full p-6 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">{getCategoryLabel(preview.category)}</p>
                <h3 className="text-lg font-semibold text-gray-900">{preview.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {preview.user.name} — {preview.user.email}
                </p>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2">
              <TicketStatusBadge status={preview.status} />
              <TicketPriorityBadge priority={preview.priority} />
            </div>
            {preview.images[0] && (
              <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={preview.images[0].url}
                  alt="Preview"
                  fill
                  className="object-contain bg-gray-50"
                  sizes="500px"
                  unoptimized
                />
              </div>
            )}
            <div className="flex justify-end">
              <Link href={`/dashboard/issues/${preview.id}`}>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  Abrir detalhe completo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
