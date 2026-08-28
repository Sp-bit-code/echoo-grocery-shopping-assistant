// /*
//   authApi.js

//   Grocery Voice Shopping Assistant

//   Authentication:
//   - Email/password registration
//   - Email/password login
//   - Google OAuth
//   - Password recovery
//   - Session persistence
//   - Profile retrieval/update
//   - User/Admin login-mode support

//   IMPORTANT DATABASE RULE:

//   Registration NEVER sends a role.

//   The Supabase database trigger is responsible for
//   creating the profile with:

//       role = "user"

//   Roles in this project are always lowercase:

//       "user"
//       "admin"
// */

// const SUPABASE_URL =
//   import.meta.env.VITE_SUPABASE_URL;

// const SUPABASE_KEY =
//   import.meta.env.VITE_SUPABASE_ANON_KEY;

// if (!SUPABASE_URL) {
//   throw new Error(
//     "Missing VITE_SUPABASE_URL"
//   );
// }

// if (!SUPABASE_KEY) {
//   throw new Error(
//     "Missing VITE_SUPABASE_ANON_KEY"
//   );
// }

// /* =========================================================
//    STORAGE KEYS
// ========================================================= */

// const SESSION_KEY =
//   "echoo_session";

// const ACCESS_TOKEN_KEY =
//   "echoo_access_token";

// const REFRESH_TOKEN_KEY =
//   "echoo_refresh_token";

// const LOGIN_MODE_KEY =
//   "echoo_login_mode";

// /* =========================================================
//    ROLE
// ========================================================= */

// export const normalizeRole = (
//   role
// ) =>
//   String(role || "user")
//     .trim()
//     .toLowerCase() ===
//   "admin"
//     ? "admin"
//     : "user";

// /* =========================================================
//    ERROR PARSER
// ========================================================= */

// const createApiError = (
//   response,
//   text,
//   fallback
// ) => {
//   let parsed = null;

//   try {
//     parsed = text
//       ? JSON.parse(text)
//       : null;
//   } catch {
//     parsed = null;
//   }

//   const error =
//     new Error(
//       parsed?.msg ||
//         parsed?.message ||
//         parsed?.error_description ||
//         parsed?.error ||
//         text ||
//         fallback
//     );

//   error.status =
//     response?.status;

//   error.code =
//     parsed?.code;

//   error.details =
//     parsed?.details;

//   error.hint =
//     parsed?.hint;

//   error.raw =
//     parsed || text;

//   return error;
// };

// /* =========================================================
//    SESSION STORAGE
// ========================================================= */

// const getSavedSession = () => {
//   try {
//     const raw =
//       localStorage.getItem(
//         SESSION_KEY
//       );

//     return raw
//       ? JSON.parse(raw)
//       : null;
//   } catch {
//     return null;
//   }
// };

// const saveSession = (
//   session
// ) => {
//   if (!session) {
//     return;
//   }

//   const normalized = {
//     ...session,

//     /*
//       Store an absolute expiry timestamp when possible.
//     */
//     expires_at:
//       session.expires_at ||
//       (session.expires_in
//         ? Math.floor(
//             Date.now() /
//               1000
//           ) +
//           Number(
//             session.expires_in
//           )
//         : undefined),
//   };

//   localStorage.setItem(
//     SESSION_KEY,
//     JSON.stringify(
//       normalized
//     )
//   );

//   if (
//     normalized.access_token
//   ) {
//     localStorage.setItem(
//       ACCESS_TOKEN_KEY,
//       normalized.access_token
//     );
//   }

//   if (
//     normalized.refresh_token
//   ) {
//     localStorage.setItem(
//       REFRESH_TOKEN_KEY,
//       normalized.refresh_token
//     );
//   }
// };

// const updateSavedSessionUser = (
//   user
// ) => {
//   const session =
//     getSavedSession();

//   if (!session) {
//     return;
//   }

//   saveSession({
//     ...session,
//     user,
//   });
// };

// const removeSession = () => {
//   localStorage.removeItem(
//     SESSION_KEY
//   );

//   localStorage.removeItem(
//     ACCESS_TOKEN_KEY
//   );

//   localStorage.removeItem(
//     REFRESH_TOKEN_KEY
//   );
// };

// const emitAuthEvent = (
//   eventName
// ) => {
//   window.dispatchEvent(
//     new CustomEvent(
//       eventName
//     )
//   );
// };

// const clearSessionOnly = () => {
//   removeSession();

//   emitAuthEvent(
//     "auth:logout"
//   );
// };

// /* =========================================================
//    JWT
// ========================================================= */

// const decodeJwtPayload = (
//   token
// ) => {
//   if (
//     !token ||
//     !token.includes(".")
//   ) {
//     return null;
//   }

//   try {
//     let base64 =
//       token
//         .split(".")[1]
//         .replace(
//           /-/g,
//           "+"
//         )
//         .replace(
//           /_/g,
//           "/"
//         );

//     while (
//       base64.length % 4
//     ) {
//       base64 += "=";
//     }

//     return JSON.parse(
//       atob(base64)
//     );
//   } catch {
//     return null;
//   }
// };

// const tokenIsUsable = (
//   token
// ) => {
//   const payload =
//     decodeJwtPayload(
//       token
//     );

//   if (!payload?.exp) {
//     return Boolean(token);
//   }

//   /*
//     15-second buffer avoids using a token
//     right before it expires.
//   */
//   return (
//     payload.exp * 1000 >
//     Date.now() + 15000
//   );
// };

// /* =========================================================
//    AUTH REST
// ========================================================= */

// const authFetch = async (
//   path,
//   options = {}
// ) => {
//   const token =
//     options.token ||
//     localStorage.getItem(
//       ACCESS_TOKEN_KEY
//     ) ||
//     SUPABASE_KEY;

//   const response =
//     await fetch(
//       `${SUPABASE_URL}/auth/v1/${path}`,
//       {
//         method:
//           options.method ||
//           "GET",

//         headers: {
//           apikey:
//             SUPABASE_KEY,

//           Authorization:
//             `Bearer ${token}`,

//           "Content-Type":
//             "application/json",

//           ...(options.headers ||
//             {}),
//         },

//         body:
//           options.body !==
//           undefined
//             ? JSON.stringify(
//                 options.body
//               )
//             : undefined,
//       }
//     );

//   const text =
//     await response.text();

//   if (!response.ok) {
//     throw createApiError(
//       response,
//       text,
//       "Authentication request failed"
//     );
//   }

//   if (!text) {
//     return null;
//   }

//   try {
//     return JSON.parse(text);
//   } catch {
//     return text;
//   }
// };

// /* =========================================================
//    DATABASE REST
// ========================================================= */

// const dbFetch = async (
//   path,
//   options = {}
// ) => {
//   const token =
//     options.token ||
//     localStorage.getItem(
//       ACCESS_TOKEN_KEY
//     );

//   if (!token) {
//     throw new Error(
//       "Please login first"
//     );
//   }

//   const response =
//     await fetch(
//       `${SUPABASE_URL}/rest/v1/${path}`,
//       {
//         method:
//           options.method ||
//           "GET",

