export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  joinedAt: Date;
  points: number;
  level: number;
  streak: number;
  longestStreak: number;
  friends: string[];
  achievements: Achievement[];
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  reading: ReadingSettings;
  community: CommunitySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  dailyDevotional: boolean;
  friendRequests: boolean;
  messages: boolean;
  achievementAlerts: boolean;
  communityPosts: boolean;
  readingReminders: boolean;
  weeklyProgress: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  showReadingProgress: boolean;
  allowFriendRequests: boolean;
  showAchievements: boolean;
}

export interface ReadingSettings {
  fontSize: 'small' | 'medium' | 'large';
  translation: string;
  dailyReminderTime: string;
  autoPlayAudio: boolean;
  highlightVerses: boolean;
  showNotes: boolean;
}

export interface CommunitySettings {
  showInFeed: boolean;
  allowMentions: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  filterContent: boolean;
  hideBlockedUsers: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  unlockedAt: Date;
}

export interface Bible {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  version: string;
}

export interface Book {
  id: string;
  name: string;
  testament: 'old' | 'new';
  chapters: number;
}

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  verses: Verse[];
}

export interface Verse {
  id: string;
  number: number;
  text: string;
  book?: string;  // For database compatibility
  chapter?: number; // For database compatibility
}

export interface Devotional {
  id: string;
  title: string;
  content: string;
  verse: Verse;
  verse_text?: string;      // Database field
  verse_reference?: string;  // Database field
  author: string;
  author_name?: string;      // Database field
  date: Date;
  created_at?: string;       // Database field
  tags: string[];
  likes: number;
  likes_count?: number;      // Database field
  shares: number;
  shares_count?: number;      // Database field
  comments_count?: number;   // Database field
}

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readings: ReadingPlanItem[];
  participants: number;
  rating: number;
}

export interface ReadingPlanItem {
  id: string;
  day: number;
  title: string;
  passages: string[];
  devotional?: string;
  completed: boolean;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  members: string[];
  posts: string[];
  createdAt: Date;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  verse?: Verse;
  image?: string;
  likes: number;
  comments: Comment[];
  shares: number;
  createdAt: Date;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  likes: number;
  createdAt: Date;
}

export interface Gamification {
  points: number;
  level: number;
  streak: number;
  badges: Achievement[];
  leaderboard: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  points: number;
  rank: number;
}
