'use client'

import { useEffect, useRef } from 'react'

interface MatrixProps {
  theme?: 'matrix' | 'cyber' | 'red-alert' | 'stealth'
  active?: boolean
  opacity?: number
}

export function MatrixBackground({ theme = 'matrix', active = true, opacity = 0.4 }: MatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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

    // Matrix characters: Katakana, numbers, symbols, hex
    const charString = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEF<>[]{}*+=#/\\:;~_!$'
    const characters = charString.split('')

    const fontSize = 14
    const columns = Math.ceil(canvas.width / fontSize)
    const drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * -100))

    let colorPrimary = '#00ff66'
    let colorSecondary = '#003311'

    if (theme === 'cyber') {
      colorPrimary = '#00f3ff'
      colorSecondary = '#002b33'
    } else if (theme === 'red-alert') {
      colorPrimary = '#ff0055'
      colorSecondary = '#330011'
    } else if (theme === 'stealth') {
      colorPrimary = '#10b981'
      colorSecondary = '#064e3b'
    }

    const draw = () => {
      // Semi-transparent fade background to leave trailing ghost paths
      ctx.fillStyle = 'rgba(5, 8, 7, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = characters[Math.floor(Math.random() * characters.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        // Head character is glowing bright white/accent
        if (Math.random() > 0.9) {
          ctx.fillStyle = '#ffffff'
        } else {
          ctx.fillStyle = colorPrimary
        }

        ctx.fillText(char, x, y)

        if (y > canvas.height && Math.random() > 0.975) {
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
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
      style={{ opacity }}
    />
  )
}
