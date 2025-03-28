import { createClient } from "@supabase/supabase-js"

// Check if the environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Add validation to prevent runtime errors
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anonymous Key is missing. Make sure you have set the NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
  )
}

// Create the Supabase client with error handling
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Simple test function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from("documents").select("count", { count: "exact" }).limit(1)
    return { success: !error, data, error }
  } catch (err) {
    return { success: false, error: err }
  }
}

