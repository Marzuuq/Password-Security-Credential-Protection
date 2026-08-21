/**
 * Password Security & Threat Evaluation Engine
 *
 * Enterprise-grade cryptographic analysis, Shannon entropy estimation (NIST SP 800-63B aligned),
 * breach dictionary matching, leetspeak normalization, keyboard spatial pattern detection,
 * CSPRNG & Diceware passphrase generation, and local MD5 / SHA-256 / SHA-1 cryptographic digests.
 */

export interface PasswordAnalysis {
  password: string
  length: number
  entropyBits: number
  rawEntropy: number
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
  patternsDetected: {
    category: 'dictionary' | 'spatial' | 'sequential' | 'repetition' | 'date' | 'diversity' | 'predictable'
    name: string
    description: string
    deduction: number
  }[]
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
    sha1: string
    kAnonymityPrefix: string
    kAnonymitySuffix: string
  }
  improvementTips: string[]
}

// ============================================================================
// Cryptographically Secure Pseudo-Random Number Generator (CSPRNG)
// ============================================================================

export function getRandomInt(max: number): number {
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
// Diceware Memorable Passphrase Generator (EFF-aligned)
// ============================================================================

export const DICEWARE_WORDLIST = [
  'anchor', 'apple', 'arcade', 'armor', 'arrow', 'atlas', 'autumn', 'avalanche',
  'badger', 'bamboo', 'beacon', 'breeze', 'bridge', 'bubble', 'bullet', 'butter',
  'cactus', 'camera', 'candle', 'canyon', 'canvas', 'carpet', 'castle', 'cedar',
  'cipher', 'cloud', 'clover', 'cobalt', 'comet', 'copper', 'coral', 'crater',
  'crypto', 'crystal', 'curtain', 'cyborg', 'dagger', 'dancer', 'dawn', 'desert',
  'diamond', 'dolphin', 'dragon', 'drift', 'eagle', 'echo', 'eclipse', 'ember',
  'emerald', 'engine', 'falcon', 'feather', 'ferret', 'flame', 'forest', 'fossil',
  'galaxy', 'galley', 'garden', 'geyser', 'glacier', 'glider', 'glow', 'granite',
  'grove', 'guitar', 'harbor', 'hawk', 'helium', 'helmet', 'horizon', 'hybrid',
  'iceberg', 'iguana', 'impact', 'island', 'ivory', 'jaguar', 'javelin', 'jungle',
  'jupiter', 'kayak', 'kepler', 'kernel', 'kinetic', 'knight', 'lagoon', 'lantern',
  'laser', 'lava', 'legacy', 'lemon', 'leopard', 'lightning', 'lizard', 'lotus',
  'lunar', 'magnet', 'magma', 'mantis', 'marble', 'matrix', 'meadow', 'meteor',
  'mirage', 'monarch', 'mosaic', 'nebula', 'neon', 'ninja', 'nitrogen', 'nomad',
  'nova', 'nucleus', 'oasis', 'obsidian', 'ocean', 'octopus', 'olympus', 'onyx',
  'orbit', 'orchid', 'oxygen', 'panther', 'pegasus', 'phantom', 'phoenix', 'photon',
  'pillar', 'planet', 'plasma', 'polar', 'portal', 'prism', 'pulse', 'pyramid',
  'quantum', 'quasar', 'radar', 'radiant', 'rainbow', 'ranger', 'raven', 'reef',
  'ripple', 'river', 'rocket', 'rogue', 'ruby', 'safari', 'sahara', 'sailor',
  'sapphire', 'saturn', 'scanner', 'scepter', 'shadow', 'shield', 'siren', 'solar',
  'spectrum', 'spider', 'spiral', 'spring', 'static', 'stellar', 'storm', 'stride',
  'summit', 'sunset', 'syntax', 'talisman', 'target', 'temple', 'thunder', 'tiger',
  'timber', 'titan', 'topaz', 'tornado', 'tower', 'tsunami', 'tunnel', 'twilight',
  'typhoon', 'unicorn', 'uranium', 'valley', 'vapor', 'vector', 'velvet', 'vessel',
  'viper', 'vortex', 'voyage', 'vulcan', 'walrus', 'warrior', 'wave', 'whisper',
  'willow', 'winter', 'wizard', 'wolf', 'zenith', 'zephyr', 'zero', 'zodiac'
]

/**
 * Generates a Diceware memorable passphrase (e.g. "correct-horse-battery-staple").
 * High entropy with extreme human memorability.
 */
export function generateDicewarePassphrase(
  wordCount = 4,
  separator = '-',
  capitalize = false,
  includeNumber = false
): string {
  const chosenWords: string[] = []

  for (let i = 0; i < wordCount; i++) {
    let word = DICEWARE_WORDLIST[getRandomInt(DICEWARE_WORDLIST.length)]
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1)
    }
    chosenWords.push(word)
  }

  let result = chosenWords.join(separator)
  if (includeNumber) {
    result += `${separator}${getRandomInt(900) + 100}`
  }

  return result
}

