// utils/dbConnect.js
const { createClient } = require('@supabase/supabase-js');

let supabase;

const dbConnect = () => {
  if (supabase) return supabase;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables.');
    process.exit(1);
  }

  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('Supabase connected');
  return supabase;
};

// Helper to get the supabase instance anywhere
const getSupabase = () => {
  if (!supabase) {
    return dbConnect();
  }
  return supabase;
};

module.exports = dbConnect;
module.exports.getSupabase = getSupabase;
