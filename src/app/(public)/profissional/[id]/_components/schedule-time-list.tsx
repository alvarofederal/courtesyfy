"use client"

import { Button } from "@/components/ui/button";
import { TimeSlot } from "./schedule-content";
import { cn } from '@/lib/utils'
import { isSlotInThePast, isToday, isSlotSequenceAvailable } from './schedule-utils'
import { Clock } from "lucide-react";
import { SLOT_INTERVAL_MINUTES, addMinutesToTime } from "@/lib/scheduling";

interface ScheduleTimeListProps {
  selectedDate: Date;
  selectedTime: string;
  requiredSlots: number;
  blockedTimes: string[];
  availableTimeSlots: TimeSlot[];
  clinicTimes: string[];
  onSelectTime: (time: string) => void;
}

export function ScheduleTimeList({
  selectedDate,
  availableTimeSlots,
  blockedTimes,
  clinicTimes,
  requiredSlots,
  selectedTime,
  onSelectTime
}: ScheduleTimeListProps) {

  const dateIsToday = isToday(selectedDate)

  console.log('🎯 ScheduleTimeList Debug:', {
    availableTimeSlotsCount: availableTimeSlots.length,
    availableTimeSlots: availableTimeSlots,
    blockedTimesCount: blockedTimes.length,
    blockedTimes: blockedTimes,
    clinicTimesCount: clinicTimes?.length || 0,
    clinicTimes: clinicTimes,
    requiredSlots,
    selectedTime,
    dateIsToday
  });

  // Função auxiliar para verificar se um slot e seus consecutivos estão completamente disponíveis
  const isSlotFullyAvailable = (slot: TimeSlot): { enabled: boolean; reason?: string } => {
    // 1. Verificar se o próprio slot está disponível
    if (!slot.available) {
      return { enabled: false, reason: "Horário indisponível" };
    }

    // 2. Verificar se o horário está no passado (apenas se for hoje)
    if (dateIsToday && isSlotInThePast(slot.time)) {
      return { enabled: false, reason: "Horário já passou" };
    }

    // 3. Verificar se o horário está bloqueado (já agendado)
    if (blockedTimes.includes(slot.time)) {
      return { enabled: false, reason: "Horário já agendado" };
    }

    // 4. Se o serviço requer mais de 1 slot, verificar sequência
    if (requiredSlots > 1) {
      // Encontrar o índice do slot atual na lista de todos os slots disponíveis
      const currentIndex = clinicTimes.indexOf(slot.time);
      
      if (currentIndex === -1) {
        return { enabled: false, reason: "Horário não encontrado" };
      }

      // Verificar se há slots suficientes após este
      if (currentIndex + requiredSlots > clinicTimes.length) {
        return { enabled: false, reason: "Não há horários consecutivos suficientes" };
      }

      // Verificar cada slot necessário
      for (let i = 0; i < requiredSlots; i++) {
        const nextSlotTime = clinicTimes[currentIndex + i];
        
        // Verificar se o slot consecutivo existe na lista de disponíveis
        const nextSlot = availableTimeSlots.find(s => s.time === nextSlotTime);
        
        if (!nextSlot || !nextSlot.available) {
          return { enabled: false, reason: `Horário ${nextSlotTime} não disponível` };
        }

        // Verificar se está bloqueado (já agendado)
        if (blockedTimes.includes(nextSlotTime)) {
          return { enabled: false, reason: `Horário ${nextSlotTime} já agendado` };
        }

        // Verificar se está no passado (apenas para hoje)
        if (dateIsToday && isSlotInThePast(nextSlotTime)) {
          return { enabled: false, reason: `Horário ${nextSlotTime} já passou` };
        }
      }
    }

    return { enabled: true };
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">Selecione o horário desejado</p>
          <p className="text-blue-600">
            {requiredSlots > 1
              ? `Este serviço requer ${requiredSlots} horários consecutivos (${requiredSlots * SLOT_INTERVAL_MINUTES} minutos)`
              : 'Clique no horário disponível para agendar sua consulta'}
          </p>
        </div>
      </div>

      {/* Time Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {availableTimeSlots.map((slot, index) => {  // ✅ ADICIONADO INDEX AQUI
          const availability = isSlotFullyAvailable(slot);
          const isSelected = selectedTime === slot.time;

          console.log(`⏰ Slot ${slot.time}:`, {
            available: slot.available,
            enabled: availability.enabled,
            reason: availability.reason,
            isSelected,
            requiredSlots
          });

          return (
            <Button
              onClick={() => {
                console.log('🖱️ Clique no slot:', slot.time, 'enabled:', availability.enabled);
                if (availability.enabled) {
                  console.log('✅ Selecionando horário:', slot.time);
                  onSelectTime(slot.time)
                } else {
                  console.log('❌ Slot desabilitado:', availability.reason);
                }
              }}
              type="button"
              variant="outline"
              key={`slot-${index}-${slot.time}`}  // ✅ AGORA O INDEX ESTÁ DISPONÍVEL
              className={cn(
                "h-14 select-none font-medium transition-all relative group",
                isSelected && "border-2 border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md scale-105",
                !availability.enabled && "opacity-40 cursor-not-allowed bg-gray-50",
                availability.enabled && !isSelected && "hover:border-emerald-300 hover:bg-emerald-50/50 hover:scale-105 cursor-pointer"
              )}
              disabled={!availability.enabled}>
              <span className={cn(
                "text-base",
                isSelected && "font-bold"
              )}>
                {slot.time}
              </span>
              
              {/* Tooltip for disabled slots */}
              {!availability.enabled && availability.reason && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {availability.reason}
                </span>
              )}

              {/* Visual indicator for blocked consecutive slots */}
              {requiredSlots > 1 && availability.enabled && (
                <span className="absolute -bottom-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
              )}
            </Button>
          )
        })}
      </div>

      {/* Selected Time Display with Duration Info */}
      {selectedTime && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-lg">
          <p className="text-sm text-emerald-700 font-medium">
            ✓ Horário selecionado: <span className="text-lg font-bold">{selectedTime}</span>
          </p>
          {requiredSlots > 1 && (
            <p className="text-xs text-emerald-600 mt-1">
              Duração do atendimento: {requiredSlots * SLOT_INTERVAL_MINUTES} minutos ({selectedTime} até {addMinutesToTime(selectedTime, requiredSlots * SLOT_INTERVAL_MINUTES)})
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-4 border-t text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-emerald-500 bg-emerald-50 rounded"></div>
          <span className="text-gray-600">Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-gray-300 bg-white rounded relative">
            {requiredSlots > 1 && (
              <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            )}
          </div>
          <span className="text-gray-600">Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-gray-200 bg-gray-100 rounded opacity-40"></div>
          <span className="text-gray-600">Indisponível</span>
        </div>
        {dateIsToday && (
          <div className="flex items-center gap-2 text-orange-600">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Horários passados são desabilitados automaticamente</span>
          </div>
        )}
      </div>
    </div>
  )
}