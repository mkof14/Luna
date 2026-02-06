
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'text' | 'animated';
}

/**
 * Luna Logo Component
 * Renders the brand name "Luna".
 * The 'animated' variant uses a specialized SVG path for a handwriting effect.
 * Updated with uniform letter spacing and a refined signature path.
 */
export const Logo: React.FC<LogoProps> = ({ className = "", size = "md", variant = 'text' }) => {
  const sizeClasses = {
    sm: 'text-3xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl',
  };

  if (variant === 'animated') {
    // Uniform spacing calculation:
    // Start X: 50, Gap: 45
    // L: 50, u: 95, n: 140, a: 185
    return (
      <div className={`${className} flex items-center justify-center`}>
        <svg 
          viewBox="0 0 240 100" 
          className="w-full h-auto overflow-visible text-luna-purple dark:text-luna-teal"
          style={{ maxWidth: '350px' }}
        >
          {/* Refined, more elegant signature path that flows smoothly under the letters */}
          <path
            className="luna-signature"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="
              M 35,75 
              C 45,75 55,75 65,75 
              C 85,75 80,45 100,45 
              C 120,45 115,75 135,75 
              C 155,75 150,45 170,45 
              C 190,45 185,75 205,75 
              C 220,75 230,65 235,55
            "
          />
          
          {/* Individual Letter Animations with perfect uniform spacing */}
          <g className="font-brand" style={{ fontSize: '5.2rem' }}>
             <text 
              x="50" y="65" 
              className="animate-letter-flow opacity-0" 
              style={{ animationDelay: '1.2s' }}
             >
               L
             </text>
             <text 
              x="95" y="65" 
              className="animate-letter-flow opacity-0" 
              style={{ animationDelay: '1.7s' }}
             >
               u
             </text>
             <text 
              x="140" y="65" 
              className="animate-letter-flow opacity-0" 
              style={{ animationDelay: '2.2s' }}
             >
               n
             </text>
             <text 
              x="185" y="65" 
              className="animate-letter-flow opacity-0" 
              style={{ animationDelay: '2.7s' }}
             >
               a
             </text>
          </g>
        </svg>
      </div>
    );
  }

  return (
    <span className={`font-brand text-luna-purple dark:text-luna-teal leading-none pt-1 select-none transition-all hover:scale-105 active:scale-95 cursor-pointer inline-block drop-shadow-sm ${sizeClasses[size]} ${className}`}>
      Luna
    </span>
  );
};
