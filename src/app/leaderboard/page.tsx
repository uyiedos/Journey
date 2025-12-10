'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { referralService } from '@/services/referralService';
import { supabaseService } from '@/services/supabaseService';
import { Trophy, Flame, Target, BookOpen, Users, Crown, Medal, Award, Star, Zap, TrendingUp, Calendar, Clock, Copy, CheckCircle, Search, Filter, Sparkles, Shield, Swords, Heart, Lock, Gift } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function LeaderboardPage() {
  const { user: authUser } = useAuth();
  // Only use user data if authenticated, otherwise use null
  const userData = useUserData();
  const user = authUser ? userData.user : null;
  const stats = authUser ? userData.stats : null;
  
  const [referralInfo, setReferralInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loadingReferral, setLoadingReferral] = useState(false);
  
  // Real leaderboard data from Supabase
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<any[]>([]);
  const [streakLeaderboard, setStreakLeaderboard] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  // New features
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStreak, setFilterStreak] = useState('all');

  useEffect(() => {
    const loadLeaderboardData = async () => {
      try {
        setLoading(true);
        
        // Load all leaderboard data
        const [overallData, weeklyData, streakData] = await Promise.all([
          supabaseService.getLeaderboard(50),
          supabaseService.getWeeklyLeaderboard(50),
          supabaseService.getStreakLeaderboard(50),
        ]);

        // Transform data to match expected format
        const transformUserData = (users: any[], baseRank: number = 1) => 
          users.map((userData, index) => ({
            id: userData.id,
            username: userData.username || 'Anonymous',
            avatar: userData.avatar_url || '',
            points: userData.points || 0,
            level: userData.level || 1,
            streak: userData.streak || 0,
            rank: baseRank + index,
            change: userData.rank_change || 0,
            badges: [],
            weeklyPoints: userData.points || 0,
          }));

        setLeaderboardData(transformUserData(overallData));
        setWeeklyLeaderboard(transformUserData(weeklyData));
        setStreakLeaderboard(transformUserData(streakData));

        // Get current user's rank (only if logged in)
        if (authUser) {
          const rank = await supabaseService.getUserRank(authUser.id);
          setUserRank(rank);
        } else {
          setUserRank(null);
        }
      } catch (error) {
        console.error('Error loading leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboardData();

    // Set up real-time subscription for leaderboard updates with enhanced features
    const leaderboardChannel = supabaseService.subscribeToLeaderboard((updatedLeaderboard) => {
      const transformUserData = (users: any[], baseRank: number = 1) => 
        users.map((userData, index) => ({
          id: userData.id,
          username: userData.username || 'Anonymous',
          avatar: userData.avatar_url || '',
          points: userData.points || 0,
          level: userData.level || 1,
          streak: userData.streak || 0,
          rank: baseRank + index,
          change: userData.rank_change || 0,
          badges: [],
          weeklyPoints: userData.points || 0,
        }));

      const newLeaderboardData = transformUserData(updatedLeaderboard);
      
      // Animate rank changes
      setLeaderboardData(prevData => {
        return newLeaderboardData.map(newUser => {
          const oldUser = prevData.find(u => u.id === newUser.id);
          return {
            ...newUser,
            change: oldUser ? newUser.rank - oldUser.rank : 0,
            isMoving: oldUser && newUser.rank !== oldUser.rank,
          };
        });
      });
      
      // Update user rank if logged in
      if (authUser) {
        supabaseService.getUserRank(authUser.id).then(setUserRank);
      }
    });

    // Set up real-time subscription for user ranking updates
    let userRankingChannel: any = null;
    if (authUser) {
      userRankingChannel = supabaseService.subscribeToUserRanking(authUser.id, (ranking) => {
        setUserRank(ranking.rank_position);
      });
    }

    // Cleanup subscriptions on unmount
    return () => {
      supabaseService.unsubscribe('leaderboard_updates');
      if (authUser) {
        supabaseService.unsubscribe(`user_ranking_${authUser.id}`);
      }
    };
  }, [authUser]); // Keep authUser dependency for subscriptions

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-linear-to-r from-yellow-400 to-yellow-600 text-white border-yellow-500';
      case 2:
        return 'bg-linear-to-r from-gray-300 to-gray-500 text-white border-gray-400';
      case 3:
        return 'bg-linear-to-r from-orange-400 to-orange-600 text-white border-orange-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
    return <div className="h-4 w-4" />;
  };

  const generateReferralLink = async () => {
    if (!authUser) return;
    
    try {
      setLoadingReferral(true);
      const info = await referralService.getReferralInfo(authUser.id);
      setReferralInfo(info);
    } catch (error) {
      console.error('Error generating referral link:', error);
    } finally {
      setLoadingReferral(false);
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

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Filter and search functions
  const filteredLeaderboardData = leaderboardData.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || 
      (filterLevel === 'beginner' && user.level <= 5) ||
      (filterLevel === 'intermediate' && user.level > 5 && user.level <= 15) ||
      (filterLevel === 'advanced' && user.level > 15);
    const matchesStreak = filterStreak === 'all' ||
      (filterStreak === 'active' && user.streak > 0) ||
      (filterStreak === 'dedicated' && user.streak >= 7) ||
      (filterStreak === 'legendary' && user.streak >= 30);
    
    return matchesSearch && matchesLevel && matchesStreak;
  });

  const currentUserRanking = authUser && userRank ? {
    rank: userRank,
    points: stats?.points || 0,
    level: stats?.level || 1,
    streak: stats?.streak || 0,
    change: 0, // Could calculate from historical data
  } : null;

  return (
    <Layout>
      <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Leaderboard</h1>
            <p className="text-muted-foreground">
              See how you rank among the Journey community
            </p>
          </div>
          <Badge className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-200">
            <Users className="mr-1 h-3 w-3" />
            {loading ? 'Loading...' : `${filteredLeaderboardData.length} Members`}
          </Badge>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 backdrop-blur-sm border-muted-foreground/20"
            />
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 rounded-md bg-background/50 backdrop-blur-sm border border-muted-foreground/20 text-sm"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner (1-5)</option>
              <option value="intermediate">Intermediate (6-15)</option>
              <option value="advanced">Advanced (16+)</option>
            </select>

            <select
              value={filterStreak}
              onChange={(e) => setFilterStreak(e.target.value)}
              className="px-3 py-2 rounded-md bg-background/50 backdrop-blur-sm border border-muted-foreground/20 text-sm"
            >
              <option value="all">All Streaks</option>
              <option value="active">Active (1+ days)</option>
              <option value="dedicated">Dedicated (7+ days)</option>
              <option value="legendary">Legendary (30+ days)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Loading leaderboard data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current User Ranking */}
      {currentUserRanking && (
        <Card className="bg-linear-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-blue-600">
                  #{currentUserRanking.rank}
                </div>
                <div>
                  <div className="font-semibold">Your Ranking</div>
                  <div className="text-sm text-muted-foreground">
                    Level {currentUserRanking.level} • {currentUserRanking.points.toLocaleString()} points
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-green-600">
                    {getChangeIcon(currentUserRanking.change)}
                    <span className="text-sm font-medium">
                      {currentUserRanking.change > 0 ? `+${currentUserRanking.change}` : currentUserRanking.change}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">vs last week</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-orange-600">
                    <Flame className="h-4 w-4" />
                    <span className="font-medium">{currentUserRanking.streak}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">day streak</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sign up prompt for non-logged-in users */}
      {!authUser && !loading && (
        <Card className="bg-linear-to-r from-gray-50 to-slate-50 border-gray-200">
          <CardContent className="p-6">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Join the Competition!</h3>
              <p className="text-muted-foreground mb-4">
                Sign up to see your ranking on the leaderboard and start earning points
              </p>
              <Button className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Sign Up to Join
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral Link Card */}
      {authUser && (
        <Card className="bg-linear-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-green-600" />
              <span>Invite Friends & Earn Points</span>
            </CardTitle>
            <CardDescription>
              Share your referral link and earn 100 points for each friend who joins
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!referralInfo ? (
              <Button 
                onClick={generateReferralLink}
                disabled={loadingReferral}
                className="w-full"
              >
                {loadingReferral ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Gift className="h-4 w-4 mr-2" />
                )}
                Generate Referral Link
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    value={referralInfo.referral_url}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    onClick={copyReferralLink}
                    variant="outline"
                    size="sm"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">{referralInfo.total_referrals}</div>
                    <div className="text-xs text-muted-foreground">Total Referrals</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">{referralInfo.completed_referrals}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">{referralInfo.points_earned}</div>
                    <div className="text-xs text-muted-foreground">Points Earned</div>
                  </div>
                </div>
                <Alert>
                  <Gift className="h-4 w-4" />
                  <AlertDescription>
                    Your referral code: <strong>{referralInfo.referral_code}</strong>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tabs with Seasonal Competition */}
      <Tabs defaultValue="overall" className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="overall" className="text-xs sm:text-sm">Overall</TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs sm:text-sm">Weekly</TabsTrigger>
            <TabsTrigger value="streaks" className="text-xs sm:text-sm">Streaks</TabsTrigger>
            <TabsTrigger value="seasonal" className="text-xs sm:text-sm hidden lg:flex">Seasonal</TabsTrigger>
            <TabsTrigger value="teams" className="text-xs sm:text-sm hidden lg:flex">Teams</TabsTrigger>
          </TabsList>
          
          {/* Seasonal Competition Banner */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 p-4">
            <div className="flex items-center space-x-3">
              <Trophy className="h-6 w-6 text-purple-600" />
              <div>
                <div className="font-semibold text-purple-800">Winter Challenge 2024</div>
                <div className="text-xs text-purple-600">2 weeks remaining • 500 bonus points</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Overall Leaderboard */}
        <TabsContent value="overall" className="space-y-4">
          <div className="grid gap-4">
            {filteredLeaderboardData.map((user, index) => (
              <Card 
                key={user.id} 
                className={`hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${
                  authUser?.id === user.id 
                    ? 'ring-2 ring-primary bg-gradient-to-r from-blue-50/50 to-purple-50/50' 
                    : 'bg-gradient-to-r from-white/50 to-gray-50/50 backdrop-blur-sm'
                } ${
                  user.rank <= 3 ? 'border-yellow-200 shadow-yellow-200/20' : 'border-gray-200'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank with Animation */}
                      <div className="flex items-center justify-center w-14 h-14 relative">
                        {user.rank <= 3 && (
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full animate-pulse" />
                        )}
                        <div className="relative flex items-center justify-center">
                          {getRankIcon(user.rank)}
                        </div>
                      </div>

                      {/* Avatar with Badge */}
                      <div className="relative">
                        <Avatar className="h-14 w-14 ring-2 ring-white shadow-lg">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {user.hasClaimedToday && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                            <Gift className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>

                      {/* User Info - Mobile Optimized */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="font-bold text-lg truncate">{user.username}</h3>
                          <div className="flex flex-wrap gap-1">
                            <Badge className={`${getRankBadgeColor(user.rank)} px-2 py-1 text-xs`}>
                              <Shield className="h-3 w-3 mr-1" />
                              L{user.level}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">{user.points.toLocaleString()} pts</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center space-x-1">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span>{user.streak} day streak</span>
                          </span>
                        </div>
                        {/* Achievement Badges - Mobile Optimized */}
                        <div className="flex flex-wrap gap-1">
                          {user.badges.length > 0 ? (
                            user.badges.slice(0, 3).map((badge: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                <Star className="h-2 w-2 mr-1" />
                                {badge}
                              </Badge>
                            ))
                          ) : (
                            <div className="flex space-x-1">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                  <Lock className="h-2 w-2 text-gray-400" />
                                </div>
                              ))}
                            </div>
                          )}
                          {user.badges.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                              +{user.badges.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats with Enhanced Design */}
                    <div className="text-right space-y-2">
                      <div className="flex items-center justify-end space-x-1">
                        {getChangeIcon(user.change)}
                        <span className={`text-sm font-bold ${
                          user.change > 0 ? 'text-green-600' : 
                          user.change < 0 ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {user.change > 0 ? `+${user.change}` : user.change === 0 ? '—' : user.change}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">vs last week</div>
                      
                      {/* Rank Change Animation */}
                      {user.change !== 0 && (
                        <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                          user.change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.change > 0 ? 'Rising' : 'Falling'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground font-medium">Progress to Level {user.level + 1}</span>
                      <span className="text-muted-foreground font-bold">{1000 - (user.points % 1000)} pts</span>
                    </div>
                    <Progress 
                      value={(user.points % 1000) / 10} 
                      className="h-3 bg-gray-100"
                    />
                    <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                      <span>{user.points % 1000} / 1000</span>
                      <span>{((user.points % 1000) / 10).toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Weekly Leaderboard */}
        <TabsContent value="weekly" className="space-y-4">
          <Card className="bg-linear-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-green-600" />
                <span>Weekly Champions</span>
              </CardTitle>
              <CardDescription>
                Top performers this week
              </CardDescription>
            </CardHeader>
          </Card>
          
          <div className="grid gap-4">
            {weeklyLeaderboard.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(user.rank)}
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{user.username}</h3>
                        <div className="text-sm text-muted-foreground">
                          {user.weeklyPoints.toLocaleString()} points this week
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {user.weeklyPoints.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">weekly points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Seasonal Competition Leaderboard */}
        <TabsContent value="seasonal" className="space-y-4">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                <span>Winter Challenge 2024</span>
              </CardTitle>
              <CardDescription>
                Top performers in the seasonal competition
              </CardDescription>
            </CardHeader>
          </Card>
          
          <div className="grid gap-4">
            {filteredLeaderboardData.slice(0, 10).map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-all duration-300 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(user.rank)}
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{user.username}</h3>
                        <div className="text-sm text-muted-foreground">
                          {Math.floor(user.points * 1.5).toLocaleString()} seasonal points
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.floor(user.points * 1.5).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">seasonal pts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Teams Leaderboard */}
        <TabsContent value="teams" className="space-y-4">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Team Competition</span>
              </CardTitle>
              <CardDescription>
                Team rankings and collective achievements
              </CardDescription>
            </CardHeader>
          </Card>
          
          <div className="grid gap-4">
            {[
              { name: 'Warriors of Light', members: 45, points: 12500, rank: 1 },
              { name: 'Faithful Readers', members: 38, points: 11200, rank: 2 },
              { name: 'Bible Scholars', members: 52, points: 10800, rank: 3 },
              { name: 'Prayer Warriors', members: 41, points: 9500, rank: 4 },
              { name: 'Scripture Seekers', members: 35, points: 8900, rank: 5 },
            ].map((team) => (
              <Card key={team.name} className="hover:shadow-lg transition-all duration-300 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(team.rank)}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                        {team.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          {team.members} members
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {team.points.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">team points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Community Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Community Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{leaderboardData.length}</div>
                <div className="text-sm text-blue-500">Total Members</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {leaderboardData.filter(u => u.streak > 0).length}
                </div>
                <div className="text-sm text-green-500">Active Today</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {leaderboardData.reduce((sum, u) => sum + u.points, 0).toLocaleString()}
                </div>
                <div className="text-sm text-purple-500">Total Points</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.max(...leaderboardData.map(u => u.streak), 0)}
                </div>
                <div className="text-sm text-orange-500">Longest Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
    </Layout>
  );
}
