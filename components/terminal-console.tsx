'use client'

import { useEffect, useRef, useState } from 'react'
import {
  analyzePassword,
  generateDicewarePassphrase,
  ANTI_PATTERNS
} from '@/lib/password-security'
import { analyzePasswordWithZyla, ZYLA_API_ENDPOINT } from '@/lib/zyla-api'
import { hackerAudio } from '@/lib/hacker-audio'
import { Terminal, Send, Trash2, Cpu, ShieldAlert, KeyRound, Lock, Sparkles, ShieldCheck, Globe } from 'lucide-react'

interface HistoryItem {
  id: string
  command: string
  output: React.ReactNode
  timestamp: string
}

interface TerminalConsoleProps {
  onThemeChange?: (theme: 'light' | 'stealth') => void
  currentTheme?: string
}

const ASCII_LOGO = `
  ██████╗  █████╗ ███████╗███████╗██╗   ██╗██████╗ 
  ██╔══██╗██╔══██╗██╔════╝██╔════╝██║   ██║██╔══██╗
  ██████╔╝███████║███████╗███████╗██║   ██║██████╔╝
  ██╔═══╝ ██╔══██║╚════██║╚════██║██║   ██║██╔══██╗
  ██║     ██║  ██║███████║███████║╚██████╔╝██║  ██║
  ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝
  [HACKER TERMINAL v3.8.0 - ZERO-STORAGE SHELL ACCESS]
`

