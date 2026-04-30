// src/app/dashboard/metrics/_components/admin-metrics.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Users, 
  Calendar,
  Star,
  AlertTriangle,
  UserCheck,
  ClipboardList,
  Briefcase,
  CalendarCheck,
  Target,
  AlertCircle,
  RefreshCcw,
  CreditCard,
  XCircle
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Metrics {
  users: {
    total: number
    active: number
    inactive: number
    newLast30Days: number
  }
  financial: {
    mrr: number
    mrrGrowth: number
    arpu: number
    ltv: number
    churnRate: number
  }
  subscriptions: {
    free: number
    professional: number
  }
  risks: {
    scheduledCancellations: number
    pastDuePayments: number
    refunds: number
    churnedLast30Days: number
  }
  profiles: {
    total: number
    info: number
    waitlist: number
  }
  appointments: {
    total: number
    confirmed: number
    conversionRate: number
    last30Days: number
  }
  reviews: {
    total: number
    pending: number
    approved: number
    averageRating: number
  }
  others: {
    waitlist: number
    services: number
    slots: number
  }
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tooltip,
  trend,
  trendValue,
  variant = "default"
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: any
  tooltip: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  variant?: "default" | "success" | "warning" | "danger"
}) {
  const variants = {
    default: "from-emerald-100 to-teal-100",
    success: "from-green-100 to-emerald-100",
    warning: "from-yellow-100 to-orange-100",
    danger: "from-red-100 to-pink-100"
  }

  const iconColors = {
    default: "text-emerald-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="border-emerald-200 hover:shadow-lg transition-all cursor-help">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600">{title}</p>
                <div className={`w-8 h-8 bg-gradient-to-br ${variants[variant]} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${iconColors[variant]}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {subtitle && (
                  <p className="text-xs text-gray-500">{subtitle}</p>
                )}
                {trend && trendValue && (
                  <div className="flex items-center gap-1">
                    {trend === "up" && <TrendingUp className="h-3 w-3 text-green-600" />}
                    {trend === "down" && <TrendingDown className="h-3 w-3 text-red-600" />}
                    <span className={`text-xs font-medium ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600"}`}>
                      {trendValue}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function AdminMetrics({ metrics }: { metrics: Metrics }) {
  return (
    <div className="space-y-6">
      {/* 💰 FINANCEIRO */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          Métricas Financeiras
        </h2>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <MetricCard
            title="MRR"
            value={`R$ ${metrics.financial.mrr.toFixed(2)}`}
            subtitle={`+R$ ${metrics.financial.mrrGrowth.toFixed(2)} (30d)`}
            icon={DollarSign}
            tooltip="Monthly Recurring Revenue: Receita recorrente mensal. É a receita previsível que você recebe todo mês dos assinantes Professional."
            trend="up"
            trendValue={`+${metrics.financial.mrrGrowth.toFixed(0)}`}
            variant="success"
          />
          
          <MetricCard
            title="ARPU"
            value={`R$ ${metrics.financial.arpu}`}
            subtitle="por usuário/mês"
            icon={Target}
            tooltip="Average Revenue Per User: Receita média por usuário. Calculado dividindo o MRR pelo total de usuários. Indica quanto cada usuário gera em média."
            variant="default"
          />

          <MetricCard
            title="LTV"
            value={`R$ ${metrics.financial.ltv}`}
            subtitle="estimado (12 meses)"
            icon={TrendingUp}
            tooltip="Lifetime Value: Valor estimado que um cliente Professional gera durante 12 meses de relacionamento. Usado para calcular quanto investir em aquisição."
            variant="success"
          />

          <MetricCard
            title="Churn Rate"
            value={`${metrics.financial.churnRate}%`}
            subtitle={`${metrics.risks.churnedLast30Days} cancelados (30d)`}
            icon={TrendingDown}
            tooltip="Taxa de Cancelamento: Percentual de clientes que cancelaram nos últimos 30 dias. Meta ideal: menos de 5% ao mês. Alto churn indica problemas no produto."
            trend={parseFloat(metrics.financial.churnRate.toString()) > 5 ? "down" : "neutral"}
            trendValue={`${metrics.risks.churnedLast30Days} saídas`}
            variant={parseFloat(metrics.financial.churnRate.toString()) > 5 ? "danger" : "success"}
          />

          <MetricCard
            title="Assinantes Pro"
            value={metrics.subscriptions.professional}
            subtitle={`${metrics.subscriptions.free} Free`}
            icon={UserCheck}
            tooltip="Total de assinantes pagantes (Professional) vs gratuitos (Free). Foque em converter Free para Professional para aumentar o MRR."
            variant="default"
          />
        </div>
      </div>

      {/* ⚠️ RISCOS */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Alertas de Risco
        </h2>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <MetricCard
            title="Cancelamentos Agendados"
            value={metrics.risks.scheduledCancellations}
            subtitle="para fim do período"
            icon={AlertCircle}
            tooltip="Assinaturas que serão canceladas automaticamente no fim do período atual. Aja rápido: entre em contato para entender o motivo e tentar reverter."
            variant={metrics.risks.scheduledCancellations > 0 ? "warning" : "success"}
          />

          <MetricCard
            title="Pagamentos Atrasados"
            value={metrics.risks.pastDuePayments}
            subtitle="em atraso"
            icon={CreditCard}
            tooltip="Assinaturas com falha no pagamento (status past_due). Stripe tenta cobrar automaticamente, mas monitore para evitar churn involuntário."
            variant={metrics.risks.pastDuePayments > 0 ? "danger" : "success"}
          />

          <MetricCard
            title="Reembolsos"
            value={metrics.risks.refunds}
            subtitle="processados"
            icon={RefreshCcw}
            tooltip="Total de reembolsos processados. Alto número indica insatisfação. Implemente webhook do Stripe 'charge.refunded' para rastrear automaticamente."
            variant={metrics.risks.refunds > 0 ? "warning" : "success"}
          />

          <MetricCard
            title="Churn (30d)"
            value={metrics.risks.churnedLast30Days}
            subtitle="cancelados"
            icon={XCircle}
            tooltip="Total de cancelamentos nos últimos 30 dias. Analise os motivos e implemente ações de retenção para reduzir este número."
            variant={metrics.risks.churnedLast30Days > 3 ? "danger" : "success"}
          />
        </div>
      </div>

      {/* 👥 USUÁRIOS */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-600" />
          Usuários
        </h2>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <MetricCard
            title="Total Profissionais"
            value={metrics.users.total}
            subtitle={`+${metrics.users.newLast30Days} novos (30d)`}
            icon={Users}
            tooltip="Total de profissionais cadastrados na plataforma. Inclui ativos, inativos e todos os tipos de plano."
            trend="up"
            trendValue={`+${metrics.users.newLast30Days}`}
            variant="default"
          />

          <MetricCard
            title="Ativos"
            value={metrics.users.active}
            subtitle={`${((metrics.users.active/metrics.users.total)*100).toFixed(1)}% do total`}
            icon={UserCheck}
            tooltip="Profissionais com perfil ativo. Meta: manter acima de 80%. Usuários inativos indicam baixo engajamento."
            variant="success"
          />

          <MetricCard
            title="Perfil Completo"
            value={metrics.profiles.total}
            subtitle="com agendamento"
            icon={CalendarCheck}
            tooltip="Profissionais com perfil TOTAL (agendamento online completo). Estes geram mais valor e engajamento na plataforma."
            variant="default"
          />

          <MetricCard
            title="Lista de Espera"
            value={metrics.profiles.waitlist}
            subtitle="apenas lista"
            icon={ClipboardList}
            tooltip="Profissionais com perfil WAITLIST. Incentive a migração para perfil TOTAL ou INFO para aumentar o valor percebido."
            variant="default"
          />
        </div>
      </div>

      {/* 📅 AGENDAMENTOS */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-600" />
          Agendamentos
        </h2>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <MetricCard
            title="Total Agendamentos"
            value={metrics.appointments.total}
            subtitle={`+${metrics.appointments.last30Days} (30d)`}
            icon={Calendar}
            tooltip="Total de agendamentos criados na plataforma. Crescimento constante indica boa adoção pelos pacientes."
            trend="up"
            trendValue={`+${metrics.appointments.last30Days}`}
            variant="default"
          />

          <MetricCard
            title="Taxa de Conversão"
            value={`${metrics.appointments.conversionRate}%`}
            subtitle={`${metrics.appointments.confirmed} confirmados`}
            icon={Target}
            tooltip="Percentual de agendamentos confirmados vs criados. Meta: acima de 70%. Baixa taxa indica problemas no fluxo de confirmação."
            variant={metrics.appointments.conversionRate > 70 ? "success" : "warning"}
          />

          <MetricCard
            title="Serviços Ativos"
            value={metrics.others.services}
            subtitle="cadastrados"
            icon={Briefcase}
            tooltip="Total de serviços cadastrados pelos profissionais. Mais serviços = mais opções para pacientes = mais agendamentos."
            variant="default"
          />

          <MetricCard
            title="Horários Disponíveis"
            value={metrics.others.slots}
            subtitle="slots criados"
            icon={CalendarCheck}
            tooltip="Total de slots de horário configurados pelos profissionais. Mais slots = maior disponibilidade = mais agendamentos possíveis."
            variant="default"
          />
        </div>
      </div>

      {/* ⭐ AVALIAÇÕES */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
          Avaliações
        </h2>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <MetricCard
            title="Média Geral"
            value={metrics.reviews.averageRating.toFixed(1)}
            subtitle={`⭐ ${metrics.reviews.total} avaliações`}
            icon={Star}
            tooltip="Média de estrelas das avaliações aprovadas. Boa reputação atrai mais pacientes. Meta: manter acima de 4.0."
            variant={metrics.reviews.averageRating >= 4.0 ? "success" : "warning"}
          />

          <MetricCard
            title="Aprovadas"
            value={metrics.reviews.approved}
            subtitle="visíveis publicamente"
            icon={UserCheck}
            tooltip="Avaliações aprovadas pelos profissionais e visíveis publicamente. Incentive profissionais a responderem para aumentar engajamento."
            variant="success"
          />

          <MetricCard
            title="Pendentes"
            value={metrics.reviews.pending}
            subtitle="aguardando moderação"
            icon={AlertCircle}
            tooltip="Avaliações aguardando aprovação dos profissionais. Muitas pendentes indicam baixo engajamento na moderação."
            variant={metrics.reviews.pending > 10 ? "warning" : "default"}
          />

          <MetricCard
            title="Inscritos Waitlist"
            value={metrics.others.waitlist}
            subtitle="na fila"
            icon={ClipboardList}
            tooltip="Total de pacientes cadastrados em listas de espera. Oportunidade de conversão futura para agendamentos reais."
            variant="default"
          />
        </div>
      </div>
    </div>
  )
}