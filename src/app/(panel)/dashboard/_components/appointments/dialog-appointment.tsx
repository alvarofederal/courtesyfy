// src/app/dashboard/appointments/_components/dialog-appointment.tsx
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AppointmentWithService } from "./appointments-list"
import { formatCurrency } from "@/utils/formatCurrency"
import { Calendar, Clock, User, Phone, Mail, MapPin, Briefcase, DollarSign, CheckCircle2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DialogAppointmentProps {
    appointment: AppointmentWithService | null
}

export function DialogAppointment({ appointment }: DialogAppointmentProps) {
    if (!appointment) return null

    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(appointment.appointmentDate))

    return (
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
                <div className="flex items-center justify-between">
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        Detalhes do Agendamento
                    </DialogTitle>
                </div>
                <DialogDescription className="text-base text-gray-600">
                    Informações completas sobre este agendamento
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
                {/* Status Badge */}
                <div className="flex justify-center">
                    {appointment.confirmed ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 px-4 py-2 text-sm font-semibold border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Confirmado
                        </Badge>
                    ) : (
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 px-4 py-2 text-sm font-semibold border border-orange-200">
                            <AlertCircle className="w-4 h-4 mr-1.5" />
                            Pendente de Confirmação
                        </Badge>
                    )}
                </div>

                {/* Data e Hora */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border-2 border-emerald-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Data e Horário</h3>
                    </div>
                    <div className="space-y-2 ml-13">
                        <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium">{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium">{appointment.time}</span>
                        </div>
                    </div>
                </div>

                {/* Informações do Paciente */}
                <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Paciente</h3>
                    </div>
                    <div className="space-y-3 ml-13">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 font-medium">{appointment.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{appointment.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 text-sm break-all">{appointment.email}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{appointment.address}</span>
                        </div>
                    </div>
                </div>

                {/* Serviço e Valor */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Serviço</h3>
                    </div>
                    <div className="space-y-3 ml-13">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-purple-600" />
                            <span className="text-gray-700 font-medium">{appointment.typeService?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span className="text-gray-700">{appointment.typeService?.duration} minutos</span>
                        </div>
                    </div>
                </div>
            </div>
        </DialogContent>
    )
}