//         headers: {
//           apikey:
//             SUPABASE_KEY,

//           Authorization:
//             `Bearer ${token}`,

//           "Content-Type":
//             "application/json",

//           Prefer:
//             options.prefer ||
//             "return=representation",

//           ...(options.headers ||
//             {}),
//         },

//         body:
//           options.body !==
//           undefined
//             ? JSON.stringify(
//                 options.body
//               )
//             : undefined,
//       }
//     );

//   const text =
//     await response.text();

//   if (!response.ok) {
//     throw createApiError(
//       response,
//       text,
//       "Database request failed"
//     );
//   }

//   if (!text) {
//     return null;
//   }

//   try {
//     return JSON.parse(text);
//   } catch {
//     return text;
//   }
// };

// /* =========================================================
//    REFRESH SESSION
// ========================================================= */

// const refreshSession =
//   async () => {
//     const refreshToken =
//       localStorage.getItem(
//         REFRESH_TOKEN_KEY
//       ) ||
//       getSavedSession()
//         ?.refresh_token;

//     if (!refreshToken) {
//       return null;
//     }

//     try {
//       const data =
//         await authFetch(
//           "token?grant_type=refresh_token",
//           {
//             method: "POST",

//             token:
//               SUPABASE_KEY,

//             body: {
//               refresh_token:
//                 refreshToken,
//             },
//           }
//         );

//       if (
//         !data?.access_token
//       ) {
//         return null;
//       }

//       saveSession(data);

//       return data;
//     } catch (error) {
//       console.warn(
//         "Session refresh failed:",
//         error
//       );

//       removeSession();

//       return null;
//     }
//   };

// /* =========================================================
//    ACCESS TOKEN
// ========================================================= */

// const getValidAccessToken =
//   async () => {
//     const token =
//       localStorage.getItem(
//         ACCESS_TOKEN_KEY
//       );

//     if (
//       tokenIsUsable(token)
//     ) {
//       return token;
//     }

//     const refreshed =
//       await refreshSession();

//     return (
//       refreshed?.access_token ||
//       null
//     );
//   };

// /* =========================================================
//    FETCH USER WITH TOKEN
// ========================================================= */

// const fetchUserWithToken =
//   async (token) => {
//     if (!token) {
//       return null;
//     }

//     return authFetch(
//       "user",
//       {
//         token,
//       }
//     );
//   };

// /* =========================================================
//    PROFILE WITH TOKEN
// ========================================================= */

// const fetchProfileWithToken =
//   async (
//     userId,
//     token
//   ) => {
//     if (
//       !userId ||
//       !token
//     ) {
//       return null;
//     }

//     const data =
//       await dbFetch(
//         `profiles?select=*&id=eq.${encodeURIComponent(
//           userId
//         )}&limit=1`,
//         {
//           token,
//         }
//       );

//     return data?.[0] || null;
//   };

// /* =========================================================
//    WAIT FOR PROFILE TRIGGER

//    Auth signup creates the auth user first.

//    Our database trigger then creates the profile.
//    A tiny delay can occasionally exist, especially during
//    OAuth signup, so retry the read briefly.

//    We DO NOT create the profile from the frontend.
// ========================================================= */

// const waitForProfile =
//   async (
//     userId,
//     token,
//     attempts = 4
//   ) => {
//     for (
//       let attempt = 0;
//       attempt < attempts;
//       attempt += 1
//     ) {
//       const profile =
//         await fetchProfileWithToken(
//           userId,
//           token
//         );

//       if (profile) {
//         return {
//           ...profile,

//           role:
//             normalizeRole(
//               profile.role
//             ),
//         };
//       }

//       if (
//         attempt <
//         attempts - 1
//       ) {
//         await new Promise(
//           (resolve) =>
//             setTimeout(
//               resolve,
//               250
//             )
//         );
//       }
//     }

//     return null;
//   };

// /* =========================================================
//    GOOGLE / RECOVERY REDIRECT
// ========================================================= */

// export const handleOAuthRedirect =
//   async () => {
//     const hash =
//       window.location.hash;

//     if (
//       !hash ||
//       !hash.includes(
//         "access_token"
//       )
//     ) {
//       return null;
//     }

//     const params =
//       new URLSearchParams(
//         hash.replace(
//           /^#/,
//           ""
//         )
//       );

//     const accessToken =
//       params.get(
//         "access_token"
//       );

//     const refreshToken =
//       params.get(
//         "refresh_token"
//       );

//     const expiresIn =
//       params.get(
//         "expires_in"
//       );

//     const tokenType =
//       params.get(
//         "token_type"
//       ) || "bearer";

//     const redirectType =
//       params.get("type");

//     if (!accessToken) {
//       return null;
//     }

//     const user =
//       await fetchUserWithToken(
//         accessToken
//       );

//     if (!user?.id) {
//       throw new Error(
//         "Unable to retrieve authenticated user."
//       );
//     }

//     const session = {
//       access_token:
//         accessToken,

//       refresh_token:
//         refreshToken,

//       expires_in:
//         Number(
//           expiresIn || 3600
//         ),

//       token_type:
//         tokenType,

//       user,
//     };

//     saveSession(session);

//     /*
//       Password recovery also returns an access-token
//       hash.

//       Do not treat a password-recovery redirect like
//       a Google login and send the user to the homepage.
//     */
//     if (
//       redirectType ===
//       "recovery"
//     ) {
//       window.history.replaceState(
//         {},
//         document.title,
//         window.location.pathname
//       );

//       emitAuthEvent(
//         "auth:login"
//       );

//       return session;
//     }

//     const profile =
//       await waitForProfile(
//         user.id,
//         accessToken
//       );

//     if (!profile) {
//       removeSession();

//       throw new Error(
//         "Your profile could not be loaded."
//       );
//     }

//     const loginMode =
//       localStorage.getItem(
//         LOGIN_MODE_KEY
//       ) || "user";

//     /*
//       Remove OAuth tokens from the URL.
//     */
//     window.history.replaceState(
//       {},
//       document.title,
//       window.location.pathname
//     );

//     /*
//       ADMIN LOGIN

//       Only a real profile with role "admin"
//       can enter admin mode.
//     */
//     if (
//       loginMode === "admin"
//     ) {
//       if (
//         profile.role !==
//         "admin"
//       ) {
//         removeSession();

//         localStorage.removeItem(
//           LOGIN_MODE_KEY
//         );

//         emitAuthEvent(
//           "auth:logout"
//         );

//         window.location.replace(
//           "/sign_in"
//         );

//         return null;
//       }

//       localStorage.setItem(
//         LOGIN_MODE_KEY,
//         "admin"
//       );

//       emitAuthEvent(
//         "auth:login"
//       );

//       window.location.replace(
//         "/admin/dashboard"
//       );

//       return session;
//     }

//     /*
//       NORMAL CUSTOMER MODE

//       Even if the actual profile belongs to an admin,
//       logging in through the customer login behaves like
//       a normal customer session.
//     */
//     localStorage.setItem(
//       LOGIN_MODE_KEY,
//       "user"
//     );

//     emitAuthEvent(
//       "auth:login"
//     );

