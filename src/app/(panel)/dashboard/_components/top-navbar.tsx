"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Bell, User, Settings, LogOut, Menu, Key, ChevronDown, X } from "lucide-react"

interface Campanha {
  id: string
  nome: string
  status: string
  criadoEm: string
  loja: { nome: string } | null
}

interface TopNavbarProps {
  userName: string | null
  userEmail: string | null
  role: string
  onMenuClick: () => void
}

const STORAGE_KEY = "courtesyfy_notif_last_seen"

function formatRelTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "agora"
  if (mins < 60) return `${mins}min atrás`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h atrás`
  return `${Math.floor(hrs / 24)}d atrás`
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    ATIVA: "Ativa",
    RASCUNHO: "Rascunho",
    ENCERRADA: "Encerrada",
    CANCELADA: "Cancelada",
  }
  return map[s] ?? s
}

function statusColor(s: string) {
  if (s === "ATIVA") return "text-emerald-600 bg-emerald-50"
  if (s === "RASCUNHO") return "text-amber-600 bg-amber-50"
  return "text-gray-500 bg-gray-100"
}

export function TopNavbar({ userName, userEmail, role, onMenuClick }: TopNavbarProps) {
  const [bellOpen, setBellOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [unread, setUnread] = useState(0)
  const bellRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const isAdmin = role === "SUPER_ADMIN"
  const initial = (userName ?? userEmail ?? "?")[0].toUpperCase()
  const displayName = userName ?? userEmail ?? "Usuário"

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      if (!res.ok) return
      const data = await res.json()
      const list: Campanha[] = data.campanhas ?? []
      setCampanhas(list)

      const lastSeen = localStorage.getItem(STORAGE_KEY)
      const lastSeenDate = lastSeen ? new Date(lastSeen) : new Date(0)
      const count = list.filter((c) => new Date(c.criadoEm) > lastSeenDate).length
      setUnread(count)
    } catch {
      // silently ignore
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const id = setInterval(fetchNotifications, 2 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchNotifications])

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function openBell() {
    setBellOpen((v) => !v)
    setProfileOpen(false)
    if (!bellOpen) {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString())
      setUnread(0)
    }
  }

  function openProfile() {
    setProfileOpen((v) => !v)
    setBellOpen(false)
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0 z-30">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo (mobile) */}
      <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
        <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center flex-shrink-0">
          <Key className="w-3 h-3 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-sm text-gray-900">Courtesyfy</span>
      </Link>

      <div className="flex-1" />

      {/* ── Bell ── */}
      <div className="relative" ref={bellRef}>
        <button
          onClick={openBell}
          className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {bellOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Notificações</span>
              <button onClick={() => setBellOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {campanhas.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">Nenhuma campanha nos últimos 7 dias</p>
              ) : (
                campanhas.map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard/campanhas/${c.id}`}
                    onClick={() => setBellOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bell className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.nome}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusColor(c.status)}`}>
                          {statusLabel(c.status)}
                        </span>
                        {isAdmin && c.loja && (
                          <span className="text-xs text-gray-400 truncate">{c.loja.nome}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{formatRelTime(c.criadoEm)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-gray-100">
              <Link
                href="/dashboard/campanhas"
                onClick={() => setBellOpen(false)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Ver todas as campanhas →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Profile ── */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={openProfile}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Perfil"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{initial}</span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
            {displayName}
          </span>
          <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-gray-400" />
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
            {/* User info */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{initial}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                  {userEmail && (
                    <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                  )}
                  <span
                    className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      isAdmin
                        ? "bg-purple-100 text-purple-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {isAdmin ? "Super Admin" : "Lojista"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="py-1.5">
              <Link
                href="/dashboard/configuracoes"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Configurações
              </Link>
            </div>

            <div className="border-t border-gray-100 py-1.5">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
