import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection test passed!');
    return true;
  } catch (err) {
    console.error('Unexpected error testing Supabase:', err);
    return false;
  }
}
