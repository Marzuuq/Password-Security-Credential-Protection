'use client'

import { useState } from 'react'
import {
  ShieldCheck,
  Cpu,
  ServerOff,
  EyeOff,
  Trash2,
  CheckCircle2,
  X,
  Layers,
  ArrowRight
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close modal"
        >
          <X className="size-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 border-b border-border pb-5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Zero-Knowledge Standard
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> In-Memory Client Only
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-foreground mt-1">
              Zero-Storage Client Architecture
            </h2>
          </div>
        </div>

        {/* Architectural Pillars */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-primary text-xs font-bold">
              <Cpu className="size-4" /> Volatile RAM Only
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Executed synchronously in your browser&apos;s JavaScript engine. No localStorage or cookies.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <ServerOff className="size-4" /> Zero Transmission
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Evaluated strictly locally. Inspect your DevTools Network tab to verify 0 outbound leaks.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-bold">
              <EyeOff className="size-4" /> Instant Purge
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Closing this tab or clicking sanitize immediately clears all memory references.
            </p>
          </div>
        </div>

        {/* K-Anonymity Educational Deep Dive */}
        <div className="mt-6 rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Layers className="size-4 text-primary" /> How K-Anonymity Protects Passwords
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In modern cryptographic verification (used by <em>Have I Been Pwned</em>), passwords can be tested against breach databases without ever revealing the password or its full hash:
          </p>

          <div className="grid gap-2.5 pt-1 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border/70 bg-muted/30">
              <span className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                1
              </span>
              <div>
                <p className="font-semibold text-foreground">Local SHA-1 Hash</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  The client computes a 40-character SHA-1 digest strictly in local browser memory.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-border/70 bg-muted/30">
              <span className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                2
              </span>
              <div>
                <p className="font-semibold text-foreground">5-Character Prefix Query</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Only the first 5 hex characters are queried. Hundreds of different passwords share this same prefix, keeping the query mathematically anonymous.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-border/70 bg-muted/30">
              <span className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                3
              </span>
              <div>
                <p className="font-semibold text-foreground">Client-Side Suffix Match</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  The database returns a batch of candidate suffixes; the client matches locally in RAM. The server never learns your password or full hash.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-xs">
          <p className="font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" /> Independent Verification Checklist:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
            <li>Open DevTools (F12) &rarr; <strong>Network Tab</strong> &rarr; Type any password &rarr; Zero requests fired.</li>
            <li>Open DevTools &rarr; <strong>Application Tab</strong> &rarr; Zero storage items recorded.</li>
            <li>Open-source pure client-side mathematical algorithms.</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-4">
          <button
            onClick={handleSanitize}
            disabled={sanitized}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 text-xs font-semibold transition-all"
          >
            <Trash2 className="size-3.5" />
            {sanitized ? 'Memory Purged & Sanitized!' : 'Sanitize & Purge Memory'}
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors"
          >
            Understood & Confirmed
          </button>
        </div>
      </div>
    </div>
  )
}
