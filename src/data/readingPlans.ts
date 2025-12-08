import { ReadingPlan, ReadingPlanItem } from '@/types';

export const readingPlans: ReadingPlan[] = [
  {
    id: 'plan-1',
    title: '21 Days of Prayer',
    description: 'A three-week journey to develop a consistent prayer life and deepen your relationship with God.',
    duration: 21,
    difficulty: 'beginner',
    readings: [
      {
        id: 'day-1',
        day: 1,
        title: 'The Foundation of Prayer',
        passages: ['Matthew 6:5-15', 'Philippians 4:6-7'],
        devotional: 'Prayer is not just speaking to God, but also listening to His voice...',
        completed: false
      },
      {
        id: 'day-2',
        day: 2,
        title: 'Praying with Faith',
        passages: ['James 1:5-8', 'Mark 11:22-25'],
        devotional: 'Faith is the currency of prayer. When we pray, we must believe...',
        completed: false
      }
    ],
    participants: 15234,
    rating: 4.8
  },
  {
    id: 'plan-2',
    title: 'Gospel of John in 30 Days',
    description: 'Read through the entire Gospel of John in one month and discover the life and teachings of Jesus.',
    duration: 30,
    difficulty: 'intermediate',
    readings: [
      {
        id: 'john-1',
        day: 1,
        title: 'The Word Became Flesh',
        passages: ['John 1:1-18'],
        devotional: 'John begins his Gospel with a profound statement about who Jesus is...',
        completed: false
      },
      {
        id: 'john-2',
        day: 2,
        title: 'The First Miracle',
        passages: ['John 2:1-12'],
        devotional: 'Jesus\' first miracle reveals His glory and compassion...',
        completed: false
      }
    ],
    participants: 8921,
    rating: 4.9
  },
  {
    id: 'plan-3',
    title: 'Proverbs: Daily Wisdom',
    description: 'Read one chapter of Proverbs each day for a month and gain practical wisdom for everyday life.',
    duration: 31,
    difficulty: 'beginner',
    readings: [
      {
        id: 'proverbs-1',
        day: 1,
        title: 'The Beginning of Wisdom',
        passages: ['Proverbs 1'],
        devotional: 'True wisdom begins with reverence for the Lord...',
        completed: false
      },
      {
        id: 'proverbs-2',
        day: 2,
        title: 'Pursuing Wisdom',
        passages: ['Proverbs 2'],
        devotional: 'Wisdom is not passive; it must be actively pursued...',
        completed: false
      }
    ],
    participants: 12456,
    rating: 4.7
  }
];

export const getReadingPlanById = (id: string): ReadingPlan | undefined => {
  return readingPlans.find(plan => plan.id === id);
};

export const getReadingPlansByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): ReadingPlan[] => {
  return readingPlans.filter(plan => plan.difficulty === difficulty);
};