//     window.location.replace(
//       "/"
//     );

//     return session;
//   };

// /* =========================================================
//    REGISTER

//    DO NOT ACCEPT OR SEND ROLE.
// ========================================================= */

// export const register =
//   async ({
//     email,
//     password,
//     fullName = "",
//     phone = "",
//   }) => {
//     const cleanEmail =
//       String(email || "")
//         .trim()
//         .toLowerCase();

//     if (
//       !cleanEmail ||
//       !password
//     ) {
//       throw new Error(
//         "Email and password are required."
//       );
//     }

//     localStorage.setItem(
//       LOGIN_MODE_KEY,
//       "user"
//     );

//     /*
//       Role is intentionally absent.

//       The database trigger creates:
//         profiles.role = "user"
//     */
//     const data =
//       await authFetch(
//         "signup",
//         {
//           method: "POST",

//           token:
//             SUPABASE_KEY,

//           body: {
//             email:
//               cleanEmail,

//             password,

//             data: {
//               full_name:
//                 String(
//                   fullName ||
//                     ""
//                 ).trim(),

//               phone:
//                 String(
//                   phone || ""
//                 ).trim(),
//             },
//           },
//         }
//       );

//     if (
//       data?.access_token
//     ) {
//       saveSession(data);

//       emitAuthEvent(
//         "auth:login"
//       );
//     }

//     return data;
//   };

// /* =========================================================
//    EMAIL LOGIN
// ========================================================= */

// export const login =
//   async ({
//     email,
//     password,
//   }) => {
//     const cleanEmail =
//       String(email || "")
//         .trim()
//         .toLowerCase();

//     if (
//       !cleanEmail ||
//       !password
//     ) {
//       throw new Error(
//         "Email and password are required."
//       );
//     }

//     const data =
//       await authFetch(
//         "token?grant_type=password",
//         {
//           method: "POST",

//           token:
//             SUPABASE_KEY,

//           body: {
//             email:
//               cleanEmail,

//             password,
//           },
//         }
//       );

//     if (
//       !data?.access_token ||
//       !data?.user
//     ) {
//       throw new Error(
//         "Login did not return a valid session."
//       );
//     }

//     saveSession(data);

//     emitAuthEvent(
//       "auth:login"
//     );

//     return {
//       session: data,

//       user:
//         data.user,
//     };
//   };

// /* =========================================================
//    GOOGLE LOGIN
// ========================================================= */

// export const googleLogin =
//   async () => {
//     const redirectTo =
//       encodeURIComponent(
//         window.location.origin
//       );

//     /*
//       echoo_login_mode should already be set by:
//       - Login.jsx        -> user
//       - AdminLogin.jsx   -> admin
//     */

//     if (
//       !localStorage.getItem(
//         LOGIN_MODE_KEY
//       )
//     ) {
//       localStorage.setItem(
//         LOGIN_MODE_KEY,
//         "user"
//       );
//     }

//     window.location.href =
//       `${SUPABASE_URL}/auth/v1/authorize` +
//       `?provider=google` +
//       `&redirect_to=${redirectTo}`;

//     return true;
//   };

// /* =========================================================
//    LOGOUT
// ========================================================= */

// export const logout =
//   async () => {
//     const token =
//       localStorage.getItem(
//         ACCESS_TOKEN_KEY
//       );

//     if (token) {
//       try {
//         await authFetch(
//           "logout",
//           {
//             method: "POST",
//             token,
//             body: {},
//           }
//         );
//       } catch (error) {
//         /*
//           Local logout should still succeed if the
//           remote token is already expired.
//         */
//         console.warn(
//           "Remote logout failed:",
//           error
//         );
//       }
//     }

//     removeSession();

//     localStorage.removeItem(
//       LOGIN_MODE_KEY
//     );

//     emitAuthEvent(
//       "auth:logout"
//     );

//     return true;
//   };

// /* =========================================================
//    FORGOT PASSWORD
// ========================================================= */

// export const forgotPassword =
//   async (email) => {
//     const cleanEmail =
//       String(email || "")
//         .trim()
//         .toLowerCase();

//     if (!cleanEmail) {
//       throw new Error(
//         "Email is required."
//       );
//     }

//     return authFetch(
//       "recover",
//       {
//         method: "POST",

//         token:
//           SUPABASE_KEY,

//         body: {
//           email:
//             cleanEmail,

//           redirect_to:
//             `${window.location.origin}/reset-password`,
//         },
//       }
//     );
//   };

// /* =========================================================
//    RESET PASSWORD
// ========================================================= */

// export const resetPassword =
//   async ({
//     password,
//   }) => {
//     if (!password) {
//       throw new Error(
//         "New password is required."
//       );
//     }

//     /*
//       If the recovery token is still in the URL,
//       store it before attempting the password update.
//     */
//     await handleOAuthRedirect();

//     const token =
//       await getValidAccessToken();

//     if (!token) {
//       throw new Error(
//         "Password reset session has expired. Please request a new reset link."
//       );
//     }

//     return authFetch(
//       "user",
//       {
//         method: "PUT",

//         token,

//         body: {
//           password,
//         },
//       }
//     );
//   };

// /* =========================================================
//    CURRENT SESSION
// ========================================================= */

// export const getCurrentSession =
//   async () => {
//     /*
//       First handle Google OAuth / recovery redirect
//       if the page currently contains Supabase tokens.
//     */

//     await handleOAuthRedirect();

//     /* ---------------------------------------------------------
//        1. Try the normal saved session first.
//     --------------------------------------------------------- */

//     let session =
//       getSavedSession();

//     /* ---------------------------------------------------------
//        2. Also check the separately stored access token.

//        The project already stores:

//            echoo_session
//            echoo_access_token
//            echoo_refresh_token

//        If echoo_session is missing but echoo_access_token
//        still exists, rebuild the session instead of treating
//        the user as logged out.
//     --------------------------------------------------------- */

//     const storedAccessToken =
//       localStorage.getItem(
//         ACCESS_TOKEN_KEY
//       );

//     const storedRefreshToken =
//       localStorage.getItem(
//         REFRESH_TOKEN_KEY
//       );

//     if (
//       !session?.access_token &&
//       storedAccessToken
//     ) {
//       /*
//         If the standalone access token is still usable,
//         restore a session around it.
//       */

//       if (
//         tokenIsUsable(
//           storedAccessToken
//         )
//       ) {
//         const payload =
//           decodeJwtPayload(
//             storedAccessToken
//           );

//         session = {
//           ...(session || {}),

//           access_token:
//             storedAccessToken,

//           refresh_token:
//             storedRefreshToken ||
//             session?.refresh_token ||
//             null,

//           token_type:
//             session?.token_type ||
//             "bearer",

//           expires_at:
//             payload?.exp ||
//             session?.expires_at,

//           user:
//             session?.user ||
//             null,
//         };

//         /*
//           Synchronize echoo_session again so all frontend
//           auth consumers see the same session.
//         */

//         saveSession(
//           session
//         );
//       } else {
//         /*
//           Access token exists but has expired.

//           Use the refresh token through the existing
//           refreshSession() logic.
//         */

