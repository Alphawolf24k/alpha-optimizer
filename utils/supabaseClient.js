import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uathvfnttjmiyrbuwban.supabase.co'
const supabaseKey = 'sb_publishable_6kFacDwA__Nh51Umuow31w_yrWQJiyA'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export async function ensureAnonymousAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.error('Anonymous auth failed:', error)
      return null
    }
    return data.session
  }
  
  return session
}