// ============================================================================
// Standard Cryptographic Hashing Algorithms (MD5, SHA-256, SHA-1)
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

/**
 * Standard SHA-1 Digest (Pure TypeScript for K-Anonymity breach checking simulation)
 */
export function calculateSHA1(input: string): string {
  function rol(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt))
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

  const bitLength = utf8.length * 8
  utf8.push(0x80)
  while (utf8.length % 64 !== 56) {
    utf8.push(0)
  }
  for (let i = 7; i >= 0; i--) {
    utf8.push((bitLength >>> (i * 8)) & 0xff)
  }

  const words: number[] = []
  for (let i = 0; i < utf8.length; i += 4) {
    words.push((utf8[i] << 24) | (utf8[i + 1] << 16) | (utf8[i + 2] << 8) | utf8[i + 3])
  }

  let h0 = 0x67452301
  let h1 = 0xefcdab89
  let h2 = 0x98badcfe
  let h3 = 0x10325476
  let h4 = 0xc3d2e1f0

  const w = new Array(80)

  for (let i = 0; i < words.length; i += 16) {
    for (let j = 0; j < 16; j++) {
      w[j] = words[i + j]
    }
    for (let j = 16; j < 80; j++) {
      w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1)
    }

    let a = h0
    let b = h1
    let c = h2
    let d = h3
    let e = h4

    for (let j = 0; j < 80; j++) {
      let f = 0
      let k = 0
      if (j < 20) {
        f = (b & c) | (~b & d)
        k = 0x5a827999
      } else if (j < 40) {
        f = b ^ c ^ d
        k = 0x6ed9eba1
      } else if (j < 60) {
        f = (b & c) | (b & d) | (c & d)
        k = 0x8f1bbcdc
      } else {
        f = b ^ c ^ d
        k = 0xca62c1d6
      }

      const temp = (rol(a, 5) + f + e + k + w[j]) | 0
      e = d
      d = c
      c = rol(b, 30)
      b = a
      a = temp
    }

    h0 = (h0 + a) | 0
    h1 = (h1 + b) | 0
    h2 = (h2 + c) | 0
    h3 = (h3 + d) | 0
    h4 = (h4 + e) | 0
  }

  return [h0, h1, h2, h3, h4]
    .map(x => (x >>> 0).toString(16).padStart(8, '0'))
    .join('')
    .toUpperCase()
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
  if (seconds < 31536000 * 1000) return `${(seconds / (31536000 * 1000)).toFixed(1)} thousand years`
  if (seconds < 31536000 * 1000000) return `${(seconds / (31536000 * 1000000)).toFixed(1)} million years`
  if (seconds < 31536000 * 1000000000) return `${(seconds / (31536000 * 1000000000)).toFixed(1)} billion years`
  return 'Trillions of Years (Uncrackable)'
}

// ============================================================================
// Dictionary, Spatial, & Sequential Attack Vector Lists
// ============================================================================

