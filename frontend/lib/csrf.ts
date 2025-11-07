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
 * Tenta diferentes variações do nome do cookie
 */
export function getXsrfToken(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  
  // Tentar XSRF-TOKEN (padrão do Laravel)
  let token = getCookie('XSRF-TOKEN');
  if (token) return token;
  
  // Tentar xsrf-token (lowercase)
  token = getCookie('xsrf-token');
  if (token) return token;
  
  // Tentar ler diretamente do cookie string (case-insensitive)
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name && name.toLowerCase() === 'xsrf-token' && value) {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  
  return undefined;
}

