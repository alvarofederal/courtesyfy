import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import {
  LayoutDashboard,
  Megaphone,
  Key,
  ShoppingBag,
  BarChart3,
  Settings,
  Users,
  Building2,
  LogOut,
} from "lucide-react"
import { SignOutButton } from "./_components/sign-out-button"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role
  const isSuperAdmin = role === "SUPER_ADMIN"

  const lojistaNav = [
    { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
    { href: "/dashboard/campanhas", label: "Campanhas", icon: Megaphone },
    { href: "/dashboard/chaves", label: "Chaves", icon: Key },
    { href: "/dashboard/resgates", label: "Resgates", icon: ShoppingBag },
    { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart3 },
    { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
  ]

  const adminNav = [
    { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
    { href: "/dashboard/lojas", label: "Lojas", icon: Building2 },
    { href: "/dashboard/usuarios", label: "Usuários", icon: Users },
    { href: "/dashboard/campanhas", label: "Campanhas", icon: Megaphone },
    { href: "/dashboard/chaves", label: "Chaves", icon: Key },
    { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart3 },
    { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
  ]

  const navItems = isSuperAdmin ? adminNav : lojistaNav

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-black flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Key className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-base tracking-tight">Courtesyfy</span>
          </Link>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 text-xs font-bold">
                {(session.user.name ?? session.user.email ?? "?")[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">
                {session.user.name ?? session.user.email}
              </p>
              <p className="text-white/40 text-xs">
                {isSuperAdmin ? "Super Admin" : "Lojista"}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-colors text-sm group"
            >
              <item.icon className="w-4 h-4 flex-shrink-0 group-hover:text-emerald-400 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/10">
          <SignOutButton />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
