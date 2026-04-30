"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, X } from "lucide-react"

const specialistSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().min(1, "CPF é obrigatório"),
  registro: z.string().optional(),
  locations: z.array(z.string()).min(1, "Pelo menos um local de atendimento é obrigatório"),
  attendance: z.array(z.string()).min(1, "Selecione pelo menos um tipo de atendimento"),
  specialtyId: z.string().min(1, "Especialidade é obrigatória"),
})

type SpecialistFormData = z.infer<typeof specialistSchema>

interface Specialty {
  id: string
  name: string
}

export function SpecialistForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [locations, setLocations] = useState<string[]>([""])
  const [attendanceTypes, setAttendanceTypes] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SpecialistFormData>({
    resolver: zodResolver(specialistSchema),
    defaultValues: {
      locations: [],
      attendance: [],
    },
  })

  const watchedLocations = watch("locations", [])
  const watchedAttendance = watch("attendance", [])

  useEffect(() => {
    fetchSpecialties()
  }, [])

  const fetchSpecialties = async () => {
    try {
      const response = await fetch("/api/specialty")
      if (response.ok) {
        const data = await response.json()
        setSpecialties(data)
      }

    } catch (error) {
      console.error("Erro ao buscar especialidades:", error)
    }
  }

  const addLocation = () => {
    setLocations([...locations, ""])
  }

  const removeLocation = (index: number) => {
    const newLocations = locations.filter((_, i) => i !== index)
    setLocations(newLocations)
    const currentLocations = watchedLocations.filter((_, i) => i !== index)
    setValue("locations", currentLocations)
  }

  const updateLocation = (index: number, value: string) => {
    const newLocations = [...locations]
    newLocations[index] = value
    setLocations(newLocations)
    const currentLocations = [...watchedLocations]
    currentLocations[index] = value
    setValue("locations", currentLocations.filter(loc => loc.trim() !== ""))
  }

  const handleAttendanceChange = (type: string, checked: boolean) => {
    let newAttendance = [...attendanceTypes]
    if (checked) {
      newAttendance.push(type)
    } else {
      newAttendance = newAttendance.filter(t => t !== type)
    }
    setAttendanceTypes(newAttendance)
    setValue("attendance", newAttendance)
  }

  const onSubmit = async (data: SpecialistFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/specialist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar especialista")
      }

      toast.success("Especialista criado com sucesso!")
      reset()
      setLocations([""])
      setAttendanceTypes([])
      // Redirect to list page
      window.location.href = "/dashboard/specialist"
    } catch (error) {
      toast.error("Erro ao criar especialista")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Especialista</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nome completo"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              {...register("cpf")}
              placeholder="Número do CPF"
            />
            {errors.cpf && (
              <p className="text-sm text-red-500">{errors.cpf.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="registro">Registro (Opcional)</Label>
            <Input
              id="registro"
              {...register("registro")}
              placeholder="Número do Registro"
            />
          </div>

          <div>
            <Label>Especialidade</Label>
            <Select onValueChange={(value) => setValue("specialtyId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma especialidade" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.specialtyId && (
              <p className="text-sm text-red-500">{errors.specialtyId.message}</p>
            )}
          </div>

          <div>
            <Label>Locais de Atendimento</Label>
            {locations.map((location, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={location}
                  onChange={(e) => updateLocation(index, e.target.value)}
                  placeholder="Ex: Rua das Flores, 123"
                />
                {locations.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeLocation(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addLocation}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Local
            </Button>
            {errors.locations && (
              <p className="text-sm text-red-500">{errors.locations.message}</p>
            )}
          </div>

          <div>
            <Label>Tipo de Atendimento</Label>
            <div className="space-y-2">
              {["particular", "plano"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={attendanceTypes.includes(type)}
                    onCheckedChange={(checked) =>
                      handleAttendanceChange(type, checked as boolean)
                    }
                  />
                  <Label htmlFor={type} className="capitalize">
                    {type === "particular" ? "Particular" : "Plano de Saúde"}
                  </Label>
                </div>
              ))}
            </div>
            {errors.attendance && (
              <p className="text-sm text-red-500">{errors.attendance.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar Especialista"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
