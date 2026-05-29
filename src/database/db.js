const {createClient} = require('@supabase/supabase-js')
const dotenv = require('dotenv').config();

// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)


module.exports = supabase;