import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import Link from "next/link"
import {
  Megaphone,
  Key,
  ShoppingBag,
  TrendingUp,
  Plus,
  ArrowRight,
  Building2,
  Users,
  AlertCircle,
  Check,
  Settings,
  ChevronRight,
  Sparkles,
  Layers,
} from "lucide-react"

/* ─── Onboarding Hero ──────────────────────────────────────────── */

const STEPS = [
  { n: 1, key: "loja",     title: "Loja criada",        desc: "Conta e perfil configurados",        href: null,                         cta: null,            icon: Building2  },
  { n: 2, key: "marca",    title: "Identidade visual",  desc: "Logo, cor e dados da loja",          href: "/dashboard/configuracoes",    cta: "Configurar",    icon: Sparkles   },
  { n: 3, key: "layout",   title: "Criar layout",       desc: "Tema visual dos cards impressos",    href: "/dashboard/layout/novo",      cta: "Criar layout",  icon: Layers     },
  { n: 4, key: "campanha", title: "Primeira campanha",  desc: "Crie sua oferta de cortesia",        href: "/dashboard/campanhas/nova",   cta: "Criar agora",   icon: Megaphone  },
  { n: 5, key: "chaves",   title: "Gerar chaves",       desc: "Produza os códigos com QR Code",     href: "/dashboard/chaves/gerar",     cta: "Gerar chaves",  icon: Key        },
  { n: 6, key: "resgate",  title: "Validar resgate",    desc: "Confirme o benefício no balcão",     href: "/dashboard/resgates",         cta: "Validar agora", icon: ShoppingBag},
]

