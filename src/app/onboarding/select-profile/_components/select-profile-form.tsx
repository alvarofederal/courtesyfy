// src/app/onboarding/select-profile/_components/select-profile-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Users, Info, ClipboardList, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SelectProfileFormProps {
  userId: string
}

type ProfileType = "TOTAL" | "INFO" | "WAITLIST"

// Features com status para cada perfil
const features = [
  { 
    label: "Página profissional personalizada",
    TOTAL: true,
    INFO: true,
    WAITLIST: true
  },
  { 
    label: "Agendamento online 24 horas",
    TOTAL: true,
    INFO: false,
    WAITLIST: false
  },
  { 
    label: "Gestão completa dos agendamentos",
    TOTAL: true,
    INFO: false,
    WAITLIST: false
  },
  { 
    label: "Informações de contato",
    TOTAL: true,
    INFO: true,
    WAITLIST: false
  },
  { 
    label: "Locais de atendimento",
    TOTAL: "Até 10 locais",
    INFO: "1 local",
    WAITLIST: false
  },
  { 
    label: "Comentários de pacientes",
    TOTAL: true,
    INFO: true,
    WAITLIST: true
  },
  { 
    label: "Dashboard com métricas",
    TOTAL: true,
    INFO: false,
    WAITLIST: false
  },
  { 
    label: "Relatório dos agendamentos",
    TOTAL: true,
    INFO: false,
    WAITLIST: false
  },
  { 
    label: "Lista de espera (colete dados e contate depois)",
    TOTAL: true,
    INFO: false,
    WAITLIST: true
  },
  { 
    label: "Notificações por email",
    TOTAL: true,
    INFO: false,
    WAITLIST: false
  },
]

// Dados dos perfis
const profiles = [
  {
    type: "TOTAL" as ProfileType,
    icon: Users,
    title: "Perfil Agendamento",
    description: "Solução completa para gestão",
    plan: "PROFESSIONAL",
    planLabel: "60 dias grátis",
    color: "emerald",
    highlight: true
  },
  {
    type: "INFO" as ProfileType,
    icon: Info,
    title: "Perfil Informativo",
    description: "Apresentação profissional",
    plan: "FREE",
    planLabel: "Gratuito",
    color: "blue",
    highlight: false
  },
  {
    type: "WAITLIST" as ProfileType,
    icon: ClipboardList,
    title: "Lista de Espera",
    description: "Capture interessados",
    plan: "FREE",
    planLabel: "Gratuito",
    color: "purple",
    highlight: false
  }
]

