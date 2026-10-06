import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Фейковый email для логина без почты
export const usernameToEmail = (username) =>
  `${username.toLowerCase()}@zavoz.local`