export const COMMON_BREACH_PATTERNS = [
  'password', '123456', '12345678', '123456789', 'qwerty', 'admin',
  'welcome', 'letmein', 'monkey', 'iloveyou', 'sunshine', 'princess',
  'dragon', 'trustno1', 'p@ssword', 'admin123', 'pass123', 'abc123',
  'football', 'charlie', 'master', 'superman', 'shadow', 'baseball',
  'michael', 'jordan', 'harley', 'ranger', 'jennifer', 'cookie',
  'batman', 'matrix', 'cyber', 'security', 'system', 'root', 'login',
  'summer', 'winter', 'spring', 'autumn', 'secret', 'hunter2', 'trust',
  'testing', 'access', 'default', 'oracle', 'cisco', 'guest', 'starwars'
]

export const KEYBOARD_SPATIAL_WALKS = [
  'qwerty', 'asdfgh', 'zxcvbn', '123456', '789654', 'qazwsx',
  'poiuyt', 'lkjhgf', 'mnbvcxz', '1qaz2wsx', '098765', 'qwer',
  'asdf', 'zxcv', '1234', '4321', '0987', 'qaz', 'wsx', 'edc'
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
  '7': 't',
  '+': 't'
}

export function normalizeLeetspeak(str: string): string {
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
    const defaultSha1 = calculateSHA1('')
    return {
      password: '',
      length: 0,
      entropyBits: 0,
      rawEntropy: 0,
      poolSize: 0,
      strengthScore: 0,
      rating: 'CRITICAL',
      toneColor: '#ff0055',
      characterBreakdown: { lowercase: 0, uppercase: 0, numbers: 0, symbols: 0, space: 0 },
      crackTimes: {
        onlineThrottled: 'Instant (< 1 ms)',
        onlineFast: 'Instant (< 1 ms)',
        offlineGpu: 'Instant (< 1 ms)',
        supercomputer: 'Instant (< 1 ms)'
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
        sha256: calculateSHA256(''),
        sha1: defaultSha1,
        kAnonymityPrefix: defaultSha1.slice(0, 5),
        kAnonymitySuffix: defaultSha1.slice(5)
      },
      improvementTips: ['Enter a password or generate a multi-word Diceware passphrase to begin.']
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
  const rawEntropy = Math.round(length * Math.log2(Math.max(poolSize, 1)))

  // Threat Vector & Structural Pattern Detection
  const patternsDetected: PasswordAnalysis['patternsDetected'] = []
  let entropyDeductions = 0

  const lowerPass = password.toLowerCase()
  const leetPass = normalizeLeetspeak(password)

  // 1. Dictionary Breach Matching
  COMMON_BREACH_PATTERNS.forEach(pat => {
    if (lowerPass.includes(pat)) {
      patternsDetected.push({
        category: 'dictionary',
        name: `Breached Word: "${pat}"`,
        description: `Found in top RockYou/HIBP breach dictionaries. Dictionary attacks crack this instantly.`,
        deduction: 18
      })
      entropyDeductions += 18
    } else if (leetPass.includes(pat) && leetPass !== lowerPass) {
      patternsDetected.push({
        category: 'dictionary',
        name: `Obfuscated Leetspeak: "${pat}"`,
        description: `Adversary rule engines (Hashcat/John) replace @->a, 0->o, 1->i in microseconds.`,
        deduction: 14
      })
      entropyDeductions += 14
    }
  })

  // 2. Keyboard Spatial Walks
  KEYBOARD_SPATIAL_WALKS.forEach(walk => {
    if (lowerPass.includes(walk)) {
      patternsDetected.push({
        category: 'spatial',
        name: `Keyboard Spatial Walk: "${walk}"`,
        description: `Adjacent key patterns (QWERTY/numpad) are tested first by modern cracking tools.`,
        deduction: 14
      })
      entropyDeductions += 14
    }
  })

  // 3. Sequential Character Runs (e.g. abcd, 1234, zyxw)
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    patternsDetected.push({
      category: 'sequential',
      name: 'Sequential Character Run',
      description: 'Sequential ascending numbers or alphabet letters drastically reduce effective entropy.',
      deduction: 10
    })
    entropyDeductions += 10
  }

  // 4. Repeated Character Sequences (e.g. aaa, 1111, $$$)
  if (/(.)\1{2,}/.test(password)) {
    patternsDetected.push({
      category: 'repetition',
      name: 'Repeated Characters',
      description: 'Consecutive identical characters add almost zero real cryptographic entropy.',
      deduction: 12
    })
    entropyDeductions += 12
  }

  // 5. Date / Year Pattern
  if (/(19[5-9]\d|20[0-3]\d)/.test(password)) {
    patternsDetected.push({
      category: 'date',
      name: 'Calendar Year Pattern',
      description: 'Contains a 4-digit calendar year (1950-2039), a high-priority target in brute-force masks.',
      deduction: 10
    })
    entropyDeductions += 10
  }

  // 6. Base Word + Capitalized First + Number + Symbol (e.g. Summer2024!)
  if (/^[A-Z][a-z]+[0-9]+[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]$/.test(password)) {
    patternsDetected.push({
      category: 'predictable',
      name: 'Predictable "Base + Year + Symbol" Pattern',
      description: 'Matches the most common corporate password format (Capital + Word + Number + Symbol).',
      deduction: 15
    })
    entropyDeductions += 15
  }

  // 7. Low Character Diversity
  if (/^[a-zA-Z]+$/.test(password) && length < 16) {
    patternsDetected.push({
      category: 'diversity',
      name: 'Letters Only (Short Length)',
      description: 'Only letters used without sufficient length. Expand character set or make it a multi-word passphrase.',
      deduction: 8
    })
    entropyDeductions += 8
  } else if (/^\d+$/.test(password)) {
    patternsDetected.push({
      category: 'diversity',
      name: 'Numeric PIN Only',
      description: 'Search space is restricted to only 10 digits per position. Trivial for GPU cracking.',
      deduction: 25
    })
    entropyDeductions += 25
  }

  // Effective Information Entropy
  const effectiveEntropy = Math.max(0, Math.round(rawEntropy - entropyDeductions))

  // Crack Time Estimation (Attempts required = 2^effectiveEntropy / 2)
  const totalCombinations = Math.pow(2, Math.min(effectiveEntropy, 128))
  const avgAttempts = totalCombinations / 2

  const onlineThrottled = formatTime(avgAttempts / 10) // 10 guesses / sec (Rate limited)
  const onlineFast = formatTime(avgAttempts / 1000) // 1,000 guesses / sec (Botnet stuffing)
  const offlineGpu = formatTime(avgAttempts / 100000000000) // 100 Billion H/s (8x RTX 4090 Hashcat rig)
  const supercomputer = formatTime(avgAttempts / 10000000000000) // 10 Trillion H/s (Distributed cluster)

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
    strengthScore = Math.max(5, strengthScore - patternsDetected.length * 12)
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
  } else if (strengthScore >= 45) {
    rating = 'MODERATE'
    toneColor = '#ffb700'
  } else if (strengthScore >= 25) {
    rating = 'WEAK'
    toneColor = '#ff6600'
  }

  // Cryptographic Hashes (MD5, SHA-256, SHA-1 for K-Anonymity)
  const md5Hash = calculateMD5(password)
  const sha256Hash = calculateSHA256(password)
  const sha1Hash = calculateSHA1(password)

  // Generate dynamic improvement tips
  const improvementTips: string[] = []
  if (length < 12) {
    improvementTips.push(`Add ${12 - length} more characters to reach the recommended 12+ character baseline.`)
  }
  if (!checks.casing && length < 20) {
    improvementTips.push('Mix both UPPERCASE and lowercase letters to expand the character alphabet.')
  }
  if (!checks.hasNumber) {
    improvementTips.push('Include numbers (0-9) inside non-predictable positions.')
  }
  if (!checks.hasSymbol) {
    improvementTips.push('Add special symbols (!@#$%^&*) to maximize combinatorial search space.')
  }
  if (patternsDetected.some(p => p.category === 'dictionary' || p.category === 'predictable')) {
    improvementTips.push('Replace predictable dictionary words with a 4-word Diceware passphrase (e.g. "beacon-curtain-falcon-orbit").')
  }
  if (patternsDetected.some(p => p.category === 'spatial' || p.category === 'sequential')) {
    improvementTips.push('Eliminate keyboard walks (qwerty, 1234) and sequential series.')
  }
  if (improvementTips.length === 0) {
    improvementTips.push('Excellent! This password has high information entropy and resists advanced GPU dictionary/mask attacks.')
  }

  return {
    password,
    length,
    entropyBits: effectiveEntropy,
    rawEntropy,
    poolSize,
    strengthScore,
    rating,
    toneColor,
    characterBreakdown: { lowercase, uppercase, numbers, symbols, space },
    crackTimes: { onlineThrottled, onlineFast, offlineGpu, supercomputer },
    patternsDetected,
    checks,
    hashSimulations: {
      md5: md5Hash,
      sha256: sha256Hash,
      sha1: sha1Hash,
      kAnonymityPrefix: sha1Hash.slice(0, 5),
      kAnonymitySuffix: sha1Hash.slice(5)
    },
    improvementTips
  }
}

