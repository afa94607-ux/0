import React from 'react';
import { Animal } from '../types/yuki';
import { AnimalIllustration } from './AnimalIllustration';

interface GoldBowlProps {
  number?: number;
  isCenter?: boolean;
  revealedAnimal?: Animal | null;
  isRevealing?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const GoldBowl: React.FC<GoldBowlProps> = ({
  isCenter = false,
  revealedAnimal = null,
  isRevealing = false,
  className = '',
  style,
}) => {
  return (
    <div
      style={style}
      className={`relative flex items-center justify-center bg-white rounded-lg transition-all duration-300 shadow-xs ${
        isCenter
          ? 'w-44 h-44 sm:w-52 sm:h-52 p-2 border-4 border-[#2563eb] shadow-xl'
          : 'w-14 h-16 sm:w-16 sm:h-20 md:w-20 md:h-22 p-1 border-2 border-[#60a5fa] hover:border-[#2563eb]'
      } ${className}`}
    >
      {/* If this bowl is revealed and has an animal */}
      {revealedAnimal ? (
        <div className="relative w-full h-full flex items-center justify-center p-0.5 animate-scale-in bg-white rounded overflow-hidden">
          <AnimalIllustration
            number={revealedAnimal.number}
            className="w-full h-full object-contain rounded"
          />
        </div>
      ) : (
        /* The authentic hidden bowl medallion */
        <div
          className={`relative w-full h-full flex items-center justify-center overflow-hidden ${
            isRevealing ? 'animate-bounce scale-110' : ''
          }`}
        >
          <img
            src="/assets/aistudio/hidden_bowl_medallion.png"
            alt="Gold Bowl"
            className="w-full h-full object-contain filter drop-shadow-xs"
          />
        </div>
      )}
    </div>
  );
};
