"use client"

import { useSearchParams } from "next/navigation"
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Prisma } from "@/generated/prisma"
import { Button } from "@/components/ui/button"
import { Eye, X, Calendar, Clock, User, Phone, MapPin, Briefcase, CheckCircle2, AlertCircle, BarChart3, QrCode, Bell } from "lucide-react"
import { cancelAppointment } from "../../_actions/cancel-appointment"
import { toast } from "sonner"
import { useState } from "react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { DialogAppointment } from "./dialog-appointment"
import { ButtonPickerAppointment } from "./button-date"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { getTimesByDate } from "../../_actions/get-times-by-date"
import Link from "next/link"
import { ButtonCopyLink } from "../button-copy-link"
import { DialogQRCode } from "../dialog-qrcode"
import { DialogReminders } from "../reminder/dialog-reminders"
import { slotsRequiredFor } from "@/lib/scheduling"

export type AppointmentWithService = Prisma.AppointmentGetPayload<{
    include: {
        typeService: true,
        user: true,
    }
}>


export function AppointmentsList() {
    const searchParams = useSearchParams()
    const date = searchParams.get("date") || format(new Date(), 'yyyy-MM-dd')
    const queryClient = useQueryClient()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [detailAppointment, setDetailAppointment] = useState<AppointmentWithService | null>(null)
    const { data: session } = useSession()
    const userId = session?.user?.id
    const [qrCodeOpen, setQrCodeOpen] = useState(false)
    const [remindersFor, setRemindersFor] = useState<AppointmentWithService | null>(null)

    // Buscar horários disponibilizados para a data selecionada
    const { data: timesData } = useQuery({
        queryKey: ["times-by-date", userId, date],
        queryFn: async () => {
            if (!userId) return { times: [], userId: "" };
            return await getTimesByDate({ userId, date });
        },
        enabled: !!userId && !!date,
    });

    const times = timesData?.times || [];

    // Buscar agendamentos da data
    const { data: appointments, isLoading, refetch } = useQuery({
        queryKey: ["get-appointments", userId, date],
        queryFn: async () => {
            if (!userId) return [];
            
            const url = `${process.env.NEXT_PUBLIC_URL}/api/profissional/appointments?userId=${userId}&date=${date}`
            const response = await fetch(url)
            
            if (!response?.ok) {
                return []
            }

            const json = await response.json() as AppointmentWithService[]
            return json;
        },
        enabled: !!userId && !!date,
        staleTime: 20000,
        refetchInterval: 30000,
    })

    // Criar mapa de ocupação: horário → appointment
    const occupantMap: Record<string, AppointmentWithService> = {}

    if (appointments && appointments.length > 0) {
        for (const appointment of appointments) {
            const requiredSlots = slotsRequiredFor(appointment.typeService?.duration ?? 0);
            const startIndex = times.indexOf(appointment.time);

            if (startIndex !== -1) {
                for (let i = 0; i < requiredSlots; i++) {
                    const slotIndex = startIndex + i;

                    if (slotIndex < times.length) {
                        occupantMap[times[slotIndex]] = appointment
                    }
                }
            }
        }
    }

    async function handleAppointmentDelete(appointmentId: string) {
        const response = await cancelAppointment({ appointmentId })

        if (response.error) {
            toast.error(response.error)
            return;
        }

        queryClient.invalidateQueries({
            queryKey: ["get-appointments", userId, date]
        })
        refetch()
        toast.success(response.data)
    }

    const formattedDate = format(new Date(date + 'T00:00:00'), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    const totalAppointments = appointments?.length || 0;
    const confirmedCount = appointments?.filter(a => a.confirmed).length || 0;
    const pendingCount = totalAppointments - confirmedCount;

    // Calcular taxa de confirmação
    const confirmationRate = totalAppointments > 0 
        ? ((confirmedCount / totalAppointments) * 100).toFixed(0)
        : 0;

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto space-y-4 md:space-y-6">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 shrink-0" />
                                Meus agendamentos
                            </h1>
                            <p className="text-sm md:text-base text-gray-600 mt-1">Gerencie os atendimentos do dia</p>
                        </div>
                        {/* ✅ Botões alinhados à direita */}
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={`/profissional/${session?.user?.urlNameProfessional}`}
                                target="_blank" >
                                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Novo agendamento
                                </Button>
                            </Link>

                            <ButtonCopyLink 
                            userId={session?.user?.urlNameProfessional!}
                            label="Link do seu agendamento" />

                            <Button 
                                variant="outline"
                                className="border-emerald-300 hover:bg-emerald-50"
                                onClick={() => setQrCodeOpen(true)}>
                                <QrCode className="w-4 h-4 mr-2" />
                                QR Code
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-3 md:gap-4 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
                        <Card className="border-emerald-200 shadow-md">
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                            {totalAppointments}
                                        </p>
                                    </div>
                                    <Calendar className="h-8 w-8 text-emerald-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-green-200 shadow-md">
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase">Confirmados</p>
                                        <p className="text-2xl font-bold text-green-600 mt-1">
                                            {confirmedCount}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-orange-200 shadow-md">
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase">Pendentes</p>
                                        <p className="text-2xl font-bold text-orange-600 mt-1">
                                            {pendingCount}
                                        </p>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-orange-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-blue-200 shadow-md">
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase">Taxa Confirm.</p>
                                        <p className="text-2xl font-bold text-blue-600 mt-1">
                                            {confirmationRate}%
                                        </p>
                                    </div>
                                    <BarChart3 className="h-8 w-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Card */}
                    <Card className="border-emerald-200 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
                                        Agenda do Dia
                                    </CardTitle>
                                    <p className="text-sm text-gray-600 mt-1 capitalize">
                                        {formattedDate}
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <ButtonPickerAppointment />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6">
                            {times.length === 0 && !isLoading && (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium">Nenhum horário disponibilizado para esta data</p>
                                    <p className="text-sm text-gray-400 mt-2">Abra sua agenda para receber agendamentos</p>
                                </div>
                            )}

                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-sm text-gray-600">Carregando agenda...</p>
                                    </div>
                                </div>
                            ) : (
                                <ScrollArea className="h-[calc(100vh-24rem)]">
                                    <div className="space-y-3 pr-4">
                                        {times.map((slot) => {
                                            const occupant = occupantMap[slot]

                                            if (occupant) {
                                                return (
                                                    <div
                                                        key={slot}
                                                        className={cn(
                                                            "flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 p-2 sm:p-3 rounded-lg border transition-all hover:shadow-sm",
                                                            occupant.confirmed
                                                                ? "bg-emerald-50/60 border-emerald-200"
                                                                : "bg-orange-50/60 border-orange-200"
                                                        )}
                                                    >
                                                        {/* Time + Info */}
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className={cn(
                                                                "px-2 py-1.5 rounded-md font-bold text-center min-w-[58px] text-xs shadow-sm shrink-0",
                                                                occupant.confirmed
                                                                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                                                    : "bg-gradient-to-r from-orange-500 to-yellow-600 text-white"
                                                            )}>
                                                                <Clock className="w-3 h-3 mx-auto mb-0.5" />
                                                                {slot}
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                                                        {occupant.name}
                                                                    </h3>
                                                                    <span className={cn(
                                                                        "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full",
                                                                        occupant.confirmed
                                                                            ? "bg-emerald-100 text-emerald-700"
                                                                            : "bg-orange-100 text-orange-700"
                                                                    )}>
                                                                        {occupant.confirmed ? (
                                                                            <><CheckCircle2 className="w-3 h-3" />Confirmado</>
                                                                        ) : (
                                                                            <><AlertCircle className="w-3 h-3" />Pendente</>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap text-xs text-gray-600 mt-0.5">
                                                                    <span className="flex items-center gap-1 truncate max-w-[180px]">
                                                                        <Briefcase className="w-3 h-3 text-emerald-600 shrink-0" />
                                                                        {occupant.typeService?.name}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                                                        {occupant.phone}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions — sempre lado a lado */}
                                                        <div className="flex gap-1.5 lg:shrink-0">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 px-2.5 text-xs border-amber-300 hover:bg-amber-50 text-amber-700"
                                                                onClick={() => setRemindersFor(occupant)}>
                                                                <Bell className="w-3.5 h-3.5 sm:mr-1" />
                                                                <span className="hidden sm:inline">Lembretes</span>
                                                            </Button>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 px-2.5 text-xs border-emerald-300 hover:bg-emerald-50"
                                                                    onClick={() => setDetailAppointment(occupant)}>
                                                                    <Eye className="w-3.5 h-3.5 sm:mr-1 text-emerald-600" />
                                                                    <span className="hidden sm:inline">Ver</span>
                                                                </Button>
                                                            </DialogTrigger>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 px-2.5 text-xs border-red-300 hover:bg-red-50 text-red-600"
                                                                onClick={() => handleAppointmentDelete(occupant.id)}>
                                                                <X className="w-3.5 h-3.5 sm:mr-1" />
                                                                <span className="hidden sm:inline">Cancelar</span>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )
                                            }

                                            // Horário disponível (vazio)
                                            return (
                                                <div
                                                    key={slot}
                                                    className="flex items-center gap-3 p-2 sm:p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all"
                                                >
                                                    <div className="px-2 py-1.5 rounded-md bg-gray-300 text-gray-700 font-bold text-center min-w-[58px] text-xs shrink-0">
                                                        <Clock className="w-3 h-3 mx-auto mb-0.5" />
                                                        {slot}
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Horário disponível</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <DialogAppointment appointment={detailAppointment} />
            <DialogQRCode
                open={qrCodeOpen}
                onOpenChange={setQrCodeOpen}
                professionalUrl={session?.user?.urlNameProfessional || ""}
                professionalName={session?.user?.name || undefined}/>
            {remindersFor && userId && (
                <DialogReminders
                    open={!!remindersFor}
                    onOpenChange={(o) => !o && setRemindersFor(null)}
                    appointmentId={remindersFor.id}
                    patientName={remindersFor.name}
                    appointmentDate={remindersFor.appointmentDate}
                    time={remindersFor.time}
                    userId={userId}
                />
            )}
        </Dialog>
    )
}
