// src/app/dashboard/reviews/page.tsx
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth";
import { ReviewModerationDashboard } from "./_components/review-moderation-dashboard";

export default async function ReviewsPage() {
  // Autenticação
  const session = await auth();
  
  // ✅ USAR redirect() ao invés de NextResponse
  if (!session?.user?.id) {
    redirect("/")
  }

  // Buscar estatísticas
  const stats = await prisma.review.groupBy({
    by: ['status'],
    where: {
      professionalId: session.user.id
    },
    _count: true
  })

  const pending = stats.find(s => s.status === 'PENDING')?._count || 0
  const approved = stats.find(s => s.status === 'APPROVED')?._count || 0
  const rejected = stats.find(s => s.status === 'REJECTED')?._count || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Comentários</h1>
        <p className="text-gray-600 mt-2">
          Gerencie as avaliações recebidas dos seus pacientes
        </p>
      </div>

      <ReviewModerationDashboard 
        userId={session.user.id}
        initialStats={{ pending, approved, rejected }}
      />
    </div>
  )
}