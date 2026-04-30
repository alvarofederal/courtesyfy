"use client"
// src/app/(panel)/dashboard/profile/_components/profile.tsx

import { useState, useMemo, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { ProfileFormData, useProfileForm } from './profile-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { updateProfile } from '../_actions/update-profile'
import { toast } from 'sonner'
import { formatPhone } from '@/utils/formatPhone'
import { extractPhoneNumber } from '@/utils/formatPhone'
import { Prisma } from '@/generated/prisma'
import { generateDayGrid } from '@/lib/scheduling'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AvatarProfile } from './profile-avatar'
import { useQuery } from '@tanstack/react-query'
import { Textarea } from '@/components/ui/textarea'
import { 
  User, 
  MapPin, 
  Phone, 
  FileText, 
  Briefcase, 
  Award, 
  Video,
  Download,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Check,
  X,
  Camera
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from '@/lib/utils'
import { ProfileUrlField } from './profile-url-field'
import { TypeProfile } from "@/generated/prisma"
import { Label } from '@radix-ui/react-label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type UserWithSubscription = Prisma.UserGetPayload<{
  include: {
    subscription: true
    times: true
    addresses: true
    userTypeServices: {
      where: { active: true }
      select: {
        typeServiceId: true
        typeService: {
          select: {
            id: true
            name: true
            description: true
          }
        }
      }
    }
  }
}>

interface ProfileContentProps {
  user: UserWithSubscription
  allTypeServices: TypeServiceData[] 
}

interface TypeServiceData {
  id: string
  name: string
  description: string | null
}

// 🔥 Componente de Indicador de Validação
interface ValidationIndicatorProps {
  isValid: boolean
}

function ValidationIndicator({ isValid }: ValidationIndicatorProps) {
  if (isValid) {
    return (
      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
        <Check className="w-4 h-4 text-emerald-700" />
      </div>
    )
  }
  
  return (
    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
      <X className="w-4 h-4 text-white" />
    </div>
  )
}

