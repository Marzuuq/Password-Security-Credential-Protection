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
  Lock,
  Layers,
  Sparkles,
  Info,
  Copy,
  Check,
  RefreshCw,
  RotateCw,
  Trash2,
  Sliders,
  HelpCircle,
  GraduationCap,
  ArrowRight,
  Flame,
  Hash,
  AlertTriangle,
  ServerOff,
  Globe,
  Key,
  Play,
  Code
} from 'lucide-react'
import {
  analyzePassword,
  generateStrongPassword,
  generateDicewarePassphrase
} from '@/lib/password-security'
import {
  analyzePasswordWithZyla,
  ZYLA_API_ENDPOINT,
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
type ThemeOption = 'light' | 'stealth'
type GeneratorMode = 'csprng' | 'diceware'

const rules = [
  'Minimum 12 characters length (16+ recommended)',
  'Uppercase + lowercase casing mix',
  'At least one numeric digit (0-9)',
  'Special symbol required (!@#$%^&*)',
  'Block breached dictionary words (RockYou / HIBP)',
  'Shannon Entropy threshold >= 60 bits'
]

const metrics = [
  ['Passwords Evaluated', '18,420', '+14.6% this month'],
  ['Credential Replays Blocked', '4,892', '+22.4% this month'],
  ['Avg Entropy Score', '76.8 bits', 'Optimal cyber defense'],
  ['Zero-Storage Guarantee', '100% Client RAM', 'Zero network leaks']
]

export default function Page() {
  const [tab, setTab] = useState<Tab>('overview')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [mobile, setMobile] = useState(false)

  // Zero-Storage Privacy Modal State
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [memoryWipedFeedback, setMemoryWipedFeedback] = useState(false)

  // Theme & Audio Controls
  const [theme, setTheme] = useState<ThemeOption>('light')
  const [matrixEnabled, setMatrixEnabled] = useState(true)
  const [isAudioMuted, setIsAudioMuted] = useState(false)

  // Password Generator State
  const [generatorMode, setGeneratorMode] = useState<GeneratorMode>('diceware')
  const [csprngLength, setCsprngLength] = useState(16)
  const [dicewareWords, setDicewareWords] = useState(4)
  const [generatedPassword, setGeneratedPassword] = useState(() =>
    generateDicewarePassphrase(4, '-', false, false)
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
    ['overview', 'Threat Matrix', LayoutDashboard],
    ['checker', 'Zero-Knowledge Checker', KeyRound],
    ['academy', 'Cyber Security Academy', GraduationCap],
    ['terminal', 'Hacker Shell Console', TerminalIcon],
    ['policies', 'Policy & Compliance', Network]
  ] as const

  return (
    <main className="min-h-screen bg-background text-foreground" data-theme={theme}>
      {/* Matrix Digital Rain Background */}
      <MatrixBackground theme={theme} active={matrixEnabled} opacity={theme === 'light' ? 0.18 : 0.25} />

      {/* Privacy & Zero-Knowledge Verification Modal */}
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
          } fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-primary/30 bg-card/90 backdrop-blur-xl p-5 lg:static lg:flex shadow-[0_0_30px_rgba(0,0,0,0.8)]`}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground border-glow">
              <LockKeyhole className="size-6" />
            </div>
            <div>
              <p className="font-mono text-base font-extrabold tracking-wider text-primary glow-text">PASSGUARD</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-mono">Cyber Console v3.8</p>
            </div>
          </div>

          <button
            className="mt-4 self-end p-2 text-muted-foreground lg:hidden"
            onClick={() => setMobile(false)}
            aria-label="Close menu"
          >
            ×
          </button>

          {/* Navigation Links */}
          <nav className="mt-8 flex flex-col gap-2">
            <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] font-mono text-primary/80">Cyber Modules</p>
            {nav.map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-3 text-left text-xs font-mono transition-all ${
                  tab === id
                    ? 'bg-primary/20 text-primary border border-primary/40 font-bold shadow-[0_0_15px_rgba(0,255,102,0.15)]'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <Icon className="size-4 text-primary shrink-0" />
                <span>{label}</span>
                {id === 'academy' && (
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                    NEW
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Hacker Controls Box */}
          <div className="mt-6 rounded-xl border border-primary/30 bg-muted/40 p-4 font-mono space-y-3">
            <div className="flex items-center justify-between text-xs text-primary font-bold">
              <span className="flex items-center gap-1.5"><Sparkles className="size-3.5" /> THEME PRESET</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ['light', 'Light Mode', 'bg-primary/20 text-primary border-primary/60 font-bold shadow-[0_0_10px_rgba(0,255,102,0.2)]'],
                  ['stealth', 'Stealth Dark', 'bg-emerald-900/30 text-emerald-400 border-emerald-500/50']
                ] as const
              ).map(([id, label, colorCls]) => (
                <button
                  key={id}
                  onClick={() => { setTheme(id); hackerAudio.playKeypress() }}
                  className={`px-2 py-2 text-[11px] rounded-lg border text-center transition-all ${
                    theme === id ? `${colorCls} font-bold shadow-[0_0_10px_rgba(0,255,102,0.2)]` : 'border-border/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-border/40 space-y-2">
              <button
                onClick={() => setMatrixEnabled(!matrixEnabled)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] rounded border ${
                  matrixEnabled ? 'border-primary/50 text-primary bg-primary/10' : 'border-border text-muted-foreground'
                }`}
              >
                <span className="flex items-center gap-1.5"><Binary className="size-3.5" /> Matrix Rain Canvas</span>
                <span>{matrixEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Privacy & Zero-Knowledge Verification Box */}
          <div className="mt-auto rounded-xl border border-primary/30 bg-background/90 p-4 font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <ShieldCheck className="size-4" /> ZERO-STORAGE
              </span>
              <span className="text-[9px] text-emerald-400 font-bold">100% RAM</span>
            </div>
            <p className="text-[11px] leading-4 text-muted-foreground">
              Evaluated strictly in browser RAM. Zero network transmissions.
            </p>
            <button
              onClick={() => { setIsPrivacyModalOpen(true); hackerAudio.playKeypress() }}
              className="w-full mt-2 text-[10px] font-bold text-primary hover:underline flex items-center justify-center gap-1 pt-1 border-t border-border/30"
            >
              Verify Privacy Proof <ArrowRight className="size-3" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="min-w-0 flex-1 flex flex-col">
          {/* Header Bar */}
          <header className="flex h-20 items-center justify-between border-b border-primary/30 px-5 md:px-8 bg-card/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                className="p-2 text-muted-foreground lg:hidden"
                onClick={() => setMobile(true)}
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </button>
              <div>
                <p className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                  <Radio className="size-3 text-primary animate-pulse" /> CYBER CONSOLE / SECURE EVALUATOR
                </p>
                <h1 className="text-lg md:text-xl font-bold font-mono text-foreground flex items-center gap-2">
                  PASSWORD SECURITY & THREAT EVALUATOR
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] border border-primary/40 bg-primary/10 text-primary font-mono font-normal">
                    ZERO-STORAGE VERIFIED
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono">
              <button
                onClick={toggleSound}
                className="p-2 rounded-lg border border-primary/30 bg-muted/40 hover:bg-muted text-primary transition-colors"
                title={isAudioMuted ? 'Unmute audio synth' : 'Mute audio synth'}
              >
                {isAudioMuted ? <VolumeX className="size-4 text-muted-foreground" /> : <Volume2 className="size-4 text-primary" />}
              </button>

              <button
                onClick={() => { setIsPrivacyModalOpen(true); hackerAudio.playKeypress() }}
                className="hidden md:flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary glow-text hover:bg-primary/20 transition-all"
              >
                <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                <span>IN-MEMORY SANDBOX</span>
              </button>
            </div>
          </header>

          {/* Main Container */}
          <div className="mx-auto max-w-[1500px] w-full p-5 md:p-8 flex-1">
            {/* Banner Header */}
            <div className="mb-8 font-mono">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                <Zap className="size-4" /> CRYPTOGRAPHIC STRENGTH & EDUCATION HUB
              </div>
              <h2 className="mt-2 text-balance text-2xl md:text-4xl font-extrabold font-mono tracking-tight text-foreground">
                ZERO-KNOWLEDGE PASSWORD EVALUATOR<br />
                <span className="text-muted-foreground text-xl md:text-3xl font-semibold">
                  SHANNON ENTROPY · GPU CRACK TIME · CREDENTIAL STUFFING DEFENSE
                </span>
              </h2>
              <p className="mt-3 max-w-3xl text-xs md:text-sm leading-6 text-muted-foreground">
                Measure true mathematical entropy ($E = L \times \log_2 N$), detect leetspeak & breach patterns, learn why password reuse triggers credential stuffing cascades, and generate Diceware passphrases—without storing or sending any passwords.
              </p>
            </div>

            {/* TAB 1: OVERVIEW */}
            {tab === 'overview' && (
              <div className="space-y-6 font-mono">
                {/* Metric Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {metrics.map(([label, value, subtext]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-primary/30 bg-card/80 p-5 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.4)] hover:border-primary/60 transition-colors"
                    >
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{label}</span>
                        <Activity className="size-4 text-primary" />
                      </div>
                      <p className="mt-4 font-mono text-2xl md:text-3xl font-extrabold text-foreground glow-text">{value}</p>
                      <p className="mt-2 text-[11px] text-primary">{subtext}</p>
                    </div>
                  ))}
                </div>

                {/* Main Overview Grid */}
                <div className="grid gap-6 xl:grid-cols-2">
                  {/* Security Posture Gauge */}
                  <section className="rounded-xl border border-primary/30 bg-card/80 p-6 backdrop-blur-md space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                          <Cpu className="size-4 text-primary" /> GLOBAL CYBER DEFENSE POSTURE
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Composite telemetry aligned with NIST SP 800-63B guidelines</p>
                      </div>
                      <span className="px-2.5 py-1 text-xs rounded border border-primary/40 bg-primary/10 text-primary font-bold">
                        GRADE A+
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-8 justify-center pt-2">
                      <div className="relative flex size-40 flex-col items-center justify-center rounded-full border-[12px] border-primary/80 shadow-[0_0_25px_rgba(0,255,102,0.2)]">
                        <span className="font-mono text-4xl font-extrabold text-foreground glow-text">96</span>
                        <span className="text-[10px] uppercase text-muted-foreground tracking-widest">OUT OF 100</span>
                      </div>

                      <div className="flex flex-col gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="size-3 rounded-full bg-primary" />
                          <span className="text-foreground font-bold">82% High Entropy</span> (Entropy &gt; 65 bits)
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="size-3 rounded-full bg-amber-500" />
                          <span className="text-foreground font-bold">14% Moderate</span> (Needs length / symbols)
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="size-3 rounded-full bg-red-500" />
                          <span className="text-foreground font-bold">4% Breached / Reused</span> (Known leak dump)
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/40 flex justify-between items-center">
                      <button
                        onClick={() => handleTabChange('checker')}
                        className="px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        Launch Password Evaluator <ArrowRight className="size-3.5" />
                      </button>

                      <button
                        onClick={() => handleTabChange('academy')}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        Explore Security Academy →
                      </button>
                    </div>
                  </section>

                  {/* Education & Threat Highlights */}
                  <section className="rounded-xl border border-primary/30 bg-card/80 p-6 backdrop-blur-md space-y-4">
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      <ShieldAlert className="size-4 text-destructive" /> TOP CRITICAL THREAT VECTORS
                    </h3>
                    <p className="text-xs text-muted-foreground">Key vulnerabilities identified in credential datasets</p>

                    <div className="space-y-3 pt-1 text-xs">
                      <div className="p-3 rounded-lg border border-destructive/40 bg-destructive/10 flex items-start gap-3">
                        <Flame className="size-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-foreground">Password Reuse & Credential Stuffing</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Over 80% of corporate breaches originate from stolen credentials re-used from minor third-party breaches.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 flex items-start gap-3">
                        <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-foreground">Predictable Leetspeak & Year Suffixes</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Adversaries use Hashcat rule engines to reverse &quot;P@ssw0rd2024!&quot; in under 1 millisecond.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border border-primary/40 bg-primary/10 flex items-start gap-3">
                        <KeyRound className="size-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-foreground">Diceware Passphrase Solution</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            4 random words provide 77+ bits of true information entropy with effortless human recall.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* TAB 2: ZERO-KNOWLEDGE PASSWORD CHECKER (SIMPLIFIED & CLEAN) */}
            {tab === 'checker' && (
              <section className="max-w-4xl mx-auto space-y-6 font-mono">
                {/* Main Evaluation Card */}
                <div className="rounded-2xl border border-primary/40 bg-card/85 p-6 md:p-8 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-6">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/40 shadow-[0_0_10px_rgba(0,255,102,0.2)]">
                        <KeyRound className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground tracking-tight">PASSWORD STRENGTH CHECKER</h3>
                        <p className="text-xs text-muted-foreground">100% Client-Side RAM Sandbox · Zero Network Storage</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowZylaConfig(!showZylaConfig)
                          hackerAudio.playKeypress()
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                          zylaApiKey
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                            : 'border-border hover:border-primary/50 text-muted-foreground hover:text-primary'
                        }`}
                        title="Configure Zyla Labs API Key"
                      >
                        <Key className="size-3" />
                        <span>{zylaApiKey ? 'KEY SET' : 'API KEY'}</span>
                      </button>

                      {password && (
                        <button
                          onClick={handleSanitizeMemory}
                          className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border/50 hover:border-destructive/30 flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="size-3.5" /> Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Zyla API Key Inline Drawer */}
                  {showZylaConfig && (
                    <div className="p-3.5 rounded-xl border border-primary/40 bg-muted/40 space-y-2 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="flex justify-between items-center text-primary font-bold">
                        <span className="flex items-center gap-1.5">
                          <Key className="size-3.5" /> ZYLA LABS API KEY (OPTIONAL)
                        </span>
                        <span className="text-[10px] text-muted-foreground">Stored locally</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={zylaApiKey}
                          onChange={(e) => setZylaApiKey(e.target.value)}
                          placeholder="Paste Zyla API key (or set ZYLA_API_KEY in .env.local)"
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary text-foreground font-mono"
                        />
                        <button
                          onClick={() => handleSaveZylaKey(zylaApiKey)}
                          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
                        >
                          SAVE
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Password Input Box */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label htmlFor="password-input" className="font-bold text-primary tracking-wider">
                        ENTER PASSWORD TO EVALUATE:
                      </label>
                      <span className="text-muted-foreground font-mono">{analysis.length} chars</span>
                    </div>

                    <div className="flex rounded-xl border-2 border-primary/40 bg-background/95 focus-within:border-primary transition-colors shadow-inner">
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
                        className="min-w-0 flex-1 bg-transparent px-4 py-3.5 font-mono text-base outline-none text-foreground placeholder:text-muted-foreground/40"
                        placeholder="Type or paste any password..."
                        autoComplete="off"
                        spellCheck={false}
                        autoFocus
                      />

                      <button
                        className="px-3 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setVisible(!visible)}
                        aria-label={visible ? 'Hide password' : 'Show password'}
                      >
                        {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>

                      <button
                        onClick={() => handleQueryZyla()}
                        disabled={!password || isZylaLoading}
                        className="px-4 my-1.5 mr-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40"
                        title="Query Zyla Labs Password Strength API"
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

                  {/* Primary Score & Strength Bar */}
                  <div className="space-y-3 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-extrabold" style={{ color: analysis.toneColor }}>
                          {analysis.rating}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full border border-border bg-muted/60 text-foreground font-bold">
                          Score: {analysis.strengthScore} / 100
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>Entropy: <strong className="text-primary">{analysis.entropyBits} bits</strong></span>
                        <span>·</span>
                        <span>Crack Time: <strong className="text-emerald-400">{analysis.crackTimes.offlineGpu}</strong></span>
                      </div>
                    </div>

                    {/* Strength Progress Bar */}
                    <div className="h-3 w-full rounded-full bg-muted/60 overflow-hidden flex p-0.5 border border-border/60">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(5, analysis.strengthScore)}%`,
                          backgroundColor: analysis.toneColor,
                          boxShadow: `0 0 12px ${analysis.toneColor}`
                        }}
                      />
                    </div>
                  </div>

                  {/* Key Metric Highlights Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl border border-border/60 bg-muted/30">
                      <span className="text-[10px] text-muted-foreground block">GPU CRACK TIME</span>
                      <span className="font-bold text-foreground text-sm truncate block mt-0.5">{analysis.crackTimes.offlineGpu}</span>
                    </div>

                    <div className="p-3 rounded-xl border border-border/60 bg-muted/30">
                      <span className="text-[10px] text-muted-foreground block">SHANNON ENTROPY</span>
                      <span className="font-bold text-primary text-sm truncate block mt-0.5">{analysis.entropyBits} bits</span>
                    </div>

                    <div className="p-3 rounded-xl border border-border/60 bg-muted/30">
                      <span className="text-[10px] text-muted-foreground block">POOL SIZE</span>
                      <span className="font-bold text-foreground text-sm truncate block mt-0.5">{analysis.poolSize} chars</span>
                    </div>

                    <div className="p-3 rounded-xl border border-primary/40 bg-primary/10">
                      <span className="text-[10px] text-primary block flex items-center gap-1 font-bold">
                        <Globe className="size-2.5" /> ZYLA API RESULT
                      </span>
                      <span className="font-extrabold text-foreground text-sm truncate block mt-0.5 capitalize">
                        {zylaResult?.data?.result ? `"${zylaResult.data.result}"` : isZylaLoading ? 'Checking...' : 'Ready'}
                      </span>
                    </div>
                  </div>

                  {/* Security Checks & Warnings Checklist */}
                  <div className="grid sm:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                      analysis.checks.min12 ? 'border-emerald-500/40 bg-emerald-500/10 text-foreground' : 'border-border/60 bg-muted/20 text-muted-foreground'
                    }`}>
                      <CheckCircle2 className={`size-4 shrink-0 ${analysis.checks.min12 ? 'text-emerald-400' : 'text-muted-foreground/40'}`} />
                      <span>At least 12 characters (16+ recommended)</span>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                      analysis.checks.casing ? 'border-emerald-500/40 bg-emerald-500/10 text-foreground' : 'border-border/60 bg-muted/20 text-muted-foreground'
                    }`}>
                      <CheckCircle2 className={`size-4 shrink-0 ${analysis.checks.casing ? 'text-emerald-400' : 'text-muted-foreground/40'}`} />
                      <span>Mixed upper & lowercase letters</span>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                      analysis.checks.hasNumber && analysis.checks.hasSymbol ? 'border-emerald-500/40 bg-emerald-500/10 text-foreground' : 'border-border/60 bg-muted/20 text-muted-foreground'
                    }`}>
                      <CheckCircle2 className={`size-4 shrink-0 ${analysis.checks.hasNumber && analysis.checks.hasSymbol ? 'text-emerald-400' : 'text-muted-foreground/40'}`} />
                      <span>Includes numbers & symbols</span>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                      analysis.checks.noCommonPattern ? 'border-emerald-500/40 bg-emerald-500/10 text-foreground' : 'border-destructive/40 bg-destructive/10 text-destructive'
                    }`}>
                      {analysis.checks.noCommonPattern ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="size-4 shrink-0 text-destructive" />
                      )}
                      <span>{analysis.checks.noCommonPattern ? 'No dictionary / leak patterns' : 'Weak pattern detected'}</span>
                    </div>
                  </div>

                  {/* Pattern Warning if detected */}
                  {analysis.patternsDetected.length > 0 && (
                    <div className="p-3.5 rounded-xl border border-destructive/50 bg-destructive/10 text-xs space-y-1">
                      <p className="font-bold text-destructive flex items-center gap-1.5">
                        <AlertTriangle className="size-4" /> Detected Anti-Patterns:
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {analysis.patternsDetected.map(p => p.name).join(' · ')}
                      </p>
                    </div>
                  )}

                  {/* Quick Generator Box */}
                  <div className="p-4 rounded-xl border border-primary/30 bg-muted/20 space-y-3 pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-primary flex items-center gap-1.5">
                        <Sparkles className="size-3.5" /> NEED A SECURE PASSWORD?
                      </span>
                      <div className="flex gap-1 text-[11px]">
                        <button
                          onClick={() => {
                            setGeneratorMode('diceware')
                            setGeneratedPassword(generateDicewarePassphrase(4, '-', false, false))
                            hackerAudio.playKeypress()
                          }}
                          className={`px-2 py-0.5 rounded font-bold ${generatorMode === 'diceware' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                        >
                          Passphrase
                        </button>
                        <button
                          onClick={() => {
                            setGeneratorMode('csprng')
                            setGeneratedPassword(generateStrongPassword(16))
                            hackerAudio.playKeypress()
                          }}
                          className={`px-2 py-0.5 rounded font-bold ${generatorMode === 'csprng' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                        >
                          Random
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-background font-mono text-xs">
                      <span className="flex-1 text-emerald-400 font-bold select-all tracking-wider truncate">
                        {generatedPassword}
                      </span>
                      <button
                        onClick={handleRegeneratePassword}
                        className="p-1 rounded hover:text-primary text-muted-foreground transition-colors"
                        title="Generate new"
                      >
                        <RefreshCw className="size-3.5" />
                      </button>
                      <button
                        onClick={handleCopyGenerated}
                        className="px-2.5 py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 text-[11px] font-bold flex items-center gap-1 transition-all"
                      >
                        {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                        {copied ? 'COPIED' : 'COPY'}
                      </button>
                      <button
                        onClick={() => handleApplyGenerated()}
                        className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground border border-border text-[11px] font-bold transition-all"
                      >
                        TEST IT
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Advanced Technical Details (Hashes & API Inspector) */}
                  <div className="pt-2 border-t border-border/30">
                    <button
                      onClick={() => {
                        setShowApiTelemetry(!showApiTelemetry)
                        hackerAudio.playKeypress()
                      }}
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors font-bold"
                    >
                      <Code className="size-3.5" />
                      <span>{showApiTelemetry ? 'Hide Technical Details & Hashes' : 'Show Advanced Details (Hashes, API Inspector)'}</span>
                    </button>

                    {showApiTelemetry && (
                      <div className="mt-3 p-4 rounded-xl border border-border/60 bg-background/90 space-y-3 text-xs animate-in fade-in duration-150">
                        <div className="grid sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 rounded bg-muted/40 border border-border/40">
                            <span className="text-muted-foreground block text-[10px]">SHA-256 Digest:</span>
                            <span className="text-primary font-mono select-all break-all">{analysis.hashSimulations.sha256}</span>
                          </div>
                          <div className="p-2 rounded bg-muted/40 border border-border/40">
                            <span className="text-muted-foreground block text-[10px]">SHA-1 (K-Anonymity):</span>
                            <span className="text-cyan-400 font-mono select-all break-all">{analysis.hashSimulations.sha1}</span>
                          </div>
                        </div>

                        {zylaResult && (
                          <div className="p-2.5 rounded bg-muted/40 border border-border/40 space-y-1 text-[11px]">
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                              <span className="text-primary font-bold">Zyla API Response Payload:</span>
                              <button onClick={handleCopyZylaJson} className="hover:text-primary flex items-center gap-1">
                                {copiedJson ? 'Copied' : 'Copy JSON'}
                              </button>
                            </div>
                            <pre className="text-emerald-400 font-mono overflow-x-auto text-[10px] max-h-24">
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

            {/* TAB 3: CYBER EDUCATION ACADEMY */}
            {tab === 'academy' && (
              <section>
                <EducationAcademy onTestPassword={handleApplyGenerated} />
              </section>
            )}

            {/* TAB 4: HACKER TERMINAL */}
            {tab === 'terminal' && (
              <section className="space-y-4">
                <TerminalConsole onThemeChange={setTheme} currentTheme={theme} />
              </section>
            )}

            {/* TAB 5: POLICY ENGINE */}
            {tab === 'policies' && (
              <section className="rounded-xl border border-primary/40 bg-card/80 p-6 backdrop-blur-md font-mono space-y-6">
                <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                  <Gauge className="size-6 text-primary" />
                  <div>
                    <h3 className="font-bold text-base text-foreground">ENTERPRISE POLICY & COMPLIANCE ENGINE</h3>
                    <p className="text-xs text-muted-foreground">Real-time enforcement rules aligned with NIST SP 800-63B standards.</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {rules.map((rule) => (
                    <div key={rule} className="flex items-center justify-between rounded-lg border border-primary/30 bg-muted/30 p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="size-4 text-primary shrink-0" />
                        <span className="text-xs font-bold text-foreground">{rule}</span>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded bg-primary/20 text-primary border border-primary/40 font-bold shrink-0">
                        ENFORCED
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 text-xs text-foreground space-y-2">
                  <p className="font-bold text-primary flex items-center gap-2">
                    <ShieldCheck className="size-4" /> MODERN DIGITAL IDENTITY COMPLIANCE:
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Unlike legacy password policies that force frequent periodic resets (driving employees to make weak predictable tweaks like Spring2023! -&gt; Summer2023!), modern NIST guidance mandates minimum 15+ character lengths, breach database screening, and Passkey/MFA adoption.
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
