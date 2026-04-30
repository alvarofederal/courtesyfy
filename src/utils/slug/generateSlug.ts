/**
 * Gera um slug URL-friendly baseado no nome do usuário
 */
export function generateSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Valida se o slug está no formato correto
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z][a-z-]*[a-z]$/;
  return slug.length >= 3 && slugRegex.test(slug);
}

/**
 * Verifica se o slug é baseado no nome do usuário
 */
export function isSlugBasedOnName(slug: string, name: string): boolean {
  const normalizedName = generateSlug(name);
  const slugChars = slug.replace(/-/g, '').split('');
  const nameChars = normalizedName.replace(/-/g, '').split('');
  
  const matchingChars = slugChars.filter(char => nameChars.includes(char)).length;
  const matchPercentage = matchingChars / slugChars.length;
  
  return matchPercentage >= 0.6; // 60% de similaridade
}