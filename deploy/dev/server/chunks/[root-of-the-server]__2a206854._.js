module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createServerClient",
    ()=>createServerClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [app-route] (ecmascript)");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://kzpirvgwtenbmapcblla.supabase.co") || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';
function createServerClient() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
}),
"[project]/src/lib/supabase.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase,
    "supabaseAdmin",
    ()=>supabaseAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [app-route] (ecmascript)");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://kzpirvgwtenbmapcblla.supabase.co") || 'https://your-project.supabase.co';
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cGlydmd3dGVuYm1hcGNibGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMjk4MTIsImV4cCI6MjA4MDYwNTgxMn0.Zjh1esoRzR4Q4bKDFNs-MUAfURSSAragmMa3bCi2oKE") || 'your-anon-key';
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])(supabaseUrl, supabaseAnonKey, {
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
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = serviceRoleKey ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])(supabaseUrl, serviceRoleKey, {
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
}),
"[project]/src/services/readingPlanService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Reading Plan Service for Supabase integration
__turbopack_context__.s([
    "readingPlanService",
    ()=>readingPlanService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-route] (ecmascript)");
;
class ReadingPlanService {
    // Get all public reading plans
    async getPublicReadingPlans() {
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('reading_plans').select('*').eq('is_public', true).order('created_at', {
                ascending: false
            });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching reading plans:', error);
            return [];
        }
    }
    // Get reading plan by ID
    async getReadingPlanById(id) {
        if (!id) {
            console.error('Error: No ID provided to getReadingPlanById');
            return null;
        }
        try {
            console.log(`Fetching reading plan with ID: ${id}`);
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('reading_plans').select('*').eq('id', id).single();
            if (error) {
                console.error('Supabase error details:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                    request: error.request
                });
                throw error;
            }
            if (!data) {
                console.error(`No reading plan found with ID: ${id}`);
                return null;
            }
            return data;
        } catch (error) {
            console.error('Error in getReadingPlanById:', {
                error,
                errorString: String(error),
                errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error)),
                planId: id
            });
            return null;
        }
    }
    // Start a reading plan for a user
    async startReadingPlan(userId, planId) {
        try {
            // Create user reading plan entry
            const { data: userPlan, error: userPlanError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('user_reading_plans').insert([
                {
                    user_id: userId,
                    plan_id: planId,
                    started_at: new Date().toISOString(),
                    current_day: 1,
                    is_active: true
                }
            ]).select().single();
            if (userPlanError) throw userPlanError;
            // Award initial points for starting a plan
            await this.awardPoints(userId, 10, 'Started a reading plan');
            return userPlan;
        } catch (error) {
            console.error('Error starting reading plan:', error);
            throw error;
        }
    }
    // Get user's reading plans
    async getUserReadingPlans(userId) {
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('user_reading_plans').select(`
          *,
          reading_plans (*)
        `).eq('user_id', userId).order('started_at', {
                ascending: false
            });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching user reading plans:', error);
            return [];
        }
    }
    // Get user's progress for a specific plan
    async getPlanProgress(userId, planId) {
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('reading_plan_progress').select('*').eq('user_id', userId).eq('plan_id', planId).order('day_number', {
                ascending: true
            });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching plan progress:', error);
            return [];
        }
    }
    // Mark a day as completed
    async completeDay(userId, planId, day, notes) {
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('reading_plan_progress').upsert([
                {
                    user_id: userId,
                    plan_id: planId,
                    day: day,
                    completed: true,
                    completed_at: new Date().toISOString(),
                    notes: notes || null,
                    points_earned: 5 // Award 5 points per completed day
                }
            ]).select().single();
            if (error) throw error;
            // Award points for completing a day
            await this.awardPoints(userId, 5, 'Completed a reading plan day');
            // Update user reading plan current day
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('user_reading_plans').update({
                current_day: day + 1,
                updated_at: new Date().toISOString()
            }).eq('user_id', userId).eq('plan_id', planId);
            return data;
        } catch (error) {
            console.error('Error completing day:', error);
            throw error;
        }
    }
    // Complete entire reading plan
    async completeReadingPlan(userId, planId) {
        try {
            // Get plan details to calculate completion bonus
            const plan = await this.getReadingPlanById(planId);
            if (!plan) throw new Error('Plan not found');
            const completionBonus = plan.duration * 2; // 2 points per day as bonus
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('user_reading_plans').update({
                is_active: false,
                completed_at: new Date().toISOString()
            }).eq('user_id', userId).eq('plan_id', planId).select().single();
            if (error) throw error;
            // Award completion bonus points
            await this.awardPoints(userId, completionBonus, 'Completed a reading plan');
            return data;
        } catch (error) {
            console.error('Error completing reading plan:', error);
            throw error;
        }
    }
    // Award points to user
    async awardPoints(userId, points, reason) {
        try {
            // Update user points
            const { error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].rpc('increment_user_points', {
                p_user_id: userId,
                p_points: points
            });
            if (updateError) throw updateError;
            // Create activity record
            const { error: activityError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('activities').insert([
                {
                    user_id: userId,
                    type: 'reading_plan',
                    description: reason,
                    points: points,
                    created_at: new Date().toISOString()
                }
            ]);
            if (activityError) throw activityError;
        } catch (error) {
            console.error('Error awarding points:', error);
        }
    }
    // Get reading plan statistics
    async getPlanStats(planId) {
        try {
            const { data: userPlans, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('user_reading_plans').select('is_completed').eq('plan_id', planId);
            if (error) throw error;
            const totalParticipants = userPlans?.length || 0;
            const totalCompletions = userPlans?.filter((plan)=>plan.is_completed).length || 0;
            const averageCompletion = totalParticipants > 0 ? totalCompletions / totalParticipants * 100 : 0;
            return {
                totalParticipants,
                averageCompletion,
                totalCompletions
            };
        } catch (error) {
            console.error('Error fetching plan stats:', error);
            return {
                totalParticipants: 0,
                averageCompletion: 0,
                totalCompletions: 0
            };
        }
    }
    // Create a new reading plan (for admin users)
    async createReadingPlan(plan) {
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('reading_plans').insert([
                plan
            ]).select().single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating reading plan:', error);
            throw error;
        }
    }
}
const readingPlanService = new ReadingPlanService();
}),
"[project]/src/app/api/reading-plans/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$readingPlanService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/readingPlanService.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const body = await request.json();
        const { title, description, duration, difficulty, readings, is_public } = body;
        // Validate required fields
        if (!title || !description || !duration || !difficulty) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing required fields: title, description, duration, difficulty'
            }, {
                status: 400
            });
        }
        // Create reading plan using the service
        const readingPlan = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$readingPlanService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readingPlanService"].createReadingPlan({
            title,
            description,
            duration,
            difficulty,
            user_id: user.id,
            is_public: is_public || false
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: readingPlan
        });
    } catch (error) {
        console.error('Error creating reading plan:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create reading plan',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2a206854._.js.map