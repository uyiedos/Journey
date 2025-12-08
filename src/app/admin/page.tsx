'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { adminService, AdminUser, AdminNotification, UserMessage, NewsArticle } from '@/services/adminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  MessageSquare, 
  Bell, 
  Newspaper, 
  Gift, 
  TrendingUp,
  Award,
  Settings,
  Send,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'general' as const,
    target_audience: 'all' as const,
    is_active: true,
    expires_at: null as string | null
  });

  const [newMessage, setNewMessage] = useState({
    recipient_id: '',
    subject: '',
    message: '',
    message_type: 'message' as const
  });

  const [newNews, setNewNews] = useState({
    title: '',
    content: '',
    excerpt: '',
    image_url: null as string | null,
    is_featured: false
  });

  useEffect(() => {
    if (user) {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [
        usersData,
        notificationsData,
        messagesData,
        newsData,
        statsData
      ] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllNotifications(),
        adminService.getReceivedMessages(user.id),
        adminService.getAllNews(),
        adminService.getDashboardStats()
      ]);

      setUsers(usersData);
      setNotifications(notificationsData);
      setMessages(messagesData);
      setNews(newsData);
      setDashboardStats(statsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    try {
      await adminService.createNotification(newNotification);
      setNewNotification({ title: '', message: '', type: 'general', target_audience: 'all', is_active: true, expires_at: null });
      loadAdminData();
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!user) return;
    
    try {
      await adminService.sendMessage({
        ...newMessage,
        sender_id: user.id
      });
      setNewMessage({ recipient_id: '', subject: '', message: '', message_type: 'message' });
      loadAdminData();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateNews = async () => {
    if (!user) return;
    
    try {
      await adminService.createNews({
        ...newNews,
        is_published: true,
        author_id: user.id
      });
      setNewNews({ title: '', content: '', excerpt: '', image_url: null, is_featured: false });
      loadAdminData();
    } catch (error) {
      console.error('Error creating news:', error);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: 'user' | 'admin' | 'owner') => {
    try {
      await adminService.updateUserRole(userId, role);
      loadAdminData();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleAwardPoints = async (userId: string, points: number) => {
    try {
      await adminService.awardPointsToUser(userId, points, 'Admin bonus');
      loadAdminData();
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your Journey app</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {user?.email}
        </Badge>
      </div>

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.total_users}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.active_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Logins</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.daily_logins}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Signups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.new_signups_today}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.total_points_awarded}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Points: {user.points} | Level: {user.level} | Streak: {user.streak}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleUpdateUserRole(user.id, value as any)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                      
                      <Button
                        size="sm"
                        onClick={() => handleAwardPoints(user.id, 100)}
                      >
                        +100 pts
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Notification</CardTitle>
              <CardDescription>Send notifications to users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="notif-title">Title</Label>
                  <Input
                    id="notif-title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    placeholder="Notification title"
                  />
                </div>
                <div>
                  <Label htmlFor="notif-type">Type</Label>
                  <Select value={newNotification.type} onValueChange={(value) => setNewNotification({...newNotification, type: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="feature">New Feature</SelectItem>
                      <SelectItem value="spiritual">Spiritual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notif-message">Message</Label>
                <Textarea
                  id="notif-message"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  placeholder="Notification message"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="notif-audience">Target Audience</Label>
                <Select value={newNotification.target_audience} onValueChange={(value) => setNewNotification({...newNotification, target_audience: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="admins">Admins Only</SelectItem>
                    <SelectItem value="users">Regular Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleCreateNotification} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{notif.title}</h4>
                      <Badge variant={notif.is_active ? "default" : "secondary"}>
                        {notif.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Target: {notif.target_audience} | Type: {notif.type}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
              <CardDescription>Send direct messages to users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="msg-recipient">Recipient</Label>
                <Select value={newMessage.recipient_id} onValueChange={(value) => setNewMessage({...newMessage, recipient_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="msg-subject">Subject</Label>
                <Input
                  id="msg-subject"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                  placeholder="Message subject"
                />
              </div>
              
              <div>
                <Label htmlFor="msg-content">Message</Label>
                <Textarea
                  id="msg-content"
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                  placeholder="Your message"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="msg-type">Message Type</Label>
                <Select value={newMessage.message_type} onValueChange={(value) => setNewMessage({...newMessage, message_type: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">Regular Message</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="reward">Reward</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleSendMessage} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* News Tab */}
        <TabsContent value="news" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create News Article</CardTitle>
              <CardDescription>Publish news and announcements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="news-title">Title</Label>
                <Input
                  id="news-title"
                  value={newNews.title}
                  onChange={(e) => setNewNews({...newNews, title: e.target.value})}
                  placeholder="Article title"
                />
              </div>
              
              <div>
                <Label htmlFor="news-excerpt">Excerpt</Label>
                <Input
                  id="news-excerpt"
                  value={newNews.excerpt}
                  onChange={(e) => setNewNews({...newNews, excerpt: e.target.value})}
                  placeholder="Brief description"
                />
              </div>
              
              <div>
                <Label htmlFor="news-content">Content</Label>
                <Textarea
                  id="news-content"
                  value={newNews.content}
                  onChange={(e) => setNewNews({...newNews, content: e.target.value})}
                  placeholder="Article content"
                  rows={6}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="news-featured"
                  checked={newNews.is_featured}
                  onChange={(e) => setNewNews({...newNews, is_featured: e.target.checked})}
                />
                <Label htmlFor="news-featured">Featured Article</Label>
              </div>
              
              <Button onClick={handleCreateNews} className="w-full">
                <Newspaper className="h-4 w-4 mr-2" />
                Publish News
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>App performance and user engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Detailed analytics coming soon! This will include user engagement, 
                  reading progress, prayer activity, and community interaction metrics.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
