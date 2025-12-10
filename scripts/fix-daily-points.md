# Fix Daily Points System

## Problem
Daily points are not being recorded in Supabase, showing a 400 error with empty error object.

## Solution Steps

### 1. Run the Migration
Execute the SQL in `migrations/2024-12-09-fix-daily-points.sql` in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire content of the migration file
4. Click "Run"

### 2. Verify Tables Exist
Run this query to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'daily_login_rewards', 'user_stats')
ORDER BY table_name;
```

### 3. Verify RLS Policies
Check that RLS policies are properly set:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'daily_login_rewards', 'user_stats')
ORDER BY tablename, policyname;
```

### 4. Test the Function
Test the RPC function directly in SQL Editor:

```sql
-- Replace with your actual user ID
SELECT claim_daily_points_rpc(
  'YOUR_USER_ID_HERE',
  10,
  10,
  1,
  0,
  NOW()
);
```

### 5. Check Function Permissions
Verify the function exists and has correct permissions:

```sql
SELECT 
  proname AS function_name,
  pg_get_userbyid(proowner) AS owner,
  prolang AS language,
  prosecdef AS security_definer
FROM pg_proc 
WHERE proname = 'claim_daily_points_rpc';
```

## What Was Fixed

1. **Created RPC Function**: Added `claim_daily_points_rpc` function that handles the daily points claim as a transaction
2. **Fixed RLS Policies**: Ensured proper Row Level Security policies on all tables
3. **Added Error Handling**: Better error messages and proper exception handling
4. **Updated Frontend**: Modified `supabaseService.ts` and `DailyPointsClaim.tsx` to handle the new response format

## Testing

After running the migration, test the daily points claim in your app:

1. Log in as a user
2. Click the "Claim 10 Points" button
3. Check the browser console for any errors
4. Verify the points are added to the user profile
5. Check that the `daily_login_rewards` table has a new entry

## Troubleshooting

If you still see errors:

1. Check the browser console for detailed error messages
2. Verify the user is authenticated (check `supabase.auth.getUser()`)
3. Ensure the migration ran successfully
4. Check that all tables and indexes were created

## Expected Behavior

- First claim of the day: Awards 10 points, sets streak to 1
- Consecutive daily claims: Awards 10 points, increments streak
- Missed a day: Resets streak to 1
- Already claimed today: Shows "already claimed" message
