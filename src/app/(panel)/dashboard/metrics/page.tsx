// src/app/dashboard/metrics/page.tsx
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth";
import { AdminMetrics } from "./_components/admin-metrics";
import { AdminBanner } from "../_components/admin-banner";

export default async function MetricsPage() {
  // Autenticação
  const session = await auth();
  
  // ✅ USAR redirect() ao invés de NextResponse
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }
  
  // ✅ MÉTRICAS BÁSICAS
  
  // 1. Usuários
  const totalUsers = await prisma.user.count()
  const activeUsers = await prisma.user.count({ where: { status: true } })
  const inactiveUsers = totalUsers - activeUsers
  
  // 2. Planos
  const freeUsers = await prisma.subscription.count({
    where: { plan: "FREE", status: "active" }
  })
  const professionalUsers = await prisma.subscription.count({
    where: { plan: "PROFESSIONAL", status: "active" }
  })

  // 3. Tipos de Perfil
  const totalProfile = await prisma.user.count({ where: { typeProfile: "TOTAL" } })
  const infoProfile = await prisma.user.count({ where: { typeProfile: "INFO" } })
  const waitlistProfile = await prisma.user.count({ where: { typeProfile: "WAITLIST" } })

  // 4. Agendamentos
  const totalAppointments = await prisma.appointment.count()
  const confirmedAppointments = await prisma.appointment.count({
    where: { confirmed: true }
  })
  const conversionRate = totalAppointments > 0 
    ? ((confirmedAppointments / totalAppointments) * 100).toFixed(1)
    : "0"

  // 5. Reviews
  const totalReviews = await prisma.review.count()
  const pendingReviews = await prisma.review.count({ where: { status: "PENDING" } })
  const approvedReviews = await prisma.review.count({ where: { status: "APPROVED" } })
  const avgRating = await prisma.review.aggregate({
    where: { status: "APPROVED" },
    _avg: { rating: true }
  })

  // 6. Lista de Espera
  const totalWaitlist = await prisma.waitlist.count()

  // 7. Serviços e Slots
    const totalTypeServices = await prisma.userTypeService.count({ 
    where: { 
      active: true  // Só tipos ativos
    } 
  })  

  const totalSlots = await prisma.availableSlot.count()

  // 8. Últimos 30 dias
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const newUsersLast30Days = await prisma.user.count({
    where: { createdAt: { gte: thirtyDaysAgo } }
  })

  const appointmentsLast30Days = await prisma.appointment.count({
    where: { createdAt: { gte: thirtyDaysAgo } }
  })

  // ✅ NOVAS MÉTRICAS FINANCEIRAS
  
  // MRR (Monthly Recurring Revenue)
  const mrr = professionalUsers * 97.90
  
  // Crescimento MRR (últimos 30 dias)
  const newProUsersLast30Days = await prisma.subscription.count({
    where: {
      plan: "PROFESSIONAL",
      status: "active",
      createdAt: { gte: thirtyDaysAgo }
    }
  })
  const mrrGrowth = newProUsersLast30Days * 97.90

  // Churn Rate (cancelamentos vs ativos)
  // Nota: Para churn real, você precisaria armazenar data de cancelamento
  const canceledLast30Days = await prisma.subscription.count({
    where: {
      status: "canceled", // ou "cancelled" dependendo do Stripe
      updatedAt: { gte: thirtyDaysAgo }
    }
  })
  const churnRate = professionalUsers > 0
    ? ((canceledLast30Days / professionalUsers) * 100).toFixed(2)
    : "0"

  // ARPU (Average Revenue Per User)
  const arpu = totalUsers > 0 ? (mrr / totalUsers).toFixed(2) : "0"

  // LTV estimado (12 meses de retenção estimada)
  const ltv = professionalUsers > 0 ? (97.90 * 12).toFixed(2) : "0"

  // ✅ MÉTRICAS DE RISCO
  
  // Cancelamentos Agendados
  // Nota: Stripe armazena isso em subscription.cancel_at_period_end
  const scheduledCancellations = await prisma.subscription.count({
    where: {
      status: "active",
      // Adicionar campo no schema se necessário: cancelAtPeriodEnd: true
    }
  })

  // Pagamentos Atrasados
  // Nota: Stripe webhook 'invoice.payment_failed' deve criar registro
  // Por enquanto, estimativa baseada em subscriptions com status 'past_due'
  const pastDuePayments = await prisma.subscription.count({
    where: {
      status: "past_due"
    }
  })

  // Reembolsos
  // Nota: Stripe webhook 'charge.refunded' deve registrar isso
  // Por enquanto, você precisaria de uma tabela Refund
  const totalRefunds = 0 // Implementar quando tiver tabela de refunds

  const metrics = {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      newLast30Days: newUsersLast30Days,
    },
    financial: {
      mrr: mrr,
      mrrGrowth: mrrGrowth,
      arpu: parseFloat(arpu),
      ltv: parseFloat(ltv),
      churnRate: parseFloat(churnRate),
    },
    subscriptions: {
      free: freeUsers,
      professional: professionalUsers,
    },
    risks: {
      scheduledCancellations: scheduledCancellations,
      pastDuePayments: pastDuePayments,
      refunds: totalRefunds,
      churnedLast30Days: canceledLast30Days,
    },
    profiles: {
      total: totalProfile,
      info: infoProfile,
      waitlist: waitlistProfile,
    },
    appointments: {
      total: totalAppointments,
      confirmed: confirmedAppointments,
      conversionRate: parseFloat(conversionRate),
      last30Days: appointmentsLast30Days,
    },
    reviews: {
      total: totalReviews,
      pending: pendingReviews,
      approved: approvedReviews,
      averageRating: avgRating._avg.rating || 0,
    },
    others: {
      waitlist: totalWaitlist,
      services: totalTypeServices,
      slots: totalSlots,
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        <AdminBanner />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Métricas do Sistema</h1>
          <p className="text-gray-600 mt-2">
            Painel completo para tomada de decisões estratégicas
          </p>
        </div>
        <AdminMetrics metrics={metrics} />
      </div>
    </div>
  )
}