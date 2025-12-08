'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useUserData } from '@/contexts/UserDataContext';
import { DailyPointsClaimCompact } from '@/components/features/DailyPointsClaim';
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
  Gift
} from 'lucide-react';

export function MobileNavigation() {
  const pathname = usePathname();
  const { user } = useUserData();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { 
      name: 'Home', 
      href: '/', 
      icon: Home,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      description: 'Dashboard & Overview'
    },
    { 
      name: 'Bible', 
      href: '/bible', 
      icon: BookOpen,
      color: 'text-green-500',
      bgColor: 'bg-linear-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200',
      description: 'Read Scripture'
    },
    { 
      name: 'Devotionals', 
      href: '/devotionals', 
      icon: Heart,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50 hover:bg-pink-100',
      description: 'Daily Reflections'
    },
    { 
      name: 'Reading Plans', 
      href: '/plans', 
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      description: 'Structured Learning'
    },
    { 
      name: 'Community', 
      href: '/community', 
      icon: Users,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      description: 'Connect & Share'
    },
    { 
      name: 'Leaderboard', 
      href: '/leaderboard', 
      icon: Crown,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      description: 'Top Rankings'
    },
    { 
      name: 'Achievements', 
      href: '/achievements', 
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100',
      description: 'Your Progress'
    },
    { 
      name: 'Donations', 
      href: '/donations', 
      icon: Gift,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50 hover:bg-pink-100',
      description: 'Support & Tokens'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50 hover:bg-gray-100',
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
          className="md:hidden h-12 w-12 rounded-full shadow-lg bg-primary/10 hover:bg-primary/20 transition-all duration-200"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 overflow-hidden">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
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
              <div className="w-12 h-12 bg-linear-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{user?.username || 'Guest'}</div>
              <div className="text-sm text-muted-foreground">Level {user?.level || 1}</div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm font-medium">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>{user?.points?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Flame className="h-4 w-4 text-orange-500" />
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
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
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
          {/* Daily Points Claim */}
          <DailyPointsClaimCompact />
          
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
