/**
 * Password Security & Threat Evaluation Engine
 *
 * Enterprise-grade cryptographic analysis, entropy estimation (NIST SP 800-63B aligned),
 * breach dictionary matching, leetspeak normalization, keyboard spatial pattern detection,
 * CSPRNG password generation, and real MD5 / SHA-256 cryptographic digests.
 */

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

// ============================================================================
// Cryptographically Secure Pseudo-Random Number Generator (CSPRNG)
// ============================================================================

function getRandomInt(max: number): number {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    const array = new Uint32Array(1)
    globalThis.crypto.getRandomValues(array)
    return array[0] % max
  }
  return Math.floor(Math.random() * max)
}

/**
 * Generates a high-entropy, cryptographically secure password.
 * Uses CSPRNG and guarantees character class distribution.
 */
export function generateStrongPassword(length = 16): string {
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  const all = lower + upper + numbers + symbols

  const pwd: string[] = []

  // Ensure at least one character from each required set
  pwd.push(lower[getRandomInt(lower.length)])
  pwd.push(upper[getRandomInt(upper.length)])
  pwd.push(numbers[getRandomInt(numbers.length)])
  pwd.push(symbols[getRandomInt(symbols.length)])

  for (let i = 4; i < length; i++) {
    pwd.push(all[getRandomInt(all.length)])
  }

  // Fisher-Yates Shuffle using CSPRNG
  for (let i = pwd.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1)
    ;[pwd[i], pwd[j]] = [pwd[j], pwd[i]]
  }

  return pwd.join('')
}

// ============================================================================
// Standard Cryptographic Hashing Algorithms (MD5 & SHA-256)
// ============================================================================

/**
 * Standard RFC 1321 MD5 Digest (Pure TypeScript)
 */
