// src/components/review-form.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StarRating } from "@/components/star-rating"
import { CheckCircle2, Loader2, MessageSquare } from "lucide-react"
import { toast } from "sonner"

interface ReviewFormProps {
  professionalId: string
  professionalName: string
  appointmentId?: string
  onSuccess?: () => void
}

export function ReviewForm({ 
  professionalId, 
  professionalName,
  appointmentId,
  onSuccess 
}: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    comment: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId,
          patientName: formData.patientName,
          patientEmail: formData.patientEmail,
          rating,
          comment: formData.comment,
          appointmentId,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar avaliação")
      }

      setSubmitted(true)
      toast.success("Avaliação enviada com sucesso!")
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar avaliação")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card className="border-emerald-200 shadow-lg">
        <CardContent className="pt-12 pb-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Avaliação enviada! ⭐
          </h2>
          <p className="text-gray-600">
            Sua avaliação foi enviada e está aguardando aprovação de <strong>{professionalName}</strong>.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Agradecemos seu feedback!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-emerald-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
        <CardTitle className="text-2xl flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-emerald-600" />
          Avaliar {professionalName}
        </CardTitle>
        <CardDescription className="text-base">
          Compartilhe sua experiência e ajude outros pacientes
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Sua avaliação *
            </Label>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="lg"
              />
              <span className="text-2xl font-bold text-emerald-600">
                {rating}.0
              </span>
            </div>
          </div>

          {/* Nome */}
          <div>
            <Label htmlFor="patientName">Seu nome *</Label>
            <Input
              id="patientName"
              required
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              placeholder="Seu nome completo"
              className="h-12"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="patientEmail">Seu email *</Label>
            <Input
              id="patientEmail"
              type="email"
              required
              value={formData.patientEmail}
              onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
              placeholder="seu@email.com"
              className="h-12"
            />
          </div>

          {/* Comentário */}
          <div>
            <Label htmlFor="comment">Seu comentário *</Label>
            <Textarea
              id="comment"
              required
              minLength={10}
              maxLength={500}
              rows={5}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Conte como foi sua experiência... (mínimo 10 caracteres)"
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.comment.length}/500 caracteres
            </p>
          </div>

          {/* Botão */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Avaliação"
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Sua avaliação será analisada antes de ser publicada
          </p>
        </form>
      </CardContent>
    </Card>
  )
}