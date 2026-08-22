import { NextRequest, NextResponse } from 'next/server'

const ZYLA_ENDPOINT = 'https://zylalabs.com/api/2254/password+strength+checker+api/2114/password+analysis'

export interface ZylaApiResponse {
  result?: string
  error?: string
  message?: string
  [key: string]: unknown
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const password = searchParams.get('password')
  const clientApiKey = request.headers.get('x-zyla-api-key') || searchParams.get('apiKey')
  const apiKey = clientApiKey || process.env.ZYLA_API_KEY

  if (!password) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required query parameter: password',
        endpoint: ZYLA_ENDPOINT,
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    )
  }

  return executeZylaAnalysis(password, apiKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const password = body.password
    const clientApiKey = request.headers.get('x-zyla-api-key') || body.apiKey
    const apiKey = clientApiKey || process.env.ZYLA_API_KEY

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: password in JSON body',
          endpoint: ZYLA_ENDPOINT,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    return executeZylaAnalysis(password, apiKey)
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid JSON request body',
        endpoint: ZYLA_ENDPOINT,
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    )
  }
}

async function executeZylaAnalysis(password: string, apiKey?: string | null) {
  const startTime = Date.now()
  const targetUrl = `${ZYLA_ENDPOINT}?password=${encodeURIComponent(password)}`

  // If no API key is provided, return a structured sandbox/mock response with instructions
  if (!apiKey || apiKey.trim() === '') {
    const simulatedResult = simulatePasswordStrength(password)
    const latency = Date.now() - startTime

    return NextResponse.json({
      success: true,
      mode: 'sandbox_simulation',
      note: 'No Zyla Labs API key configured in ZYLA_API_KEY or request headers. Returning simulated evaluation based on Zyla criteria.',
      endpoint: ZYLA_ENDPOINT,
      method: 'GET',
      requestUrl: targetUrl,
      data: {
        result: simulatedResult
      },
      latencyMs: latency,
      timestamp: new Date().toISOString(),
      configured: false
    })
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Accept': 'application/json'
      },
      // Avoid server caching for live password evaluations
      cache: 'no-store'
    })

    const latency = Date.now() - startTime
    const statusCode = response.status

    if (!response.ok) {
      let errorBody: unknown
      try {
        errorBody = await response.json()
      } catch {
        errorBody = await response.text()
      }

      return NextResponse.json(
        {
          success: false,
          endpoint: ZYLA_ENDPOINT,
          method: 'GET',
          status: statusCode,
          error: `Zyla API returned HTTP ${statusCode}`,
          details: errorBody,
          latencyMs: latency,
          timestamp: new Date().toISOString(),
          configured: true
        },
        { status: statusCode }
      )
    }

    const data: ZylaApiResponse = await response.json()

    return NextResponse.json({
      success: true,
      mode: 'live_api',
      endpoint: ZYLA_ENDPOINT,
      method: 'GET',
      status: 200,
      data,
      latencyMs: latency,
      timestamp: new Date().toISOString(),
      configured: true
    })
  } catch (err: unknown) {
    const latency = Date.now() - startTime
    const errorMessage = err instanceof Error ? err.message : 'Unknown network error'

    return NextResponse.json(
      {
        success: false,
        endpoint: ZYLA_ENDPOINT,
        method: 'GET',
        error: `Failed to connect to Zyla Labs API: ${errorMessage}`,
        latencyMs: latency,
        timestamp: new Date().toISOString(),
        configured: true
      },
      { status: 502 }
    )
  }
}

/**
 * Fallback heuristic simulator mirroring Zyla Labs classification
 * when running without an active Zyla API subscription key.
 */
function simulatePasswordStrength(pwd: string): string {
  if (pwd.length < 8) return 'weak password'
  
  const hasLower = /[a-z]/.test(pwd)
  const hasUpper = /[A-Z]/.test(pwd)
  const hasDigit = /[0-9]/.test(pwd)
  const hasSymbol = /[^a-zA-Z0-9]/.test(pwd)
  
  const typesCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length

  if (pwd.length >= 14 && typesCount >= 3) {
    return 'very strong password'
  }
  if (pwd.length >= 10 && typesCount >= 3) {
    return 'strong password'
  }
  if (pwd.length >= 8 && typesCount >= 2) {
    return 'moderate password'
  }
  return 'weak password'
}
