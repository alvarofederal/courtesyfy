"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Pencil,
  Plus,
  X,
  Briefcase,
  Clock,
  AlertCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DialogService } from './dialog-service'
import { deleteTypeService } from '../_actions/delete-service'
import { toast } from 'sonner'
import { AdminBanner } from '../../_components/admin-banner'
import { ResultPermissionProp } from '@/utils/permissions/canPermission'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { TypeService } from '@/generated/prisma'

interface ServicesListProps {
  typeServices: TypeService[],
  permission: ResultPermissionProp
  isAdmin?: boolean // 🔥 NOVA PROP
}

const ITEMS_PER_PAGE = 10

export function ServicesList({ typeServices, permission, isAdmin = false }: ServicesListProps) {

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTypeService, setEditingTypeService] = useState<TypeService | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // 🔥 ADMIN TEM ACESSO ILIMITADO
  const maxServices = isAdmin ? 999999 : (permission.plan?.maxTypeServices || 1);
  const currentServicesCount = typeServices.length;
  const canCreateMore = isAdmin ? true : permission.hasPermission;
  
  // Lista de serviços a exibir
  const servicesList = typeServices;

  // Paginação
  const totalPages = Math.ceil(servicesList.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentServices = servicesList.slice(startIndex, endIndex)

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

  async function handleUpdateTypeService(typeService: TypeService) {
    setEditingTypeService(typeService);
    setIsDialogOpen(true);
  }

  async function handleDeleteTypeService(typeServiceId: string) {
    if (!confirm("Tem certeza que deseja excluir este tipo de atendimento?")) {
      return
    }

    const response = await deleteTypeService({ typeServiceId: typeServiceId })

    if (response.error) {
      toast.error(response.error)
      return;
    }

    toast.success('Tipo de atendimento deletado com sucesso')
  }

  function handleCreateClick() {
    if (!canCreateMore) {
      const message = permission.expired 
        ? 'Sua assinatura expirou. Renove para continuar criando tipos de atendimento.'
        : `Você atingiu o limite de ${maxServices} tipo(s) do seu plano ${permission.planId}`;
      toast.error(message);
      return;
    }
    setIsDialogOpen(true);
  }

  // 🔥 ADMIN NÃO VÊ AVISOS DE LIMITE
  const showLimitWarning = isAdmin ? false : (!canCreateMore || (maxServices !== null && currentServicesCount >= maxServices));

  // Mensagem do aviso baseada no status (só para não-admin)
  const getWarningMessage = () => {
    if (isAdmin) return null; // 🔥 Admin nunca vê warnings

    if (permission.expired) {
      return {
        title: 'Assinatura Expirada',
        description: 'Sua assinatura expirou. Renove seu plano para continuar criando tipos de atendimento.',
        showUpgrade: true
      };
    }
    
    if (!canCreateMore && maxServices !== null) {
      return {
        title: 'Limite de tipos atingido',
        description: `Você está usando ${currentServicesCount} de ${maxServices} tipo(s) disponíveis no plano ${permission.planId}.${
          permission.planId === 'FREE' ? ' Faça upgrade para o plano Professional e cadastre até 5 tipos!' : ''
        }`,
        showUpgrade: permission.planId === 'FREE'
      };
    }

    return null;
  };

  const warningInfo = getWarningMessage();

  return (
    <Dialog open={isDialogOpen} onOpenChange={
      (open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingTypeService(null);
        } 
      }}>
      <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8'>
        <div className='mx-auto space-y-4 md:space-y-6'>
          {isAdmin && <AdminBanner />}
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 shrink-0" />
                Tipos de Atendimento
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                {isAdmin 
                  ? "Gerencie todos os tipos de atendimento do sistema (acesso administrativo)"
                  : "Gerencie os tipos de atendimento que você oferece"
                }
              </p>
            </div>
            {canCreateMore ? (
              <DialogTrigger asChild>
                <Button 
                  className={cn(
                    "h-11 px-6 text-base font-semibold", "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  )}
                >
                  <Plus className='w-5 h-5 mr-2' />
                  {isAdmin ? 'Novo Tipo (Admin)' : 'Novo Tipo'}
                </Button>
              </DialogTrigger>
            ) : (
              <Button 
                disabled
                className="h-11 px-6 bg-gray-300 cursor-not-allowed"
                onClick={handleCreateClick}
              >
                <Lock className='w-4 h-4 mr-2' />
                {permission.expired ? 'Assinatura Expirada' : 'Limite Atingido'}
              </Button>
            )}
          </div>

          {/* Warning se estiver no limite ou expirado (NÃO APARECE PARA ADMIN) */}
          {warningInfo && !isAdmin && (
            <Card className={cn(
              "shadow-md",
              permission.expired ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
            )}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className={cn(
                    "w-5 h-5 mt-0.5",
                    permission.expired ? "text-red-600" : "text-amber-600"
                  )} />
                  <div className="flex-1">
                    <h3 className={cn(
                      "font-semibold",
                      permission.expired ? "text-red-900" : "text-amber-900"
                    )}>
                      {warningInfo.title}
                    </h3>
                    <p className={cn(
                      "text-sm mt-1",
                      permission.expired ? "text-red-700" : "text-amber-700"
                    )}>
                      {warningInfo.description}
                    </p>
                    {warningInfo.showUpgrade && (
                      <Link href="/dashboard/plans">
                        <Button className="mt-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                          {permission.expired ? 'Renovar Plano' : 'Fazer Upgrade'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Card */}
          <Card className='border-emerald-200 shadow-lg'>
            <CardHeader className='bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                <CardTitle className='flex items-center gap-2 text-lg md:text-xl'>
                  <Briefcase className="w-5 h-5 text-emerald-600 shrink-0" />
                  Tipos de Atendimento
                </CardTitle>
                <div className="text-xs md:text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                  {servicesList.length} tipo(s) cadastrado(s)
                  {isAdmin && <span className="ml-2 text-purple-600 font-semibold">∞</span>}
                </div>
              </div>
            </CardHeader>

            <CardContent className='p-0'>
              {servicesList.length === 0 ? (
                <div className="text-center py-16">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-400">
                    Nenhum tipo de atendimento cadastrado
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {isAdmin 
                      ? 'Clique em "Novo Tipo (Admin)" para criar o primeiro tipo do sistema'
                      : (canCreateMore ? 'Clique em "Novo Tipo" para começar' : 'Atualize seu plano para criar tipos')
                    }
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile: Cards */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {currentServices.map((service) => (
                      <div key={service.id} className="p-4 hover:bg-emerald-50/40">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0">
                            <Briefcase className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {service.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Cadastrado em {new Date(service.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleUpdateTypeService(service)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteTypeService(service.id.toString())}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            {service.description && (
                              <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                {service.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                <Clock className="w-3 h-3 mr-1" />
                                {service.duration >= 60
                                  ? `${Math.floor(service.duration / 60)}h ${service.duration % 60 > 0 ? `${service.duration % 60}min` : ''}`
                                  : `${service.duration}min`}
                              </Badge>
                              <Badge
                                variant={service.status ? "default" : "secondary"}
                                className={cn(
                                  service.status
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                                    : "bg-gray-400"
                                )}
                              >
                                {service.status ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop: Table */}
                  <div className="hidden md:block overflow-x-auto px-4 lg:px-6">
                    <Table>
                      <TableHeader className="bg-gray-50 border-b border-gray-200">
                        <TableRow>
                          <TableHead className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                            Tipo de Atendimento
                          </TableHead>
                          <TableHead className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                            Descrição
                          </TableHead>
                          <TableHead className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                            Duração
                          </TableHead>
                          <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </TableHead>
                          <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Ações
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      
                      <TableBody className="bg-white divide-y divide-gray-200">
                        {currentServices.map((service, index) => (
                          <TableRow 
                            key={service.id} 
                            className={cn(
                              "hover:bg-emerald-50 transition-colors",
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            )}
                          >
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                                  <Briefcase className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {service.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Cadastrado em {new Date(service.createdAt).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="text-sm text-gray-600 max-w-xs truncate">
                                {service.description || "Sem descrição"}
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                <Clock className="w-3 h-3 mr-1" />
                                {service.duration >= 60 
                                  ? `${Math.floor(service.duration / 60)}h ${service.duration % 60 > 0 ? `${service.duration % 60}min` : ''}`
                                  : `${service.duration}min`}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-center">
                              <Badge
                                variant={service.status ? "default" : "secondary"}
                                className={cn(
                                  service.status
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                                    : "bg-gray-400"
                                )}
                              >
                                {service.status ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400"
                                  onClick={() => handleUpdateTypeService(service)}
                                >
                                  <Pencil className='w-4 h-4' />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                                  onClick={() => handleDeleteTypeService(service.id.toString())}
                                >
                                  <X className='w-4 h-4' />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-sm text-gray-600">
                          Mostrando {startIndex + 1} a {Math.min(endIndex, servicesList.length)} de {servicesList.length} tipos
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

          {/* Dialog para criar/editar */}
          <DialogContent
            onInteractOutside={ (e) => {
              e.preventDefault();
              setIsDialogOpen(false);
              setEditingTypeService(null);
            }}>
            <DialogService 
              closeModal={
                () => {
                  setIsDialogOpen(false);
                  setEditingTypeService(null);
                }
              }
              typeServiceId={editingTypeService ? editingTypeService.id : undefined}
              initialValues={editingTypeService ?{
                name: editingTypeService.name,
                hours: Math.floor(editingTypeService.duration / 60).toString(),
                minutes: (editingTypeService.duration % 60).toString(),
              } : undefined}
            />
          </DialogContent>
        </div>
      </div>
    </Dialog>
  )
}