export function SelectProfileForm({ userId }: SelectProfileFormProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<ProfileType | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selected) {
      toast.error("Selecione um tipo de perfil")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/onboarding/select-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          typeProfile: selected
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Erro ao selecionar perfil")
        setLoading(false)
        return
      }

      toast.success("Perfil selecionado com sucesso!")
      router.push("/onboarding/complete-profile")
      router.refresh()
    } catch (error) {
      toast.error("Erro ao selecionar perfil")
      setLoading(false)
    }
  }

  // Helper para renderizar status (✓/✗ ou texto)
  const renderFeatureStatus = (value: boolean | string) => {
    const isString = typeof value === 'string'
    const hasFeature = value === true || isString
    
    if (isString) {
      return (
        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded whitespace-nowrap">
          {value}
        </span>
      )
    } else if (hasFeature) {
      return (
        <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full">
          <Check className="h-4 w-4" />
        </div>
      )
    } else {
      return (
        <div className="bg-red-100 text-red-600 p-1.5 rounded-full">
          <X className="h-4 w-4" />
        </div>
      )
    }
  }

  return (
    <div className="space-y-8">

      {/* 🖥️ DESKTOP/TABLET: Tabela de Comparação (lg e acima) */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
          
          {/* Header da Tabela */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
            <div className="flex items-center">
              <p className="font-semibold text-gray-700">Recursos</p>
            </div>
            
            {profiles.map((profile) => {
              const Icon = profile.icon
              const isSelected = selected === profile.type
              
              return (
                <div
                  key={profile.type}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all relative",
                    isSelected 
                      ? "bg-emerald-500 text-white shadow-xl scale-105 ring-2 ring-emerald-400 ring-offset-2" 
                      : "bg-white hover:bg-emerald-50 border-2 border-gray-200 hover:border-emerald-300 hover:shadow-md"
                  )}
                  onClick={() => setSelected(profile.type)}
                >
                  {/* Badge "Mais Popular" */}
                  {profile.highlight && !isSelected && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Mais Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="relative">
                    <Icon className={cn(
                      "h-8 w-8 mb-2",
                      isSelected ? "text-white" : "text-emerald-600"
                    )} />
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-white text-emerald-600 p-1 rounded-full shadow-md">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <h3 className={cn(
                    "font-bold text-sm text-center mb-1",
                    isSelected ? "text-white" : "text-gray-900"
                  )}>
                    {profile.title}
                  </h3>
                  <p className={cn(
                    "text-xs text-center mb-2",
                    isSelected ? "text-emerald-50" : "text-gray-600"
                  )}>
                    {profile.description}
                  </p>
                  <span className={cn(
                    "text-xs font-semibold px-3 py-1 rounded-full",
                    isSelected 
                      ? "bg-white text-emerald-600" 
                      : profile.plan === "PROFESSIONAL" 
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                  )}>
                    {profile.planLabel}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Linhas de Features */}
          <div className="divide-y divide-gray-200">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "grid grid-cols-4 gap-4 p-4 hover:bg-gray-50 transition-colors",
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                )}
              >
                <div className="flex items-center">
                  <p className="text-sm text-gray-700">{feature.label}</p>
                </div>
                
                {profiles.map((profile) => (
                  <div 
                    key={profile.type} 
                    className="flex items-center justify-center"
                  >
                    {renderFeatureStatus(feature[profile.type as keyof typeof feature])}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 📱 MOBILE: Cards Empilhados (abaixo de lg) */}
      <div className="lg:hidden space-y-4">
        {profiles.map((profile) => {
          const Icon = profile.icon
          const isSelected = selected === profile.type
          
          return (
            <Card
              key={profile.type}
              className={cn(
                "cursor-pointer transition-all relative",
                isSelected 
                  ? "border-4 border-emerald-500 bg-emerald-50/50 shadow-xl ring-2 ring-emerald-400" 
                  : "border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg"
              )}
              onClick={() => setSelected(profile.type)}
            >
              {/* Badge "Mais Popular" */}
              {profile.highlight && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Mais Popular
                  </span>
                </div>
              )}
              
              <CardHeader className={cn(
                "pb-4",
                isSelected && "bg-emerald-500 text-white rounded-t-lg"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-3 rounded-lg",
                      isSelected 
                        ? "bg-white/20" 
                        : "bg-gradient-to-br from-emerald-100 to-teal-100"
                    )}>
                      <Icon className={cn(
                        "h-6 w-6",
                        isSelected ? "text-white" : "text-emerald-600"
                      )} />
                    </div>
                    <div>
                      <CardTitle className={cn(
                        "text-xl",
                        isSelected ? "text-white" : "text-gray-900"
                      )}>
                        {profile.title}
                      </CardTitle>
                      <CardDescription className={cn(
                        "text-sm mt-1",
                        isSelected ? "text-emerald-50" : "text-gray-600"
                      )}>
                        {profile.description}
                      </CardDescription>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="bg-white text-emerald-600 p-2 rounded-full shadow-lg">
                      <Check className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <span className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-full inline-block",
                    isSelected 
                      ? "bg-white text-emerald-600" 
                      : profile.plan === "PROFESSIONAL" 
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                  )}>
                    {profile.planLabel}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2">
                {features.map((feature, idx) => {
                  const value = feature[profile.type as keyof typeof feature]
                  return (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-700 flex-1">
                        {feature.label}
                      </span>
                      <div className="ml-2">
                        {renderFeatureStatus(value)}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Botão Continuar */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!selected || loading}
          className={cn(
            "w-full max-w-md h-12 text-base font-semibold",
            "bg-gradient-to-r from-emerald-500 to-teal-600",
            "hover:from-emerald-600 hover:to-teal-700",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              Continuar
              <Check className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Legenda (apenas Desktop) */}
      <div className="hidden lg:flex items-center justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full">
            <Check className="h-3 w-3" />
          </div>
          <span>Incluso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-red-100 text-red-600 p-1 rounded-full">
            <X className="h-3 w-3" />
          </div>
          <span>Não incluso</span>
        </div>
      </div>
    </div>
  )
}