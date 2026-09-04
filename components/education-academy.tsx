'use client'

import { useState, useEffect } from 'react'
import {
  GraduationCap,
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  KeyRound,
  Lock,
  Sliders,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  ServerOff,
  Radio,
  Award,
  ChevronRight
} from 'lucide-react'
import {
  ANTI_PATTERNS,
  STUFFING_TARGETS,
  generateDicewarePassphrase
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
    question: 'Why is "P@ssw0rd2024!" considered weak despite containing uppercase, lowercase, numbers, and symbols?',
    options: [
      'It does not contain enough total character length.',
      'Attackers use rule-based dictionaries that automatically substitute leetspeak (@ for a, 0 for o) and append calendar years in milliseconds.',
      'Special symbols are prohibited by modern cryptographic standards.',
      'Because it does not include Unicode emojis.'
    ],
    correctIndex: 1,
    explanation: 'Modern password cracking tools (such as Hashcat) employ rule tables that instantly translate "@" to "a", "0" to "o", and append calendar years. This predictable pattern collapses the search space from trillions to mere thousands.'
  },
  {
    id: 2,
    question: 'What is the greatest security danger of reusing the same password across multiple online services?',
    options: [
      'Your browser might run out of cache memory.',
      'If any single website suffers a data breach, automated bots replay your leaked email and password to compromise all your other accounts (Credential Stuffing).',
      'The password expires automatically on financial websites.',
      'Search engines index your password in public queries.'
    ],
    correctIndex: 1,
    explanation: 'Credential stuffing is an automated attack where cybercriminals purchase breach dumps from minor compromised services and test credentials across hundreds of high-value platforms in minutes. Password reuse turns a single leak into a complete identity takeover.'
  },
  {
    id: 3,
    question: 'According to modern NIST SP 800-63B digital identity guidelines, how should password policies be structured?',
    options: [
      'Force users to change passwords every 30 to 90 days regardless of breaches.',
      'Prioritize password length (15+ chars or multi-word passphrases), screen against known breached lists, and eliminate arbitrary periodic rotation.',
      'Require at least 4 symbols and prohibit all dictionary words.',
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
      '8 characters have only ~52 bits of entropy (crackable in hours on an 8x GPU rig), while 4 random words provide 52-77 bits of entropy with massive length and easy memorability.',
      'Hyphens are mathematically uncrackable by supercomputers.',
      'Passphrases prevent phishing emails from reaching your inbox.'
    ],
    correctIndex: 1,
    explanation: 'Combinatorial search space is an exponential function of length. A 4-word Diceware phrase chosen from 7,776 words has 7,776^4 (3.6 quadrillion) combinations and ~28 characters, making brute-force GPU attacks computationally infeasible while remaining effortless to remember.'
  },
  {
    id: 5,
    question: 'Why are Passkeys (FIDO2 / WebAuthn) and hardware security keys considered the gold standard of authentication?',
    options: [
      'They rely on longer 64-character text passwords sent via SMS.',
      'They use asymmetric public-key cryptography bound to the specific website domain, making them completely immune to credential stuffing and phishing attacks.',
      'They store your master password in a decentralized blockchain.',
      'They require daily manual password rotation.'
    ],
    correctIndex: 1,
    explanation: 'Passkeys eliminate shared secrets (passwords). Your device holds the private key in hardware (Secure Enclave/TPM) and only signs cryptographic challenges for the registered origin domain. Even if a server is breached, no passwords exist to be stolen.'
  }
]

