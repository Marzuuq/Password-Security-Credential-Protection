'use client'

import { useState, useEffect } from 'react'
import {
  Globe,
  Key,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Code,
  Sliders,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  Radio,
  Server,
  Layers,
  Terminal,
  Info
} from 'lucide-react'
import {
  analyzePasswordWithZyla,
  ZYLA_API_ENDPOINT,
  ZylaAnalysisResult,
  getStoredZylaApiKey,
  saveStoredZylaApiKey
} from '@/lib/zyla-api'
import { hackerAudio } from '@/lib/hacker-audio'

interface ZylaApiCheckerProps {
  currentPassword?: string
  onSyncPassword?: (password: string) => void
}

export function getStrengthDetails(result?: string) {
  const text = (result || '').toLowerCase()
  if (text.includes('unbreakable')) {
    return {
      tier: 'Unbreakable Password',
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-300',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
      icon: ShieldCheck,
      description: 'Maximum resilience. Estimated crack time exceeds centuries against distributed GPU clusters and rainbow tables.'
    }
  }
  if (text.includes('strong')) {
    return {
      tier: 'Strong Password',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      icon: CheckCircle2,
      description: 'High entropy with varied character sets. Resistant to offline dictionary and hybrid attacks.'
    }
  }
  if (text.includes('moderate')) {
    return {
      tier: 'Moderate Password',
      color: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      icon: AlertTriangle,
      description: 'Moderate resilience. May be vulnerable to targeted GPU brute-force or rule-based dictionary attacks.'
    }
  }
  return {
    tier: 'Weak Password',
    color: 'text-destructive',
    bg: 'bg-destructive/15 border-destructive/40 text-destructive',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]',
    icon: AlertTriangle,
    description: 'High vulnerability. Subservient to fast credential stuffing, wordlist attacks, or single-hash dictionaries.'
  }
}

