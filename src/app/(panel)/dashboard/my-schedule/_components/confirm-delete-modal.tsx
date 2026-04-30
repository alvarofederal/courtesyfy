"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  appointmentsCount: number;
}

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  onConfirm,
  appointmentsCount,
}: ConfirmDeleteModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Atenção! Agendamentos Ativos
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="text-base">
              Esta data possui <strong className="text-red-600">{appointmentsCount} agendamento(s)</strong> de pacientes confirmados.
            </p>
            <p className="text-sm text-gray-600">
              Ao confirmar, você irá:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Cancelar todos os agendamentos dos pacientes</li>
              <li>Remover os horários disponíveis</li>
              <li>Os pacientes serão notificados por email</li>
            </ul>
            <p className="text-sm font-semibold text-red-600 mt-4">
              Esta ação não pode ser desfeita!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Não, Manter Agenda</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Sim, Cancelar Tudo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}