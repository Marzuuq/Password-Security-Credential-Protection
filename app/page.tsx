'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  CheckCircle2,
  Eye,
  EyeOff,
  Gauge,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Network,
  ShieldCheck,
  Terminal as TerminalIcon,
  Volume2,
  VolumeX,
  Binary,
  Radio,
  Cpu,
  ShieldAlert,
  Zap,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  RotateCw,
  Trash2,
  GraduationCap,
  ArrowRight,
  Flame,
  AlertTriangle,
  Globe,
  Key,
  Code,
  Sun,
  Moon,
  ChevronDown,
  X
} from 'lucide-react'
import {
  analyzePassword,
  generateStrongPassword,
  generateDicewarePassphrase
} from '@/lib/password-security'
import {
  analyzePasswordWithZyla,
  ZylaAnalysisResult,
  getStoredZylaApiKey,
  saveStoredZylaApiKey
} from '@/lib/zyla-api'
import { hackerAudio } from '@/lib/hacker-audio'
import { MatrixBackground } from '@/components/matrix-background'
import { TerminalConsole } from '@/components/terminal-console'
import { EducationAcademy } from '@/components/education-academy'
import { ZeroStorageModal } from '@/components/zero-storage-modal'

type Tab = 'overview' | 'checker' | 'academy' | 'terminal' | 'policies'
type ThemeOption = 'dark' | 'light'
type GeneratorMode = 'csprng' | 'diceware'

const rules = [
  { label: 'Minimum 12 characters length (16+ recommended)', status: 'Enforced' },
  { label: 'Mixed uppercase & lowercase letter casing', status: 'Enforced' },
  { label: 'At least one numeric digit (0-9)', status: 'Enforced' },
  { label: 'Special symbol required (!@#$%^&*)', status: 'Enforced' },
  { label: 'Screen against known breach dictionaries (RockYou / HIBP)', status: 'Active' },
  { label: 'Shannon Entropy threshold >= 60 bits', status: 'Active' }
]

const metrics = [
  { label: 'Evaluations Run', value: '18,420', subtext: '+14.6% this month', icon: Activity },
  { label: 'Credential Replays Mitigated', value: '4,892', subtext: '+22.4% this month', icon: ShieldCheck },
  { label: 'Avg Entropy Score', value: '76.8 bits', subtext: 'Optimal cryptographic defense', icon: Cpu },
  { label: 'Zero-Storage Guarantee', value: '100% RAM', subtext: 'Zero network transmissions', icon: Zap }
]

const tabBanners: Record<Tab, { category: string; title: string; subtitle: string; description: string }> = {
  overview: {
    category: 'Security Telemetry & Threat Analysis',
    title: 'Cyber Threat & Telemetry Matrix',
    subtitle: 'Credential Replay Defense & Audit Telemetry',
    description: 'Monitor baseline metrics, simulate credential stuffing replay cascades, review weak pattern vulnerabilities, and verify digital identity compliance.'
  },
  checker: {
    category: 'Cryptographic Strength & Security Hub',
    title: 'Zero-Knowledge Password Evaluator',
    subtitle: 'Shannon Entropy &middot; GPU Crack Resistance &middot; Breach Detection',
    description: 'Measure mathematical entropy (E = L \u00D7 log\u2082 N), detect leetspeak & dictionary patterns, and generate NIST-recommended Diceware passphrases in complete browser privacy.'
  },
  academy: {
    category: 'Cybersecurity Education & Training',
    title: 'Defensive Security Academy',
    subtitle: 'Interactive Labs &middot; Pattern Encyclopedia &middot; NIST SP 800-63B',
    description: 'Master credential stuffing defense, explore the exponential mathematics of multi-word Diceware passphrases, and test your password hygiene with interactive quizzes.'
  },
  terminal: {
    category: 'Developer Shell & Command Matrix',
    title: 'Interactive Security Shell',
    subtitle: 'Command Console &middot; Cryptographic Tools &middot; Live API Inspector',
    description: 'Execute in-memory shell commands, inspect hash digests, and test password parameters via a fast, interactive developer terminal.'
  },
  policies: {
    category: 'Identity Compliance & Standards',
    title: 'Enterprise Baseline Security Policies',
    subtitle: 'NIST SP 800-63B Aligned &middot; Modern Identity Governance',
    description: 'Review system-wide credential policies, verify entropy thresholds, examine character distribution guidelines, and enforce zero-leakage security postures.'
  }
}

