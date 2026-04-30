import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'

const formSchema = z.object({
  name: z.string().min(1, { message: "O nome do serviço é obrigatório" }).max(100, { message: "O nome do serviço deve ter no máximo 100 caracteres" }),
  description: z.string().max(500, { message: "A descrição deve ter no máximo 500 caracteres" }).optional(),
  hours: z.string().max(1, { message: "O campo horas deve ter no máximo 1 caracteres" }),
  minutes: z.string().max(2, { message: "O campo minutos deve ter no máximo 2 caracteres" }),
})

export interface UseDialogServiceFormProps {
  initialValues?: {
    name: string;
    description?: string;
    hours: string;
    minutes: string;
  }
}

export type DialogServiceFormData = z.infer<typeof formSchema>;

export function useDialogServiceForm({ initialValues }: UseDialogServiceFormProps) {
  return useForm<DialogServiceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      name: "",
      description: "",
      hours: "",
      minutes: ""
    }
  })
}