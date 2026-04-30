// src/lib/validate-addresses.ts (ADICIONAR ao arquivo existente)

import prisma from './prisma';

/**
 * Remove duplicatas de um array de endereços
 */
export function removeDuplicateAddresses(addresses: string[]): string[] {
  const seen = new Set<string>();
  return addresses.filter(addr => {
    const trimmed = addr.trim();
    if (!trimmed || seen.has(trimmed)) {
      return false;
    }
    seen.add(trimmed);
    return true;
  });
}

/**
 * Valida se endereço já existe para o usuário
 * @param userId ID do usuário
 * @param newAddress Novo endereço a ser adicionado
 * @returns true se já existe, false se é novo
 */
export async function addressAlreadyExists(
  userId: string,
  newAddress: string
): Promise<boolean> {
  const trimmed = newAddress.trim();
  
  const existing = await prisma.userAddress.findFirst({
    where: {
      userId,
      address: trimmed,
    },
  });

  return existing !== null;
}

/**
 * Verifica se endereço tem agendamentos associados
 * @param userId ID do usuário
 * @param address Endereço a ser verificado
 * @returns Objeto com informações sobre agendamentos
 */
export async function addressHasAppointments(
  userId: string,
  address: string
): Promise<{
  hasAppointments: boolean;
  availableSlotsCount: number;
  appointmentsCount: number;
  canDelete: boolean;
  message?: string;
}> {
  const trimmed = address.trim();

  // Verificar AvailableSlots (agenda disponível do profissional)
  const availableSlotsCount = await prisma.availableSlot.count({
    where: {
      userId,
      address: trimmed,
    },
  });

  // Verificar Appointments (agendamentos marcados por pacientes)
  const appointmentsCount = await prisma.appointment.count({
    where: {
      userId,
      address: trimmed,
    },
  });

  const hasAppointments = availableSlotsCount > 0 || appointmentsCount > 0;

  let message = '';
  if (hasAppointments) {
    const parts = [];
    if (availableSlotsCount > 0) {
      parts.push(`${availableSlotsCount} agenda(s) aberta(s)`);
    }
    if (appointmentsCount > 0) {
      parts.push(`${appointmentsCount} agendamento(s) marcado(s)`);
    }
    message = `Este endereço possui ${parts.join(' e ')}. Não é possível removê-lo.`;
  }

  return {
    hasAppointments,
    availableSlotsCount,
    appointmentsCount,
    canDelete: !hasAppointments,
    message,
  };
}

/**
 * Valida se lista de endereços tem duplicatas internas
 * @param addresses Array de endereços
 * @returns true se tiver duplicatas, false caso contrário
 */
export function hasDuplicatesInList(addresses: string[]): boolean {
  const trimmed = addresses.map(a => a.trim()).filter(a => a);
  return new Set(trimmed).size !== trimmed.length;
}

/**
 * Valida lista de endereços antes de salvar
 * @param userId ID do usuário
 * @param newAddresses Array de novos endereços
 * @returns Objeto com validação e mensagens de erro
 */
export async function validateAddressList(
  userId: string,
  newAddresses: string[]
): Promise<{
  valid: boolean;
  cleaned: string[];
  errors: string[];
}> {
  const errors: string[] = [];

  // 1. Remover vazios e normalizar
  const normalized = newAddresses
    .map(addr => addr.trim())
    .filter(addr => addr.length > 0);

  // 2. Verificar duplicatas na lista
  if (hasDuplicatesInList(normalized)) {
    errors.push('A lista contém endereços duplicados');
  }

  // 3. Remover duplicatas
  const cleaned = removeDuplicateAddresses(normalized);

  // 4. Verificar se algum já existe no banco
  const existingChecks = await Promise.all(
    cleaned.map(addr => addressAlreadyExists(userId, addr))
  );

  const duplicatesInDb = cleaned.filter((addr, index) => existingChecks[index]);
  
  if (duplicatesInDb.length > 0) {
    errors.push(
      `Os seguintes endereços já estão cadastrados: ${duplicatesInDb.join(', ')}`
    );
  }

  return {
    valid: errors.length === 0,
    cleaned,
    errors,
  };
}