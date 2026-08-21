'use client'

import { useState } from 'react'
import {
  GraduationCap,
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  KeyRound,
  Lock,
  Unlock,
  Radio,
  ExternalLink,
  Sliders,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  ServerOff,
  Landmark,
  Mail,
  Cloud,
  Coins,
  Share2,
  ShoppingBag,
  Award,
  ChevronRight
} from 'lucide-react'
import {
  ANTI_PATTERNS,
  AntiPattern,
  STUFFING_TARGETS,
  generateDicewarePassphrase,
  DICEWARE_WORDLIST
} from '@/lib/password-security'
import { hackerAudio } from '@/lib/hacker-audio'

interface EducationAcademyProps {
  onTestPassword: (password: string) => void
}

type SubTab = 'stuffing' | 'antipatterns' | 'diceware' | 'quiz' | 'nist'

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Why is "P@ssw0rd2024!" considered weak despite having uppercase, lowercase, numbers, and symbols?',
    options: [
      'It does not have enough total character length.',
      'Attackers use rule-based dictionaries and leetspeak tables that test "Password" + leet substitutes + current year in milliseconds.',
      'Special symbols are no longer allowed by modern cryptographic standards.',
      'Because it does not contain Unicode emojis.'
    ],
    correctIndex: 1,
    explanation: 'Modern password cracking tools (like Hashcat) employ rule tables that instantly translate "@" to "a", "0" to "o", and append calendar years. This predictable human pattern collapses the search space from trillions to mere thousands.'
  },
  {
    id: 2,
    question: 'What is the greatest risk of reusing the same "strong" password across multiple online accounts?',
    options: [
      'Your browser might run out of cache memory.',
      'If any single website suffers a data breach, automated bots use your leaked email + password to take over your banking, email, and social accounts (Credential Stuffing).',
      'The password will expire faster on banking websites.',
      'Search engines will index your password in search results.'
    ],
    correctIndex: 1,
    explanation: 'Credential stuffing is an automated attack where threat actors purchase breach dumps from compromised services and test credentials across hundreds of high-value services in minutes. Password reuse turns a minor leak into a total identity compromise.'
  },
  {
    id: 3,
    question: 'According to modern NIST SP 800-63B digital identity guidelines, how should password policies be structured?',
    options: [
      'Force users to change passwords every 30-90 days regardless of breaches.',
      'Prioritize password length (15+ chars or passphrases), check against known breached lists, and stop arbitrary periodic rotation unless compromised.',
      'Require at least 4 special symbols and prohibit dictionary words completely.',
      'Limit all passwords to exactly 8 characters.'
    ],
    correctIndex: 1,
    explanation: 'NIST deprecates forced 90-day resets because they cause users to make predictable incremental tweaks (e.g. Summer2023! -> Autumn2023!). Instead, NIST recommends length (or multi-word passphrases), breached password screening, and multi-factor authentication (MFA).'
  },
  {
    id: 4,
    question: 'Why is a 4-word Diceware passphrase (e.g. "beacon-curtain-falcon-orbit") superior to a complex 8-character password (e.g. "K#9$v!L2")?',
    options: [
      'Diceware words are encrypted by the dictionary publisher.',
      '8 characters have only ~52 bits of entropy (crackable in ~12 hours on an 8x GPU rig), while 4 random words provide 52-77 bits of entropy with massive length and easy memorability.',
      'Hyphens are mathematically uncrackable by supercomputers.',
      'Passphrases prevent phishing emails from reaching your inbox.'
    ],
    correctIndex: 1,
    explanation: 'Search space is an exponential function of length. A 4-word Diceware phrase chosen from 7,776 words has 7,776^4 (3.6 quadrillion) combinations and ~28 characters, making brute-force GPU attacks computationally infeasible while remaining effortless to type.'
  },
  {
    id: 5,
    question: 'Why are Passkeys (FIDO2 / WebAuthn) and hardware security keys considered the gold standard of authentication?',
    options: [
      'They rely on longer 64-character text passwords sent via SMS.',
      'They use asymmetric public-key cryptography tied to the specific website domain, making them completely immune to credential stuffing and phishing attacks.',
      'They store your master password in a decentralized blockchain.',
      'They require daily manual password rotation.'
    ],
    correctIndex: 1,
    explanation: 'Passkeys eliminate shared secrets (passwords). Your device holds the private key in hardware (Secure Enclave/TPM) and only signs cryptographic challenges for the registered origin domain. Even if a server is breached, no passwords exist to be stolen!'
  }
]

