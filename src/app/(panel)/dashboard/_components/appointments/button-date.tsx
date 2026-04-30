"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, startOfDay } from "date-fns"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type MonthStatus = Record<string, { total: number; booked: number; status: 'empty' | 'partial' | 'full' }>

export function ButtonPickerAppointment() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()
    const userId = session?.user?.id

    const dateParam = searchParams.get("date") || format(new Date(), 'yyyy-MM-dd')
    const selectedDate = new Date(dateParam + 'T00:00:00')

    const [open, setOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate))

    const { data: monthScheduleStatus = {} } = useQuery<MonthStatus>({
        queryKey: ["month-schedule-status", userId, format(currentMonth, 'yyyy-MM')],
        queryFn: async () => {
            if (!userId) return {}
            const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
            const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
            try {
                const response = await fetch(
                    `/api/schedule/month-status?userId=${userId}&start=${startDate}&end=${endDate}`
                )
                if (!response.ok) return {}
                return await response.json()
            } catch {
                return {}
            }
        },
        enabled: !!userId && open,
        staleTime: 30000,
    })

    const monthDays = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    })

    const monthName = (() => {
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        return `${months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`
    })()

    function handleSelectDate(day: Date) {
        const newDate = format(day, 'yyyy-MM-dd')
        const url = new URL(window.location.href)
        url.searchParams.set("date", newDate)
        router.push(url.toString())
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-2 gap-2 text-sm md:text-base">
                    <CalendarIcon className="w-4 h-4 text-emerald-600" />
                    {format(selectedDate, "dd/MM/yyyy")}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-emerald-600" />
                        Selecione a Data
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="border-emerald-300 hover:bg-emerald-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h3 className="text-base font-semibold text-gray-900">{monthName}</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
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
                            const isSelected = startOfDay(selectedDate).getTime() === startOfDay(day).getTime()
                            const dateKey = format(day, 'yyyy-MM-dd')
                            const dateStatus = monthScheduleStatus[dateKey]?.status

                            const statusColor =
                                dateStatus === 'empty'
                                    ? 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200'
                                    : dateStatus === 'partial'
                                    ? 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200'
                                    : dateStatus === 'full'
                                    ? 'bg-red-100 border-red-400 text-red-800 hover:bg-red-200'
                                    : ''

                            return (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        'h-10 text-sm p-0 font-semibold',
                                        isSelected && 'bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500',
                                        !isSelected && statusColor
                                    )}
                                    onClick={() => handleSelectDate(day)}
                                >
                                    {day.getDate()}
                                </Button>
                            )
                        })}
                    </div>

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
            </DialogContent>
        </Dialog>
    )
}
