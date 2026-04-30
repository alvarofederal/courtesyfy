"use client"

import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isPast, startOfDay } from "date-fns";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Prisma } from "@/generated/prisma";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Calendar, MapPin, Briefcase, Clock, Lock, Save, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toUTCDateString } from "@/utils/dateUtils";
import { ConfirmDeleteModal } from "./_components/confirm-delete-modal";
import { generateDayGrid } from "@/lib/scheduling";

export type AppointmentWithTypeService = Prisma.AppointmentGetPayload<{
    include: { typeService: true }
}>

type UserWithSubscription = Prisma.UserGetPayload<{
    include: { 
        subscription: true
        addresses: true
    }
}>

type AvailableSlot = {
    id: string;
    userId: string;
    address: string;
    typeServiceId: string;
    date: Date;
    times: string[];
    status: string;
}

export default function MySchedulePage() {
    const { data: session, status } = useSession();
    const user = session?.user;
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<string>("");
    const [selectedTypeServiceId, setSelectedTypeServiceId] = useState<string>("");
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [isDateLocked, setIsDateLocked] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [appointmentsCount, setAppointmentsCount] = useState(0);
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: userData, isLoading: userLoading } = useQuery<UserWithSubscription | null>({
        queryKey: ["user-data", user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const response = await fetch(`/api/users/${user.id}`);
            if (!response.ok) return null;
            return await response.json() as UserWithSubscription;
        },
        enabled: !!user?.id,
    });

    const { data: typeServices = [] } = useQuery({
        queryKey: ["type-services", user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const response = await fetch(`/api/type-services?userId=${user.id}`);
            if (!response.ok) return [];
            return await response.json() as { id: string; name: string; duration: number }[];
        },
        enabled: !!user?.id,
    });

    const { data: monthScheduleStatus = {} } = useQuery<Record<string, { total: number, booked: number, status: 'empty' | 'partial' | 'full' }>>({
        queryKey: ["month-schedule-status", user?.id, format(currentMonth, 'yyyy-MM')],
        queryFn: async () => {
            if (!user?.id) return {};
            
            const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
            
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_URL}/api/schedule/month-status?userId=${user.id}&start=${startDate}&end=${endDate}`
                );
                
                if (!response.ok) return {};
                
                return await response.json();
            } catch (error) {
                console.error("Erro ao buscar status do mês:", error);
                return {};
            }
        },
        enabled: !!user?.id,
        staleTime: 30000,
    });

    const { data: dateSchedules, isLoading: dateSchedulesLoading, refetch: refetchDateSchedules } = useQuery<AvailableSlot[]>({
        queryKey: ["date-schedules", user?.id, selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null],
        queryFn: async () => {
            if (!user?.id || !selectedDate) return [];
            
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            
            console.log('🔍 Verificando agendamentos para a data:', dateStr);
            
            const params = new URLSearchParams({
                userId: user.id,
                date: dateStr,
            });
            
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/schedule/get-date-schedules?${params}`);
                
                if (response.status === 404) {
                    console.log('📭 Nenhum agendamento encontrado para esta data');
                    return [];
                }
                
                if (!response.ok) {
                    console.error('❌ Erro na resposta:', response.status);
                    return [];
                }
                
                const data = await response.json();
                console.log('✅ Agendamentos encontrados:', data);
                return data as AvailableSlot[];
            } catch (error) {
                console.error('❌ Erro ao buscar agendamentos da data:', error);
                return [];
            }
        },
        enabled: !!user?.id && !!selectedDate,
        staleTime: 5000,
        refetchOnMount: true,
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    useEffect(() => {
        if (!dateSchedules || dateSchedules.length === 0) {
            setIsDateLocked(false);
            return;
        }

        const firstSchedule = dateSchedules[0];
        
        console.log('🔒 Data possui agendamento existente:', {
            address: firstSchedule.address,
            typeServiceId: firstSchedule.typeServiceId,
            timesCount: firstSchedule.times.length
        });

        setIsDateLocked(true);
        setSelectedAddress(firstSchedule.address);
        setSelectedTypeServiceId(firstSchedule.typeServiceId);
        setSelectedSlots(firstSchedule.times || []);

        const typeService = typeServices.find(ts => ts.id === firstSchedule.typeServiceId);
        
        toast.info(
            `📅 Esta data já possui um agendamento!\n📍 Local: ${firstSchedule.address}\n💼 Tipo de Atendimento: ${typeService?.name || 'N/A'}\n🔒 Campos bloqueados para esta data.`,
            { duration: 5000 }
        );

    }, [dateSchedules, typeServices]);

    if (status === "loading" || userLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!user || !userData) {
        return null;
    }

    const userAddresses = (() => {
        const addresses = userData.addresses?.map(a => a.address) ?? [];
        
        if (addresses.length === 0) return [];
        
        const plan = userData.subscription?.plan;
        const isMultiple = plan === "PROFESSIONAL";
        
        if (isMultiple) {
            return addresses;
        }
        
        return addresses.length > 0 ? [addresses[0]] : [];
    })();

    const monthDays = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const getMonthName = (date: Date) => {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const handleDateSelect = (day: Date) => {
        const today = startOfDay(new Date());
        const selectedDay = startOfDay(day);
        
        if (selectedDay < today) return;
        
        setSelectedDate(day);
        setSelectedAddress("");
        setSelectedTypeServiceId("");
        setSelectedSlots([]);
        setIsDateLocked(false);
    };

    const handleAddressChange = (address: string) => {
        if (isDateLocked) {
            toast.error("🔒 Não é possível alterar o endereço. Esta data já possui um agendamento.");
            return;
        }
        setSelectedAddress(address);
    };

    const handleTypeServiceChange = (typeServiceId: string) => {
        if (isDateLocked) {
            toast.error("🔒 Não é possível alterar o tipo de atendimento. Esta data já possui um agendamento.");
            return;
        }
        setSelectedTypeServiceId(typeServiceId);
    };

    const toggleSlot = (time: string) => {
        setSelectedSlots(prev => {
            const isSelected = prev.includes(time);
            return isSelected 
                ? prev.filter(t => t !== time) 
                : [...prev, time].sort();
        });
    };

    const handleSaveSchedule = async () => {
        if (!selectedDate || !selectedAddress || !selectedTypeServiceId || selectedSlots.length === 0) {
            toast.error("Selecione data, local, tipo de atendimento e pelo menos um horário");
            return;
        }

        if (!user?.id) {
            toast.error("Usuário não identificado");
            return;
        }

        const dateStr = toUTCDateString(selectedDate);

        console.log('💾 Salvando agenda:', {
            userId: user.id,
            date: dateStr,
            address: selectedAddress,
            typeServiceId: selectedTypeServiceId,
            times: selectedSlots
        });

        try {
            const response = await fetch('/api/schedule/save-appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    date: dateStr,
                    address: selectedAddress,
                    typeServiceId: selectedTypeServiceId,
                    slots: selectedSlots,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || "Erro ao salvar agenda");
                return;
            }

            const result = await response.json();
            console.log('✅ Agenda salva com sucesso:', result);

            toast.success(`Agenda salva! ${selectedSlots.length} horário(s) disponibilizado(s)`);
            
            await queryClient.invalidateQueries({ 
                queryKey: ["date-schedules", user.id, dateStr] 
            });
            await queryClient.invalidateQueries({ 
                queryKey: ["month-schedule-status", user.id, format(currentMonth, 'yyyy-MM')] 
            });
            
            setTimeout(() => {
                refetchDateSchedules();
            }, 500);
            
        } catch (error) {
            console.error("❌ Erro ao salvar agenda:", error);
            toast.error("Erro ao salvar agenda");
        }
    };

    const handleClearScheduleClick = async () => {
        if (!selectedDate || !selectedAddress || !selectedTypeServiceId) return;
        if (!user?.id) return;

        if (selectedSlots.length === 0) {
            toast.error("Não há horários para limpar");
            return;
        }

        const dateStr = toUTCDateString(selectedDate);

        try {
            const params = new URLSearchParams({
                userId: user.id,
                date: dateStr,
                typeServiceId: selectedTypeServiceId,
            });

            const response = await fetch(`/api/schedule/check-appointments?${params}`);
            
            if (!response.ok) {
                toast.error("Erro ao verificar agendamentos");
                return;
            }

            const data = await response.json();
            
            if (data.hasAppointments && data.count > 0) {
                setAppointmentsCount(data.count);
                setShowDeleteModal(true);
            } else {
                await executeDelete();
            }

        } catch (error) {
            console.error("Error checking appointments:", error);
            toast.error("Erro ao verificar agendamentos");
        }
    };

    const allSlots = generateDayGrid();

    const executeDelete = async () => {
        if (!selectedDate || !selectedAddress || !selectedTypeServiceId || !user?.id) return;

        const dateStr = toUTCDateString(selectedDate);

        try {
            const response = await fetch('/api/schedule/delete-schedule', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    date: dateStr,
                    address: selectedAddress,
                    typeServiceId: selectedTypeServiceId,
                }),
            });

            if (!response.ok) {
                toast.error("Erro ao limpar agenda");
                return;
            }

            const result = await response.json();

            if (result.deletedAppointments > 0) {
                toast.success(`Agenda limpa! ${result.deletedAppointments} agendamento(s) de pacientes cancelados`);
            } else {
                toast.success("Agenda limpa com sucesso");
            }
            
            setSelectedSlots([]);
            setIsDateLocked(false);
            setShowDeleteModal(false);
            
            await queryClient.invalidateQueries({ 
                queryKey: ["date-schedules", user.id, dateStr] 
            });
            await queryClient.invalidateQueries({ 
                queryKey: ["month-schedule-status", user.id, format(currentMonth, 'yyyy-MM')] 
            });
            refetchDateSchedules();

        } catch (error) {
            console.error("Error clearing schedule:", error);
            toast.error("Erro ao limpar agenda");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-emerald-600" />
                            Abrir Minha Agenda
                        </h1>
                        <p className="text-gray-600 mt-1">Configure seus horários disponíveis para atendimento</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-emerald-200 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Calendar className="w-5 h-5 text-emerald-600" />
                                    Selecione a Data
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={prevMonth} 
                                            disabled={startOfMonth(currentMonth) <= startOfMonth(new Date())}
                                            className="border-emerald-300 hover:bg-emerald-50"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <h3 className="text-base font-semibold text-gray-900">
                                            {getMonthName(currentMonth)}
                                        </h3>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={nextMonth}
                                            className="border-emerald-300 hover:bg-emerald-50"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                                            <div key={i} className="text-center font-semibold text-xs text-gray-500 py-2">
                                                {day}
                                            </div>
                                        ))}
                                        
                                        {Array.from({ length: startOfMonth(currentMonth).getDay() }, (_, i) => (
                                            <div key={`empty-${i}`} className="h-10" />
                                        ))}
                                        
                                        {monthDays.map((day, index) => {
                                            const isSelected = selectedDate && startOfDay(selectedDate).getTime() === startOfDay(day).getTime();
                                            const isDisabled = startOfDay(day) < startOfDay(new Date());
                                            
                                            const dateKey = format(day, 'yyyy-MM-dd');
                                            const dateStatus = monthScheduleStatus[dateKey]?.status;
                                            
                                            console.log("Monitorando o metodo monthScheduleStatus: ", monthScheduleStatus)

                                            const statusColor = dateStatus === 'empty' 
                                                ? 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200' 
                                                : dateStatus === 'partial'
                                                ? 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200'
                                                : dateStatus === 'full'
                                                ? 'bg-red-100 border-red-400 text-red-800 hover:bg-red-200'
                                                : '';
                                            
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    className={cn(
                                                        'h-10 text-sm p-0 font-semibold',
                                                        isSelected && 'bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500',
                                                        !isSelected && statusColor,
                                                        isDisabled && 'opacity-30 cursor-not-allowed'
                                                    )}
                                                    disabled={isDisabled}
                                                    onClick={() => handleDateSelect(day)}
                                                >
                                                    {day.getDate()}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    {selectedDate && (
                                        <div className="pt-3 border-t">
                                            <p className="text-sm text-emerald-600 font-medium">
                                                ✓ {format(selectedDate, "dd/MM/yyyy")}
                                            </p>
                                            {isDateLocked && (
                                                <p className="text-sm text-orange-600 font-medium mt-2 flex items-center gap-1">
                                                    <Lock className="h-3 w-3" />
                                                    Data com agendamento existente
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="pt-4 border-t">
                                        <p className="text-xs font-semibold text-gray-600 mb-2">Legenda:</p>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded border-2 border-green-400 bg-green-100"></div>
                                                <span className="text-xs text-gray-700">Agenda aberta sem marcações</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded border-2 border-yellow-400 bg-yellow-100"></div>
                                                <span className="text-xs text-gray-700">Agenda com marcações parciais</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded border-2 border-red-400 bg-red-100"></div>
                                                <span className="text-xs text-gray-700">Agenda completamente ocupada</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {selectedDate && (
                            <Card className="border-emerald-200 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <MapPin className="w-5 h-5 text-emerald-600" />
                                        Local de Atendimento
                                        {isDateLocked && <Lock className="h-4 w-4 text-orange-500" />}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {dateSchedulesLoading ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                                        </div>
                                    ) : userAddresses.length === 0 ? (
                                        <p className="text-sm text-red-600">
                                            Nenhum endereço cadastrado. Configure no seu perfil.
                                        </p>
                                    ) : (
                                        <>
                                            <Select 
                                                value={selectedAddress} 
                                                onValueChange={handleAddressChange}
                                                disabled={isDateLocked}
                                            >
                                                <SelectTrigger className={cn("h-11", isDateLocked && "bg-gray-100")}>
                                                    <SelectValue placeholder="Escolha o local" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {userAddresses.map((address: string, index: number) => (
                                                        <SelectItem key={index} value={address}>
                                                            {address}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {selectedAddress && (
                                                <p className="text-sm text-emerald-600 font-medium mt-3">✓ {selectedAddress}</p>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {selectedDate && selectedAddress && (
                            <Card className="border-emerald-200 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Briefcase className="w-5 h-5 text-emerald-600" />
                                        Tipo de Atendimento
                                        {isDateLocked && <Lock className="h-4 w-4 text-orange-500" />}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {typeServices.length === 0 ? (
                                        <p className="text-sm text-red-600">
                                            Nenhum tipo de atendimento cadastrado. Configure seus tipos primeiro.
                                        </p>
                                    ) : (
                                        <>
                                            <Select 
                                                value={selectedTypeServiceId} 
                                                onValueChange={handleTypeServiceChange}
                                                disabled={isDateLocked}
                                            >
                                                <SelectTrigger className={cn("h-11", isDateLocked && "bg-gray-100")}>
                                                    <SelectValue placeholder="Escolha o tipo de atendimento" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {typeServices.map((typeService) => (
                                                        <SelectItem key={typeService.id} value={typeService.id}>
                                                            {typeService.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {selectedTypeServiceId && (
                                                <p className="text-sm text-emerald-600 font-medium mt-3">
                                                    ✓ {typeServices.find(ts => ts.id === selectedTypeServiceId)?.name}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        {selectedDate && selectedAddress && selectedTypeServiceId && (
                            <Card className="border-emerald-200 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <Clock className="w-5 h-5 text-emerald-600" />
                                            Horários Disponíveis
                                        </CardTitle>
                                        <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-emerald-200">
                                            {selectedSlots.length} horário(s) selecionado(s)
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {dateSchedulesLoading ? (
                                        <div className="flex justify-center py-12">
                                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-6">
                                                {allSlots.map((time: string) => {
                                                    const isSelected = selectedSlots.includes(time);
                                                    
                                                    return (
                                                        <Button
                                                            key={time}
                                                            variant={isSelected ? "default" : "outline"}
                                                            size="sm"
                                                            className={cn(
                                                                'h-12 text-sm font-medium transition-all',
                                                                isSelected 
                                                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0'
                                                                    : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                                                            )}
                                                            onClick={() => toggleSlot(time)}
                                                        >
                                                            {time}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                            
                                            <div className="flex gap-3 pt-6 border-t">
                                                <Button 
                                                    onClick={handleSaveSchedule} 
                                                    className={cn(
                                                    "flex-1 h-12 text-base font-semibold",
                                                    "bg-gradient-to-r from-emerald-500 to-teal-600",
                                                    "hover:from-emerald-600 hover:to-teal-700"
                                                    )}
                                                    disabled={selectedSlots.length === 0}
                                                >
                                                    <Save className="w-5 h-5 mr-2" />
                                                    Salvar Agenda ({selectedSlots.length})
                                                </Button>
                                                
                                                {selectedSlots.length > 0 && (
                                                    <Button 
                                                    onClick={handleClearScheduleClick}
                                                    variant="destructive"
                                                    className="h-12 px-6"
                                                    >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Limpar Tudo
                                                    </Button>
                                                )}
                                            </div>
                                            <ConfirmDeleteModal
                                            open={showDeleteModal}
                                            onOpenChange={setShowDeleteModal}
                                            onConfirm={executeDelete}
                                            appointmentsCount={appointmentsCount}
                                            />
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {(!selectedDate || !selectedAddress || !selectedTypeServiceId) && (
                            <Card className="border-emerald-200 shadow-lg">
                                <CardContent className="py-24">
                                    <div className="text-center text-gray-400">
                                        <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium">Selecione data, local e tipo de atendimento</p>
                                        <p className="text-sm mt-2">Configure os campos à esquerda para gerenciar seus horários</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}