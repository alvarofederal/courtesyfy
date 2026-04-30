// src/app/(public)/profissional/[id]/_components/date-picker.tsx - SUBSTITUIR COMPLETO
"use client"
import { useState } from "react"
import DataPicker, { registerLocale } from 'react-datepicker'
import { ptBR } from 'date-fns/locale/pt-BR'
import { format } from 'date-fns'
import { Calendar } from "lucide-react"
import "react-datepicker/dist/react-datepicker.css"

registerLocale("pt-BR", ptBR)

interface DataTimePickerProps {
    minDate?: Date
    className?: string
    initialDate?: Date
    onChange: (date: Date) => void
    highlightedDates?: string[]
}

export function DateTimePicker({
    initialDate, 
    className, 
    minDate, 
    onChange,
    highlightedDates = []
}: DataTimePickerProps) {

    const [startDate, setStartDate] = useState(initialDate || new Date())

    function handleChange(date: Date | null) {
        if (date) {
            console.log(date)
            setStartDate(date)
            onChange(date)
        }
    }

    const dayClassName = (date: Date): string => {
        const dateKey = format(date, 'yyyy-MM-dd')
        if (highlightedDates.includes(dateKey)) {
            return "react-datepicker__day--highlighted"
        }
        return ""
    }

    return (
        <div className="space-y-3">
            {/* ✅ Wrapper com estilo chamativo */}
            <div className="relative group">
                {/* ✅ Ícone de calendário dentro do input */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <Calendar className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                </div>
                
                {/* ✅ DataPicker com classes customizadas */}
                <DataPicker
                    className={`
                        ${className}
                        w-full pl-11 pr-4
                        border-2 border-emerald-200 
                        rounded-lg
                        bg-white
                        hover:border-emerald-400
                        focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100
                        transition-all duration-200
                        cursor-pointer
                        shadow-sm hover:shadow-md
                        font-medium text-gray-700
                    `}
                    selected={startDate}
                    locale="pt-BR"
                    minDate={minDate ?? new Date()}
                    onChange={handleChange}
                    dateFormat="dd/MM/yyyy"
                    dayClassName={dayClassName}
                    inline={false}
                    placeholderText="Clique para selecionar a data"
                />
            </div>
            
            {/* ✅ LEGENDA com ícone */}
            {highlightedDates.length > 0 && (
                <div className="flex items-center gap-3 text-xs bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-green-100 border-2 border-green-400 flex items-center justify-center">
                            <Calendar className="w-3 h-3 text-green-700" />
                        </div>
                        <span className="text-green-800 font-medium">Datas com agenda disponível aparecem em verde no calendário</span>
                    </div>
                </div>
            )}
        </div>
    )
}