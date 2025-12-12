'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { communityService } from '@/services/communityService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, X, UserPlus, Users, Loader2 } from 'lucide-react';

export default function CommunityTest() {
  const { user: authUser } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    if (!authUser?.id) {
      alert('Please login to test community features');
      return;
    }

    setLoading(true);
    const results = [];

    // Test 1: Get Friends
    try {
      const friends = await communityService.getFriends(authUser.id);
      results.push({
        test: 'Get Friends',
        status: 'success',
        data: friends.length,
        message: `Found ${friends.length} friends`
      });
    } catch (error) {
      results.push({
        test: 'Get Friends',
        status: 'error',
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Get Friend Requests
    try {
      const requests = await communityService.getFriendRequests(authUser.id);
      results.push({
        test: 'Get Friend Requests',
        status: 'success',
        data: requests.length,
        message: `Found ${requests.length} pending requests`
      });
    } catch (error) {
      results.push({
        test: 'Get Friend Requests',
        status: 'error',
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Get User Groups
    try {
      const groups = await communityService.getUserGroups(authUser.id);
      results.push({
        test: 'Get User Groups',
        status: 'success',
        data: groups.length,
        message: `Found ${groups.length} groups`
      });
    } catch (error) {
      results.push({
        test: 'Get User Groups',
        status: 'error',
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 4: Get Public Groups
    try {
      const publicGroups = await communityService.getPublicGroups();
      results.push({
        test: 'Get Public Groups',
        status: 'success',
        data: publicGroups.length,
        message: `Found ${publicGroups.length} public groups`
      });
    } catch (error) {
      results.push({
        test: 'Get Public Groups',
        status: 'error',
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 5: Search Users
    try {
      const searchResults = await communityService.searchUsers('test', [authUser.id]);
      results.push({
        test: 'Search Users',
        status: 'success',
        data: searchResults.length,
        message: `Found ${searchResults.length} users matching 'test'`
      });
    } catch (error) {
      results.push({
        test: 'Search Users',
        status: 'error',
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Community Features Test</CardTitle>
          <CardDescription>
            Test all community functionality to verify it's working correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runTests} disabled={loading} className="mb-4">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Run Tests
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {result.status === 'success' ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium">{result.test}</span>
                    </div>
                    <Badge
                      variant={result.status === 'success' ? 'default' : 'destructive'}
                    >
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.message}
                  </p>
                  {result.data !== null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Data: {JSON.stringify(result.data)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Testing</CardTitle>
          <CardDescription>
            Test specific community actions manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Send Friend Request</h4>
            <div className="flex space-x-2">
              <Input placeholder="User ID" id="friendUserId" />
              <Button
                onClick={async () => {
                  const userId = (document.getElementById('friendUserId') as HTMLInputElement)?.value;
                  if (userId && authUser?.id) {
                    try {
                      const success = await communityService.sendFriendRequest(authUser.id, userId);
                      alert(success ? 'Friend request sent!' : 'Failed to send friend request');
                    } catch (error) {
                      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
                    }
                  }
                }}
              >
                Send Request
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Join Group</h4>
            <div className="flex space-x-2">
              <Input placeholder="Group ID" id="groupId" />
              <Button
                onClick={async () => {
                  const groupId = (document.getElementById('groupId') as HTMLInputElement)?.value;
                  if (groupId && authUser?.id) {
                    try {
                      const success = await communityService.joinGroup(groupId, authUser.id);
                      alert(success ? 'Joined group!' : 'Failed to join group');
                    } catch (error) {
                      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
                    }
                  }
                }}
              >
                Join Group
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
