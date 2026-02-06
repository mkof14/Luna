
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Luna Logo Component
 * Renders the brand name "Luna" in the script style with vibrant coloring.
 * Enhanced with subtle interactions and pulse animation.
 */
export const Logo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  const sizeClasses = {
    sm: 'text-3xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl',
  };

  return (
    <span className={`font-brand text-luna-purple dark:text-luna-teal leading-none pt-1 select-none transition-all hover:scale-105 active:scale-95 cursor-pointer inline-block drop-shadow-sm ${sizeClasses[size]} ${className}`}>
      Luna
    </span>
  );
};
