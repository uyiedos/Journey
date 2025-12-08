import { Devotional, Verse } from '@/types';

// Sample devotionals
export const devotionals: Devotional[] = [
  {
    id: 'devotional-1',
    title: 'Morning Reflections',
    content: 'Start your day with gratitude and prayer. Today\'s reflection focuses on finding joy in the small moments and recognizing God\'s presence in our daily lives.',
    verse: {
      id: 'psalm-118-24',
      number: 24,
      text: 'This is the day that the Lord has made; let us rejoice and be glad in it.'
    },
    author: 'uyiedos',
    date: new Date(),
    tags: ['gratitude', 'morning', 'joy'],
    likes: 0,
    shares: 0,
  },
  {
    id: 'devotional-2',
    title: 'Evening Peace',
    content: 'End your day with God\'s peace. Reflect on His faithfulness throughout the day and trust Him with your tomorrows.',
    verse: {
      id: 'philippians-4-7',
      number: 7,
      text: 'And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.'
    },
    author: 'uyiedos',
    date: new Date(),
    tags: ['peace', 'evening', 'trust'],
    likes: 0,
    shares: 0,
  }
];

// For backward compatibility
export const communityDevotionals = devotionals;

// Get today's devotional (randomly selected from community devotionals)
export const getTodaysDevotional = (): Devotional => {
  // In a real app, this would be cached per day or stored in a database
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % communityDevotionals.length;
  return communityDevotionals[index];
};

// Get all devotionals (community + sample)
export const getAllDevotionals = (): Devotional[] => {
  return [...communityDevotionals, ...devotionals];
};

export const getDevotionalById = (id: string): Devotional | undefined => {
  return getAllDevotionals().find(devotional => devotional.id === id);
};

export const getDevotionalsByTag = (tag: string): Devotional[] => {
  return getAllDevotionals().filter(devotional => 
    devotional.tags.some(devotionalTag => 
      devotionalTag.toLowerCase().includes(tag.toLowerCase())
    )
  );
};