function OnboardingHero({
  passos, passosFeitos, nome,
}: { passos: Record<string, boolean>; passosFeitos: number; nome: string }) {
  const pct    = Math.round((passosFeitos / 6) * 100)
  const r      = 22
  const circum = 2 * Math.PI * r
  const next   = STEPS.find((s) => !passos[s.key])

  return (
    <div className="relative mb-8 rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #020c06 0%, #041a0e 50%, #020c06 100%)",
        boxShadow: "0 0 0 1px rgba(16,185,129,0.18), 0 24px 48px rgba(0,0,0,0.25)",
      }}>
      {/* Grid */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)",
        backgroundSize: "36px 36px",
      }} />
      {/* Orb */}
      <div aria-hidden className="absolute pointer-events-none" style={{
        top: "-60px", right: "10%", width: "300px", height: "300px",
        background: "radial-gradient(ellipse, rgba(16,185,129,0.14), transparent 65%)", borderRadius: "50%",
      }} />

      {/* Cabeçalho */}
      <div className="relative z-10 px-6 pt-7 pb-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mb-2"
            style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
            Configuração inicial
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
            {passosFeitos === 1 ? `Bem-vindo, ${nome}! Configure sua loja 🚀`
              : passosFeitos < 5 ? "Continue configurando — está quase pronto"
              : "Último passo! Sua loja está quase live"}
          </h2>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            {passosFeitos} de 6 etapas concluídas
            {next && <> · próximo: <span style={{ color: "#34d399" }}>{next.title}</span></>}
          </p>
        </div>
        {/* Anel SVG */}
        <div className="relative flex-shrink-0 w-16 h-16">
          <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
            <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="5" />
            <circle cx="32" cy="32" r={r} fill="none" stroke="#10b981" strokeWidth="5"
              strokeLinecap="round" strokeDasharray={circum}
              strokeDashoffset={circum * (1 - pct / 100)}
              style={{ transition: "stroke-dashoffset 0.6s ease" }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-extrabold" style={{ color: "#10b981" }}>{pct}%</span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="relative z-10 px-4 pb-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {STEPS.map((step) => {
          const done   = passos[step.key]
          const isCurr = !done && STEPS.findIndex((s) => !passos[s.key]) === step.n - 1
          const Icon   = step.icon
          return (
            <div key={step.key} className="rounded-2xl p-4 flex flex-col gap-3 transition-all" style={{
              background: done ? "rgba(16,185,129,0.10)" : isCurr ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
              border: done ? "1px solid rgba(16,185,129,0.30)" : isCurr ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.06)",
            }}>
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={done ? { background: "#10b981", color: "#fff" }
                    : isCurr ? { background: "rgba(255,255,255,0.12)", color: "#fff" }
                    : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)" }}>
                  {done ? <Check className="w-3.5 h-3.5" /> : step.n}
                </div>
                <Icon className="w-4 h-4 flex-shrink-0"
                  style={{ color: done ? "#10b981" : isCurr ? "rgba(255,255,255,0.60)" : "rgba(255,255,255,0.18)" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight"
                  style={{ color: done ? "rgba(255,255,255,0.45)" : isCurr ? "#fff" : "rgba(255,255,255,0.30)",
                    textDecoration: done ? "line-through" : "none" }}>
                  {step.title}
                </p>
                <p className="text-xs mt-0.5 leading-snug"
                  style={{ color: done ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.35)" }}>
                  {step.desc}
                </p>
              </div>
              {!done && step.href && (
                <Link href={step.href}
                  className="flex items-center justify-between w-full rounded-xl px-3 py-2 text-xs font-bold transition-all"
                  style={isCurr
                    ? { background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 0 18px rgba(16,185,129,0.40)" }
                    : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {step.cta}<ChevronRight className="w-3 h-3" />
                </Link>
              )}
              {done && <span className="text-xs font-semibold" style={{ color: "#10b981" }}>✓ Concluído</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Dashboard page ───────────────────────────────────────────── */

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  if (session.user.role === "SUPER_ADMIN") return <SuperAdminDashboard />
  if (!session.user.lojaId) redirect("/onboarding/loja")

  const lojaId = session.user.lojaId

  const [loja, campanhasAtivas, totalChaves, resgatesToday] = await Promise.all([
    db.loja.findUnique({ where: { id: lojaId }, select: { nome: true, plano: true, status: true, logoUrl: true, corPrimaria: true } }),
    db.campanha.count({ where: { lojaId, status: "ATIVA" } }),
    db.chave.count({ where: { lojaId } }),
    db.resgate.count({ where: { lojaId, resgatadoEm: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
  ])

  const [chavesAtivas, totalCampanhas, temResgate] = await Promise.all([
    db.chave.count({ where: { lojaId, status: { in: ["GERADA", "ATIVADA"] } } }),
    db.campanha.count({ where: { lojaId } }),
    db.resgate.count({ where: { lojaId } }),
  ])

  const [temLayout] = await Promise.all([
    db.layout.count({ where: { lojaId } }),
  ])

  const passos = {
    loja:     true,
    marca:    !!(loja?.logoUrl || loja?.corPrimaria !== "#10b981"),
    layout:   temLayout > 0,
    campanha: totalCampanhas > 0,
    chaves:   totalChaves > 0,
    resgate:  temResgate > 0,
  }
  const passosFeitos = Object.values(passos).filter(Boolean).length
  const onboardingOk = passosFeitos === 6
  const semDados     = totalChaves === 0 && campanhasAtivas === 0

  const stats = [
    { label: "Campanhas ativas",   value: campanhasAtivas, icon: Megaphone,   cls: "dash-icon-emerald", href: "/dashboard/campanhas" },
    { label: "Chaves geradas",     value: totalChaves,     icon: Key,          cls: "dash-icon-blue",    href: "/dashboard/chaves"    },
    { label: "Chaves disponíveis", value: chavesAtivas,    icon: TrendingUp,   cls: "dash-icon-purple",  href: "/dashboard/chaves"    },
    { label: "Resgates hoje",      value: resgatesToday,   icon: ShoppingBag,  cls: "dash-icon-orange",  href: "/dashboard/resgates"  },
  ]

  return (
    <div>
      {!onboardingOk && (
        <OnboardingHero passos={passos} passosFeitos={passosFeitos}
          nome={session.user.name?.split(" ")[0] ?? "Lojista"} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold dash-title">
            {onboardingOk ? `Olá, ${session.user.name?.split(" ")[0] ?? "Lojista"} 👋` : "Visão geral"}
          </h1>
          <p className="dash-subtitle mt-0.5 text-sm truncate">{loja?.nome}</p>
        </div>
        <Link href="/dashboard/campanhas/nova"
          className="flex-shrink-0 inline-flex items-center gap-2 dash-btn-primary px-3 sm:px-4 py-2.5 rounded-xl text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Nova campanha</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="dash-card-hover p-5 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.cls}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 dark:text-white/20 group-hover:text-emerald-500 transition-colors" />
            </div>
            <p className="text-3xl font-bold dash-title">{stat.value}</p>
            <p className="text-sm dash-subtitle mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {semDados && (
        <div className="dash-card border-dashed p-10 text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 dash-icon-emerald">
            <Megaphone className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold dash-title mb-2">Comece criando sua primeira campanha</h2>
          <p className="dash-subtitle text-sm max-w-md mx-auto mb-6">
            Crie uma campanha, gere um lote de chaves únicas com QR Code e distribua para seus clientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/campanhas/nova"
              className="inline-flex items-center justify-center gap-2 dash-btn-primary px-6 py-3 rounded-xl text-sm">
              <Plus className="w-4 h-4" />Criar campanha
            </Link>
            <Link href="/dashboard/chaves"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 text-sm font-medium px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <Key className="w-4 h-4" />Gerenciar chaves
            </Link>
          </div>
        </div>
      )}

      {/* Ações rápidas */}
      {!semDados && (
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { href: "/dashboard/campanhas/nova", icon: Megaphone,  cls: "dash-icon-emerald", hov: "dark:hover:border-emerald-500/30", label: "Nova campanha",   sub: "Criar e configurar" },
            { href: "/dashboard/chaves",         icon: Key,         cls: "dash-icon-blue",    hov: "dark:hover:border-blue-500/30",    label: "Gerar chaves",    sub: "Criar novo lote"    },
            { href: "/dashboard/resgates",       icon: ShoppingBag, cls: "dash-icon-orange",  hov: "dark:hover:border-orange-500/30",  label: "Validar resgate", sub: "Scanner de chave"   },
          ].map((a) => (
            <Link key={a.href} href={a.href}
              className={`dash-card-hover ${a.hov} p-5 group flex items-center gap-4`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.cls}`}>
                <a.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold dash-title text-sm">{a.label}</p>
                <p className="dash-subtitle text-xs mt-0.5">{a.sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 dark:text-white/20 group-hover:text-emerald-500 ml-auto transition-colors" />
            </Link>
          ))}
        </div>
      )}

      {/* Plano */}
      {loja?.plano === "ESSENCIAL" && (
        <div className="mt-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">Você está no plano Essencial</p>
            <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">Limite de 3 campanhas e 100 chaves/mês.</p>
          </div>
          <Link href="/dashboard/configuracoes/plano"
            className="text-amber-700 dark:text-amber-400 text-xs font-semibold hover:text-amber-900 whitespace-nowrap">
            Ver planos →
          </Link>
        </div>
      )}
    </div>
  )
}

/* ─── Super Admin ──────────────────────────────────────────────── */

async function SuperAdminDashboard() {
  const [totalLojas, totalUsuarios, totalChaves, resgatesToday] = await Promise.all([
    db.loja.count(),
    db.user.count(),
    db.chave.count(),
    db.resgate.count({ where: { resgatadoEm: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
  ])
  const lojasRecentes = await db.loja.findMany({
    take: 5, orderBy: { criadoEm: "desc" },
    select: { id: true, nome: true, plano: true, status: true, criadoEm: true },
  })

  const stats = [
    { label: "Lojas cadastradas", value: totalLojas,    icon: Building2,   cls: "dash-icon-emerald", href: "/dashboard/lojas"    },
    { label: "Usuários",          value: totalUsuarios, icon: Users,        cls: "dash-icon-blue",    href: "/dashboard/usuarios" },
    { label: "Total de chaves",   value: totalChaves,   icon: Key,          cls: "dash-icon-purple",  href: "/dashboard/chaves"   },
    { label: "Resgates hoje",     value: resgatesToday, icon: ShoppingBag,  cls: "dash-icon-orange",  href: "/dashboard/resgates" },
  ]

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold dash-title">Painel Super Admin</h1>
        <p className="dash-subtitle mt-0.5 text-sm">Visão geral de toda a plataforma</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="dash-card-hover p-5 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.cls}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 dark:text-white/20 group-hover:text-emerald-500 transition-colors" />
            </div>
            <p className="text-3xl font-bold dash-title">{s.value}</p>
            <p className="text-sm dash-subtitle mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>
      <div className="dash-card overflow-hidden">
        <div className="px-5 py-4 border-b dash-border flex items-center justify-between">
          <h2 className="font-semibold dash-title">Lojas recentes</h2>
          <Link href="/dashboard/lojas" className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium">Ver todas →</Link>
        </div>
        {lojasRecentes.length === 0 ? (
          <div className="px-5 py-10 text-center dash-subtitle text-sm">Nenhuma loja cadastrada ainda.</div>
        ) : (
          <div className="divide-y dash-divider">
            {lojasRecentes.map((loja) => (
              <div key={loja.id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-gray-500 dark:text-white/40" />
                  </div>
                  <div>
                    <p className="text-sm font-medium dash-title">{loja.nome}</p>
                    <p className="text-xs dash-muted">{new Date(loja.criadoEm).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${loja.plano === "ESSENCIAL" ? "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60" : loja.plano === "PROFISSIONAL" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>{loja.plano}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${loja.status === "ATIVA" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"}`}>{loja.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