export function ProfileContent({ user, allTypeServices }: ProfileContentProps) {
  const router = useRouter();

  const userTimes = user.times?.map(t => t.time) ?? [];
  const userAddresses = user.addresses?.map(a => ({
    address: a.address,
    phone: a.phone || '',
    contact: a.contact || ''
  })) ?? [];

  const [selectedHours, setSelectedHours] = useState<string[]>(userTimes ?? [])
  const [teleconsulta, setTeleconsulta] = useState(user.teleConsultation || false);
  const [termsAccepted, setTermsAccepted] = useState(user.termsAccepted || false);
  const [selectedTypeProfile, setSelectedTypeProfile] = useState<TypeProfile>(user.typeProfile || 'WAITLIST');
  const [modalOpen, setModalOpen] = useState(false)
  const initialTypeServiceIds = user.userTypeServices?.map(uts => uts.typeServiceId) || []
  const [selectedTypeServices, setSelectedTypeServices] = useState<string[]>(initialTypeServiceIds)
  const [tempSelectedTypeServices, setTempSelectedTypeServices] = useState<string[]>(initialTypeServiceIds)

  const plan = user.subscription?.plan || 'FREE'
  const maxTypeServices = plan === 'PROFESSIONAL' ? 5 : 1
  const { update } = useSession();
  const [showCelebration, setShowCelebration] = useState(false);

  const { data: professions, isLoading: professionsLoading } = useQuery({
    queryKey: ["professions"],
    queryFn: async () => {
      const response = await fetch('/api/professions');
      if (!response.ok) throw new Error("Erro ao carregar profissões");
      return await response.json() as { id: string; name: string }[];
    },
  });

  const form = useProfileForm({
    name: user.name,
    address: userAddresses,
    phone: user.phone,
    cpf: user.cpf,
    professionId: user.professionId,
    specialty: user.specialty,
    registration: user.registration || '',
    presentation: user.presentation || '',
    status: user.status,
    timeZone: user.timezone
  });

  const hasMultipleAddresses = user.subscription?.plan === "PROFESSIONAL";

  // 🔥 FUNÇÕES DE VALIDAÇÃO
  const validations = useMemo(() => {
    const name = form.watch("name");
    const presentation = form.watch("presentation");
    const cpf = form.watch("cpf");
    const phone = form.watch("phone");
    const professionId = form.watch("professionId");
    const specialty = form.watch("specialty");
    const registration = form.watch("registration");
    const address = form.watch("address");

    return {
      avatar: !!user.image,
      presentation: !!(presentation && presentation.length >= 50 && presentation.length <= 500),
      personalInfo: !!(
        name && name.length >= 3 &&
        user.urlNameProfessional &&
        cpf && cpf.replace(/\D/g, '').length === 11 &&
        phone && phone.replace(/\D/g, '').length >= 10
      ),
      professionalInfo: !!(
        professionId &&
        selectedTypeServices.length >= 1 &&
        specialty && specialty.length > 0 &&
        registration && registration.length > 0
      ),
      typeProfile: !!selectedTypeProfile,
      addresses: (() => {
        if (hasMultipleAddresses) {
          const addresses = Array.isArray(address) ? address : [];
          const isValid = addresses.length > 0 && addresses.every((addr: any) => {
            const normalized = typeof addr === 'string' 
              ? { address: addr, phone: '', contact: '' } 
              : addr;
            return !!(normalized?.address && normalized.address.length >= 10 &&
                   normalized?.phone && normalized.phone.length > 0);
          });
          return !!isValid;
        } else {
          let addressData: any;
          
          if (typeof address === 'string') {
            addressData = { address, phone: '', contact: '' };
          } else if (Array.isArray(address) && address.length > 0) {
            const firstItem = address[0];
            addressData = typeof firstItem === 'string' 
              ? { address: firstItem, phone: '', contact: '' }
              : firstItem;
          } else if (address && typeof address === 'object') {
            addressData = address;
          } else {
            addressData = { address: '', phone: '', contact: '' };
          }
          
          return !!(addressData?.address && addressData.address.length >= 10 &&
                 addressData?.phone && addressData.phone.length > 0);
        }
      })(),
      terms: !!termsAccepted
    };
  }, [
    form.watch("name"),
    form.watch("presentation"),
    form.watch("cpf"),
    form.watch("phone"),
    form.watch("professionId"),
    form.watch("specialty"),
    form.watch("registration"),
    form.watch("address"),
    selectedTypeServices,
    selectedTypeProfile,
    termsAccepted,
    user.image,
    user.urlNameProfessional,
    hasMultipleAddresses
  ]);

  const hours = generateDayGrid(8, 24);

  function toggleHour(hour: string) {
    setSelectedHours((prev) => prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour].sort())
  }

  const timeZones = Intl.supportedValuesOf("timeZone").filter((zone) =>
    zone.startsWith("America/Brasilia") ||
    zone.startsWith("America/Sao_Paulo") ||
    zone.startsWith("America/Fortaleza") ||
    zone.startsWith("America/Recife") ||
    zone.startsWith("America/Bahia") ||
    zone.startsWith("America/Belem") ||
    zone.startsWith("America/Manaus") ||
    zone.startsWith("America/Cuiaba") ||
    zone.startsWith("America/Boa_Vista")
  );

  async function onSubmit(values: ProfileFormData) {
    const extractedPhone = extractPhoneNumber(values.phone || "")

    let addressToSave: any;

    if (hasMultipleAddresses) {
      addressToSave = Array.isArray(values.address) 
        ? values.address 
        : [values.address];
    } else {
      addressToSave = Array.isArray(values.address)
        ? values.address[0]
        : values.address;
    }

    const response = await updateProfile(user.id, {
      name: values.name,
      address: addressToSave,
      cpf: values.cpf,
      professionId: values.professionId,
      specialty: values.specialty,
      registration: values.registration,
      presentation: values.presentation,
      status: values.status === 'active' ? true : false,
      phone: extractedPhone,
      timeZone: values.timeZone,
      times: selectedHours || [],
      termsAccepted: termsAccepted,
      teleConsultation: teleconsulta,
      typeProfile: selectedTypeProfile,
      typeServiceIds: selectedTypeServices, 
    })

    if (response.error) {
      toast.error(response.error)
      return;
    }

    if (response.success) {
      await update()
      
      // 🎉 CELEBRAÇÃO SE PERFIL ESTIVER 100% COMPLETO
      const allValid = Object.values(validations).every(v => v === true);
      
      if (allValid) {
        // 🎊 COMBO SUPREMO - Celebração Máxima de Marco Importante!
        const confettiDuration = 10000; // 🔥 Confetes por 10 segundos
        const modalDuration = 30000; // Modal fica 30 segundos

        // 1️⃣ EXPLOSÃO INICIAL GIGANTE - BOOM!
        confetti({
          particleCount: 200,
          spread: 200,
          origin: { y: 0.6 },
          colors: ['#10b981', '#14b8a6', '#059669', '#0d9488'],
          zIndex: 9999
        });

        // 2️⃣ FOGOS DE ARTIFÍCIO EM SEQUÊNCIA - 3 Ondas
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.3, y: 0.5 },
            colors: ['#10b981', '#14b8a6', '#059669', '#0d9488'],
            zIndex: 9999
          });
        }, 500);

        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.7, y: 0.5 },
            colors: ['#10b981', '#14b8a6', '#059669', '#0d9488'],
            zIndex: 9999
          });
        }, 1000);

        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { x: 0.5, y: 0.4 },
            colors: ['#10b981', '#14b8a6', '#059669', '#0d9488'],
            zIndex: 9999
          });
        }, 1500);

        // 3️⃣ CHUVA CONTÍNUA DOS LADOS por 10 segundos
        const confettiEnd = Date.now() + confettiDuration;
        (function frame() {
          if (Date.now() >= confettiEnd) {
            return; // 🔥 PARA quando acabar os 10 segundos
          }

          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: ['#10b981', '#14b8a6', '#059669', '#0d9488'],
            zIndex: 9999
          });
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: ['#10b981', '#14b8a6', '#059669', '#0d9488'],
            zIndex: 9999
          });

          requestAnimationFrame(frame);
        }());

        // 4️⃣ ESTRELAS DOURADAS CAINDO por 10 segundos
        const starInterval = setInterval(() => {
          if (Date.now() >= confettiEnd) {
            clearInterval(starInterval); // 🔥 PARA após 10 segundos
            return;
          }
          
          confetti({
            particleCount: 1,
            spread: 360,
            startVelocity: 15,
            origin: { x: Math.random(), y: 0 },
            colors: ['#fbbf24', '#f59e0b'],
            shapes: ['circle'],
            scalar: 1.5,
            zIndex: 9999
          });
        }, 300);

        // Abrir modal de celebração
        setShowCelebration(true);

        // Fechar modal automaticamente após 30 segundos
        setTimeout(() => {
          setShowCelebration(false);
        }, modalDuration);
      } else {
        toast.success("Perfil atualizado com sucesso!")
      }
    }
  }

  async function handleLogout() {
    await signOut();
    await update();
    router.replace("/")
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

  const handleToggleTypeService = (typeServiceId: string, checked: boolean) => {
    if (checked) {
      if (tempSelectedTypeServices.length >= maxTypeServices) {
        toast.error(`Limite de ${maxTypeServices} tipo(s) atingido para o plano ${plan}`)
        return
      }
      setTempSelectedTypeServices(prev => [...prev, typeServiceId])
    } else {
      setTempSelectedTypeServices(prev => prev.filter(id => id !== typeServiceId))
    }
  }

  const handleRemoveTypeService = (typeServiceId: string) => {
    setSelectedTypeServices(prev => prev.filter(id => id !== typeServiceId))
    toast.success("Tipo de atendimento removido")
  }

  const getTypeServiceData = (id: string): TypeServiceData | undefined => {
    return allTypeServices.find((ts) => ts.id === id)
  }

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mx-auto space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <User className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 shrink-0" />
                  Meu Perfil
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">Complete seu perfil profissional seguindo os passos abaixo</p>
              </div>
            </div>

            {/* 🔥 ACCORDIONS */}
            <Accordion type="multiple" defaultValue={["avatar", "presentation"]} className="space-y-4">
              
              {/* 1. Avatar */}
              <AccordionItem value="avatar" className="border border-emerald-200 rounded-lg bg-white shadow-sm">
                <AccordionTrigger className="px-4 md:px-6 py-3 md:py-4 hover:no-underline hover:bg-emerald-50/50">
                  <div className="flex items-center gap-3 w-full">
                    <Camera className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-lg">Foto de Perfil</span>
                    <div className="ml-auto mr-4">
                      <ValidationIndicator isValid={validations.avatar} />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 md:px-6 pb-4 md:pb-6 pt-2">
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-2 rounded-full shadow-lg">
                      <AvatarProfile
                        userId={user.id}
                        avatarUrl={user.image} 
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Clique na imagem para alterar sua foto de perfil
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 2. Apresentação */}
              <AccordionItem value="presentation" className="border border-emerald-200 rounded-lg bg-white shadow-sm">
                <AccordionTrigger className="px-4 md:px-6 py-3 md:py-4 hover:no-underline hover:bg-emerald-50/50">
                  <div className="flex items-center gap-3 w-full">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-lg">Apresentação</span>
                    <div className="ml-auto mr-4">
                      <ValidationIndicator isValid={validations.presentation} />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 md:px-6 pb-4 md:pb-6 pt-2 space-y-4">
                  <FormField
                    control={form.control}
                    name="presentation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Apresentação pessoal *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Conte um pouco sobre você, sua experiência e especialidades..."
                            className="min-h-[150px] resize-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </FormControl>
                        <FormDescription className="text-xs flex items-center justify-between">
                          <span>Aparece na página de agendamento (50-500 caracteres)</span>
                          <span className={cn(
                            "font-semibold",
                            field.value && field.value.length >= 50 && field.value.length <= 500
                              ? "text-emerald-600"
                              : "text-red-600"
                          )}>
                            {field.value?.length || 0}/500
                          </span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* 3. Informações Pessoais */}
              <AccordionItem value="personal" className="border border-emerald-200 rounded-lg bg-white shadow-sm">
                <AccordionTrigger className="px-4 md:px-6 py-3 md:py-4 hover:no-underline hover:bg-emerald-50/50">
                  <div className="flex items-center gap-3 w-full">
                    <User className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-lg">Informações Pessoais</span>
                    <div className="ml-auto mr-4">
                      <ValidationIndicator isValid={validations.personalInfo} />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 md:px-6 pb-4 md:pb-6 pt-2 space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Nome completo *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Digite seu nome completo..."
                            className="h-11 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <ProfileUrlField 
                    userId={user.id}
                    initialSlug={user.urlNameProfessional}
                    userName={user.name || ""}
                  />

                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          CPF *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="000.000.000-00"
                            className="h-11 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-emerald-600" />
                          Telefone *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="(00) 00000-0000"
                            className="h-11 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            onChange={(e) => {
                              const formattedValue = formatPhone(e.target.value)
                              field.onChange(formattedValue)
                            }}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-red-600">
                          Este telefone é para contato interno, não será divulgado.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* 4. Informações Profissionais */}
              <AccordionItem value="professional" className="border border-emerald-200 rounded-lg bg-white shadow-sm">
                <AccordionTrigger className="px-4 md:px-6 py-3 md:py-4 hover:no-underline hover:bg-emerald-50/50">
                  <div className="flex items-center gap-3 w-full">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-lg">Informações Profissionais</span>
                    <div className="ml-auto mr-4">
                      <ValidationIndicator isValid={validations.professionalInfo} />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 md:px-6 pb-4 md:pb-6 pt-2 space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-1">
                      <FormField
                        control={form.control}
                        name="professionId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Profissão *
                            </FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}>
                                <SelectTrigger className="h-11 focus:ring-2 focus:ring-emerald-500">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {professionsLoading ? (
                                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                                  ) : professions?.length === 0 ? (
                                    <SelectItem value="none" disabled>Nenhuma encontrada</SelectItem>
                                  ) : (
                                    professions?.map((profession) => (
                                      <SelectItem key={profession.id} value={profession.id}>
                                        {profession.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="md:col-span-3">
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
                            className="w-full h-11 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 justify-start text-left font-normal"
                          >
                            <Briefcase className="h-4 w-4 mr-2 text-emerald-600" />
                            {selectedTypeServices.length === 0
                              ? "Selecionar tipos de atendimento"
                              : `${selectedTypeServices.length} tipo(s) selecionado(s)`
                            }
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                                <Briefcase className="h-5 w-5 text-emerald-600" />
                              </div>
                              Gerenciar Tipos de Atendimento
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

                          <div className="grid gap-2 py-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
                            {allTypeServices.map((typeService) => {
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

                      {selectedTypeServices.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {selectedTypeServices.map((typeServiceId) => {
                            const typeService = getTypeServiceData(typeServiceId)
                            if (!typeService) return null

                            return (
                              <div
                                key={typeServiceId}
                                className="flex items-start justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg group hover:bg-emerald-100 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-900 text-xs mb-0.5">
                                    {typeService.name}
                                  </p>
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
                                  className="h-6 w-6 p-0 ml-2 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {selectedTypeServices.length === 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Selecione pelo menos 1 tipo de atendimento
                        </p>
                      )}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Especialidade *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: Ortodontia..."
                            className="h-11 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-600" />
                          Registro profissional *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: CRM 12345, COREN 67890..."
                            className="h-11 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Número do registro profissional
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* 5. Tipo de Perfil */}
              <AccordionItem value="typeProfile" className="border border-emerald-200 rounded-lg bg-white shadow-sm">
                <AccordionTrigger className="px-4 md:px-6 py-3 md:py-4 hover:no-underline hover:bg-emerald-50/50">
                  <div className="flex items-center gap-3 w-full">
                    <User className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-lg">Tipo de Perfil</span>
                    <div className="ml-auto mr-4">
                      <ValidationIndicator isValid={validations.typeProfile} />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 md:px-6 pb-4 md:pb-6 pt-2 space-y-3">
                  <Select 
                    value={selectedTypeProfile} 
                    onValueChange={(value) => setSelectedTypeProfile(value as TypeProfile)}
                  >
                    <SelectTrigger className="h-11 focus:ring-2 focus:ring-emerald-500">
                      <SelectValue placeholder="Selecione o tipo de perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TOTAL">
                        <div className="flex flex-col">
                          <span className="font-semibold">Perfil Completo</span>
                          <span className="text-xs text-gray-500">Agendamento online completo</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="INFO">
                        <div className="flex flex-col">
                          <span className="font-semibold">Perfil Informativo</span>
                          <span className="text-xs text-gray-500">Apenas informações de contato</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="WAITLIST">
                        <div className="flex flex-col">
                          <span className="font-semibold">Lista de Espera</span>
                          <span className="text-xs text-gray-500">Coleta de interessados</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    {selectedTypeProfile === 'TOTAL' && (
                      <p className="text-sm text-gray-700">
                        ✅ <strong>Perfil Completo:</strong> Pacientes podem agendar consultas online, ver horários disponíveis e fazer pagamentos.
                      </p>
                    )}
                    {selectedTypeProfile === 'INFO' && (
                      <p className="text-sm text-gray-700">
                        ℹ️ <strong>Perfil Informativo:</strong> Exibe suas informações profissionais, contato e localização. Sem agendamento online.
                      </p>
                    )}
                    {selectedTypeProfile === 'WAITLIST' && (
                      <p className="text-sm text-gray-700">
                        📋 <strong>Lista de Espera:</strong> Pacientes podem se cadastrar em uma fila de espera. Você entra em contato depois.
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 6. Locais de Atendimento */}
              <AccordionItem value="addresses" className="border border-emerald-200 rounded-lg bg-white shadow-sm">
                <AccordionTrigger className="px-4 md:px-6 py-3 md:py-4 hover:no-underline hover:bg-emerald-50/50">
                  <div className="flex items-center gap-3 w-full">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-lg">Locais de Atendimento</span>
                    <div className="ml-auto mr-4">
                      <ValidationIndicator isValid={validations.addresses} />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 md:px-6 pb-4 md:pb-6 pt-2">
                  {hasMultipleAddresses ? (
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => {
                        const addresses = Array.isArray(field.value) ? field.value : [];
                        const canAdd = addresses.length < 10;

                        return (
                          <FormItem>
                            <FormControl>
                              <div className="space-y-4">
                                {addresses.map((addressData: any, index: number) => {
                                  const normalizedData = typeof addressData === 'string'
                                    ? { address: addressData, phone: '', contact: '' }
                                    : addressData;

                                  return (
                                    <div key={index} className="border border-emerald-200 rounded-lg p-4 space-y-3 bg-emerald-50/30">
                                      <div className="flex items-center justify-between">
                                        <p className="font-semibold text-sm text-emerald-700">
                                          Local {index + 1}
                                        </p>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="h-8 border-red-300 hover:bg-red-50 text-red-600"
                                          onClick={() => {
                                            const newAddresses = addresses.filter((_: any, i: number) => i !== index);
                                            field.onChange(newAddresses);
                                          }}>
                                          <Trash2 className="h-3 w-3 mr-1" />
                                          Remover
                                        </Button>
                                      </div>

                                      <div>
                                        <label className="text-xs font-semibold text-gray-700 mb-1 block">
                                          📍 Endereço Completo *
                                        </label>
                                        <Input
                                          value={normalizedData.address || ''}
                                          onChange={(e) => {
                                            const newAddresses = [...addresses];
                                            newAddresses[index] = {
                                              ...normalizedData,
                                              address: e.target.value
                                            };
                                            field.onChange(newAddresses);
                                          }}
                                          placeholder="Ex: Rua ABC, 123 - Centro - São Paulo/SP"
                                          className="h-11 focus:ring-2 focus:ring-emerald-500"
                                        />
                                      </div>

                                      <div>
                                        <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                          <Phone className="h-3 w-3" />
                                          Telefone de Contato *
                                        </label>
                                        <Input
                                          value={normalizedData.phone || ''}
                                          onChange={(e) => {
                                            const newAddresses = [...addresses];
                                            newAddresses[index] = {
                                              ...normalizedData,
                                              phone: e.target.value
                                            };
                                            field.onChange(newAddresses);
                                          }}
                                          placeholder="(00) 00000-0000"
                                          className="h-11 focus:ring-2 focus:ring-emerald-500"
                                        />
                                      </div>

                                      <div>
                                        <label className="text-xs font-semibold text-gray-700 mb-1 block">
                                          👤 Responsável (Opcional)
                                        </label>
                                        <Input
                                          value={normalizedData.contact || ''}
                                          onChange={(e) => {
                                            const newAddresses = [...addresses];
                                            newAddresses[index] = {
                                              ...normalizedData,
                                              contact: e.target.value
                                            };
                                            field.onChange(newAddresses);
                                          }}
                                          placeholder="Ex: Recepção, Dr. João, etc."
                                          className="h-11 focus:ring-2 focus:ring-emerald-500"
                                        />
                                      </div>
                                    </div>
                                  );
                                })}

                                {!canAdd && (
                                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-700 font-medium">
                                      ⚠️ Limite de 10 endereços atingido
                                    </p>
                                    <p className="text-xs text-red-600 mt-1">
                                      Remova um endereço para adicionar outro.
                                    </p>
                                  </div>
                                )}

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={!canAdd}
                                  className={cn(
                                    "w-full h-11",
                                    canAdd
                                      ? "border-emerald-300 hover:bg-emerald-50 text-emerald-700"
                                      : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                                  )}
                                  onClick={() => {
                                    if (canAdd) {
                                      const newAddresses = [...addresses, { address: '', phone: '', contact: '' }];
                                      field.onChange(newAddresses);
                                    }
                                  }}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  {canAdd ? "Adicionar local" : "Limite atingido (10/10)"}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => {
                        let addressData: any;
                        
                        if (typeof field.value === 'string') {
                          addressData = { address: field.value, phone: '', contact: '' };
                        } else if (Array.isArray(field.value) && field.value.length > 0) {
                          const firstItem = field.value[0];
                          addressData = typeof firstItem === 'string'
                            ? { address: firstItem, phone: '', contact: '' }
                            : firstItem;
                        } else {
                          addressData = field.value || { address: '', phone: '', contact: '' };
                        }

                        return (
                          <FormItem>
                            <FormControl>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs font-semibold text-gray-700 mb-1 block">
                                    📍 Endereço Completo *
                                  </label>
                                  <Input
                                    value={addressData.address || ''}
                                    onChange={(e) => field.onChange({ 
                                      ...addressData, 
                                      address: e.target.value 
                                    })}
                                    placeholder="Digite o endereço completo..."
                                    className="h-11 focus:ring-2 focus:ring-emerald-500"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    Telefone de Contato *
                                  </label>
                                  <Input
                                    value={addressData.phone || ''}
                                    onChange={(e) => field.onChange({ 
                                      ...addressData, 
                                      phone: e.target.value 
                                    })}
                                    placeholder="(00) 00000-0000"
                                    className="h-11 focus:ring-2 focus:ring-emerald-500"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-semibold text-gray-700 mb-1 block">
                                    👤 Responsável (Opcional)
                                  </label>
                                  <Input
                                    value={addressData.contact || ''}
                                    onChange={(e) => field.onChange({ 
                                      ...addressData, 
                                      contact: e.target.value 
                                    })}
                                    placeholder="Ex: Recepção, Dr. João, etc."
                                    className="h-11 focus:ring-2 focus:ring-emerald-500"
                                  />
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription className="text-xs text-gray-600 mt-2 flex items-start gap-2">
                              <span className="text-yellow-600">💡</span>
                              <span>
                                Plano Free permite apenas 1 endereço. Faça upgrade para Professional e cadastre até 10 locais!
                              </span>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* 7. Opções de Atendimento */}
              <AccordionItem value="options" className="border border-emerald-200 rounded-lg bg-white shadow-sm">
                <AccordionTrigger className="px-4 md:px-6 py-3 md:py-4 hover:no-underline hover:bg-emerald-50/50">
                  <div className="flex items-center gap-3 w-full">
                    <Video className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-lg">Opções de Atendimento</span>
                    <span className="ml-auto mr-4 text-xs text-gray-500">(Opcional)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 md:px-6 pb-4 md:pb-6 pt-2">
                  <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <Checkbox
                      id="teleconsulta"
                      checked={teleconsulta}
                      onCheckedChange={(checked) => setTeleconsulta(checked as boolean)}
                      className="border-emerald-500 data-[state=checked]:bg-emerald-500"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="teleconsulta"
                        className="text-sm font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                        <Video className="w-4 h-4 text-emerald-600" />
                        Oferecer Teleconsulta
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        Adiciona "Teleconsulta" como opção de serviço
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 8. Termos de Uso */}
              <AccordionItem value="terms" className="border border-emerald-200 rounded-lg bg-white shadow-sm">
                <AccordionTrigger className="px-4 md:px-6 py-3 md:py-4 hover:no-underline hover:bg-emerald-50/50">
                  <div className="flex items-center gap-3 w-full">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-lg">Termos de Uso</span>
                    <div className="ml-auto mr-4">
                      <ValidationIndicator isValid={validations.terms} />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 md:px-6 pb-4 md:pb-6 pt-2 space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 mb-3">
                      Faça o download e leia nossos termos:
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-emerald-300 hover:bg-emerald-50 text-emerald-700 h-10"
                      onClick={() => toast.info("Download será implementado em breve")}>
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Termos (PDF)
                    </Button>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-emerald-50 rounded-lg border-2 border-emerald-300">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                      className="mt-0.5 border-emerald-500 data-[state=checked]:bg-emerald-500"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium text-gray-900 cursor-pointer">
                        Li e aceito os Termos de Uso *
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        Ao aceitar, você concorda com as políticas
                      </p>
                    </div>
                    {termsAccepted && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>

            {/* 🎉 MODAL DE CELEBRAÇÃO */}
            <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
              <DialogContent className="sm:max-w-[600px] border-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-0 overflow-hidden">
                <div className="relative">
                  {/* Efeito de brilho */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 animate-pulse"></div>
                  
                  <div className="relative p-6 md:p-12 text-center space-y-6">
                    {/* Ícone de celebração */}
                    <div className="flex justify-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                        <CheckCircle2 className="w-14 h-14 text-white" />
                      </div>
                    </div>

                    {/* Título */}
                    <div className="space-y-3">
                      <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        🎉 Parabéns!
                      </h2>
                      <p className="text-xl md:text-2xl font-semibold text-gray-800">
                        Seja muito bem-vindo ao Base Medical!
                      </p>
                    </div>

                    {/* Mensagem */}
                    <div className="space-y-2">
                      <p className="text-lg text-gray-700 font-medium">
                        Seu perfil está completo e pronto para uso! ✨
                      </p>
                      <p className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Desfrute cada agendamento!
                      </p>
                    </div>

                    {/* Indicadores visuais */}
                    <div className="flex justify-center gap-2 pt-4">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>

                    {/* Badge de sucesso */}
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full text-white font-semibold shadow-lg">
                      <Check className="w-5 h-5" />
                      Perfil 100% Completo
                    </div>

                    {/* Botão para fechar manualmente */}
                    <Button
                      onClick={() => setShowCelebration(false)}
                      className="mt-6 bg-white text-emerald-600 border-2 border-emerald-500 hover:bg-emerald-50 font-semibold"
                    >
                      Continuar
                    </Button>

                    <p className="text-xs text-gray-500 mt-2">
                      Modal fecha automaticamente em 30 segundos
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Botão Salvar */}
            <Button
              type="submit"
              className={cn(
                "w-full h-14 text-base font-semibold",
                "bg-gradient-to-r from-emerald-500 to-teal-600",
                "hover:from-emerald-600 hover:to-teal-700",
                "shadow-lg"
              )}>
              <Save className="w-5 h-5 mr-2" />
              Salvar Todas as Alterações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}