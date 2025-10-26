/**
 * Função para obter o valor de um cookie pelo nome
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue ? decodeURIComponent(cookieValue) : undefined;
  }
  
  return undefined;
}

/**
 * Função para obter o token XSRF do cookie
 */
export function getXsrfToken(): string | undefined {
  return getCookie('XSRF-TOKEN');
}

