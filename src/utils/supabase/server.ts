import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        async setAll(cookiesToSet, headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server actions may run in contexts where cookies cannot be written.
            // The middleware refreshes the session before the request reaches here.
          }

          if (headers) {
            // Next.js server actions do not expose a direct response headers API here.
            // We still write cookies via the cookie store, but response-level headers
            // are not available from this helper.
          }
        },
      },
    }
  );
}
