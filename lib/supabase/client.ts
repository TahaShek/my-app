import { createBrowserClient } from '@supabase/ssr'

// Create a singleton instance for convenience
let client: ReturnType<typeof createBrowserClient> | null = null

/**
 * Get or create the Supabase browser client
 * This function ensures we only create one instance
 */
export function createClient() {
  if (client) return client

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    }
  )

  return client
}

// Export a singleton instance for convenience (compatible with old supabase1.ts usage)
export const supabase = createClient()
