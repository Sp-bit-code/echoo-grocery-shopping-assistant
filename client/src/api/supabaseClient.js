import {
  createClient,
} from "@supabase/supabase-js";

/*
  supabaseClient.js

  Grocery Voice Shopping Assistant

  Main Supabase JS client.

  Most frontend data APIs currently use direct
  Supabase REST requests.

  This client remains available for cases where
  supabase-js is useful, especially session refresh
  and future backend/RPC functionality.
*/

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing VITE_SUPABASE_URL in client/.env"
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_ANON_KEY in client/.env"
  );
}

/* =========================================================
   STORAGE
========================================================= */

/*
  authApi.js stores the authenticated Supabase
  session using this same key.

  Keeping both APIs on the same key prevents:

  authApi.js
      -> one session

  supabase-js
      -> another unrelated session
*/

const SESSION_STORAGE_KEY =
  "echoo_session";

/* =========================================================
   SINGLE CLIENT INSTANCE
========================================================= */

const globalForSupabase =
  globalThis;

export const supabase =
  globalForSupabase
    .__echooGrocerySupabaseClient ||
  createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        /*
          authApi.js is responsible for storing
          and refreshing the session.

          persistSession remains enabled so that
          supabase.auth.getSession() can also read
          the same session if another API needs it.
        */
        persistSession: true,

        /*
          We explicitly refresh sessions from
          authApi/orderApi when needed.

          Disabling background auto-refresh avoids
          Supabase JS refreshing echoo_session while
          echoo_access_token still contains the old
          access token.
        */
        autoRefreshToken: false,

        /*
          Google OAuth redirect parsing is handled
          by authApi.handleOAuthRedirect().

          Do not let supabase-js independently process
          the same URL.
        */
        detectSessionInUrl: false,

        storageKey:
          SESSION_STORAGE_KEY,

        /*
          Our Google login currently returns tokens
          through the URL hash, so this matches the
          existing authApi OAuth flow.
        */
        flowType: "implicit",
      },

      db: {
        schema: "public",
      },

      global: {
        headers: {
          "X-Client-Info":
            "echoo-grocery-client",
        },
      },
    }
  );

/* =========================================================
   DEV HOT RELOAD

   Prevent multiple Supabase clients from being created
   during Vite HMR.
========================================================= */

if (import.meta.env.DEV) {
  globalForSupabase.__echooGrocerySupabaseClient =
    supabase;
}

export default supabase;