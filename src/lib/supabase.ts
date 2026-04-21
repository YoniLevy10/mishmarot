import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseEnv = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  ok: Boolean(supabaseUrl && supabaseAnonKey),
  missing: [
    ...(supabaseUrl ? [] : (['VITE_SUPABASE_URL'] as const)),
    ...(supabaseAnonKey ? [] : (['VITE_SUPABASE_ANON_KEY'] as const)),
  ],
} as const

if (!supabaseEnv.ok) {
  // eslint-disable-next-line no-console
  console.warn(`Missing env vars: ${supabaseEnv.missing.join(', ')}`)
}

// Avoid throwing at import-time (would cause blank screen).
export const supabase = createClient(supabaseUrl ?? 'http://localhost', supabaseAnonKey ?? 'missing-anon-key')

