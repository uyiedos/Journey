-- 1. Check current RLS policies on users table
SELECT * FROM pg_policies 
WHERE tablename = 'users';

-- 2. Drop existing policies if they're too restrictive
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own points" ON public.users;

-- 3. Create new policies to allow points updates
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can update own points"
ON public.users
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (true);

-- 4. Grant necessary permissions
GRANT UPDATE (points, level, streak, longest_streak, last_daily_claim, updated_at) 
ON public.users 
TO authenticated;

-- 5. Test if we can update points directly (replace YOUR_USER_ID)
-- UPDATE public.users 
-- SET points = COALESCE(points, 0) + 10,
--     updated_at = NOW()
-- WHERE id = 'YOUR_USER_ID';

-- 6. Check if the function has the right permissions
ALTER FUNCTION public.claim_daily_points_rpc(UUID, INTEGER, INTEGER, INTEGER, INTEGER, TIMESTAMPTZ) 
SECURITY DEFINER 
OWNER TO postgres;
