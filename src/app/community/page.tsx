'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Sparkles, 
  TrendingUp,
  Calendar,
  Award,
  Coins
} from 'lucide-react';
import { SocialFeed } from '@/components/community/SocialFeed';
import { FriendsSidebar } from '@/components/community/FriendsSidebar';
import { ChatComponent } from '@/components/community/ChatComponent';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';

interface CommunityStats {
  totalMembers: number;
  dailyPosts: number;
  prayersSupported: number;
  pointsTipped: number;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [communityStats, setCommunityStats] = useState<CommunityStats>({
    totalMembers: 0,
    dailyPosts: 0,
    prayersSupported: 0,
    pointsTipped: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch community statistics
  useEffect(() => {
    const fetchCommunityStats = async () => {
      try {
        // Get total members count
        const { count: totalMembers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get today's posts count
        const today = new Date().toISOString().split('T')[0];
        const { count: dailyPosts } = await supabase
          .from('community_posts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today);

        // Get prayer requests count
        const { count: prayersSupported } = await supabase
          .from('community_posts')
          .select('*', { count: 'exact', head: true })
          .eq('post_type', 'prayer_request');

        // Get total points tipped
        const { data: pointsData } = await supabase
          .from('points_transactions')
          .select('amount')
          .eq('transaction_type', 'tip');
        
        const pointsTipped = pointsData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;

        setCommunityStats({
          totalMembers: totalMembers || 0,
          dailyPosts: dailyPosts || 0,
          prayersSupported: prayersSupported || 0,
          pointsTipped: pointsTipped
        });
      } catch (error) {
        console.error('Error fetching community stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityStats();
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Community Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Users className="h-8 w-8 mr-3 text-blue-600" />
                Community
              </h1>
              <p className="text-gray-600 mt-2">
                Connect with fellow believers, share your journey, and grow together in faith.
              </p>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Your Points</p>
                  <div className="flex items-center text-lg font-semibold text-yellow-600">
                    <Coins className="h-5 w-5 mr-1" />
                    {user?.user_metadata?.points || 0}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Level</p>
                  <div className="flex items-center text-lg font-semibold text-purple-600">
                    <Award className="h-5 w-5 mr-1" />
                    {user?.user_metadata?.level || 1}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Community Members</p>
                    <p className="text-xl font-semibold">{loading ? '...' : communityStats.totalMembers.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Daily Posts</p>
                    <p className="text-xl font-semibold">{loading ? '...' : communityStats.dailyPosts.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Heart className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prayers Supported</p>
                    <p className="text-xl font-semibold">{loading ? '...' : communityStats.prayersSupported.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Coins className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Points Tipped</p>
                    <p className="text-xl font-semibold">{loading ? '...' : communityStats.pointsTipped.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        {!user ? (
          <Card className="text-center py-20">
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                <Users className="h-16 w-16 text-gray-400 mb-4" />
                <CardTitle className="text-2xl font-bold">Join Our Community</CardTitle>
                <p className="text-lg text-gray-600 max-w-md">
                  Sign in to connect with fellow believers, share your journey, and grow together in faith.
                </p>
                <Button size="lg">
                  Sign In to Join Community
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feed" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Social Feed</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Messages</span>
              </TabsTrigger>
              <TabsTrigger value="friends" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Friends</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SocialFeed />
                </div>
                <div>
                  <FriendsSidebar />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chat">
              <ChatComponent />
            </TabsContent>

            <TabsContent value="friends">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Find New Friends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Discover Community Members</h3>
                        <p className="text-gray-600 mb-4">
                          Connect with like-minded believers on their spiritual journey
                        </p>
                        <Button>Browse Members</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <FriendsSidebar />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
