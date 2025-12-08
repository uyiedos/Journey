# Real-Time Leaderboard Setup Guide

## Overview
This implementation creates an optimized, real-time leaderboard system with automatic updates and performance improvements.

## Files Created/Modified

### 1. Database Migration
- **File**: `create-leaderboard-table.sql`
- **Purpose**: Creates optimized leaderboard tables with triggers and real-time capabilities

### 2. Service Updates
- **File**: `src/services/supabaseService.ts`
- **Changes**: Updated leaderboard methods to use new optimized tables with fallback support

### 3. Frontend Updates
- **File**: `src/app/leaderboard/page.tsx`
- **Changes**: Added real-time subscriptions and improved data handling

## Database Schema

### Main Tables
1. **`leaderboard`** - Optimized table with pre-calculated rankings
2. **`weekly_stats`** - Tracks weekly performance metrics
3. **`monthly_stats`** - Tracks monthly performance metrics

### Key Features
- **Automatic rank calculation** with triggers
- **Real-time updates** via Supabase Realtime
- **Performance optimization** with indexed queries
- **Historical tracking** of rank changes
- **Fallback support** for backward compatibility

## Setup Instructions

### 1. Run the Migration
Execute the SQL script in Supabase SQL Editor:
```sql
-- Copy contents of create-leaderboard-table.sql and run in Supabase
```

### 2. Verify Setup
Check that tables were created:
```sql
SELECT COUNT(*) FROM leaderboard;
SELECT username, total_points, rank_position FROM leaderboard ORDER BY rank_position LIMIT 5;
```

### 3. Test Real-time Updates
- Open the leaderboard page in multiple browser windows
- Award points to a user (through any app feature)
- Watch the leaderboard update in real-time across all windows

## Performance Improvements

### Before
- Complex queries with `ROW_NUMBER()` calculations
- No caching of rank positions
- Manual rank calculation on every request

### After
- Pre-calculated ranks stored in database
- Optimized indexes for fast queries
- Automatic updates via triggers
- Real-time subscriptions for instant updates

## Real-time Features

### 1. Leaderboard Updates
- When any user's points change, the leaderboard automatically updates
- All connected users see changes instantly
- No need to refresh the page

### 2. Individual Rank Tracking
- Users see their rank change in real-time
- Rank change indicators (up/down/same)
- Historical rank tracking

### 3. Weekly/Monthly Stats
- Automatic weekly and monthly point tracking
- Separate leaderboards for different time periods
- Performance trends over time

## API Changes

### New Methods
```typescript
// Real-time subscriptions
subscribeToLeaderboard(callback: (leaderboard: UserProfile[]) => void)
subscribeToUserRanking(userId: string, callback: (ranking: any) => void)

// Optimized queries (with fallback support)
getLeaderboard(limit: number = 50)
getWeeklyLeaderboard(limit: number = 50)
getStreakLeaderboard(limit: number = 50)
getUserRank(userId: string)
```

### Fallback Support
- If new tables don't exist, automatically falls back to original queries
- Ensures backward compatibility during migration
- Graceful degradation if database issues occur

## Monitoring & Debugging

### Console Logs
The service includes detailed logging:
- "Fetching leaderboard data from optimized table..."
- "Leaderboard query result: {data, error, count}"
- "Using fallback leaderboard query..." (if needed)

### Database Monitoring
Monitor trigger performance:
```sql
SELECT * FROM leaderboard ORDER BY updated_at DESC LIMIT 5;
SELECT * FROM weekly_stats WHERE week_start = date_trunc('week', CURRENT_DATE);
```

## Troubleshooting

### Common Issues
1. **Real-time updates not working**
   - Check Supabase Realtime is enabled
   - Verify RLS policies allow subscriptions
   - Check browser console for connection errors

2. **Rank positions not updating**
   - Verify triggers are created: `\df update_leaderboard_ranks`
   - Check trigger execution: `SELECT * FROM leaderboard ORDER BY rank_position`

3. **Performance issues**
   - Check indexes: `\d leaderboard`
   - Monitor query performance with `EXPLAIN ANALYZE`

### Migration Issues
If migration fails:
1. Check table permissions
2. Verify user has necessary privileges
3. Check for existing conflicting tables
4. Run migration in parts if needed

## Future Enhancements

### Planned Features
- **Achievement integration** with leaderboard badges
- **Team leaderboards** for group competitions
- **Historical analytics** and trend analysis
- **Leaderboard categories** (by activity type)
- **Geographic leaderboards** by region

### Performance Optimizations
- **Caching layer** for frequently accessed data
- **Batch updates** to reduce trigger overhead
- **Partitioned tables** for large datasets
- **Materialized views** for complex analytics

## Security Considerations

### RLS Policies
- Public read access for leaderboard data
- User-specific access for personal ranking
- Admin-only write access to leaderboard tables

### Data Privacy
- No sensitive personal data in leaderboard
- Anonymous usernames for privacy
- Optional avatar display

---

## Quick Start Checklist

- [ ] Run `create-leaderboard-table.sql` in Supabase
- [ ] Verify tables are created and populated
- [ ] Test leaderboard page loads correctly
- [ ] Test real-time updates with point changes
- [ ] Monitor console for any errors
- [ ] Check performance with multiple users

The leaderboard is now optimized for performance and provides real-time updates for all users!
