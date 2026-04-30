"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"


const specialtySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  status: z.boolean(),
})

type SpecialtyFormData = z.infer<typeof specialtySchema>

export function SpecialtyForm() {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SpecialtyFormData>({
    resolver: zodResolver(specialtySchema),
    defaultValues: {
      status: true,
    },
  })

  const status = watch("status")

  const onSubmit = async (data: SpecialtyFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/specialty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar especialidade")
      }

      toast.success("Especialidade criada com sucesso!")
      reset()
      // Redirect to list page
      window.location.href = "/dashboard/speciality"
    } catch (error) {
      toast.error("Erro ao criar especialidade")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Especialidade</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ex: Cardiologia"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descrição da especialidade"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={status}
              onCheckedChange={(checked) => setValue("status", checked)}
            />
            <Label htmlFor="status">Ativo</Label>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar Especialidade"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
