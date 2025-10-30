
import React from 'react';
import { WrenchIcon } from './Icons';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="relative flex items-center justify-center h-40 w-40 mx-auto">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full animate-aurora opacity-50" style={{ animationDuration: '8s' }}></div>
      {/* Inner pulsing ring */}
      <div className="absolute inset-2 rounded-full animate-aurora opacity-70" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
      {/* Innermost solid bg */}
      <div className="absolute inset-4 rounded-full bg-slate-900"></div>

      {/* Pulsing glow effect */}
      <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{'--glow-color': 'rgba(79, 70, 229, 0.7)', '--glow-spread': '4px'} as React.CSSProperties}></div>

      {/* Icon in the center */}
      <WrenchIcon className="relative h-10 w-10 text-indigo-300" />

      {/* Spinning SVG arc */}
      <svg className="absolute inset-0 h-full w-full animate-spin" style={{ animationDuration: '1.5s' }} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c7d2fe" stopOpacity="1" />
            <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* A quarter-circle path with rounded ends, to create a comet-like trail when spinning */}
        <path
          d="M 50,5 A 45,45 0 0 1 95,50"
          fill="none"
          stroke="url(#spinner-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

// Keyframes for spin are available globally from tailwind
// @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }