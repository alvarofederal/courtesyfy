"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Briefcase, Save, ArrowLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const professionSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
})

type ProfessionFormData = z.infer<typeof professionSchema>

export function ProfessionForm() {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfessionFormData>({
    resolver: zodResolver(professionSchema),
  })

  const onSubmit = async (data: ProfessionFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/professions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar profissão")
      }

      toast.success("Profissão criada com sucesso!")
      reset()
      // Redirect to list page
      setTimeout(() => {
        window.location.href = "/dashboard/professions"
      }, 1000)
    } catch (error) {
      toast.error("Erro ao criar profissão")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-emerald-600" />
              Nova Profissão
            </h1>
            <p className="text-gray-600 mt-1">
              Cadastre uma nova profissão no sistema
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/dashboard/professions"}
            className="border-emerald-300 hover:bg-emerald-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Form Card */}
        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              Dados da Profissão
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label 
                  htmlFor="name" 
                  className="text-sm font-semibold text-gray-700"
                >
                  Nome da Profissão *
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Ex: Médico, Psicólogo, Nutricionista..."
                  className={cn(
                    "h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500",
                    errors.name && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="font-medium">⚠</span> {errors.name.message}
                  </p>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label 
                  htmlFor="description" 
                  className="text-sm font-semibold text-gray-700"
                >
                  Descrição (Opcional)
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Adicione uma descrição para a profissão (opcional)"
                  rows={4}
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Uma breve descrição pode ajudar na identificação da profissão
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "flex-1 h-12 text-base font-semibold",
                    "bg-gradient-to-r from-emerald-500 to-teal-600",
                    "hover:from-emerald-600 hover:to-teal-700",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Criar Profissão
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.href = "/dashboard/professions"}
                  disabled={isLoading}
                  className="h-12 border-gray-300 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-0">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-lg">ℹ️</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900">
                  Dica importante
                </p>
                <p className="text-sm text-blue-800">
                  As profissões cadastradas serão utilizadas no sistema para categorizar 
                  profissionais de saúde e facilitar a busca de pacientes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}