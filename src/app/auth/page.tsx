'use client';

import React from 'react';
import { AuthComponent } from '@/components/auth/AuthComponent';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <AuthComponent />;
}
