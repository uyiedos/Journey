-- Update leaderboard view to include last_daily_claim
DROP VIEW IF EXISTS public.leaderboard_view CASCADE;
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  u.id,
  u.username,
  u.full_name,
  u.avatar_url,
  u.points,
  u.level,
  u.streak,
  u.longest_streak,
  u.last_daily_claim,
  u.created_at,
  u.updated_at,
  RANK() OVER (ORDER BY u.points DESC, u.created_at ASC) as rank_position
FROM public.users u
WHERE u.status = 'active'
ORDER BY u.points DESC, u.created_at ASC;
