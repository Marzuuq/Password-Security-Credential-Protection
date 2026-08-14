'use client'

import { useEffect, useRef, useState } from 'react'
import { analyzePassword } from '@/lib/password-security'
import { hackerAudio } from '@/lib/hacker-audio'
import { Terminal, Send, Trash2, Cpu, ShieldAlert } from 'lucide-react'

interface HistoryItem {
  id: string
  command: string
  output: React.ReactNode
  timestamp: string
}

interface TerminalConsoleProps {
  onThemeChange?: (theme: 'matrix' | 'cyber' | 'red-alert' | 'stealth') => void
  currentTheme?: string
}

const ASCII_LOGO = `
  ██████╗  █████╗ ███████╗███████╗██╗   ██╗██████╗ 
  ██╔══██╗██╔══██╗██╔════╝██╔════╝██║   ██║██╔══██╗
  ██████╔╝███████║███████╗███████╗██║   ██║██████╔╝
  ██╔═══╝ ██╔══██║╚════██║╚════██║██║   ██║██╔══██╗
  ██║     ██║  ██║███████║███████║╚██████╔╝██║  ██║
  ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝
  [HACKER TERMINAL v3.6.0 - UNRESTRICTED SHELL ACCESS]
`

export function TerminalConsole({ onThemeChange, currentTheme = 'matrix' }: TerminalConsoleProps) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'welcome',
      command: 'sys.init --verbose',
      output: (
        <div className="space-y-2 text-xs font-mono">
          <pre className="text-primary glow-text font-bold leading-none hidden sm:block">{ASCII_LOGO}</pre>
          <p className="text-emerald-400">✔ SYSTEM INITIALIZED: Security Console Kernel v3.6.0-release</p>
          <p className="text-muted-foreground">Type <span className="text-primary font-bold">help</span> to view available hacker commands or <span className="text-primary font-bold">eval &lt;password&gt;</span> to scan entropy.</p>
        </div>
      ),
      timestamp: new Date().toLocaleTimeString()
    }
  ])

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleCommand = (cmdStr: string) => {
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
            <p className="text-primary font-bold">Available Cyber Commands:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <div><span className="text-emerald-400 font-bold">eval &lt;password&gt;</span> : Perform deep entropy & threat analysis</div>
              <div><span className="text-emerald-400 font-bold">cracktime &lt;password&gt;</span> : Calculate GPU brute-force crack time</div>
              <div><span className="text-emerald-400 font-bold">entropy &lt;password&gt;</span> : Output Shannon entropy bit calculation</div>
              <div><span className="text-emerald-400 font-bold">hash &lt;text&gt;</span> : Generate simulated MD5 & SHA-256 digests</div>
              <div><span className="text-emerald-400 font-bold">theme &lt;matrix|cyber|red-alert|stealth&gt;</span> : Switch terminal theme</div>
              <div><span className="text-emerald-400 font-bold">sound</span> : Toggle audio synth effect clicks</div>
              <div><span className="text-emerald-400 font-bold">clear</span> : Wipe terminal screen output</div>
              <div><span className="text-emerald-400 font-bold">matrix</span> : Toggle background matrix digital rain</div>
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
                <span className="text-primary font-bold">[{res.rating}]</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
                <div>Length: <span className="text-foreground font-bold">{res.length}</span></div>
                <div>Entropy: <span className="text-primary font-bold">{res.entropyBits} bits</span></div>
                <div>Pool Size: <span className="text-foreground font-bold">{res.poolSize}</span></div>
                <div>Score: <span className="text-foreground font-bold">{res.strengthScore}/100</span></div>
              </div>
              <div className="text-emerald-400">
                <p>Crack Time (100 GH/s GPU): <span className="text-foreground font-bold">{res.crackTimes.offlineGpu}</span></p>
                <p>Crack Time (Supercomputer): <span className="text-foreground font-bold">{res.crackTimes.supercomputer}</span></p>
              </div>
              {res.patternsDetected.length > 0 ? (
                <div className="text-destructive">
                  ⚠ Warnings: {res.patternsDetected.join(' | ')}
                </div>
              ) : (
                <div className="text-emerald-400">✔ Zero common leak patterns matched.</div>
              )}
            </div>
          )
        }
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
              <p>• Fast Online (1k req/s): <span className="text-foreground">{res.crackTimes.onlineFast}</span></p>
              <p>• Offline Rig (100 Billion H/s): <span className="text-foreground">{res.crackTimes.offlineGpu}</span></p>
              <p>• Quantum/Supercomputer Cluster: <span className="text-foreground">{res.crackTimes.supercomputer}</span></p>
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
            </div>
          )
        }
        break

      case 'theme':
        if (['matrix', 'cyber', 'red-alert', 'stealth'].includes(args.toLowerCase())) {
          onThemeChange?.(args.toLowerCase() as any)
          outputNode = <p className="text-emerald-400 text-xs font-mono">✔ Switched active theme preset to: <span className="font-bold text-primary">{args}</span></p>
        } else {
          outputNode = <p className="text-destructive text-xs font-mono">Invalid theme option. Valid themes: matrix, cyber, red-alert, stealth</p>
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
    <div className="flex flex-col h-[520px] rounded-xl border border-primary/40 bg-card/90 shadow-[0_0_20px_rgba(0,255,102,0.1)] backdrop-blur-md overflow-hidden font-mono">
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
          <span className="hidden sm:inline-flex items-center gap-1">
            <Cpu className="size-3 text-primary animate-pulse" /> ENCRYPTION: ACTIVE
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
          placeholder="Type 'help' or 'eval mypassword'..."
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
