import { Event } from '@/types';

export const events: Event[] = [
  {
    id: 'shiloh-2025',
    title: 'Shiloh 2025',
    description: 'Live stream event focused on prayer, worship, and the Word.',
    type: 'video',
    videoUrl: 'https://www.youtube.com/watch?v=MMTLMdCJZMQ&pp=ygUXc2hpbG9oIDIwMjUgbGl2ZSBzdHJlYW0%3D',
    startsAt: new Date('2025-12-10T19:00:00Z').toISOString(),
    endsAt: new Date('2025-12-10T21:00:00Z').toISOString(),
    createdAt: new Date().toISOString(),
    tags: ['Shiloh', 'Conference', 'Live Stream'],
  },
];

export const getUpcomingEvents = (): Event[] => {
  const now = new Date();
  return events.filter(event => new Date(event.startsAt) >= now);
};

export const getPastEvents = (): Event[] => {
  const now = new Date();
  return events.filter(event => new Date(event.startsAt) < now);
};

export const getLatestEvents = (): Event[] => {
  return [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
