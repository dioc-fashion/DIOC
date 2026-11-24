import { createClient } from '@supabase/supabase-js';

let browserClient: ReturnType<typeof createClient> | undefined;

export function createBrowserSupabaseClient() {
  if (browserClient) return browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Supabase browser configuration is incomplete.');
  browserClient = createClient(url, key);
  return browserClient;
}
