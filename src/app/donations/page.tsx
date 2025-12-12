'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { 
  Heart, 
  Gift, 
  Users, 
  TrendingUp, 
  Star, 
  Crown, 
  Zap, 
  Target,
  Copy,
  Mail,
  Share2,
  Trophy,
  Coins,
  Calendar,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Rocket,
  HandHeart,
  Lightbulb,
  Award
} from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function DonationsPage() {
  const { user: authUser } = useAuth();
  const { user, stats } = useUserData();
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [referralEmail, setReferralEmail] = useState('');

  // Real referral data - starting from zero
  const referralData = {
    referralCode: authUser ? `JOURNEY${authUser.id.slice(-6).toUpperCase()}` : 'JOURNEY123',
    totalReferrals: 0,
    activeReferrals: 0,
    referralEarnings: 0,
    pendingEarnings: 0,
    referralRank: 1,
    referralBonus: 0,
  };

  // Mock donation tiers
  const donationTiers = [
    {
      id: 'seed',
      name: 'Seed Sower',
      amount: 10,
      description: 'Support the journey foundation',
      benefits: ['100 $JOURNEY tokens', 'Special badge', 'Early access'],
      tokenBonus: 100,
      popular: false,
    },
    {
      id: 'growth',
      name: 'Growth Partner',
      amount: 25,
      description: 'Help us grow and expand',
      benefits: ['300 $JOURNEY tokens', 'Exclusive content', 'Priority support'],
      tokenBonus: 300,
      popular: true,
    },
    {
      id: 'visionary',
      name: 'Visionary',
      amount: 50,
      description: 'Shape the future of Journey',
      benefits: ['750 $JOURNEY tokens', 'VIP features', 'Direct influence'],
      tokenBonus: 750,
      popular: false,
    },
    {
      id: 'legacy',
      name: 'Legacy Builder',
      amount: 100,
      description: 'Leave a lasting impact',
      benefits: ['2000 $JOURNEY tokens', 'Lifetime benefits', 'Founder recognition'],
      tokenBonus: 2000,
      popular: false,
    },
  ];

  // Real referral leaderboard - empty since only one user
  const referralLeaderboard: any[] = [];

  // Mock token stats
  const tokenStats = {
    totalSupply: '100M',
    circulatingSupply: '15M',
    yourHoldings: stats ? Math.floor(stats.points * 0.1) : 0,
    estimatedValue: '$0.50',
    nextClaimDate: '2024-12-31',
    progressToClaim: 75,
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://journey.app/referral/${referralData.referralCode}`);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleSendReferral = () => {
    // In real app, this would send referral email
    console.log('Sending referral to:', referralEmail);
    setReferralEmail('');
  };

  const handleDonate = (tier: any) => {
    setSelectedTier(tier.id);
    setDonationAmount(tier.amount.toString());
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (!authUser) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
              <Coins className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              $JOURNEY
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Support our mission and earn $JOURNEY tokens. Every donation helps us grow and rewards you with future tokens.
            </p>
          </div>

          <Card className="bg-linear-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
              <p className="text-muted-foreground mb-4">
                Please sign in to access donations, referrals, and token rewards.
              </p>
              <Button asChild>
                <Link href="/auth">Sign In to Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
            <Rocket className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            $JOURNEY & $JOURNEY Tokens
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're working hard to bring you an amazing token system. Support Journey and earn $JOURNEY tokens while helping us grow our spiritual community.

            $JOURNEY will be launched on fair launch via pump.fun and launch event will be viewed live via our video channel. Launch Date will be revealed
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="bg-linear-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Coming Soon!</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're working hard to bring you an amazing donations and token system. 
              Support Journey and earn $JOURNEY tokens while helping us grow our spiritual community.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-white rounded-lg">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Support the Mission</h3>
                <p className="text-sm text-muted-foreground">
                  Help us keep Journey running and growing
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg">
                <Coins className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Earn $JOURNEY Tokens</h3>
                <p className="text-sm text-muted-foreground">
                  Get rewarded for your support and participation
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Grow Community</h3>
                <p className="text-sm text-muted-foreground">
                  Help us reach more people with spiritual content
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">What to Expect:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <span>Multiple donation tiers with token rewards</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <span>Referral program with bonus rewards</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <span>$JOURNEY token utility and benefits</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <span>Secure payment processing</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-purple-50 rounded-lg">
              <h3 className="font-semibold mb-2">Stay Updated!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to know when donations launch. Early supporters will get special bonuses!
              </p>
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=$JOURNEY+Token+Launch&details=Join+us+for+the+$JOURNEY+token+launch+event+live+on+our+video+channel.+Fair+launch+via+pump.fun', '_blank')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Notify Me - Save to Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
