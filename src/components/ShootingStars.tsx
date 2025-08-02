'use client'

import { useEffect, useState, useRef } from 'react'

interface ShootingStar {
  id: string
  x: number
  y: number
  angle: number
  speed: number
  opacity: number
  scale: number
  trail: Array<{ x: number; y: number; opacity: number }>
}

export default function ShootingStars() {
  const [stars, setStars] = useState<ShootingStar[]>([])
  const [isEnabled, setIsEnabled] = useState(true)
  const animationRef = useRef<number | null>(null)
  const spawnRef = useRef<NodeJS.Timeout | null>(null)

  // Check localStorage periodically for changes
  useEffect(() => {
    const checkLocalStorage = () => {
      const savedShootingStars = localStorage.getItem('shootingStarsEnabled')
      if (savedShootingStars !== null) {
        const newEnabled = JSON.parse(savedShootingStars)
        if (newEnabled !== isEnabled) {
          console.log('Shooting stars enabled changed:', isEnabled, '->', newEnabled)
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
    console.log('Shooting stars effect - isEnabled:', isEnabled)
    
    // Clear any existing animations when disabled
    if (!isEnabled) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      if (spawnRef.current) {
        clearInterval(spawnRef.current)
        spawnRef.current = null
      }
      setStars([]) // Clear all stars
      return
    }

    // Create a single star
    const createStar = (): ShootingStar => {
      const angle = Math.random() * Math.PI * 2 // Random direction
      const speed = 40 + Math.random() * 20 // Much faster speed (40-60)
      const startX = Math.random() * window.innerWidth
      const startY = Math.random() * window.innerHeight
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        x: startX,
        y: startY,
        angle,
        speed,
        opacity: 0.3 + Math.random() * 0.4, // Highly transparent (0.3-0.7)
        scale: 1,
        trail: []
      }
    }

    // Animation loop using requestAnimationFrame for better performance
    const animateStars = () => {
      setStars(prevStars => {
        const updatedStars = prevStars.map(star => {
          // Update position
          const newX = star.x + Math.cos(star.angle) * star.speed * 0.2 // Increased speed factor
          const newY = star.y + Math.sin(star.angle) * star.speed * 0.2
          
          // Add trail point
          const newTrail = [
            { x: star.x, y: star.y, opacity: star.opacity * 0.6 },
            ...star.trail.slice(0, 6) // Keep last 6 trail points
          ]
          
          // Update trail opacity
          const updatedTrail = newTrail.map((point, index) => ({
            ...point,
            opacity: point.opacity * 0.8
          }))
          
          // Check if star is off screen
          const isOffScreen = newX < -100 || newX > window.innerWidth + 100 || 
                             newY < -100 || newY > window.innerHeight + 100
          
          if (isOffScreen) {
            console.log('Star went off screen:', star.id)
            return null // Remove star when off screen
          }
          
          return {
            ...star,
            x: newX,
            y: newY,
            trail: updatedTrail
          }
        }).filter(star => star !== null) as ShootingStar[]
        
        if (updatedStars.length !== prevStars.length) {
          console.log('Stars count changed:', prevStars.length, '->', updatedStars.length)
        }
        
        return updatedStars
      })
      
      // Continue animation if enabled
      if (isEnabled) {
        animationRef.current = requestAnimationFrame(animateStars)
      }
    }

    // Spawn a new star every 10 seconds
    const spawnStar = () => {
      if (isEnabled) {
        console.log('Spawning new star, isEnabled:', isEnabled)
        setStars(prev => {
          const newStars = [...prev, createStar()]
          console.log('Total stars now:', newStars.length)
          return newStars
        })
      }
    }

    // Initial star
    spawnStar()

    // Spawn new star every 10 seconds
    spawnRef.current = setInterval(spawnStar, 10000)
    
    // Start animation loop
    animationRef.current = requestAnimationFrame(animateStars)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      if (spawnRef.current) {
        clearInterval(spawnRef.current)
        spawnRef.current = null
      }
    }
  }, [isEnabled])

  console.log('ShootingStars render - stars:', stars.length, 'isEnabled:', isEnabled)

  return (
    <div 
      data-shooting-stars
      className="fixed inset-0 pointer-events-none z-[1] overflow-hidden"
      style={{ display: isEnabled ? 'block' : 'none' }}
    >
      {stars.map(star => (
        <div key={star.id} className="absolute">
          {/* Star trail */}
          {star.trail.map((point, index) => (
            <div
              key={`${star.id}-trail-${index}`}
              className="absolute w-3 h-3 bg-gradient-to-r from-white/60 to-white/30 rounded-full"
              style={{
                left: point.x,
                top: point.y,
                opacity: point.opacity,
                transform: 'translate(-50%, -50%)',
                filter: 'blur(2px)',
                boxShadow: '0 0 8px rgba(255, 255, 255, 0.4)'
              }}
            />
          ))}
          
          {/* Main star */}
          <div
            className="absolute w-4 h-4 bg-gradient-to-r from-white/80 via-white/60 to-white/40 rounded-full"
            style={{
              left: star.x,
              top: star.y,
              opacity: star.opacity,
              transform: 'translate(-50%, -50%)',
              filter: 'blur(1px)',
              boxShadow: '0 0 12px rgba(255, 255, 255, 0.6), 0 0 24px rgba(255, 255, 255, 0.3)'
            }}
          />
        </div>
      ))}
    </div>
  )
} 