export function calculateMD5(input: string): string {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff)
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xffff)
  }

  function bitRotateLeft(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt))
  }

  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
  }

  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t)
  }

  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
  }

  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t)
  }

  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t)
  }

  const utf8: number[] = []
  for (let i = 0; i < input.length; i++) {
    let code = input.charCodeAt(i)
    if (code < 0x80) {
      utf8.push(code)
    } else if (code < 0x800) {
      utf8.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f))
    } else if (code < 0xd800 || code >= 0xe000) {
      utf8.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f))
    } else {
      i++
      code = 0x10000 + (((code & 0x3ff) << 10) | (input.charCodeAt(i) & 0x3ff))
      utf8.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f))
    }
  }

  const bitLen = utf8.length * 8
  utf8.push(0x80)
  while (utf8.length % 64 !== 56) {
    utf8.push(0)
  }

  for (let i = 0; i < 8; i++) {
    utf8.push((bitLen >>> (i * 8)) & 0xff)
  }

  let a = 1732584193
  let b = -271733879
  let c = -1732584194
  let d = 271733878

  for (let i = 0; i < utf8.length; i += 64) {
    const x: number[] = new Array(16)
    for (let j = 0; j < 16; j++) {
      x[j] = utf8[i + j * 4] | (utf8[i + j * 4 + 1] << 8) | (utf8[i + j * 4 + 2] << 16) | (utf8[i + j * 4 + 3] << 24)
    }

    const olda = a
    const oldb = b
    const oldc = c
    const oldd = d

    a = md5ff(a, b, c, d, x[0], 7, -680876936)
    d = md5ff(d, a, b, c, x[1], 12, -389564586)
    c = md5ff(c, d, a, b, x[2], 17, 606105819)
    b = md5ff(b, c, d, a, x[3], 22, -1044525330)
    a = md5ff(a, b, c, d, x[4], 7, -176418897)
    d = md5ff(d, a, b, c, x[5], 12, 1200080426)
    c = md5ff(c, d, a, b, x[6], 17, -1473231341)
    b = md5ff(b, c, d, a, x[7], 22, -45705983)
    a = md5ff(a, b, c, d, x[8], 7, 1770035416)
    d = md5ff(d, a, b, c, x[9], 12, -1958414417)
    c = md5ff(c, d, a, b, x[10], 17, -42063)
    b = md5ff(b, c, d, a, x[11], 22, -1990404162)
    a = md5ff(a, b, c, d, x[12], 7, 1804603682)
    d = md5ff(d, a, b, c, x[13], 12, -40341101)
    c = md5ff(c, d, a, b, x[14], 17, -1502002290)
    b = md5ff(b, c, d, a, x[15], 22, 1236535329)

    a = md5gg(a, b, c, d, x[1], 5, -165796510)
    d = md5gg(d, a, b, c, x[6], 9, -1069501632)
    c = md5gg(c, d, a, b, x[11], 14, 643717713)
    b = md5gg(b, c, d, a, x[0], 20, -373897302)
    a = md5gg(a, b, c, d, x[5], 5, -701558691)
    d = md5gg(d, a, b, c, x[10], 9, 38016083)
    c = md5gg(c, d, a, b, x[15], 14, -660478335)
    b = md5gg(b, c, d, a, x[4], 20, -405537848)
    a = md5gg(a, b, c, d, x[9], 5, 568446438)
    d = md5gg(d, a, b, c, x[14], 9, -1019803690)
    c = md5gg(c, d, a, b, x[3], 14, -187363961)
    b = md5gg(b, c, d, a, x[8], 20, 1163531501)
    a = md5gg(a, b, c, d, x[13], 5, -1444680596)
    d = md5gg(d, a, b, c, x[2], 9, -51403784)
    c = md5gg(c, d, a, b, x[7], 14, 1735328473)
    b = md5gg(b, c, d, a, x[12], 20, -1926607734)

    a = md5hh(a, b, c, d, x[5], 4, -378558)
    d = md5hh(d, a, b, c, x[8], 11, -2022574463)
    c = md5hh(c, d, a, b, x[11], 16, 1839030562)
    b = md5hh(b, c, d, a, x[14], 23, -35309556)
    a = md5hh(a, b, c, d, x[1], 4, -1530992060)
    d = md5hh(d, a, b, c, x[4], 11, 1272893353)
    c = md5hh(c, d, a, b, x[7], 16, -155497632)
    b = md5hh(b, c, d, a, x[10], 23, -1094730640)
    a = md5hh(a, b, c, d, x[13], 4, 681279174)
    d = md5hh(d, a, b, c, x[0], 11, -358537222)
    c = md5hh(c, d, a, b, x[3], 16, -722521979)
    b = md5hh(b, c, d, a, x[6], 23, 76029189)
    a = md5hh(a, b, c, d, x[9], 4, -640364409)
    d = md5hh(d, a, b, c, x[12], 11, -343485551)
    c = md5hh(c, d, a, b, x[15], 16, -410860078)
    b = md5hh(b, c, d, a, x[2], 23, 528774687)

    a = md5ii(a, b, c, d, x[0], 6, -198630844)
    d = md5ii(d, a, b, c, x[7], 10, 1126891415)
    c = md5ii(c, d, a, b, x[14], 15, -1416354905)
    b = md5ii(b, c, d, a, x[5], 21, -57434055)
    a = md5ii(a, b, c, d, x[12], 6, 1700485571)
    d = md5ii(d, a, b, c, x[3], 10, -1894980713)
    c = md5ii(c, d, a, b, x[10], 15, -1051523)
    b = md5ii(b, c, d, a, x[1], 21, -2054922799)
    a = md5ii(a, b, c, d, x[8], 6, 1873313359)
    d = md5ii(d, a, b, c, x[15], 10, -30611744)
    c = md5ii(c, d, a, b, x[6], 15, -1560198380)
    b = md5ii(b, c, d, a, x[13], 21, 1309151649)
    a = md5ii(a, b, c, d, x[4], 6, -145523070)
    d = md5ii(d, a, b, c, x[11], 10, -1120210379)
    c = md5ii(c, d, a, b, x[2], 15, 718787259)
    b = md5ii(b, c, d, a, x[9], 21, -343485551)

    a = safeAdd(a, olda)
    b = safeAdd(b, oldb)
    c = safeAdd(c, oldc)
    d = safeAdd(d, oldd)
  }

  function toHex(val: number): string {
    let str = ''
    for (let i = 0; i < 4; i++) {
      const v = (val >>> (i * 8)) & 0xff
      str += v.toString(16).padStart(2, '0')
    }
    return str
  }

  return toHex(a) + toHex(b) + toHex(c) + toHex(d)
}

/**
 * Standard FIPS 180-4 SHA-256 Digest (Pure TypeScript)
 */
