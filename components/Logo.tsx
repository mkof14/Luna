
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'text' | 'animated';
}

/**
 * Luna Logo Component
 * Renders the brand name "Luna".
 * Updated: Removed the signature path and entry "blink" animations.
 * Only the smooth color shift remains.
 */
export const Logo: React.FC<LogoProps> = ({ className = "", size = "md", variant = 'text' }) => {
  const sizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl',
    xl: 'text-9xl',
  };

  if (variant === 'animated') {
    // Uniform spacing calculation:
    // Start X: 50, Gap: 45
    // L: 50, u: 95, n: 140, a: 185
    return (
      <div className={`${className} flex items-center justify-center`}>
        <svg 
          viewBox="0 0 240 100" 
          className="w-full h-auto overflow-visible animate-color-shift-luna"
          style={{ maxWidth: '450px' }}
        >
          {/* Signature path removed per user request for a cleaner look */}
          
          {/* Static letters with only color-shift applied via the SVG parent class */}
          <g className="font-brand" style={{ fontSize: '6.5rem' }}>
             <text x="50" y="65">L</text>
             <text x="95" y="65">u</text>
             <text x="140" y="65">n</text>
             <text x="185" y="65">a</text>
          </g>
        </svg>
      </div>
    );
  }

  return (
    <span className={`font-brand animate-color-shift-luna leading-none pt-1 select-none transition-all hover:scale-105 active:scale-95 cursor-pointer inline-block drop-shadow-sm ${sizeClasses[size]} ${className}`}>
      Luna
    </span>
  );
};
