// Journey TV Channels Data
export interface Channel {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  videoUrl?: string;
  status: 'live' | 'upcoming' | 'recorded' | 'offline';
  category: string;
  starts_at?: string;
  startsAt?: string;
  thumbnail?: string;
}

export const mockChannels: Channel[] = [
  {
    id: '1',
    title: 'Morning Prayer',
    description: 'Start your day with uplifting prayers and worship',
    video_url: 'https://www.youtube.com/watch?v=example1',
    status: 'live' as const,
    category: 'prayer',
    starts_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Bible Study',
    description: 'Deep dive into Scriptures with our pastors',
    video_url: 'https://www.youtube.com/watch?v=example2',
    status: 'upcoming' as const,
    category: 'study',
    starts_at: new Date(Date.now() + 3600000).toISOString()
  },
  {
    id: '3',
    title: 'Worship Night',
    description: 'Join us for an evening of praise and worship',
    video_url: 'https://www.youtube.com/watch?v=example3',
    status: 'recorded' as const,
    category: 'worship',
    starts_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export const getLatestChannels = (): Channel[] => {
  return mockChannels;
};

export const getChannelById = (id: string): Channel | undefined => {
  return mockChannels.find(channel => channel.id === id);
};

export const getChannelsByCategory = (category: string): Channel[] => {
  return mockChannels.filter(channel => channel.category === category);
};

export const getLiveChannels = (): Channel[] => {
  return mockChannels.filter(channel => channel.status === 'live');
};
