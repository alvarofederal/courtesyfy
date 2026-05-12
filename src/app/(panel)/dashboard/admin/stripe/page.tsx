import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import {
  CheckCircle2, XCircle, AlertTriangle, ExternalLink,
  Zap, CreditCard, Webhook, Users, ChevronRight, Copy,
} from "lucide-react"

// ─── helpers ──────────────────────────────────────────────────────

function fmt(amount: number | null, currency: string) {
  if (amount === null) return "—"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100)
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("pt-BR")
}

const PLANO_LABELS: Record<string, string> = {
  ESSENCIAL:     "Essencial",
  PROFISSIONAL:  "Profissional",
  EMPRESARIAL:   "Empresarial",
}

// ─── Componentes visuais ──────────────────────────────────────────

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
      ok
        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
        : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30"
    }`}>
      {ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </span>
  )
}

// ─── Page ────────────────────────────────────────────────────────

export default async function AdminStripePage() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/dashboard")

  const appUrl = process.env.NEXTAUTH_URL ?? "https://courtesyfy.com"
  const webhookUrl = `${appUrl}/api/webhook`

  // ── 1. Testar conexão com Stripe ──────────────────────────────
  let stripeAccount: { name: string; mode: string } | null = null
  let stripeError: string | null = null

  try {
    // list 1 customer é o jeito mais simples de validar a key
    await stripe.customers.list({ limit: 1 })
    const isLive = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_")
    stripeAccount = { name: "Courtesyfy", mode: isLive ? "Produção (Live)" : "Teste (Test)" }
  } catch (err) {
    stripeError = err instanceof Error ? err.message : "Erro desconhecido"
  }

  // ── 2. Buscar detalhes dos planos no Stripe ───────────────────
  const planConfig = [
    { plano: "ESSENCIAL",    priceId: null,                                   label: "Essencial",    cor: "gray"    },
    { plano: "PROFISSIONAL", priceId: process.env.STRIPE_PLAN_PROFESSIONAL,   label: "Profissional", cor: "emerald" },
    { plano: "EMPRESARIAL",  priceId: process.env.STRIPE_PLAN_EMPRESARIAL,    label: "Empresarial",  cor: "violet"  },
  ]

  const planosComDetalhes = await Promise.all(
    planConfig.map(async (p) => {
      if (!p.priceId || !stripeAccount) return { ...p, price: null, product: null }
      try {
        const price   = await stripe.prices.retrieve(p.priceId, { expand: ["product"] })
        const product = price.product as { name: string; description: string | null }
        return { ...p, price, product }
      } catch {
        return { ...p, price: null, product: null }
      }
    })
  )

  // ── 3. Stats do banco ─────────────────────────────────────────
  const agora = new Date()

  const [totalLojas, lojasAtivas, lojasProf, lojasEmp, lojasSuspensas, recentes] = await Promise.all([
    db.loja.count(),
    db.loja.count({ where: { status: "ATIVA", stripeCurrentPeriodEnd: { gt: agora } } }),
    db.loja.count({ where: { plano: "PROFISSIONAL" } }),
    db.loja.count({ where: { plano: "EMPRESARIAL" } }),
    db.loja.count({ where: { status: "SUSPENSA" } }),
    db.loja.findMany({
      where: { stripeSubscriptionId: { not: null } },
      orderBy: { atualizadoEm: "desc" },
      take: 8,
      select: {
        id: true, nome: true, email: true, plano: true,
        status: true, stripeCurrentPeriodEnd: true, stripeSubscriptionId: true,
      },
    }),
  ])

  // ── 4. Verificar webhook ──────────────────────────────────────
  const webhookSecretOk = !!process.env.STRIPE_SECRET_WEBHOOK_KEY

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="w-5 h-5 text-emerald-500" />
          <h1 className="text-2xl font-bold dash-title">Stripe — Cobrança</h1>
          {stripeAccount && (
            <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
              stripeAccount.mode.includes("Produção")
                ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
            }`}>
              {stripeAccount.mode}
            </span>
          )}
        </div>
        <p className="dash-muted text-sm">Gerencie a integração com o Stripe, planos e assinaturas das lojas.</p>
      </div>

      <div className="space-y-6">

        {/* ── STATUS DA CONEXÃO ────────────────────────────────── */}
        <div className="dash-card p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="font-semibold dash-title flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Conexão com o Stripe
              </h2>
              <p className="text-xs dash-muted mt-0.5">Status das credenciais configuradas no servidor</p>
            </div>
            <StatusPill ok={!!stripeAccount} label={stripeAccount ? "Conectado" : "Erro"} />
          </div>

          {stripeError && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 mb-4">
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{stripeError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Secret Key",       value: maskKey(process.env.STRIPE_SECRET_KEY), ok: !!process.env.STRIPE_SECRET_KEY },
              { label: "Publishable Key",  value: maskKey(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY), ok: !!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY },
              { label: "Webhook Secret",   value: maskKey(process.env.STRIPE_SECRET_WEBHOOK_KEY), ok: webhookSecretOk },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-3 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                <p className="text-xs dash-muted mb-1">{item.label}</p>
                <div className="flex items-center gap-2">
                  {item.ok
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    : <XCircle     className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  }
                  <code className="text-xs font-mono dash-subtitle truncate">{item.value}</code>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium dash-muted hover:text-emerald-500 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              API Keys no Stripe
            </a>
            <a
              href="https://dashboard.stripe.com/test/webhooks"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium dash-muted hover:text-emerald-500 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Webhooks no Stripe
            </a>
          </div>
        </div>

        {/* ── PLANOS ───────────────────────────────────────────── */}
        <div className="dash-card p-5">
          <h2 className="font-semibold dash-title flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            Planos configurados
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {planosComDetalhes.map((p) => {
              const borderColor = p.cor === "emerald" ? "border-emerald-200 dark:border-emerald-500/30" :
                                  p.cor === "violet"  ? "border-violet-200 dark:border-violet-500/30" :
                                  "border-gray-200 dark:border-white/[0.08]"
              const badgeCls = p.cor === "emerald"
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : p.cor === "violet"
                ? "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400"
                : "bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-white/50"

              return (
                <div key={p.plano} className={`rounded-xl p-4 border ${borderColor} bg-gray-50 dark:bg-white/[0.02]`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeCls}`}>{p.label}</span>
                    {p.price ? <StatusPill ok label="Ativo" /> : p.priceId ? <StatusPill ok={false} label="Erro" /> : null}
                  </div>

                  {p.price ? (
                    <>
                      <p className="text-xl font-bold dash-title mt-2">
                        {fmt(p.price.unit_amount, p.price.currency)}
                        <span className="text-sm font-normal dash-muted">/{p.price.recurring?.interval === "month" ? "mês" : "ano"}</span>
                      </p>
                      {p.product && <p className="text-xs dash-muted mt-0.5">{p.product.name}</p>}
                      <code className="text-xs text-gray-400 dark:text-white/25 mt-2 block truncate font-mono">{p.priceId}</code>
                    </>
                  ) : p.plano === "ESSENCIAL" ? (
                    <p className="text-base font-semibold dash-subtitle mt-2">Gratuito</p>
                  ) : (
                    <div className="mt-2">
                      <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Price ID não configurado
                      </p>
                      <p className="text-xs dash-muted mt-1">Defina <code className="bg-gray-100 dark:bg-white/10 px-1 rounded">STRIPE_PLAN_{p.plano}</code> no .env</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex gap-3">
            <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium dash-muted hover:text-emerald-500 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Produtos & Preços no Stripe
            </a>
          </div>
        </div>

        {/* ── WEBHOOK ──────────────────────────────────────────── */}
        <div className="dash-card p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="font-semibold dash-title flex items-center gap-2">
                <Webhook className="w-4 h-4 text-emerald-500" />
                Webhook
              </h2>
              <p className="text-xs dash-muted mt-0.5">Configure no Stripe Dashboard para ativar/bloquear contas automaticamente</p>
            </div>
            <StatusPill ok={webhookSecretOk} label={webhookSecretOk ? "Secret configurado" : "Secret ausente"} />
          </div>

          {/* URL */}
          <div className="rounded-xl p-3 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] mb-4">
            <p className="text-xs dash-muted mb-1.5">URL do endpoint</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono dash-subtitle flex-1 truncate">{webhookUrl}</code>
              <button
                title="Copiar"
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 dash-muted" />
              </button>
            </div>
          </div>

          {/* Eventos necessários */}
          <p className="text-xs font-semibold dash-subtitle mb-2">Eventos a escutar:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              "checkout.session.completed",
              "invoice.payment_succeeded",
              "invoice.payment_failed",
              "customer.subscription.deleted",
              "customer.subscription.trial_will_end",
            ].map((e) => (
              <code key={e} className="text-xs bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-white/60 px-2 py-0.5 rounded-md">
                {e}
              </code>
            ))}
          </div>

          <a href="https://dashboard.stripe.com/test/webhooks/create" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            <ExternalLink className="w-3.5 h-3.5" />
            Criar webhook no Stripe Dashboard →
          </a>
        </div>

        {/* ── STATS DE ASSINATURAS ─────────────────────────────── */}
        <div className="dash-card p-5">
          <h2 className="font-semibold dash-title flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-emerald-500" />
            Assinaturas
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total de lojas",    value: totalLojas,    color: "dash-title" },
              { label: "Pagantes ativos",   value: lojasAtivas,   color: "text-emerald-600 dark:text-emerald-400" },
              { label: "Profissional",      value: lojasProf,     color: "text-blue-600 dark:text-blue-400" },
              { label: "Suspensas",         value: lojasSuspensas, color: "text-red-500 dark:text-red-400" },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs dash-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Lista das lojas com assinatura */}
          {recentes.length > 0 ? (
            <div className="rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] text-xs font-semibold dash-muted uppercase tracking-wide">
                <span className="col-span-4">Loja</span>
                <span className="col-span-3">Plano</span>
                <span className="col-span-3 hidden sm:block">Vencimento</span>
                <span className="col-span-2 text-right">Status</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {recentes.map((loja) => {
                  const vencida = loja.stripeCurrentPeriodEnd ? loja.stripeCurrentPeriodEnd < new Date() : false
                  return (
                    <Link key={loja.id} href={`/dashboard/lojas/${loja.id}`}
                      className="grid grid-cols-12 gap-2 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors items-center">
                      <div className="col-span-4 min-w-0">
                        <p className="font-medium dash-subtitle truncate">{loja.nome}</p>
                        <p className="text-xs dash-muted truncate">{loja.email}</p>
                      </div>
                      <div className="col-span-3">
                        <span className="text-xs font-semibold dash-subtitle">{PLANO_LABELS[loja.plano]}</span>
                      </div>
                      <div className="col-span-3 hidden sm:block">
                        <span className={`text-xs ${vencida ? "text-red-500 dark:text-red-400" : "dash-muted"}`}>
                          {loja.stripeCurrentPeriodEnd ? fmtDate(loja.stripeCurrentPeriodEnd) : "—"}
                        </span>
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          loja.status === "ATIVA" && !vencida
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                        }`}>
                          {loja.status === "ATIVA" && !vencida ? "Ativo" : "Vencido"}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 dash-muted text-sm">
              Nenhuma loja com assinatura Stripe ainda.
            </div>
          )}
        </div>

        {/* ── AÇÕES RÁPIDAS ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: "https://dashboard.stripe.com/customers",     label: "Clientes",       desc: "Ver todos os customers" },
            { href: "https://dashboard.stripe.com/subscriptions", label: "Assinaturas",    desc: "Gerenciar assinaturas" },
            { href: "https://dashboard.stripe.com/test/webhooks", label: "Webhooks",       desc: "Configurar e testar" },
          ].map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
              className="dash-card p-4 flex items-center justify-between hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors group">
              <div>
                <p className="font-semibold dash-subtitle text-sm">{link.label}</p>
                <p className="text-xs dash-muted">{link.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 dash-muted group-hover:text-emerald-500 transition-colors flex-shrink-0" />
            </a>
          ))}
        </div>

      </div>
    </div>
  )
}

// ── Mascara a key mostrando apenas início e fim ──────────────────
function maskKey(key: string | undefined): string {
  if (!key) return "Não configurada"
  if (key.length <= 12) return "***"
  return `${key.slice(0, 8)}...${key.slice(-4)}`
}
