// src/app/(public)/profissional/[id]/_components/schedule-content.tsx
"use client"

import Image from "next/image"
import imgTest from '../../../../../../public/foto1.png'
import { MapPin, Calendar, Clock, User, Mail, Phone, Briefcase, CheckCircle2, ArrowLeft } from "lucide-react"
import { useAppointmentForm, AppointmentFormData } from './schedule-form'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { formatPhone } from '@/utils/formatPhone'
import { DateTimePicker } from "./date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Prisma } from "@/generated/prisma"
import "react-datepicker/dist/react-datepicker.css"
import { useState, useCallback, useEffect, useMemo } from "react"
import { slotsRequiredFor } from "@/lib/scheduling"
import { ScheduleTimeList } from "./schedule-time-list"
import { createNewAppointment } from "../_actions/create-appointment"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { toUTCDateString } from "@/utils/dateUtils"
import { useRouter } from "next/navigation"
import { Header } from "@/app/(public)/_components/header"
import { Footer } from "@/app/(public)/_components/footer"
import { useSearchParams } from "next/navigation"
import { ReviewForm } from "@/components/review-form"
import { ReviewList } from "@/components/review-list"
import { format, addMonths, subMonths } from "date-fns"

type UserWithServiceAndSubscription = Prisma.UserGetPayload<{
  include: {
    subscription: true
    addresses: true
    userTypeServices: {
      where: { active: true }
      include: {
        typeService: {
          select: {
            id: true
            name: true
            description: true
            duration: true
            status: true
          }
        }
      }
    }
  }
}>

interface ScheduleContentProps {
  professional: UserWithServiceAndSubscription
}

export interface TimeSlot {
  time: string
  available: boolean
}