//         session =
//           await refreshSession();
//       }
//     }

//     /* ---------------------------------------------------------
//        3. Nothing usable exists.
//     --------------------------------------------------------- */

//     if (
//       !session?.access_token
//     ) {
//       return null;
//     }

//     /* ---------------------------------------------------------
//        4. Existing session token expired.

//        Preserve your current refresh behaviour.
//     --------------------------------------------------------- */

//     if (
//       !tokenIsUsable(
//         session.access_token
//       )
//     ) {
//       session =
//         await refreshSession();
//     }

//     /* ---------------------------------------------------------
//        5. Return valid session.
//     --------------------------------------------------------- */

//     return (
//       session ||
//       null
//     );
//   };

// /* =========================================================
//    CURRENT USER
// ========================================================= */

// export const getCurrentUser =
//   async () => {
//     await handleOAuthRedirect();

//     let token =
//       await getValidAccessToken();

//     if (!token) {
//       return null;
//     }

//     try {
//       const user =
//         await fetchUserWithToken(
//           token
//         );

//       if (!user?.id) {
//         return null;
//       }

//       updateSavedSessionUser(
//         user
//       );

//       return user;
//     } catch (error) {
//       if (
//         error?.status ===
//         401
//       ) {
//         const refreshed =
//           await refreshSession();

//         token =
//           refreshed
//             ?.access_token;

//         if (!token) {
//           clearSessionOnly();

//           return null;
//         }

//         try {
//           const user =
//             await fetchUserWithToken(
//               token
//             );

//           if (user?.id) {
//             updateSavedSessionUser(
//               user
//             );

//             return user;
//           }
//         } catch {
//           clearSessionOnly();

//           return null;
//         }
//       }

//       console.error(
//         "Get current user error:",
//         error
//       );

//       return null;
//     }
//   };

// /* =========================================================
//    GET PROFILE
// ========================================================= */

// export const getProfile =
//   async () => {
//     const user =
//       await getCurrentUser();

//     if (!user?.id) {
//       return null;
//     }

//     const token =
//       await getValidAccessToken();

//     if (!token) {
//       return null;
//     }

//     const profile =
//       await waitForProfile(
//         user.id,
//         token
//       );

//     if (!profile) {
//       return null;
//     }

//     return {
//       ...profile,

//       /*
//         Always normalize values read from older data.
//       */
//       role:
//         normalizeRole(
//           profile.role
//         ),
//     };
//   };

// /* =========================================================
//    UPDATE PROFILE

//    Role is intentionally NOT editable here.
// ========================================================= */

// export const updateProfile =
//   async ({
//     fullName,
//     phone,
//     avatarUrl,
//     address,
//   } = {}) => {
//     const user =
//       await getCurrentUser();

//     if (!user?.id) {
//       throw new Error(
//         "User not logged in."
//       );
//     }

//     const updateData = {
//       updated_at:
//         new Date().toISOString(),
//     };

//     if (
//       fullName !==
//       undefined
//     ) {
//       updateData.full_name =
//         String(
//           fullName || ""
//         ).trim();
//     }

//     if (
//       phone !==
//       undefined
//     ) {
//       updateData.phone =
//         String(
//           phone || ""
//         ).trim();
//     }

//     /*
//       These are retained only if those profile columns
//       exist in your current schema.

//       We can remove them later if your profile table
//       contains only full_name/phone.
//     */
//     if (
//       avatarUrl !==
//       undefined
//     ) {
//       updateData.avatar_url =
//         avatarUrl || null;
//     }

//     if (
//       address !== undefined
//     ) {
//       updateData.address =
//         address || null;
//     }

//     const data =
//       await dbFetch(
//         `profiles?id=eq.${encodeURIComponent(
//           user.id
//         )}`,
//         {
//           method: "PATCH",

//           body:
//             updateData,
//         }
//       );

//     const profile =
//       data?.[0] || null;

//     return profile
//       ? {
//           ...profile,

//           role:
//             normalizeRole(
//               profile.role
//             ),
//         }
//       : null;
//   };

// /* =========================================================
//    LOGGED IN
// ========================================================= */

// export const isLoggedIn =
//   async () => {
//     const session =
//       await getCurrentSession();

//     return Boolean(
//       session?.access_token
//     );
//   };

// /* =========================================================
//    ACTUAL DATABASE ROLE
// ========================================================= */

// export const getUserRole =
//   async () => {
//     const profile =
//       await getProfile();

//     if (!profile) {
//       return null;
//     }

//     return normalizeRole(
//       profile.role
//     );
//   };

// /* =========================================================
//    EFFECTIVE ADMIN ACCESS
// ========================================================= */

// export const isAdmin =
//   async () => {
//     const role =
//       await getUserRole();

//     const mode =
//       localStorage.getItem(
//         LOGIN_MODE_KEY
//       );

//     return (
//       mode === "admin" &&
//       role === "admin"
//     );
//   };

// /* =========================================================
//    CUSTOMER MODE
// ========================================================= */

// export const isUser =
//   async () => {
//     const session =
//       await getCurrentSession();

//     if (!session) {
//       return false;
//     }

//     const mode =
//       localStorage.getItem(
//         LOGIN_MODE_KEY
//       );

//     /*
//       Any authenticated account can use the normal
//       customer website when logged in through user mode.
//     */
//     return (
//       mode !== "admin"
//     );
//   };

// /* =========================================================
//    LOGIN MODE
// ========================================================= */

// export const getLoginMode =
//   () =>
//     localStorage.getItem(
//       LOGIN_MODE_KEY
//     ) || "user";

// export const setLoginMode =
//   (mode) => {
//     const normalized =
//       mode === "admin"
//         ? "admin"
//         : "user";

//     localStorage.setItem(
//       LOGIN_MODE_KEY,
//       normalized
//     );

//     emitAuthEvent(
//       "auth:mode-change"
//     );

//     return normalized;
//   };

// /* =========================================================
//    AUTH CHANGE LISTENER
// ========================================================= */

// export const onAuthStateChange =
//   (callback) => {
//     if (
//       typeof callback !==
//       "function"
//     ) {
//       return {
//         unsubscribe() {},
//       };
//     }

//     let disposed = false;

//     const handler =
//       async () => {
//         if (disposed) {
//           return;
//         }

//         try {
//           /*
//             Handle a Google/recovery callback first.
//           */
//           await handleOAuthRedirect();

//           const session =
//             await getCurrentSession();

//           if (disposed) {
//             return;
//           }

//           if (
//             session
//               ?.access_token
//           ) {
//             callback(
//               "SIGNED_IN",
//               session
//             );
//           } else {
//             callback(
//               "SIGNED_OUT",
//               null
//             );
//           }
//         } catch (
//           error
//         ) {
//           console.error(
//             "Auth state listener error:",
//             error
//           );

//           if (!disposed) {
//             callback(
//               "SIGNED_OUT",
//               null
//             );
//           }
//         }
//       };

