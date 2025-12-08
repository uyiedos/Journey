-- Insert sample reading plans
INSERT INTO reading_plans (
  id,
  title,
  description,
  duration,
  difficulty,
  user_id,
  is_public,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  '21 Days of Prayer',
  'A three-week journey to develop a consistent prayer life and deepen your relationship with God.',
  21,
  'beginner',
  NULL, -- System plan, no user owner
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Gospel of John in 30 Days',
  'Read through the entire Gospel of John in one month and discover the life and teachings of Jesus.',
  30,
  'intermediate',
  NULL, -- System plan, no user owner
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Proverbs: Daily Wisdom',
  'Read one chapter of Proverbs each day for a month and gain practical wisdom for everyday life.',
  31,
  'beginner',
  NULL, -- System plan, no user owner
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Romans in 14 Days',
  'Study Paul''s letter to the Romans and understand the foundations of Christian theology.',
  14,
  'advanced',
  NULL, -- System plan, no user owner
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Psalms for Comfort',
  'A 7-day journey through selected Psalms to find comfort and peace in difficult times.',
  7,
  'beginner',
  NULL, -- System plan, no user owner
  true,
  NOW(),
  NOW()
);
