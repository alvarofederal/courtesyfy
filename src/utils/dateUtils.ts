/**
 * Converte uma data para string no formato YYYY-MM-DD em UTC
 * Garante que sempre salve como 00:00:00 UTC
 */
export function toUTCDateString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Cria um Date em UTC 00:00:00 a partir de uma string YYYY-MM-DD
 */
export function fromUTCDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Normaliza um Date para UTC 00:00:00 ignorando timezone
 */
export function normalizeToUTC(date: Date): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}