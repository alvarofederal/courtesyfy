/**
 * Verificar se determinando slot já passou
 */

export function isToday(date: Date){
    const now = new Date();

    return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
    )
}

export function isSlotInThePast(slotTime: string){
    //10:00
    const [slotHour, slotMinute] = slotTime.split(":").map(Number)

    const now = new Date()
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (slotHour< currentHour) {
        return true; //true quer dizer qye a hora já passou
    } else if (slotHour === currentHour && slotMinute <= currentMinute) {
        return true;
    }
    return false;
}

/**
 * Verificar se, a partir de um slot inicial, existe uma sequência de 'requiredSlots' disponíveis
 * EX.: Se um serviço tem 2 required slots e começa no time 15:00,
 * precisa garantir que 15:00 e 15:30 não estejam no nosso blockedSlots
 */
export function isSlotSequenceAvailable(
    startSlot: string, //> Primeiro horário disponível
    requiredSlots: number, //> Quantidade de slots necessários
    allSlots: string[], //> Todos horários do profissional
    blockedSlots: string[] //> Horários bloqueados
){
    const startIndex = allSlots.indexOf(startSlot)
    if (startIndex === -1 || startIndex + requiredSlots > allSlots.length) {
        return false;
    }

    for (let i = startIndex; i < startIndex + requiredSlots; i++) {
        const slotTime = allSlots[i];

        if (blockedSlots.includes(slotTime)) {
            return false;
        }
    }
    return true;
}