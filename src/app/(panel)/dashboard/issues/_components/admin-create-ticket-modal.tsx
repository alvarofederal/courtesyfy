"use client"

import { useState, useEffect, useTransition } from "react"
import Image from "next/image"
import { UserPlus, Search, X, Check, Loader2, User as UserIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { NewTicketForm } from "./new-ticket-form"
import { adminCreateTicket, searchUsersForTicket } from "../_actions/admin-create-ticket"

interface SelectedUser {
  id: string
  name: string | null
  email: string
  image: string | null
  plan?: string | null
}

interface AdminCreateTicketModalProps {
  adminId: string
}

export function AdminCreateTicketModal({ adminId }: AdminCreateTicketModalProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SelectedUser[]>([])
  const [selected, setSelected] = useState<SelectedUser | null>(null)
  const [isSearching, startSearchTransition] = useTransition()

  // Busca debounced
  useEffect(() => {
    if (!open) return
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const t = setTimeout(() => {
      startSearchTransition(async () => {
        const res = await searchUsersForTicket(query)
        if (!res.error) {
          setResults(
            (res.users ?? []).map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              image: u.image,
              plan: u.subscription?.plan ?? null,
            }))
          )
        }
      })
    }, 300)
    return () => clearTimeout(t)
  }, [query, open])

  // Reseta ao fechar
  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
      setSelected(null)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Criar chamado para um profissional
        </Button>
      </DialogTrigger>
      <DialogContent className="!max-w-[90vw] w-[90vw] max-h-[90vh] overflow-hidden flex flex-col border-emerald-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            Abrir chamado em nome de um profissional
          </DialogTitle>
          <DialogDescription>
            Use quando o profissional estiver ao telefone ou ao seu lado. O chamado entrará já em análise.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pt-2">
          {/* Seleção de usuário */}
          {!selected ? (
            <div className="space-y-3">
              <Label htmlFor="user-search">Buscar profissional por nome, e-mail ou CPF</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="user-search"
                  placeholder="Digite ao menos 2 caracteres..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 h-11 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  autoFocus
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-spin" />
                )}
              </div>

              {query.trim().length >= 2 && results.length === 0 && !isSearching && (
                <p className="text-sm text-gray-500 text-center py-6 border border-dashed border-gray-200 rounded-lg">
                  Nenhum profissional encontrado para &ldquo;{query}&rdquo;
                </p>
              )}

              {results.length > 0 && (
                <div className="space-y-1.5 max-h-80 overflow-y-auto border border-emerald-200 rounded-lg bg-white shadow-sm divide-y divide-emerald-100">
                  {results.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelected(u)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50 transition-colors text-left"
                    >
                      {u.image ? (
                        <Image
                          src={u.image}
                          alt={u.name ?? ""}
                          width={36}
                          height={36}
                          className="rounded-full"
                          unoptimized
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 font-semibold">
                          {(u.name ?? u.email)[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {u.name ?? "—"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                      {u.plan && (
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {u.plan}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Usuário selecionado */}
              <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                {selected.image ? (
                  <Image
                    src={selected.image}
                    alt={selected.name ?? ""}
                    width={40}
                    height={40}
                    className="rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 flex items-center justify-center text-emerald-800 font-semibold">
                    {(selected.name ?? selected.email)[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {selected.name ?? "—"}
                  </p>
                  <p className="text-xs text-gray-600 truncate">{selected.email}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Trocar
                </Button>
              </div>

              {/* Formulário reutilizado */}
              <NewTicketForm
                userId={adminId /* usado apenas como "owner" do upload Cloudinary */}
                userPlan={selected.plan}
                skipTechnicalContext
                submitLabel="Criar chamado para o profissional"
                submitOverride={async (payload) => {
                  const res = await adminCreateTicket({
                    targetUserId: selected.id,
                    ...payload,
                  })
                  return res
                }}
                onSuccess={() => {
                  setOpen(false)
                }}
              />

              <div className="flex items-start gap-2 text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <UserIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Este chamado entrará na lista como pertencente a <strong>{selected.name ?? selected.email}</strong>,
                  com status <strong>Em análise</strong>. Você pode continuar a interação pelo painel normal.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
