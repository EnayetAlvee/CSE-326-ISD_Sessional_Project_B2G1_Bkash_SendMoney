//server/config/supabase.js
import { createClient } from '@supabase/supabase-js';
import config from './index.js';

const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);


/*
This creates the Supabase Client. 
This isn't a database connection (like SQL); 
it's an API wrapper that knows where my Supabase project 
is and how to talk to it using the AnonKey.
*/

// Admin client — uses service role key, bypasses Row Level Security
// Only use this server-side, NEVER expose this key to frontend
const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceKey);

export { supabase, supabaseAdmin };