export function TerminalConsole({ onThemeChange, currentTheme = 'light' }: TerminalConsoleProps) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'welcome',
      command: 'sys.init --verbose --zero-storage',
      output: (
        <div className="space-y-2 text-xs font-mono">
          <pre className="text-primary glow-text font-bold leading-none hidden sm:block">{ASCII_LOGO}</pre>
          <p className="text-emerald-400">✔ SYSTEM INITIALIZED: Security Console Kernel v3.8.0-release</p>
          <p className="text-cyan-400">🔒 ZERO-STORAGE ACTIVE: Evaluated 100% in browser volatile RAM.</p>
          <p className="text-muted-foreground">Type <span className="text-primary font-bold">help</span> to view available commands, <span className="text-primary font-bold">eval &lt;password&gt;</span> to scan entropy, <span className="text-primary font-bold">zyla &lt;password&gt;</span> to test Zyla Labs Cloud API, or <span className="text-primary font-bold">diceware</span> to generate a passphrase.</p>
        </div>
      ),
      timestamp: new Date().toLocaleTimeString()
    }
  ])

  const bottomRef = useRef<HTMLDivElement | null>(null)

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
          <div className="space-y-1 text-xs font-mono">
            <p className="text-primary font-bold">Available Cyber Shell Commands:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <div><span className="text-emerald-400 font-bold">eval &lt;password&gt;</span> : Deep Shannon entropy & threat analysis</div>
              <div><span className="text-emerald-400 font-bold">zyla &lt;password&gt;</span> : Query Zyla Labs Cloud API (GET endpoint #2114)</div>
              <div><span className="text-emerald-400 font-bold">cracktime &lt;password&gt;</span> : GPU & supercomputer crack time estimate</div>
              <div><span className="text-emerald-400 font-bold">diceware [count]</span> : Generate 3-6 word memorable passphrase</div>
              <div><span className="text-emerald-400 font-bold">antipatterns</span> : Show top 6 dangerous weak password habits</div>
              <div><span className="text-emerald-400 font-bold">stuffing</span> : Explain credential stuffing & password reuse risks</div>
              <div><span className="text-emerald-400 font-bold">privacy</span> : Verify zero-knowledge RAM architecture</div>
              <div><span className="text-emerald-400 font-bold">entropy &lt;password&gt;</span> : Shannon mathematical formula output</div>
              <div><span className="text-emerald-400 font-bold">hash &lt;text&gt;</span> : Output MD5, SHA-256 & SHA-1 K-Anonymity digests</div>
              <div><span className="text-emerald-400 font-bold">theme &lt;light|stealth&gt;</span> : Switch terminal theme preset</div>
              <div><span className="text-emerald-400 font-bold">sound</span> : Toggle audio sound synthesizer</div>
              <div><span className="text-emerald-400 font-bold">clear</span> : Wipe terminal screen output</div>
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
            <div className="space-y-2 text-xs font-mono border-l-2 border-primary/50 pl-3 py-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Target:</span>
                <span className="text-foreground bg-muted/40 px-2 py-0.5 rounded">{'*'.repeat(res.length)}</span>
                <span className="font-bold" style={{ color: res.toneColor }}>[{res.rating}]</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
                <div>Length: <span className="text-foreground font-bold">{res.length}</span></div>
                <div>Entropy: <span className="text-primary font-bold">{res.entropyBits} bits</span></div>
                <div>Pool Size: <span className="text-foreground font-bold">{res.poolSize}</span></div>
                <div>Score: <span className="text-foreground font-bold">{res.strengthScore}/100</span></div>
              </div>
              <div className="text-emerald-400">
                <p>Crack Time (8x RTX 4090 GPU Rig): <span className="text-foreground font-bold">{res.crackTimes.offlineGpu}</span></p>
                <p>Crack Time (Supercomputer): <span className="text-foreground font-bold">{res.crackTimes.supercomputer}</span></p>
              </div>
              {res.patternsDetected.length > 0 ? (
                <div className="text-destructive">
                  ⚠ Threats: {res.patternsDetected.map(p => p.name).join(' | ')}
                </div>
              ) : (
                <div className="text-emerald-400">✔ Zero common leak patterns matched.</div>
              )}
            </div>
          )
        }
        break

      case 'zyla':
      case 'zylalabs':
      case 'api':
      case 'apicheck':
        if (!args) {
          outputNode = <p className="text-destructive font-mono text-xs">Error: Missing password. Usage: zyla &lt;password&gt;</p>
        } else {
          hackerAudio.playScan()
          const zylaRes = await analyzePasswordWithZyla(args)
          if (zylaRes.success) {
            hackerAudio.playSuccess()
            outputNode = (
              <div className="space-y-2 text-xs font-mono border-l-2 border-emerald-400 pl-3 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Endpoint:</span>
                  <span className="text-emerald-400 font-bold">GET /api/2254/.../2114/password+analysis</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                    {zylaRes.status || 200} OK ({zylaRes.latencyMs}ms)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Mode:</span>
                  <span className={zylaRes.mode === 'live_api' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {zylaRes.mode === 'live_api' ? '⚡ LIVE ZYLA CLOUD' : '🧪 SANDBOX SIMULATION'}
                  </span>
                  <span className="text-muted-foreground">| Result:</span>
                  <span className="text-primary font-bold uppercase tracking-wider glow-text">
                    &quot;{zylaRes.data?.result || 'Evaluated'}&quot;
                  </span>
                </div>
                <div className="p-2 rounded bg-background/80 border border-border/40 text-[11px] text-muted-foreground select-all">
                  <code>{JSON.stringify(zylaRes.data || zylaRes, null, 2)}</code>
                </div>
                {zylaRes.note && (
                  <p className="text-[10px] text-amber-400">ℹ {zylaRes.note}</p>
                )}
              </div>
            )
          } else {
            hackerAudio.playAlert()
            outputNode = (
              <div className="space-y-1 text-xs font-mono text-destructive border-l-2 border-destructive pl-3 py-1">
                <p className="font-bold">❌ ZYLA API ERROR:</p>
                <p>{zylaRes.error || 'Failed to communicate with Zyla Labs endpoint'}</p>
                <p className="text-[10px] text-muted-foreground">Ensure your API key is valid or check network connection.</p>
              </div>
            )
          }
        }
        break

      case 'diceware':
      case 'passphrase':
        const wordCount = Math.min(6, Math.max(3, parseInt(args) || 4))
        const phrase = generateDicewarePassphrase(wordCount, '-', false, false)
        hackerAudio.playSuccess()
        outputNode = (
          <div className="space-y-1.5 text-xs font-mono border-l-2 border-emerald-500 pl-3 py-1">
            <p className="text-emerald-400 font-bold">✨ Generated Diceware Passphrase ({wordCount} words):</p>
            <p className="text-primary font-bold text-sm select-all tracking-wider">{phrase}</p>
            <p className="text-muted-foreground">Length: {phrase.length} chars | Estimated Entropy: ~{Math.round(wordCount * 12.9)} bits | Memory Rating: Instant Visual Recall</p>
          </div>
        )
        break

      case 'antipatterns':
      case 'patterns':
        outputNode = (
          <div className="space-y-2 text-xs font-mono">
            <p className="text-primary font-bold">Top Dangerous Weak Password Anti-Patterns:</p>
            <div className="space-y-1.5 text-muted-foreground">
              {ANTI_PATTERNS.map((p, idx) => (
                <div key={p.id}>
                  <span className="text-emerald-400 font-bold">{idx + 1}. {p.title}</span> : {p.subtitle} (GPU Crack: <span className="text-destructive font-bold">{p.estimatedCrackTime}</span>)
                </div>
              ))}
            </div>
          </div>
        )
        break

      case 'stuffing':
      case 'reuse':
        outputNode = (
          <div className="space-y-1.5 text-xs font-mono border-l-2 border-destructive pl-3 py-1">
            <p className="text-destructive font-bold">⚠ THE CREDENTIAL STUFFING ATTACK MECHANISM:</p>
            <p className="text-muted-foreground">1. Attackers obtain leaked email+password databases from compromised minor websites.</p>
            <p className="text-muted-foreground">2. Automated botnets (SilverBullet/Sentry MBA) replay combos against banks, emails, cloud storage.</p>
            <p className="text-muted-foreground">3. Reusing one password across 10 sites means 1 breach compromises all 10 accounts.</p>
            <p className="text-emerald-400 font-bold">✔ Solution: Use a unique 16+ char passphrase per service in a password manager.</p>
          </div>
        )
        break

      case 'privacy':
      case 'zerostorage':
        outputNode = (
          <div className="space-y-1 text-xs font-mono border-l-2 border-cyan-400 pl-3 py-1">
            <p className="text-cyan-400 font-bold">🔒 ZERO-KNOWLEDGE & ZERO-STORAGE VERIFICATION:</p>
            <p className="text-muted-foreground">• In-Memory Only: Evaluated strictly in local JavaScript volatile memory.</p>
            <p className="text-muted-foreground">• Zero Transmission: 0 HTTP POST/GET requests dispatched across the network.</p>
            <p className="text-muted-foreground">• K-Anonymity Model: Explains how 5-character SHA-1 hash prefixes check leaks anonymously.</p>
          </div>
        )
        break

      case 'cracktime':
        if (!args) {
          outputNode = <p className="text-destructive font-mono text-xs">Usage: cracktime &lt;password&gt;</p>
        } else {
          const res = analyzePassword(args)
          outputNode = (
            <div className="space-y-1 text-xs font-mono text-emerald-400">
              <p className="text-primary font-bold">⚡ BRUTE FORCE TIME-TO-CRACK ESTIMATOR:</p>
              <p>• Throttled Online (10 req/s): <span className="text-foreground">{res.crackTimes.onlineThrottled}</span></p>
              <p>• Fast Online Botnet (1,000 req/s): <span className="text-foreground">{res.crackTimes.onlineFast}</span></p>
              <p>• 8x RTX 4090 GPU Rig (100 Billion H/s): <span className="text-foreground font-bold">{res.crackTimes.offlineGpu}</span></p>
              <p>• Quantum/Supercomputer Cluster: <span className="text-foreground font-bold">{res.crackTimes.supercomputer}</span></p>
            </div>
          )
        }
        break

      case 'entropy':
        if (!args) {
          outputNode = <p className="text-destructive font-mono text-xs">Usage: entropy &lt;password&gt;</p>
        } else {
          const res = analyzePassword(args)
          outputNode = (
            <div className="space-y-1 text-xs font-mono">
              <p>Password Length (L): <span className="text-primary font-bold">{res.length}</span></p>
              <p>Alphabet Character Pool (N): <span className="text-primary font-bold">{res.poolSize}</span></p>
              <p>Calculated Shannon Entropy E = L × log2(N): <span className="text-emerald-400 font-bold">{res.entropyBits} bits</span></p>
              <p className="text-muted-foreground">Note: 60+ bits is recommended for strong defense against offline GPU dictionary attacks.</p>
            </div>
          )
        }
        break

      case 'hash':
        if (!args) {
          outputNode = <p className="text-destructive font-mono text-xs">Usage: hash &lt;string&gt;</p>
        } else {
          const res = analyzePassword(args)
          outputNode = (
            <div className="space-y-1 text-xs font-mono text-muted-foreground">
              <p>MD5: <span className="text-primary select-all">{res.hashSimulations.md5}</span></p>
              <p>SHA-256: <span className="text-primary select-all">{res.hashSimulations.sha256}</span></p>
              <p>SHA-1 (K-Anonymity): <span className="text-emerald-400 select-all">{res.hashSimulations.sha1}</span></p>
              <p>K-Anonymity 5-char Prefix: <span className="text-cyan-400 font-bold">{res.hashSimulations.kAnonymityPrefix}</span></p>
            </div>
          )
        }
        break

      case 'theme':
        if (['light', 'stealth'].includes(args.toLowerCase())) {
          onThemeChange?.(args.toLowerCase() as any)
          outputNode = <p className="text-emerald-400 text-xs font-mono">✔ Switched active theme preset to: <span className="font-bold text-primary">{args}</span></p>
        } else {
          outputNode = <p className="text-destructive text-xs font-mono">Invalid theme option. Valid themes: light, stealth</p>
        }
        break

      case 'sound':
        const state = hackerAudio.toggleMute()
        outputNode = <p className="text-emerald-400 text-xs font-mono">Audio feedback sound synth is now: <span className="font-bold">{state ? 'ENABLED 🔊' : 'MUTED 🔇'}</span></p>
        break

      case 'clear':
      case 'cls':
        setHistory([])
        setInput('')
        return

      default:
        outputNode = <p className="text-destructive text-xs font-mono">Command not recognized: &apos;{cmd}&apos;. Type &apos;help&apos; for command list.</p>
        break
    }

    setHistory(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        command: cmdStr,
        output: outputNode,
        timestamp: new Date().toLocaleTimeString()
      }
    ])

    setInput('')
  }

  return (
    <div className="flex flex-col h-[560px] rounded-xl border border-primary/40 bg-card/90 shadow-[0_0_20px_rgba(0,255,102,0.1)] backdrop-blur-md overflow-hidden font-mono">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/60 border-b border-primary/30">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-red-500/80 inline-block" />
            <span className="size-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="size-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-bold text-primary flex items-center gap-1 ml-2">
            <Terminal className="size-3.5" /> root@passguard-sec:~#
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="hidden sm:inline-flex items-center gap-1 text-cyan-400">
            <ShieldCheck className="size-3" /> ZERO-STORAGE MODE
          </span>
          <button
            onClick={() => { setHistory([]); hackerAudio.playKeypress() }}
            className="p-1 hover:text-primary transition-colors"
            title="Clear terminal screen"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Output Console Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-mono custom-scrollbar">
        {history.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-primary font-bold">root@passguard:~#</span>
              <span className="text-foreground">{item.command}</span>
              <span className="text-[10px] ml-auto opacity-50">{item.timestamp}</span>
            </div>
            <div className="pl-4">{item.output}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleCommand(input)
        }}
        className="flex items-center gap-2 px-4 py-3 bg-muted/40 border-t border-primary/30"
      >
        <span className="text-primary font-bold text-xs select-none">root@passguard:~#</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type 'help', 'eval mypassword', 'diceware', or 'antipatterns'..."
          className="flex-1 bg-transparent text-xs font-mono text-foreground outline-none placeholder:text-muted-foreground/60"
          autoFocus
        />
        <button
          type="submit"
          className="p-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 transition-colors"
        >
          <Send className="size-3.5" />
        </button>
      </form>
    </div>
  )
}
