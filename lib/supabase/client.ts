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

export async function saveLocation(createdBy: string, lat: number, lng: number, name?: string, city?: string, address?: string, description?: string) {
  const { data, error } = await supabase
    .from("exchange_locations")
    .insert([{
      created_by: createdBy,
      latitude: lat,
      longitude: lng,
      name: name || null,
      city: city || null,
      address: address || null,
      description: description || null
    }]);

  if (error) console.log("Error saving location:", error);
  else console.log("Location saved:", data);
}