// ============================================================================
// Education Hub Data: Weak Patterns & Anti-Patterns Encyclopedia
// ============================================================================

export interface AntiPattern {
  id: string
  title: string
  subtitle: string
  badge: string
  example: string
  whyWeak: string
  howAttackersBreakIt: string
  betterAlternative: string
  estimatedCrackTime: string
}

export const ANTI_PATTERNS: AntiPattern[] = [
  {
    id: 'base-year',
    title: 'The "Base + Year + Symbol" Trap',
    subtitle: 'e.g. Summer2024!, Password123!',
    badge: 'MOST COMMON CORPORATE VULNERABILITY',
    example: 'Autumn2024@',
    whyWeak: 'Humans follow predictable mental heuristics when forced to include capital letters, numbers, and symbols.',
    howAttackersBreakIt: 'Hashcat mask attacks (?u?l?l?l?l?l?l?d?d?d?d?s) crack these in under 0.05 seconds against offline NTLM / SHA-256 dumps.',
    betterAlternative: 'Four random words joined by hyphens: "timber-quasar-lagoon-beacon"',
    estimatedCrackTime: '< 0.05 seconds on 1 GPU'
  },
  {
    id: 'leetspeak-illusion',
    title: 'The Leetspeak Obfuscation Myth',
    subtitle: 'e.g. P@ssw0rd, Tr0ub4dor&3, M@tr!x2023',
    badge: 'AUTOMATED RULE TABLE TARGET',
    example: 'P@$$w0rd2024!',
    whyWeak: 'Replacing "a" with "@", "o" with "0", or "s" with "$" feels complex to humans, but cracking tools have pre-compiled transformation rule tables (e.g. best64.rule, dive.rule).',
    howAttackersBreakIt: 'Rule-based dictionary attacks automatically apply all standard leetspeak permutations to billions of dictionary words in milliseconds.',
    betterAlternative: 'Length is king: A 20-character Diceware phrase has 80+ bits of true entropy.',
    estimatedCrackTime: 'Instant (< 1 ms)'
  },
  {
    id: 'keyboard-walk',
    title: 'Keyboard Spatial Walks',
    subtitle: 'e.g. qwerty, 1qaz2wsx, zxcvbnm',
    badge: 'HIGH ADJACENCY PREDICTABILITY',
    example: 'qweasd123!@#',
    whyWeak: 'Fingers naturally slide along neighboring keys on QWERTY or numeric keypads.',
    howAttackersBreakIt: 'Cracking algorithms maintain adjacency graphs of physical keyboards to generate and test all spatial geometric patterns.',
    betterAlternative: 'Use a password manager CSPRNG generator or random dice roll words.',
    estimatedCrackTime: '0.001 seconds'
  },
  {
    id: 'password-reuse',
    title: 'The Password Reuse Domino Effect',
    subtitle: 'Using one "strong" password everywhere',
    badge: 'CREDENTIAL STUFFING CATALYST',
    example: 'MyS3cur3P@ssw0rd! (used on 15 sites)',
    whyWeak: 'No matter how strong your password is, if ONE low-security website you signed up for suffers a breach, your password is leaked in plaintext.',
    howAttackersBreakIt: 'Attackers load breach dumps into automated tools (e.g. SilverBullet, Sentry MBA) and test your email + password across banking, email, cloud, and crypto services.',
    betterAlternative: 'Unique password for EVERY service, stored securely in a password manager with MFA.',
    estimatedCrackTime: '0 seconds (Already in breach DB)'
  },
  {
    id: 'personal-osint',
    title: 'Personal Identifiers (OSINT Vulnerability)',
    subtitle: 'Names, pets, birth years, sports teams',
    badge: 'TARGETED SPEAR-ATTACK TARGET',
    example: 'FluffyRover2018!',
    whyWeak: 'Social media (Instagram, Facebook, LinkedIn) makes pet names, graduation years, sports teams, and birthdays publicly discoverable.',
    howAttackersBreakIt: 'Targeted wordlist generators (like CeWL or Cupp) scrape a target\'s public profile to build custom attack dictionaries in seconds.',
    betterAlternative: 'Completely decoupled random words that have zero connection to personal life.',
    estimatedCrackTime: '< 2 seconds targeted'
  },
  {
    id: 'short-complexity',
    title: 'The 8-Character Complexity Fallacy',
    subtitle: '8 characters with complex symbols',
    badge: 'BRUTE FORCE EXHAUSTION RISK',
    example: 'K#9$v!L2',
    whyWeak: 'An 8-character password from all 95 printable ASCII characters has only ~52 bits of entropy. The total search space is 95^8 = 6.6 × 10^15 combinations.',
    howAttackersBreakIt: 'A modern 8x RTX 4090 GPU rig running at 150 GH/s exhausts all 6.6 quadrillion 8-character possibilities in approximately 12 hours.',
    betterAlternative: '16+ character passphrase. 16 chars of full ASCII = 95^16 combinations (takes trillions of years).',
    estimatedCrackTime: '~12 hours total exhaustion'
  }
]

