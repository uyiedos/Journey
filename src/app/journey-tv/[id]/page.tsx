import React from 'react';
import { notFound } from 'next/navigation';
import { EventService } from '@/services/eventService';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Video, Calendar, Clock, Users, Tv, Radio } from 'lucide-react';

export default async function ChannelDetailsPage({ params }: { params: { id: string } }) {
  // In a real implementation, fetch channel by ID
  // For now, we'll use a placeholder
  const channel = await EventService.getEventById(params.id);
  
  if (!channel) {
    notFound();
  }

  const handleJoinChannel = async () => {
    // TODO: Implement join channel functionality
    console.log('Joining channel:', channel.id);
    // Add user to channel participants
    // Redirect to channel video/meeting page
  };

  const isLive = new Date(channel.startsAt) <= new Date() && 
                (!channel.endsAt || new Date(channel.endsAt) >= new Date());

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {isLive && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-full">
                  <Radio className="h-4 w-4" />
                  <span className="text-sm font-medium">LIVE NOW</span>
                </div>
              )}
              <div>
                <CardTitle className="text-3xl font-bold flex items-center gap-3">
                  <Tv className="h-8 w-8 text-purple-600" />
                  {channel.title}
                </CardTitle>
                <div className="flex items-center mt-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {new Date(channel.startsAt || '').toLocaleDateString()}
                  </span>
                  <Clock className="h-4 w-4 ml-4 mr-1" />
                  <span className="text-sm">
                    {new Date(channel.startsAt || '').toLocaleTimeString()} - {new Date(channel.endsAt || '').toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
            <Button onClick={handleJoinChannel} className="bg-purple-600 hover:bg-purple-700">
              <Video className="h-4 w-4 mr-2" />
              Join Channel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-lg">{channel.description}</p>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Channel Details</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Tv className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Channel Type: {channel.type}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">How to Join</h3>
              <p>Click "Join Channel" button at the top of this page to join the channel when it's live.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
