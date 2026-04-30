"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { TypeProfile } from "@/generated/prisma"
import { auth } from "@/lib/auth"

// Interface para dados de endereço (já existente)
interface AddressData {
  address: string;
  phone?: string;
  contact?: string;
}

interface UpdateProfileData {
  name?: string
  address?: string | AddressData | AddressData[]
  cpf?: string
  professionId?: string
  specialty?: string
  registration?: string
  presentation?: string
  status?: boolean
  phone?: string
  timeZone?: string
  times?: string[]
  termsAccepted?: boolean
  teleConsultation?: boolean
  typeProfile?: TypeProfile
  typeServiceIds?: string[]
}

export async function updateProfile(userId: string, data: UpdateProfileData) {
  try {
    console.log("📝 Atualizando perfil:", { userId, data });

    const session = await auth();
    
    if (!session?.user?.id || session.user.id !== userId) {
      return { error: "Não autorizado" };
    }

    // 🔥 VALIDAR LIMITE DE TIPOS DE ATENDIMENTO
    if (data.typeServiceIds) {
      const subscription = await prisma.subscription.findFirst({
        where: { userId }
      });

      const plan = subscription?.plan || 'FREE';
      const maxTypeServices = plan === 'PROFESSIONAL' ? 5 : 1;

      if (data.typeServiceIds.length > maxTypeServices) {
        return {
          error: `Plano ${plan} permite até ${maxTypeServices} tipo(s) de atendimento`
        };
      }

      if (data.typeServiceIds.length === 0) {
        return {
          error: "Selecione pelo menos 1 tipo de atendimento"
        };
      }
    }

    // 🔥 VALIDAR LIMITE DE ENDEREÇOS + DUPLICATAS + AGENDAMENTOS
    if (data.address) {
      const subscription = await prisma.subscription.findFirst({
        where: { userId }
      });

      let maxAddresses: number | null = 1;
      
      if (subscription?.plan === 'PROFESSIONAL') {
        maxAddresses = 10;
      }

      // Normalizar novos endereços
      let newAddresses: AddressData[] = [];
      
      if (Array.isArray(data.address)) {
        data.address.forEach((item: any) => {
          if (item && typeof item === 'object' && 'address' in item) {
            if (item.address && item.address.trim() !== '') {
              newAddresses.push({
                address: item.address.trim(),
                phone: item.phone || '',
                contact: item.contact || ''
              });
            }
          }
          else if (typeof item === 'string' && item.trim() !== '') {
            newAddresses.push({
              address: item.trim(),
              phone: '',
              contact: ''
            });
          }
        });
      } else if (typeof data.address === 'object' && data.address !== null) {
        const addrObj = data.address as AddressData;
        if (addrObj.address && addrObj.address.trim() !== '') {
          newAddresses.push({
            address: addrObj.address.trim(),
            phone: addrObj.phone || '',
            contact: addrObj.contact || ''
          });
        }
      } else if (typeof data.address === 'string') {
        if (data.address.trim() !== '') {
          newAddresses.push({
            address: data.address.trim(),
            phone: '',
            contact: ''
          });
        }
      }

      // 🔥 VALIDAÇÃO 1: Verificar limite de endereços
      if (maxAddresses !== null && newAddresses.length > maxAddresses) {
        const planName = subscription?.plan === 'PROFESSIONAL' ? 'Professional' : 'Free';
        
        console.log(`[updateProfile] BLOQUEADO - ${newAddresses.length} endereços, limite: ${maxAddresses}`);
        
        return {
          error: `Você atingiu o limite de ${maxAddresses} endereço(s) do plano ${planName}. Você está tentando salvar ${newAddresses.length} endereço(s). ${
            subscription?.plan === 'FREE' 
              ? 'Faça upgrade para Professional e cadastre até 10 endereços!' 
              : ''
          }`
        };
      }

      // 🔥 VALIDAÇÃO 2: Verificar duplicatas INTERNAS (na lista de novos)
      const addressStrings = newAddresses.map(a => a.address);
      const uniqueAddresses = new Set(addressStrings);
      
      if (addressStrings.length !== uniqueAddresses.size) {
        console.log('❌ Duplicatas detectadas na lista de novos endereços');
        return {
          error: 'A lista contém endereços duplicados. Remova as duplicatas antes de salvar.'
        };
      }

      // 🔥 Buscar endereços atuais no banco
      const currentAddresses = await prisma.userAddress.findMany({
        where: { userId },
        select: { id: true, address: true }
      });

      // 🔥 Identificar quais serão REMOVIDOS
      const newAddressSet = new Set(newAddresses.map(a => a.address));
      const toRemove = currentAddresses.filter(
        current => !newAddressSet.has(current.address)
      );

      // 🔥 VALIDAÇÃO 3: Verificar se endereços a remover têm agendamentos
      if (toRemove.length > 0) {
        console.log(`🔍 Verificando ${toRemove.length} endereço(s) que serão removidos...`);

        for (const addr of toRemove) {
          // Verificar AvailableSlots
          const availableSlotsCount = await prisma.availableSlot.count({
            where: {
              userId,
              address: addr.address
            }
          });

          // Verificar Appointments
          const appointmentsCount = await prisma.appointment.count({
            where: {
              userId,
              address: addr.address
            }
          });

          if (availableSlotsCount > 0 || appointmentsCount > 0) {
            const parts = [];
            if (availableSlotsCount > 0) {
              parts.push(`${availableSlotsCount} agenda(s) aberta(s)`);
            }
            if (appointmentsCount > 0) {
              parts.push(`${appointmentsCount} agendamento(s) marcado(s)`);
            }

            console.log(`❌ Endereço "${addr.address}" possui agendamentos:`, {
              availableSlots: availableSlotsCount,
              appointments: appointmentsCount
            });

            return {
              error: `O endereço "${addr.address}" possui ${parts.join(' e ')}. Não é possível removê-lo. Delete primeiro todas as agendas e agendamentos associados a este endereço.`
            };
          }
        }

        console.log('✅ Nenhum endereço a ser removido possui agendamentos');
      }

      console.log(`✅ Validações OK: ${newAddresses.length} endereço(s)`);
    }

    // Atualizar dados básicos do User
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        cpf: data.cpf,
        professionId: data.professionId,
        specialty: data.specialty,
        registration: data.registration,
        presentation: data.presentation,
        status: data.status,
        phone: data.phone,
        timezone: data.timeZone,
        termsAccepted: data.termsAccepted,
        teleConsultation: data.teleConsultation,
        typeProfile: data.typeProfile,
      },
    })

    // Atualizar horários
    if (data.times) {
      await prisma.userTime.deleteMany({
        where: { userId },
      })

      if (data.times.length > 0) {
        await prisma.userTime.createMany({
          data: data.times.map((time) => ({
            userId,
            time,
          })),
        })
      }

      console.log("✅ Horários atualizados:", data.times.length);
    }

    // Atualizar endereços (SÓ CHEGA AQUI SE PASSOU NAS VALIDAÇÕES)
    if (data.address) {
      // Deletar todos os endereços antigos (já validamos que não têm agendamentos)
      await prisma.userAddress.deleteMany({
        where: { userId },
      })

      let addresses: AddressData[] = [];
      
      if (Array.isArray(data.address)) {
        data.address.forEach((item: any) => {
          if (item && typeof item === 'object' && 'address' in item) {
            if (item.address && item.address.trim() !== '') {
              addresses.push({
                address: item.address.trim(),
                phone: item.phone || '',
                contact: item.contact || ''
              });
            }
          }
          else if (typeof item === 'string' && item.trim() !== '') {
            addresses.push({
              address: item.trim(),
              phone: '',
              contact: ''
            });
          }
        });
      } else if (typeof data.address === 'object' && data.address !== null) {
        const addrObj = data.address as AddressData;
        if (addrObj.address && addrObj.address.trim() !== '') {
          addresses.push({
            address: addrObj.address.trim(),
            phone: addrObj.phone || '',
            contact: addrObj.contact || ''
          });
        }
      } else if (typeof data.address === 'string') {
        if (data.address.trim() !== '') {
          addresses.push({
            address: data.address.trim(),
            phone: '',
            contact: ''
          });
        }
      }

      if (addresses.length > 0) {
        await prisma.userAddress.createMany({
          data: addresses.map((addressData) => ({
            userId,
            address: addressData.address,
            phone: addressData.phone || null,
            contact: addressData.contact || null,
          })),
        })
      }

      console.log("✅ Endereços atualizados:", addresses.length);
    }

    // Atualizar tipos de atendimento
    if (data.typeServiceIds) {
      await prisma.userTypeService.deleteMany({
        where: { userId }
      })

      await prisma.userTypeService.createMany({
        data: data.typeServiceIds.map((typeServiceId) => ({
          userId,
          typeServiceId,
          active: true
        }))
      })

      console.log("✅ Tipos de atendimento atualizados:", data.typeServiceIds.length);
    }

    revalidatePath("/dashboard/profile")
    revalidatePath("/dashboard/my-schedule")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("❌ Erro ao atualizar perfil:", error)
    return { error: "Erro ao atualizar perfil" }
  }
}