export default function Page() {
  const [tab, setTab] = useState<Tab>('checker')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [mobile, setMobile] = useState(false)

  // Zero-Storage Privacy Modal State
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [memoryWipedFeedback, setMemoryWipedFeedback] = useState(false)

  // Theme & Audio Controls
  const [theme, setTheme] = useState<ThemeOption>('dark')
  const [matrixEnabled, setMatrixEnabled] = useState(true)
  const [isAudioMuted, setIsAudioMuted] = useState(false)

  // Password Generator State
  const [generatorMode, setGeneratorMode] = useState<GeneratorMode>('csprng')
  const [csprngLength, setCsprngLength] = useState(16)
  const [dicewareWords, setDicewareWords] = useState(4)
  const [generatedPassword, setGeneratedPassword] = useState(() =>
    generateStrongPassword(16)
  )
  const [copied, setCopied] = useState(false)

  // Zyla Labs API Integration State
  const [zylaResult, setZylaResult] = useState<ZylaAnalysisResult | null>(null)
  const [isZylaLoading, setIsZylaLoading] = useState(false)
  const [zylaApiKey, setZylaApiKey] = useState('')
  const [showZylaConfig, setShowZylaConfig] = useState(false)
  const [showApiTelemetry, setShowApiTelemetry] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)

  useEffect(() => {
    setZylaApiKey(getStoredZylaApiKey())
  }, [])

  // Password Analysis Memo
  const analysis = useMemo(() => analyzePassword(password), [password])

  const handleCopyGenerated = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generatedPassword)
    }
    setCopied(true)
    hackerAudio.playSuccess()
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegeneratePassword = () => {
    hackerAudio.playScan()
    if (generatorMode === 'csprng') {
      setGeneratedPassword(generateStrongPassword(csprngLength))
    } else {
      setGeneratedPassword(generateDicewarePassphrase(dicewareWords, '-', false, false))
    }
  }

  const handleApplyGenerated = (pwdToApply?: string) => {
    const target = pwdToApply || generatedPassword
    setPassword(target)
    hackerAudio.playSuccess()
    setTab('checker')
  }

  const handleSanitizeMemory = () => {
    setPassword('')
    setZylaResult(null)
    setMemoryWipedFeedback(true)
    hackerAudio.playSuccess()
    setTimeout(() => setMemoryWipedFeedback(false), 2500)
  }

  const handleQueryZyla = async (pwdToQuery?: string) => {
    const target = pwdToQuery ?? password
    if (!target) return
    hackerAudio.playScan()
    setIsZylaLoading(true)
    try {
      const res = await analyzePasswordWithZyla(target, zylaApiKey)
      setZylaResult(res)
      if (res.success) {
        hackerAudio.playSuccess()
      } else {
        hackerAudio.playAlert()
      }
    } catch {
      hackerAudio.playAlert()
    } finally {
      setIsZylaLoading(false)
    }
  }

  const handleSaveZylaKey = (key: string) => {
    setZylaApiKey(key)
    saveStoredZylaApiKey(key)
    hackerAudio.playSuccess()
    setShowZylaConfig(false)
  }

  const handleCopyZylaJson = () => {
    if (!zylaResult) return
    navigator.clipboard.writeText(JSON.stringify(zylaResult, null, 2))
    setCopiedJson(true)
    hackerAudio.playSuccess()
    setTimeout(() => setCopiedJson(false), 2000)
  }

  const handleTabChange = (nextTab: Tab) => {
    hackerAudio.playKeypress()
    setTab(nextTab)
    setMobile(false)
  }

  const toggleSound = () => {
    const muted = !hackerAudio.toggleMute()
    setIsAudioMuted(muted)
  }

  const nav = [
    ['checker', 'Password Evaluator', KeyRound],
    ['overview', 'Threat Matrix', LayoutDashboard],
    ['academy', 'Security Academy', GraduationCap],
    ['terminal', 'Security Shell', TerminalIcon],
    ['policies', 'Policy & Standards', Network]
  ] as const

  return (
    <main className="min-h-screen bg-background text-foreground" data-theme={theme}>
      {/* Matrix Ambient Digital Rain Background */}
      <MatrixBackground theme={theme} active={matrixEnabled} />

      {/* Zero-Storage Privacy Proof Modal */}
      <ZeroStorageModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onSanitizeMemory={handleSanitizeMemory}
      />

      <div className="flex min-h-screen relative z-10">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            mobile ? 'flex' : 'hidden'
          } fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-border bg-card/95 backdrop-blur-xl p-5 lg:static lg:flex shadow-xl lg:shadow-none`}
        >
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <LockKeyhole className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-base tracking-tight text-foreground">Passguard</p>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                    v3.8
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">Security & Identity Console</p>
              </div>
            </div>

            <button
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted lg:hidden"
              onClick={() => setMobile(false)}
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="mt-8 flex flex-col gap-1.5">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Modules
            </p>
            {nav.map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition-all ${
                  tab === id
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span>{label}</span>
                {id === 'academy' && (
                  <span className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    tab === id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                  }`}>
                    Labs
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Theme & Canvas Preferences */}
          <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" /> Appearance
              </span>
              <span className="text-[11px] capitalize text-muted-foreground">{theme} Mode</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setTheme('dark'); hackerAudio.playKeypress() }}
                className={`px-3 py-2 text-xs rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  theme === 'dark'
                    ? 'bg-card border-primary/50 text-foreground font-semibold shadow-sm'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <Moon className="size-3.5" /> Dark
              </button>
              <button
                onClick={() => { setTheme('light'); hackerAudio.playKeypress() }}
                className={`px-3 py-2 text-xs rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  theme === 'light'
                    ? 'bg-card border-primary/50 text-foreground font-semibold shadow-sm'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <Sun className="size-3.5 text-amber-500" /> Light
              </button>
            </div>

            <div className="pt-2 border-t border-border/60">
              <button
                onClick={() => setMatrixEnabled(!matrixEnabled)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl border transition-all ${
                  matrixEnabled
                    ? 'border-primary/40 bg-primary/10 text-primary font-semibold'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Binary className="size-3.5" /> Ambient Matrix Rain
                </span>
                <span className="text-[10px] font-bold">{matrixEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Privacy Proof Card */}
          <div className="mt-auto rounded-2xl border border-border bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <ShieldCheck className="size-4 text-emerald-500" /> Zero-Storage
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                100% RAM
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Evaluated strictly in browser RAM. Zero outbound data leaks.
            </p>
            <button
              onClick={() => { setIsPrivacyModalOpen(true); hackerAudio.playKeypress() }}
              className="w-full mt-1 text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1 pt-1.5 border-t border-border/50"
            >
              Verify Privacy Proof <ArrowRight className="size-3" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="min-w-0 flex-1 flex flex-col">
          {/* Header Bar */}
          <header className="flex h-16 items-center justify-between border-b border-border px-5 md:px-8 bg-card/70 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                className="p-2 -ml-2 text-muted-foreground hover:text-foreground lg:hidden"
                onClick={() => setMobile(true)}
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                    Passguard Security Console
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark')
                  hackerAudio.playKeypress()
                }}
                className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-primary" />}
              </button>

              {/* Sound Synth Toggle */}
              <button
                onClick={toggleSound}
                className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
                title={isAudioMuted ? 'Unmute audio effects' : 'Mute audio effects'}
              >
                {isAudioMuted ? <VolumeX className="size-4 text-muted-foreground" /> : <Volume2 className="size-4 text-primary" />}
              </button>

              {/* Zero-Storage Badge Trigger */}
              <button
                onClick={() => { setIsPrivacyModalOpen(true); hackerAudio.playKeypress() }}
                className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-card hover:bg-muted px-3 py-1.5 text-xs text-foreground font-medium transition-colors"
              >
                <span className="size-2 rounded-full bg-emerald-500" />
                <span>Client RAM Sandbox</span>
              </button>
            </div>
          </header>

          {/* Main Scrollable Canvas */}
          <div className="mx-auto max-w-6xl w-full p-5 md:p-8 flex-1">
            {/* Banner Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Zap className="size-3.5" /> {tabBanners[tab].category}
              </div>
              <h1 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {tabBanners[tab].title}
              </h1>
              <p className="text-muted-foreground text-sm font-medium mt-1">
                {tabBanners[tab].subtitle}
              </p>
              <p className="mt-2 max-w-3xl text-xs md:text-sm leading-relaxed text-muted-foreground">
                {tabBanners[tab].description}
              </p>
            </div>

            {/* TAB 1: OVERVIEW & THREAT MATRIX */}
            {tab === 'overview' && (
              <div className="space-y-6">
                {/* Metric Cards Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {metrics.map(({ label, value, subtext, icon: Icon }) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium">{label}</span>
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <Icon className="size-4" />
                        </div>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-foreground font-mono">{value}</p>
                      <p className="mt-1 text-xs text-primary font-medium">{subtext}</p>
                    </div>
                  ))}
                </div>

                {/* Defense Posture & Threats Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Defense Posture Gauge */}
                  <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                          <Cpu className="size-4 text-primary" /> Overall Defense Posture
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Composite telemetry aligned with NIST SP 800-63B</p>
                      </div>
                      <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                        Grade A+
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-8 justify-center py-4">
                      <div className="relative flex size-36 flex-col items-center justify-center rounded-full border-[10px] border-primary/20 border-t-primary shadow-sm">
                        <span className="text-3xl font-bold text-foreground font-mono">96</span>
                        <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">Out of 100</span>
                      </div>

                      <div className="flex flex-col gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="size-2.5 rounded-full bg-primary shrink-0" />
                          <span className="text-foreground font-semibold">82% High Entropy</span>
                          <span className="text-muted-foreground">(Entropy &gt; 65 bits)</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="size-2.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="text-foreground font-semibold">14% Moderate</span>
                          <span className="text-muted-foreground">(Needs length / symbols)</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="size-2.5 rounded-full bg-rose-500 shrink-0" />
                          <span className="text-foreground font-semibold">4% Breached / Reused</span>
                          <span className="text-muted-foreground">(Known leak dump)</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex justify-between items-center text-xs">
                      <button
                        onClick={() => handleTabChange('checker')}
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        Launch Evaluator <ArrowRight className="size-3.5" />
                      </button>

                      <button
                        onClick={() => handleTabChange('academy')}
                        className="text-muted-foreground hover:text-primary transition-colors font-medium"
                      >
                        Defensive Academy &rarr;
                      </button>
                    </div>
                  </section>

                  {/* Threat Vectors */}
                  <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div>
                      <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                        <ShieldAlert className="size-4 text-destructive" /> Top Vulnerability Vectors
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Primary failure modes identified in compromised accounts</p>
                    </div>

                    <div className="space-y-3 pt-1 text-xs">
                      <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-start gap-3">
                        <Flame className="size-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Password Reuse & Credential Stuffing</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            Over 80% of data breaches stem from stolen passwords re-used across unrelated services.
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-start gap-3">
                        <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Predictable Leetspeak & Year Suffixes</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            Adversaries use rule engines (Hashcat) to reverse strings like &quot;P@ssw0rd2024!&quot; in milliseconds.
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-start gap-3">
                        <KeyRound className="size-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Diceware Passphrase Defense</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            4 random words provide 77+ bits of true information entropy with effortless human memorability.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* TAB 2: PASSWORD CHECKER (CLEAN, MODERN, ELEGANT HERO) */}
            {tab === 'checker' && (
              <section className="max-w-3xl mx-auto space-y-6">
                {/* Main Evaluator Card */}
                <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                        <KeyRound className="size-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg text-foreground">Password Strength Evaluator</h2>
                        <p className="text-xs text-muted-foreground">100% Client-Side RAM Sandbox &middot; Zero Network Storage</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowZylaConfig(!showZylaConfig)
                          hackerAudio.playKeypress()
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          zylaApiKey
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                        title="Configure Zyla Labs API Key"
                      >
                        <Key className="size-3" />
                        <span>{zylaApiKey ? 'API Key Set' : 'Configure API Key'}</span>
                      </button>

                      {password && (
                        <button
                          onClick={handleSanitizeMemory}
                          className="px-3 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="size-3.5" /> Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Zyla API Drawer */}
                  {showZylaConfig && (
                    <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-2.5 text-xs animate-in fade-in duration-150">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <Key className="size-3.5 text-primary" /> Optional Zyla Labs API Key
                        </span>
                        <span className="text-[11px] text-muted-foreground">Stored only in local storage</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={zylaApiKey}
                          onChange={(e) => setZylaApiKey(e.target.value)}
                          placeholder="Paste your Zyla API key..."
                          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground font-mono"
                        />
                        <button
                          onClick={() => handleSaveZylaKey(zylaApiKey)}
                          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Password Input Field */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label htmlFor="password-input" className="font-semibold text-foreground">
                        Enter password to evaluate:
                      </label>
                      <span className="text-muted-foreground font-mono">{analysis.length} characters</span>
                    </div>

                    <div className="flex items-center rounded-2xl border-2 border-border bg-background/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all p-1">
                      <input
                        id="password-input"
                        type={visible ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (zylaResult) setZylaResult(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleQueryZyla()
                        }}
                        className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-base outline-none text-foreground placeholder:text-muted-foreground/40"
                        placeholder="Type or paste any password..."
                        autoComplete="off"
                        spellCheck={false}
                        autoFocus
                      />

                      <button
                        className="p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setVisible(!visible)}
                        aria-label={visible ? 'Hide password' : 'Show password'}
                      >
                        {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>

                      <button
                        onClick={() => handleQueryZyla()}
                        disabled={!password || isZylaLoading}
                        className="px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:pointer-events-none mr-1"
                        title="Query Zyla Labs API"
                      >
                        {isZylaLoading ? (
                          <RotateCw className="size-3.5 animate-spin text-primary" />
                        ) : (
                          <Globe className="size-3.5 text-primary" />
                        )}
                        <span className="hidden sm:inline">{isZylaLoading ? 'Checking...' : 'Zyla API'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Score & Strength Bar */}
                  <div className="space-y-3 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold" style={{ color: analysis.toneColor }}>
                          {analysis.rating}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full border border-border bg-muted/60 text-foreground font-semibold font-mono">
                          Score: {analysis.strengthScore} / 100
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>Entropy: <strong className="text-primary font-mono">{analysis.entropyBits} bits</strong></span>
                        <span>&middot;</span>
                        <span>Crack Time: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{analysis.crackTimes.offlineGpu}</strong></span>
                      </div>
                    </div>

                    {/* Modern Strength Progress Bar */}
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-300 ease-out"
                        style={{
                          width: `${Math.max(4, analysis.strengthScore)}%`,
                          backgroundColor: analysis.toneColor
                        }}
                      />
                    </div>
                  </div>

                  {/* 4-Column Stat Highlights */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">GPU Crack Time</span>
                      <span className="font-bold text-foreground text-sm truncate block mt-0.5 font-mono">{analysis.crackTimes.offlineGpu}</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Shannon Entropy</span>
                      <span className="font-bold text-primary text-sm truncate block mt-0.5 font-mono">{analysis.entropyBits} bits</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Pool Size</span>
                      <span className="font-bold text-foreground text-sm truncate block mt-0.5 font-mono">{analysis.poolSize} chars</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Zyla Cloud API</span>
                      <span className="font-bold text-foreground text-sm truncate block mt-0.5 capitalize">
                        {zylaResult?.data?.result ? `"${zylaResult.data.result}"` : isZylaLoading ? 'Checking...' : 'Ready'}
                      </span>
                    </div>
                  </div>

                  {/* Requirements & Checks */}
                  <div className="grid sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition-colors ${
                      analysis.checks.min12 ? 'border-emerald-500/30 bg-emerald-500/5 text-foreground' : 'border-border bg-muted/10 text-muted-foreground'
                    }`}>
                      <CheckCircle2 className={`size-4 shrink-0 ${analysis.checks.min12 ? 'text-emerald-500' : 'text-muted-foreground/40'}`} />
                      <span>At least 12 characters (16+ recommended)</span>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition-colors ${
                      analysis.checks.casing ? 'border-emerald-500/30 bg-emerald-500/5 text-foreground' : 'border-border bg-muted/10 text-muted-foreground'
                    }`}>
                      <CheckCircle2 className={`size-4 shrink-0 ${analysis.checks.casing ? 'text-emerald-500' : 'text-muted-foreground/40'}`} />
                      <span>Mixed uppercase & lowercase letters</span>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition-colors ${
                      analysis.checks.hasNumber && analysis.checks.hasSymbol ? 'border-emerald-500/30 bg-emerald-500/5 text-foreground' : 'border-border bg-muted/10 text-muted-foreground'
                    }`}>
                      <CheckCircle2 className={`size-4 shrink-0 ${analysis.checks.hasNumber && analysis.checks.hasSymbol ? 'text-emerald-500' : 'text-muted-foreground/40'}`} />
                      <span>Contains numbers and symbols</span>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition-colors ${
                      analysis.checks.noCommonPattern ? 'border-emerald-500/30 bg-emerald-500/5 text-foreground' : 'border-destructive/30 bg-destructive/5 text-destructive font-semibold'
                    }`}>
                      {analysis.checks.noCommonPattern ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="size-4 shrink-0 text-destructive" />
                      )}
                      <span>{analysis.checks.noCommonPattern ? 'No dictionary / breach patterns' : 'Weak pattern detected'}</span>
                    </div>
                  </div>

                  {/* Anti-Pattern Alert */}
                  {analysis.patternsDetected.length > 0 && (
                    <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-xs space-y-1">
                      <p className="font-semibold text-destructive flex items-center gap-1.5">
                        <AlertTriangle className="size-4" /> Detected Anti-Patterns:
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {analysis.patternsDetected.map(p => p.name).join(' &middot; ')}
                      </p>
                    </div>
                  )}

                  {/* Built-in Generator */}
                  <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-primary" /> Generate Secure Password
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setGeneratorMode('diceware')
                            setGeneratedPassword(generateDicewarePassphrase(4, '-', false, false))
                            hackerAudio.playKeypress()
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            generatorMode === 'diceware' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          Passphrase
                        </button>
                        <button
                          onClick={() => {
                            setGeneratorMode('csprng')
                            setGeneratedPassword(generateStrongPassword(16))
                            hackerAudio.playKeypress()
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            generatorMode === 'csprng' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          Random
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-background font-mono text-xs">
                      <span className="flex-1 text-emerald-600 dark:text-emerald-400 font-bold select-all tracking-wide truncate">
                        {generatedPassword}
                      </span>
                      <button
                        onClick={handleRegeneratePassword}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Generate new"
                      >
                        <RefreshCw className="size-3.5" />
                      </button>
                      <button
                        onClick={handleCopyGenerated}
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={() => handleApplyGenerated()}
                        className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-semibold transition-colors"
                      >
                        Test
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Cryptographic Details */}
                  <div className="pt-2 border-t border-border/60">
                    <button
                      onClick={() => {
                        setShowApiTelemetry(!showApiTelemetry)
                        hackerAudio.playKeypress()
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors font-medium"
                    >
                      <Code className="size-3.5 text-primary" />
                      <span>{showApiTelemetry ? 'Hide Hashes & Telemetry' : 'Show Advanced Cryptographic Details (Hashes, API Inspector)'}</span>
                    </button>

                    {showApiTelemetry && (
                      <div className="mt-3 p-4 rounded-xl border border-border bg-muted/30 space-y-3 text-xs animate-in fade-in duration-150">
                        <div className="grid sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">SHA-256 Digest</span>
                            <span className="text-foreground font-mono select-all break-all text-xs">{analysis.hashSimulations.sha256}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">SHA-1 (K-Anonymity Prefix)</span>
                            <span className="text-sky-600 dark:text-sky-400 font-mono select-all break-all text-xs">{analysis.hashSimulations.sha1}</span>
                          </div>
                        </div>

                        {zylaResult && (
                          <div className="p-3 rounded-xl bg-background border border-border space-y-2">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-semibold text-foreground">Zyla API Response Payload:</span>
                              <button onClick={handleCopyZylaJson} className="text-primary hover:underline flex items-center gap-1">
                                {copiedJson ? 'Copied' : 'Copy JSON'}
                              </button>
                            </div>
                            <pre className="text-emerald-600 dark:text-emerald-400 font-mono overflow-x-auto text-[11px] p-2 rounded bg-muted/40 max-h-32">
                              {JSON.stringify(zylaResult.data || zylaResult, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* TAB 3: EDUCATION ACADEMY */}
            {tab === 'academy' && (
              <section>
                <EducationAcademy onTestPassword={handleApplyGenerated} />
              </section>
            )}

            {/* TAB 4: DEVELOPER SHELL TERMINAL */}
            {tab === 'terminal' && (
              <section className="max-w-4xl mx-auto">
                <TerminalConsole onThemeChange={setTheme} currentTheme={theme} />
              </section>
            )}

            {/* TAB 5: POLICY & STANDARDS */}
            {tab === 'policies' && (
              <section className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3.5 border-b border-border pb-5">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Gauge className="size-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">Enterprise Policy & Compliance Engine</h2>
                    <p className="text-xs text-muted-foreground">Digital identity security standards aligned with NIST SP 800-63B</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {rules.map((rule) => (
                    <div key={rule.label} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-semibold text-foreground">{rule.label}</span>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                        {rule.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 text-xs text-foreground space-y-1.5">
                  <p className="font-semibold text-primary flex items-center gap-2">
                    <ShieldCheck className="size-4" /> Modern Identity Governance:
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Legacy password policies that force frequent periodic resets inadvertently encourage employees to create weak predictable variations (e.g. Spring2023! &rarr; Summer2023!). Modern NIST SP 800-63B guidance mandates minimum 15+ character lengths, breach database screening, and Passkey / MFA adoption instead.
                  </p>
                </div>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
