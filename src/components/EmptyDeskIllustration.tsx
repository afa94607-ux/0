import React from 'react';

export const EmptyDeskIllustration: React.FC<{ className?: string }> = ({ className = 'w-36 h-28' }) => {
  return (
    <div className={`flex flex-col items-center justify-center opacity-70 ${className}`}>
      <svg viewBox="0 0 160 120" className="w-full h-full text-blue-300">
        {/* Desk line */}
        <line x1="10" y1="95" x2="150" y2="95" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
        
        {/* Laptop */}
        <rect x="50" y="45" width="55" height="40" rx="3" fill="#f8fafc" stroke="#93c5fd" strokeWidth="1.8" />
        <rect x="55" y="50" width="45" height="28" fill="#e0f2fe" rx="1.5" />
        {/* Screen inner lines */}
        <line x1="60" y1="58" x2="85" y2="58" stroke="#93c5fd" strokeWidth="1.2" />
        <line x1="60" y1="64" x2="78" y2="64" stroke="#93c5fd" strokeWidth="1.2" />
        <line x1="60" y1="70" x2="90" y2="70" stroke="#93c5fd" strokeWidth="1.2" />
        {/* Laptop base */}
        <path d="M 42 85 L 113 85 L 108 90 L 47 90 Z" fill="#e2e8f0" stroke="#93c5fd" strokeWidth="1.5" />
        
        {/* Little plant pot on right */}
        <path d="M 125 78 L 135 78 L 132 94 L 128 94 Z" fill="#e2e8f0" stroke="#86efac" strokeWidth="1.5" />
        <path d="M 130 78 Q 120 68 126 62 Q 132 70 130 78" fill="#bbf7d0" stroke="#22c55e" strokeWidth="1" />
        <path d="M 130 78 Q 140 68 135 60 Q 128 68 130 78" fill="#86efac" stroke="#22c55e" strokeWidth="1" />

        {/* Floating subtle lines */}
        <circle cx="36" cy="70" r="1.5" fill="#93c5fd" />
        <circle cx="140" cy="50" r="1.5" fill="#93c5fd" />
      </svg>
    </div>
  );
};
