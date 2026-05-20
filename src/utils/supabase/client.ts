import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      // 👇 UPDATE THIS FIXED GLOBAL FETCH LOGIC 👇
      global: {
        fetch: (url, options) => {
          const headers = new Headers(options?.headers);
          headers.set("Connection", "close");

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}
