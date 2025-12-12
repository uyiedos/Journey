// Debug script to test Supabase reading plans connection
const { createClient } = require('@supabase/supabase-js');

// Load environment variables (you'll need to run this with the actual env vars)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '***' : 'missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testReadingPlans() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('reading_plans')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Error connecting to reading_plans table:', error);
      return;
    }
    
    console.log('Successfully connected to reading_plans table');
    
    // Get all public reading plans
    const { data: plans, error: plansError } = await supabase
      .from('reading_plans')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (plansError) {
      console.error('Error fetching reading plans:', plansError);
      return;
    }
    
    console.log(`Found ${plans.length} public reading plans:`);
    plans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.title} (ID: ${plan.id})`);
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testReadingPlans();