export function EducationAcademy({ onTestPassword }: EducationAcademyProps) {
  const [subTab, setSubTab] = useState<SubTab>('stuffing')

  // ==========================================================================
  // Credential Stuffing Simulation State
  // ==========================================================================
  const [breachSource, setBreachSource] = useState('ObscureFitnessForum.net (2023 Breach)')
  const [reusePassword, setReusePassword] = useState(true)
  const [enableMfaOnBank, setEnableMfaOnBank] = useState(false)
  const [simRunning, setSimRunning] = useState(false)
  const [simProgress, setSimProgress] = useState<Record<string, 'pending' | 'testing' | 'breached' | 'protected'>>({})
  const [simFinished, setSimFinished] = useState(false)

  const runStuffingSimulation = () => {
    hackerAudio.playScan()
    setSimRunning(true)
    setSimFinished(false)

    // Reset progress
    const initial: Record<string, 'pending' | 'testing' | 'breached' | 'protected'> = {}
    STUFFING_TARGETS.forEach(t => { initial[t.id] = 'pending' })
    setSimProgress(initial)

    // Sequential testing animation
    STUFFING_TARGETS.forEach((target, index) => {
      setTimeout(() => {
        setSimProgress(prev => ({ ...prev, [target.id]: 'testing' }))
        hackerAudio.playKeypress()

        setTimeout(() => {
          let outcome: 'breached' | 'protected' = 'breached'
          if (!reusePassword) {
            outcome = 'protected' // Unique passwords protect all
          } else if (target.id === 'bank' && enableMfaOnBank) {
            outcome = 'protected' // MFA stepped in to block unauthorized login
          } else {
            outcome = 'breached'
          }

          setSimProgress(prev => ({ ...prev, [target.id]: outcome }))
          if (outcome === 'breached') {
            hackerAudio.playWarning()
          } else {
            hackerAudio.playSuccess()
          }

          if (index === STUFFING_TARGETS.length - 1) {
            setSimRunning(false)
            setSimFinished(true)
          }
        }, 600)
      }, index * 800)
    })
  }

  // ==========================================================================
  // Diceware Interactive Playground State
  // ==========================================================================
  const [dicewareWords, setDicewareWords] = useState(4)
  const [dicewareSeparator, setDicewareSeparator] = useState('-')
  const [dicewareCapitalize, setDicewareCapitalize] = useState(false)
  const [dicewareNumber, setDicewareNumber] = useState(false)
  const [generatedPassphrase, setGeneratedPassphrase] = useState(() =>
    generateDicewarePassphrase(4, '-', false, false)
  )
  const [copiedDiceware, setCopiedDiceware] = useState(false)

  const handleRegenDiceware = () => {
    const p = generateDicewarePassphrase(dicewareWords, dicewareSeparator, dicewareCapitalize, dicewareNumber)
    setGeneratedPassphrase(p)
    hackerAudio.playScan()
  }

  const handleCopyDiceware = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generatedPassphrase)
    }
    setCopiedDiceware(true)
    hackerAudio.playSuccess()
    setTimeout(() => setCopiedDiceware(false), 2000)
  }

  // Combinations & Entropy calculation for Diceware
  const dicewareCombinations = Math.pow(7776, dicewareWords)
  const dicewareEntropyBits = Math.round(dicewareWords * Math.log2(7776) + (dicewareNumber ? 9.9 : 0))

  // ==========================================================================
  // Quiz State
  // ==========================================================
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizFinished, setQuizFinished] = useState(false)

  const handleSelectOption = (optIdx: number) => {
    if (showExplanation) return
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIdx]: optIdx }))
    setShowExplanation(true)
    const isCorrect = optIdx === QUIZ_QUESTIONS[currentQuestionIdx].correctIndex
    if (isCorrect) {
      hackerAudio.playSuccess()
    } else {
      hackerAudio.playWarning()
    }
  }

  const handleNextQuestion = () => {
    setShowExplanation(false)
    if (currentQuestionIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1)
      hackerAudio.playKeypress()
    } else {
      setQuizFinished(true)
    }
  }

  const handleResetQuiz = () => {
    setCurrentQuestionIdx(0)
    setSelectedAnswers({})
    setShowExplanation(false)
    setQuizFinished(false)
    hackerAudio.playKeypress()
  }

  const scoreCount = Object.entries(selectedAnswers).filter(
    ([qIdx, ansIdx]) => ansIdx === QUIZ_QUESTIONS[Number(qIdx)].correctIndex
  ).length

  // Sub-navigation tabs
  const subNav = [
    ['stuffing', 'Credential Stuffing Simulator', Flame],
    ['antipatterns', 'Weak Pattern Encyclopedia', AlertTriangle],
    ['diceware', 'Passphrase vs Password (Diceware)', KeyRound],
    ['quiz', 'Cybersecurity Hygiene Quiz', GraduationCap],
    ['nist', 'NIST SP 800-63B Guidelines', ShieldCheck]
  ] as const

  return (
    <div className="space-y-6 font-mono">
      {/* Education Academy Header Banner */}
      <div className="rounded-xl border border-primary/40 bg-card/80 p-6 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/40 border-glow">
              <GraduationCap className="size-7" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-bold">
                CYBERSECURITY DEFENSE ACADEMY
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight mt-1">
                PASSWORD HYGIENE & THREAT INTELLIGENCE
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive Learning Modules Active</span>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-border/40 pt-4">
          {subNav.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => {
                setSubTab(id)
                hackerAudio.playKeypress()
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs transition-all ${
                subTab === id
                  ? 'bg-primary/20 text-primary border border-primary/50 font-bold shadow-[0_0_12px_rgba(0,255,102,0.15)]'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent'
              }`}
            >
              <Icon className="size-3.5 text-primary" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* MODULE 1: CREDENTIAL STUFFING & PASSWORD REUSE SIMULATOR */}
      {/* ====================================================================== */}
      {subTab === 'stuffing' && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Controls & Scenario Config */}
          <div className="lg:col-span-5 rounded-xl border border-primary/30 bg-card/80 p-6 backdrop-blur-md space-y-5">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Flame className="size-5 text-destructive animate-pulse" />
              <span>ATTACK SCENARIO CONFIGURATION</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Experience how cybercriminals use automated botnets (e.g. Sentry MBA, OpenBullet) to test leaked username + password dumps across the internet.
            </p>

            <div className="space-y-4 pt-2 text-xs">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  INITIAL DATA BREACH SOURCE:
                </label>
                <select
                  value={breachSource}
                  onChange={(e) => setBreachSource(e.target.value)}
                  className="w-full bg-background border border-primary/30 rounded-lg p-2.5 text-foreground text-xs outline-none focus:border-primary"
                  disabled={simRunning}
                >
                  <option value="ObscureFitnessForum.net (2023 Breach)">ObscureFitnessForum.net (MD5 Plaintext Breach)</option>
                  <option value="GamingCommunity2022.org Leak">GamingCommunity2022.org (Unsalted SQL Leak)</option>
                  <option value="OldShoppingStore.com Dump">OldShoppingStore.com (50M Leaked Records)</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/30">
                  <div>
                    <p className="font-bold text-foreground">Password Reuse Habit</p>
                    <p className="text-[10px] text-muted-foreground">Using the same password on other accounts</p>
                  </div>
                  <button
                    onClick={() => { setReusePassword(!reusePassword); hackerAudio.playKeypress() }}
                    disabled={simRunning}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                      reusePassword ? 'bg-destructive/20 text-destructive border border-destructive/40' : 'bg-primary/20 text-primary border border-primary/40'
                    }`}
                  >
                    {reusePassword ? 'REUSING PASSWORD (DANGEROUS)' : 'UNIQUE PASSWORDS (SECURE)'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/30">
                  <div>
                    <p className="font-bold text-foreground">Multi-Factor Authentication (MFA)</p>
                    <p className="text-[10px] text-muted-foreground">Enabled on First National Bank</p>
                  </div>
                  <button
                    onClick={() => { setEnableMfaOnBank(!enableMfaOnBank); hackerAudio.playKeypress() }}
                    disabled={simRunning}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                      enableMfaOnBank ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    {enableMfaOnBank ? 'MFA ACTIVE (2FA)' : 'MFA DISABLED'}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={runStuffingSimulation}
                disabled={simRunning}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold text-xs shadow-[0_0_20px_rgba(255,0,85,0.3)] transition-all disabled:opacity-50"
              >
                {simRunning ? (
                  <>
                    <Radio className="size-4 animate-spin" /> DISPATCHING AUTOMATED BOTNET ATTACK...
                  </>
                ) : (
                  <>
                    <Play className="size-4" /> SIMULATE CREDENTIAL STUFFING REPLAY
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Attack Cascade Board */}
          <div className="lg:col-span-7 rounded-xl border border-primary/30 bg-card/80 p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Radio className="size-4 text-primary animate-pulse" /> LIVE CREDENTIAL REPLAY TARGET CASCADE
                </h3>
                <p className="text-[11px] text-muted-foreground">Automated bot testing leaked combo: <span className="text-destructive font-bold">victim@domain.com : Pass123!</span></p>
              </div>

              {simFinished && (
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded border ${
                  reusePassword && !enableMfaOnBank ? 'bg-destructive/20 text-destructive border-destructive/40' : 'bg-primary/20 text-primary border-primary/40'
                }`}>
                  {reusePassword && !enableMfaOnBank ? 'CRITICAL COMPROMISE' : 'ATTACK MITIGATED'}
                </span>
              )}
            </div>

            {/* Target Services Grid */}
            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              {STUFFING_TARGETS.map((target) => {
                const status = simProgress[target.id] || 'pending'
                const isBankMfa = target.id === 'bank' && enableMfaOnBank

                return (
                  <div
                    key={target.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      status === 'breached'
                        ? 'border-destructive/60 bg-destructive/10 shadow-[0_0_15px_rgba(255,0,85,0.15)]'
                        : status === 'protected'
                        ? 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_15px_rgba(0,255,102,0.15)]'
                        : status === 'testing'
                        ? 'border-primary/80 bg-primary/10 animate-pulse'
                        : 'border-border/40 bg-muted/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">{target.category}</span>
                        <p className="text-xs font-bold text-foreground mt-0.5">{target.name}</p>
                      </div>

                      {status === 'breached' && <XCircle className="size-5 text-destructive shrink-0" />}
                      {status === 'protected' && <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />}
                      {status === 'testing' && <Radio className="size-4 text-primary animate-spin shrink-0" />}
                      {status === 'pending' && <Lock className="size-4 text-muted-foreground shrink-0" />}
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Status:</span>
                      {status === 'pending' && <span className="text-muted-foreground">Queued</span>}
                      {status === 'testing' && <span className="text-primary font-bold">Injecting Combo...</span>}
                      {status === 'breached' && <span className="text-destructive font-bold">ACCOUNT HIJACKED (200 OK)</span>}
                      {status === 'protected' && (
                        <span className="text-emerald-400 font-bold">
                          {isBankMfa ? 'BLOCKED BY MFA CHALLENGE' : 'BLOCKED (UNIQUE PASSWORD)'}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Key Educational Takeaway */}
            <div className="mt-4 p-4 rounded-xl border border-primary/40 bg-primary/10 text-xs text-foreground space-y-1.5">
              <p className="font-bold text-primary flex items-center gap-1.5">
                <ShieldCheck className="size-4" /> THE CREDENTIAL STUFFING LESSON:
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Attackers don&apos;t hack your bank by breaking its encryption—they steal your password from an insecure gaming forum or newsletter and use automated bots to test that exact same password against your bank, email, and cloud drive.
                <strong> The only defense is a unique password for every single service, managed securely in a password manager.</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODULE 2: WEAK PASSWORD ANTI-PATTERNS ENCYCLOPEDIA */}
      {/* ====================================================================== */}
      {subTab === 'antipatterns' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {ANTI_PATTERNS.map((pattern) => (
              <div
                key={pattern.id}
                className="rounded-xl border border-primary/30 bg-card/80 p-5 backdrop-blur-md hover:border-primary/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/30">
                    {pattern.badge}
                  </span>

                  <h3 className="text-sm font-extrabold text-foreground mt-2">{pattern.title}</h3>
                  <p className="text-[11px] text-muted-foreground">{pattern.subtitle}</p>

                  <div className="mt-4 p-2.5 rounded-lg border border-border/60 bg-muted/40 font-mono text-xs">
                    <span className="text-[10px] text-muted-foreground block">COMMON EXAMPLE:</span>
                    <span className="font-bold text-destructive select-all">{pattern.example}</span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-primary font-bold block">WHY IT&apos;S VULNERABLE:</span>
                      <p className="text-[11px] text-muted-foreground">{pattern.whyWeak}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-amber-400 font-bold block">HOW HASHCAT CRACKS IT:</span>
                      <p className="text-[11px] text-muted-foreground">{pattern.howAttackersBreakIt}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold block">RECOMMENDED REPLACEMENT:</span>
                      <p className="text-[11px] text-foreground font-bold">{pattern.betterAlternative}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    GPU Crack: <strong className="text-destructive">{pattern.estimatedCrackTime}</strong>
                  </span>

                  <button
                    onClick={() => {
                      onTestPassword(pattern.example)
                      hackerAudio.playSuccess()
                    }}
                    className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 font-bold transition-all"
                  >
                    Test in Checker <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODULE 3: PASSPHRASE VS COMPLEX PASSWORD (DICEWARE) */}
      {/* ====================================================================== */}
      {subTab === 'diceware' && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Head-to-Head Comparison */}
          <div className="lg:col-span-12 grid gap-6 md:grid-cols-2">
            {/* Short Complex Password */}
            <div className="rounded-xl border border-destructive/40 bg-card/80 p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="size-4" /> TRADITIONAL &quot;COMPLEX&quot; PASSWORD
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-destructive/20 text-destructive border border-destructive/40 font-bold">
                  POOR USABILITY & WEAK ENTROPY
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-destructive/40 bg-destructive/10 font-mono text-center">
                <p className="text-xl font-extrabold text-foreground tracking-widest">Tr0ub4dor&3</p>
                <p className="text-[10px] text-muted-foreground mt-1">11 Characters · Hard to memorize · Easy to mis-type on mobile</p>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span>Calculated Entropy:</span>
                  <span className="font-bold text-destructive">~38.4 Bits (Low)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span>Search Space:</span>
                  <span className="font-bold text-foreground">95^11 ≈ 5.6 × 10^21</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span>Adversary Rule Attack:</span>
                  <span className="font-bold text-destructive">Cracked in seconds (Rule Table)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Human Memorability:</span>
                  <span className="font-bold text-destructive">Terrible (Often written on sticky notes)</span>
                </div>
              </div>
            </div>

            {/* Diceware Passphrase */}
            <div className="rounded-xl border border-primary/40 bg-card/80 p-6 backdrop-blur-md space-y-4 shadow-[0_0_20px_rgba(0,255,102,0.1)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="size-4" /> MODERN DICEWARE PASSPHRASE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/40 font-bold">
                  NIST RECOMMENDED
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-primary/40 bg-primary/10 font-mono text-center">
                <p className="text-lg md:text-xl font-extrabold text-emerald-400 tracking-wider">
                  correct-horse-battery-staple
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">28 Characters · Effortless mental imagery · Easy to type anywhere</p>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span>Calculated Entropy:</span>
                  <span className="font-bold text-emerald-400">~77.5 Bits (Unbreakable)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span>Search Space:</span>
                  <span className="font-bold text-foreground">7,776^4 ≈ 3.6 × 10^15 word combos</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span>Adversary GPU Attack:</span>
                  <span className="font-bold text-emerald-400">Trillions of Years</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Human Memorability:</span>
                  <span className="font-bold text-emerald-400">Instant (Visual Story Association)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Diceware Generator & Search Space Calculator */}
          <div className="lg:col-span-12 rounded-xl border border-primary/30 bg-card/80 p-6 backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Sliders className="size-4 text-primary" /> INTERACTIVE DICEWARE SEARCH SPACE GENERATOR
                </h3>
                <p className="text-xs text-muted-foreground">Adjust word count to observe exponential combinatorial growth ($7776^N$)</p>
              </div>

              <button
                onClick={handleRegenDiceware}
                className="px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="size-3.5" /> Roll New Words
              </button>
            </div>

            {/* Generated Passphrase Display */}
            <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl border border-primary/50 bg-background/90 font-mono">
              <span className="flex-1 text-base md:text-lg font-extrabold text-emerald-400 tracking-wider select-all break-all">
                {generatedPassphrase}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyDiceware}
                  className="px-3 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  {copiedDiceware ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  {copiedDiceware ? 'COPIED' : 'COPY'}
                </button>

                <button
                  onClick={() => {
                    onTestPassword(generatedPassphrase)
                    hackerAudio.playSuccess()
                  }}
                  className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-bold transition-all"
                >
                  TEST IN CHECKER
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-2">
                  WORD COUNT: <span className="text-primary font-bold">{dicewareWords} Words</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="6"
                  value={dicewareWords}
                  onChange={(e) => {
                    setDicewareWords(Number(e.target.value))
                    const p = generateDicewarePassphrase(Number(e.target.value), dicewareSeparator, dicewareCapitalize, dicewareNumber)
                    setGeneratedPassphrase(p)
                  }}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-2">
                  WORD SEPARATOR:
                </label>
                <div className="flex gap-2">
                  {['-', '_', '.', ' '].map((sep) => (
                    <button
                      key={sep}
                      onClick={() => {
                        setDicewareSeparator(sep)
                        const p = generateDicewarePassphrase(dicewareWords, sep, dicewareCapitalize, dicewareNumber)
                        setGeneratedPassphrase(p)
                      }}
                      className={`px-3 py-1.5 rounded border text-xs font-bold transition-colors ${
                        dicewareSeparator === sep ? 'border-primary text-primary bg-primary/20' : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {sep === ' ' ? 'Space' : sep}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 sm:pt-0">
                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={dicewareNumber}
                    onChange={(e) => {
                      setDicewareNumber(e.target.checked)
                      const p = generateDicewarePassphrase(dicewareWords, dicewareSeparator, dicewareCapitalize, e.target.checked)
                      setGeneratedPassphrase(p)
                    }}
                    className="accent-primary"
                  />
                  <span>Append Random Digit</span>
                </label>
              </div>
            </div>

            {/* Entropy & Mathematics Box */}
            <div className="grid gap-3 sm:grid-cols-3 pt-2 text-xs">
              <div className="p-3 rounded-lg border border-border/40 bg-muted/20">
                <span className="text-[10px] text-muted-foreground block">ESTIMATED SHANNON ENTROPY:</span>
                <span className="font-extrabold text-emerald-400 text-base">{dicewareEntropyBits} BITS</span>
              </div>

              <div className="p-3 rounded-lg border border-border/40 bg-muted/20">
                <span className="text-[10px] text-muted-foreground block">COMBINATORIAL SEARCH SPACE:</span>
                <span className="font-extrabold text-primary text-base">7,776^{dicewareWords} combos</span>
              </div>

              <div className="p-3 rounded-lg border border-border/40 bg-muted/20">
                <span className="text-[10px] text-muted-foreground block">GPU TIME-TO-EXHAUST:</span>
                <span className="font-extrabold text-emerald-400 text-base">Trillions of Years</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODULE 4: CYBERSECURITY HYGIENE QUIZ */}
      {/* ====================================================================== */}
      {subTab === 'quiz' && (
        <div className="rounded-xl border border-primary/30 bg-card/80 p-6 backdrop-blur-md max-w-4xl mx-auto space-y-6">
          {!quizFinished ? (
            <div>
              {/* Quiz Header & Progress */}
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-bold">
                    QUESTION {currentQuestionIdx + 1} OF {QUIZ_QUESTIONS.length}
                  </span>
                  <h3 className="text-base font-extrabold text-foreground mt-1">
                    {QUIZ_QUESTIONS[currentQuestionIdx].question}
                  </h3>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-muted-foreground">SCORE</span>
                  <p className="text-base font-extrabold text-primary">{scoreCount} / {QUIZ_QUESTIONS.length}</p>
                </div>
              </div>

              {/* Options */}
              <div className="mt-6 space-y-3">
                {QUIZ_QUESTIONS[currentQuestionIdx].options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIdx] === optIdx
                  const isCorrect = optIdx === QUIZ_QUESTIONS[currentQuestionIdx].correctIndex

                  let btnCls = 'border-border/50 bg-muted/30 hover:border-primary/60 text-foreground'
                  if (showExplanation) {
                    if (isCorrect) {
                      btnCls = 'border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold shadow-[0_0_15px_rgba(0,255,102,0.15)]'
                    } else if (isSelected) {
                      btnCls = 'border-destructive bg-destructive/20 text-destructive font-bold'
                    } else {
                      btnCls = 'opacity-40 border-border/30'
                    }
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectOption(optIdx)}
                      disabled={showExplanation}
                      className={`w-full text-left p-4 rounded-xl border text-xs transition-all flex items-start gap-3 ${btnCls}`}
                    >
                      <span className="size-6 rounded-full border border-current flex items-center justify-center shrink-0 font-bold text-xs">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="mt-0.5 leading-relaxed">{option}</span>
                    </button>
                  )
                })}
              </div>

              {/* Explanation Box */}
              {showExplanation && (
                <div className="mt-6 p-4 rounded-xl border border-primary/40 bg-card/90 space-y-2 animate-in fade-in duration-200">
                  <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="size-4" /> CRYPTOGRAPHIC EXPLANATION:
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {QUIZ_QUESTIONS[currentQuestionIdx].explanation}
                  </p>

                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      {currentQuestionIdx < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'View Final Score'}
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Final Score Screen */
            <div className="text-center py-8 space-y-6">
              <div className="inline-flex size-20 items-center justify-center rounded-full bg-primary/20 text-primary border-2 border-primary border-glow">
                <Award className="size-10" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-foreground">QUIZ COMPLETED!</h3>
                <p className="text-xs text-muted-foreground mt-1">Your cybersecurity password knowledge evaluation</p>
              </div>

              <div className="inline-block p-4 rounded-2xl border border-primary/40 bg-muted/40 font-mono">
                <span className="text-xs text-muted-foreground block">TOTAL SCORE</span>
                <span className="text-4xl font-extrabold text-primary glow-text">
                  {scoreCount} / {QUIZ_QUESTIONS.length}
                </span>
                <p className="text-xs font-bold text-emerald-400 mt-2">
                  {scoreCount === 5 ? '🏆 SEC-OPS GRANDMASTER (GRADE A+)' : scoreCount >= 3 ? '🛡️ CYBER DEFENDER (GRADE B)' : '⚠️ SECURITY APPRENTICE (NEEDS REVIEW)'}
                </p>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleResetQuiz}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <RotateCcw className="size-4" /> Retake Security Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODULE 5: NIST SP 800-63B GUIDELINES & MODERN BEST PRACTICES */}
      {/* ====================================================================== */}
      {subTab === 'nist' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-primary/30 bg-card/80 p-6 backdrop-blur-md space-y-4">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> NIST SP 800-63B INDUSTRY STANDARD
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The National Institute of Standards and Technology (NIST) overhauled federal password security guidelines to align with empirical cryptographic research.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-lg border border-border/40 bg-muted/30 flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">Length Trumps Complexity</p>
                  <p className="text-[11px] text-muted-foreground">Encourage long passphrases (15+ chars) instead of forcing difficult-to-type arbitrary punctuation rules.</p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border/40 bg-muted/30 flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">Stop Forced 90-Day Resets</p>
                  <p className="text-[11px] text-muted-foreground">Arbitrary expiration causes predictable modifications (e.g. Pass1 &rarr; Pass2). Only change when a breach is confirmed.</p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border/40 bg-muted/30 flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">Screen Against Breach Dictionaries</p>
                  <p className="text-[11px] text-muted-foreground">Systems should reject passwords found in known breach datasets (RockYou, HaveIBeenPwned) at registration time.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-primary/30 bg-card/80 p-6 backdrop-blur-md space-y-4">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Sparkles className="size-4 text-cyan-400" /> PASSKEYS & MULTI-FACTOR AUTH (MFA)
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Passwords are shared secrets vulnerable to phishing. Upgrading to asymmetric hardware authentication completely closes the attack vector.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-lg border border-border/40 bg-muted/30">
                <span className="text-[10px] text-cyan-400 font-bold uppercase block">FIDO2 / WEBAUTHN PASSKEYS</span>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Replaces passwords with biometric/hardware key pairs. Immune to credential stuffing, MITM interception, and phishing.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border/40 bg-muted/30">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">APP-BASED TOTP / SECURITY KEYS</span>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Use hardware keys (YubiKey) or Authenticator apps (Google/Microsoft Auth) instead of vulnerable SMS verification (which can be SIM-swapped).
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border/40 bg-muted/30">
                <span className="text-[10px] text-primary font-bold uppercase block">ZERO-KNOWLEDGE PASSWORD MANAGERS</span>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Tools like Bitwarden, 1Password, or KeePass generate and auto-fill unique 20+ char credentials for every service you use.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
