'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Logo({ size = 60 }) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    // SVG Fallback
    return (
      <div className="flex items-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#1e5f3f', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Shield outline */}
          <path 
            d="M100 20 L160 40 L160 100 Q160 140 100 180 Q40 140 40 100 L40 40 Z" 
            fill="url(#shieldGrad)" 
            stroke="#000" 
            strokeWidth="2"
          />
          {/* Inner quadrants */}
          <g transform="translate(50, 50)">
            {/* Top-left: Tree */}
            <rect x="0" y="0" width="50" height="50" fill="#90ee90" stroke="#000" strokeWidth="1"/>
            <path d="M25 40 L25 30 L20 25 L25 20 L30 25 L25 30" fill="#1e5f3f" stroke="#1e5f3f" strokeWidth="1.5"/>
            <rect x="23" y="30" width="4" height="10" fill="#654321"/>
            
            {/* Top-right: Mountains */}
            <rect x="50" y="0" width="50" height="50" fill="#87ceeb" stroke="#000" strokeWidth="1"/>
            <path d="M60 50 L70 30 L80 40 L90 25 L100 50 Z" fill="#4169e1" stroke="#000" strokeWidth="1"/>
            <path d="M70 30 L75 20 L80 25" fill="#ffffff" stroke="none"/>
            <path d="M85 25 L90 15 L95 20" fill="#ffffff" stroke="none"/>
            
            {/* Bottom-left: Desert */}
            <rect x="0" y="50" width="50" height="50" fill="#f4a460" stroke="#000" strokeWidth="1"/>
            <path d="M10 70 Q20 60 30 70 T50 70 L50 100 L10 100 Z" fill="#cd853f" stroke="#000" strokeWidth="1"/>
            <path d="M15 80 Q25 70 35 80 T50 80 L50 100 L15 100 Z" fill="#daa520" stroke="#000" strokeWidth="1"/>
            
            {/* Bottom-right: Hills */}
            <rect x="50" y="50" width="50" height="50" fill="#90ee90" stroke="#000" strokeWidth="1"/>
            <path d="M50 100 Q60 80 70 90 Q80 70 90 85 Q95 75 100 90 L100 100 Z" fill="#228b22" stroke="#000" strokeWidth="1"/>
          </g>
        </svg>
      </div>
    )
  }

  return (
    <div className="flex items-center" style={{ width: size, height: size }}>
      <Image
        src="/22.png"
        alt="Logo"
        width={size}
        height={size}
        className="object-contain"
        priority
        onError={() => setImageError(true)}
      />
    </div>
  )
}
