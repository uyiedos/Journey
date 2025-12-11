'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  BookOpen, 
  Heart, 
  Calendar, 
  Users, 
  Trophy,
  Video 
} from 'lucide-react'

const mobileNavigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Bible', href: '/bible', icon: BookOpen },
  { name: 'Devotionals', href: '/devotionals', icon: Heart },
  { name: 'Plans', href: '/plans', icon: Calendar },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Events', href: '/events', icon: Video },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-7 gap-1 py-2">
        {mobileNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors',
                isActive
                  ? 'text-blue-600 bg-blue-100 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent'
              )}
            >
              <item.icon className="h-4 w-4 mb-1" />
              <span className="text-xs font-medium truncate max-w-full">
                {item.name.split(' ')[0]}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