export function ZylaApiChecker({ currentPassword = '', onSyncPassword }: ZylaApiCheckerProps) {
  const [testPassword, setTestPassword] = useState(currentPassword)
  const [apiKey, setApiKey] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<ZylaAnalysisResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'response' | 'http' | 'comparison'>('response')

  useEffect(() => {
    setApiKey(getStoredZylaApiKey())
  }, [])

  useEffect(() => {
    setTestPassword(currentPassword)
  }, [currentPassword])

  const handleSaveApiKey = (keyVal: string) => {
    setApiKey(keyVal)
    saveStoredZylaApiKey(keyVal)
    hackerAudio.playSuccess()
  }

  const handleExecuteAnalysis = async (pwd?: string, keyToUse?: string, isManual = false) => {
    const target = (pwd ?? testPassword).trim()
    if (!target) {
      setResponse(null)
      return
    }

    if (isManual) hackerAudio.playScan()
    setIsLoading(true)

    try {
      const res = await analyzePasswordWithZyla(target, keyToUse ?? apiKey)
      setResponse(res)
      if (isManual) {
        if (res.success) {
          hackerAudio.playSuccess()
        } else {
          hackerAudio.playAlert()
        }
      }
    } catch {
      if (isManual) hackerAudio.playAlert()
    } finally {
      setIsLoading(false)
    }
  }

  // Automatic evaluation with 400ms debounce
  useEffect(() => {
    if (!testPassword.trim()) {
      setResponse(null)
      return
    }
    const timer = setTimeout(() => {
      handleExecuteAnalysis(testPassword, apiKey, false)
    }, 400)
    return () => clearTimeout(timer)
  }, [testPassword, apiKey])

  const handleCopyJson = () => {
    if (!response) return
    navigator.clipboard.writeText(JSON.stringify(response, null, 2))
    setCopied(true)
    hackerAudio.playSuccess()
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-primary/40 bg-card/90 p-5 md:p-6 backdrop-blur-md font-mono shadow-[0_0_25px_rgba(0,0,0,0.5)] space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/40">
              <Globe className="size-4 animate-pulse" />
            </span>
            <h3 className="font-bold text-base text-foreground tracking-tight flex items-center gap-2">
              ZYLA LABS API INTEGRATION
              <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 border border-primary/30 text-primary font-bold">
                ENDPOINT #2114
              </span>
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Direct integration with Zyla Labs Password Strength Checker API (<code className="text-primary text-[11px]">/password+analysis</code>)
          </p>
        </div>

        {/* API Key Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowKeyInput(!showKeyInput)
              hackerAudio.playKeypress()
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
              apiKey
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                : 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20'
            }`}
          >
            <Key className="size-3.5" />
            {apiKey ? 'API KEY CONFIGURED' : 'CONFIGURE API KEY'}
          </button>
        </div>
      </div>

      {/* Endpoint URL Badge */}
      <div className="p-3 rounded-lg border border-primary/30 bg-background/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] border border-emerald-500/40 shrink-0">
            GET
          </span>
          <span className="text-muted-foreground text-[11px] font-mono select-all truncate">
            {ZYLA_API_ENDPOINT}
          </span>
        </div>

        <a
          href="https://zylalabs.com/api/2254/password+strength+checker+api/2114/password+analysis"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline text-[11px] flex items-center gap-1 shrink-0"
        >
          <span>Zyla Docs</span>
          <ExternalLink className="size-3" />
        </a>
      </div>

      {/* API Key Configuration Dropdown */}
      {showKeyInput && (
        <div className="p-4 rounded-xl border border-primary/40 bg-muted/40 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Key className="size-3.5 text-primary" /> ZYLA LABS AUTHORIZATION KEY
            </span>
            <span className="text-[10px] text-muted-foreground">Passed via Bearer Token header</span>
          </div>

          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Zyla Labs API key (e.g., 2254|abc123xyz...)"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono outline-none focus:border-primary text-foreground"
            />
            <button
              onClick={() => handleSaveApiKey(apiKey)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
            >
              SAVE KEY
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            💡 <strong>Note:</strong> You can also define <code className="text-primary">ZYLA_API_KEY=your_key</code> in your <code className="text-foreground">.env.local</code> file. When no key is set, the endpoint operates in sandbox evaluation mode.
          </p>
        </div>
      )}

      {/* Interactive Request Form */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <label htmlFor="zyla-password-input" className="font-bold text-primary flex items-center gap-1.5">
            <Code className="size-3.5" /> QUERY PARAMETER: <span className="text-foreground lowercase font-normal">?password=...</span>
          </label>
          {currentPassword && currentPassword !== testPassword && (
            <button
              onClick={() => {
                setTestPassword(currentPassword)
                hackerAudio.playKeypress()
              }}
              className="text-[11px] text-primary hover:underline flex items-center gap-1"
            >
              <RotateCw className="size-3" /> Sync Active Password
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="zyla-password-input"
            type="text"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleExecuteAnalysis(undefined, undefined, true)
            }}
            placeholder="Type password to evaluate against Zyla API..."
            className="flex-1 rounded-lg border border-primary/40 bg-background/90 px-4 py-2.5 text-sm font-mono outline-none focus:border-primary text-foreground"
          />

          <button
            onClick={() => handleExecuteAnalysis(undefined, undefined, true)}
            disabled={!testPassword || isLoading}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)]"
          >
            {isLoading ? (
              <>
                <RotateCw className="size-4 animate-spin" />
                <span>QUERYING API...</span>
              </>
            ) : (
              <>
                <Play className="size-4 fill-current" />
                <span>SEND GET REQUEST</span>
              </>
            )}
          </button>
        </div>

        {/* 4 Classification Tiers Reference */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
          {[
            { name: 'Weak', desc: '< 8 chars / basic words', tier: 'Weak Password', color: 'border-red-500/50 text-red-500 dark:text-red-400 bg-red-500/10' },
            { name: 'Moderate', desc: '8-11 chars or 2 types', tier: 'Moderate Password', color: 'border-amber-500/50 text-amber-500 dark:text-amber-400 bg-amber-500/10' },
            { name: 'Strong', desc: '12-19 mixed chars', tier: 'Strong Password', color: 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' },
            { name: 'Unbreakable', desc: '20+ chars (or 16+ mixed)', tier: 'Unbreakable Password', color: 'border-emerald-400 text-emerald-500 dark:text-emerald-300 bg-emerald-500/20' }
          ].map((item) => {
            const isMatch = response?.data?.result?.toLowerCase().includes(item.name.toLowerCase())
            return (
              <div
                key={item.name}
                className={`p-2 rounded-lg border text-center transition-all ${
                  isMatch
                    ? `${item.color} font-bold ring-2 ring-primary/40 shadow-sm scale-[1.02]`
                    : 'border-border/60 bg-muted/20 text-muted-foreground opacity-70'
                }`}
              >
                <p className="text-xs uppercase font-extrabold">{item.name}</p>
                <p className="text-[9px] truncate mt-0.5">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Response & Telemetry Box */}
      {response && (
        <div className="space-y-4 pt-2 border-t border-border/40">
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border border-primary/30 bg-muted/30 text-xs">
            <div className="flex items-center gap-3">
              <span className={`flex size-2 rounded-full ${response.success ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
              <span className="font-bold text-foreground">
                STATUS: {response.status || (response.success ? '200 OK' : 'ERROR')}
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">
                LATENCY: <strong className="text-primary">{response.latencyMs} ms</strong>
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">
                MODE: <strong className={response.mode === 'live_api' ? 'text-emerald-400' : 'text-amber-400'}>
                  {response.mode === 'live_api' ? 'LIVE ZYLA CLOUD' : 'SANDBOX SIMULATOR'}
                </strong>
              </span>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('response')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                  activeTab === 'response' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                Payload JSON
              </button>
              <button
                onClick={() => setActiveTab('http')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                  activeTab === 'http' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                HTTP Inspect
              </button>
              <button
                onClick={() => setActiveTab('comparison')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                  activeTab === 'comparison' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                Comparison
              </button>
            </div>
          </div>

          {/* TAB 1: JSON Payload Display */}
          {activeTab === 'response' && (
            <div className="relative rounded-lg border border-border bg-background/95 p-4 text-xs">
              <div className="flex justify-between items-center pb-2 mb-2 border-b border-border/40 text-[10px] text-muted-foreground">
                <span>RAW JSON RESPONSE BODY:</span>
                <button
                  onClick={handleCopyJson}
                  className="hover:text-primary flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  {copied ? 'COPIED' : 'COPY JSON'}
                </button>
              </div>

              {response.data?.result && (() => {
                const details = getStrengthDetails(response.data.result)
                const Icon = details.icon
                return (
                  <div className={`mb-4 p-3.5 rounded-xl border ${details.bg} ${details.glow} transition-all space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Icon className={`size-4 ${details.color}`} />
                        ZYLA CLOUD RESULT:
                      </span>
                      <span className={`text-sm font-extrabold ${details.color} uppercase tracking-wider glow-text`}>
                        &quot;{details.tier}&quot;
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {details.description}
                    </p>
                  </div>
                )
              })()}

              <pre className="text-emerald-400 font-mono text-[11px] overflow-x-auto select-all max-h-56 leading-relaxed">
                {JSON.stringify(response.data || response, null, 2)}
              </pre>

              {response.note && (
                <p className="mt-2 text-[10px] text-amber-400/90 pt-2 border-t border-border/40">
                  ℹ {response.note}
                </p>
              )}
            </div>
          )}

          {/* TAB 2: HTTP Inspection */}
          {activeTab === 'http' && (
            <div className="rounded-lg border border-border bg-background/95 p-4 text-xs space-y-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Request Line:</p>
                <p className="font-mono text-primary text-[11px] break-all select-all">
                  GET {ZYLA_API_ENDPOINT}?password={encodeURIComponent(testPassword)} HTTP/1.1
                </p>
              </div>
              <div className="pt-2 border-t border-border/40">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Headers:</p>
                <div className="text-[11px] text-foreground space-y-0.5 mt-1 font-mono">
                  <p>Host: zylalabs.com</p>
                  <p>Authorization: Bearer {apiKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : '[ZYLA_API_KEY_ENV]'}</p>
                  <p>Accept: application/json</p>
                  <p>User-Agent: PassGuard-Evaluator/3.8</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border/40">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Response Headers (Proxy):</p>
                <div className="text-[11px] text-muted-foreground space-y-0.5 mt-1 font-mono">
                  <p>Content-Type: application/json</p>
                  <p>X-Response-Time: {response.latencyMs}ms</p>
                  <p>Date: {response.timestamp}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Comparison View */}
          {activeTab === 'comparison' && (
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              {(() => {
                const details = getStrengthDetails(response.data?.result)
                const Icon = details.icon
                return (
                  <div className={`p-4 rounded-xl border ${details.bg} ${details.glow} space-y-2 transition-all`}>
                    <p className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                      <Globe className="size-3.5 text-primary" /> ZYLA LABS CLOUD EVALUATION
                    </p>
                    <p className={`text-2xl font-extrabold ${details.color} flex items-center gap-2`}>
                      <Icon className="size-6 shrink-0" />
                      {details.tier}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {details.description}
                    </p>
                  </div>
                )
              })()}

              <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-2">
                <p className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="size-3.5 text-emerald-400" /> LOCAL SHANNON ENTROPY ENGINE
                </p>
                <p className="text-2xl font-extrabold text-emerald-400">
                  Zero-Storage Math
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Client-side $E = L \times \log_2 N$ computation aligned with NIST SP 800-63B standards.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
