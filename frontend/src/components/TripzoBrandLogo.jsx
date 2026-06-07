import React from 'react';

export default function TripzoBrandLogo({ className = "h-12", isSplash = false }) {
  // Brand color variables adapting to light/dark themes
  const letterFillClass = isSplash ? "fill-white" : "fill-slate-900 dark:fill-white";
  const strokeColorClass = isSplash ? "stroke-white" : "stroke-slate-900 dark:stroke-white";

  return (
    <svg 
      viewBox="0 0 420 120" 
      className={`${className} transition-colors duration-300`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Dynamic Glow Filter for the Location Pin */}
        <filter id="cyanGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* 100% Transparent Mask for Walking Traveler cutout inside Letter R stem */}
        <mask id="travelerMask">
          <rect x="0" y="0" width="420" height="120" fill="white" />
          {/* Traveler Head */}
          <circle cx="87.5" cy="63" r="3.8" fill="black" />
          {/* Traveler Body & Walking Stance Legs */}
          <path 
            d="M 85.5 68.5 H 89.5 L 91.5 78 L 89 89 H 86 L 87.5 79 L 85 81 L 84 89 H 81 L 83 77 L 81.5 70 C 81.5 69 83 68.5 85.5 68.5 Z" 
            fill="black" 
          />
          {/* Tilted Trolley Suitcase behind traveler */}
          <rect x="75.5" y="68" width="6" height="11" rx="0.8" transform="rotate(-15 78.5 73)" fill="black" />
          {/* Suitcase Handle connector */}
          <path d="M 80 67 L 84 70" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
        </mask>

        {/* 100% Transparent Mask for Bus Silhouette counter-cutout inside Letter O */}
        <mask id="busMask">
          <rect x="0" y="0" width="420" height="120" fill="white" />
          {/* Main Bus Frame */}
          <rect x="347" y="37" width="36" height="34" rx="4.5" fill="black" />
          {/* Side view mirror links */}
          <path d="M 344 44 Q 347 46 347 48" stroke="black" strokeWidth="1.8" fill="none" />
          <path d="M 388 44 Q 385 46 385 48" stroke="black" strokeWidth="1.8" fill="none" />
        </mask>
      </defs>
      
      {/* 1. T - Sci-Fi Stencil Block Letter */}
      <g>
        {/* Top Bar */}
        <path d="M 10 15 H 70 L 60 30 H 20 Z" className={letterFillClass} />
        {/* Stem */}
        <path d="M 32.5 35 H 47.5 V 90 H 32.5 Z" className={letterFillClass} />
      </g>
      
      {/* 2. R - Detached Stem + Angular Bowl with Traveler Mask */}
      <g mask="url(#travelerMask)">
        {/* Left Stem */}
        <path d="M 80 15 H 95 V 90 H 80 Z" className={letterFillClass} />
        {/* Angular Bowl & Leg */}
        <path 
          d="M 100 15 H 130 L 140 25 V 45 L 130 55 L 145 90 H 125 L 110 55 H 100 V 40 H 125 V 30 H 100 Z" 
          className={letterFillClass} 
        />
      </g>
      
      {/* 3. I - Shorter block for location pin */}
      <path d="M 155 35 H 170 V 90 H 155 Z" className={letterFillClass} />
      
      {/* Royal Blue Location Map Pin atop Letter I */}
      <g className="animate-bounce-slow" style={{ transformOrigin: '162.5px 29px' }}>
        <ellipse cx="162.5" cy="34" rx="4.5" ry="1.5" fill="rgba(2, 132, 199, 0.2)" />
        <path 
          d="M 162.5 4 C 157 4 152.5 8.5 152.5 14 C 152.5 20.5 162.5 29.5 162.5 29.5 C 162.5 29.5 172.5 20.5 172.5 14 C 172.5 8.5 168 4 162.5 4 Z" 
          fill="#0284c7" 
          filter="url(#cyanGlow)" 
        />
        <circle cx="162.5" cy="14" r="3.2" fill={isSplash ? "#020617" : "#ffffff"} className="dark:fill-slate-950 transition-colors duration-300" />
      </g>
      
      {/* 4. P - Detached Stem + Angular Bowl */}
      <g>
        {/* Left Stem */}
        <path d="M 185 15 H 200 V 90 H 185 Z" className={letterFillClass} />
        {/* Angular Bowl */}
        <path 
          d="M 205 15 H 235 L 245 25 V 45 L 235 55 H 205 V 40 H 230 V 30 H 205 Z" 
          className={letterFillClass} 
        />
      </g>
      
      {/* 5. Z - Sci-Fi Diagonal Block */}
      <path 
        d="M 260 15 H 320 V 30 L 285 75 H 320 V 90 H 260 V 75 L 295 30 H 260 Z" 
        className={letterFillClass} 
      />
      
      {/* 6. O - Hexagonal Letter with Bus Cutout */}
      <g>
        {/* Letter O Frame */}
        <path 
          fillRule="evenodd" 
          clipRule="evenodd" 
          d="M 350 15 H 380 L 395 30 V 75 L 380 90 H 350 L 335 75 V 30 Z M 355 30 L 350 40 V 65 L 355 75 H 375 L 380 65 V 40 L 375 30 Z" 
          className={letterFillClass}
          mask="url(#busMask)"
        />
        
        {/* Detailed Front-view Luxury Bus elements */}
        <g>
          {/* Windshield Glass */}
          <rect x="350" y="42" width="30" height="13" rx="1.5" className={letterFillClass} />
          {/* Windshield wiper line */}
          <path d="M 362 53 L 368 49" stroke={isSplash ? "#020617" : "#0f172a"} className="dark:stroke-white" strokeWidth="0.8" />
          {/* Gold glowing headlights */}
          <circle cx="354" cy="63" r="2.2" fill="#eab308" />
          <circle cx="376" cy="63" r="2.2" fill="#eab308" />
          {/* Grill bars */}
          <rect x="360" y="62" width="10" height="3" rx="0.5" fill="#64748b" />
          {/* Tires */}
          <rect x="349" y="70" width="6" height="3.5" rx="1" fill="#334155" />
          <rect x="375" y="70" width="6" height="3.5" rx="1" fill="#334155" />
        </g>
      </g>

      {/* Tagline: — BUS BOOKING SYSTEM — */}
      <g className="opacity-80">
        <path d="M 20 111 H 130" strokeWidth="1.5" className={letterFillClass} />
        <text 
          x="210" 
          y="115" 
          className={letterFillClass} 
          fontSize="10.5" 
          fontWeight="bold" 
          letterSpacing="4" 
          textAnchor="middle" 
          fontFamily="sans-serif"
        >
          BUS BOOKING SYSTEM
        </text>
        <path d="M 290 111 H 400" strokeWidth="1.5" className={letterFillClass} />
      </g>
    </svg>
  );
}
