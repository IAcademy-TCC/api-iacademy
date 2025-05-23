const {createClient} = require('@supabase/supabase-js')

// Create a single supabase client for interacting with your database
const supabase = createClient('https://nkujdbutivgodaaomtit.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdWpkYnV0aXZnb2RhYW9tdGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NjY4NDEsImV4cCI6MjA2MzU0Mjg0MX0.ukwY1yCL-Qh4W7hycqEHOF-2OKI817edeXr9FX-kork')


module.exports = supabase;