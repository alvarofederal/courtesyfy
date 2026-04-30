// src/components/review-list.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRating } from "@/components/star-rating"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Loader2, Star } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Review {
  id: string
  rating: number
  comment: string
  patientName: string
  createdAt: string
  professionalReply: string | null
  repliedAt: string | null
  likes: { id: string }[]
}

interface ReviewListProps {
  professionalId: string
  professionalName: string
}

// ✅ Gerar fingerprint único do browser
function getFingerprint() {
  if (typeof window === 'undefined') return 'server'
  
  // Tenta pegar do localStorage
  let fingerprint = localStorage.getItem('browser_fingerprint')
  
  if (!fingerprint) {
    // Gera um novo baseado em características do browser
    fingerprint = `${navigator.userAgent}_${screen.width}x${screen.height}_${new Date().getTime()}_${Math.random()}`
    fingerprint = btoa(fingerprint).substring(0, 32) // Encurta
    localStorage.setItem('browser_fingerprint', fingerprint)
  }
  
  return fingerprint
}

// ✅ Verificar se já curtiu localmente
function hasLiked(reviewId: string) {
  if (typeof window === 'undefined') return false
  const liked = localStorage.getItem(`liked_review_${reviewId}`)
  return liked === 'true'
}

// ✅ Marcar como curtido localmente
function markAsLiked(reviewId: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`liked_review_${reviewId}`, 'true')
}

export function ReviewList({ professionalId, professionalName }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [liking, setLiking] = useState<string | null>(null)
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set()) // ✅ Estado local

  useEffect(() => {
    fetchReviews()
    
    // ✅ Carregar curtidas do localStorage
    if (typeof window !== 'undefined') {
      const liked = new Set<string>()
      reviews.forEach(review => {
        if (hasLiked(review.id)) {
          liked.add(review.id)
        }
      })
      setLikedReviews(liked)
    }
  }, [professionalId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?professionalId=${professionalId}`)
      const data = await response.json()
      
      setReviews(data.reviews || [])
      setStats(data.stats || { total: 0, averageRating: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } })
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error)
      toast.error("Erro ao carregar avaliações")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (reviewId: string) => {
    // ✅ Verificar se já curtiu localmente
    if (hasLiked(reviewId)) {
      toast.error("Você já curtiu esta avaliação")
      return
    }

    setLiking(reviewId)
    
    try {
      const fingerprint = getFingerprint()
      
      const response = await fetch(`/api/reviews/${reviewId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fingerprint, // ✅ Enviar fingerprint
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao curtir")
      }

      // ✅ Marcar como curtido localmente
      markAsLiked(reviewId)
      setLikedReviews(prev => new Set(prev).add(reviewId))
      
      // Atualizar a lista
      await fetchReviews()
      toast.success("Avaliação curtida!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao curtir")
    } finally {
      setLiking(null)
    }
  }

  if (loading) {
    return (
      <Card className="border-emerald-200 shadow-lg">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando avaliações...</p>
        </CardContent>
      </Card>
    )
  }

  if (reviews.length === 0) {
    return (
      <Card className="border-emerald-200 shadow-lg">
        <CardContent className="py-12 text-center">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ainda não há avaliações
          </h3>
          <p className="text-gray-600">
            Seja o primeiro a avaliar {professionalName}!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <Card className="border-emerald-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            Avaliações de {professionalName}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Média geral */}
            <div className="flex flex-col items-center justify-center md:border-r md:pr-8">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <StarRating rating={Math.round(stats.averageRating)} size="lg" readonly />
              <p className="text-sm text-gray-500 mt-2">
                {stats.total} {stats.total === 1 ? "avaliação" : "avaliações"}
              </p>
            </div>

            {/* Distribuição */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-12">
                      {rating} <Star className="w-3 h-3 inline fill-yellow-400 text-yellow-400" />
                    </span>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => {
          const isLiked = likedReviews.has(review.id) // ✅ Verificar estado local
          
          return (
            <Card key={review.id} className="border-gray-200 hover:border-emerald-300 transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-emerald-600">
                            {review.patientName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.patientName}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(review.createdAt), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} readonly size="sm" />
                    </div>
                  </div>

                  {/* Comentário */}
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>

                  {/* Resposta do profissional */}
                  {review.professionalReply && (
                    <div className="mt-4 pl-4 border-l-4 border-emerald-300 bg-emerald-50 p-4 rounded-r-lg">
                      <p className="text-sm font-semibold text-emerald-700 mb-1">
                        Resposta de {professionalName}:
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

                  {/* Curtidas */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(review.id)}
                      disabled={liking === review.id || isLiked} // ✅ Desabilita se já curtiu
                      className={`text-gray-600 hover:text-emerald-600 ${isLiked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {liking === review.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      )}
                      {review.likes.length > 0 && (
                        <span className="text-sm font-medium">{review.likes.length}</span>
                      )}
                      {isLiked && <span className="text-xs ml-1">(curtido)</span>}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}