// ============================================================================
// Credential Stuffing & Breach Simulation Types & Data
// ============================================================================

export interface StuffingTarget {
  id: string
  name: string
  category: 'Banking' | 'Email / Master' | 'Cloud Storage' | 'Social Media' | 'Crypto Wallet' | 'Shopping'
  iconName: string
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  protectWithMfa: boolean
}

export const STUFFING_TARGETS: StuffingTarget[] = [
  { id: 'bank', name: 'First National Bank', category: 'Banking', iconName: 'Landmark', criticality: 'CRITICAL', protectWithMfa: true },
  { id: 'email', name: 'Primary Google/Outlook Mail', category: 'Email / Master', iconName: 'Mail', criticality: 'CRITICAL', protectWithMfa: true },
  { id: 'cloud', name: 'Cloud Drive (Docs & Tax Returns)', category: 'Cloud Storage', iconName: 'Cloud', criticality: 'HIGH', protectWithMfa: false },
  { id: 'crypto', name: 'Coinbase / Crypto Exchange', category: 'Crypto Wallet', iconName: 'Coins', criticality: 'CRITICAL', protectWithMfa: true },
  { id: 'social', name: 'Instagram & X / Twitter', category: 'Social Media', iconName: 'Share2', criticality: 'MEDIUM', protectWithMfa: false },
  { id: 'ecommerce', name: 'Amazon / Online Retail', category: 'Shopping', iconName: 'ShoppingBag', criticality: 'HIGH', protectWithMfa: false }
]
