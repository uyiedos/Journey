'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { referralService, ReferralInfo } from '@/services/referralService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Gift, 
  Users, 
  TrendingUp, 
  Share2, 
  Copy, 
  CheckCircle,
  Award,
  Star
} from 'lucide-react';

interface ReferralHistory {
  id: string;
  referred_user: {
    id: string;
    username: string;
    email: string;
    created_at: string;
  };
  status: 'pending' | 'completed' | 'rewarded';
  points_awarded: number;
  created_at: string;
  completed_at: string | null;
}

export default function ReferralsPage() {
  const { user } = useAuth();
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [referralHistory, setReferralHistory] = useState<ReferralHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      loadReferralData();
    }
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [info, history] = await Promise.all([
        referralService.getReferralInfo(user.id),
        referralService.getReferralHistory(user.id)
      ]);
      
      setReferralInfo(info);
      setReferralHistory(history);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (referralInfo?.referral_url) {
      try {
        await navigator.clipboard.writeText(referralInfo.referral_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying link:', error);
      }
    }
  };

  const shareReferralLink = async () => {
    if (referralInfo?.referral_url) {
      try {
        if (navigator.share) {
          await navigator.share({
            title: 'Join me on Journey!',
            text: `Join me on Journey - a spiritual journey app with daily devotionals and community support. Use my referral link and get 50 bonus points!`,
            url: referralInfo.referral_url
          });
        } else {
          // Fallback to copying
          copyReferralLink();
        }
      } catch (error) {
        console.error('Error sharing link:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
          <p className="text-muted-foreground">Invite friends and earn rewards together</p>
        </div>

      {/* Referral Stats */}
      {referralInfo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referralInfo.total_referrals}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referralInfo.completed_referrals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referralInfo.pending_referrals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referralInfo.points_earned}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Referral Link */}
      {referralInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="h-5 w-5 mr-2" />
              Your Referral Link
            </CardTitle>
            <CardDescription>
              Share this link with friends and earn 100 points for each successful referral!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={referralInfo.referral_url}
                readOnly
                className="flex-1"
              />
              <Button onClick={copyReferralLink} variant="outline">
                {copied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button onClick={shareReferralLink}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">How it works:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Share your referral link with friends</li>
                <li>• They get 50 bonus points when they sign up</li>
                <li>• You get 100 points when they become active</li>
                <li>• Track all referrals in your history below</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>
            Track the status of all your referrals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referralHistory.length > 0 ? (
            <div className="space-y-3">
              {referralHistory.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{referral.referred_user.username}</p>
                      <p className="text-sm text-muted-foreground">{referral.referred_user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(referral.referred_user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={
                        referral.status === 'completed' ? 'default' :
                        referral.status === 'rewarded' ? 'secondary' : 'outline'
                      }
                    >
                      {referral.status}
                    </Badge>
                    {referral.points_awarded > 0 && (
                      <p className="text-sm font-medium text-green-600 mt-1">
                        +{referral.points_awarded} pts
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No referrals yet</h3>
              <p className="text-muted-foreground mb-4">
                Start sharing your referral link to invite friends and earn rewards!
              </p>
              <Button onClick={shareReferralLink}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Your Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rewards Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Rewards & Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">For You (Referrer)</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  100 points for each successful referral
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Special referral achievements
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Referral leaderboard ranking
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">For Your Friends</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  50 bonus points on signup
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Welcome to the Journey community
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Access to all app features
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}
