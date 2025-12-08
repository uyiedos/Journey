export interface Notification {
  id: string;
  userId: string;
  type: 'achievement' | 'streak' | 'points' | 'daily_login' | 'error';
  title: string;
  message: string;
  points?: number;
  timestamp: Date;
  read: boolean;
  icon?: string;
  duration?: number;
}

class NotificationService {
  static showNotification(notification: Omit<Notification, 'id' | 'userId' | 'timestamp' | 'read'>) {
    // For now, just log to console - can be enhanced with actual UI notifications
    console.log(`[${notification.type.toUpperCase()}] ${notification.title}: ${notification.message}`);
    
    // Show browser notification if available
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/favicon.ico'
      });
    }
  }

  static showAchievementNotification(title: string, points: number) {
    this.showNotification({
      type: 'achievement',
      title,
      message: `You earned ${points} points!`,
      icon: 'trophy',
      duration: 5000,
    });
  }

  static showStreakNotification(streak: number) {
    this.showNotification({
      type: 'streak',
      title: 'Streak Updated!',
      message: `You're on a ${streak}-day streak!`,
      icon: 'flame',
      duration: 5000,
    });
  }
}

export const notificationService = NotificationService;
