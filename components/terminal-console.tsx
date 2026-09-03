'use client'

import { useEffect, useRef, useState } from 'react'
import {
  analyzePassword,
  generateDicewarePassphrase,
  ANTI_PATTERNS
} from '@/lib/password-security'
import { analyzePasswordWithZyla } from '@/lib/zyla-api'
import { hackerAudio } from '@/lib/hacker-audio'
import { Terminal, Send, Trash2, Sparkles, Check, Copy } from 'lucide-react'

interface HistoryItem {
  id: string
  command: string
  output: React.ReactNode
  timestamp: string
}

interface TerminalConsoleProps {
  onThemeChange?: (theme: 'dark' | 'light') => void
  currentTheme?: string
}

const COMMAND_SUGGESTIONS = [
  'help',
  'eval P@ssw0rd2024!',
  'diceware 4',
  'stuffing',
  'antipatterns',
  'privacy',
  'clear'
]

export function TerminalConsole({ onThemeChange, currentTheme = 'light' }: TerminalConsoleProps) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'welcome',
      command: 'sys.init --verbose --zero-storage',
      output: (
        <div className="space-y-1.5 text-xs font-mono">
          <p className="text-emerald-500 dark:text-emerald-400 font-semibold">
            ✔ Passguard Security Console Kernel v3.8.0-release initialized
          </p>
          <p className="text-sky-500 dark:text-sky-400">
            🔒 Client-Side Sandbox Active: All evaluations execute strictly in volatile browser RAM.
          </p>
          <p className="text-muted-foreground pt-1">
            Type <span className="text-primary font-semibold">help</span> to view commands, or click any suggestion pill below.
          </p>
        </div>
      ),
      timestamp: new Date().toLocaleTimeString()
    }
  ])

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleCommand = async (cmdStr: string) => {
    const trimmed = cmdStr.trim()
    if (!trimmed) return

    hackerAudio.playKeypress()

    const parts = trimmed.split(' ')
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1).join(' ')

    let outputNode: React.ReactNode = null

    switch (cmd) {
      case 'help':
        outputNode = (
          <div className="space-y-2 text-xs font-mono">
            <p className="text-primary font-bold">Available Security Console Commands:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 mt-1 text-muted-foreground">
              <div><span className="text-foreground font-semibold">eval &lt;password&gt;</span> &mdash; Full Shannon entropy & GPU crack time analysis</div>
              <div><span className="text-foreground font-semibold">zyla &lt;password&gt;</span> &mdash; Query Zyla Labs cloud security API</div>
              <div><span className="text-foreground font-semibold">diceware [count]</span> &mdash; Generate 3-6 word memorable passphrase</div>
              <div><span className="text-foreground font-semibold">antipatterns</span> &mdash; List top weak password patterns & fixes</div>
              <div><span className="text-foreground font-semibold">stuffing</span> &mdash; Explain credential stuffing risks</div>
              <div><span className="text-foreground font-semibold">privacy</span> &mdash; View zero-knowledge sandbox architecture</div>
              <div><span className="text-foreground font-semibold">hash &lt;text&gt;</span> &mdash; Generate SHA-256 & SHA-1 digests</div>
              <div><span className="text-foreground font-semibold">theme &lt;dark|light&gt;</span> &mdash; Toggle visual theme</div>
              <div><span className="text-foreground font-semibold">clear</span> &mdash; Clear terminal screen buffer</div>
            </div>
          </div>
        )
        break

      case 'eval':
      case 'analyze':
      case 'scan':
        if (!args) {
          outputNode = <p className="text-destructive font-mono text-xs">Error: Missing password parameter. Usage: eval &lt;password&gt;</p>
        } else {
          hackerAudio.playScan()
          const res = analyzePassword(args)
          outputNode = (
            <div className="space-y-2 text-xs font-mono border-l-2 border-primary/50 pl-3 py-1 bg-muted/20 rounded-r-lg">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Target:</span>
                <span className="text-foreground bg-muted px-2 py-0.5 rounded font-mono">{'*'.repeat(res.length)}</span>
                <span className="font-bold" style={{ color: res.toneColor }}>[{res.rating}]</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
                <div>Length: <span className="text-foreground font-bold">{res.length}</span></div>
                <div>Entropy: <span className="text-primary font-bold">{res.entropyBits} bits</span></div>
                <div>Pool: <span className="text-foreground font-bold">{res.poolSize} chars</span></div>
                <div>Score: <span className="text-foreground font-bold">{res.strengthScore}/100</span></div>
              </div>
              <div className="text-emerald-500 dark:text-emerald-400 space-y-0.5">
                <p>Crack Time (8x RTX 4090 GPU Rig): <span className="text-foreground font-bold">{res.crackTimes.offlineGpu}</span></p>
                <p>Crack Time (Supercomputer): <span className="text-foreground font-bold">{res.crackTimes.supercomputer}</span></p>
              </div>
              {res.patternsDetected.length > 0 ? (
                <div className="text-destructive">
                  ⚠ Threats: {res.patternsDetected.map(p => p.name).join(' | ')}
                </div>
              ) : (
                <div className="text-emerald-500 dark:text-emerald-400">✔ Zero common breach patterns matched.</div>
              )}
            </div>
          )
        }
        break

      case 'zyla':
      case 'api':
        if (!args) {
          outputNode = <p className="text-destructive font-mono text-xs">Error: Missing password. Usage: zyla &lt;password&gt;</p>
        } else {
          hackerAudio.playScan()
          const zylaRes = await analyzePasswordWithZyla(args)
          if (zylaRes.success) {
            hackerAudio.playSuccess()
            outputNode = (
              <div className="space-y-2 text-xs font-mono border-l-2 border-emerald-500 pl-3 py-1 bg-muted/20 rounded-r-lg">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Endpoint:</span>
                  <span className="text-emerald-500 dark:text-emerald-400 font-bold">Zyla Labs Password Analysis API</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    {zylaRes.status || 200} OK ({zylaRes.latencyMs}ms)
                  </span>
                </div>
                <pre className="text-emerald-500 dark:text-emerald-400 overflow-x-auto text-[11px] bg-background/50 p-2 rounded">
                  {JSON.stringify(zylaRes.data, null, 2)}
                </pre>
              </div>
            )
          } else {
            outputNode = (
              <p className="text-destructive font-mono text-xs">
                Zyla API Notice: {zylaRes.error || 'Request failed. Provide an API key in the Checker tab.'}
              </p>
            )
          }
        }
        break

      case 'diceware':
        const wordCount = Math.min(6, Math.max(3, parseInt(args) || 4))
        const phrase = generateDicewarePassphrase(wordCount, '-', false, false)
        outputNode = (
          <div className="space-y-1 text-xs font-mono border-l-2 border-primary/50 pl-3 py-1 bg-muted/20 rounded-r-lg">
            <p className="text-muted-foreground">Generated {wordCount}-Word Diceware Passphrase:</p>
            <p className="text-primary font-bold text-sm tracking-wide select-all">{phrase}</p>
            <p className="text-[11px] text-emerald-500 dark:text-emerald-400">Entropy: ~{(wordCount * 12.92).toFixed(1)} bits &middot; Search Space: 7,776^{wordCount} combos</p>
          </div>
        )
        break

      case 'antipatterns':
        outputNode = (
          <div className="space-y-2 text-xs font-mono">
            <p className="text-primary font-bold">Common Weak Password Anti-Patterns:</p>
            <div className="space-y-1.5 text-muted-foreground">
              {ANTI_PATTERNS.slice(0, 4).map(p => (
                <div key={p.id} className="p-2 rounded border border-border bg-muted/30">
                  <p className="font-semibold text-foreground">{p.title} &mdash; <span className="text-destructive font-mono">{p.example}</span></p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{p.whyWeak}</p>
                </div>
              ))}
            </div>
          </div>
        )
        break

      case 'stuffing':
        outputNode = (
          <div className="space-y-1.5 text-xs font-mono p-3 rounded-lg border border-border bg-muted/30">
            <p className="text-primary font-bold">Credential Stuffing Explained:</p>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Over 80% of data breaches originate from stolen credentials reused across websites. Automated bots take leaked username/password combos from compromised sites and replay them against banking, email, and corporate systems. Always use unique passwords.
            </p>
          </div>
        )
        break

      case 'privacy':
        outputNode = (
          <div className="space-y-1.5 text-xs font-mono p-3 rounded-lg border border-border bg-muted/30">
            <p className="text-primary font-bold">Zero-Knowledge Verification Architecture:</p>
            <p className="text-muted-foreground text-[11px]">
              Evaluated strictly in browser RAM. Zero network transmissions. Zero cookies or persistent storage.
            </p>
          </div>
        )
        break

      case 'hash':
        if (!args) {
          outputNode = <p className="text-destructive font-mono text-xs">Error: Missing string. Usage: hash &lt;text&gt;</p>
        } else {
          const res = analyzePassword(args)
          outputNode = (
            <div className="space-y-1.5 text-xs font-mono border-l-2 border-primary/50 pl-3 py-1 bg-muted/20 rounded-r-lg">
              <div><span className="text-muted-foreground">Input:</span> <span className="text-foreground">{args}</span></div>
              <div><span className="text-muted-foreground">SHA-256:</span> <span className="text-primary select-all break-all">{res.hashSimulations.sha256}</span></div>
              <div><span className="text-muted-foreground">SHA-1 (K-Anon Prefix):</span> <span className="text-sky-500 dark:text-sky-400 select-all break-all">{res.hashSimulations.sha1}</span></div>
            </div>
          )
        }
        break

      case 'theme':
        if (args.includes('dark')) {
          onThemeChange?.('dark')
          outputNode = <p className="text-emerald-500 font-mono text-xs">Theme switched to Dark mode.</p>
        } else if (args.includes('light')) {
          onThemeChange?.('light')
          outputNode = <p className="text-emerald-500 font-mono text-xs">Theme switched to Light mode.</p>
        } else {
          outputNode = <p className="text-muted-foreground font-mono text-xs">Current theme: {currentTheme}. Usage: theme dark | theme light</p>
        }
        break

      case 'clear':
      case 'cls':
        setHistory([])
        setInput('')
        return

      default:
        outputNode = (
          <p className="text-destructive font-mono text-xs">
            Command not recognized: &quot;{cmd}&quot;. Type <span className="text-primary font-semibold">help</span> for available commands.
          </p>
        )
        break
    }

    setHistory(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        command: trimmed,
        output: outputNode,
        timestamp: new Date().toLocaleTimeString()
      }
    ])
    setInput('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCommand(input)
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-card shadow-lg overflow-hidden flex flex-col">
      {/* Terminal Window Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="size-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="size-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono font-medium text-muted-foreground ml-2 flex items-center gap-1.5">
            <Terminal className="size-3.5 text-primary" /> passguard-shell &mdash; 80x24
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setHistory([])
              hackerAudio.playKeypress()
            }}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs flex items-center gap-1"
            title="Clear buffer"
          >
            <Trash2 className="size-3.5" />
            <span className="hidden sm:inline text-[11px]">Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="p-4 md:p-6 space-y-4 min-h-[380px] max-h-[500px] overflow-y-auto custom-scrollbar font-mono bg-background/60">
        {history.map(item => (
          <div key={item.id} className="space-y-1 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
              <span className="text-primary font-bold">&gt;</span>
              <span className="text-foreground font-semibold">{item.command}</span>
              <span className="text-[10px] text-muted-foreground/60 ml-auto">{item.timestamp}</span>
            </div>
            <div className="pl-3">{item.output}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Command Suggestions Chips */}
      <div className="px-4 py-2 bg-muted/30 border-t border-border flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        <span className="text-[10px] uppercase font-semibold text-muted-foreground shrink-0 font-mono">
          Quick:
        </span>
        {COMMAND_SUGGESTIONS.map(cmd => (
          <button
            key={cmd}
            onClick={() => handleCommand(cmd)}
            className="px-2.5 py-1 rounded-full border border-border bg-background hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Input Prompt Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 bg-card border-t border-border">
        <div className="flex items-center gap-2 flex-1 font-mono text-xs px-3 py-2 rounded-xl bg-background border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <span className="text-primary font-bold select-none">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type 'help', 'eval <password>', 'diceware', 'stuffing'..."
            className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/50 text-xs font-mono"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <button
          type="submit"
          className="p-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shrink-0"
          aria-label="Send command"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  )
}
