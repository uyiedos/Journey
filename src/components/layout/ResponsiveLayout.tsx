'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function ResponsiveLayout({
  children,
  className,
  maxWidth = '2xl',
  padding = 'md'
}: ResponsiveLayoutProps) {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm'
      case 'md': return 'max-w-md'
      case 'lg': return 'max-w-lg'
      case 'xl': return 'max-w-xl'
      case '2xl': return 'max-w-2xl'
      case 'full': return 'max-w-full'
      default: return 'max-w-2xl'
    }
  }

  const getPaddingClass = () => {
    switch (padding) {
      case 'none': return 'px-0'
      case 'sm': return 'px-4 sm:px-6'
      case 'md': return 'px-4 sm:px-6 lg:px-8'
      case 'lg': return 'px-6 sm:px-8 lg:px-12'
      default: return 'px-4 sm:px-6 lg:px-8'
    }
  }

  return (
    <div className={cn(
      'w-full mx-auto',
      getMaxWidthClass(),
      getPaddingClass(),
      className
    )}>
      {children}
    </div>
  )
}

// Grid system for responsive layouts
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    mobile?: 1 | 2 | 3 | 4
    tablet?: 1 | 2 | 3 | 4
    desktop?: 1 | 2 | 3 | 4 | 5 | 6
  }
  gap?: 'sm' | 'md' | 'lg'
}

export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  const getColsClass = () => {
    const mobileClass = cols.mobile ? `grid-cols-${cols.mobile}` : 'grid-cols-1'
    const tabletClass = cols.tablet ? `sm:grid-cols-${cols.tablet}` : 'sm:grid-cols-2'
    const desktopClass = cols.desktop ? `lg:grid-cols-${cols.desktop}` : 'lg:grid-cols-3'
    
    return `${mobileClass} ${tabletClass} ${desktopClass}`
  }

  const getGapClass = () => {
    switch (gap) {
      case 'sm': return 'gap-2 sm:gap-3'
      case 'md': return 'gap-4 sm:gap-6'
      case 'lg': return 'gap-6 sm:gap-8'
      default: return 'gap-4 sm:gap-6'
    }
  }

  return (
    <div className={cn(
      'grid',
      getColsClass(),
      getGapClass(),
      className
    )}>
      {children}
    </div>
  )
}

// Mobile-first container
export function MobileContainer({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(
      'min-h-screen bg-background',
      // Mobile safe areas
      'pb-safe-or-4',
      // Touch-friendly spacing
      'touch-manipulation',
      className
    )}>
      {children}
    </div>
  )
}

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'primary' | 'secondary' | 'muted' | 'accent'
}

export function ResponsiveText({
  children,
  className,
  size = 'md',
  weight = 'normal',
  color = 'primary'
}: ResponsiveTextProps) {
  const getSizeClass = () => {
    switch (size) {
      case 'xs': return 'text-xs sm:text-sm'
      case 'sm': return 'text-sm sm:text-base'
      case 'md': return 'text-base sm:text-lg'
      case 'lg': return 'text-lg sm:text-xl'
      case 'xl': return 'text-xl sm:text-2xl'
      case '2xl': return 'text-2xl sm:text-3xl'
      case '3xl': return 'text-3xl sm:text-4xl'
      default: return 'text-base sm:text-lg'
    }
  }

  const getWeightClass = () => {
    switch (weight) {
      case 'normal': return 'font-normal'
      case 'medium': return 'font-medium'
      case 'semibold': return 'font-semibold'
      case 'bold': return 'font-bold'
      default: return 'font-normal'
    }
  }

  const getColorClass = () => {
    switch (color) {
      case 'primary': return 'text-foreground'
      case 'secondary': return 'text-muted-foreground'
      case 'muted': return 'text-gray-500'
      case 'accent': return 'text-primary'
      default: return 'text-foreground'
    }
  }

  return (
    <span className={cn(
      'leading-relaxed',
      getSizeClass(),
      getWeightClass(),
      getColorClass(),
      className
    )}>
      {children}
    </span>
  )
}
