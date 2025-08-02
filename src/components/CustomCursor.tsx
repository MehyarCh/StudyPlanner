'use client'

import { useEffect, useState, useRef } from 'react'

interface WavePoint {
  id: string
  x: number
  y: number
  opacity: number
  color: string
  waveOffset: number
  waveAmplitude: number
  thickness: number
}

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [wavePoints, setWavePoints] = useState<WavePoint[]>([])
  const [isEnabled, setIsEnabled] = useState(true)
  const animationRef = useRef<number | null>(null)

  const neonColors = [
    'rgba(147, 51, 234, 0.6)', // Purple
    'rgba(59, 130, 246, 0.6)', // Blue
    'rgba(236, 72, 153, 0.6)', // Pink
    'rgba(16, 185, 129, 0.6)', // Green
    'rgba(245, 158, 11, 0.6)', // Orange
  ]

  // Check localStorage periodically for changes
  useEffect(() => {
    const checkLocalStorage = () => {
      const savedCursorTrail = localStorage.getItem('cursorTrailEnabled')
      if (savedCursorTrail !== null) {
        const newEnabled = JSON.parse(savedCursorTrail)
        if (newEnabled !== isEnabled) {
          console.log('Cursor trail enabled changed:', isEnabled, '->', newEnabled)
          setIsEnabled(newEnabled)
        }
      }
    }

    // Check immediately
    checkLocalStorage()

    // Check every 100ms for changes
    const interval = setInterval(checkLocalStorage, 100)

    return () => clearInterval(interval)
  }, [isEnabled])

  useEffect(() => {
    console.log('Cursor trail effect - isEnabled:', isEnabled)
    
    if (!isEnabled) {
      // Clear animation when disabled
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      setWavePoints([]) // Clear all wave points
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      
      // Check distance from last point before adding new one
      setWavePoints(prev => {
        if (prev.length > 0) {
          const lastPoint = prev[prev.length - 1]
          const dx = e.clientX - lastPoint.x
          const dy = e.clientY - lastPoint.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // Only add new point if mouse has moved enough
          if (distance > 3) { // Minimum distance threshold
            const newWavePoint: WavePoint = {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              x: e.clientX,
              y: e.clientY,
              opacity: 1,
              color: neonColors[Math.floor(Math.random() * neonColors.length)],
              waveOffset: Math.random() * Math.PI * 2,
              waveAmplitude: 0.1 + Math.random() * 0.2,
              thickness: 3 + Math.random() * 4
            }
            return [...prev, newWavePoint]
          }
          return prev
        } else {
          // First point - always add it
          const newWavePoint: WavePoint = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            x: e.clientX,
            y: e.clientY,
            opacity: 1,
            color: neonColors[Math.floor(Math.random() * neonColors.length)],
            waveOffset: Math.random() * Math.PI * 2,
            waveAmplitude: 0.1 + Math.random() * 0.2,
            thickness: 3 + Math.random() * 4
          }
          return [newWavePoint]
        }
      })
    }

    // Animate wave points using requestAnimationFrame for better performance
    const animateWave = () => {
      setWavePoints(prev => 
        prev
          .map(point => ({
            ...point,
            opacity: point.opacity - 0.012, // Even faster fade (was 0.008)
            waveOffset: point.waveOffset + 0.02,
            waveAmplitude: point.waveAmplitude * 0.998,
            thickness: point.thickness * 0.98 // Faster thickness decay (was 0.99)
          }))
          .filter(point => point.opacity > 0 && point.thickness > 0.5)
      )
      
      // Continue animation if enabled
      if (isEnabled) {
        animationRef.current = requestAnimationFrame(animateWave)
      }
    }

    // Start animation loop
    animationRef.current = requestAnimationFrame(animateWave)
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [isEnabled])

  console.log('CustomCursor render - wavePoints:', wavePoints.length, 'isEnabled:', isEnabled)

  // Create wave path from points
  const createWavePath = (points: WavePoint[]) => {
    if (points.length < 2) return ''
    
    let path = `M ${points[0].x} ${points[0].y}`
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      
      // Calculate control points for smooth curve
      const dx = curr.x - prev.x
      const dy = curr.y - prev.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance > 1) { // Reduced threshold for shorter trail (was 2)
        // Add wave offset to y position with smoother interpolation
        const waveY = curr.y + Math.sin(curr.waveOffset) * curr.waveAmplitude * 10 // Further reduced amplitude
        
        // Use smooth curves for all segments
        if (i === 1) {
          // First segment - use line to
          path += ` L ${curr.x} ${waveY}`
        } else {
          // Use smooth curves for subsequent segments with better control points
          const prevWaveY = prev.y + Math.sin(prev.waveOffset) * prev.waveAmplitude * 10
          const controlX = (prev.x + curr.x) / 2
          const controlY = (prevWaveY + waveY) / 2
          path += ` Q ${controlX} ${controlY} ${curr.x} ${waveY}`
        }
      }
    }
    
    return path
  }

  return (
    <>
      {/* Fluid wave trail */}
      <svg
        data-cursor-trail
        className="fixed pointer-events-none z-[9998] w-full h-full"
        style={{ left: 0, top: 0, display: isEnabled ? 'block' : 'none' }}
      >
        {/* Wave path */}
        <path
          d={createWavePath(wavePoints)}
          fill="none"
          stroke="url(#waveGradient)"
          strokeWidth="16" // Much wider trail
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.4} // More transparent
          filter="url(#glow)"
        />
        
        {/* Wave glow effect */}
        <path
          d={createWavePath(wavePoints)}
          fill="none"
          stroke="url(#waveGradient)"
          strokeWidth="32" // Much wider glow
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.15} // More transparent glow
          filter="url(#blur)"
        />
        
        {/* Wave particles */}
        {wavePoints.map((point, index) => {
          if (index % 3 === 0) { // Every 3rd point for performance
            const waveY = point.y + Math.sin(point.waveOffset) * point.waveAmplitude * 10
            return (
              <circle
                key={point.id}
                cx={point.x}
                cy={waveY}
                r={point.thickness * 0.8} // Slightly larger particles
                fill={point.color}
                opacity={point.opacity * 0.4} // More transparent particles
              />
            )
          }
          return null
        })}
        
        {/* Gradients */}
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(147, 51, 234, 0.6)" />
            <stop offset="25%" stopColor="rgba(59, 130, 246, 0.6)" />
            <stop offset="50%" stopColor="rgba(236, 72, 153, 0.6)" />
            <stop offset="75%" stopColor="rgba(16, 185, 129, 0.6)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0.6)" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="blur">
            <feGaussianBlur stdDeviation="8"/>
          </filter>
        </defs>
      </svg>
    </>
  )
} 