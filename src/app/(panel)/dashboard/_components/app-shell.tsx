"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Megaphone,
  Key,
  ShoppingBag,
  BarChart3,
  Settings,
  Users,
  Building2,
  X,
  LogOut,
  Layers,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { TopNavbar } from "./top-navbar"

const lojistaNav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard",               label: "Visão Geral",   icon: LayoutDashboard },
  { href: "/dashboard/campanhas",     label: "Campanhas",     icon: Megaphone },
  { href: "/dashboard/chaves",        label: "Chaves",        icon: Key },
  { href: "/dashboard/resgates",      label: "Resgates",      icon: ShoppingBag },
  { href: "/dashboard/relatorios",    label: "Relatórios",    icon: BarChart3 },
  { href: "/dashboard/layout",        label: "Layout",        icon: Layers },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
]

const adminNav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard",               label: "Visão Geral",   icon: LayoutDashboard },
  { href: "/dashboard/lojas",         label: "Lojas",         icon: Building2 },
  { href: "/dashboard/usuarios",      label: "Usuários",      icon: Users },
  { href: "/dashboard/campanhas",     label: "Campanhas",     icon: Megaphone },
  { href: "/dashboard/chaves",        label: "Chaves",        icon: Key },
  { href: "/dashboard/relatorios",    label: "Relatórios",    icon: BarChart3 },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
]

interface SidebarContentProps {
  navItems: typeof lojistaNav
  initial: string
  displayName: string
  isAdmin: boolean
  isActive: (href: string) => boolean
  onClose?: () => void
}

function SidebarContent({
  navItems,
  initial,
  displayName,
  isAdmin,
  isActive,
  onClose,
}: SidebarContentProps) {
  return (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5"
        >
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Key className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-base tracking-tight">Courtesyfy</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div className="px-5 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-400 text-xs font-bold">{initial}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{displayName}</p>
            <p className="text-white/40 text-xs">{isAdmin ? "Super Admin" : "Lojista"}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm group transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/8"
              }`}
            >
              <item.icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  active ? "text-emerald-400" : "group-hover:text-emerald-400"
                }`}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors text-sm w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sair
        </button>
      </div>
    </>
  )
}

interface AppShellProps {
  role: string
  userName: string | null
  userEmail: string | null
  children: React.ReactNode
}

export function AppShell({ role, userName, userEmail, children }: AppShellProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Fecha sidebar ao navegar
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Fecha com Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  // Trava scroll do body quando sidebar mobile está aberta
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const isAdmin = role === "SUPER_ADMIN"
  const navItems = isAdmin ? adminNav : lojistaNav
  const initial = (userName ?? userEmail ?? "?")[0].toUpperCase()
  const displayName = userName ?? userEmail ?? "Usuário"

  function isActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href)
  }

  const sharedProps: SidebarContentProps = {
    navItems,
    initial,
    displayName,
    isAdmin,
    isActive,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ─── Desktop sidebar ─── */}
      <aside className="hidden lg:flex w-60 bg-black flex-col flex-shrink-0">
        <SidebarContent {...sharedProps} />
      </aside>

      {/* ─── Mobile backdrop ─── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ─── Mobile sidebar drawer ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-black flex flex-col lg:hidden
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-modal="true"
        role="dialog"
      >
        <SidebarContent {...sharedProps} onClose={() => setOpen(false)} />
      </aside>

      {/* ─── Content area ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar
          userName={userName}
          userEmail={userEmail}
          role={role}
          onMenuClick={() => setOpen(true)}
        />

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
