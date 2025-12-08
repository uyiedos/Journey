'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUserData } from '@/contexts/UserDataContext';
import {
  Home,
  BookOpen,
  Heart,
  Users,
  Trophy,
  Menu,
  Bell,
  User,
  Search,
  Plus,
  Flame,
  Sparkles
} from 'lucide-react';

export function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useUserData();

  const navigation = [
    { 
      name: 'Home', 
      href: '/', 
      icon: Home,
      label: 'Dashboard'
    },
    { 
      name: 'Bible', 
      href: '/bible', 
      icon: BookOpen,
      label: 'Read'
    },
    { 
      name: 'Devotionals', 
      href: '/devotionals', 
      icon: Heart,
      label: 'Reflect'
    },
    { 
      name: 'Community', 
      href: '/community', 
      icon: Users,
      label: 'Connect'
    },
    { 
      name: 'Profile', 
      href: '/achievements', 
      icon: Trophy,
      label: 'Progress'
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 transition-all duration-200 relative',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  'h-5 w-5 transition-all duration-200',
                  isActive && 'scale-110'
                )} />
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
                
                {/* Points indicator for achievements */}
                {item.name === 'Profile' && user && (
                  <div className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 bg-linear-to-r from-yellow-400 to-orange-500 rounded-full text-xs text-white font-bold">
                    {user.level}
                  </div>
                )}
                
                {/* Streak indicator for home */}
                {item.name === 'Home' && user && user.streak > 0 && (
                  <div className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 bg-linear-to-r from-orange-400 to-red-500 rounded-full">
                    <Flame className="h-2 w-2 text-white" />
                  </div>
                )}
              </div>
              
              <span className={cn(
                'text-xs font-medium transition-all duration-200',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
              
              {/* Active underline */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Floating action button overlay */}
      <div className="absolute bottom-20 right-4">
        <button className="w-14 h-14 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          <Plus className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  );
}
