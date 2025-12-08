(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase,
    "supabaseAdmin",
    ()=>supabaseAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [app-client] (ecmascript)");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://kzpirvgwtenbmapcblla.supabase.co") || 'https://your-project.supabase.co';
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cGlydmd3dGVuYm1hcGNibGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMjk4MTIsImV4cCI6MjA4MDYwNTgxMn0.Zjh1esoRzR4Q4bKDFNs-MUAfURSSAragmMa3bCi2oKE") || 'your-anon-key';
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});
// For server-side operations
const serviceRoleKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = serviceRoleKey ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
}) : null;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/supabaseService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabaseClient",
    ()=>supabaseClient,
    "supabaseService",
    ()=>supabaseService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
;
const supabaseClient = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"];
class SupabaseService {
    channels = new Map();
    // Helper method to get supabase client
    getClient() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"];
    }
    // Authentication
    async getCurrentUser() {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        return user;
    }
    async getCurrentSession() {
        const { data: { session } } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
        return session;
    }
    // User Profile Management
    async getUserProfile(userId) {
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('*').eq('id', userId).single();
        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
        return data;
    }
    async updateUserProfile(userId, updates) {
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').update(updates).eq('id', userId).select().single();
            if (error) {
                console.error('Error updating user profile:', {
                    error: error,
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                    userId: userId,
                    updates: updates
                });
                return null;
            }
            return data;
        } catch (err) {
            console.error('Unexpected error in updateUserProfile:', err);
            return null;
        }
    }
    async createUserProfile(user, additionalData) {
        const profileData = {
            id: user.id,
            email: user.email || '',
            username: additionalData?.username || user.email?.split('@')[0] || 'user',
            full_name: additionalData?.full_name || user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            points: 0,
            level: 1,
            streak: 0,
            longest_streak: 0,
            status: 'active'
        };
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').insert(profileData).select().single();
            if (error) {
                console.error('Error creating user profile:', error);
                // If username column doesn't exist, try without it
                if (error.message.includes('column') && error.message.includes('username')) {
                    const { data: dataWithoutUsername, error: errorWithoutUsername } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').insert({
                        id: profileData.id,
                        email: profileData.email,
                        full_name: profileData.full_name,
                        avatar_url: profileData.avatar_url,
                        points: profileData.points,
                        level: profileData.level,
                        streak: profileData.streak,
                        longest_streak: profileData.longest_streak,
                        status: profileData.status
                    }).select().single();
                    if (errorWithoutUsername) {
                        console.error('Error creating user profile without username:', errorWithoutUsername);
                        return null;
                    }
                    // Create user stats
                    await this.createUserStats(user.id);
                    return dataWithoutUsername;
                }
                return null;
            }
            // Create user stats
            await this.createUserStats(user.id);
            return data;
        } catch (error) {
            console.error('Error creating user profile:', error);
            return null;
        }
    }
    // User Stats Management
    async getUserStats(userId) {
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('user_stats').select('*').eq('user_id', userId).single();
        if (error) {
            console.error('Error fetching user stats:', error);
            return null;
        }
        return data;
    }
    async updateUserStats(userId, updates) {
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('user_stats').update(updates).eq('user_id', userId).select().single();
        if (error) {
            console.error('Error updating user stats:', error);
            return null;
        }
        return data;
    }
    async createUserStats(userId) {
        const statsData = {
            user_id: userId,
            verses_read: 0,
            chapters_completed: 0,
            devotionals_created: 0,
            prayers_shared: 0,
            friends_count: 0,
            reading_time_minutes: 0
        };
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('user_stats').insert(statsData).select().single();
        if (error) {
            console.error('Error creating user stats:', error);
            return null;
        }
        return data;
    }
    // Points and Level Management
    async addPoints(userId, points) {
        try {
            // Get current user profile
            const profile = await this.getUserProfile(userId);
            if (!profile) {
                console.error('User profile not found for userId:', userId);
                return null;
            }
            // Calculate new points and level
            const newPoints = profile.points + points;
            const newLevel = Math.floor(newPoints / 1000) + 1;
            // Update profile with better error handling
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').update({
                points: newPoints,
                level: newLevel,
                updated_at: new Date().toISOString()
            }).eq('id', userId).select().single();
            if (error) {
                console.error('Error updating user profile:', {
                    error: error,
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                    userId: userId,
                    newPoints: newPoints,
                    newLevel: newLevel
                });
                return null;
            }
            return data;
        } catch (err) {
            console.error('Unexpected error in addPoints:', err);
            return null;
        }
    }
    async updateStreak(userId, streak) {
        const profile = await this.getUserProfile(userId);
        if (!profile) return null;
        // Update longest streak if current streak exceeds it
        const newLongestStreak = Math.max(profile.longest_streak, streak);
        return await this.updateUserProfile(userId, {
            streak,
            longest_streak: newLongestStreak
        });
    }
    // Reading Progress
    async updateReadingProgress(userId, book, chapter, versesRead = 1) {
        const stats = await this.getUserStats(userId);
        if (!stats) return null;
        return await this.updateUserStats(userId, {
            verses_read: stats.verses_read + versesRead,
            chapters_completed: stats.chapters_completed + (versesRead > 0 ? 1 : 0)
        });
    }
    // Devotional Activities
    async createDevotional(userId) {
        const stats = await this.getUserStats(userId);
        if (!stats) return null;
        return await this.updateUserStats(userId, {
            devotionals_created: stats.devotionals_created + 1
        });
    }
    // Real Devotional Creation
    async createDevotionalContent(userId, devotionalData) {
        try {
            // Check if user is authenticated
            const { data: authData } = await this.getClient().auth.getUser();
            console.log('Auth check:', authData);
            if (!authData.user) {
                console.error('User not authenticated');
                return null;
            }
            console.log('Creating devotional with data:', {
                userId,
                devotionalData
            });
            const { data, error } = await this.getClient().from('devotionals').insert({
                user_id: userId,
                title: devotionalData.title,
                content: devotionalData.content,
                verse_reference: devotionalData.verse_reference,
                verse_text: devotionalData.verse_text,
                author_name: devotionalData.author_name || 'Anonymous',
                tags: devotionalData.tags || [],
                is_public: devotionalData.is_public !== false
            }).select().single();
            console.log('Supabase response:', {
                data,
                error
            });
            if (error) {
                console.error('Error creating devotional:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                return null;
            }
            // Award points for creating devotional
            await this.addPoints(userId, 20); // 20 points for creating a devotional
            await this.createDevotional(userId);
            return data;
        } catch (error) {
            console.error('Error creating devotional (catch):', {
                error: error,
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            return null;
        }
    }
    // Reading Plan Creation
    async createReadingPlan(userId, planData) {
        try {
            const { data, error } = await this.getClient().from('reading_plans').insert({
                user_id: userId,
                title: planData.title,
                description: planData.description,
                duration: planData.duration,
                difficulty: planData.difficulty || 'beginner',
                category: planData.category,
                verses_per_day: planData.verses_per_day || 3,
                is_public: planData.is_public !== false
            }).select().single();
            if (error) {
                console.error('Error creating reading plan:', error);
                return null;
            }
            // Award points for creating reading plan
            await this.addPoints(userId, 15); // 15 points for creating a reading plan
            return data;
        } catch (error) {
            console.error('Error creating reading plan:', error);
            return null;
        }
    }
    // Start Reading Plan
    async startReadingPlan(userId, planId) {
        try {
            const { data, error } = await this.getClient().from('user_reading_plans').insert({
                user_id: userId,
                plan_id: planId,
                started_at: new Date().toISOString(),
                current_day: 1,
                is_active: true
            }).select().single();
            if (error) {
                console.error('Error starting reading plan:', error);
                return null;
            }
            // Award points for starting a reading plan
            await this.addPoints(userId, 5); // 5 points for starting a plan
            return data;
        } catch (error) {
            console.error('Error starting reading plan:', error);
            return null;
        }
    }
    // Prayer Activities
    async sharePrayer(userId) {
        const stats = await this.getUserStats(userId);
        if (!stats) return null;
        return await this.updateUserStats(userId, {
            prayers_shared: stats.prayers_shared + 1
        });
    }
    // Reading Time
    async addReadingTime(userId, minutes) {
        const stats = await this.getUserStats(userId);
        if (!stats) return null;
        return await this.updateUserStats(userId, {
            reading_time_minutes: stats.reading_time_minutes + minutes
        });
    }
    // User Achievements
    async getUserAchievements(userId) {
        try {
            // First get user achievements
            const { data: userAchievements, error: userAchievementsError } = await this.getClient().from('user_achievements').select('*').eq('user_id', userId);
            if (userAchievementsError) {
                console.error('Error fetching user achievements:', userAchievementsError);
                return [];
            }
            if (!userAchievements || userAchievements.length === 0) {
                return [];
            }
            // Then get achievement details from local data
            const { achievements } = await __turbopack_context__.A("[project]/src/data/achievements.ts [app-client] (ecmascript, async loader)");
            const achievementIds = userAchievements.map((ua)=>ua.achievement_id);
            const achievementMap = new Map(achievements.map((a)=>[
                    a.id,
                    a
                ]));
            return userAchievements.map((ua)=>({
                    id: ua.id,
                    user_id: ua.user_id,
                    achievement_id: ua.achievement_id,
                    unlocked_at: ua.unlocked_at,
                    points_awarded: ua.points_awarded,
                    achievement: achievementMap.get(ua.achievement_id) || null
                }));
        } catch (error) {
            console.error('Error in getUserAchievements:', error);
            return [];
        }
    }
    async unlockAchievement(userId, achievementId) {
        try {
            // Check if achievement is already unlocked
            const { data: existing } = await this.getClient().from('user_achievements').select('id').eq('user_id', userId).eq('achievement_id', achievementId).maybeSingle();
            if (existing) {
                // Achievement already unlocked, no need to insert again
                return true;
            }
            // Insert new achievement
            const { error } = await this.getClient().from('user_achievements').insert({
                user_id: userId,
                achievement_id: achievementId,
                unlocked_at: new Date().toISOString()
            });
            if (error) {
                console.error('Error unlocking achievement:', error);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error unlocking achievement:', error);
            return false;
        }
    }
    // Leaderboard methods
    async getLeaderboard(limit = 50) {
        try {
            console.log('Fetching leaderboard data from optimized table...');
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('leaderboard_view').select('*').order('rank_position', {
                ascending: true
            }).limit(limit);
            console.log('Leaderboard query result:', {
                data,
                error,
                count: data?.length
            });
            if (error) throw error;
            // Transform to UserProfile format
            return data?.map((user)=>({
                    id: user.user_id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    avatar_url: user.avatar_url,
                    points: user.total_points,
                    level: user.level,
                    streak: user.streak,
                    longest_streak: user.longest_streak,
                    status: 'active',
                    created_at: user.user_created_at,
                    updated_at: user.updated_at
                })) || [];
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            // Fallback to original users table
            return this.getLeaderboardFallback(limit);
        }
    }
    async getLeaderboardFallback(limit = 50) {
        try {
            console.log('Using fallback leaderboard query...');
            // First try with status filter, then fallback without it
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('*');
            try {
                query = query.eq('status', 'active');
            } catch (statusError) {
                console.log('Status column might not exist, skipping status filter');
            // Continue without status filter
            }
            const { data, error } = await query.order('points', {
                ascending: false
            }).limit(limit);
            console.log('Fallback leaderboard query result:', {
                data,
                error,
                count: data?.length
            });
            if (error) throw error;
            return data || [];
        } catch (fallbackError) {
            console.error('Fallback query also failed:', fallbackError);
            return [];
        }
    }
    async getWeeklyLeaderboard(limit = 50) {
        try {
            console.log('Fetching weekly leaderboard data from optimized table...');
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('leaderboard').select('*').order('weekly_points', {
                ascending: false
            }).limit(limit);
            console.log('Weekly leaderboard query result:', {
                data,
                error,
                count: data?.length
            });
            if (error) throw error;
            // Transform to UserProfile format
            return data?.map((user)=>({
                    id: user.user_id,
                    username: user.username,
                    email: '',
                    full_name: '',
                    avatar_url: user.avatar_url,
                    points: user.weekly_points,
                    level: user.level,
                    streak: user.streak,
                    longest_streak: user.longest_streak,
                    status: 'active',
                    created_at: user.created_at,
                    updated_at: user.updated_at
                })) || [];
        } catch (error) {
            console.error('Error fetching weekly leaderboard:', error);
            // Fallback to original method
            return this.getWeeklyLeaderboardFallback(limit);
        }
    }
    async getWeeklyLeaderboardFallback(limit = 50) {
        try {
            console.log('Using fallback weekly leaderboard query...');
            // Get users with their points from the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            // First try with status filter, then fallback without it
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('*').gte('updated_at', sevenDaysAgo.toISOString());
            try {
                query = query.eq('status', 'active');
            } catch (statusError) {
                console.log('Status column might not exist, skipping status filter for weekly leaderboard');
            // Continue without status filter
            }
            const { data, error } = await query.order('points', {
                ascending: false
            }).limit(limit);
            console.log('Fallback weekly leaderboard query result:', {
                data,
                error,
                count: data?.length
            });
            if (error) throw error;
            return data || [];
        } catch (fallbackError) {
            console.error('Fallback weekly query also failed:', fallbackError);
            return [];
        }
    }
    async getStreakLeaderboard(limit = 50) {
        try {
            console.log('Fetching streak leaderboard data from optimized table...');
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('leaderboard').select('*').order('streak', {
                ascending: false
            }).limit(limit);
            console.log('Streak leaderboard query result:', {
                data,
                error,
                count: data?.length
            });
            if (error) throw error;
            // Transform to UserProfile format
            return data?.map((user)=>({
                    id: user.user_id,
                    username: user.username,
                    email: '',
                    full_name: '',
                    avatar_url: user.avatar_url,
                    points: user.total_points,
                    level: user.level,
                    streak: user.streak,
                    longest_streak: user.longest_streak,
                    status: 'active',
                    created_at: user.created_at,
                    updated_at: user.updated_at
                })) || [];
        } catch (error) {
            console.error('Error fetching streak leaderboard:', error);
            // Fallback to original method
            return this.getStreakLeaderboardFallback(limit);
        }
    }
    async getStreakLeaderboardFallback(limit = 50) {
        try {
            console.log('Using fallback streak leaderboard query...');
            // First try with status filter, then fallback without it
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('*');
            try {
                query = query.eq('status', 'active');
            } catch (statusError) {
                console.log('Status column might not exist, skipping status filter for streak leaderboard');
            // Continue without status filter
            }
            const { data, error } = await query.order('streak', {
                ascending: false
            }).limit(limit);
            console.log('Fallback streak leaderboard query result:', {
                data,
                error,
                count: data?.length
            });
            if (error) throw error;
            return data || [];
        } catch (fallbackError) {
            console.error('Fallback streak query also failed:', fallbackError);
            return [];
        }
    }
    async getUserRank(userId) {
        try {
            // Try to get rank from optimized leaderboard table first
            const { data: rankData, error: rankError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('leaderboard').select('rank_position').eq('user_id', userId).single();
            if (!rankError && rankData) {
                return rankData.rank_position;
            }
            // Fallback to calculating rank from users table
            const { data: userData, error: userError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('points').eq('id', userId).single();
            if (userError) throw userError;
            const { count, error: rankError2 } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('*', {
                count: 'exact',
                head: true
            }).eq('status', 'active').gt('points', userData.points);
            if (rankError2) throw rankError2;
            return (count || 0) + 1;
        } catch (error) {
            console.error('Error fetching user rank:', error);
            return 1;
        }
    }
    // Real-time subscription methods for leaderboard
    subscribeToLeaderboard(callback) {
        const channelName = 'leaderboard_updates';
        if (this.channels.has(channelName)) {
            return this.channels.get(channelName);
        }
        const channel = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].channel(channelName).on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'leaderboard'
        }, async ()=>{
            // Refresh leaderboard data when changes occur
            const updatedLeaderboard = await this.getLeaderboard(50);
            callback(updatedLeaderboard);
        }).subscribe();
        this.channels.set(channelName, channel);
        return channel;
    }
    subscribeToUserRanking(userId, callback) {
        const channelName = `user_ranking_${userId}`;
        if (this.channels.has(channelName)) {
            return this.channels.get(channelName);
        }
        const channel = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].channel(channelName).on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'leaderboard',
            filter: `user_id=eq.${userId}`
        }, async (payload)=>{
            if (payload.eventType === 'UPDATE' && payload.new) {
                callback(payload.new);
            }
        }).subscribe();
        this.channels.set(channelName, channel);
        return channel;
    }
    // Realtime Subscriptions
    subscribeToUser(userId, callback) {
        const channelName = `user_${userId}`;
        if (this.channels.has(channelName)) {
            return this.channels.get(channelName);
        }
        const channel = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].channel(channelName).on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${userId}`
        }, (payload)=>{
            if (payload.eventType === 'UPDATE' && payload.new) {
                callback(payload.new);
            }
        }).subscribe();
        this.channels.set(channelName, channel);
        return channel;
    }
    subscribeToUserStats(userId, callback) {
        const channelName = `user_stats_${userId}`;
        if (this.channels.has(channelName)) {
            return this.channels.get(channelName);
        }
        const channel = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].channel(channelName).on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'user_stats',
            filter: `user_id=eq.${userId}`
        }, (payload)=>{
            if (payload.eventType === 'UPDATE' && payload.new) {
                callback(payload.new);
            }
        }).subscribe();
        this.channels.set(channelName, channel);
        return channel;
    }
    // Cleanup
    unsubscribe(channelName) {
        const channel = this.channels.get(channelName);
        if (channel) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].removeChannel(channel);
            this.channels.delete(channelName);
        }
    }
    unsubscribeAll() {
        this.channels.forEach((channel)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].removeChannel(channel);
        });
        this.channels.clear();
    }
}
const supabaseService = new SupabaseService();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/referralService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReferralService",
    ()=>ReferralService,
    "referralService",
    ()=>referralService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/supabaseService.ts [app-client] (ecmascript)");
;
;
class ReferralService {
    static async getReferralInfo(userId) {
        try {
            console.log('Getting referral info for userId:', userId);
            // Try to get username and referral_code, fallback to email if username doesn't exist
            const { data: user, error: userError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('username, referral_code, email').eq('id', userId).single();
            console.log('User data:', user);
            console.log('User error:', userError);
            if (userError) {
                console.error('Error fetching user:', userError);
                console.error('Error details:', JSON.stringify(userError, null, 2));
                console.error('Error code:', userError.code);
                console.error('Error message:', userError.message);
                console.error('Error details:', userError.details);
                // If user doesn't exist, try to get their email from auth and create a basic referral code
                const { data: authUser } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
                if (authUser.user && authUser.user.email) {
                    const emailReferralCode = authUser.user.email.split('@')[0].toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
                    console.log('Using auth email for referral code:', emailReferralCode);
                    return {
                        referral_code: emailReferralCode,
                        referral_url: `${window.location.origin}/auth?ref=${emailReferralCode}`,
                        total_referrals: 0,
                        completed_referrals: 0,
                        pending_referrals: 0,
                        points_earned: 0
                    };
                }
                return null;
            }
            if (!user) {
                console.log('No user data found');
                return null;
            }
            // Use username as referral code if referral_code is not set, fallback to email
            const referralCode = user.referral_code || user.username || user.email.split('@')[0].toLowerCase();
            console.log('Using referral code:', referralCode);
            const { data: referrals, error: referralError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('referrals').select('status, points_awarded').eq('referrer_id', userId);
            console.log('Referrals data:', referrals);
            console.log('Referrals error:', referralError);
            if (referralError) {
                console.error('Error fetching referrals:', referralError);
                // Return basic info if referrals table doesn't exist or has permission issues
                return {
                    referral_code: referralCode,
                    referral_url: `${window.location.origin}/auth?ref=${referralCode}`,
                    total_referrals: 0,
                    completed_referrals: 0,
                    pending_referrals: 0,
                    points_earned: 0
                };
            }
            const referralList = referrals || [];
            const completed_referrals = referralList.filter((r)=>r.status === 'completed').length;
            const pending_referrals = referralList.filter((r)=>r.status === 'pending').length;
            const points_earned = referralList.reduce((sum, r)=>sum + (r.points_awarded || 0), 0);
            return {
                referral_code: referralCode,
                referral_url: `${window.location.origin}/auth?ref=${referralCode}`,
                total_referrals: referralList.length,
                completed_referrals,
                pending_referrals,
                points_earned
            };
        } catch (error) {
            console.error('Error getting referral info:', error);
            return null;
        }
    }
    static async processReferral(referralCode, newUserId) {
        try {
            const { data: referrer, error: referrerError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('id').eq('referral_code', referralCode).single();
            if (referrerError || !referrer) return false;
            const { data: existingReferral } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('referrals').select('id').eq('referred_id', newUserId).single();
            if (existingReferral) return false;
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').update({
                referred_by: referrer.id
            }).eq('id', newUserId);
            const { error: referralError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('referrals').insert({
                referrer_id: referrer.id,
                referred_id: newUserId,
                referral_code: referralCode,
                status: 'pending',
                points_awarded: 0
            });
            if (referralError) throw referralError;
            return true;
        } catch (error) {
            console.error('Error processing referral:', error);
            return false;
        }
    }
    static async completeReferral(referralId) {
        try {
            const { data: referral, error: fetchError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('referrals').select('*').eq('id', referralId).single();
            if (fetchError || !referral) throw fetchError;
            const { error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('referrals').update({
                status: 'completed',
                points_awarded: 100,
                completed_at: new Date().toISOString()
            }).eq('id', referralId);
            if (updateError) throw updateError;
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].addPoints(referral.referrer_id, 100);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('points_transactions').insert({
                user_id: referral.referrer_id,
                transaction_type: 'referral',
                points: 100,
                description: 'Referral bonus',
                metadata: {
                    referred_user: referral.referred_id,
                    referral_code: referral.referral_code
                }
            });
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('user_stats').update({
                referrals_completed: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].rpc('increment', {
                    amount: 1
                }),
                total_points_earned: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].rpc('increment', {
                    amount: 100
                })
            }).eq('user_id', referral.referrer_id);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].addPoints(referral.referred_id, 50);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('points_transactions').insert({
                user_id: referral.referred_id,
                transaction_type: 'referral',
                points: 50,
                description: 'Welcome bonus',
                metadata: {
                    referred_by: referral.referrer_id,
                    referral_code: referral.referral_code
                }
            });
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('user_stats').update({
                total_points_earned: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].rpc('increment', {
                    amount: 50
                })
            }).eq('user_id', referral.referred_id);
        } catch (error) {
            console.error('Error completing referral:', error);
            throw error;
        }
    }
    static generateReferralUrl(referralCode) {
        return `${window.location.origin}/auth?ref=${referralCode}`;
    }
    static async validateReferralCode(referralCode) {
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('id').eq('referral_code', referralCode).single();
            return !error && !!data;
        } catch (error) {
            return false;
        }
    }
    static async getReferralHistory(userId) {
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('referrals').select(`
          *,
          referred_user:referred_id(id, username, email, created_at)
        `).eq('referrer_id', userId).order('created_at', {
                ascending: false
            });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting referral history:', error);
            return [];
        }
    }
    static async checkPendingReferrals(userId) {
        try {
            const userProfile = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getUserProfile(userId);
            if (!userProfile) return;
            const isActive = userProfile.points > 0 || userProfile.streak > 0;
            if (isActive) {
                const { data: pendingReferrals } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('referrals').select('id').eq('referred_id', userId).eq('status', 'pending');
                if (pendingReferrals && pendingReferrals.length > 0) {
                    await this.completeReferral(pendingReferrals[0].id);
                }
            }
        } catch (error) {
            console.error('Error checking pending referrals:', error);
        }
    }
}
const referralService = ReferralService;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/SupabaseAuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$referralService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/referralService.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            // Get initial session
            const getInitialSession = {
                "AuthProvider.useEffect.getInitialSession": async ()=>{
                    try {
                        const { data: { session: session_0 }, error: error_0 } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
                        if (error_0) {
                            console.error('Error getting initial session:', error_0);
                            // If refresh token is invalid, clear session and force re-auth
                            if (error_0.message?.includes('Refresh Token Not Found') || error_0.message?.includes('Invalid Refresh Token')) {
                                console.log('Invalid refresh token, clearing session');
                                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
                                setSession(null);
                                setUser(null);
                            }
                        } else {
                            console.log('Initial session:', session_0?.user?.email);
                            setSession(session_0);
                            setUser(session_0?.user ?? null);
                        }
                    } catch (error) {
                        console.error('Error getting initial session:', error);
                        setSession(null);
                        setUser(null);
                    } finally{
                        setLoading(false);
                    }
                }
            }["AuthProvider.useEffect.getInitialSession"];
            getInitialSession();
            // Listen for auth changes
            const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange({
                "AuthProvider.useEffect": async (event, session_1)=>{
                    console.log('Auth state changed:', event, session_1?.user?.email);
                    // Handle token refresh errors
                    if (event === 'TOKEN_REFRESHED' && !session_1) {
                        console.log('Token refresh failed, signing out');
                        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
                    }
                    setSession(session_1);
                    setUser(session_1?.user ?? null);
                    setLoading(false);
                }
            }["AuthProvider.useEffect"]);
            return ({
                "AuthProvider.useEffect": ()=>subscription.unsubscribe()
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], []);
    const signUp = async (email, password, fullName, referralCode)=>{
        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return {
                    success: false,
                    error: 'Please enter a valid email address',
                    message: 'Please enter a valid email address'
                };
            }
            if (password.length < 6) {
                return {
                    success: false,
                    error: 'Password must be at least 6 characters long',
                    message: 'Password must be at least 6 characters long'
                };
            }
            console.log('Attempting sign up for:', email);
            const { data, error: error_2 } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName || email.split('@')[0]
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });
            if (error_2) {
                console.error('Supabase sign up error:', error_2);
                return {
                    success: false,
                    error: error_2.message || 'Failed to create account',
                    message: error_2.message || 'Failed to create account'
                };
            }
            console.log('Sign up response:', data);
            // Process referral if provided and user was created
            if (referralCode && data.user) {
                console.log('Processing referral:', referralCode);
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$referralService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["referralService"].processReferral(referralCode, data.user.id);
            }
            if (data.user && !data.user.email_confirmed_at) {
                return {
                    success: true,
                    message: 'Please check your email to confirm your account.',
                    needsConfirmation: true
                };
            }
            return {
                success: true,
                message: 'Account created successfully!'
            };
        } catch (error_1) {
            console.error('Unexpected sign up error:', error_1);
            return {
                success: false,
                error: error_1.message || 'An unexpected error occurred',
                message: error_1.message || 'An unexpected error occurred'
            };
        }
    };
    const signIn = async (email_0, password_0)=>{
        try {
            const emailRegex_0 = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex_0.test(email_0)) {
                return {
                    error: {
                        message: 'Please enter a valid email address'
                    }
                };
            }
            if (!password_0) {
                return {
                    error: {
                        message: 'Password is required'
                    }
                };
            }
            console.log('Attempting sign in for:', email_0);
            const { data: data_0, error: error_4 } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signInWithPassword({
                email: email_0,
                password: password_0
            });
            if (error_4) {
                console.error('Supabase sign in error:', error_4);
                return {
                    error: error_4
                };
            }
            // Award daily login points
            if (data_0.user) {
                console.log('Awarding daily login points to:', data_0.user.id);
                try {
                    const { data: pointsData, error: pointsError_0 } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].rpc('award_daily_login_points', {
                        user_uuid: data_0.user.id
                    });
                    if (pointsError_0) {
                        console.error('Error awarding daily points:', pointsError_0);
                    } else {
                        console.log('Daily login points awarded:', pointsData);
                    }
                } catch (pointsError) {
                    console.error('Error calling daily points function:', pointsError);
                }
                // Check for pending referrals to complete
                try {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$referralService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["referralService"].checkPendingReferrals(data_0.user.id);
                } catch (referralError) {
                    console.error('Error checking pending referrals:', referralError);
                }
            }
            console.log('Sign in successful:', data_0.user?.email);
            return {
                error: null
            };
        } catch (error_3) {
            console.error('Unexpected sign in error:', error_3);
            return {
                error: {
                    message: 'An unexpected error occurred'
                }
            };
        }
    };
    const signOut = async ()=>{
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
            setSession(null);
            setUser(null);
            console.log('User signed out successfully');
        } catch (error_5) {
            console.error('Error signing out:', error_5);
            // Force clear state even if signOut fails
            setSession(null);
            setUser(null);
        }
    };
    const resetPassword = async (email_1)=>{
        const { error: error_6 } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.resetPasswordForEmail(email_1);
        return {
            error: error_6
        };
    };
    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/SupabaseAuthContext.tsx",
        lineNumber: 256,
        columnNumber: 10
    }, this);
}
_s(AuthProvider, "sIDOCMze9iVqwxkgWIhOu8vskSI=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(1);
    if ($[0] !== "23c0c20c17d1a0d6ced9d4ccdc91b3b6e621677f817137fac9841a588f67d271") {
        for(let $i = 0; $i < 1; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "23c0c20c17d1a0d6ced9d4ccdc91b3b6e621677f817137fac9841a588f67d271";
    }
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/data/achievements.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "achievements",
    ()=>achievements,
    "getAchievementById",
    ()=>getAchievementById,
    "getAchievementsByCategory",
    ()=>getAchievementsByCategory
]);
const achievements = [
    // Daily Login Achievements
    {
        id: 'daily-login-1',
        name: 'First Day',
        description: 'Log in for the first time',
        icon: 'sun',
        points: 5,
        category: 'daily',
        unlockedAt: new Date()
    },
    {
        id: 'daily-login-7',
        name: 'Week Warrior',
        description: 'Log in for 7 consecutive days',
        icon: 'calendar',
        points: 50,
        category: 'daily',
        unlockedAt: new Date()
    },
    {
        id: 'daily-login-30',
        name: 'Monthly Master',
        description: 'Log in for 30 consecutive days',
        icon: 'calendar',
        points: 200,
        category: 'daily',
        unlockedAt: new Date()
    },
    // Reading Achievements
    {
        id: 'first-verse',
        name: 'First Steps',
        description: 'Read your first Bible verse',
        icon: 'book-open',
        points: 10,
        category: 'reading',
        unlockedAt: new Date()
    },
    {
        id: 'chapter-complete',
        name: 'Chapter Reader',
        description: 'Complete reading an entire chapter',
        icon: 'book-open',
        points: 25,
        category: 'reading',
        unlockedAt: new Date()
    },
    {
        id: 'book-complete',
        name: 'Book Scholar',
        description: 'Complete reading an entire book',
        icon: 'book-open',
        points: 100,
        category: 'reading',
        unlockedAt: new Date()
    },
    {
        id: 'testament-complete',
        name: 'Testament Master',
        description: 'Complete reading an entire testament',
        icon: 'book-open',
        points: 500,
        category: 'reading',
        unlockedAt: new Date()
    },
    {
        id: 'bible-complete',
        name: 'Bible Scholar',
        description: 'Complete reading the entire Bible',
        icon: 'trophy',
        points: 1000,
        category: 'reading',
        unlockedAt: new Date()
    },
    // Streak Achievements
    {
        id: 'streak-3',
        name: '3 Day Streak',
        description: 'Maintain a 3-day reading streak',
        icon: 'flame',
        points: 30,
        category: 'streak',
        unlockedAt: new Date()
    },
    {
        id: 'streak-7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day reading streak',
        icon: 'flame',
        points: 75,
        category: 'streak',
        unlockedAt: new Date()
    },
    {
        id: 'streak-30',
        name: 'Monthly Master',
        description: 'Maintain a 30-day reading streak',
        icon: 'flame',
        points: 300,
        category: 'streak',
        unlockedAt: new Date()
    },
    {
        id: 'streak-100',
        name: 'Century Saint',
        description: 'Maintain a 100-day reading streak',
        icon: 'flame',
        points: 1000,
        category: 'streak',
        unlockedAt: new Date()
    },
    // Community Achievements
    {
        id: 'first-friend',
        name: 'Friend Maker',
        description: 'Add your first friend',
        icon: 'users',
        points: 15,
        category: 'community',
        unlockedAt: new Date()
    },
    {
        id: 'social-butterfly',
        name: 'Social Butterfly',
        description: 'Add 10 friends',
        icon: 'users',
        points: 50,
        category: 'community',
        unlockedAt: new Date()
    },
    {
        id: 'first-post',
        name: 'Voice Heard',
        description: 'Make your first community post',
        icon: 'message-circle',
        points: 20,
        category: 'community',
        unlockedAt: new Date()
    },
    {
        id: 'community-leader',
        name: 'Community Leader',
        description: 'Make 10 community posts',
        icon: 'message-circle',
        points: 100,
        category: 'community',
        unlockedAt: new Date()
    },
    // Devotional Achievements
    {
        id: 'first-devotional',
        name: 'First Devotional',
        description: 'Create your first devotional',
        icon: 'heart',
        points: 20,
        category: 'special',
        unlockedAt: new Date()
    },
    {
        id: 'devotional-writer',
        name: 'Devotional Writer',
        description: 'Create 5 devotionals',
        icon: 'heart',
        points: 100,
        category: 'special',
        unlockedAt: new Date()
    },
    {
        id: 'devotional-author',
        name: 'Devotional Author',
        description: 'Create 20 devotionals',
        icon: 'heart',
        points: 300,
        category: 'special',
        unlockedAt: new Date()
    },
    // Prayer Achievements
    {
        id: 'first-prayer',
        name: 'First Prayer',
        description: 'Share your first prayer',
        icon: 'hands',
        points: 15,
        category: 'special',
        unlockedAt: new Date()
    },
    {
        id: 'prayer-warrior',
        name: 'Prayer Warrior',
        description: 'Share 10 prayers',
        icon: 'hands',
        points: 75,
        category: 'special',
        unlockedAt: new Date()
    },
    {
        id: 'prayer-intercessor',
        name: 'Prayer Intercessor',
        description: 'Share 50 prayers',
        icon: 'hands',
        points: 200,
        category: 'special',
        unlockedAt: new Date()
    },
    // Reading Plan Achievements
    {
        id: 'first-plan',
        name: 'Plan Starter',
        description: 'Start your first reading plan',
        icon: 'calendar',
        points: 10,
        category: 'reading',
        unlockedAt: new Date()
    },
    {
        id: 'plan-completer',
        name: 'Plan Completer',
        description: 'Complete your first reading plan',
        icon: 'calendar',
        points: 50,
        category: 'reading',
        unlockedAt: new Date()
    },
    {
        id: 'plan-enthusiast',
        name: 'Plan Enthusiast',
        description: 'Start 5 reading plans',
        icon: 'calendar',
        points: 100,
        category: 'reading',
        unlockedAt: new Date()
    },
    // Point Achievements
    {
        id: 'point-collector',
        name: 'Point Collector',
        description: 'Earn 100 points',
        icon: 'star',
        points: 50,
        category: 'special',
        unlockedAt: new Date()
    },
    {
        id: 'point-master',
        name: 'Point Master',
        description: 'Earn 1000 points',
        icon: 'star',
        points: 100,
        category: 'special',
        unlockedAt: new Date()
    },
    {
        id: 'point-legend',
        name: 'Point Legend',
        description: 'Earn 10000 points',
        icon: 'star',
        points: 500,
        category: 'special',
        unlockedAt: new Date()
    },
    // Special Achievements
    {
        id: 'early-bird',
        name: 'Early Bird',
        description: 'Read Bible verses before 6 AM for 7 days',
        icon: 'sun',
        points: 150,
        category: 'special',
        unlockedAt: new Date()
    },
    {
        id: 'night-owl',
        name: 'Night Owl',
        description: 'Read Bible verses after 10 PM for 7 days',
        icon: 'moon',
        points: 150,
        category: 'special',
        unlockedAt: new Date()
    },
    {
        id: 'explorer',
        name: 'Bible Explorer',
        description: 'Read from every book of the Bible',
        icon: 'compass',
        points: 750,
        category: 'special',
        unlockedAt: new Date()
    }
];
const getAchievementsByCategory = (category)=>{
    return achievements.filter((achievement)=>achievement.category === category);
};
const getAchievementById = (id)=>{
    return achievements.find((achievement)=>achievement.id === id);
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/achievementService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "achievementService",
    ()=>achievementService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/supabaseService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$achievements$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/achievements.ts [app-client] (ecmascript)");
;
;
class AchievementService {
    // Daily Login Tracking
    static async trackDailyLogin(userId) {
        const now = new Date();
        try {
            // Check if user has claimed in the last 24 hours
            const existingLogin = await this.getRecentLoginRecord(userId);
            if (existingLogin) {
                return {
                    pointsAwarded: 0,
                    newAchievements: [],
                    streakUpdated: false
                };
            }
            // Record today's login and award points
            const pointsAwarded = await this.awardDailyLoginPoints(userId);
            // Update streak
            const streakUpdated = await this.updateLoginStreak(userId);
            // Check for new achievements
            const newAchievements = await this.checkDailyLoginAchievements(userId);
            return {
                pointsAwarded,
                newAchievements,
                streakUpdated
            };
        } catch (error) {
            console.error('Error tracking daily login:', error);
            return {
                pointsAwarded: 0,
                newAchievements: [],
                streakUpdated: false
            };
        }
    }
    static async getRecentLoginRecord(userId) {
        try {
            const now = new Date();
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getClient().from('daily_login_rewards').select('*').eq('user_id', userId).gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()).order('created_at', {
                ascending: false
            }).limit(1).maybeSingle();
            if (error) {
                console.error('Error checking recent login:', error);
                return null;
            }
            return data;
        } catch (error) {
            console.error('Error getting recent login record:', error);
            return null;
        }
    }
    static async awardDailyLoginPoints(userId) {
        const basePoints = 5;
        const userProfile = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getUserProfile(userId);
        if (!userProfile) return 0;
        // Bonus points for streak milestones
        let bonusPoints = 0;
        if (userProfile.streak === 7) bonusPoints = 10;
        if (userProfile.streak === 30) bonusPoints = 25;
        if (userProfile.streak === 100) bonusPoints = 100;
        const totalPoints = basePoints + bonusPoints;
        // Add points to user profile
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].addPoints(userId, totalPoints);
        // Record daily login
        await this.recordDailyLogin(userId, totalPoints);
        return totalPoints;
    }
    static async recordDailyLogin(userId, points) {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getClient().from('daily_login_rewards').insert({
                user_id: userId,
                points_awarded: points
            });
        } catch (error) {
            console.error('Error recording daily login:', error);
        }
    }
    static async updateLoginStreak(userId) {
        try {
            const userProfile = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getUserProfile(userId);
            if (!userProfile) return false;
            const now = new Date();
            const lastActive = new Date(userProfile.updated_at);
            // Calculate hours difference
            const hoursDiff = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
            let newStreak = userProfile.streak;
            if (hoursDiff < 24) {
                // Already claimed within 24 hours, no change
                return false;
            } else if (hoursDiff <= 48) {
                // Continue streak (within 48 hours)
                newStreak += 1;
            } else {
                // Reset streak (more than 48 hours)
                newStreak = 1;
            }
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].updateStreak(userId, newStreak);
            return true;
        } catch (error) {
            console.error('Error updating login streak:', error);
            return false;
        }
    }
    static async checkDailyLoginAchievements(userId) {
        const userProfile = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getUserProfile(userId);
        if (!userProfile) return [];
        const newAchievements = [];
        const userAchievements = await this.getUserAchievements(userId);
        const unlockedIds = new Set(userAchievements.map((ua)=>ua.achievement_id));
        // Check daily login achievements
        const dailyAchievements = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$achievements$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["achievements"].filter((a)=>a.category === 'daily');
        for (const achievement of dailyAchievements){
            if (unlockedIds.has(achievement.id)) continue;
            let shouldUnlock = false;
            switch(achievement.id){
                case 'daily-login-1':
                    shouldUnlock = userProfile.streak >= 1;
                    break;
                case 'daily-login-7':
                    shouldUnlock = userProfile.streak >= 7;
                    break;
                case 'daily-login-30':
                    shouldUnlock = userProfile.streak >= 30;
                    break;
            }
            if (shouldUnlock) {
                await this.unlockAchievement(userId, achievement.id);
                newAchievements.push(achievement);
            }
        }
        return newAchievements;
    }
    // Achievement Management
    static async unlockAchievement(userId, achievementId) {
        try {
            const achievement = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$achievements$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAchievementById"])(achievementId);
            if (!achievement) return false;
            // Check if already unlocked
            const existing = await this.getUserAchievement(userId, achievementId);
            if (existing) return false;
            // Record achievement unlock
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getClient().from('user_achievements').insert({
                user_id: userId,
                achievement_id: achievementId,
                unlocked_at: new Date().toISOString(),
                points_awarded: achievement.points
            });
            // Award achievement points
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].addPoints(userId, achievement.points);
            return true;
        } catch (error) {
            console.error('Error unlocking achievement:', error);
            return false;
        }
    }
    static async getUserAchievements(userId) {
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getClient().from('user_achievements').select('*').eq('user_id', userId).order('unlocked_at', {
                ascending: false
            });
            if (error) {
                console.error('Error fetching user achievements:', error);
                return [];
            }
            return data || [];
        } catch (error) {
            console.error('Error getting user achievements:', error);
            return [];
        }
    }
    static async getUserAchievement(userId, achievementId) {
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getClient().from('user_achievements').select('*').eq('user_id', userId).eq('achievement_id', achievementId).single();
            if (error) {
                console.error('Error fetching user achievement:', error);
                return null;
            }
            return data;
        } catch (error) {
            console.error('Error getting user achievement:', error);
            return null;
        }
    }
    // Enhanced Activity Tracking
    static async trackActivityAndCheckAchievements(userId, activityType, metadata) {
        const newAchievements = [];
        let pointsAwarded = 0;
        try {
            // Track the specific activity and award points
            switch(activityType){
                case 'verse_read':
                    pointsAwarded = 1;
                    await this.checkReadingAchievements(userId);
                    break;
                case 'chapter_completed':
                    pointsAwarded = 10;
                    await this.checkReadingAchievements(userId);
                    break;
                case 'book_completed':
                    pointsAwarded = 50;
                    await this.checkReadingAchievements(userId);
                    break;
                case 'post_created':
                    pointsAwarded = 20;
                    await this.checkCommunityAchievements(userId);
                    break;
                case 'friend_added':
                    pointsAwarded = 15;
                    await this.checkCommunityAchievements(userId);
                    break;
                default:
                    pointsAwarded = 0;
            }
            // Award points
            if (pointsAwarded > 0) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].addPoints(userId, pointsAwarded);
            }
            return {
                pointsAwarded,
                newAchievements
            };
        } catch (error) {
            console.error('Error tracking activity and achievements:', error);
            return {
                pointsAwarded: 0,
                newAchievements: []
            };
        }
    }
    static async checkReadingAchievements(userId) {
        // Implementation for checking reading achievements
        // This would check verses read, chapters completed, etc.
        return [];
    }
    static async checkCommunityAchievements(userId) {
        // Implementation for checking community achievements
        // This would check friends count, posts created, etc.
        return [];
    }
    // Check and award achievements based on user activity
    static async checkAndAwardAchievements(userId) {
        try {
            const newAchievements = [];
            let totalPointsAwarded = 0;
            // Get user stats
            const userStats = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getUserStats(userId);
            if (!userStats) {
                return {
                    newAchievements,
                    pointsAwarded: 0
                };
            }
            // Get user profile for streak info
            const userProfile = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getUserProfile(userId);
            if (!userProfile) {
                return {
                    newAchievements,
                    pointsAwarded: 0
                };
            }
            // Get existing achievements to avoid duplicates
            const existingAchievements = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getUserAchievements(userId);
            const unlockedIds = new Set(existingAchievements.map((ua)=>ua.achievement_id));
            // Check all achievements
            for (const achievement of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$achievements$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["achievements"]){
                if (unlockedIds.has(achievement.id)) continue; // Skip if already unlocked
                let shouldAward = false;
                // Check based on achievement category and criteria
                switch(achievement.id){
                    // Daily Login Achievements
                    case 'daily-login-1':
                        shouldAward = true; // Awarded when user first logs in
                        break;
                    case 'daily-login-7':
                        shouldAward = userProfile.streak >= 7;
                        break;
                    case 'daily-login-30':
                        shouldAward = userProfile.streak >= 30;
                        break;
                    // Reading Achievements
                    case 'first-verse':
                        shouldAward = userStats.verses_read > 0;
                        break;
                    case 'chapter-complete':
                        shouldAward = userStats.chapters_completed >= 1;
                        break;
                    case 'book-complete':
                        shouldAward = userStats.chapters_completed >= 10; // Approximate
                        break;
                    case 'testament-complete':
                        shouldAward = userStats.chapters_completed >= 50; // Approximate
                        break;
                    case 'bible-complete':
                        shouldAward = userStats.chapters_completed >= 1189; // All chapters
                        break;
                    // Streak Achievements
                    case 'streak-3':
                        shouldAward = userProfile.streak >= 3;
                        break;
                    case 'streak-7':
                        shouldAward = userProfile.streak >= 7;
                        break;
                    case 'streak-30':
                        shouldAward = userProfile.streak >= 30;
                        break;
                    case 'streak-100':
                        shouldAward = userProfile.streak >= 100;
                        break;
                    // Devotional Achievements
                    case 'first-devotional':
                        shouldAward = userStats.devotionals_created >= 1;
                        break;
                    case 'devotional-writer':
                        shouldAward = userStats.devotionals_created >= 5;
                        break;
                    case 'devotional-author':
                        shouldAward = userStats.devotionals_created >= 20;
                        break;
                    // Prayer Achievements
                    case 'first-prayer':
                        shouldAward = userStats.prayers_shared >= 1;
                        break;
                    case 'prayer-warrior':
                        shouldAward = userStats.prayers_shared >= 10;
                        break;
                    case 'prayer-intercessor':
                        shouldAward = userStats.prayers_shared >= 50;
                        break;
                    // Reading Plan Achievements
                    case 'first-plan':
                        shouldAward = userStats.reading_plans_started >= 1;
                        break;
                    case 'plan-completer':
                        shouldAward = userStats.reading_plans_completed >= 1;
                        break;
                    case 'plan-enthusiast':
                        shouldAward = userStats.reading_plans_started >= 5;
                        break;
                    // Community Achievements
                    case 'first-friend':
                        shouldAward = userStats.friends_count >= 1;
                        break;
                    case 'social-butterfly':
                        shouldAward = userStats.friends_count >= 10;
                        break;
                    case 'first-post':
                        shouldAward = userStats.community_posts >= 1;
                        break;
                    case 'community-leader':
                        shouldAward = userStats.community_posts >= 10;
                        break;
                    // Special Achievements
                    case 'early-bird':
                        shouldAward = !!(userProfile.created_at && new Date(userProfile.created_at) < new Date('2024-01-01'));
                        break;
                    case 'point-collector':
                        shouldAward = userProfile.points >= 100;
                        break;
                    case 'point-master':
                        shouldAward = userProfile.points >= 1000;
                        break;
                    case 'point-legend':
                        shouldAward = userProfile.points >= 10000;
                        break;
                }
                if (shouldAward) {
                    // Award the achievement
                    const awarded = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].unlockAchievement(userId, achievement.id);
                    if (awarded) {
                        newAchievements.push(achievement);
                        totalPointsAwarded += achievement.points;
                    }
                }
            }
            // Award total points for new achievements
            if (totalPointsAwarded > 0) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].addPoints(userId, totalPointsAwarded);
            }
            return {
                newAchievements,
                pointsAwarded: totalPointsAwarded
            };
        } catch (error) {
            console.error('Error checking achievements:', error);
            return {
                newAchievements: [],
                pointsAwarded: 0
            };
        }
    }
    static async getAchievementStats(userId) {
        try {
            const allAchievements = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$achievements$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["achievements"];
            const userAchievements = await this.getUserAchievements(userId);
            const unlockedIds = new Set(userAchievements.map((ua)=>ua.achievement_id));
            const categories = [
                ...new Set(allAchievements.map((a)=>a.category))
            ];
            const categoryProgress = {};
            categories.forEach((category)=>{
                const categoryAchievements = allAchievements.filter((a)=>a.category === category);
                const unlockedInCategory = categoryAchievements.filter((a)=>unlockedIds.has(a.id));
                categoryProgress[category] = {
                    unlocked: unlockedInCategory.length,
                    total: categoryAchievements.length
                };
            });
            return {
                totalAchievements: allAchievements.length,
                unlockedAchievements: userAchievements.length,
                totalPoints: userAchievements.reduce((sum, ua)=>sum + ua.points_awarded, 0),
                categoryProgress
            };
        } catch (error) {
            console.error('Error getting achievement stats:', error);
            return {
                totalAchievements: 0,
                unlockedAchievements: 0,
                totalPoints: 0,
                categoryProgress: {}
            };
        }
    }
}
const achievementService = AchievementService;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/UserDataContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserDataProvider",
    ()=>UserDataProvider,
    "useUserData",
    ()=>useUserData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$SupabaseAuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/SupabaseAuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/supabaseService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$achievementService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/achievementService.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const UserDataContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function useUserData() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(8);
    if ($[0] !== "2ca4b90b9ae3019cc0ea5cd031b48c76743df1c83fb84c7c37dc839c0daad6fa") {
        for(let $i = 0; $i < 8; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "2ca4b90b9ae3019cc0ea5cd031b48c76743df1c83fb84c7c37dc839c0daad6fa";
    }
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(UserDataContext);
    if (context === undefined) {
        let t0;
        let t1;
        let t2;
        let t3;
        let t4;
        if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
            t0 = [];
            t1 = [];
            t2 = new Date();
            t3 = new Date();
            t4 = [];
            $[1] = t0;
            $[2] = t1;
            $[3] = t2;
            $[4] = t3;
            $[5] = t4;
        } else {
            t0 = $[1];
            t1 = $[2];
            t2 = $[3];
            t3 = $[4];
            t4 = $[5];
        }
        let t5;
        if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
            t5 = {
                id: "fallback",
                username: "Guest",
                email: "guest@example.com",
                fullName: "Guest User",
                avatar: "",
                level: 1,
                points: 0,
                streak: 0,
                badges: t0,
                achievements: t1,
                joinedAt: t2,
                lastActive: t3,
                friends: t4,
                settings: {
                    theme: "system",
                    notifications: {
                        email: true,
                        push: true,
                        dailyDevotional: true,
                        friendRequests: true,
                        messages: true,
                        achievementAlerts: true,
                        communityPosts: false,
                        readingReminders: true,
                        weeklyProgress: true
                    },
                    privacy: {
                        profileVisibility: "public",
                        showOnlineStatus: true,
                        showReadingProgress: true,
                        allowFriendRequests: true,
                        showAchievements: true
                    },
                    reading: {
                        fontSize: "medium",
                        translation: "kjv",
                        dailyReminderTime: "08:00",
                        autoPlayAudio: false,
                        highlightVerses: true,
                        showNotes: true
                    },
                    community: {
                        showInFeed: true,
                        allowMentions: true,
                        emailNotifications: true,
                        pushNotifications: true,
                        filterContent: true,
                        hideBlockedUsers: true
                    }
                }
            };
            $[6] = t5;
        } else {
            t5 = $[6];
        }
        let t6;
        if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
            t6 = {
                user: t5,
                stats: {
                    level: 1,
                    points: 0,
                    streak: 0,
                    badges: [],
                    leaderboard: []
                },
                loading: false,
                error: null,
                updateUser: _temp,
                updateStats: _temp2,
                updateSettings: _temp3,
                addPoints: _temp4,
                incrementStreak: _temp5,
                refreshData: _temp6
            };
            $[7] = t6;
        } else {
            t6 = $[7];
        }
        return t6;
    }
    return context;
}
_s(useUserData, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
async function _temp6() {}
async function _temp5() {}
async function _temp4() {}
async function _temp3() {}
async function _temp2() {}
async function _temp() {}
function UserDataProvider({ children }) {
    _s1();
    const { user: authUser } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$SupabaseAuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [stats, setStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "UserDataProvider.useEffect": ()=>{
            const initializeUserData = {
                "UserDataProvider.useEffect.initializeUserData": async ()=>{
                    if (!authUser) {
                        setUser(null);
                        setStats(null);
                        setLoading(false);
                        return;
                    }
                    try {
                        setLoading(true);
                        setError(null);
                        // Get or create user profile from Supabase
                        let userProfile = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getUserProfile(authUser.id);
                        if (!userProfile) {
                            // Create profile if it doesn't exist
                            userProfile = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].createUserProfile(authUser);
                            if (!userProfile) {
                                throw new Error('Failed to create user profile');
                            }
                        }
                        // Get user stats from Supabase
                        const userStats = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getUserStats(authUser.id);
                        if (!userStats) {
                            throw new Error('Failed to load user stats');
                        }
                        // Get user achievements from Supabase
                        const userAchievements = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getUserAchievements(authUser.id);
                        // Convert Supabase data to our User type
                        const userData = {
                            id: userProfile.id,
                            username: userProfile.username || userProfile.email?.split('@')[0] || 'user',
                            email: userProfile.email,
                            fullName: userProfile.full_name || '',
                            avatar: userProfile.avatar_url || '',
                            joinedAt: new Date(userProfile.created_at),
                            points: userProfile.points,
                            level: userProfile.level,
                            streak: userProfile.streak,
                            longestStreak: userProfile.longest_streak || 0,
                            friends: [],
                            achievements: userAchievements.map({
                                "UserDataProvider.useEffect.initializeUserData": (ua)=>ua.achievement
                            }["UserDataProvider.useEffect.initializeUserData"]).filter(Boolean),
                            settings: {
                                theme: 'system',
                                notifications: {
                                    email: true,
                                    push: true,
                                    dailyDevotional: true,
                                    friendRequests: true,
                                    messages: true,
                                    achievementAlerts: true,
                                    communityPosts: false,
                                    readingReminders: true,
                                    weeklyProgress: true
                                },
                                privacy: {
                                    profileVisibility: 'public',
                                    showOnlineStatus: true,
                                    showReadingProgress: true,
                                    allowFriendRequests: true,
                                    showAchievements: true
                                },
                                reading: {
                                    fontSize: 'medium',
                                    translation: 'kjv',
                                    dailyReminderTime: '08:00',
                                    autoPlayAudio: false,
                                    highlightVerses: true,
                                    showNotes: true
                                },
                                community: {
                                    showInFeed: true,
                                    allowMentions: true,
                                    emailNotifications: true,
                                    pushNotifications: true,
                                    filterContent: true,
                                    hideBlockedUsers: true
                                }
                            }
                        };
                        // Convert stats to Gamification type
                        const gamificationData = {
                            level: userProfile.level,
                            points: userProfile.points,
                            streak: userProfile.streak,
                            badges: [],
                            leaderboard: [] // Will be populated from a separate query
                        };
                        setUser(userData);
                        setStats(gamificationData);
                        // Check for new achievements based on current activity
                        try {
                            const { newAchievements, pointsAwarded } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$achievementService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["achievementService"].checkAndAwardAchievements(authUser.id);
                            if (newAchievements.length > 0) {
                                console.log('New achievements unlocked:', newAchievements);
                                console.log('Points awarded:', pointsAwarded);
                                // Refresh user data to get updated achievements
                                const updatedUserAchievements = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getUserAchievements(authUser.id);
                                setUser({
                                    "UserDataProvider.useEffect.initializeUserData": (prev)=>prev ? {
                                            ...prev,
                                            achievements: updatedUserAchievements.map({
                                                "UserDataProvider.useEffect.initializeUserData": (ua_0)=>ua_0.achievement
                                            }["UserDataProvider.useEffect.initializeUserData"]).filter(Boolean)
                                        } : null
                                }["UserDataProvider.useEffect.initializeUserData"]);
                            }
                        } catch (achievementError) {
                            console.error('Error checking achievements:', achievementError);
                        // Don't fail the whole user data load if achievements fail
                        }
                        // Subscribe to real-time updates
                        const profileChannel = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].subscribeToUser(authUser.id, {
                            "UserDataProvider.useEffect.initializeUserData.profileChannel": (profile)=>{
                                setUser({
                                    "UserDataProvider.useEffect.initializeUserData.profileChannel": (prev_0)=>prev_0 ? {
                                            ...prev_0,
                                            ...profile
                                        } : null
                                }["UserDataProvider.useEffect.initializeUserData.profileChannel"]);
                            }
                        }["UserDataProvider.useEffect.initializeUserData.profileChannel"]);
                        const statsChannel = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].subscribeToUserStats(authUser.id, {
                            "UserDataProvider.useEffect.initializeUserData.statsChannel": (newStats)=>{
                                // Update user stats in background, but don't change the Gamification stats
                                // since they have a different structure
                                console.log('User stats updated:', newStats);
                            }
                        }["UserDataProvider.useEffect.initializeUserData.statsChannel"]);
                    } catch (err) {
                        console.error('Error initializing user data:', err);
                        setError(err instanceof Error ? err.message : 'Failed to load user data');
                    } finally{
                        setLoading(false);
                    }
                }
            }["UserDataProvider.useEffect.initializeUserData"];
            initializeUserData();
            return ({
                "UserDataProvider.useEffect": ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].unsubscribeAll();
                }
            })["UserDataProvider.useEffect"];
        }
    }["UserDataProvider.useEffect"], [
        authUser
    ]);
    const updateUser = async (userData_0)=>{
        if (!authUser || !user) return;
        try {
            const profileUpdates = {
                username: userData_0.username,
                full_name: userData_0.fullName,
                avatar_url: userData_0.avatar
            };
            const updatedProfile = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].updateUserProfile(authUser.id, profileUpdates);
            if (updatedProfile) {
                setUser((prev_1)=>prev_1 ? {
                        ...prev_1,
                        ...userData_0
                    } : null);
            }
        } catch (err_0) {
            console.error('Error updating user:', err_0);
            setError(err_0 instanceof Error ? err_0.message : 'Failed to update user');
        }
    };
    const updateStats = (statsData)=>{
        if (stats) {
            setStats({
                ...stats,
                ...statsData
            });
        }
    };
    const updateSettings = (settingsData)=>{
        if (user) {
            setUser({
                ...user,
                settings: {
                    ...user.settings,
                    ...settingsData
                }
            });
        }
    };
    const addPoints = async (points)=>{
        if (!authUser) return;
        try {
            const updatedProfile_0 = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].addPoints(authUser.id, points);
            if (updatedProfile_0) {
                setUser((prev_2)=>prev_2 ? {
                        ...prev_2,
                        points: updatedProfile_0.points,
                        level: updatedProfile_0.level
                    } : null);
                setStats((prev_3)=>prev_3 ? {
                        ...prev_3,
                        points: updatedProfile_0.points,
                        level: updatedProfile_0.level
                    } : null);
            }
        } catch (err_1) {
            console.error('Error adding points:', err_1);
            setError(err_1 instanceof Error ? err_1.message : 'Failed to add points');
        }
    };
    const incrementStreak = async ()=>{
        if (!authUser || !user) return;
        try {
            const newStreak = user.streak + 1;
            const updatedProfile_1 = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].updateStreak(authUser.id, newStreak);
            if (updatedProfile_1) {
                setUser((prev_4)=>prev_4 ? {
                        ...prev_4,
                        streak: newStreak
                    } : null);
                setStats((prev_5)=>prev_5 ? {
                        ...prev_5,
                        streak: newStreak
                    } : null);
            }
        } catch (err_2) {
            console.error('Error updating streak:', err_2);
            setError(err_2 instanceof Error ? err_2.message : 'Failed to update streak');
        }
    };
    const refreshData = async ()=>{
        if (authUser) {
            try {
                setLoading(true);
                const userProfile_0 = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$supabaseService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabaseService"].getUserProfile(authUser.id);
                if (userProfile_0) {
                    setUser((prev_6)=>prev_6 ? {
                            ...prev_6,
                            points: userProfile_0.points,
                            level: userProfile_0.level,
                            streak: userProfile_0.streak,
                            fullName: userProfile_0.full_name,
                            avatar: userProfile_0.avatar_url || ''
                        } : null);
                    setStats((prev_7)=>prev_7 ? {
                            ...prev_7,
                            points: userProfile_0.points,
                            level: userProfile_0.level,
                            streak: userProfile_0.streak
                        } : null);
                }
            } catch (err_3) {
                console.error('Error refreshing data:', err_3);
                setError(err_3 instanceof Error ? err_3.message : 'Failed to refresh data');
            } finally{
                setLoading(false);
            }
        }
    };
    const value = {
        user,
        stats,
        loading,
        error,
        updateUser,
        updateStats,
        updateSettings,
        addPoints,
        incrementStreak,
        refreshData
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UserDataContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/UserDataContext.tsx",
        lineNumber: 422,
        columnNumber: 10
    }, this);
}
_s1(UserDataProvider, "Lp+sJGvJzokPxHvMO5+f2bJRwws=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$SupabaseAuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = UserDataProvider;
var _c;
__turbopack_context__.k.register(_c, "UserDataProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "formatDate",
    ()=>formatDate,
    "formatPoints",
    ()=>formatPoints,
    "formatTimeAgo",
    ()=>formatTimeAgo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function formatPoints(points) {
    if (points >= 1000000) {
        return `${(points / 1000000).toFixed(1)}M`;
    } else if (points >= 1000) {
        return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toString();
}
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        return formatDate(date);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/layout/ResponsiveLayout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MobileContainer",
    ()=>MobileContainer,
    "ResponsiveGrid",
    ()=>ResponsiveGrid,
    "ResponsiveLayout",
    ()=>ResponsiveLayout,
    "ResponsiveText",
    ()=>ResponsiveText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
;
function ResponsiveLayout(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(12);
    if ($[0] !== "baa3cb7c9e398f687a0ea8ffc8d6a6f6ff0da6e105defc080f1e6a7d30b9135a") {
        for(let $i = 0; $i < 12; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "baa3cb7c9e398f687a0ea8ffc8d6a6f6ff0da6e105defc080f1e6a7d30b9135a";
    }
    const { children, className, maxWidth: t1, padding: t2 } = t0;
    const maxWidth = t1 === undefined ? "2xl" : t1;
    const padding = t2 === undefined ? "md" : t2;
    let t3;
    if ($[1] !== maxWidth) {
        t3 = ({
            "ResponsiveLayout[getMaxWidthClass]": ()=>{
                switch(maxWidth){
                    case "sm":
                        {
                            return "max-w-sm";
                        }
                    case "md":
                        {
                            return "max-w-md";
                        }
                    case "lg":
                        {
                            return "max-w-lg";
                        }
                    case "xl":
                        {
                            return "max-w-xl";
                        }
                    case "2xl":
                        {
                            return "max-w-2xl";
                        }
                    case "full":
                        {
                            return "max-w-full";
                        }
                    default:
                        {
                            return "max-w-2xl";
                        }
                }
            }
        })["ResponsiveLayout[getMaxWidthClass]"];
        $[1] = maxWidth;
        $[2] = t3;
    } else {
        t3 = $[2];
    }
    const getMaxWidthClass = t3;
    let t4;
    if ($[3] !== padding) {
        t4 = ({
            "ResponsiveLayout[getPaddingClass]": ()=>{
                switch(padding){
                    case "none":
                        {
                            return "px-0";
                        }
                    case "sm":
                        {
                            return "px-4 sm:px-6";
                        }
                    case "md":
                        {
                            return "px-4 sm:px-6 lg:px-8";
                        }
                    case "lg":
                        {
                            return "px-6 sm:px-8 lg:px-12";
                        }
                    default:
                        {
                            return "px-4 sm:px-6 lg:px-8";
                        }
                }
            }
        })["ResponsiveLayout[getPaddingClass]"];
        $[3] = padding;
        $[4] = t4;
    } else {
        t4 = $[4];
    }
    const getPaddingClass = t4;
    let t5;
    if ($[5] !== className || $[6] !== getMaxWidthClass || $[7] !== getPaddingClass) {
        t5 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full mx-auto", getMaxWidthClass(), getPaddingClass(), className);
        $[5] = className;
        $[6] = getMaxWidthClass;
        $[7] = getPaddingClass;
        $[8] = t5;
    } else {
        t5 = $[8];
    }
    let t6;
    if ($[9] !== children || $[10] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t5,
            children: children
        }, void 0, false, {
            fileName: "[project]/src/components/layout/ResponsiveLayout.tsx",
            lineNumber: 116,
            columnNumber: 10
        }, this);
        $[9] = children;
        $[10] = t5;
        $[11] = t6;
    } else {
        t6 = $[11];
    }
    return t6;
}
_c = ResponsiveLayout;
function ResponsiveGrid(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(16);
    if ($[0] !== "baa3cb7c9e398f687a0ea8ffc8d6a6f6ff0da6e105defc080f1e6a7d30b9135a") {
        for(let $i = 0; $i < 16; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "baa3cb7c9e398f687a0ea8ffc8d6a6f6ff0da6e105defc080f1e6a7d30b9135a";
    }
    const { children, className, cols: t1, gap: t2 } = t0;
    let t3;
    if ($[1] !== t1) {
        t3 = t1 === undefined ? {
            mobile: 1,
            tablet: 2,
            desktop: 3
        } : t1;
        $[1] = t1;
        $[2] = t3;
    } else {
        t3 = $[2];
    }
    const cols = t3;
    const gap = t2 === undefined ? "md" : t2;
    let t4;
    if ($[3] !== cols.desktop || $[4] !== cols.mobile || $[5] !== cols.tablet) {
        t4 = ({
            "ResponsiveGrid[getColsClass]": ()=>{
                const mobileClass = cols.mobile ? `grid-cols-${cols.mobile}` : "grid-cols-1";
                const tabletClass = cols.tablet ? `sm:grid-cols-${cols.tablet}` : "sm:grid-cols-2";
                const desktopClass = cols.desktop ? `lg:grid-cols-${cols.desktop}` : "lg:grid-cols-3";
                return `${mobileClass} ${tabletClass} ${desktopClass}`;
            }
        })["ResponsiveGrid[getColsClass]"];
        $[3] = cols.desktop;
        $[4] = cols.mobile;
        $[5] = cols.tablet;
        $[6] = t4;
    } else {
        t4 = $[6];
    }
    const getColsClass = t4;
    let t5;
    if ($[7] !== gap) {
        t5 = ({
            "ResponsiveGrid[getGapClass]": ()=>{
                switch(gap){
                    case "sm":
                        {
                            return "gap-2 sm:gap-3";
                        }
                    case "md":
                        {
                            return "gap-4 sm:gap-6";
                        }
                    case "lg":
                        {
                            return "gap-6 sm:gap-8";
                        }
                    default:
                        {
                            return "gap-4 sm:gap-6";
                        }
                }
            }
        })["ResponsiveGrid[getGapClass]"];
        $[7] = gap;
        $[8] = t5;
    } else {
        t5 = $[8];
    }
    const getGapClass = t5;
    let t6;
    if ($[9] !== className || $[10] !== getColsClass || $[11] !== getGapClass) {
        t6 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("grid", getColsClass(), getGapClass(), className);
        $[9] = className;
        $[10] = getColsClass;
        $[11] = getGapClass;
        $[12] = t6;
    } else {
        t6 = $[12];
    }
    let t7;
    if ($[13] !== children || $[14] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t6,
            children: children
        }, void 0, false, {
            fileName: "[project]/src/components/layout/ResponsiveLayout.tsx",
            lineNumber: 225,
            columnNumber: 10
        }, this);
        $[13] = children;
        $[14] = t6;
        $[15] = t7;
    } else {
        t7 = $[15];
    }
    return t7;
}
_c1 = ResponsiveGrid;
function MobileContainer(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(6);
    if ($[0] !== "baa3cb7c9e398f687a0ea8ffc8d6a6f6ff0da6e105defc080f1e6a7d30b9135a") {
        for(let $i = 0; $i < 6; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "baa3cb7c9e398f687a0ea8ffc8d6a6f6ff0da6e105defc080f1e6a7d30b9135a";
    }
    const { children, className } = t0;
    let t1;
    if ($[1] !== className) {
        t1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("min-h-screen bg-background", "pb-safe-or-4", "touch-manipulation", className);
        $[1] = className;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    let t2;
    if ($[3] !== children || $[4] !== t1) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t1,
            children: children
        }, void 0, false, {
            fileName: "[project]/src/components/layout/ResponsiveLayout.tsx",
            lineNumber: 258,
            columnNumber: 10
        }, this);
        $[3] = children;
        $[4] = t1;
        $[5] = t2;
    } else {
        t2 = $[5];
    }
    return t2;
}
_c2 = MobileContainer;
function ResponsiveText(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(15);
    if ($[0] !== "baa3cb7c9e398f687a0ea8ffc8d6a6f6ff0da6e105defc080f1e6a7d30b9135a") {
        for(let $i = 0; $i < 15; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "baa3cb7c9e398f687a0ea8ffc8d6a6f6ff0da6e105defc080f1e6a7d30b9135a";
    }
    const { children, className, size: t1, weight: t2, color: t3 } = t0;
    const size = t1 === undefined ? "md" : t1;
    const weight = t2 === undefined ? "normal" : t2;
    const color = t3 === undefined ? "primary" : t3;
    let t4;
    if ($[1] !== size) {
        t4 = ({
            "ResponsiveText[getSizeClass]": ()=>{
                switch(size){
                    case "xs":
                        {
                            return "text-xs sm:text-sm";
                        }
                    case "sm":
                        {
                            return "text-sm sm:text-base";
                        }
                    case "md":
                        {
                            return "text-base sm:text-lg";
                        }
                    case "lg":
                        {
                            return "text-lg sm:text-xl";
                        }
                    case "xl":
                        {
                            return "text-xl sm:text-2xl";
                        }
                    case "2xl":
                        {
                            return "text-2xl sm:text-3xl";
                        }
                    case "3xl":
                        {
                            return "text-3xl sm:text-4xl";
                        }
                    default:
                        {
                            return "text-base sm:text-lg";
                        }
                }
            }
        })["ResponsiveText[getSizeClass]"];
        $[1] = size;
        $[2] = t4;
    } else {
        t4 = $[2];
    }
    const getSizeClass = t4;
    let t5;
    if ($[3] !== weight) {
        t5 = ({
            "ResponsiveText[getWeightClass]": ()=>{
                switch(weight){
                    case "normal":
                        {
                            return "font-normal";
                        }
                    case "medium":
                        {
                            return "font-medium";
                        }
                    case "semibold":
                        {
                            return "font-semibold";
                        }
                    case "bold":
                        {
                            return "font-bold";
                        }
                    default:
                        {
                            return "font-normal";
                        }
                }
            }
        })["ResponsiveText[getWeightClass]"];
        $[3] = weight;
        $[4] = t5;
    } else {
        t5 = $[4];
    }
    const getWeightClass = t5;
    let t6;
    if ($[5] !== color) {
        t6 = ({
            "ResponsiveText[getColorClass]": ()=>{
                switch(color){
                    case "primary":
                        {
                            return "text-foreground";
                        }
                    case "secondary":
                        {
                            return "text-muted-foreground";
                        }
                    case "muted":
                        {
                            return "text-gray-500";
                        }
                    case "accent":
                        {
                            return "text-primary";
                        }
                    default:
                        {
                            return "text-foreground";
                        }
                }
            }
        })["ResponsiveText[getColorClass]"];
        $[5] = color;
        $[6] = t6;
    } else {
        t6 = $[6];
    }
    const getColorClass = t6;
    let t7;
    if ($[7] !== className || $[8] !== getColorClass || $[9] !== getSizeClass || $[10] !== getWeightClass) {
        t7 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("leading-relaxed", getSizeClass(), getWeightClass(), getColorClass(), className);
        $[7] = className;
        $[8] = getColorClass;
        $[9] = getSizeClass;
        $[10] = getWeightClass;
        $[11] = t7;
    } else {
        t7 = $[11];
    }
    let t8;
    if ($[12] !== children || $[13] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: t7,
            children: children
        }, void 0, false, {
            fileName: "[project]/src/components/layout/ResponsiveLayout.tsx",
            lineNumber: 421,
            columnNumber: 10
        }, this);
        $[12] = children;
        $[13] = t7;
        $[14] = t8;
    } else {
        t8 = $[14];
    }
    return t8;
}
_c3 = ResponsiveText;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "ResponsiveLayout");
__turbopack_context__.k.register(_c1, "ResponsiveGrid");
__turbopack_context__.k.register(_c2, "MobileContainer");
__turbopack_context__.k.register(_c3, "ResponsiveText");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_a1d385e6._.js.map