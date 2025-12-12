import React from 'react';
import { notFound } from 'next/navigation';
import { EventService } from '@/services/eventService';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Video, Calendar, Clock, Users } from 'lucide-react';

export default async function EventDetailsPage({ params }: { params: { id: string } }) {
  // In a real implementation, fetch the event by ID
  // For now, we'll use a placeholder
  const event = await EventService.getEventById(params.id);
  
  if (!event) {
    notFound();
  }

  const handleJoinEvent = async () => {
    // TODO: Implement join event functionality
    console.log('Joining event:', event.id);
    // Add user to event participants
    // Redirect to event video/meeting page
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold">{event.title}</CardTitle>
              <div className="flex items-center mt-2 text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {new Date(event.startsAt || '').toLocaleDateString()}
                </span>
                <Clock className="h-4 w-4 ml-4 mr-1" />
                <span className="text-sm">
                  {new Date(event.startsAt || '').toLocaleTimeString()} - {new Date(event.endsAt || '').toLocaleTimeString()}
                </span>
              </div>
            </div>
            <Button onClick={handleJoinEvent} className="bg-blue-600 hover:bg-blue-700">
              <Video className="h-4 w-4 mr-2" />
              Join Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-lg">{event.description}</p>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Event Details</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Event Type: {event.type}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">How to Join</h3>
              <p>Click the "Join Event" button at the top of this page to join the event when it starts.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
