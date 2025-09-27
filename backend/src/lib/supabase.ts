import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !serviceKey) {
  console.warn('[supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY')
}

export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})


