export interface PasswordAnalysis {
  password: string
  length: number
  entropyBits: number
  poolSize: number
  strengthScore: number // 0 to 100
  rating: 'CRITICAL' | 'WEAK' | 'MODERATE' | 'STRONG' | 'UNBREAKABLE'
  toneColor: string
  characterBreakdown: {
    lowercase: number
    uppercase: number
    numbers: number
    symbols: number
    space: number
  }
  crackTimes: {
    onlineThrottled: string
    onlineFast: string
    offlineGpu: string
    supercomputer: string
  }
  patternsDetected: string[]
  checks: {
    min12: boolean
    casing: boolean
    hasNumber: boolean
    hasSymbol: boolean
    noCommonPattern: boolean
    highEntropy: boolean
  }
  hashSimulations: {
    md5: string
    sha256: string
  }
}

export function generateStrongPassword(length = 16): string {
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  const all = lower + upper + numbers + symbols

  let pwd = ''
  // Ensure at least one of each set
  pwd += lower[Math.floor(Math.random() * lower.length)]
  pwd += upper[Math.floor(Math.random() * upper.length)]
  pwd += numbers[Math.floor(Math.random() * numbers.length)]
  pwd += symbols[Math.floor(Math.random() * symbols.length)]

  for (let i = 4; i < length; i++) {
    pwd += all[Math.floor(Math.random() * all.length)]
  }

  // Shuffle characters using Fisher-Yates
  const arr = pwd.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

// Simple hash simulator for demonstration in UI
function simpleHash(str: string, seed: number): string {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0')
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0')
  return hex1 + hex2
}

export function formatTime(seconds: number): string {
  if (seconds < 0.001) return 'Instant (< 1 ms)'
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`
  if (seconds < 60) return `${Math.round(seconds)} seconds`
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`
  if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`
  if (seconds < 31536000 * 1000000) return `${(seconds / 31536000 / 1000).toFixed(1)}k years`
  if (seconds < 31536000 * 1000000000) return `${(seconds / 31536000 / 1000000).toFixed(1)}M years`
  return 'Centuries (Uncrackable)'
}

const COMMON_PATTERNS = [
  'password', '123456', '12345678', '123456789', 'qwerty', 'admin',
  'welcome', 'letmein', 'monkey', 'iloveyou', 'sunshine', 'princess',
  'dragon', 'trustno1', 'p@ssword', 'admin123', 'pass123', 'abc123'
]

export function analyzePassword(password: string): PasswordAnalysis {
  if (!password) {
    return {
      password: '',
      length: 0,
      entropyBits: 0,
      poolSize: 0,
      strengthScore: 0,
      rating: 'CRITICAL',
      toneColor: '#ff0055',
      characterBreakdown: { lowercase: 0, uppercase: 0, numbers: 0, symbols: 0, space: 0 },
      crackTimes: {
        onlineThrottled: 'Instant',
        onlineFast: 'Instant',
        offlineGpu: 'Instant',
        supercomputer: 'Instant'
      },
      patternsDetected: [],
      checks: {
        min12: false,
        casing: false,
        hasNumber: false,
        hasSymbol: false,
        noCommonPattern: true,
        highEntropy: false
      },
      hashSimulations: {
        md5: 'e3b0c44298fc1c149afbf4c8996fb924',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      }
    }
  }

  const length = password.length
  let poolSize = 0

  const lowercase = (password.match(/[a-z]/g) || []).length
  const uppercase = (password.match(/[A-Z]/g) || []).length
  const numbers = (password.match(/[0-9]/g) || []).length
  const symbols = (password.match(/[^A-Za-z0-9\s]/g) || []).length
  const space = (password.match(/\s/g) || []).length

  if (lowercase > 0) poolSize += 26
  if (uppercase > 0) poolSize += 26
  if (numbers > 0) poolSize += 10
  if (symbols > 0) poolSize += 33
  if (space > 0) poolSize += 1

  // Shannon Entropy in Bits
  const entropyBits = Math.round(length * Math.log2(Math.max(poolSize, 1)))

  // Check common patterns
  const patternsDetected: string[] = []
  const lowerPass = password.toLowerCase()
  COMMON_PATTERNS.forEach(pat => {
    if (lowerPass.includes(pat)) {
      patternsDetected.push(`Contains dictionary word: "${pat}"`)
    }
  })

  if (/^[a-zA-Z]+$/.test(password)) {
    patternsDetected.push('Only letters used')
  }
  if (/^\d+$/.test(password)) {
    patternsDetected.push('Only numbers used (Numeric pin)')
  }
  if (/(.)\1{2,}/.test(password)) {
    patternsDetected.push('Repeated character sequence detected')
  }

  // Calculate combinations: P^L
  const totalCombinations = Math.pow(poolSize, length)

  // Crack times (Average attempts required = Total combinations / 2)
  const avgAttempts = totalCombinations / 2
  const onlineThrottled = formatTime(avgAttempts / 10) // 10 guesses / sec
  const onlineFast = formatTime(avgAttempts / 1000) // 1,000 guesses / sec
  const offlineGpu = formatTime(avgAttempts / 100000000000) // 100 GH/s
  const supercomputer = formatTime(avgAttempts / 10000000000000) // 10 TH/s

  // Checks
  const checks = {
    min12: length >= 12,
    casing: lowercase > 0 && uppercase > 0,
    hasNumber: numbers > 0,
    hasSymbol: symbols > 0,
    noCommonPattern: patternsDetected.length === 0,
    highEntropy: entropyBits >= 60
  }

  const passedChecksCount = Object.values(checks).filter(Boolean).length

  // Strength score 0 - 100
  let strengthScore = Math.min(100, Math.round((entropyBits / 80) * 70 + (passedChecksCount / 6) * 30))
  if (patternsDetected.length > 0) {
    strengthScore = Math.max(10, strengthScore - patternsDetected.length * 20)
  }

  let rating: PasswordAnalysis['rating'] = 'CRITICAL'
  let toneColor = '#ff0055'

  if (strengthScore >= 85) {
    rating = 'UNBREAKABLE'
    toneColor = '#00ff66'
  } else if (strengthScore >= 65) {
    rating = 'STRONG'
    toneColor = '#00f3ff'
  } else if (strengthScore >= 40) {
    rating = 'MODERATE'
    toneColor = '#ffb700'
  } else if (strengthScore >= 20) {
    rating = 'WEAK'
    toneColor = '#ff6600'
  }

  const md5Hash = simpleHash(password, 1) + simpleHash(password, 2) + simpleHash(password, 3) + simpleHash(password, 4)
  const sha256Hash = simpleHash(password, 5) + simpleHash(password, 6) + simpleHash(password, 7) + simpleHash(password, 8) + simpleHash(password, 9) + simpleHash(password, 10) + simpleHash(password, 11) + simpleHash(password, 12)

  return {
    password,
    length,
    entropyBits,
    poolSize,
    strengthScore,
    rating,
    toneColor,
    characterBreakdown: { lowercase, uppercase, numbers, symbols, space },
    crackTimes: { onlineThrottled, onlineFast, offlineGpu, supercomputer },
    patternsDetected,
    checks,
    hashSimulations: { md5: md5Hash, sha256: sha256Hash }
  }
}
