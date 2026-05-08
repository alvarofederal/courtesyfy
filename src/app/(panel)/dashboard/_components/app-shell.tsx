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

/* ─── Navegação na ordem do onboarding ──────────────────────────
   LojistaNav: espelha os passos do onboarding para facilitar a UX
   1 → Dashboard (visão geral)
   2 → Configurações (Identidade visual — passo 2)
   3 → Layout (criar tema visual — passo 3)
   4 → Campanhas (passo 4)
   5 → Chaves (passo 5)
   6 → Resgates (passo 6)
   7 → Relatórios
   ──────────────────────────────────────────────────────────────── */

const lojistaNav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard",               label: "Visão Geral",   icon: LayoutDashboard },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings        },
  { href: "/dashboard/layout",        label: "Layout",        icon: Layers          },
  { href: "/dashboard/campanhas",     label: "Campanhas",     icon: Megaphone       },
  { href: "/dashboard/chaves",        label: "Chaves",        icon: Key             },
  { href: "/dashboard/resgates",      label: "Resgates",      icon: ShoppingBag     },
  { href: "/dashboard/relatorios",    label: "Relatórios",    icon: BarChart3       },
]

const adminNav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard",               label: "Visão Geral",   icon: LayoutDashboard },
  { href: "/dashboard/lojas",         label: "Lojas",         icon: Building2       },
  { href: "/dashboard/usuarios",      label: "Usuários",      icon: Users           },
  { href: "/dashboard/campanhas",     label: "Campanhas",     icon: Megaphone       },
  { href: "/dashboard/chaves",        label: "Chaves",        icon: Key             },
  { href: "/dashboard/relatorios",    label: "Relatórios",    icon: BarChart3       },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings        },
]

/* ─── Sidebar — sempre dark (identidade de marca) ──────────────── */

interface SidebarContentProps {
  navItems: typeof lojistaNav
  initial: string
  displayName: string
  isAdmin: boolean
  isActive: (href: string) => boolean
  onClose?: () => void
}

function SidebarContent({ navItems, initial, displayName, isAdmin, isActive, onClose }: SidebarContentProps) {
  return (
    <>
      {/* Logo — texto puro com efeito vidro, sem ícone */}
      <div className="px-5 py-5 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/dashboard" onClick={onClose} className="logo-shine flex items-center">
          <span className="text-white font-extrabold text-lg tracking-tight select-none"
            style={{ fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif", letterSpacing: "-0.02em" }}>
            Courtesy<span className="logo-fy-pulse" style={{ color: "#10b981" }}>fy</span>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseOver={e => (e.currentTarget.style.color = "white")}
            onMouseOut={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            aria-label="Fechar menu">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User */}
      <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(16,185,129,0.18)", border: "1px solid rgba(16,185,129,0.30)" }}>
            <span className="text-emerald-400 text-xs font-bold">{initial}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{displayName}</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              {isAdmin ? "Super Admin" : "Lojista"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm group transition-all"
              style={{
                background: active ? "rgba(16,185,129,0.12)" : "transparent",
                color:      active ? "#fff" : "rgba(255,255,255,0.50)",
                border:     active ? "1px solid rgba(16,185,129,0.20)" : "1px solid transparent",
              }}
              onMouseOver={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff" } }}
              onMouseOut={e =>  { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.50)" } }}>
              <item.icon
                className="w-4 h-4 flex-shrink-0 transition-colors"
                style={{ color: active ? "#10b981" : undefined }}
              />
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm w-full transition-all"
          style={{ color: "rgba(255,255,255,0.35)" }}
          onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)" }}
          onMouseOut={e =>  { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.35)" }}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sair
        </button>
      </div>
    </>
  )
}

/* ─── AppShell ──────────────────────────────────────────────────── */

interface AppShellProps {
  role: string
  userName: string | null
  userEmail: string | null
  children: React.ReactNode
}

export function AppShell({ role, userName, userEmail, children }: AppShellProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [open])
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const isAdmin     = role === "SUPER_ADMIN"
  const navItems    = isAdmin ? adminNav : lojistaNav
  const initial     = (userName ?? userEmail ?? "?")[0].toUpperCase()
  const displayName = userName ?? userEmail ?? "Usuário"

  function isActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href)
  }

  const sharedProps: SidebarContentProps = { navItems, initial, displayName, isAdmin, isActive }

  /* Sidebar — sempre dark, independente do tema */
  const sidebarBg = "linear-gradient(180deg, #020c06 0%, #030f08 100%)"

  return (
    /* Wrapper principal — bg responsivo via CSS (dark/light) */
    <div className="flex h-screen overflow-hidden dash-bg">

      {/* ── Desktop sidebar (sempre dark) ── */}
      <aside className="hidden lg:flex w-60 flex-col flex-shrink-0 relative"
        style={{ background: sidebarBg, borderRight: "1px solid rgba(255,255,255,0.07)" }}>
        {/* Orb sutil */}
        <div aria-hidden className="absolute pointer-events-none"
          style={{
            top: "-40px", left: "-20px", width: "200px", height: "200px",
            background: "radial-gradient(ellipse, rgba(16,185,129,0.12), transparent 65%)",
            borderRadius: "50%",
          }} />
        <SidebarContent {...sharedProps} />
      </aside>

      {/* ── Mobile backdrop ── */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)} aria-hidden />
      )}

      {/* ── Mobile drawer (sempre dark) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col lg:hidden transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: sidebarBg, borderRight: "1px solid rgba(255,255,255,0.07)" }}
        aria-modal role="dialog">
        <SidebarContent {...sharedProps} onClose={() => setOpen(false)} />
      </aside>

      {/* ── Área principal ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar userName={userName} userEmail={userEmail} role={role} onMenuClick={() => setOpen(true)} />

        {/* Grid overlay — visível no dark, quase invisível no light */}
        <div aria-hidden className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />

        {/* Orb superior esmeralda */}
        <div aria-hidden className="fixed pointer-events-none z-0"
          style={{
            width: "600px", height: "400px",
            top: "-150px", left: "50%",
            transform: "translateX(-50%)",
            background: "radial-gradient(ellipse, rgba(16,185,129,0.08), transparent 65%)",
            borderRadius: "50%",
          }} />

        <main className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
