// src/app/onboarding/complete-profile/_components/complete-profile-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, User, Phone, Briefcase, Award, AlertCircle, X, Check, Plus } from "lucide-react"
import { toast } from "sonner"
import { formatPhone, extractPhoneNumber } from "@/utils/formatPhone"
import { cn } from "@/lib/utils"
import { Prisma } from "@/generated/prisma"

type UserWithProfession = Prisma.UserGetPayload<{
  include: { profession: true; subscription: true }
}>

interface TypeService {
  id: string
  name: string
  description: string | null
}

interface CompleteProfileFormProps {
  userId: string
  professions: { id: string; name: string }[]
  typeServices: TypeService[]
  userData: UserWithProfession
}

export function CompleteProfileForm({ userId, professions, typeServices, userData }: CompleteProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  
  const plan = userData.subscription?.plan || 'FREE'
  const maxTypeServices = plan === 'PROFESSIONAL' ? 5 : 1
  
  const [formData, setFormData] = useState({
    name: userData.name || "",
    cpf: userData.cpf || "",
    phone: userData.phone || "",
    professionId: userData.professionId || "",
    specialty: userData.specialty || "",
    registration: userData.registration || "",
  })
  
  const [selectedTypeServices, setSelectedTypeServices] = useState<string[]>([])
  const [tempSelectedTypeServices, setTempSelectedTypeServices] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.cpf || !formData.phone || !formData.professionId || !formData.registration) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }
    
    if (selectedTypeServices.length === 0) {
      toast.error("Selecione pelo menos 1 tipo de atendimento")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/onboarding/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: formData.name,
          cpf: formData.cpf,
          phone: extractPhoneNumber(formData.phone),
          professionId: formData.professionId,
          specialty: formData.specialty,
          registration: formData.registration,
          typeServiceIds: selectedTypeServices,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Erro ao completar cadastro")
        setLoading(false)
        return
      }

      toast.success("Cadastro concluído com sucesso!")
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro ao completar cadastro")
      setLoading(false)
    }
  }
  
  const handleOpenModal = () => {
    setTempSelectedTypeServices([...selectedTypeServices])
    setModalOpen(true)
  }
  
  const handleConfirmSelection = () => {
    setSelectedTypeServices([...tempSelectedTypeServices])
    setModalOpen(false)
    toast.success(`${tempSelectedTypeServices.length} tipo(s) selecionado(s)`)
  }
  
  const handleCancelSelection = () => {
    setTempSelectedTypeServices([...selectedTypeServices])
    setModalOpen(false)
  }
  
  // 🔥 CORRIGIDO: Handler único sem duplicação
  const handleToggleTypeService = (typeServiceId: string, checked: boolean) => {
    if (checked) {
      // Adicionar (com validação de limite)
      if (tempSelectedTypeServices.length >= maxTypeServices) {
        toast.error(`Limite de ${maxTypeServices} tipo(s) atingido para o plano ${plan}`)
        return
      }
      setTempSelectedTypeServices(prev => [...prev, typeServiceId])
    } else {
      // Remover
      setTempSelectedTypeServices(prev => prev.filter(id => id !== typeServiceId))
    }
  }
  
  const handleRemoveTypeService = (typeServiceId: string) => {
    setSelectedTypeServices(prev => prev.filter(id => id !== typeServiceId))
    toast.success("Tipo de atendimento removido")
  }
  
  const getTypeServiceData = (id: string) => {
    return typeServices.find(ts => ts.id === id)
  }
  
  // 🔥 NOVO: Formatar descrição tipo breadcrumb
  const formatBreadcrumb = (description: string | null) => {
    if (!description) return null
    return description.split(' / ').map((part, idx, arr) => (
      <span key={idx}>
        {part.trim()}
        {idx < arr.length - 1 && <span className="mx-1 text-gray-400">/</span>}
      </span>
    ))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-emerald-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <User className="w-6 h-6 text-emerald-600" />
            Informações Profissionais
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          {/* Nome Completo */}
          <div>
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
              Nome Completo *
            </Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Seu nome completo"
              className="h-12 mt-1 border-emerald-200 focus:border-emerald-500"
            />
          </div>

          {/* CPF */}
          <div>
            <Label htmlFor="cpf" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              CPF *
              <span className="text-xs text-red-600 font-normal flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Chave de identificação única. Não será divulgado.
              </span>
            </Label>
            <Input
              id="cpf"
              type="text"
              required
              maxLength={14}
              value={formData.cpf}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '')
                if (value.length <= 11) {
                  value = value.replace(/(\d{3})(\d)/, '$1.$2')
                  value = value.replace(/(\d{3})(\d)/, '$1.$2')
                  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                }
                setFormData({ ...formData, cpf: value })
              }}
              placeholder="000.000.000-00"
              className="h-12 mt-1 border-emerald-200 focus:border-emerald-500"
            />
          </div>

          {/* Telefone */}
          <div>
            <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              Telefone *
              <span className="text-xs text-red-600 font-normal">
                Para contato interno. Não será divulgado.
              </span>
            </Label>
            <Input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value)
                setFormData({ ...formData, phone: formatted })
              }}
              placeholder="(00) 00000-0000"
              className="h-12 mt-1 border-emerald-200 focus:border-emerald-500"
            />
          </div>

          {/* Profissão */}
          <div>
            <Label htmlFor="profession" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              Profissão *
            </Label>
            <Select
              value={formData.professionId}
              onValueChange={(value) => setFormData({ ...formData, professionId: value })}
            >
              <SelectTrigger className="h-12 mt-1 border-emerald-200 focus:ring-emerald-500">
                <SelectValue placeholder="Selecione sua profissão" />
              </SelectTrigger>
              <SelectContent>
                {professions.map((profession) => (
                  <SelectItem key={profession.id} value={profession.id}>
                    {profession.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Especialidade */}
          <div>
            <Label htmlFor="specialty" className="text-sm font-semibold text-gray-700">
              Especialidade
            </Label>
            <Input
              id="specialty"
              type="text"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              placeholder="Ex: Ortodontia, Clínica Geral..."
              className="h-12 mt-1 border-emerald-200 focus:border-emerald-500"
            />
          </div>

          {/* Registro Profissional */}
          <div>
            <Label htmlFor="registration" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Registro Profissional *
              <span className="text-xs text-red-600 font-normal flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Garante sua segurança. Não será divulgado publicamente.
              </span>
            </Label>
            <Input
              id="registration"
              type="text"
              required
              maxLength={30}
              value={formData.registration}
              onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
              placeholder="Ex: CRM 12345, CRO 67890..."
              className="h-12 mt-1 border-emerald-200 focus:border-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Número do registro junto ao seu conselho profissional
            </p>
          </div>

          {/* 🔥 Tipos de Atendimento */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
              Tipos de Atendimento *
              <span className="text-xs font-normal text-emerald-600">
                ({selectedTypeServices.length}/{maxTypeServices})
              </span>
            </Label>
            
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleOpenModal}
                  className="w-full h-12 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 justify-start text-left font-normal"
                >
                  <Plus className="h-4 w-4 mr-2 text-emerald-600" />
                  {selectedTypeServices.length === 0 
                    ? "Selecionar tipos de atendimento" 
                    : `${selectedTypeServices.length} tipo(s) selecionado(s)`
                  }
                </Button>
              </DialogTrigger>
              
              {/* 🔥 MODAL COMPACTA - Grid 3 colunas */}
              <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-emerald-600" />
                    </div>
                    Selecione os Tipos de Atendimento
                  </DialogTitle>
                  <DialogDescription>
                    Escolha até {maxTypeServices} tipo(s) que você oferece. 
                    {plan === 'FREE' && (
                      <span className="text-yellow-600 font-medium">
                        {' '}Faça upgrade para Professional e selecione até 5 tipos!
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                
                {/* 🔥 GRID COMPACTO: 3 colunas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 py-4">
                  {typeServices.map((typeService) => {
                    const isSelected = tempSelectedTypeServices.includes(typeService.id)
                    
                    return (
                      <div
                        key={typeService.id}
                        className={cn(
                          "flex items-start space-x-2 p-2 rounded-md border transition-all",
                          isSelected 
                            ? "border-emerald-500 bg-emerald-50" 
                            : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                        )}
                      >
                        {/* 🔥 CORRIGIDO: Sem onClick no div */}
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            handleToggleTypeService(typeService.id, checked as boolean)
                          }
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {typeService.name}
                          </p>
                          {isSelected && (
                            <Check className="h-4 w-4 text-emerald-600 inline ml-1" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Botões da Modal */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelSelection}
                    className="flex-1 h-12"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmSelection}
                    disabled={tempSelectedTypeServices.length === 0}
                    className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Confirmar ({tempSelectedTypeServices.length})
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* 🔥 LISTA BREADCRUMB STYLE */}
            {selectedTypeServices.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedTypeServices.map((typeServiceId) => {
                  const typeService = getTypeServiceData(typeServiceId)
                  if (!typeService) return null
                  
                  return (
                    <div
                      key={typeServiceId}
                      className="flex items-start justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg group hover:bg-emerald-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        {/* Nome em Negrito */}
                        <p className="font-bold text-gray-900 text-sm mb-0.5">
                          {typeService.name}
                        </p>
                        {/* Descrição Breadcrumb */}
                        {typeService.description && (
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {formatBreadcrumb(typeService.description)}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTypeService(typeServiceId)}
                        className="h-7 w-7 p-0 ml-2 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
            
            {selectedTypeServices.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Selecione pelo menos 1 tipo de atendimento para continuar
              </p>
            )}
          </div>

          {/* Botão Submit */}
          <Button
            type="submit"
            disabled={loading || selectedTypeServices.length === 0}
            className={cn(
              "w-full h-12 text-base font-semibold mt-4",
              "bg-gradient-to-r from-emerald-500 to-teal-600",
              "hover:from-emerald-600 hover:to-teal-700"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Completar Cadastro
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}