// import { createClient } from '@supabase/supabase-js'
// const supabaseUrl = 'https://ffjvxoihyqrdddxchldp.supabase.co'
// const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmanZ4b2loeXFyZGRkeGNobGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODkyMDcsImV4cCI6MjA2OTg2NTIwN30.iUCZktpohCV5NKM5wBj3uUgDs8yE7xFcMfQYzYbHV18`
// export const supabase = createClient(supabaseUrl, supabaseKey,{auth: {
   
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: false,
   
//   },})


import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://fpypcrksmwlkgpoaonbx.supabase.co'
const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXBjcmtzbXdsa2dwb2FvbmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MjQ4NTYsImV4cCI6MjA3NDEwMDg1Nn0.2174mEDrT9EuFWBP0oU-ITi5-NZyrjkZN_zMPaanHo0`
export const supabase = createClient(supabaseUrl, supabaseKey,{auth: {
   
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
   
  },})
