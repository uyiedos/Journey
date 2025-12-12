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
import { events as initialEvents } from '@/data/events';
import { Event } from '@/types';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabaseService } from '@/services/supabaseService';
import { EventService } from '@/services/eventService';
import { Video, Calendar, Clock, Heart, MessageCircle } from 'lucide-react';

const EventsPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'upcoming' | 'past'>('all');
  const [newEvent, setNewEvent] = useState({
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

  // Fetch events from Supabase on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await EventService.getAllEvents();
        setAllEvents(events.length > 0 ? events : initialEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        setAllEvents(initialEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const classifyEvents = useMemo(() => {
    const now = new Date();

    const ongoing: Event[] = [];
    const upcoming: Event[] = [];
    const past: Event[] = [];

    // Sort all events by createdAt (newest first) before categorizing
    const sortedEvents = [...allEvents].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    sortedEvents.forEach((event) => {
      const start = new Date(event.startsAt);
      const end = event.endsAt ? new Date(event.endsAt) : null;

      // Event is ongoing if it has started and not yet ended
      if (start <= now && (!end || end >= now)) {
        ongoing.push(event);
      } 
      // Event is upcoming if it hasn't started yet
      else if (start > now) {
        upcoming.push(event);
      }
      // Event is past if it has ended
      else if (end && end < now) {
        past.push(event);
      }
      // Fallback for events without end time that started more than 2 hours ago
      else if (!end && (now.getTime() - start.getTime()) > (1000 * 60 * 60 * 2)) {
        past.push(event);
      }
    });

    return { ongoing, upcoming, past };
  }, [allEvents]);

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
          title="Event video"
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

  const handleCreateEvent = async () => {
    if (!authUser || !newEvent.title.trim() || !newEvent.videoUrl.trim() || !newEvent.startsAt.trim()) return;

    try {
      // Create event in Supabase
      const createdEvent = await EventService.createEvent(authUser.id, {
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        type: 'video',
        videoUrl: newEvent.videoUrl.trim(),
        startsAt: new Date(newEvent.startsAt).toISOString(),
        endsAt: newEvent.endsAt.trim() ? new Date(newEvent.endsAt).toISOString() : undefined,
        tags: newEvent.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });

      // Add to local state
      setAllEvents((prev) => [createdEvent, ...prev]);
      setNewEvent({ title: '', description: '', videoUrl: '', startsAt: '', endsAt: '', tags: '' });

      // Award points for event creation
      await supabaseService.addPoints(authUser.id, 500);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const handleLikeEvent = async (eventId: string) => {
    if (!authUser) return;

    setLikes((prev) => ({
      ...prev,
      [eventId]: (prev[eventId] ?? 0) + 1,
    }));

    try {
      await supabaseService.addPoints(authUser.id, 2);
    } catch (error) {
      console.error('Error awarding points for event like:', error);
    }
  };

  const handleAddComment = async (eventId: string) => {
    if (!authUser) return;
    const content = (newComment[eventId] || '').trim();
    if (!content) return;

    const comment = {
      id: `comment-${Date.now()}`,
      user: authUser.email || 'User',
      content,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), comment],
    }));

    setNewComment((prev) => ({
      ...prev,
      [eventId]: '',
    }));

    try {
      await supabaseService.addPoints(authUser.id, 2);
    } catch (error) {
      console.error('Error awarding points for event comment:', error);
    }
  };

  const renderEventCard = (event: Event) => {
    const likeCount = likes[event.id] ?? 0;
    const eventComments = comments[event.id] || [];

    return (
      <Card key={event.id}>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription>{event.description}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDateTime(event.startsAt)}
              </span>
              {event.endsAt && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDateTime(event.endsAt)}
                </span>
              )}
            </div>
          </div>
          {event.tags && event.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {renderYouTubeEmbed(event.videoUrl)}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleLikeEvent(event.id)}
              >
                <Heart className="h-4 w-4" />
                <span>{likeCount}</span>
              </Button>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{eventComments.length}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {eventComments.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
                {eventComments.map((c) => (
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
                  value={newComment[event.id] || ''}
                  onChange={(e) =>
                    setNewComment((prev) => ({
                      ...prev,
                      [event.id]: e.target.value,
                    }))
                  }
                />
                <Button
                  size="sm"
                  onClick={() => handleAddComment(event.id)}
                  disabled={!newComment[event.id]?.trim()}
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

  const { ongoing, upcoming, past } = classifyEvents;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Events</h1>
          <p className="text-lg text-muted-foreground">
            Join live and recorded events from the Journey community.
          </p>
        </header>

        {authUser && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm((prev) => !prev)}
            >
              {showForm ? 'Hide Event Form' : 'Add Event'}
            </Button>
          </div>
        )}

        {authUser && showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Event</CardTitle>
              <CardDescription>Share a new live or recorded video event with the community.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Event description"
                value={newEvent.description}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
              <Input
                placeholder="YouTube URL"
                value={newEvent.videoUrl}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, videoUrl: e.target.value }))}
              />
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="datetime-local"
                  value={newEvent.startsAt}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, startsAt: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time (Optional)</Label>
                <Input
                  id="end-time"
                  type="datetime-local"
                  value={newEvent.endsAt}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, endsAt: e.target.value }))}
                />
              </div>
              <Input
                placeholder="Tags (comma separated)"
                value={newEvent.tags}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, tags: e.target.value }))}
              />
              <Button
                onClick={handleCreateEvent}
                disabled={!newEvent.title.trim() || !newEvent.videoUrl.trim() || !newEvent.startsAt.trim()}
              >
                Create Event (500 pts)
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-4">
            {allEvents.length === 0 ? (
              <p className="text-center text-muted-foreground">No events yet.</p>
            ) : (
              allEvents.map(renderEventCard)
            )}
          </TabsContent>

          <TabsContent value="ongoing" className="mt-4 space-y-4">
            {ongoing.length === 0 ? (
              <p className="text-center text-muted-foreground">No ongoing events right now.</p>
            ) : (
              ongoing.map(renderEventCard)
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {upcoming.length === 0 ? (
              <p className="text-center text-muted-foreground">No upcoming events scheduled.</p>
            ) : (
              upcoming.map(renderEventCard)
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-4">
            {past.length === 0 ? (
              <p className="text-center text-muted-foreground">No past events yet.</p>
            ) : (
              past.map(renderEventCard)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default EventsPage;
