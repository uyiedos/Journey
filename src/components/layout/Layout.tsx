'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { UserDataProvider } from '@/contexts/UserDataContext';
import { ReferralProvider } from '@/contexts/ReferralContext';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <UserDataProvider>
        <ReferralProvider>
          <div className="min-h-screen bg-background">
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="bg-white shadow-lg"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div 
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <div className="flex">
              {/* Sidebar - Hidden on mobile, visible on desktop */}
              <div className={`
                fixed lg:relative lg:translate-x-0 
                transform -translate-x-full transition-transform duration-300 ease-in-out
                z-40 lg:z-0
                ${sidebarOpen ? 'translate-x-0' : ''}
              `}>
                <Sidebar />
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col lg:ml-0">
                <Header />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6 pb-20 lg:pb-8">
                  {children}
                </main>
              </div>
            </div>
            
            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
          </div>
        </ReferralProvider>
      </UserDataProvider>
    </AuthProvider>
  );
}
