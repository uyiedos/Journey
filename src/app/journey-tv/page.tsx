'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { events as initialChannels } from '@/data/events';
import { Event } from '@/types';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabaseService } from '@/services/supabaseService';
import { EventService } from '@/services/eventService';
import { Video, Calendar, Clock, Heart, MessageCircle, Tv, Radio } from 'lucide-react';

const JourneyTVPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [allChannels, setAllChannels] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'recorded'>('all');
  const [newChannel, setNewChannel] = useState({
    title: '',
    description: '',
    videoUrl: '',
    startsAt: '',
    endsAt: '',
    tags: '',
  });
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, { id: string; user: string; content: string; createdAt: string }[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);

  // Fetch channels from Supabase on component mount
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const channels = await EventService.getAllEvents();
        setAllChannels(channels.length > 0 ? channels : initialChannels);
      } catch (error) {
        console.error('Error fetching channels:', error);
        setAllChannels(initialChannels);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  const classifyChannels = useMemo(() => {
    const now = new Date();

    const live: Event[] = [];
    const upcoming: Event[] = [];
    const recorded: Event[] = [];

    // Sort all channels by createdAt (newest first) before categorizing
    const sortedChannels = [...allChannels].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    sortedChannels.forEach((channel) => {
      const start = new Date(channel.startsAt);
      const end = channel.endsAt ? new Date(channel.endsAt) : null;

      // Channel is live if it has started and not yet ended
      if (start <= now && (!end || end >= now)) {
        live.push(channel);
      } 
      // Channel is upcoming if it hasn't started yet
      else if (start > now) {
        upcoming.push(channel);
      }
      // Channel is recorded if it has ended
      else if (end && end < now) {
        recorded.push(channel);
      }
      // Fallback for channels without end time that started more than 2 hours ago
      else if (!end && (now.getTime() - start.getTime()) > (1000 * 60 * 60 * 2)) {
        recorded.push(channel);
      }
    });

    return { live, upcoming, recorded };
  }, [allChannels]);

  const renderYouTubeEmbed = (url: string) => {
    let embedUrl = url;
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch {
      // Fallback: use raw URL
    }

    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden border bg-black">
        <iframe
          className="w-full h-full"
          src={embedUrl}
          title="Channel video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  };

  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString();
  };

  const handleCreateChannel = async () => {
    if (!authUser || !newChannel.title.trim() || !newChannel.videoUrl.trim() || !newChannel.startsAt.trim()) return;

    try {
      // Create channel in Supabase
      const createdChannel = await EventService.createEvent(authUser.id, {
        title: newChannel.title.trim(),
        description: newChannel.description.trim(),
        type: 'video',
        videoUrl: newChannel.videoUrl.trim(),
        startsAt: new Date(newChannel.startsAt).toISOString(),
        endsAt: newChannel.endsAt.trim() ? new Date(newChannel.endsAt).toISOString() : undefined,
        tags: newChannel.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });

      // Add to local state
      setAllChannels((prev) => [createdChannel, ...prev]);
      setNewChannel({ title: '', description: '', videoUrl: '', startsAt: '', endsAt: '', tags: '' });

      // Award points for channel creation
      await supabaseService.addPoints(authUser.id, 500);
    } catch (error) {
      console.error('Error creating channel:', error);
      alert('Failed to create channel. Please try again.');
    }
  };

  const handleLikeChannel = async (channelId: string) => {
    if (!authUser) return;

    setLikes((prev) => ({
      ...prev,
      [channelId]: (prev[channelId] ?? 0) + 1,
    }));

    try {
      await supabaseService.addPoints(authUser.id, 2);
    } catch (error) {
      console.error('Error awarding points for channel like:', error);
    }
  };

  const handleAddComment = async (channelId: string) => {
    if (!authUser) return;
    const content = (newComment[channelId] || '').trim();
    if (!content) return;

    const comment = {
      id: `comment-${Date.now()}`,
      user: authUser.email || 'User',
      content,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), comment],
    }));

    setNewComment((prev) => ({
      ...prev,
      [channelId]: '',
    }));

    try {
      await supabaseService.addPoints(authUser.id, 2);
    } catch (error) {
      console.error('Error awarding points for channel comment:', error);
    }
  };

  const renderMainChannel = (channel: Event) => {
    const likeCount = likes[channel.id] ?? 0;
    const channelComments = comments[channel.id] || [];
    const isLive = new Date(channel.startsAt) <= new Date() && 
                  (!channel.endsAt || new Date(channel.endsAt) >= new Date());

    return (
      <Card key={channel.id} className="col-span-full">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isLive && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Radio className="h-3 w-3" />
                  LIVE
                </Badge>
              )}
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Tv className="h-6 w-6 text-purple-600" />
                  {channel.title}
                </CardTitle>
                <CardDescription className="text-lg">{channel.description}</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDateTime(channel.startsAt)}
              </span>
              {channel.endsAt && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDateTime(channel.endsAt)}
                </span>
              )}
            </div>
          </div>
          {channel.tags && channel.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {channel.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video w-full rounded-xl overflow-hidden border bg-black">
            <iframe
              className="w-full h-full"
              src={channel.videoUrl.replace('watch?v=', 'embed/')}
              title="Main Channel video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleLikeChannel(channel.id)}
              >
                <Heart className="h-4 w-4" />
                <span>{likeCount}</span>
              </Button>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{channelComments.length}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {channelComments.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
                {channelComments.map((c) => (
                  <div key={c.id} className="border rounded-md px-2 py-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{c.user}</span>
                      <span>{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-1">{c.content}</p>
                  </div>
                ))}
              </div>
            )}

            {authUser && (
              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="Add a comment"
                  value={newComment[channel.id] || ''}
                  onChange={(e) =>
                    setNewComment((prev) => ({
                      ...prev,
                      [channel.id]: e.target.value,
                    }))
                  }
                />
                <Button
                  size="sm"
                  onClick={() => handleAddComment(channel.id)}
                  disabled={!newComment[channel.id]?.trim()}
                >
                  Post
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderGridChannel = (channel: Event) => {
    const likeCount = likes[channel.id] ?? 0;
    const channelComments = comments[channel.id] || [];
    const isLive = new Date(channel.startsAt) <= new Date() && 
                  (!channel.endsAt || new Date(channel.endsAt) >= new Date());

    return (
      <Card key={channel.id} className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            {isLive && (
              <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                <Radio className="h-3 w-3" />
                LIVE
              </Badge>
            )}
            <CardTitle className="text-lg flex items-center gap-2 truncate">
              <Tv className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <span className="truncate">{channel.title}</span>
            </CardTitle>
          </div>
          <CardDescription className="line-clamp-2 text-sm">{channel.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="aspect-video w-full rounded-lg overflow-hidden border bg-black">
            <iframe
              className="w-full h-full"
              src={channel.videoUrl.replace('watch?v=', 'embed/')}
              title="Channel video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 h-8 px-2"
                onClick={() => handleLikeChannel(channel.id)}
              >
                <Heart className="h-3 w-3" />
                <span className="text-xs">{likeCount}</span>
              </Button>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                <span>{channelComments.length}</span>
              </div>
            </div>
          </div>

          {channel.tags && channel.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {channel.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {channel.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{channel.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const { live, upcoming, recorded } = classifyChannels;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Tv className="h-10 w-10 text-purple-600" />
            Journey TV
          </h1>
          <p className="text-lg text-muted-foreground">
            Watch live and recorded channels from the Journey community.
          </p>
        </header>

        {authUser && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm((prev) => !prev)}
            >
              {showForm ? 'Hide Channel Form' : 'Add Channel'}
            </Button>
          </div>
        )}

        {authUser && showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Channel</CardTitle>
              <CardDescription>Share a new live or recorded video channel with the community.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Channel title"
                value={newChannel.title}
                onChange={(e) => setNewChannel((prev) => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Channel description"
                value={newChannel.description}
                onChange={(e) => setNewChannel((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
              <Input
                placeholder="YouTube URL"
                value={newChannel.videoUrl}
                onChange={(e) => setNewChannel((prev) => ({ ...prev, videoUrl: e.target.value }))}
              />
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="datetime-local"
                  value={newChannel.startsAt}
                  onChange={(e) => setNewChannel((prev) => ({ ...prev, startsAt: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time (Optional)</Label>
                <Input
                  id="end-time"
                  type="datetime-local"
                  value={newChannel.endsAt}
                  onChange={(e) => setNewChannel((prev) => ({ ...prev, endsAt: e.target.value }))}
                />
              </div>
              <Input
                placeholder="Tags (comma separated)"
                value={newChannel.tags}
                onChange={(e) => setNewChannel((prev) => ({ ...prev, tags: e.target.value }))}
              />
              <Button
                onClick={handleCreateChannel}
                disabled={!newChannel.title.trim() || !newChannel.videoUrl.trim() || !newChannel.startsAt.trim()}
              >
                Create Channel (500 pts)
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All Channels</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="recorded">Recorded</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-6">
            {allChannels.length === 0 ? (
              <p className="text-center text-muted-foreground">No channels yet.</p>
            ) : (
              <>
                {allChannels.length > 0 && renderMainChannel(allChannels[0])}
                {allChannels.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allChannels.slice(1).map(renderGridChannel)}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="live" className="mt-4 space-y-6">
            {live.length === 0 ? (
              <p className="text-center text-muted-foreground">No channels are live right now.</p>
            ) : (
              <>
                {live.length > 0 && renderMainChannel(live[0])}
                {live.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {live.slice(1).map(renderGridChannel)}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-4 space-y-6">
            {upcoming.length === 0 ? (
              <p className="text-center text-muted-foreground">No upcoming channels scheduled.</p>
            ) : (
              <>
                {upcoming.length > 0 && renderMainChannel(upcoming[0])}
                {upcoming.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcoming.slice(1).map(renderGridChannel)}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="recorded" className="mt-4 space-y-6">
            {recorded.length === 0 ? (
              <p className="text-center text-muted-foreground">No recorded channels yet.</p>
            ) : (
              <>
                {recorded.length > 0 && renderMainChannel(recorded[0])}
                {recorded.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recorded.slice(1).map(renderGridChannel)}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default JourneyTVPage;
