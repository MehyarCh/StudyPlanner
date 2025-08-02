'use client'

import { useState, useEffect } from 'react'
import { Sparkles, MousePointer } from 'lucide-react'

export default function EffectsToggle() {
  const [cursorTrailEnabled, setCursorTrailEnabled] = useState(true)
  const [shootingStarsEnabled, setShootingStarsEnabled] = useState(true)

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedCursorTrail = localStorage.getItem('cursorTrailEnabled')
    const savedShootingStars = localStorage.getItem('shootingStarsEnabled')
    
    if (savedCursorTrail !== null) {
      setCursorTrailEnabled(JSON.parse(savedCursorTrail))
    }
    if (savedShootingStars !== null) {
      setShootingStarsEnabled(JSON.parse(savedShootingStars))
    }
  }, [])

  const toggleCursorTrail = () => {
    const newValue = !cursorTrailEnabled
    setCursorTrailEnabled(newValue)
    localStorage.setItem('cursorTrailEnabled', JSON.stringify(newValue))
  }

  const toggleShootingStars = () => {
    const newValue = !shootingStarsEnabled
    setShootingStarsEnabled(newValue)
    localStorage.setItem('shootingStarsEnabled', JSON.stringify(newValue))
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      {/* Cursor Trail Toggle */}
      <button
        onClick={toggleCursorTrail}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 shadow-lg backdrop-blur-sm border ${
          cursorTrailEnabled
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500/50 shadow-blue-500/25'
            : 'bg-gray-800/80 text-gray-300 border-gray-600/50 hover:bg-gray-700/80'
        }`}
        title="Toggle cursor trail effect"
      >
        <MousePointer className="h-4 w-4" />
        <span className="text-sm font-medium">Cursor</span>
      </button>

      {/* Shooting Stars Toggle */}
      <button
        onClick={toggleShootingStars}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 shadow-lg backdrop-blur-sm border ${
          shootingStarsEnabled
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-500/50 shadow-purple-500/25'
            : 'bg-gray-800/80 text-gray-300 border-gray-600/50 hover:bg-gray-700/80'
        }`}
        title="Toggle shooting stars effect"
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">Stars</span>
      </button>
    </div>
  )
} 