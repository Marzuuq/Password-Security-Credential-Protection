'use client'

import { useEffect, useRef } from 'react'

interface MatrixProps {
  theme?: 'light' | 'dark' | string
  active?: boolean
  opacity?: number
}

export function MatrixBackground({ theme = 'light', active = true, opacity }: MatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const effectiveOpacity = opacity !== undefined 
    ? opacity 
    : theme === 'light' 
      ? 0.08 
      : 0.18

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    // Character set: Clean hex & binary glyphs
    const charString = '0123456789ABCDEF<>[]{}*+=#~_!$@&%'
    const characters = charString.split('')

    const fontSize = 14
    const columns = Math.ceil(canvas.width / fontSize)
    const drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * -80))

    const isLight = theme === 'light'
    const colorPrimary = isLight ? '#059669' : '#10b981'
    const fadeBackground = isLight ? 'rgba(248, 250, 252, 0.18)' : 'rgba(10, 15, 26, 0.12)'

    const draw = () => {
      ctx.fillStyle = fadeBackground
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${fontSize}px var(--font-mono), monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = characters[Math.floor(Math.random() * characters.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        if (Math.random() > 0.95) {
          ctx.fillStyle = isLight ? '#0f172a' : '#ffffff'
        } else {
          ctx.fillStyle = colorPrimary
        }

        ctx.fillText(char, x, y)

        if (y > canvas.height && Math.random() > 0.985) {
          drops[i] = 0
        }
        drops[i]++
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [theme, active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
      style={{ opacity: effectiveOpacity }}
      aria-hidden="true"
    />
  )
}
