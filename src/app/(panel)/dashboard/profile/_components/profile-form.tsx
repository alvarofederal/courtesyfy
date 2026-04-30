// src/app/(panel)/dashboard/profile/_components/profile-form.tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// 🔥 Interface aceita objetos com address, phone, contact
interface UseProfileFormProps {
  name: string | null
  address: Array<{ address: string; phone?: string | null; contact?: string | null }> | null
  phone: string | null
  cpf: string | null
  professionId: string | null
  specialty: string | null
  registration: string | null
  presentation: string | null
  status: boolean
  timeZone: string | null
}

// 🔥 Schema para objeto de endereço
const addressObjectSchema = z.object({
  address: z.string(),
  phone: z.string().optional(),
  contact: z.string().optional(),
})

// 🔥 Schema aceita string OU objeto OU array de objetos
const profileSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }).max(100, { message: "O nome deve ter no máximo 100 caracteres" }),
  address: z.union([
    z.string(),                    // Compatibilidade: string simples
    addressObjectSchema,           // FREE: objeto único
    z.array(addressObjectSchema),  // PROFESSIONAL: array de objetos
  ]).optional(),
  phone: z.string().max(15, { message: "O telefone deve ter no máximo 15 caracteres" }).optional(),
  cpf: z.string().max(14, { message: "O CPF deve ter no máximo 14 caracteres" }).optional(),
  professionId: z.string().optional(),
  specialty: z.string().max(100, { message: "A especialidade deve ter no máximo 100 caracteres" }).optional(),
  registration: z.string().max(20, { message: "O registro profissional deve ter no máximo 50 caracteres" }).optional(),
  presentation: z.string().max(1000, { message: "A apresentação deve ter no máximo 1000 caracteres" }).optional(),
  status: z.string(),
  timeZone: z.string().min(1, { message: "O time zone é obrigatório" }),
})

export type ProfileFormData = z.infer<typeof profileSchema>

// 🔥 EXPORT DEFAULT da função
export function useProfileForm({ 
  name, 
  address, 
  phone, 
  cpf, 
  professionId, 
  specialty, 
  registration, 
  presentation, 
  status, 
  timeZone 
}: UseProfileFormProps) {
  
  // 🔥 Normalizar address para formato correto
  let formattedAddress: any
  
  if (Array.isArray(address) && address.length > 0) {
    // Array de objetos (formato novo do banco)
    formattedAddress = address.map(item => ({
      address: item.address || '',
      phone: item.phone || '',
      contact: item.contact || ''
    }))
  } else {
    // Fallback: objeto vazio para FREE
    formattedAddress = {
      address: '',
      phone: '',
      contact: ''
    }
  }

  return useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: name || "",
      address: formattedAddress,
      phone: phone || "",
      cpf: cpf || "",
      professionId: professionId || "",
      specialty: specialty || "",
      registration: registration || "",
      presentation: presentation || "",
      status: status ? "active" : "inactive",
      timeZone: timeZone || ""
    }
  })
}