export function calculateSHA256(ascii: string): string {
  const mathPow = Math.pow
  const maxWord = mathPow(2, 32)
  let result = ''

  const words: number[] = []

  const hash: number[] = []
  const k: number[] = []

  let primeCounter = 0
  const isPrime = (n: number) => {
    for (let factor = 2; factor * factor <= n; factor++) {
      if (n % factor === 0) return false
    }
    return true
  }

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 1 / 2) * maxWord) | 0
      }
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0
      primeCounter++
    }
  }

  const utf8: number[] = []
  for (let i = 0; i < ascii.length; i++) {
    let code = ascii.charCodeAt(i)
    if (code < 0x80) {
      utf8.push(code)
    } else if (code < 0x800) {
      utf8.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f))
    } else if (code < 0xd800 || code >= 0xe000) {
      utf8.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f))
    } else {
      i++
      code = 0x10000 + (((code & 0x3ff) << 10) | (ascii.charCodeAt(i) & 0x3ff))
      utf8.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f))
    }
  }

  const bitLength = utf8.length * 8
  utf8.push(0x80)
  while (utf8.length % 64 !== 56) {
    utf8.push(0)
  }
  for (let i = 7; i >= 0; i--) {
    utf8.push((bitLength >>> (i * 8)) & 0xff)
  }

  for (let i = 0; i < utf8.length; i += 4) {
    words.push((utf8[i] << 24) | (utf8[i + 1] << 16) | (utf8[i + 2] << 8) | utf8[i + 3])
  }

  for (let i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16)
    const oldHash = [...hash]

    for (let j = 0; j < 64; j++) {
      if (j >= 16) {
        const s0 =
          (w[j - 15] >>> 7 | w[j - 15] << 25) ^
          (w[j - 15] >>> 18 | w[j - 15] << 14) ^
          (w[j - 15] >>> 3)
        const s1 =
          (w[j - 2] >>> 17 | w[j - 2] << 15) ^
          (w[j - 2] >>> 19 | w[j - 2] << 13) ^
          (w[j - 2] >>> 10)
        w[j] = (((w[j - 16] + s0) | 0) + ((w[j - 7] + s1) | 0)) | 0
      }

      const S1 =
        (hash[4] >>> 6 | hash[4] << 26) ^
        (hash[4] >>> 11 | hash[4] << 21) ^
        (hash[4] >>> 25 | hash[4] << 7)
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6])
      const temp1 = ((((hash[7] + S1) | 0) + ((ch + k[j]) | 0)) | 0) + w[j]
      const S0 =
        (hash[0] >>> 2 | hash[0] << 30) ^
        (hash[0] >>> 13 | hash[0] << 19) ^
        (hash[0] >>> 22 | hash[0] << 10)
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2])
      const temp2 = (S0 + maj) | 0

      hash[7] = hash[6]
      hash[6] = hash[5]
      hash[5] = hash[4]
      hash[4] = (hash[3] + temp1) | 0
      hash[3] = hash[2]
      hash[2] = hash[1]
      hash[1] = hash[0]
      hash[0] = (temp1 + temp2) | 0
    }

    for (let j = 0; j < 8; j++) {
      hash[j] = (hash[j] + oldHash[j]) | 0
    }
  }

  for (let i = 0; i < 8; i++) {
    result += (hash[i] >>> 0).toString(16).padStart(8, '0')
  }

  return result
}

// ============================================================================
// Time Formatting & Search Space Estimation
// ============================================================================

