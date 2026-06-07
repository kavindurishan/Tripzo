import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, MapPin, Compass } from 'lucide-react';
import TripzoBrandLogo from './TripzoBrandLogo.jsx';

export default function IntroSplash({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Planning your route...');
  const [isExiting, setIsExiting] = useState(false);

  // Simple, elegant travel-focused status progression
  useEffect(() => {
    const statuses = [
      { p: 15, t: 'Retrieving luxury coach schedules...' },
      { p: 40, t: 'Verifying available seat maps...' },
      { p: 65, t: 'Syncing executive boarding terminals...' },
      { p: 85, t: 'Securing transaction and seat vault gateways...' },
      { p: 98, t: 'Welcome aboard Tripzo. Preparing departure deck...' }
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleExit();
          return 100;
        }
        const next = prev + 1;
        const matched = statuses.find(s => next === s.p);
        if (matched) setStatusText(matched.t);
        return next;
      });
    }, 35);

    return () => clearInterval(interval);
  }, []);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 600); // Smooth transition out
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 text-white transition-all duration-600 ease-in-out ${isExiting ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'}`}>
      
      {/* Top Subtle Travel Branding */}
      <div className="pt-12 px-8 flex justify-between items-center z-10 select-none w-full">
        <div className="flex items-center space-x-2 text-slate-400 font-mono text-[9px] tracking-widest uppercase">
          <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span>Tripzo Premium Mobility</span>
        </div>
        <div className="flex items-center space-x-4 text-[9px] text-slate-400/80 font-mono uppercase">
          <span>Boarding Deck Active</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </div>
      </div>

      {/* Main Centered Transit Logo & Animated Bus Journey */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 max-w-xl mx-auto w-full z-10 select-none">
        
        {/* Tripzo Brand Logo with bouncing pin and custom vector curves */}
        <TripzoBrandLogo 
          className="h-16 sm:h-20 w-auto filter drop-shadow-[0_8px_24px_rgba(6,182,212,0.18)] mb-2" 
          isSplash={true} 
        />
        <p className="text-slate-400 text-xs sm:text-sm font-medium tracking-widest uppercase opacity-75 mb-12">
          Your Premium Journey Begins Here
        </p>

        {/* Animated Horizontal Highway Loading Lane */}
        <div className="relative w-full h-[3px] bg-slate-800/80 rounded-full mb-12">
          
          {/* Active travel path trace */}
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
            style={{ width: `${progress}%` }}
          />

          {/* Animated 2D Sleek Travel Coach Bus sliding with the exact progress % */}
          <div 
            className="absolute -top-[19px] transform -translate-x-1/2 transition-all duration-300 ease-out"
            style={{ left: `${progress}%` }}
          >
            <div className="relative flex flex-col items-center">
              {/* Sleek Minimalist Coach Bus SVG */}
              <svg width="46" height="20" viewBox="0 0 46 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_4px_6px_rgba(6,182,212,0.3)]">
                {/* Main Coach Body */}
                <rect x="1" y="2" width="44" height="13" rx="3.5" fill="#06b6d4" />
                {/* Windshield front glass */}
                <path d="M37 2 H42 C44 2 45 3.5 45 5.5 L43 11 H37 Z" fill="#0f172a" />
                {/* Passenger window slots */}
                <rect x="4" y="4" width="6" height="4.5" rx="0.8" fill="#0f172a" />
                <rect x="12" y="4" width="6" height="4.5" rx="0.8" fill="#0f172a" />
                <rect x="20" y="4" width="6" height="4.5" rx="0.8" fill="#0f172a" />
                <rect x="28" y="4" width="6" height="4.5" rx="0.8" fill="#0f172a" />
                {/* Wheels */}
                <circle cx="11" cy="15.5" r="3.2" fill="#334155" stroke="#0f172a" strokeWidth="1.8" />
                <circle cx="34" cy="15.5" r="3.2" fill="#334155" stroke="#0f172a" strokeWidth="1.8" />
                {/* Headlight beam (subtle glow) */}
                <path d="M45 9 L51 8.5 C52 8.5 52 9.5 51 9.5 L45 10 Z" fill="#fef08a" opacity="0.8" />
              </svg>
              {/* Subtle spotlight glow under bus */}
              <div className="w-10 h-[4px] bg-cyan-400/25 blur-[2px] rounded-full mt-0.5" />
            </div>
          </div>

          {/* Start and Destination HUD pins */}
          <div className="absolute -left-1 -bottom-5 flex flex-col items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="text-[7.5px] font-mono text-slate-500 font-bold uppercase mt-1">START</span>
          </div>
          <div className="absolute -right-1 -bottom-5 flex flex-col items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[7.5px] font-mono text-cyan-500 font-bold uppercase mt-1">DEST</span>
          </div>
        </div>

        {/* Minimalist Progress text */}
        <div className="w-full flex justify-between items-center text-[10px] sm:text-xs font-mono font-bold text-slate-400">
          <span className="text-cyan-400 animate-pulse uppercase tracking-wider">
            {statusText}
          </span>
          <span className="text-slate-200 bg-slate-800/40 border border-slate-700/30 px-2 py-0.5 rounded">
            {progress}% Loaded
          </span>
        </div>

      </div>

      {/* Bottom Legal / Branding Anchor */}
      <div className="pb-12 px-6 flex justify-between items-center text-[9px] font-mono text-slate-500 z-10 select-none max-w-xl mx-auto w-full border-t border-slate-800/30 pt-4">
        <span>TRIPZO CO., LTD. ALL RIGHTS RESERVED</span>
        <span className="flex items-center space-x-1 text-emerald-400 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>SECURE GATEWAY</span>
        </span>
      </div>

      {/* Styled inline components */}
      <style dangerouslySetInnerHTML={{__html: `
        .animate-spin-slow {
          animation: spin 16s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
