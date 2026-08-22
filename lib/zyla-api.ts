/**
 * Zyla Labs Password Strength Checker API Client
 * Endpoint: GET https://zylalabs.com/api/2254/password+strength+checker+api/2114/password+analysis
 */

export const ZYLA_API_ENDPOINT =
  'https://zylalabs.com/api/2254/password+strength+checker+api/2114/password+analysis'

export interface ZylaAnalysisResult {
  success: boolean
  mode?: 'live_api' | 'sandbox_simulation'
  endpoint: string
  method: string
  status?: number
  requestUrl?: string
  data?: {
    result?: string
    [key: string]: unknown
  }
  error?: string
  details?: unknown
  latencyMs: number
  timestamp: string
  configured?: boolean
  note?: string
}

const STORAGE_KEY_ZYLA_API_KEY = 'passguard_zyla_api_key'

export function getStoredZylaApiKey(): string {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(STORAGE_KEY_ZYLA_API_KEY) || ''
  } catch {
    return ''
  }
}

export function saveStoredZylaApiKey(key: string): void {
  if (typeof window === 'undefined') return
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY_ZYLA_API_KEY, key.trim())
    } else {
      localStorage.removeItem(STORAGE_KEY_ZYLA_API_KEY)
    }
  } catch (e) {
    console.error('Failed to save Zyla API key to localStorage', e)
  }
}

/**
 * Executes a request to the Zyla Labs Password Strength Analysis endpoint.
 * Dispatches through the internal `/api/password-analysis` route to protect keys
 * or forwards custom user-entered client API keys.
 */
export async function analyzePasswordWithZyla(
  password: string,
  customApiKey?: string
): Promise<ZylaAnalysisResult> {
  const effectiveKey = customApiKey ?? getStoredZylaApiKey()

  try {
    const res = await fetch('/api/password-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(effectiveKey ? { 'x-zyla-api-key': effectiveKey } : {})
      },
      body: JSON.stringify({
        password,
        ...(effectiveKey ? { apiKey: effectiveKey } : {})
      })
    })

    const data: ZylaAnalysisResult = await res.json()
    return data
  } catch (err) {
    return {
      success: false,
      endpoint: ZYLA_API_ENDPOINT,
      method: 'GET',
      error: err instanceof Error ? err.message : 'Network failure contacting proxy',
      latencyMs: 0,
      timestamp: new Date().toISOString(),
      configured: Boolean(effectiveKey)
    }
  }
}
