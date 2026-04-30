// src/app/dashboard/reviews/_components/review-moderation-dashboard.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/star-rating"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Star,
  Loader2,
  Reply,
  Eye
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Review {
  id: string
  rating: number
  comment: string
  patientName: string
  patientEmail: string
  patientPhone: string | null
  createdAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  professionalReply: string | null
  repliedAt: string | null
  likes: { id: string }[]
}

interface ReviewModerationDashboardProps {
  userId: string
  initialStats: {
    pending: number
    approved: number
    rejected: number
  }
}

export function ReviewModerationDashboard({ 
  userId,
  initialStats 
}: ReviewModerationDashboardProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState(initialStats)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [activeTab])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/reviews/moderation?status=${activeTab.toUpperCase()}&userId=${userId}`
      )
      const data = await response.json()
      setReviews(data.reviews || [])
      setStats(data.stats || initialStats)
    } catch (error) {
      console.error("Erro ao carregar reviews:", error)
      toast.error("Erro ao carregar avaliações")
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (reviewId: string, action: 'approve' | 'reject') => {
    setActionLoading(reviewId)
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      })

      if (!response.ok) {
        throw new Error("Erro ao processar ação")
      }

      toast.success(
        action === 'approve' 
          ? "Avaliação aprovada!" 
          : "Avaliação rejeitada"
      )
      
      await fetchReviews()
    } catch (error) {
      toast.error("Erro ao processar ação")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error("Digite uma resposta")
      return
    }

    setActionLoading(reviewId)

    try {
      const response = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText })
      })

      if (!response.ok) {
        throw new Error("Erro ao enviar resposta")
      }

      toast.success("Resposta enviada!")
      setReplyText("")
      setReplyingTo(null)
      await fetchReviews()
    } catch (error) {
      toast.error("Erro ao enviar resposta")
    } finally {
      setActionLoading(null)
    }
  }

  // Calcular média geral
  const allReviews = [...reviews]
  const averageRating = allReviews.length > 0
    ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
    : 0

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Média Geral
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <StarRating rating={Math.round(averageRating)} size="sm" readonly />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando moderação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aprovadas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Visíveis publicamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rejeitadas
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              Não publicadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de filtro */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            Pendentes
            {stats.pending > 0 && (
              <Badge className="ml-2 bg-yellow-500">{stats.pending}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprovadas ({stats.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejeitadas ({stats.rejected})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
                <p className="text-gray-600">Carregando avaliações...</p>
              </CardContent>
            </Card>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  Nenhuma avaliação {activeTab === 'pending' ? 'pendente' : activeTab === 'approved' ? 'aprovada' : 'rejeitada'}
                </p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="border-2">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-emerald-600">
                            {review.patientName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.patientName}</p>
                          <p className="text-sm text-gray-600">{review.patientEmail}</p>
                          {review.patientPhone && (
                            <p className="text-sm text-gray-600">{review.patientPhone}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(review.createdAt), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <StarRating rating={review.rating} readonly size="md" />
                        <Badge 
                          className="mt-2"
                          variant={
                            review.status === 'PENDING' ? 'outline' : 
                            review.status === 'APPROVED' ? 'default' : 
                            'destructive'
                          }
                        >
                          {review.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                          {review.status === 'APPROVED' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {review.status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                          {review.status === 'PENDING' ? 'Pendente' : 
                           review.status === 'APPROVED' ? 'Aprovada' : 
                           'Rejeitada'}
                        </Badge>
                      </div>
                    </div>

                    {/* Comentário */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>

                    {/* Resposta existente */}
                    {review.professionalReply && (
                      <div className="pl-4 border-l-4 border-emerald-300 bg-emerald-50 p-4 rounded-r-lg">
                        <p className="text-sm font-semibold text-emerald-700 mb-1">
                          Sua resposta:
                        </p>
                        <p className="text-sm text-gray-700">
                          {review.professionalReply}
                        </p>
                        {review.repliedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDistanceToNow(new Date(review.repliedAt), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      {/* Aprovar */}
                      {review.status === 'PENDING' && (
                        <>
                          <Button
                            onClick={() => handleAction(review.id, 'approve')}
                            disabled={actionLoading === review.id}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            {actionLoading === review.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Aprovar
                          </Button>

                          <Button
                            onClick={() => handleAction(review.id, 'reject')}
                            disabled={actionLoading === review.id}
                            variant="destructive"
                          >
                            {actionLoading === review.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-2" />
                            )}
                            Rejeitar
                          </Button>
                        </>
                      )}

                      {/* Responder */}
                      {review.status === 'APPROVED' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <Reply className="w-4 h-4 mr-2" />
                              {review.professionalReply ? 'Editar Resposta' : 'Responder'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Responder Avaliação</DialogTitle>
                              <DialogDescription>
                                Sua resposta será pública e aparecerá abaixo do comentário
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Sua resposta</Label>
                                <Textarea
                                  rows={5}
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Escreva sua resposta..."
                                  className="resize-none"
                                />
                              </div>
                              <Button
                                onClick={() => handleReply(review.id)}
                                disabled={actionLoading === review.id}
                                className="w-full"
                              >
                                {actionLoading === review.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Reply className="w-4 h-4 mr-2" />
                                )}
                                Enviar Resposta
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {/* Ver curtidas */}
                      {review.likes.length > 0 && (
                        <Badge variant="outline" className="ml-auto">
                          {review.likes.length} curtida{review.likes.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}