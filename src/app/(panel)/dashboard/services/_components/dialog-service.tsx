"use client"

import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useDialogServiceForm, DialogServiceFormData } from "./dialog-service-form"
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createNewTypeService } from '../_actions/create-service'
import { updateTypeService } from "../_actions/update-service"
import { toast } from "sonner"
import { useState } from "react"
import { Briefcase, Clock, Save, Plus, Loader2, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogServiceProps {
  closeModal: () => void;
  typeServiceId?: string;
  initialValues?: {
    name: string;
    description?: string;
    hours: string;
    minutes: string;
  };
}

export function DialogService({ closeModal, initialValues, typeServiceId }: DialogServiceProps) {

  const form = useDialogServiceForm({initialValues: initialValues})
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: DialogServiceFormData) {
    setLoading(true);
    const hours = parseInt(values.hours) || 0;
    const minutes = parseInt(values.minutes) || 0;

    // Converter as horas e minutos para duração total em minutos;
    const duration = (hours * 60) + minutes;

    if (duration === 0) {
      toast.error('A duração deve ser maior que zero');
      setLoading(false);
      return;
    }

    if(typeServiceId){
      await editTypeServiceById({
        typeServiceId: typeServiceId,
        name: values.name,
        description: values.description || null,
        duration: duration
      })
      return;
    }

    const response = await createNewTypeService({
      name: values.name,
      description: values.description || null,
      duration: duration
    })

    setLoading(false);

    if(response.error) {
      toast.error(response.error);
      return;
    }

    toast.success('Tipo de atendimento cadastrado com sucesso!');
    handleCloseModal();
  }

  async function editTypeServiceById({
    typeServiceId, 
    name,
    description,
    duration}: {
      typeServiceId: string, 
      name: string,
      description: string | null,
      duration: number}) {

    const response = await updateTypeService({
      typeServiceId: typeServiceId,
      name: name,
      description: description,
      duration: duration
    })
    
    setLoading(false)

    if(response.error){
      toast.error(response.error)
      return;
    }

    toast.success('Tipo de atendimento atualizado com sucesso!')
    handleCloseModal()
  }

  function handleCloseModal() {
    form.reset();
    closeModal();
  }

  return (
    <div className="space-y-6">
      {/* Header Estilizado */}
      <DialogHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br from-emerald-100 to-teal-100"
          )}>
            <Briefcase className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {typeServiceId ? "Editar Tipo de Atendimento" : "Novo Tipo de Atendimento"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {typeServiceId 
                ? "Atualize as informações do tipo de atendimento" 
                : "Preencha os dados para criar um novo tipo"}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Formulário */}
      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(onSubmit)}>

          {/* Nome do Tipo de Atendimento */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  Nome do Tipo de Atendimento
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ex: Consulta, Retorno, Avaliação..."
                    className="h-11 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />

          {/* Descrição (NOVO!) */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Descrição (Opcional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Descreva o tipo de atendimento para facilitar a identificação..."
                    className="min-h-[80px] resize-none border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Uma breve descrição ajuda a identificar do que se trata este tipo de atendimento
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} 
          />

          {/* Duração */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <label className="text-sm font-semibold text-gray-700">
                Duração do Atendimento
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Horas */}
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-gray-600">
                      Horas
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="0"
                          min="0"
                          max="9"
                          type="number"
                          className="h-12 text-lg font-semibold text-center border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                          h
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />

              {/* Minutos */}
              <FormField
                control={form.control}
                name="minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-gray-600">
                      Minutos
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="0"
                          min="0"
                          max="59"
                          type="number"
                          className="h-12 text-lg font-semibold text-center border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                          min
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
            </div>

            {/* Dica de duração */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-xs text-emerald-700">
                💡 <strong>Dica:</strong> Defina a duração média do atendimento. 
                Exemplos: Consulta rápida (30min), Consulta completa (1h), Avaliação (1h 30min)
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={loading}
              className="flex-1 h-11 border-2 border-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className={cn(
                "flex-1 h-11 font-semibold",
                "bg-gradient-to-r from-emerald-500 to-teal-600",
                "hover:from-emerald-600 hover:to-teal-700",
                "shadow-md hover:shadow-lg transition-all"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  {typeServiceId ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Atualizar Tipo
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Tipo
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}