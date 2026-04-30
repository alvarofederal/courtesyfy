"use client"

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

export const appointmentSchema = z.object({
    name: z.string().min(1, "O nome é obrigatório"),
    email: z.string().min(1, "O email é obrigatório"),
    phone: z.string().min(1, "O telefone é obrigatório"),
    address: z.string().min(1, "O endereço é obrigatório"),
    date: z.date(),
    typeServiceId: z.string().min(1, "O serviço é obrigatório"),
    startTime: z.date().optional(),
    endTime: z.date().optional(),
    confirmed: z.boolean().default(false).optional(),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>

export function useAppointmentForm(){
    return useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            typeServiceId: "",
            date: new Date(),
            startTime: undefined,
            endTime: undefined,
            confirmed: false,
        }
    })
}