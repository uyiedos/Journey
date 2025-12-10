import { Achievement } from '@/types';

export const achievements: Achievement[] = [
  // Daily Login Achievements
  {
    id: 'daily-login-1',
    name: 'First Day',
    description: 'Log in for the first time',
    icon: 'sun',
    points: 5,
    category: 'daily',
    unlockedAt: new Date(),
    rarity: 'common',
    requirements: { type: 'count', target: 1 },
    rewards: { points: 5, badge: 'newcomer' }
  },
  {
    id: 'daily-login-7',
    name: 'Week Warrior',
    description: 'Log in for 7 consecutive days',
    icon: 'calendar',
    points: 50,
    category: 'daily',
    unlockedAt: new Date(),
    rarity: 'common',
    requirements: { type: 'streak', target: 7 },
    rewards: { points: 50, badge: 'dedicated' }
  },
  {
    id: 'daily-login-30',
    name: 'Monthly Master',
    description: 'Log in for 30 consecutive days',
    icon: 'calendar',
    points: 200,
    category: 'daily',
    unlockedAt: new Date(),
    rarity: 'rare',
    requirements: { type: 'streak', target: 30 },
    rewards: { points: 200, badge: 'consistent' }
  },

  // Reading Achievements
  {
    id: 'first-verse',
    name: 'First Steps',
    description: 'Read your first Bible verse',
    icon: 'book-open',
    points: 10,
    category: 'reading',
    unlockedAt: new Date(),
    rarity: 'common',
    requirements: { type: 'count', target: 1 },
    rewards: { points: 10, badge: 'reader' }
  },
  {
    id: 'chapter-complete',
    name: 'Chapter Reader',
    description: 'Complete reading an entire chapter',
    icon: 'book-open',
    points: 25,
    category: 'reading',
    unlockedAt: new Date(),
    rarity: 'common',
    requirements: { type: 'count', target: 1 },
    rewards: { points: 25, badge: 'chapter_master' }
  },
  {
    id: 'book-complete',
    name: 'Book Scholar',
    description: 'Complete reading an entire book',
    icon: 'book-open',
    points: 100,
    category: 'reading',
    unlockedAt: new Date(),
    rarity: 'rare',
    requirements: { type: 'count', target: 1 },
    rewards: { points: 100, badge: 'book_scholar' }
  },
  {
    id: 'testament-complete',
    name: 'Testament Master',
    description: 'Complete reading an entire testament',
    icon: 'book-open',
    points: 500,
    category: 'reading',
    unlockedAt: new Date(),
    rarity: 'epic',
    requirements: { type: 'count', target: 1 },
    rewards: { points: 500, badge: 'testament_master' }
  },
  {
    id: 'bible-complete',
    name: 'Bible Scholar',
    description: 'Complete reading the entire Bible',
    icon: 'trophy',
    points: 1000,
    category: 'reading',
    unlockedAt: new Date(),
    rarity: 'legendary',
    requirements: { type: 'count', target: 1 },
    rewards: { points: 1000, badge: 'bible_scholar', title: 'Bible Master' }
  },

  // Enhanced Community Achievements
  {
    id: 'first-friend',
    name: 'Friend Maker',
    description: 'Add your first friend',
    icon: 'users',
    points: 15,
    category: 'community',
    unlockedAt: new Date(),
    rarity: 'common',
    requirements: { type: 'social', target: 1 },
    rewards: { points: 15, badge: 'friendly' }
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Add 10 friends',
    icon: 'users',
    points: 50,
    category: 'community',
    unlockedAt: new Date(),
    rarity: 'common',
    requirements: { type: 'social', target: 10 },
    rewards: { points: 50, badge: 'social_butterfly' }
  },
  {
    id: 'community-connector',
    name: 'Community Connector',
    description: 'Add 25 friends',
    icon: 'users',
    points: 150,
    category: 'community',
    unlockedAt: new Date(),
    rarity: 'rare',
    requirements: { type: 'social', target: 25 },
    rewards: { points: 150, badge: 'connector' }
  },
  {
    id: 'first-post',
    name: 'Voice Heard',
    description: 'Make your first community post',
    icon: 'message-circle',
    points: 20,
    category: 'community',
    unlockedAt: new Date(),
    rarity: 'common',
    requirements: { type: 'count', target: 1 },
    rewards: { points: 20, badge: 'speaker' }
  },
  {
    id: 'community-leader',
    name: 'Community Leader',
    description: 'Make 10 community posts',
    icon: 'message-circle',
    points: 100,
    category: 'community',
    unlockedAt: new Date(),
    rarity: 'rare',
    requirements: { type: 'count', target: 10 },
    rewards: { points: 100, badge: 'leader' }
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    description: 'Make 50 community posts',
    icon: 'message-circle',
    points: 300,
    category: 'community',
    unlockedAt: new Date(),
    rarity: 'epic',
    requirements: { type: 'count', target: 50 },
    rewards: { points: 300, badge: 'creator' }
  },
  {
    id: 'engagement-master',
    name: 'Engagement Master',
    description: 'Get 100 likes on your posts',
    icon: 'heart',
    points: 200,
    category: 'community',
    unlockedAt: new Date(),
    rarity: 'rare',
    requirements: { type: 'count', target: 100 },
    rewards: { points: 200, badge: 'engaging' }
  },

  // Group Achievements (NEW)
  {
    id: 'group-founder',
    name: 'Group Founder',
    description: 'Create your first group',
    icon: 'users',
    points: 50,
    category: 'groups',
    unlockedAt: new Date(),
    rarity: 'common',
    requirements: { type: 'group', target: 1 },
    rewards: { points: 50, badge: 'founder', unlockFeatures: ['group_creation'] }
  },
  {
    id: 'group-builder',
    name: 'Group Builder',
    description: 'Create 3 groups',
    icon: 'users',
    points: 150,
    category: 'groups',
    unlockedAt: new Date(),
    rarity: 'rare',
    requirements: { type: 'group', target: 3 },
    rewards: { points: 150, badge: 'builder' }
  },
  {
    id: 'points-contributor',
    name: 'Points Contributor',
    description: 'Contribute 100 points to group pools',
    icon: 'star',
    points: 75,
    category: 'groups',
    unlockedAt: new Date(),
    rarity: 'common',
    requirements: { type: 'points', target: 100 },
    rewards: { points: 75, badge: 'contributor', groupPoints: 25 }
  },
  {
    id: 'generous-giver',
    name: 'Generous Giver',
    description: 'Contribute 500 points to group pools',
    icon: 'star',
    points: 250,
    category: 'groups',
    unlockedAt: new Date(),
    rarity: 'rare',
    requirements: { type: 'points', target: 500 },
    rewards: { points: 250, badge: 'generous', groupPoints: 100 }
  },
  {
    id: 'challenge-champion',
    name: 'Challenge Champion',
    description: 'Complete 10 group challenges',
    icon: 'trophy',
    points: 200,
    category: 'groups',
    unlockedAt: new Date(),
    rarity: 'rare',
    requirements: { type: 'challenge', target: 10 },
    rewards: { points: 200, badge: 'champion' }
  },
  {
    id: 'group-master',
    name: 'Group Master',
    description: 'Reach 1000 points contributed across all groups',
    icon: 'crown',
    points: 500,
    category: 'groups',
    unlockedAt: new Date(),
    rarity: 'epic',
    requirements: { type: 'points', target: 1000 },
    rewards: { points: 500, badge: 'master', title: 'Group Master' }
  },

  // Enhanced Prayer Achievements
  {
    id: 'first-prayer',
    name: 'First Prayer',
    description: 'Share your first prayer',
    icon: 'hand',
    points: 15,
    category: 'prayer',
    unlockedAt: new Date(),
    rarity: 'common',
    requirements: { type: 'count', target: 1 },
    rewards: { points: 15, badge: 'prayerful' }
  },
  {
    id: 'prayer-warrior',
    name: 'Prayer Warrior',
    description: 'Share 10 prayers',
    icon: 'hand',
    points: 75,
    category: 'prayer',
    unlockedAt: new Date(),
    rarity: 'common',
    requirements: { type: 'count', target: 10 },
    rewards: { points: 75, badge: 'warrior' }
  },
  {
    id: 'prayer-intercessor',
    name: 'Prayer Intercessor',
    description: 'Share 50 prayers',
    icon: 'hand',
    points: 200,
    category: 'prayer',
    unlockedAt: new Date(),
    rarity: 'rare',
    requirements: { type: 'count', target: 50 },
    rewards: { points: 200, badge: 'intercessor' }
  },
  {
    id: 'prayer-general',
    name: 'Prayer General',
    description: 'Share 100 prayers',
    icon: 'hand',
    points: 400,
    category: 'prayer',
    unlockedAt: new Date(),
    rarity: 'epic',
    requirements: { type: 'count', target: 100 },
    rewards: { points: 400, badge: 'general', title: 'Prayer General' }
  },

  // Enhanced Streak Achievements
  {
    id: 'streak-3',
    name: '3 Day Streak',
    description: 'Maintain a 3-day reading streak',
    icon: 'flame',
    points: 30,
    category: 'streak',
    unlockedAt: new Date(),
    rarity: 'common',
    requirements: { type: 'streak', target: 3 },
    rewards: { points: 30, badge: 'consistent' }
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day reading streak',
    icon: 'flame',
    points: 75,
    category: 'streak',
    unlockedAt: new Date(),
    rarity: 'common',
    requirements: { type: 'streak', target: 7 },
    rewards: { points: 75, badge: 'dedicated' }
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day reading streak',
    icon: 'flame',
    points: 300,
    category: 'streak',
    unlockedAt: new Date(),
    rarity: 'rare',
    requirements: { type: 'streak', target: 30 },
    rewards: { points: 300, badge: 'faithful' }
  },
  {
    id: 'streak-100',
    name: 'Century Saint',
    description: 'Maintain a 100-day reading streak',
    icon: 'flame',
    points: 1000,
    category: 'streak',
    unlockedAt: new Date(),
    rarity: 'legendary',
    requirements: { type: 'streak', target: 100 },
    rewards: { points: 1000, badge: 'saint', title: 'Century Saint' }
  },

  // Enhanced Point Achievements
  {
    id: 'point-collector',
    name: 'Point Collector',
    description: 'Earn 100 points',
    icon: 'star',
    points: 50,
    category: 'points',
    unlockedAt: new Date(),
    rarity: 'common',
    requirements: { type: 'points', target: 100 },
    rewards: { points: 50, badge: 'collector' }
  },
  {
    id: 'point-master',
    name: 'Point Master',
    description: 'Earn 1000 points',
    icon: 'star',
    points: 100,
    category: 'points',
    unlockedAt: new Date(),
    rarity: 'rare',
    requirements: { type: 'points', target: 1000 },
    rewards: { points: 100, badge: 'master' }
  },
  {
    id: 'point-legend',
    name: 'Point Legend',
    description: 'Earn 10000 points',
    icon: 'star',
    points: 500,
    category: 'points',
    unlockedAt: new Date(),
    rarity: 'legendary',
    requirements: { type: 'points', target: 10000 },
    rewards: { points: 500, badge: 'legend', title: 'Point Legend' }
  },

  // Special Enhanced Achievements
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Read Bible verses before 6 AM for 7 days',
    icon: 'sun',
    points: 150,
    category: 'special',
    unlockedAt: new Date(),
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Read Bible verses after 10 PM for 7 days',
    icon: 'moon',
    points: 150,
    category: 'special',
    unlockedAt: new Date(),
  },
  {
    id: 'explorer',
    name: 'Bible Explorer',
    description: 'Read from every book of the Bible',
    icon: 'compass',
    points: 750,
    category: 'special',
    unlockedAt: new Date(),
  },
];

export const getAchievementsByCategory = (category: string): Achievement[] => {
  return achievements.filter(achievement => achievement.category === category);
};

export const getAchievementById = (id: string): Achievement | undefined => {
  return achievements.find(achievement => achievement.id === id);
};
