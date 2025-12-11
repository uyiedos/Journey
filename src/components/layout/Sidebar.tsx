'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  BookOpen, 
  Heart, 
  Calendar, 
  Users, 
  Trophy, 
  Settings, 
  Home,
  Flame,
  Crown,
  Gift,
  Shield,
  UserPlus,
  Cross,
  Video
} from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Bible', href: '/bible', icon: BookOpen },
  { name: 'Devotionals', href: '/devotionals', icon: Heart },
  { name: 'Reading Plans', href: '/plans', icon: Calendar },
  { name: 'Virgo AI', href: '/ai-tools', icon: Cross },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Events', href: '/events', icon: Video },
  { name: 'Leaderboard', href: '/leaderboard', icon: Crown },
  { name: 'Achievements', href: '/achievements', icon: Trophy },
  { name: 'Referrals', href: '/referrals', icon: UserPlus },
  { name: 'Donations', href: '/donations', icon: Gift },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUserData();
  const { user: authUser } = useAuth();

  // Check if user is admin or owner
  const isAdmin = authUser?.app_metadata?.role === 'admin' || authUser?.app_metadata?.role === 'owner';

  return (
    <div className={cn("pb-12 w-64 h-screen bg-card border-r lg:border-r-0 shadow-lg", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Journey
          </h2>
          <div className="space-y-1">
            {navigation.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start h-10 lg:h-9"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  <span className="hidden lg:inline">{item.name}</span>
                  <span className="lg:hidden">{item.name.split(' ')[0]}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              <span className="hidden lg:inline">Admin</span>
              <span className="lg:hidden">Adm</span>
            </h2>
            <div className="space-y-1">
              <Button
                variant={pathname === '/admin' ? "secondary" : "ghost"}
                className="w-full justify-start h-10 lg:h-9"
                asChild
              >
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  <span className="hidden lg:inline">Admin Dashboard</span>
                  <span className="lg:hidden">Admin</span>
                </Link>
              </Button>
            </div>
          </div>
        )}
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Your Progress
          </h2>
          <div className="space-y-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Streak</span>
              </div>
              <Badge variant="secondary">{user?.streak || 0} days</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Points</span>
              </div>
              <Badge variant="secondary">{user?.points?.toLocaleString() || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Chapters Read</span>
              </div>
              <Badge variant="secondary">0</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
