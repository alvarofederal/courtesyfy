"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Edit, Trash2 } from "lucide-react"

interface Specialist {
  id: string
  name: string
  cpf: string
  registro: string | null
  locations: string[]
  attendance: string[]
  specialty: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export function SpecialistList() {
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSpecialists()
  }, [])

  const fetchSpecialists = async () => {
    try {
      const response = await fetch("/api/specialist")
      if (response.ok) {
        const data = await response.json()
        setSpecialists(data)
      }
    } catch (error) {
      console.error("Erro ao buscar especialistas:", error)
      toast.error("Erro ao carregar especialistas")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este especialista?")) {
      return
    }

    try {
      const response = await fetch(`/api/specialist/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Especialista excluído com sucesso!")
        fetchSpecialists()
      } else {
        toast.error("Erro ao excluir especialista")
      }
    } catch (error) {
      console.error("Erro ao excluir especialista:", error)
      toast.error("Erro ao excluir especialista")
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Especialistas Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Especialistas Cadastrados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <Button onClick={() => window.location.href = "/dashboard/specialist/create"}>
            Criar Novo Especialista
          </Button>
        </div>

        {specialists.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Nenhum especialista cadastrado ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialists.map((specialist) => (
              <div
                key={specialist.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{specialist.name}</h3>
                  <Badge variant="outline">{specialist.specialty.name}</Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1 mb-3">
                  <p><strong>CPF:</strong> {specialist.cpf}</p>
                  {specialist.registro && <p><strong>Registro:</strong> {specialist.registro}</p>}
                  <p><strong>Locais:</strong> {specialist.locations.join(", ")}</p>
                  <p><strong>Atendimento:</strong> {specialist.attendance.map(type =>
                    type === "particular" ? "Particular" : "Plano de Saúde"
                  ).join(", ")}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: Implement edit functionality
                      toast.info("Funcionalidade de edição em desenvolvimento")
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(specialist.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
