'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserData } from '@/contexts/UserDataContext';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Heart,
  Calendar,
  Users,
  Trophy,
  Settings,
  Home,
  Flame,
  Menu,
  X,
  Sparkles,
  Zap,
  Target,
  Star,
  Bell,
  User,
  LogOut,
  ChevronRight,
  Crown,
  Gift,
  Brain,
  Coins
} from 'lucide-react';

export function MobileNavigation() {
  const pathname = usePathname();
  const { user } = useUserData();
  const { resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { 
      name: 'Home', 
      href: '/', 
      icon: Home,
      color: 'text-primary',
      bgColor: 'bg-blue-50 hover:bg-blue-100 border border-blue-200',
      description: 'Dashboard & Overview'
    },
    { 
      name: 'Virgo AI', 
      href: '/virgo-ai', 
      icon: Brain,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100 border border-indigo-200',
      description: 'AI Assistant'
    },
    { 
      name: 'Bible', 
      href: '/bible', 
      icon: BookOpen,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 hover:bg-green-100 border border-green-200',
      description: 'Read Scripture'
    },
    { 
      name: 'Devotionals', 
      href: '/devotionals', 
      icon: Heart,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 hover:bg-pink-100 border border-pink-200',
      description: 'Daily Reflections'
    },
    { 
      name: 'Reading Plans', 
      href: '/plans', 
      icon: Calendar,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 hover:bg-purple-100 border border-purple-200',
      description: 'Structured Learning'
    },
    { 
      name: 'Community', 
      href: '/community', 
      icon: Users,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 hover:bg-orange-100 border border-orange-200',
      description: 'Connect & Share'
    },
    { 
      name: 'Leaderboard', 
      href: '/leaderboard', 
      icon: Crown,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 hover:bg-purple-100 border border-purple-200',
      description: 'Top Rankings'
    },
    { 
      name: 'Achievements', 
      href: '/achievements', 
      icon: Trophy,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-200',
      description: 'Your Progress'
    },
    { 
      name: '$JOURNEY', 
      href: '/donations', 
      icon: Coins,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 hover:bg-pink-100 border border-pink-200',
      description: 'Support & Tokens'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      color: 'text-muted-foreground',
      bgColor: 'bg-gray-50 hover:bg-gray-100 border border-gray-200',
      description: 'Preferences'
    },
  ];

  const closeSheet = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden h-12 w-12 rounded-full shadow-lg bg-white hover:bg-gray-100 transition-all duration-200 border border-gray-200"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 overflow-hidden bg-white border-r border-gray-200">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <SheetTitle className="text-lg font-bold">Journey</SheetTitle>
                <p className="text-sm text-muted-foreground">Your Spiritual Path</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={closeSheet}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        {/* User Profile Section */}
        <div className="p-6 pb-4 border-b">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-linear-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-600 dark:bg-green-400 rounded-full border-2 border-background" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{user?.username || 'Guest'}</div>
              <div className="text-sm text-muted-foreground">Level {user?.level || 1}</div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm font-medium">
                <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span>{user?.points?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span>{user?.streak || 0} days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href} onClick={closeSheet}>
                  <div className={cn(
                    "flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                      : item.bgColor
                  )}>
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 border border-gray-200",
                      isActive 
                        ? "bg-primary-foreground/20" 
                        : "bg-white shadow-sm group-hover:shadow-md"
                    )}>
                      <Icon className={cn(
                        "h-6 w-6 transition-all duration-200",
                        isActive ? "text-primary-foreground" : item.color
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={cn(
                        "text-sm transition-all duration-200",
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {item.description}
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "h-5 w-5 transition-all duration-200",
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </Button>
            <Button variant="outline" className="h-12 space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
