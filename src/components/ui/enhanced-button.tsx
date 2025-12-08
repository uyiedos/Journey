'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles, Zap, Heart, Star } from 'lucide-react';

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'gamified';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xl';
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  pulse?: boolean;
  glow?: boolean;
  points?: number;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function EnhancedButton({
  className,
  variant = 'default',
  size = 'default',
  loading = false,
  success = false,
  error = false,
  pulse = false,
  glow = false,
  points,
  icon,
  children,
  disabled,
  ...props
}: EnhancedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = cn(
    'relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
      // Size variants
      'h-10 px-4 py-2 text-sm': size === 'default',
      'h-9 px-3 text-xs': size === 'sm',
      'h-11 px-8 text-base': size === 'lg',
      'h-12 px-10 text-lg': size === 'xl',
      'h-10 w-10': size === 'icon',
      
      // Interactive states
      'transform active:scale-95': !loading && !disabled,
      'shadow-lg hover:shadow-xl': !loading && !disabled && (variant === 'gradient' || variant === 'gamified'),
      'shadow-md hover:shadow-lg': !loading && !disabled && variant !== 'gradient' && variant !== 'gamified',
      
      // Pulse animation
      'animate-pulse': pulse && !loading && !disabled,
      
      // Glow effect
      'shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]': glow && !loading && !disabled,
      
      // Loading state
      'cursor-not-allowed': loading,
      
      // Success state
      'bg-green-500 hover:bg-green-600 text-white': success && !loading,
      
      // Error state
      'bg-red-500 hover:bg-red-600 text-white': error && !loading,
    },
    className
  );

  const variantClasses = cn({
    // Gradient variant
    'bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0':
      variant === 'gradient' && !success && !error && !loading,
    
    // Gamified variant
    'bg-linear-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0':
      variant === 'gamified' && !success && !error && !loading,
    
    // Default variants (from original Button component)
    'bg-primary text-primary-foreground hover:bg-primary/90':
      variant === 'default' && !success && !error && !loading,
    'bg-destructive text-destructive-foreground hover:bg-destructive/90':
      variant === 'destructive' && !success && !error && !loading,
    'border border-input bg-background hover:bg-accent hover:text-accent-foreground':
      variant === 'outline' && !success && !error && !loading,
    'bg-secondary text-secondary-foreground hover:bg-secondary/80':
      variant === 'secondary' && !success && !error && !loading,
    'hover:bg-accent hover:text-accent-foreground':
      variant === 'ghost' && !success && !error && !loading,
    'text-primary underline-offset-4 hover:underline':
      variant === 'link' && !success && !error && !loading,
  });

  const handleMouseDown = () => {
    if (!loading && !disabled) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
    setIsHovered(false);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {children}
        </>
      );
    }

    return (
      <>
        {icon && <span className="mr-2">{icon}</span>}
        {children}
        {points && (
          <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
            +{points}
          </span>
        )}
        {variant === 'gamified' && isHovered && !loading && !disabled && (
          <Sparkles className="ml-2 h-4 w-4 animate-pulse" />
        )}
        {variant === 'gradient' && isHovered && !loading && !disabled && (
          <Zap className="ml-2 h-4 w-4 animate-pulse" />
        )}
      </>
    );
  };

  return (
    <Button
      className={cn(baseClasses, variantClasses)}
      disabled={disabled || loading}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      {...props}
    >
      {renderContent()}
      
      {/* Ripple effect overlay */}
      {!loading && !disabled && (
        <span 
          className={cn(
            'absolute inset-0 rounded-lg bg-white/10 transition-opacity duration-300',
            isPressed ? 'opacity-30' : 'opacity-0'
          )}
        />
      )}
      
      {/* Success indicator */}
      {success && !loading && (
        <Star className="absolute -top-2 -right-2 h-4 w-4 text-green-300 animate-pulse" />
      )}
      
      {/* Error indicator */}
      {error && !loading && (
        <span className="absolute -top-2 -right-2 h-2 w-2 bg-red-300 rounded-full animate-pulse" />
      )}
    </Button>
  );
}