export function EducationAcademy({ onTestPassword }: EducationAcademyProps) {
  const [subTab, setSubTab] = useState<SubTab>('stuffing')

  // Credential Stuffing Simulation State
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

    const initial: Record<string, 'pending' | 'testing' | 'breached' | 'protected'> = {}
    STUFFING_TARGETS.forEach(t => { initial[t.id] = 'pending' })
    setSimProgress(initial)

    STUFFING_TARGETS.forEach((target, index) => {
      setTimeout(() => {
        setSimProgress(prev => ({ ...prev, [target.id]: 'testing' }))
        hackerAudio.playKeypress()

        setTimeout(() => {
          let outcome: 'breached' | 'protected' = 'breached'
          if (!reusePassword) {
            outcome = 'protected'
          } else if (target.id === 'bank' && enableMfaOnBank) {
            outcome = 'protected'
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
        }, 500)
      }, index * 600)
    })
  }

  // Diceware Playground State
  const [dicewareWords, setDicewareWords] = useState(4)
  const [dicewareSeparator, setDicewareSeparator] = useState('-')
  const [dicewareCapitalize, setDicewareCapitalize] = useState(false)
  const [dicewareNumber, setDicewareNumber] = useState(false)
  const [generatedPassphrase, setGeneratedPassphrase] = useState(
    'correct-horse-battery-staple'
  )
  const [copiedDiceware, setCopiedDiceware] = useState(false)

  useEffect(() => {
    setGeneratedPassphrase(generateDicewarePassphrase(4, '-', false, false))
  }, [])

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

  const dicewareEntropyBits = Math.round(dicewareWords * Math.log2(7776) + (dicewareNumber ? 9.9 : 0))

  // Quiz State
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

  const subNav = [
    ['stuffing', 'Credential Stuffing Simulator', Flame],
    ['antipatterns', 'Weak Pattern Catalog', AlertTriangle],
    ['diceware', 'Passphrases (Diceware)', KeyRound],
    ['quiz', 'Interactive Quiz', GraduationCap],
    ['nist', 'NIST SP 800-63B Standards', ShieldCheck]
  ] as const

  return (
    <div className="space-y-6">
      {/* Academy Navigation Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                Interactive Learning Hub
              </span>
              <h2 className="text-xl font-bold text-foreground">
                Cybersecurity & Password Hygiene
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive defensive modules active</span>
          </div>
        </div>

        {/* Sub-tab Pills */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
          {subNav.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => {
                setSubTab(id)
                hackerAudio.playKeypress()
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                subTab === id
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* MODULE 1: CREDENTIAL STUFFING SIMULATOR */}
      {subTab === 'stuffing' && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Controls */}
          <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-destructive font-bold text-sm">
              <Flame className="size-5 animate-pulse" />
              <span>Attack Scenario Configuration</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Observe how attackers deploy automated bots to test credential leak dumps against high-value targets in real-time.
            </p>

            <div className="space-y-4 pt-1 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                  Initial Data Breach Source:
                </label>
                <select
                  value={breachSource}
                  onChange={(e) => setBreachSource(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={simRunning}
                >
                  <option value="ObscureFitnessForum.net (2023 Breach)">ObscureFitnessForum.net (MD5 Plaintext Breach)</option>
                  <option value="GamingCommunity2022.org Leak">GamingCommunity2022.org (Unsalted SQL Leak)</option>
                  <option value="OldShoppingStore.com Dump">OldShoppingStore.com (50M Leaked Records)</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
                  <div>
                    <p className="font-semibold text-foreground">Password Reuse Habit</p>
                    <p className="text-[11px] text-muted-foreground">Using the same password across accounts</p>
                  </div>
                  <button
                    onClick={() => { setReusePassword(!reusePassword); hackerAudio.playKeypress() }}
                    disabled={simRunning}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      reusePassword
                        ? 'bg-destructive/15 text-destructive border border-destructive/30'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {reusePassword ? 'Reusing Password' : 'Unique Passwords'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
                  <div>
                    <p className="font-semibold text-foreground">Multi-Factor Auth (MFA)</p>
                    <p className="text-[11px] text-muted-foreground">Enabled on Online Banking</p>
                  </div>
                  <button
                    onClick={() => { setEnableMfaOnBank(!enableMfaOnBank); hackerAudio.playKeypress() }}
                    disabled={simRunning}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      enableMfaOnBank
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    {enableMfaOnBank ? 'MFA Active' : 'MFA Disabled'}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={runStuffingSimulation}
                disabled={simRunning}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {simRunning ? (
                  <>
                    <Radio className="size-4 animate-spin" /> Simulating Automated Bot Attack...
                  </>
                ) : (
                  <>
                    <Play className="size-4" /> Simulate Credential Replay
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cascade Board */}
          <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Radio className="size-4 text-primary animate-pulse" /> Replay Target Cascade
                </h3>
                <p className="text-[11px] text-muted-foreground">Testing leaked combo: <span className="text-destructive font-mono font-bold">victim@mail.com : Pass123!</span></p>
              </div>

              {simFinished && (
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  reusePassword && !enableMfaOnBank
                    ? 'bg-destructive/15 text-destructive border-destructive/30'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                }`}>
                  {reusePassword && !enableMfaOnBank ? 'Accounts Hijacked' : 'Attack Mitigated'}
                </span>
              )}
            </div>

            {/* Target Services */}
            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              {STUFFING_TARGETS.map((target) => {
                const status = simProgress[target.id] || 'pending'
                const isBankMfa = target.id === 'bank' && enableMfaOnBank

                return (
                  <div
                    key={target.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      status === 'breached'
                        ? 'border-destructive/40 bg-destructive/5'
                        : status === 'protected'
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : status === 'testing'
                        ? 'border-primary bg-primary/5 animate-pulse'
                        : 'border-border bg-muted/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground">{target.category}</span>
                        <p className="text-xs font-bold text-foreground mt-0.5">{target.name}</p>
                      </div>

                      {status === 'breached' && <XCircle className="size-5 text-destructive shrink-0" />}
                      {status === 'protected' && <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />}
                      {status === 'testing' && <Radio className="size-4 text-primary animate-spin shrink-0" />}
                      {status === 'pending' && <Lock className="size-4 text-muted-foreground/60 shrink-0" />}
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Status:</span>
                      {status === 'pending' && <span className="text-muted-foreground">Queued</span>}
                      {status === 'testing' && <span className="text-primary font-semibold">Testing credentials...</span>}
                      {status === 'breached' && <span className="text-destructive font-bold">Account Hijacked</span>}
                      {status === 'protected' && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {isBankMfa ? 'Blocked by MFA' : 'Blocked (Unique Password)'}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-foreground space-y-1">
              <p className="font-semibold text-primary flex items-center gap-1.5">
                <ShieldCheck className="size-4" /> The Defensive Takeaway:
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Attackers don&apos;t need to crack complex encryption on high-security services when they can easily steal reused passwords from minor platforms. Unique passwords stored in a password manager prevent cascade compromise completely.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: WEAK PATTERN CATALOG */}
      {subTab === 'antipatterns' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ANTI_PATTERNS.map((pattern) => (
            <div
              key={pattern.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors"
            >
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                  {pattern.badge}
                </span>

                <h3 className="text-sm font-bold text-foreground mt-2">{pattern.title}</h3>
                <p className="text-[11px] text-muted-foreground">{pattern.subtitle}</p>

                <div className="mt-3.5 p-2.5 rounded-xl border border-border bg-muted/30 font-mono text-xs">
                  <span className="text-[10px] text-muted-foreground block">Example:</span>
                  <span className="font-bold text-destructive select-all">{pattern.example}</span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-foreground font-semibold block">Vulnerability:</span>
                    <p className="text-[11px] text-muted-foreground">{pattern.whyWeak}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">Recommended Alternative:</span>
                    <p className="text-[11px] text-foreground font-medium">{pattern.betterAlternative}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  GPU Crack: <strong className="text-destructive font-mono">{pattern.estimatedCrackTime}</strong>
                </span>

                <button
                  onClick={() => {
                    onTestPassword(pattern.example)
                    hackerAudio.playSuccess()
                  }}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold transition-colors"
                >
                  Test <ArrowRight className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODULE 3: PASSPHRASES VS PASSWORDS (DICEWARE) */}
      {subTab === 'diceware' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Short Complex Password */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="size-4" /> Traditional Short Password
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">
                  Poor Usability
                </span>
              </div>

              <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 font-mono text-center">
                <p className="text-xl font-bold text-foreground tracking-wider">Tr0ub4dor&3</p>
                <p className="text-[11px] text-muted-foreground mt-1">11 Chars &middot; Hard to memorize &middot; Frequently forgotten</p>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Calculated Entropy:</span>
                  <span className="font-bold text-destructive font-mono">~38.4 Bits (Weak)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Adversary Rule Attack:</span>
                  <span className="font-bold text-destructive">Cracked in seconds (Rule Table)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Human Memorability:</span>
                  <span className="font-bold text-destructive">Terrible (Written on notes)</span>
                </div>
              </div>
            </div>

            {/* Diceware Passphrase */}
            <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="size-4" /> Modern Diceware Passphrase
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  NIST Recommended
                </span>
              </div>

              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 font-mono text-center">
                <p className="text-lg md:text-xl font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">
                  correct-horse-battery-staple
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">28 Chars &middot; Visual mental imagery &middot; Effortless typing</p>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Calculated Entropy:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">~77.5 Bits (Unbreakable)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Adversary GPU Attack:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Trillions of Years</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Human Memorability:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Instant (Story Association)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Generator */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Sliders className="size-4 text-primary" /> Interactive Diceware Generator
                </h3>
                <p className="text-xs text-muted-foreground">Adjust word count to observe exponential combinatorial security ($7776^N$)</p>
              </div>

              <button
                onClick={handleRegenDiceware}
                className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="size-3.5" /> Roll New Words
              </button>
            </div>

            {/* Generated Display */}
            <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl border border-border bg-muted/20 font-mono">
              <span
                suppressHydrationWarning
                className="flex-1 text-base md:text-lg font-bold text-emerald-600 dark:text-emerald-400 select-all break-all"
              >
                {generatedPassphrase}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyDiceware}
                  className="px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedDiceware ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copiedDiceware ? 'Copied' : 'Copy'}
                </button>

                <button
                  onClick={() => {
                    onTestPassword(generatedPassphrase)
                    hackerAudio.playSuccess()
                  }}
                  className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-semibold transition-colors"
                >
                  Test in Evaluator
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-2">
                  Word Count: <span className="text-foreground font-bold">{dicewareWords} Words</span>
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
                <label className="text-[11px] font-semibold text-muted-foreground block mb-2">
                  Separator:
                </label>
                <div className="flex gap-1.5">
                  {['-', '_', '.', ' '].map((sep) => (
                    <button
                      key={sep}
                      onClick={() => {
                        setDicewareSeparator(sep)
                        const p = generateDicewarePassphrase(dicewareWords, sep, dicewareCapitalize, dicewareNumber)
                        setGeneratedPassphrase(p)
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        dicewareSeparator === sep
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border text-muted-foreground hover:bg-muted'
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

            <div className="grid gap-3 sm:grid-cols-3 pt-2 text-xs">
              <div className="p-3 rounded-xl border border-border bg-muted/20">
                <span className="text-[10px] text-muted-foreground block">Estimated Entropy:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm font-mono">{dicewareEntropyBits} Bits</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-muted/20">
                <span className="text-[10px] text-muted-foreground block">Search Space:</span>
                <span className="font-bold text-foreground text-sm font-mono">7,776^{dicewareWords} Combos</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-muted/20">
                <span className="text-[10px] text-muted-foreground block">GPU Crack Resistance:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">Trillions of Years</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: INTERACTIVE QUIZ */}
      {subTab === 'quiz' && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm max-w-3xl mx-auto space-y-6">
          {!quizFinished ? (
            <div>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Question {currentQuestionIdx + 1} of {QUIZ_QUESTIONS.length}
                  </span>
                  <h3 className="text-base font-bold text-foreground mt-2">
                    {QUIZ_QUESTIONS[currentQuestionIdx].question}
                  </h3>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-muted-foreground">Score</span>
                  <p className="text-base font-bold text-primary font-mono">{scoreCount} / {QUIZ_QUESTIONS.length}</p>
                </div>
              </div>

              {/* Options */}
              <div className="mt-5 space-y-2.5">
                {QUIZ_QUESTIONS[currentQuestionIdx].options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIdx] === optIdx
                  const isCorrect = optIdx === QUIZ_QUESTIONS[currentQuestionIdx].correctIndex

                  let btnCls = 'border-border bg-muted/30 hover:border-primary/50 text-foreground'
                  if (showExplanation) {
                    if (isCorrect) {
                      btnCls = 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold'
                    } else if (isSelected) {
                      btnCls = 'border-destructive bg-destructive/15 text-destructive font-semibold'
                    } else {
                      btnCls = 'opacity-40 border-border'
                    }
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectOption(optIdx)}
                      disabled={showExplanation}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3 ${btnCls}`}
                    >
                      <span className="size-5 rounded-full border border-current flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-relaxed">{option}</span>
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div className="mt-5 p-4 rounded-xl border border-primary/30 bg-muted/40 space-y-2 animate-in fade-in duration-150">
                  <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="size-4" /> Cryptographic Explanation:
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {QUIZ_QUESTIONS[currentQuestionIdx].explanation}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {currentQuestionIdx < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'View Final Score'}
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 space-y-5">
              <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <Award className="size-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground">Quiz Completed!</h3>
                <p className="text-xs text-muted-foreground mt-1">Your cybersecurity knowledge evaluation</p>
              </div>

              <div className="inline-block p-4 rounded-2xl border border-border bg-muted/30">
                <span className="text-xs text-muted-foreground block">Total Score</span>
                <span className="text-3xl font-extrabold text-primary font-mono mt-1 block">
                  {scoreCount} / {QUIZ_QUESTIONS.length}
                </span>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                  {scoreCount === 5 ? '🏆 Security Grandmaster (Grade A+)' : scoreCount >= 3 ? '🛡️ Cybersecurity Defender (Grade B)' : '⚠️ Security Apprentice (Review Recommended)'}
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleResetQuiz}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <RotateCcw className="size-4" /> Retake Security Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODULE 5: NIST STANDARDS */}
      {subTab === 'nist' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> NIST SP 800-63B Standards
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The National Institute of Standards and Technology (NIST) updated federal password guidelines to reflect modern research.
            </p>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="p-3 rounded-xl border border-border bg-muted/20 flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Length Over Complexity</p>
                  <p className="text-[11px] text-muted-foreground">Encourage long passphrases (15+ chars) instead of forcing difficult-to-type arbitrary punctuation.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-muted/20 flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Eliminate Forced Periodic Resets</p>
                  <p className="text-[11px] text-muted-foreground">Arbitrary expiration leads to predictable tweaks (e.g. Pass1 &rarr; Pass2). Only reset upon confirmed breach.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-muted/20 flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Screen Breach Dictionaries</p>
                  <p className="text-[11px] text-muted-foreground">Reject passwords found in known breach datasets (RockYou, HaveIBeenPwned) at registration time.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Sparkles className="size-4 text-sky-500" /> Passkeys & Hardware MFA
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Passwords are shared secrets susceptible to phishing. Asymmetric hardware authentication completely eliminates this vector.
            </p>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="p-3 rounded-xl border border-border bg-muted/20">
                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase block">FIDO2 / WebAuthn Passkeys</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Replaces passwords with biometric/hardware key pairs. Immune to phishing and credential stuffing.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-muted/20">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block">App-Based TOTP / Security Keys</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Use hardware keys (YubiKey) or Authenticator apps instead of vulnerable SMS verification (vulnerable to SIM swap).
                </p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-muted/20">
                <span className="text-[10px] text-primary font-bold uppercase block">Password Managers</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Tools like Bitwarden, 1Password, or KeePass generate and auto-fill unique 20+ char credentials for every service.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