export function ScheduleContent({ professional }: ScheduleContentProps) {
  const router = useRouter()
  const form = useAppointmentForm()
  const searchParams = useSearchParams()

  const { watch } = form

  const selectedDate = watch("date")
  const selectedTypeServiceId = watch("typeServiceId")
  const selectedAddress = watch("address")

  const [selectedTime, setSelectedTime] = useState("")
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [blockedTimes, setBlockedTimes] = useState<string[]>([])
  const [showBackButton, setShowBackButton] = useState(false)
  const [highlightedDates, setHighlightedDates] = useState<string[]>([])

  const services = professional.userTypeServices?.map(uts => uts.typeService) || []

  useEffect(() => {
    const fromSearch = searchParams.get('from') === 'search'
    setShowBackButton(fromSearch)
  }, [searchParams])

  useEffect(() => {
    async function fetchAvailableDates() {
      try {
        const start = format(subMonths(new Date(), 1), 'yyyy-MM-dd')
        const end = format(addMonths(new Date(), 2), 'yyyy-MM-dd')
        
        const params = new URLSearchParams({
          userId: professional.id,
          start,
          end
        })

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/schedule/professional-dates?${params}`
        )
        
        if (response.ok) {
          const dates = await response.json()
          setHighlightedDates(dates)
          console.log('📅 Datas com agenda:', dates)
        }
      } catch (error) {
        console.error("Erro ao buscar datas disponíveis:", error)
      }
    }

    fetchAvailableDates()
  }, [professional.id])

  const fetchAvailableSlots = useCallback(async (date: Date, address: string, typeServiceId: string): Promise<TimeSlot[]> => {
    setLoadingSlots(true)
    try {
      const dateString = toUTCDateString(date)

      const params = new URLSearchParams({
        userId: professional.id,
        date: dateString,
        address: address,
        typeServiceId: typeServiceId,
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/schedule/get-available-slots?${params}`)
      
      if (!response.ok) {
        console.error('❌ Erro ao buscar slots')
        setLoadingSlots(false)
        return []
      }

      const data = await response.json()
      
      setLoadingSlots(false)
      return data
    } catch (error) {
      console.error('❌ Erro:', error)
      setLoadingSlots(false)
      return []
    }
  }, [professional.id])

  const fetchBlockedTimes = useCallback(async (date: Date, address: string, typeServiceId: string): Promise<string[]> => {
    try {
      const dateString = toUTCDateString(date)

      const params = new URLSearchParams({
        userId: professional.id,
        date: dateString,
        address: address,
        typeServiceId: typeServiceId,
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/schedule/get-blocked-times?${params}`)
      
      if (!response.ok) {
        console.error('❌ Erro ao buscar bloqueios')
        return []
      }

      const blocked = await response.json()
      
      return blocked
    } catch (error) {
      console.error('❌ Erro:', error)
      return []
    }
  }, [professional.id])

  useEffect(() => {
    if (selectedDate && selectedAddress && selectedTypeServiceId) {
      
      Promise.all([
        fetchAvailableSlots(selectedDate, selectedAddress, selectedTypeServiceId),
        fetchBlockedTimes(selectedDate, selectedAddress, selectedTypeServiceId)
      ]).then(([slots, blocked]) => {
        
        setBlockedTimes(blocked)
        
        const finalSlots = slots.map((slot) => ({
          time: slot.time,
          available: slot.available && !blocked.includes(slot.time)
        }))

        setAvailableTimeSlots(finalSlots)

        const stillAvailable = finalSlots.find(
          (slot) => slot.time === selectedTime && slot.available
        )
    
        if (!stillAvailable && selectedTime) {
          setSelectedTime("")
        }
      }).catch(error => {
        console.error('❌ Erro ao carregar slots:', error)
      })
    } else {
      setAvailableTimeSlots([])
      setBlockedTimes([])
      setSelectedTime("")
    }
  }, [selectedDate, selectedAddress, selectedTypeServiceId, fetchAvailableSlots, fetchBlockedTimes, selectedTime])

  async function handleRegisterAppointment(formData: AppointmentFormData) {
    if (!selectedDate || !selectedTime) {
      toast.error("Selecione uma data e horário")
      return
    }

    const response = await createNewAppointment({
      name: formData.name,
      urlNameProfessional: formData?.name?.replace(/\s+/g, '-').toLowerCase(),
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      time: selectedTime,
      date: formData.date,
      typeServiceId: formData.typeServiceId,
      clinicId: professional.id,
    })

    if (response.error) {
      toast.error(response.error)
      return
    }

    toast.success("Agendamento realizado com sucesso!")
    form.reset()
    setSelectedTime("")
  }

  const selectedService = services.find(s => s.id === selectedTypeServiceId)

  const uniqueAddresses = useMemo(() => {
    const addressSet = new Set<string>();
    return professional.addresses.filter(addr => {
      const trimmed = addr.address.trim();
      if (addressSet.has(trimmed)) {
        return false; // Já existe, pula
      }
      addressSet.add(trimmed);
      return true; // Primeira vez, inclui
    });
  }, [professional.addresses]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-1 bg-gradient-to-br from-emerald-50 via-white to-teal-50 pt-24">
        <section className="container mx-auto px-4 pt-1 pb-6">
          <div className="max-w-6xl mx-auto">
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors font-medium group mb-6"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Voltar para resultados
              </button>
            )}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-emerald-100">
              <article className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-emerald-100 shadow-md flex-shrink-0">
                  <Image
                    src={professional.image ? professional.image : imgTest}
                    alt="Foto do profissional"
                    className="object-cover"
                    fill
                  />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {professional.name}
                  </h1>
                  {professional.presentation && (
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {professional.presentation}
                    </p>
                  )}
                  
                  <div className="flex items-start gap-2 justify-center md:justify-start">
                    <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                    <div className="flex flex-col gap-1">
                      {professional.addresses && professional.addresses.length > 0 ? (
                        professional.subscription?.status === "active" && 
                        (professional.subscription.plan === "PROFESSIONAL" || professional.subscription.plan === "FREE") ? (
                          professional.addresses.map((addr, index) => (
                            <span key={index} className="text-gray-700 text-sm">
                              {addr.address}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-700 text-sm">{professional.addresses[0].address}</span>
                        )
                      ) : (
                        <span className="text-gray-400 text-sm">Endereço não informado</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    {professional.status ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Agendamento aberto
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        Fechado no momento
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-emerald-100">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Agende sua consulta</h2>
                <p className="text-gray-600">Preencha os dados abaixo para realizar seu agendamento</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleRegisterAppointment)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-semibold text-gray-700">
                            <User className="w-4 h-4 text-emerald-600" />
                            Nome completo
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <User className="w-5 h-5 text-emerald-600" />
                              </div>
                              <Input
                                placeholder="Digite seu nome completo"
                                className="h-11 pl-11 border-2 border-emerald-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all shadow-sm hover:shadow-md"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-semibold text-gray-700">
                            <Mail className="w-4 h-4 text-emerald-600" />
                            E-mail
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Mail className="w-5 h-5 text-emerald-600" />
                              </div>
                              <Input
                                type="email"
                                placeholder="seu@email.com"
                                className="h-11 pl-11 border-2 border-emerald-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all shadow-sm hover:shadow-md"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-semibold text-gray-700">
                          <Phone className="w-4 h-4 text-emerald-600" />
                          Telefone
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <Phone className="w-5 h-5 text-emerald-600" />
                            </div>
                            <Input
                              placeholder="(00) 00000-0000"
                              className="h-11 pl-11 border-2 border-emerald-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all shadow-sm hover:shadow-md"
                              {...field}
                              onChange={(e) => {
                                const formattedValue = formatPhone(e.target.value)
                                field.onChange(formattedValue)
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-semibold text-gray-700">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          Local de atendimento
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                              <MapPin className="w-5 h-5 text-emerald-600" />
                            </div>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value)
                                setSelectedTime("")
                              }}
                              value={field.value}>
                              <SelectTrigger className="h-11 pl-11 border-2 border-emerald-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all shadow-sm hover:shadow-md">
                                <SelectValue placeholder="Selecione o local do atendimento que deseja" />
                              </SelectTrigger>
                              <SelectContent>
                                {professional.subscription?.status === "active" && 
                                (professional.subscription.plan === "PROFESSIONAL" || professional.subscription.plan === "FREE") ? (
                                  uniqueAddresses.map((addr, index) => (
                                    <SelectItem key={index} value={addr.address}>
                                      {addr.address}
                                    </SelectItem>
                                  ))
                                ) : (
                                  uniqueAddresses.length > 0 && (
                                    <SelectItem value={uniqueAddresses[0].address}>
                                      {uniqueAddresses[0].address}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="typeServiceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-semibold text-gray-700">
                          <Briefcase className="w-4 h-4 text-emerald-600" />
                          Tipo de atendimento
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                              <Briefcase className="w-5 h-5 text-emerald-600" />
                            </div>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value)
                                setSelectedTime("")
                              }}
                              value={field.value}>
                              <SelectTrigger className="h-11 pl-11 border-2 border-emerald-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all shadow-sm hover:shadow-md">
                                <SelectValue placeholder="Selecione o tipo de atendimento que deseja" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px]">
                                {services.map((service) => (
                                  <SelectItem 
                                    key={service.id} 
                                    value={service.id}
                                    className="py-3 cursor-pointer hover:bg-emerald-50"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900">
                                        {service.name}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-semibold text-gray-700">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          Data do agendamento
                        </FormLabel>
                        <FormControl>
                          <DateTimePicker
                            initialDate={new Date()}
                            className="h-11"
                            highlightedDates={highlightedDates}
                            onChange={(date) => {
                              if (date) {
                                field.onChange(date)
                                setSelectedTime("")
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedTypeServiceId && selectedAddress && selectedDate && (
                    <div className="space-y-4 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 font-semibold text-gray-700">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          Horários disponíveis
                        </Label>
                        {selectedService && (
                          <span className="text-sm text-gray-600">
                            Duração: {selectedService.duration} min
                          </span>
                        )}
                      </div>

                      {loadingSlots ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm text-gray-600">Carregando horários...</p>
                          </div>
                        </div>
                      ) : availableTimeSlots.length === 0 ? (
                        <div className="text-center py-12">
                          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">Nenhum horário disponível para esta seleção</p>
                          <p className="text-sm text-gray-400 mt-1">Tente outra data, local ou serviço</p>
                        </div>
                      ) : (
                        <>
                          <ScheduleTimeList
                            onSelectTime={(time) => {
                              setSelectedTime(time)
                            }}
                            clinicTimes={availableTimeSlots.map(slot => slot.time)}
                            blockedTimes={blockedTimes}
                            availableTimeSlots={availableTimeSlots}
                            selectedTime={selectedTime}
                            selectedDate={selectedDate}
                            requiredSlots={
                              selectedService ? slotsRequiredFor(selectedService.duration) : 1
                            }
                          />
                        </>
                      )}
                    </div>
                  )}

                  {professional.status ? (
                    <Button 
                      type="submit"
                      className={cn(
                        "w-full h-12 text-base font-semibold transition-all",
                        "bg-gradient-to-r from-emerald-500 to-teal-600",
                        "hover:from-emerald-600 hover:to-teal-700",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "shadow-md hover:shadow-lg"
                      )}
                      disabled={
                        !watch("name") || 
                        !watch("email") || 
                        !watch("phone") || 
                        !watch("address") ||
                        !watch("date") ||
                        !watch("typeServiceId") ||
                        !selectedTime
                      }>
                      {selectedTime ? "Confirmar agendamento" : "Selecione um horário"}
                    </Button>
                  ) : (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                      <p className="text-red-700 font-medium">
                        Agendamentos temporariamente indisponíveis
                      </p>
                    </div>
                  )}
                </form>
              </Form>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 pb-6">
          <div className="max-w-6xl mx-auto">
            <ReviewForm 
              professionalId={professional.id}
              professionalName={professional.name || "Profissional"}
            />
          </div>
        </div>

        <div className="container mx-auto px-4 pb-8">
          <div className="max-w-6xl mx-auto">
            <ReviewList 
              professionalId={professional.id}
              professionalName={professional.name || "Profissional"}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}