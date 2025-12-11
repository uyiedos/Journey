# Journey Points System

This document summarizes how points are currently earned and spent in the Journey app.

## Reading & Scripture Engagement

- **Reading session**
  - `+1` point per minute read.
- **Verse read**
  - `+1` point (via achievement activity `verse_read`).
- **Chapter completed**
  - `+10` points (via achievement activity `chapter_completed`).
- **Book completed**
  - `+50` points (via achievement activity `book_completed`).

## Devotionals

- **Create devotional content** (`supabaseService.createDevotionalContent`)
  - `+20` points once per day per user.
- **Devotional liked** (`ActivityService.trackDevotionalLiked`)
  - Liker: `+2` points.

## Reading Plans

- **Create reading plan** (`supabaseService.createReadingPlan`)
  - `+15` points once per day per user.
- **Start a reading plan** (`supabaseService.startReadingPlan`)
  - `+5` points.

## Prayer

- **Share a prayer** (`ActivityService.trackPrayerShared`)
  - `+15` points.
- **Respond to a prayer** (`ActivityService.trackPrayerResponded`)
  - `+5` points.

## Community & Social

There are two layers: generic activity points and feed economics.

### Generic community activity (ActivityService)

- **Post created** (`trackPostCreated`)
  - `+10` points per post.
- **Comment posted** (`trackCommentPosted`)
  - `+2` points per comment.
- **Post liked** (`trackPostLiked`)
  - No direct points; tracked for activity/achievements only.

### Community feed economics (supabaseService)

- **Create community post** (`createCommunityPost`)
  - `+5` points once per day in addition to the 10 from `ActivityService`.
- **Comment on a community post** (`createCommunityComment`)
  - Commenter: `-2` points (cost).
  - Post author: `+2` points (reward) if different user.
- **Like a community post** (`toggleCommunityLike`)
  - Liker: `-2` points when liking.
  - Post author: `+2` points when their post is liked (if different user).
- **Contribute points to groups/causes**
  - User spends their own points (negative `addPoints`), used for contribution achievements and group mechanics.

## Events

(from `src/app/events/page.tsx`)

- **Create an event**
  - `+500` points (was `+10`, now updated).
- **Like an event**
  - `+2` points per like.
- **Comment on an event**
  - `+2` points per comment.

## Referrals

(from `ReferralService.completeReferral`)

- **Referrer**
  - `+100` points when a referral is completed.
- **Referred user**
  - `+50` points welcome bonus.

## Streaks & Daily Faithfulness

(from `StreakService.checkStreakMilestones`)

Streak milestone bonuses (awarded via `supabaseService.addPoints`):

- `3`-day streak → `+10` points.
- `7`-day streak → `+25` points.
- `14`-day streak → `+50` points.
- `30`-day streak → `+100` points.
- `50`-day streak → `+200` points.
- `100`-day streak → `+500` points.
- `365`-day streak → `+1000` points.

## Achievements

(from `AchievementService` and `data/achievements.ts`)

- When an achievement unlocks, user is awarded:
  - `+achievement.points` (value defined per achievement in `achievements.ts`).
- Additional activity-based points in `trackActivityAndCheckAchievements`:
  - `verse_read` → `+1`.
  - `chapter_completed` → `+10`.
  - `book_completed` → `+50`.
  - `friend_added` → `+15`.
  - `group_created` → `+50`.
  - `prayer_shared` → `+15`.
  - `challenge_completed` → `+25`.
  - `daily_login` → `0` here (daily login points handled elsewhere via daily rewards logic).

## Notes

- Negative `addPoints` calls represent point **spends** (e.g., contributing to posts or rewarding other users).
- Some actions (devotionals, reading plans, community posts) have **once-per-day** rewards enforced via `hasReceivedDailyActionReward`.
- This document should be kept in sync whenever new point-awarding actions are added or values are rebalanced.