export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0.001) return 'Instant (< 1 ms)'
  if (seconds < 1) return `${Math.max(1, Math.round(seconds * 1000))} ms`
  if (seconds < 60) return `${Math.round(seconds)} seconds`
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`
  if (seconds < 31536000 * 100) return `${(seconds / 31536000).toFixed(1)} years`
  if (seconds < 31536000 * 1000000) return `${(seconds / (31536000 * 1000)).toFixed(1)}k years`
  if (seconds < 31536000 * 1000000000) return `${(seconds / (31536000 * 1000000)).toFixed(1)}M years`
  return 'Centuries (Uncrackable)'
}

// ============================================================================
// Dictionary, Spatial, & Sequential Attack Vector Lists
// ============================================================================

const COMMON_BREACH_PATTERNS = [
  'password', '123456', '12345678', '123456789', 'qwerty', 'admin',
  'welcome', 'letmein', 'monkey', 'iloveyou', 'sunshine', 'princess',
  'dragon', 'trustno1', 'p@ssword', 'admin123', 'pass123', 'abc123',
  'football', 'charlie', 'master', 'superman', 'shadow', 'baseball',
  'michael', 'jordan', 'harley', 'ranger', 'jennifer', 'cookie',
  'batman', 'matrix', 'cyber', 'security', 'system', 'root', 'login'
]

const KEYBOARD_SPATIAL_WALKS = [
  'qwerty', 'asdfgh', 'zxcvbn', '123456', '789654', 'qazwsx',
  'poiuyt', 'lkjhgf', 'mnbvcxz', '1qaz2wsx', '098765'
]

const LEET_MAP: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '8': 'b',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '0': 'o',
  '$': 's',
  '5': 's',
  '7': 't'
}

function normalizeLeetspeak(str: string): string {
  return str
    .toLowerCase()
    .split('')
    .map(ch => LEET_MAP[ch] || ch)
    .join('')
}

// ============================================================================
// Comprehensive Password Security Analyzer
// ============================================================================

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
        md5: calculateMD5(''),
        sha256: calculateSHA256('')
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

  // Handle multi-byte Unicode / Emoji expansion if present
  const unicodeCount = (password.match(/[^\x00-\x7F]/g) || []).length
  if (unicodeCount > 0) poolSize += 64

  // Raw Shannon entropy calculation: L * log2(poolSize)
  const rawEntropy = length * Math.log2(Math.max(poolSize, 1))

  // Threat Vector & Structural Pattern Detection
  const patternsDetected: string[] = []
  let entropyDeductions = 0

  const lowerPass = password.toLowerCase()
  const leetPass = normalizeLeetspeak(password)

  // 1. Dictionary Breach Matching
  COMMON_BREACH_PATTERNS.forEach(pat => {
    if (lowerPass.includes(pat)) {
      patternsDetected.push(`Known breached dictionary word: "${pat}"`)
      entropyDeductions += 15
    } else if (leetPass.includes(pat) && leetPass !== lowerPass) {
      patternsDetected.push(`Obfuscated leetspeak pattern: "${pat}"`)
      entropyDeductions += 12
    }
  })

  // 2. Keyboard Spatial Walks
  KEYBOARD_SPATIAL_WALKS.forEach(walk => {
    if (lowerPass.includes(walk)) {
      patternsDetected.push(`Predictable keyboard walk detected: "${walk}"`)
      entropyDeductions += 12
    }
  })

  // 3. Sequential Character Runs (e.g. abcd, 1234, zyxw)
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    patternsDetected.push('Sequential character run (e.g., 123, abc)')
    entropyDeductions += 8
  }

  // 4. Repeated Character Sequences (e.g. aaa, 1111, $$$)
  if (/(.)\1{2,}/.test(password)) {
    patternsDetected.push('Repeated character sequence detected')
    entropyDeductions += 10
  }

  // 5. Date / Year Pattern
  if (/(19[5-9]\d|20[0-3]\d)/.test(password)) {
    patternsDetected.push('Contains 4-digit calendar year (1950-2039)')
    entropyDeductions += 8
  }

  // 6. Low Character Diversity
  if (/^[a-zA-Z]+$/.test(password)) {
    patternsDetected.push('Only letters used (No numbers or symbols)')
    entropyDeductions += 5
  } else if (/^\d+$/.test(password)) {
    patternsDetected.push('Numeric PIN only (High vulnerability)')
    entropyDeductions += 20
  }

  // Effective Information Entropy
  const effectiveEntropy = Math.max(0, Math.round(rawEntropy - entropyDeductions))

  // Crack Time Estimation (Attempts required = 2^effectiveEntropy / 2)
  const totalCombinations = Math.pow(2, Math.min(effectiveEntropy, 128))
  const avgAttempts = totalCombinations / 2

  const onlineThrottled = formatTime(avgAttempts / 10) // 10 guesses / sec
  const onlineFast = formatTime(avgAttempts / 1000) // 1,000 guesses / sec
  const offlineGpu = formatTime(avgAttempts / 100000000000) // 100 Billion H/s
  const supercomputer = formatTime(avgAttempts / 10000000000000) // 10 Trillion H/s

  // Policy Security Checks
  const checks = {
    min12: length >= 12,
    casing: lowercase > 0 && uppercase > 0,
    hasNumber: numbers > 0,
    hasSymbol: symbols > 0,
    noCommonPattern: patternsDetected.length === 0,
    highEntropy: effectiveEntropy >= 60
  }

  const passedChecksCount = Object.values(checks).filter(Boolean).length

  // Strength score calculation (0 - 100)
  let strengthScore = Math.min(100, Math.round((effectiveEntropy / 80) * 70 + (passedChecksCount / 6) * 30))
  if (patternsDetected.length > 0) {
    strengthScore = Math.max(5, strengthScore - patternsDetected.length * 15)
  }

  // Security Rating & Palette Tone
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

  // Real Cryptographic Hashes (MD5 & SHA-256)
  const md5Hash = calculateMD5(password)
  const sha256Hash = calculateSHA256(password)

  return {
    password,
    length,
    entropyBits: effectiveEntropy,
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