//     const storageHandler =
//       (event) => {
//         if (
//           !event?.key ||
//           [
//             SESSION_KEY,
//             ACCESS_TOKEN_KEY,
//             REFRESH_TOKEN_KEY,
//             LOGIN_MODE_KEY,
//           ].includes(
//             event.key
//           )
//         ) {
//           handler();
//         }
//       };

//     window.addEventListener(
//       "storage",
//       storageHandler
//     );

//     window.addEventListener(
//       "auth:login",
//       handler
//     );

//     window.addEventListener(
//       "auth:logout",
//       handler
//     );

//     window.addEventListener(
//       "auth:mode-change",
//       handler
//     );

//     const timeout =
//       setTimeout(
//         handler,
//         0
//       );

//     return {
//       unsubscribe: () => {
//         disposed = true;

//         clearTimeout(
//           timeout
//         );

//         window.removeEventListener(
//           "storage",
//           storageHandler
//         );

//         window.removeEventListener(
//           "auth:login",
//           handler
//         );

//         window.removeEventListener(
//           "auth:logout",
//           handler
//         );

//         window.removeEventListener(
//           "auth:mode-change",
//           handler
//         );
//       },
//     };
//   };

/*
  authApi.js

  Grocery Voice Shopping Assistant

  Authentication:
  - Email/password registration
  - Email/password login
  - Google OAuth
  - Password recovery
  - Session persistence
  - Profile retrieval/update
  - User/Admin login-mode support

  IMPORTANT:
  - Registration never sends a role.
  - Database trigger creates profiles.role = "user".
  - Roles are always lowercase: "user" / "admin".
  - VITE_SUPABASE_ANON_KEY / publishable key is sent in `apikey`.
  - `Authorization` is sent only with a real signed-in user JWT.
*/

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL;

const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY;


/* =========================================================
   ENVIRONMENT CHECK
========================================================= */

if (!SUPABASE_URL) {
  throw new Error(
    "Missing VITE_SUPABASE_URL"
  );
}

if (!SUPABASE_KEY) {
  throw new Error(
    "Missing VITE_SUPABASE_ANON_KEY"
  );
}


/* =========================================================
   STORAGE KEYS
========================================================= */

const SESSION_KEY =
  "echoo_session";

const ACCESS_TOKEN_KEY =
  "echoo_access_token";

const REFRESH_TOKEN_KEY =
  "echoo_refresh_token";

const LOGIN_MODE_KEY =
  "echoo_login_mode";


/* =========================================================
   TIMEOUTS
========================================================= */

const AUTH_TIMEOUT_MS =
  15000;

const DB_TIMEOUT_MS =
  15000;


/* =========================================================
   ROLE
========================================================= */

export const normalizeRole = (
  role
) =>
  String(
    role || "user"
  )
    .trim()
    .toLowerCase() ===
  "admin"
    ? "admin"
    : "user";


/* =========================================================
   ERROR PARSER
========================================================= */

const createApiError = (
  response,
  text,
  fallback
) => {
  let parsed = null;

  try {
    parsed = text
      ? JSON.parse(text)
      : null;
  } catch {
    parsed = null;
  }

  const error =
    new Error(
      parsed?.msg ||
        parsed?.message ||
        parsed?.error_description ||
        parsed?.error ||
        text ||
        fallback
    );

  error.status =
    response?.status;

  error.code =
    parsed?.code;

  error.details =
    parsed?.details;

  error.hint =
    parsed?.hint;

  error.raw =
    parsed || text;

  return error;
};


/* =========================================================
   SESSION STORAGE
========================================================= */

const getSavedSession =
  () => {
    try {
      const raw =
        localStorage.getItem(
          SESSION_KEY
        );

      return raw
        ? JSON.parse(raw)
        : null;
    } catch {
      return null;
    }
  };


const saveSession = (
  session
) => {
  if (!session) {
    return;
  }

  const previous =
    getSavedSession() ||
    {};

  const normalized = {
    ...previous,
    ...session,

    user:
      session.user ||
      previous.user ||
      null,

    expires_at:
      session.expires_at ||
      (
        session.expires_in
          ? Math.floor(
              Date.now() /
                1000
            ) +
            Number(
              session.expires_in
            )
          : previous.expires_at
      ),
  };


  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(
      normalized
    )
  );


  if (
    normalized.access_token
  ) {
    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      normalized.access_token
    );
  }


  if (
    normalized.refresh_token
  ) {
    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      normalized.refresh_token
    );
  }
};


const updateSavedSessionUser =
  (user) => {
    const session =
      getSavedSession();

    if (!session) {
      return;
    }

    saveSession({
      ...session,
      user,
    });
  };


const removeSession =
  () => {
    localStorage.removeItem(
      SESSION_KEY
    );

    localStorage.removeItem(
      ACCESS_TOKEN_KEY
    );

    localStorage.removeItem(
      REFRESH_TOKEN_KEY
    );
  };


/* =========================================================
   AUTH EVENTS
========================================================= */

const emitAuthEvent = (
  eventName
) => {
  window.dispatchEvent(
    new CustomEvent(
      eventName
    )
  );
};


const clearSessionOnly =
  () => {
    removeSession();

    emitAuthEvent(
      "auth:logout"
    );
  };


/* =========================================================
   JWT
========================================================= */

const decodeJwtPayload = (
  token
) => {
  if (
    !token ||
    !token.includes(".")
  ) {
    return null;
  }

  try {
    let base64 =
      token
        .split(".")[1]
        .replace(
          /-/g,
          "+"
        )
        .replace(
          /_/g,
          "/"
        );

    while (
      base64.length % 4
    ) {
      base64 += "=";
    }

    return JSON.parse(
      atob(base64)
    );
  } catch {
    return null;
  }
};


const tokenIsUsable = (
  token
) => {
  const payload =
    decodeJwtPayload(
      token
    );

  if (!payload?.exp) {
    return Boolean(
      token
    );
  }

  /*
    15-second safety buffer.
  */

  return (
    payload.exp *
      1000 >
    Date.now() +
      15000
  );
};


/* =========================================================
   PUBLIC AUTH REQUEST CHECK

   These endpoints MUST NOT receive the project API key as
   Authorization: Bearer ...

   They only need:
       apikey: SUPABASE_KEY
========================================================= */

const isPublicAuthRequest = (
  path = ""
) => {
  const value =
    String(
      path || ""
    ).toLowerCase();

  return (
    value.startsWith(
      "token?"
    ) ||
    value ===
      "signup" ||
    value ===
      "recover"
  );
};


/* =========================================================
   FETCH WITH TIMEOUT

   Prevents:
     Signing in...
     Signing in...
     Signing in...

   forever when the network call never resolves.
========================================================= */

const fetchWithTimeout =
  async (
    url,
    options,
    timeoutMs,
    timeoutMessage
  ) => {
    const controller =
      new AbortController();

    const timeoutId =
      setTimeout(
        () => {
          controller.abort();
        },
        timeoutMs
      );

    try {
      return await fetch(
        url,
        {
          ...options,

          signal:
            controller.signal,
        }
      );
    } catch (error) {
      if (
        error?.name ===
        "AbortError"
      ) {
        const timeoutError =
          new Error(
            timeoutMessage
          );

        timeoutError.code =
          "REQUEST_TIMEOUT";

        throw timeoutError;
      }

      throw error;
    } finally {
      clearTimeout(
        timeoutId
      );
    }
  };


