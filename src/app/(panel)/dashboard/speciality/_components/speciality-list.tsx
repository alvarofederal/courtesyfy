"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Edit, Trash2 } from "lucide-react"

interface Specialty {
  id: string
  name: string
  description: string | null
  status: boolean
  createdAt: string
  updatedAt: string
}

export function SpecialtyList() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
      toast.error("Erro ao carregar especialidades")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta especialidade?")) {
      return
    }

    try {
      const response = await fetch(`/api/specialty/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Especialidade excluída com sucesso!")
        fetchSpecialties()
      } else {
        toast.error("Erro ao excluir especialidade")
      }
    } catch (error) {
      console.error("Erro ao excluir especialidade:", error)
      toast.error("Erro ao excluir especialidade")
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Especialidades Cadastradas</CardTitle>
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
        <CardTitle>Especialidades Cadastradas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <Button onClick={() => window.location.href = "/dashboard/speciality/create"}>
            Criar Nova Especialidade
          </Button>
        </div>

        {specialties.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Nenhuma especialidade cadastrada ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialties.map((specialty) => (
              <div
                key={specialty.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{specialty.name}</h3>
                  <Badge variant={specialty.status ? "default" : "secondary"}>
                    {specialty.status ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                {specialty.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {specialty.description}
                  </p>
                )}

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
                    onClick={() => handleDelete(specialty.id)}
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
