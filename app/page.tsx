'use client'

import { useMemo, useState } from 'react'
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
  Tv,
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
  RefreshCw
} from 'lucide-react'
import { analyzePassword, generateStrongPassword } from '@/lib/password-security'
import { hackerAudio } from '@/lib/hacker-audio'
import { MatrixBackground } from '@/components/matrix-background'
import { TerminalConsole } from '@/components/terminal-console'

type Tab = 'overview' | 'checker' | 'terminal' | 'policies'
type ThemeOption = 'matrix' | 'cyber' | 'red-alert' | 'stealth'

const rules = [
  'Minimum 12 characters length',
  'Uppercase + lowercase casing mix',
  'At least one numeric digit (0-9)',
  'Special symbol required (!@#$%^&*)',
  'Block breached dictionary words',
  'Shannon Entropy threshold >= 60 bits'
]

const metrics = [
  ['Passwords Evaluated', '14,892', '+12.4% this month'],
  ['Attack Vectors Blocked', '3,418', '+18.2% this month'],
  ['Avg Entropy Score', '74.2 bits', 'Optimal cyber posture'],
  ['Threat Mitigation Level', '99.8%', 'Zero breach incidents']
]

export default function Page() {
  const [tab, setTab] = useState<Tab>('overview')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [mobile, setMobile] = useState(false)

  // Hacker Theme Controls
  const [theme, setTheme] = useState<ThemeOption>('matrix')
  const [crtEnabled, setCrtEnabled] = useState(true)
  const [matrixEnabled, setMatrixEnabled] = useState(true)
  const [isAudioMuted, setIsAudioMuted] = useState(false)

  // Suggested Strong Password State
  const [suggestedPassword, setSuggestedPassword] = useState(() => generateStrongPassword(16))
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(suggestedPassword)
    }
    setCopied(true)
    hackerAudio.playSuccess()
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = () => {
    setSuggestedPassword(generateStrongPassword(16))
    hackerAudio.playScan()
  }

  const handleApplySuggested = () => {
    setPassword(suggestedPassword)
    hackerAudio.playSuccess()
  }

  const analysis = useMemo(() => analyzePassword(password), [password])

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
    ['overview', 'Overview', LayoutDashboard],
    ['checker', 'Password Checker', KeyRound],
    ['terminal', 'Hacker CLI Terminal', TerminalIcon],
    ['policies', 'Policy Engine', Network]
  ] as const

  return (
    <main className={`min-h-screen bg-background text-foreground ${crtEnabled ? 'crt-overlay' : ''}`} data-theme={theme}>
      {/* Matrix Digital Rain Canvas */}
      <MatrixBackground theme={theme} active={matrixEnabled} opacity={theme === 'matrix' ? 0.35 : 0.25} />

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
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-mono">Cyber Console v3.6</p>
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
            <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] font-mono text-primary/80">Cyber Workspaces</p>
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
                <Icon className="size-4 text-primary" />
                {label}
              </button>
            ))}
          </nav>

          {/* Hacker Controls Box */}
          <div className="mt-6 rounded-xl border border-primary/30 bg-muted/40 p-4 font-mono space-y-3">
            <div className="flex items-center justify-between text-xs text-primary font-bold">
              <span className="flex items-center gap-1.5"><Sparkles className="size-3.5" /> THEME PRESET</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  ['matrix', 'Matrix', 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'],
                  ['cyber', 'Cyber', 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'],
                  ['red-alert', 'Alert', 'bg-red-500/20 text-red-400 border-red-500/40'],
                  ['stealth', 'Stealth', 'bg-emerald-900/20 text-emerald-300 border-emerald-800/40']
                ] as const
              ).map(([id, label, colorCls]) => (
                <button
                  key={id}
                  onClick={() => { setTheme(id); hackerAudio.playKeypress() }}
                  className={`px-2 py-1.5 text-[11px] rounded border text-center transition-all ${
                    theme === id ? `${colorCls} font-bold shadow-[0_0_10px_rgba(0,255,102,0.2)]` : 'border-border/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-border/40 space-y-2">
              <button
                onClick={() => setCrtEnabled(!crtEnabled)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] rounded border ${
                  crtEnabled ? 'border-primary/50 text-primary bg-primary/10' : 'border-border text-muted-foreground'
                }`}
              >
                <span className="flex items-center gap-1.5"><Tv className="size-3.5" /> CRT Scanlines</span>
                <span>{crtEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setMatrixEnabled(!matrixEnabled)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] rounded border ${
                  matrixEnabled ? 'border-primary/50 text-primary bg-primary/10' : 'border-border text-muted-foreground'
                }`}
              >
                <span className="flex items-center gap-1.5"><Binary className="size-3.5" /> Matrix Rain</span>
                <span>{matrixEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Privacy Box */}
          <div className="mt-auto rounded-xl border border-primary/20 bg-background/80 p-4 font-mono">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <ShieldCheck className="size-4" /> ZERO-KNOWLEDGE
            </div>
            <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
              Evaluated strictly in browser RAM. No cleartext or hashed passwords ever touch a remote server.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="min-w-0 flex-1 flex flex-col">
          {/* Hacker Header Bar */}
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
                  <Radio className="size-3 text-primary animate-pulse" /> CYBER CONSOLE / SYSTEM POSTURE
                </p>
                <h1 className="text-lg md:text-xl font-bold font-mono text-foreground flex items-center gap-2">
                  PASSWORD SECURITY EVALUATOR
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] border border-primary/40 bg-primary/10 text-primary font-mono font-normal">
                    MIL-SPEC 256
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

              <span className="hidden md:flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary glow-text">
                <span className="size-2 rounded-full bg-primary animate-ping" /> KERNEL ONLINE
              </span>
            </div>
          </header>

          {/* Main Container */}
          <div className="mx-auto max-w-[1500px] w-full p-5 md:p-8 flex-1">
            {/* Banner Header */}
            <div className="mb-8 font-mono">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                <Zap className="size-4" /> INTEL & THREAT MATRIX
              </div>
              <h2 className="mt-2 text-balance text-2xl md:text-4xl font-extrabold font-mono tracking-tight text-foreground">
                CYBER-DEFENSE PASSWORD ENGINE<br />
                <span className="text-muted-foreground text-xl md:text-3xl font-semibold">NEVER BE CRACKED BY DICTIONARY OR GPU RIGS.</span>
              </h2>
              <p className="mt-3 max-w-2xl text-xs md:text-sm leading-6 text-muted-foreground">
                Calculate true Shannon entropy, measure brute-force GPU time-to-crack, check breached dictionary patterns, and test interactive CLI shell commands.
              </p>
            </div>

            {/* TAB 1: OVERVIEW */}
            {tab === 'overview' && (
              <div className="space-y-6">
                {/* Metric Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {metrics.map(([label, value, subtext]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-primary/30 bg-card/80 p-5 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.4)] font-mono hover:border-primary/60 transition-colors"
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
                <div className="grid gap-6 xl:grid-cols-2 font-mono">
                  {/* Security Posture Gauge */}
                  <section className="rounded-xl border border-primary/30 bg-card/80 p-6 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                          <Cpu className="size-4 text-primary" /> GLOBAL SECURITY POSTURE
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Real-time composite score based on evaluated telemetry</p>
                      </div>
                      <span className="px-2.5 py-1 text-xs rounded border border-primary/40 bg-primary/10 text-primary font-bold">
                        GRADE A+
                      </span>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row items-center gap-8 justify-center">
                      <div className="relative flex size-40 flex-col items-center justify-center rounded-full border-[12px] border-primary/80 shadow-[0_0_25px_rgba(0,255,102,0.2)]">
                        <span className="font-mono text-4xl font-extrabold text-foreground glow-text">94</span>
                        <span className="text-[10px] uppercase text-muted-foreground tracking-widest">OUT OF 100</span>
                      </div>

                      <div className="flex flex-col gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="size-3 rounded-full bg-primary" />
                          <span className="text-foreground font-bold">78% Strong</span> (Entropy &gt; 60 bits)
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="size-3 rounded-full bg-amber-500" />
                          <span className="text-foreground font-bold">16% Moderate</span> (Needs numbers/symbols)
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="size-3 rounded-full bg-red-500" />
                          <span className="text-foreground font-bold">6% Breached</span> (Known dictionary leak)
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Live Activity Telemetry Log */}
                  <section className="rounded-xl border border-primary/30 bg-card/80 p-6 backdrop-blur-md">
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      <Radio className="size-4 text-primary" /> REAL-TIME THREAT MITIGATION LOG
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Zero password content logged - hashes redacted</p>

                    <div className="mt-6 flex flex-col gap-3.5 text-xs">
                      {[
                        ['High Entropy Passphrase Verified', 'Entropy: 82.4 bits · 1 sec ago', 'text-primary'],
                        ['Dictionary Sequence Blocked', 'Matched common word pattern · 4 secs ago', 'text-destructive'],
                        ['Character Pool Expanded', 'Added uppercase & symbols · 12 secs ago', 'text-primary'],
                        ['Brute-Force Estimate Calculated', 'GPU time: 4.2M years · 28 secs ago', 'text-emerald-400']
                      ].map(([title, desc, colorCls]) => (
                        <div key={title} className="flex items-center gap-3 p-2.5 rounded border border-border/40 bg-muted/30">
                          <CheckCircle2 className={`size-4 ${colorCls} shrink-0`} />
                          <div>
                            <p className="text-foreground font-bold">{title}</p>
                            <p className="text-[11px] text-muted-foreground">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* TAB 2: PASSWORD CHECKER */}
            {tab === 'checker' && (
              <section className="grid gap-6 lg:grid-cols-2 font-mono">
                {/* Input & Entropy Card */}
                <div className="rounded-xl border border-primary/40 bg-card/80 p-6 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                    <KeyRound className="size-6 text-primary" />
                    <div>
                      <h3 className="font-bold text-base text-foreground">ENTROPY & THREAT SCANNER</h3>
                      <p className="text-xs text-muted-foreground">Evaluated locally in client memory</p>
                    </div>
                  </div>

                  <label className="mt-6 block text-xs font-bold text-primary uppercase tracking-wider" htmlFor="password-input">
                    TEST PASSWORD / PASSPHRASE
                  </label>
                  <div className="mt-2 flex rounded-lg border border-primary/40 bg-background/90 focus-within:border-primary">
                    <input
                      id="password-input"
                      type={visible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm outline-none text-foreground placeholder:text-muted-foreground/50"
                      placeholder="Type a password to test..."
                      autoComplete="off"
                    />
                    <button
                      className="px-4 text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => setVisible(!visible)}
                      aria-label={visible ? 'Hide password' : 'Show password'}
                    >
                      {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {/* Rating Badge & Score */}
                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">RATING:</span>
                      <p className="text-xl font-extrabold" style={{ color: analysis.toneColor }}>
                        {analysis.rating} ({analysis.strengthScore}/100)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">SHANNON ENTROPY:</span>
                      <p className="text-xl font-extrabold text-primary">{analysis.entropyBits} BITS</p>
                    </div>
                  </div>

                  {/* Entropy Bar */}
                  <div className="mt-4">
                    <div className="h-3 w-full rounded-full bg-muted/60 overflow-hidden flex p-0.5 border border-border">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${analysis.strengthScore}%`,
                          backgroundColor: analysis.toneColor,
                          boxShadow: `0 0 10px ${analysis.toneColor}`
                        }}
                      />
                    </div>
                  </div>

                  {/* Character Pool Breakdown */}
                  <div className="mt-6 grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded border border-border bg-muted/30">
                      <span className="text-[10px] text-muted-foreground block">LOWER</span>
                      <span className="font-bold text-foreground">{analysis.characterBreakdown.lowercase}</span>
                    </div>
                    <div className="p-2 rounded border border-border bg-muted/30">
                      <span className="text-[10px] text-muted-foreground block">UPPER</span>
                      <span className="font-bold text-foreground">{analysis.characterBreakdown.uppercase}</span>
                    </div>
                    <div className="p-2 rounded border border-border bg-muted/30">
                      <span className="text-[10px] text-muted-foreground block">DIGITS</span>
                      <span className="font-bold text-foreground">{analysis.characterBreakdown.numbers}</span>
                    </div>
                    <div className="p-2 rounded border border-border bg-muted/30">
                      <span className="text-[10px] text-muted-foreground block">SYMBOLS</span>
                      <span className="font-bold text-foreground">{analysis.characterBreakdown.symbols}</span>
                    </div>
                  </div>

                  {/* Suggested Strong Password */}
                  <div className="mt-6 pt-4 border-t border-primary/30 space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-primary flex items-center gap-1.5 glow-text">
                        <Sparkles className="size-3.5" /> SUGGESTED HIGH-ENTROPY PASSPHRASE
                      </p>
                      <button
                        onClick={handleRegenerate}
                        className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                        title="Generate another strong password"
                      >
                        <RefreshCw className="size-3" /> New
                      </button>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-lg border border-primary/40 bg-muted/40 font-mono text-xs">
                      <span className="flex-1 font-bold text-emerald-400 select-all tracking-wider font-mono truncate">
                        {suggestedPassword}
                      </span>

                      <button
                        onClick={handleCopy}
                        className="px-2 py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 text-[10px] font-bold flex items-center gap-1 transition-all"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                        {copied ? 'COPIED' : 'COPY'}
                      </button>

                      <button
                        onClick={handleApplySuggested}
                        className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-foreground border border-border text-[10px] font-bold transition-all"
                        title="Test this password in evaluator"
                      >
                        TEST
                      </button>
                    </div>
                  </div>
                </div>

                {/* Crack Time & Policy Breakdown */}
                <div className="space-y-6">
                  {/* Time to Crack Table */}
                  <div className="rounded-xl border border-primary/40 bg-card/80 p-6 backdrop-blur-md">
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      <Cpu className="size-4 text-primary" /> BRUTE FORCE TIME-TO-CRACK
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Estimated time required to test all {analysis.poolSize}^{analysis.length} combinations</p>

                    <div className="mt-4 space-y-3 text-xs">
                      <div className="flex justify-between items-center p-2.5 rounded border border-border/40 bg-muted/30">
                        <span className="text-muted-foreground">Online Throttled (10 req/s):</span>
                        <span className="font-bold text-foreground">{analysis.crackTimes.onlineThrottled}</span>
                      </div>
                      <div className="flex justify-between items-center p-2.5 rounded border border-border/40 bg-muted/30">
                        <span className="text-muted-foreground">Fast Online (1,000 req/s):</span>
                        <span className="font-bold text-foreground">{analysis.crackTimes.onlineFast}</span>
                      </div>
                      <div className="flex justify-between items-center p-2.5 rounded border border-border/40 bg-muted/30">
                        <span className="text-muted-foreground">Offline GPU Rig (100 GH/s):</span>
                        <span className="font-bold text-emerald-400">{analysis.crackTimes.offlineGpu}</span>
                      </div>
                      <div className="flex justify-between items-center p-2.5 rounded border border-border/40 bg-muted/30">
                        <span className="text-muted-foreground">Supercomputer Cluster:</span>
                        <span className="font-bold text-primary">{analysis.crackTimes.supercomputer}</span>
                      </div>
                    </div>
                  </div>

                  {/* Policy Checklist */}
                  <div className="rounded-xl border border-primary/40 bg-card/80 p-6 backdrop-blur-md">
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      <ShieldAlert className="size-4 text-primary" /> CYBER SECURITY CHECKLIST
                    </h3>

                    <div className="mt-4 space-y-3 text-xs">
                      {rules.map((rule, idx) => {
                        const isCheckPassed = [
                          analysis.checks.min12,
                          analysis.checks.casing,
                          analysis.checks.hasNumber,
                          analysis.checks.hasSymbol,
                          analysis.checks.noCommonPattern,
                          analysis.checks.highEntropy
                        ][idx]

                        return (
                          <div key={rule} className="flex items-center justify-between p-2 rounded border border-border/40">
                            <span className={isCheckPassed ? 'text-foreground font-bold' : 'text-muted-foreground'}>{rule}</span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${isCheckPassed ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-muted text-muted-foreground'}`}>
                              {isCheckPassed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* TAB 3: HACKER TERMINAL */}
            {tab === 'terminal' && (
              <section className="space-y-4">
                <TerminalConsole onThemeChange={setTheme} currentTheme={theme} />
              </section>
            )}

            {/* TAB 4: POLICY ENGINE */}
            {tab === 'policies' && (
              <section className="rounded-xl border border-primary/40 bg-card/80 p-6 backdrop-blur-md font-mono">
                <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                  <Gauge className="size-6 text-primary" />
                  <div>
                    <h3 className="font-bold text-base text-foreground">ENFORCEMENT POLICY ENGINE</h3>
                    <p className="text-xs text-muted-foreground">Enterprise rule vectors applied to password security evaluations.</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {rules.map((rule) => (
                    <div key={rule} className="flex items-center justify-between rounded-lg border border-primary/30 bg-muted/30 p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="size-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">{rule}</span>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded bg-primary/20 text-primary border border-primary/40 font-bold">
                        ENFORCED
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
