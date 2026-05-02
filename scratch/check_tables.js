
import { supabase } from './src/lib/supabase.js';

async function checkTables() {
  const { data, error } = await supabase.from('transactions').select('*').limit(1);
  if (error) {
    console.log('Transactions table error:', error.message);
  } else {
    console.log('Transactions table exists.');
  }

  const { data: vData, error: vError } = await supabase.from('visitor_stats').select('*').limit(1);
  if (vError) {
    console.log('Visitor stats table error:', vError.message);
  } else {
    console.log('Visitor stats table exists.');
  }
}

checkTables();
