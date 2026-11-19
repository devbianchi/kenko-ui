const DEFAULT_API_URL = 'http://localhost:8080/api'

/** Normaliza a URL base: valor vazio usa o padrão de desenvolvimento, e a barra final é removida. */
export function resolveApiUrl(value: string | undefined): string {
  const url = value?.trim() || DEFAULT_API_URL
  return url.replace(/\/+$/, '')
}

/** URL base da API, lida de VITE_API_URL (ver .env.example). */
export const API_URL = resolveApiUrl(import.meta.env.VITE_API_URL)
