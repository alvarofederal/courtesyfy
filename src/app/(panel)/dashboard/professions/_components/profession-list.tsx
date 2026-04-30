"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Edit, Trash2, Plus, Briefcase, ChevronLeft, ChevronRight, Loader2, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { AdminBanner } from "../../_components/admin-banner"

interface Profession {
  id: string
  name: string
  description?: string
  status: boolean
  createdAt: string
}

const ITEMS_PER_PAGE = 10

export function ProfessionList() {
  const [professions, setProfessions] = useState<Profession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchProfessions()
  }, [])

  const fetchProfessions = async () => {
    try {
      const response = await fetch("/api/professions")
      if (response.ok) {
        const data = await response.json()
        setProfessions(data)
      }
    } catch (error) {
      console.error("Erro ao buscar profissões:", error)
      toast.error("Erro ao carregar profissões")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta profissão?")) {
      return
    }

    try {
      const response = await fetch(`/api/professions?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Profissão excluída com sucesso!")
        fetchProfessions()
      } else {
        throw new Error("Erro ao excluir profissão")
      }
    } catch (error) {
      toast.error("Erro ao excluir profissão")
      console.error(error)
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(professions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentProfessions = professions.slice(startIndex, endIndex)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto space-y-6">
        <AdminBanner />
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 shrink-0" />
              Profissões
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Cadastre e gerencie as profissões disponíveis no sistema
            </p>
          </div>
          <Button
            onClick={() => window.location.href = "/dashboard/professions/create"}
            className={cn(
              "h-11 px-6 text-base font-semibold w-full md:w-auto",
              "bg-gradient-to-r from-emerald-500 to-teal-600",
              "hover:from-emerald-600 hover:to-teal-700"
            )}>
            <Plus className="w-5 h-5 mr-2" />
            Nova Profissão
          </Button>
        </div>

        {/* Main Card */}
        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Briefcase className="w-5 h-5 text-emerald-600 shrink-0" />
                Profissões
              </CardTitle>
              <div className="text-xs md:text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                {professions.length} profissão(ões) cadastrada(s)
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {professions.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
                <p className="text-lg font-medium text-gray-400">
                  Nenhuma profissão cadastrada ainda
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Clique no botão "Nova Profissão" para começar
                </p>
              </div>
            ) : (
              <>
                {/* Mobile: Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {currentProfessions.map((profession) => (
                    <div key={profession.id} className="p-4 hover:bg-emerald-50/40">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0">
                          <Briefcase className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {profession.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Cadastrado em {new Date(profession.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => toast.info("Funcionalidade de edição em desenvolvimento")}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(profession.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          {profession.description && (
                            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                              {profession.description}
                            </p>
                          )}
                          <div className="mt-3">
                            <Badge
                              variant={profession.status ? "default" : "secondary"}
                              className={cn(
                                profession.status
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                                  : "bg-gray-400"
                              )}
                            >
                              {profession.status ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Table */}
                <div className="hidden md:block overflow-x-auto px-4 lg:px-6">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Profissão
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentProfessions.map((profession, index) => (
                        <tr
                          key={profession.id}
                          className={cn(
                            "hover:bg-emerald-50 transition-colors",
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          )}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                                <Briefcase className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {profession.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Cadastrado em {new Date(profession.createdAt).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {profession.description || "Sem descrição"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge
                              variant={profession.status ? "default" : "secondary"}
                              className={cn(
                                profession.status
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                                  : "bg-gray-400"
                              )}
                            >
                              {profession.status ? "Ativo" : "Inativo"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  toast.info("Funcionalidade de edição em desenvolvimento")
                                }}
                                className="border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(profession.id)}
                                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-sm text-gray-600">
                        Mostrando {startIndex + 1} a {Math.min(endIndex, professions.length)} de {professions.length} profissões
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPrevPage}
                          disabled={currentPage === 1}
                          className="border-emerald-300 hover:bg-emerald-50 disabled:opacity-50"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </Button>
                        <div className="text-sm font-medium text-gray-700 px-3">
                          Página {currentPage} de {totalPages}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className="border-emerald-300 hover:bg-emerald-50 disabled:opacity-50"
                        >
                          Próxima
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}