/* =========================================================
   AUTH REST
========================================================= */

const authFetch =
  async (
    path,
    options = {}
  ) => {
    /*
      Login / signup / refresh / recover:

        apikey: project key

      Authenticated user calls:

        apikey: project key
        Authorization: Bearer USER JWT

      IMPORTANT:

      Never do:

        Authorization:
          Bearer sb_publishable_xxx

      or:

        Authorization:
          Bearer anon-project-key
    */

    const publicRequest =
      isPublicAuthRequest(
        path
      );


    const bearerToken =
      publicRequest
        ? null
        : (
            options.token ||
            localStorage.getItem(
              ACCESS_TOKEN_KEY
            ) ||
            null
          );


    const headers = {
      apikey:
        SUPABASE_KEY,

      "Content-Type":
        "application/json",

      ...(options.headers ||
        {}),
    };


    /*
      Only send Authorization
      when this is a real user token.
    */

    if (
      bearerToken &&
      bearerToken !==
        SUPABASE_KEY
    ) {
      headers.Authorization =
        `Bearer ${bearerToken}`;
    }


    const response =
      await fetchWithTimeout(
        `${SUPABASE_URL}/auth/v1/${path}`,

        {
          method:
            options.method ||
            "GET",

          headers,

          body:
            options.body !==
            undefined
              ? JSON.stringify(
                  options.body
                )
              : undefined,
        },

        AUTH_TIMEOUT_MS,

        "Authentication request timed out. Please try again."
      );


    const text =
      await response.text();


    if (
      !response.ok
    ) {
      throw createApiError(
        response,
        text,
        "Authentication request failed"
      );
    }


    if (!text) {
      return null;
    }


    try {
      return JSON.parse(
        text
      );
    } catch {
      return text;
    }
  };


/* =========================================================
   DATABASE REST
========================================================= */

const dbFetch =
  async (
    path,
    options = {}
  ) => {
    const token =
      options.token ||
      localStorage.getItem(
        ACCESS_TOKEN_KEY
      );


    if (!token) {
      throw new Error(
        "Please login first"
      );
    }


    const response =
      await fetchWithTimeout(
        `${SUPABASE_URL}/rest/v1/${path}`,

        {
          method:
            options.method ||
            "GET",

          headers: {
            apikey:
              SUPABASE_KEY,

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",

            Prefer:
              options.prefer ||
              "return=representation",

            ...(options.headers ||
              {}),
          },

          body:
            options.body !==
            undefined
              ? JSON.stringify(
                  options.body
                )
              : undefined,
        },

        DB_TIMEOUT_MS,

        "Database request timed out. Please try again."
      );


    const text =
      await response.text();


    if (
      !response.ok
    ) {
      throw createApiError(
        response,
        text,
        "Database request failed"
      );
    }


    if (!text) {
      return null;
    }


    try {
      return JSON.parse(
        text
      );
    } catch {
      return text;
    }
  };


/* =========================================================
   SESSION REFRESH
========================================================= */

const refreshSession =
  async () => {
    const refreshToken =
      localStorage.getItem(
        REFRESH_TOKEN_KEY
      ) ||
      getSavedSession()
        ?.refresh_token;


    if (
      !refreshToken
    ) {
      return null;
    }


    try {
      /*
        IMPORTANT:

        No Authorization header here.

        refresh token request only gets:
          apikey
          refresh_token body
      */

      const data =
        await authFetch(
          "token?grant_type=refresh_token",
          {
            method:
              "POST",

            body: {
              refresh_token:
                refreshToken,
            },
          }
        );


      if (
        !data?.access_token
      ) {
        return null;
      }


      saveSession(
        data
      );


      return data;

    } catch (error) {
      console.warn(
        "Session refresh failed:",
        error
      );


      removeSession();


      return null;
    }
  };


/* =========================================================
   VALID ACCESS TOKEN
========================================================= */

const getValidAccessToken =
  async () => {
    const token =
      localStorage.getItem(
        ACCESS_TOKEN_KEY
      );


    if (
      tokenIsUsable(
        token
      )
    ) {
      return token;
    }


    const refreshed =
      await refreshSession();


    return (
      refreshed?.access_token ||
      null
    );
  };


/* =========================================================
   FETCH AUTH USER
========================================================= */

const fetchUserWithToken =
  async (
    token
  ) => {
    if (!token) {
      return null;
    }


    return authFetch(
      "user",
      {
        token,
      }
    );
  };


/* =========================================================
   FETCH PROFILE
========================================================= */

const fetchProfileWithToken =
  async (
    userId,
    token
  ) => {
    if (
      !userId ||
      !token
    ) {
      return null;
    }


    const data =
      await dbFetch(
        `profiles?select=*&id=eq.${encodeURIComponent(
          userId
        )}&limit=1`,
        {
          token,
        }
      );


    return (
      data?.[0] ||
      null
    );
  };


/* =========================================================
   WAIT FOR PROFILE

   Signup creates auth.users first.

   Database trigger then creates profiles.

   OAuth can occasionally reach the frontend before the
   profile transaction becomes visible, so retry briefly.
========================================================= */

const waitForProfile =
  async (
    userId,
    token,
    attempts = 4
  ) => {
    for (
      let attempt = 0;
      attempt <
      attempts;
      attempt += 1
    ) {
      const profile =
        await fetchProfileWithToken(
          userId,
          token
        );


      if (profile) {
        return {
          ...profile,

          role:
            normalizeRole(
              profile.role
            ),
        };
      }


      if (
        attempt <
        attempts - 1
      ) {
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              250
            )
        );
      }
    }


    return null;
  };


/* =========================================================
   GOOGLE / RECOVERY REDIRECT
========================================================= */

