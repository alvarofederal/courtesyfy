"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Copy, Eye, Printer, Check, Loader2, QrCode, Keyboard, Archive, ArchiveRestore, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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
import { revealKey } from "../_actions/reveal-key"
import { archiveKeys, unarchiveKeys } from "../_actions/archive-keys"
import type { KeyRow, KeyStatus } from "../_data_access/list-keys"

const statusLabel: Record<KeyStatus, { label: string; className: string }> = {
  generated: { label: "Gerada", className: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  printed: { label: "Impressa", className: "bg-teal-100 text-teal-800 border-teal-300" },
  redeemed: { label: "Resgatada", className: "bg-emerald-600 text-white border-emerald-700" },
  expired: { label: "Expirada", className: "bg-gray-100 text-gray-600 border-gray-300" },
  archived: { label: "Arquivada", className: "bg-amber-100 text-amber-800 border-amber-300" },
}

interface Props {
  keys: KeyRow[]
  batches: { batchId: string; count: number; createdAt: Date }[]
}

export function KeysTable({ keys, batches }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [revealed, setRevealed] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [batchFilter, setBatchFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [pageSize, setPageSize] = useState<number>(10)
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    return keys.filter((k) => {
      if (batchFilter !== "all" && k.batchId !== batchFilter) return false
      if (statusFilter !== "all" && k.status !== statusFilter) return false
      if (search && !(k.batchId ?? "").toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [keys, batchFilter, statusFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  useEffect(() => {
    setPage(1)
  }, [batchFilter, statusFilter, search, pageSize])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  )

  // Todas as linhas da página podem ser selecionadas (seleção é usada para
  // imprimir e também para arquivar/desarquivar em lote).
  const selectableIds = useMemo(() => paginated.map((k) => k.id), [paginated])
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id))

  const selectedRows = useMemo(
    () => paginated.filter((k) => selected.has(k.id)),
    [paginated, selected]
  )
  const canPrintSelected =
    selected.size > 0 && selectedRows.every((k) => k.status === "generated")

  const viewingArchived = statusFilter === "archived"

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(selectableIds))
  }

  async function handleArchiveSelected() {
    if (selected.size === 0) return
    const ids = Array.from(selected)
    startTransition(async () => {
      const action = viewingArchived ? unarchiveKeys : archiveKeys
      const res = await action({ ids })
      if ("error" in res) {
        toast.error(res.error)
        return
      }
      toast.success(
        viewingArchived
          ? `${res.count} chave(s) desarquivada(s)`
          : `${res.count} chave(s) arquivada(s)`
      )
      setSelected(new Set())
      router.refresh()
    })
  }

  async function handleArchiveOne(id: string, currentlyArchived: boolean) {
    startTransition(async () => {
      const action = currentlyArchived ? unarchiveKeys : archiveKeys
      const res = await action({ ids: [id] })
      if ("error" in res) {
        toast.error(res.error)
        return
      }
      toast.success(currentlyArchived ? "Chave desarquivada" : "Chave arquivada")
      router.refresh()
    })
  }

  function toggleOne(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  async function handleReveal(id: string) {
    startTransition(async () => {
      const res = await revealKey({ id })
      if ("success" in res && res.success) {
        setRevealed((r) => ({ ...r, [id]: res.code }))
      }
    })
  }

  async function handleCopy(id: string, code: string) {
    await navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  function handlePrintSelected() {
    if (selected.size === 0) return
    const ids = Array.from(selected).join(",")
    router.push(`/dashboard/courtesies/print?ids=${ids}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-end lg:justify-between gap-3 rounded-lg border border-emerald-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
          <div className="flex-1 sm:flex-initial">
            <label className="text-xs font-semibold text-gray-700">Lote</label>
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-full sm:w-[220px] border-emerald-200 focus:ring-2 focus:ring-emerald-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os lotes</SelectItem>
                {batches.map((b) => (
                  <SelectItem key={b.batchId} value={b.batchId}>
                    {b.batchId.slice(0, 8)}... ({b.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 sm:flex-initial">
            <label className="text-xs font-semibold text-gray-700">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] border-emerald-200 focus:ring-2 focus:ring-emerald-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="generated">Gerada</SelectItem>
                <SelectItem value="printed">Impressa</SelectItem>
                <SelectItem value="redeemed">Resgatada</SelectItem>
                <SelectItem value="expired">Expirada</SelectItem>
                <SelectItem value="archived">Arquivada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 sm:flex-initial">
            <label className="text-xs font-semibold text-gray-700">Buscar lote</label>
            <Input
              placeholder="ID do lote..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-[220px] border-emerald-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Button
            onClick={handleArchiveSelected}
            disabled={selected.size === 0 || isPending}
            variant="outline"
            className="border-amber-300 text-amber-800 hover:bg-amber-50 disabled:opacity-50"
            title={
              viewingArchived
                ? "Desarquivar as chaves selecionadas"
                : "Arquivar as chaves selecionadas (não impede resgate)"
            }
          >
            {viewingArchived ? (
              <ArchiveRestore className="w-4 h-4 mr-2" />
            ) : (
              <Archive className="w-4 h-4 mr-2" />
            )}
            {viewingArchived ? "Desarquivar" : "Arquivar"} ({selected.size})
          </Button>
          <Button
            onClick={handlePrintSelected}
            disabled={!canPrintSelected}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md disabled:opacity-50"
            title={
              !canPrintSelected && selected.size > 0
                ? "Somente chaves com status 'Gerada' podem ser impressas"
                : undefined
            }
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir selecionadas ({selected.size})
          </Button>
        </div>
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden rounded-lg border border-emerald-200 bg-white shadow-sm divide-y divide-emerald-100">
        {paginated.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 px-4">
            Nenhuma chave encontrada
          </div>
        ) : (
          paginated.map((k) => {
            const isSelected = selected.has(k.id)
            const revealedCode = revealed[k.id]
            const isArchived = k.status === "archived"
            const canReveal = k.canReveal
            const canCopy = k.status === "generated" && !!revealedCode
            return (
              <div
                key={k.id}
                className={`p-4 ${isSelected ? "bg-emerald-50/70" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleOne(k.id)}
                    className="mt-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-sm break-all">
                          {revealedCode ?? k.maskedCode}
                        </p>
                        <Badge variant="outline" className={`${statusLabel[k.status].className} text-xs mt-1`}>
                          {statusLabel[k.status].label}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canReveal && !revealedCode && (
                            <DropdownMenuItem onClick={() => handleReveal(k.id)} disabled={isPending}>
                              <Eye className="w-4 h-4 mr-2" />
                              Revelar código
                            </DropdownMenuItem>
                          )}
                          {canCopy && (
                            <DropdownMenuItem onClick={() => handleCopy(k.id, revealedCode!)}>
                              {copied === k.id ? (
                                <Check className="w-4 h-4 mr-2 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4 mr-2" />
                              )}
                              Copiar código
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/courtesies/print?ids=${k.id}`)}
                            disabled={k.status !== "generated"}
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimir
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleArchiveOne(k.id, isArchived)}
                            disabled={isPending}
                            className={isArchived ? "text-amber-700 focus:text-amber-700" : ""}
                          >
                            {isArchived ? (
                              <>
                                <ArchiveRestore className="w-4 h-4 mr-2" />
                                Desarquivar
                              </>
                            ) : (
                              <>
                                <Archive className="w-4 h-4 mr-2" />
                                Arquivar
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-xs text-gray-600">
                      <div>
                        <span className="text-gray-400">Lote:</span>{" "}
                        <span className="font-mono">{k.batchId ? k.batchId.slice(0, 8) : "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Origem:</span>{" "}
                        {k.status === "redeemed" && k.redemptionSource === "QR_CODE" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <QrCode className="w-3 h-3" /> QR
                          </span>
                        ) : k.status === "redeemed" && k.redemptionSource === "MANUAL_KEY" ? (
                          <span className="inline-flex items-center gap-1 text-teal-700">
                            <Keyboard className="w-3 h-3" /> Manual
                          </span>
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-400">Validade:</span>{" "}
                        {new Date(k.validUntil).toLocaleDateString("pt-BR")}
                      </div>
                      <div>
                        <span className="text-gray-400">Criada:</span>{" "}
                        {new Date(k.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block rounded-lg border border-emerald-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto px-4 lg:px-6">
        <Table>
          <TableHeader className="bg-emerald-50/60">
            <TableRow className="border-b border-emerald-200 hover:bg-emerald-50/60">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  disabled={selectableIds.length === 0}
                />
              </TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Criada</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Nenhuma chave encontrada
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((k) => {
                const isSelected = selected.has(k.id)
                const revealedCode = revealed[k.id]
                const isArchived = k.status === "archived"
                const canReveal = k.canReveal
                const canCopy = k.status === "generated" && !!revealedCode

                return (
                  <TableRow
                    key={k.id}
                    className={isSelected ? "bg-emerald-50/70 hover:bg-emerald-50" : "hover:bg-emerald-50/30"}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(k.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {revealedCode ?? k.maskedCode}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusLabel[k.status].className}>
                        {statusLabel[k.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {k.status === "redeemed" ? (
                        k.redemptionSource === "QR_CODE" ? (
                          <span
                            className="inline-flex items-center gap-1 text-xs text-emerald-700"
                            title="Resgatada via QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" /> QR
                          </span>
                        ) : k.redemptionSource === "MANUAL_KEY" ? (
                          <span
                            className="inline-flex items-center gap-1 text-xs text-teal-700"
                            title="Chave digitada manualmente"
                          >
                            <Keyboard className="w-3.5 h-3.5" /> Manual
                          </span>
                        ) : (
                          <span
                            className="text-xs text-muted-foreground"
                            title="Origem não registrada (resgate anterior à feature)"
                          >
                            —
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {k.batchId ? k.batchId.slice(0, 8) : "—"}
                    </TableCell>
                    <TableCell>{new Date(k.validUntil).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{new Date(k.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        {canReveal && !revealedCode && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReveal(k.id)}
                            disabled={isPending}
                            title="Revelar código"
                          >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        )}
                        {canCopy && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(k.id, revealedCode!)}
                            title="Copiar código"
                          >
                            {copied === k.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/dashboard/courtesies/print?ids=${k.id}`)}
                          disabled={k.status !== "generated"}
                          title={k.status === "generated" ? "Imprimir" : "Não é possível reimprimir"}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleArchiveOne(k.id, isArchived)}
                          disabled={isPending}
                          title={isArchived ? "Desarquivar" : "Arquivar"}
                        >
                          {isArchived ? (
                            <ArchiveRestore className="w-4 h-4 text-amber-700" />
                          ) : (
                            <Archive className="w-4 h-4" />
                          )}
                        </Button>
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

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm rounded-lg border border-emerald-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Itens por página:</span>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="w-[80px] h-8 border-emerald-200 focus:ring-2 focus:ring-emerald-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">
            {filtered.length === 0
              ? "0 resultados"
              : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} de ${filtered.length}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-emerald-200 hover:bg-emerald-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
