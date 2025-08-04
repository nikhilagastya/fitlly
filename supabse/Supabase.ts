import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ffjvxoihyqrdddxchldp.supabase.co'
const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmanZ4b2loeXFyZGRkeGNobGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODkyMDcsImV4cCI6MjA2OTg2NTIwN30.iUCZktpohCV5NKM5wBj3uUgDs8yE7xFcMfQYzYbHV18`
export const supabase = createClient(supabaseUrl, supabaseKey,{auth: {
   
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
   
  },})