export const handleOAuthRedirect =
  async () => {
    const hash =
      window.location.hash;


    if (
      !hash ||
      !hash.includes(
        "access_token"
      )
    ) {
      return null;
    }


    const params =
      new URLSearchParams(
        hash.replace(
          /^#/,
          ""
        )
      );


    const accessToken =
      params.get(
        "access_token"
      );


    const refreshToken =
      params.get(
        "refresh_token"
      );


    const expiresIn =
      params.get(
        "expires_in"
      );


    const tokenType =
      params.get(
        "token_type"
      ) || "bearer";


    const redirectType =
      params.get(
        "type"
      );


    if (
      !accessToken
    ) {
      return null;
    }


    const user =
      await fetchUserWithToken(
        accessToken
      );


    if (
      !user?.id
    ) {
      throw new Error(
        "Unable to retrieve authenticated user."
      );
    }


    const session = {
      access_token:
        accessToken,

      refresh_token:
        refreshToken,

      expires_in:
        Number(
          expiresIn ||
            3600
        ),

      token_type:
        tokenType,

      user,
    };


    saveSession(
      session
    );


    /*
      Password recovery links also contain access tokens.

      Do not treat recovery like Google login.
    */

    if (
      redirectType ===
      "recovery"
    ) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );


      emitAuthEvent(
        "auth:login"
      );


      return session;
    }


    const profile =
      await waitForProfile(
        user.id,
        accessToken
      );


    if (
      !profile
    ) {
      removeSession();


      throw new Error(
        "Your profile could not be loaded."
      );
    }


    const loginMode =
      localStorage.getItem(
        LOGIN_MODE_KEY
      ) || "user";


    /*
      Remove auth token hash
      from browser URL.
    */

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );


    /* =====================================================
       ADMIN GOOGLE LOGIN
    ===================================================== */

    if (
      loginMode ===
      "admin"
    ) {
      if (
        profile.role !==
        "admin"
      ) {
        removeSession();


        localStorage.removeItem(
          LOGIN_MODE_KEY
        );


        emitAuthEvent(
          "auth:logout"
        );


        window.location.replace(
          "/sign_in"
        );


        return null;
      }


      localStorage.setItem(
        LOGIN_MODE_KEY,
        "admin"
      );


      emitAuthEvent(
        "auth:login"
      );


      window.location.replace(
        "/admin/dashboard"
      );


      return session;
    }


    /* =====================================================
       NORMAL CUSTOMER GOOGLE LOGIN
    ===================================================== */

    localStorage.setItem(
      LOGIN_MODE_KEY,
      "user"
    );


    emitAuthEvent(
      "auth:login"
    );


    window.location.replace(
      "/"
    );


    return session;
  };


/* =========================================================
   REGISTER
========================================================= */

export const register =
  async ({
    email,
    password,
    fullName = "",
    phone = "",
  }) => {
    const cleanEmail =
      String(
        email || ""
      )
        .trim()
        .toLowerCase();


    if (
      !cleanEmail ||
      !password
    ) {
      throw new Error(
        "Email and password are required."
      );
    }


    localStorage.setItem(
      LOGIN_MODE_KEY,
      "user"
    );


    /*
      Role is intentionally NOT sent.

      Database trigger creates:
        role = "user"
    */

    const data =
      await authFetch(
        "signup",
        {
          method:
            "POST",

          body: {
            email:
              cleanEmail,

            password,

            data: {
              full_name:
                String(
                  fullName ||
                    ""
                ).trim(),

              phone:
                String(
                  phone ||
                    ""
                ).trim(),
            },
          },
        }
      );


    if (
      data?.access_token
    ) {
      saveSession(
        data
      );


      emitAuthEvent(
        "auth:login"
      );
    }


    return data;
  };


/* =========================================================
   EMAIL / PASSWORD LOGIN
========================================================= */

export const login =
  async ({
    email,
    password,
  }) => {
    const cleanEmail =
      String(
        email || ""
      )
        .trim()
        .toLowerCase();


    if (
      !cleanEmail ||
      !password
    ) {
      throw new Error(
        "Email and password are required."
      );
    }


    /*
      THIS IS THE IMPORTANT FIX.

      Fresh password login sends:

        apikey: SUPABASE_KEY

      It DOES NOT send:

        Authorization:
          Bearer SUPABASE_KEY
    */

    const data =
      await authFetch(
        "token?grant_type=password",
        {
          method:
            "POST",

          body: {
            email:
              cleanEmail,

            password,
          },
        }
      );


    if (
      !data?.access_token ||
      !data?.user
    ) {
      throw new Error(
        "Login did not return a valid session."
      );
    }


    saveSession(
      data
    );


    emitAuthEvent(
      "auth:login"
    );


    return {
      session:
        data,

      user:
        data.user,
    };
  };


/* =========================================================
   GOOGLE LOGIN
========================================================= */

export const googleLogin =
  async () => {
    const redirectTo =
      encodeURIComponent(
        window.location.origin
      );


    /*
      Login page/admin page should set mode before calling us.

      If no mode exists, customer mode is the safe default.
    */

    if (
      !localStorage.getItem(
        LOGIN_MODE_KEY
      )
    ) {
      localStorage.setItem(
        LOGIN_MODE_KEY,
        "user"
      );
    }


    window.location.href =
      `${SUPABASE_URL}/auth/v1/authorize` +
      `?provider=google` +
      `&redirect_to=${redirectTo}`;


    return true;
  };


/* =========================================================
   LOGOUT
========================================================= */

export const logout =
  async () => {
    const token =
      localStorage.getItem(
        ACCESS_TOKEN_KEY
      );


    if (token) {
      try {
        await authFetch(
          "logout",
          {
            method:
              "POST",

            token,

            body: {},
          }
        );
      } catch (error) {
        /*
          Local logout still succeeds
          even if remote logout fails.
        */

        console.warn(
          "Remote logout failed:",
          error
        );
      }
    }


    removeSession();


    localStorage.removeItem(
      LOGIN_MODE_KEY
    );


    emitAuthEvent(
      "auth:logout"
    );


    return true;
  };


/* =========================================================
   FORGOT PASSWORD
========================================================= */

export const forgotPassword =
  async (
    email
  ) => {
    const cleanEmail =
      String(
        email || ""
      )
        .trim()
        .toLowerCase();


    if (
      !cleanEmail
    ) {
      throw new Error(
        "Email is required."
      );
    }


    return authFetch(
      "recover",
      {
        method:
          "POST",

        body: {
          email:
            cleanEmail,

          redirect_to:
            `${window.location.origin}/reset-password`,
        },
      }
    );
  };


/* =========================================================
   RESET PASSWORD
========================================================= */

export const resetPassword =
  async ({
    password,
  }) => {
    if (
      !password
    ) {
      throw new Error(
        "New password is required."
      );
    }


    /*
      Recovery URL may currently
      contain access token hash.
    */

    await handleOAuthRedirect();


    const token =
      await getValidAccessToken();


    if (!token) {
      throw new Error(
        "Password reset session has expired. Please request a new reset link."
      );
    }


    return authFetch(
      "user",
      {
        method:
          "PUT",

        token,

        body: {
          password,
        },
      }
    );
  };


/* =========================================================
   CURRENT SESSION
========================================================= */

export const getCurrentSession =
  async () => {
    /*
      First process Google OAuth / password recovery
      if the URL currently contains Supabase tokens.
    */

    await handleOAuthRedirect();


    let session =
      getSavedSession();


    const storedAccessToken =
      localStorage.getItem(
        ACCESS_TOKEN_KEY
      );


    const storedRefreshToken =
      localStorage.getItem(
        REFRESH_TOKEN_KEY
      );


    /*
      Session object missing,
      but standalone access token exists.
    */

    if (
      !session?.access_token &&
      storedAccessToken
    ) {
      /*
        Access token is still valid.
      */

      if (
        tokenIsUsable(
          storedAccessToken
        )
      ) {
        const payload =
          decodeJwtPayload(
            storedAccessToken
          );


        session = {
          ...(session ||
            {}),

          access_token:
            storedAccessToken,

          refresh_token:
            storedRefreshToken ||
            session?.refresh_token ||
            null,

          token_type:
            session?.token_type ||
            "bearer",

          expires_at:
            payload?.exp ||
            session?.expires_at,

          user:
            session?.user ||
            null,
        };


        /*
          Keep all three storage values synchronized.
        */

        saveSession(
          session
        );

      } else {
        /*
          Access token expired.
          Try refresh token.
        */

        session =
          await refreshSession();
      }
    }


    /*
      No usable session.
    */

    if (
      !session?.access_token
    ) {
      return null;
    }


    /*
      Existing saved session has expired.
    */

    if (
      !tokenIsUsable(
        session.access_token
      )
    ) {
      session =
        await refreshSession();
    }


    return (
      session ||
      null
    );
  };


