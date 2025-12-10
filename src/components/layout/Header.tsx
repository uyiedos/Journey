'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { MobileNavigation } from './MobileNavigation';
import { BookOpen, Users, Heart, Trophy, Menu, Search, LogIn, LogOut, Bell, Sparkles, Flame } from 'lucide-react';

export function Header() {
  const { user: authUser, signOut } = useAuth();
  const { user } = useUserData();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <MobileNavigation />
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Journey
            </span>
          </Link>
          <Link href="/events" className="hidden md:block">
            <Button variant="ghost" size="sm" className="ml-2 flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>Events</span>
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          {/* Search Button - Hidden on small mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden sm:flex h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10 transition-all duration-200"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications - Smaller on mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10 transition-all duration-200"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-red-500 rounded-full border-2 border-background" />
          </Button>

          {/* User Stats - Enhanced */}
          {authUser ? (
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              {/* Points Badge - Mobile */}
              <Badge className="hidden md:flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-linear-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200 shadow-sm">
                <Trophy className="h-3 w-3" />
                <span className="font-medium text-xs sm:text-sm">{user?.points?.toLocaleString() || 0}</span>
              </Badge>

              {/* Streak Badge - Mobile */}
              <Badge className="hidden md:flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-linear-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200 shadow-sm">
                <Flame className="h-3 w-3" />
                <span className="font-medium text-xs sm:text-sm">{user?.streak || 0} days</span>
              </Badge>

              {/* User Avatar - Enhanced */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="relative">
                  <Avatar className="h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 ring-2 ring-primary/10">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-linear-to-br from-blue-400 to-purple-500 text-white font-medium text-sm">
                      {authUser.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div className="hidden md:block">
                  <Link href="/settings" className="text-sm font-medium hover:text-primary transition-colors">
                    {user?.username || authUser.email?.split('@')[0]}
                  </Link>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-muted-foreground">Level {user?.level || 1}</div>
                    <div className="text-xs text-blue-600 font-medium">Ref: {user?.username || authUser.email?.split('@')[0]}</div>
                  </div>
                </div>
              </div>

              {/* Sign Out Button - Enhanced */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSignOut}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button className="h-8 px-3 sm:h-10 sm:px-6 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200 text-xs sm:text-sm">
                <LogIn className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
