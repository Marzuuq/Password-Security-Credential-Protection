'use client'

import { useState } from 'react'
import {
  ShieldCheck,
  Lock,
  Cpu,
  EyeOff,
  ServerOff,
  Radio,
  Trash2,
  CheckCircle2,
  HelpCircle,
  X,
  Binary,
  Layers,
  Sparkles
} from 'lucide-react'
import { hackerAudio } from '@/lib/hacker-audio'

interface ZeroStorageModalProps {
  isOpen: boolean
  onClose: () => void
  onSanitizeMemory: () => void
}

export function ZeroStorageModal({ isOpen, onClose, onSanitizeMemory }: ZeroStorageModalProps) {
  const [sanitized, setSanitized] = useState(false)

  if (!isOpen) return null

  const handleSanitize = () => {
    onSanitizeMemory()
    setSanitized(true)
    hackerAudio.playSuccess()
    setTimeout(() => {
      setSanitized(false)
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md font-mono animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-primary/50 bg-card/95 p-6 md:p-8 shadow-[0_0_50px_rgba(0,255,102,0.2)] max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          aria-label="Close modal"
        >
          <X className="size-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-primary/30 pb-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/40 border-glow">
            <ShieldCheck className="size-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
                PROVEN PRIVACY STANDARD
              </span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-400 animate-ping inline-block" /> ZERO-STORAGE ACTIVE
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight mt-1">
              ZERO-KNOWLEDGE CLIENT-SIDE ARCHITECTURE
            </h2>
          </div>
        </div>

        {/* Architectural Pillars */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-primary/30 bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-primary text-xs font-bold">
              <Cpu className="size-4" /> VOLATILE RAM ONLY
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Evaluations execute synchronously inside your browser&apos;s JavaScript engine (V8 / SpiderMonkey). No persistent browser storage is ever touched.
            </p>
          </div>

          <div className="rounded-xl border border-primary/30 bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ServerOff className="size-4" /> ZERO TRANSMISSION
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Zero outbound network packets. Inspect your browser&apos;s Developer Tools (Network Tab) to verify that no HTTP POST/GET requests occur.
            </p>
          </div>

          <div className="rounded-xl border border-primary/30 bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <EyeOff className="size-4" /> INSTANT PURGE
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              State exists solely in temporary React memory. Navigating away, closing the tab, or clicking &quot;Sanitize&quot; instantly discards the string.
            </p>
          </div>
        </div>

        {/* Deep Dive: How Zero-Knowledge Password Checking Works */}
        <div className="mt-6 rounded-xl border border-primary/30 bg-card/60 p-5 space-y-3">
          <h3 className="text-xs font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
            <Layers className="size-4" /> How K-Anonymity Protects Passwords (Educational Deep Dive)
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In modern zero-knowledge cybersecurity auditing (such as Troy Hunt&apos;s <em>Have I Been Pwned</em> model), users can verify breached passwords without ever disclosing them to a remote server using <strong>K-Anonymity mathematical hashing</strong>:
          </p>

          <div className="grid gap-3 pt-2 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-muted/40">
              <span className="size-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </span>
              <div>
                <p className="font-bold text-foreground">Local SHA-1 Hashing</p>
                <p className="text-[11px] text-muted-foreground">
                  The client browser generates a 40-character SHA-1 hash of the password strictly in local memory.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-muted/40">
              <span className="size-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </span>
              <div>
                <p className="font-bold text-foreground">5-Character Prefix Transmission</p>
                <p className="text-[11px] text-muted-foreground">
                  Only the first 5 hexadecimal characters of the hash (the prefix) are sent to the database. Over 500+ different passwords share this exact same 5-character prefix, keeping your specific password mathematically anonymous.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-muted/40">
              <span className="size-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </span>
              <div>
                <p className="font-bold text-foreground">Local Suffix Matching</p>
                <p className="text-[11px] text-muted-foreground">
                  The server returns a block of all 35-character suffixes for that prefix. The client checks if its suffix is in that block entirely within browser RAM. The server never sees the full hash or cleartext password!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="mt-6 rounded-xl border border-border/50 bg-muted/20 p-4 space-y-2 text-xs">
          <p className="font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-400" /> How you can independently verify our security:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
            <li>Open DevTools (F12) → <strong>Network Tab</strong> → Type any text into the Password Checker → Zero network requests are fired.</li>
            <li>Open DevTools → <strong>Application Tab</strong> → Check Local Storage & Session Storage → Absolutely zero entries created.</li>
            <li>The full source code runs open, client-side TypeScript with pure standard math algorithms.</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 pt-5">
          <button
            onClick={handleSanitize}
            disabled={sanitized}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/40 text-xs font-bold transition-all"
          >
            <Trash2 className="size-4" />
            {sanitized ? 'MEMORY SANITIZED & PURGED!' : 'SANITIZE & WIPE ACTIVE MEMORY'}
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-colors"
          >
            I UNDERSTAND & CONFIRM
          </button>
        </div>
      </div>
    </div>
  )
}