/* =========================================================
   CURRENT USER
========================================================= */

export const getCurrentUser =
  async () => {
    /*
      Needed for OAuth/recovery redirect,
      harmless for normal pages.
    */

    await handleOAuthRedirect();


    let token =
      await getValidAccessToken();


    if (!token) {
      return null;
    }


    try {
      const user =
        await fetchUserWithToken(
          token
        );


      if (
        !user?.id
      ) {
        return null;
      }


      updateSavedSessionUser(
        user
      );


      return user;

    } catch (error) {

      /*
        Access token rejected.

        Try refresh exactly once.
      */

      if (
        error?.status ===
        401
      ) {
        const refreshed =
          await refreshSession();


        token =
          refreshed
            ?.access_token;


        if (!token) {
          clearSessionOnly();


          return null;
        }


        try {
          const user =
            await fetchUserWithToken(
              token
            );


          if (
            user?.id
          ) {
            updateSavedSessionUser(
              user
            );


            return user;
          }

        } catch {
          clearSessionOnly();


          return null;
        }
      }


      console.error(
        "Get current user error:",
        error
      );


      return null;
    }
  };


/* =========================================================
   GET PROFILE
========================================================= */

export const getProfile =
  async () => {
    const user =
      await getCurrentUser();


    if (
      !user?.id
    ) {
      return null;
    }


    const token =
      await getValidAccessToken();


    if (!token) {
      return null;
    }


    const profile =
      await waitForProfile(
        user.id,
        token
      );


    if (!profile) {
      return null;
    }


    return {
      ...profile,

      role:
        normalizeRole(
          profile.role
        ),
    };
  };


/* =========================================================
   UPDATE PROFILE

   Role intentionally cannot be changed here.
========================================================= */

export const updateProfile =
  async ({
    fullName,
    phone,
    avatarUrl,
    address,
  } = {}) => {
    const user =
      await getCurrentUser();


    if (
      !user?.id
    ) {
      throw new Error(
        "User not logged in."
      );
    }


    const updateData = {
      updated_at:
        new Date()
          .toISOString(),
    };


    if (
      fullName !==
      undefined
    ) {
      updateData.full_name =
        String(
          fullName ||
            ""
        ).trim();
    }


    if (
      phone !==
      undefined
    ) {
      updateData.phone =
        String(
          phone ||
            ""
        ).trim();
    }


    if (
      avatarUrl !==
      undefined
    ) {
      updateData.avatar_url =
        avatarUrl ||
        null;
    }


    if (
      address !==
      undefined
    ) {
      updateData.address =
        address ||
        null;
    }


    const data =
      await dbFetch(
        `profiles?id=eq.${encodeURIComponent(
          user.id
        )}`,
        {
          method:
            "PATCH",

          body:
            updateData,
        }
      );


    const profile =
      data?.[0] ||
      null;


    return profile
      ? {
          ...profile,

          role:
            normalizeRole(
              profile.role
            ),
        }
      : null;
  };


/* =========================================================
   IS LOGGED IN
========================================================= */

export const isLoggedIn =
  async () => {
    const session =
      await getCurrentSession();


    return Boolean(
      session?.access_token
    );
  };


/* =========================================================
   GET DATABASE ROLE
========================================================= */

export const getUserRole =
  async () => {
    const profile =
      await getProfile();


    if (!profile) {
      return null;
    }


    return normalizeRole(
      profile.role
    );
  };


/* =========================================================
   IS ADMIN
========================================================= */

export const isAdmin =
  async () => {
    const role =
      await getUserRole();


    const mode =
      localStorage.getItem(
        LOGIN_MODE_KEY
      );


    return (
      mode ===
        "admin" &&
      role ===
        "admin"
    );
  };


/* =========================================================
   IS CUSTOMER
========================================================= */

export const isUser =
  async () => {
    const session =
      await getCurrentSession();


    if (!session) {
      return false;
    }


    const mode =
      localStorage.getItem(
        LOGIN_MODE_KEY
      );


    /*
      An actual admin account may still use the normal
      customer site when logged in through customer mode.
    */

    return (
      mode !==
      "admin"
    );
  };


/* =========================================================
   LOGIN MODE
========================================================= */

export const getLoginMode =
  () =>
    localStorage.getItem(
      LOGIN_MODE_KEY
    ) || "user";


export const setLoginMode =
  (mode) => {
    const normalized =
      mode ===
      "admin"
        ? "admin"
        : "user";


    localStorage.setItem(
      LOGIN_MODE_KEY,
      normalized
    );


    emitAuthEvent(
      "auth:mode-change"
    );


    return normalized;
  };


/* =========================================================
   AUTH CHANGE LISTENER
========================================================= */

export const onAuthStateChange =
  (callback) => {
    if (
      typeof callback !==
      "function"
    ) {
      return {
        unsubscribe() {},
      };
    }


    let disposed =
      false;


    const handler =
      async () => {
        if (
          disposed
        ) {
          return;
        }


        try {
          /*
            getCurrentSession already handles
            OAuth/recovery redirect.

            Do NOT call handleOAuthRedirect()
            separately again here.
          */

          const session =
            await getCurrentSession();


          if (
            disposed
          ) {
            return;
          }


          if (
            session
              ?.access_token
          ) {
            callback(
              "SIGNED_IN",
              session
            );
          } else {
            callback(
              "SIGNED_OUT",
              null
            );
          }

        } catch (error) {
          console.error(
            "Auth state listener error:",
            error
          );


          if (
            !disposed
          ) {
            callback(
              "SIGNED_OUT",
              null
            );
          }
        }
      };


    const storageHandler =
      (event) => {
        if (
          !event?.key ||
          [
            SESSION_KEY,
            ACCESS_TOKEN_KEY,
            REFRESH_TOKEN_KEY,
            LOGIN_MODE_KEY,
          ].includes(
            event.key
          )
        ) {
          handler();
        }
      };


    window.addEventListener(
      "storage",
      storageHandler
    );


    window.addEventListener(
      "auth:login",
      handler
    );


    window.addEventListener(
      "auth:logout",
      handler
    );


    window.addEventListener(
      "auth:mode-change",
      handler
    );


    const timeout =
      setTimeout(
        handler,
        0
      );


    return {
      unsubscribe: () => {
        disposed =
          true;


        clearTimeout(
          timeout
        );


        window.removeEventListener(
          "storage",
          storageHandler
        );


        window.removeEventListener(
          "auth:login",
          handler
        );


        window.removeEventListener(
          "auth:logout",
          handler
        );


        window.removeEventListener(
          "auth:mode-change",
          handler
        );
      },
    };
  };
