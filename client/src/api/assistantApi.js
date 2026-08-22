// import {
//   getCurrentSession,
// } from "./authApi";

// /*
//   assistantApi.js

//   Grocery Voice Shopping Assistant

//   This file connects the React frontend to the
//   AI / RAG / Voice backends.

//   Responsibilities:
//   - Grocery product discovery
//   - Natural-language product search
//   - Product recommendations
//   - Shopping/cart command understanding
//   - Browser speech recognition
//   - Voice server communication
//   - Text-to-speech
// */

// /* =========================================================
//    CONFIG
// ========================================================= */

// const ASSISTANT_API_URL =
//   String(
//     import.meta.env
//       .VITE_ASSISTANT_API_URL ||
//       "https://grocery-chatbot-api.onrender.com"
//   )
//     .trim()
//     .replace(/\/+$/, "");

// /* =========================================================
//    CONFIG CHECK
// ========================================================= */

// export const isAssistantConfigured =
//   () =>
//     Boolean(
//       ASSISTANT_API_URL
//     );

// /* =========================================================
//    ERROR PARSER
// ========================================================= */

// const parseErrorMessage = async (
//   response,
//   fallbackMessage
// ) => {
//   let data = null;

//   try {
//     data =
//       await response.json();
//   } catch {
//     data = null;
//   }

//   return (
//     data?.text ||
//     data?.detail ||
//     data?.message ||
//     data?.error ||
//     fallbackMessage
//   );
// };

// /* =========================================================
//    SUPABASE ACCESS TOKEN
// ========================================================= */

// const getSupabaseAccessToken =
//   async () => {
//     const session =
//       await getCurrentSession();

//     const accessToken =
//       session?.access_token ||
//       null;

//     if (!accessToken) {
//       throw new Error(
//         "Please sign in before using the AI assistant."
//       );
//     }

//     return accessToken;
//   };

// /* =========================================================
//    JSON REQUEST
// ========================================================= */

// const assistantFetch = async (
//   path,
//   options = {}
// ) => {
//   if (
//     !isAssistantConfigured()
//   ) {
//     throw new Error(
//       "AI Assistant backend is not connected yet."
//     );
//   }

//   const requiresAuth =
//     options.auth !== false;

//   const accessToken =
//     requiresAuth
//       ? await getSupabaseAccessToken()
//       : null;

//   const response =
//     await fetch(
//       `${ASSISTANT_API_URL}${path}`,
//       {
//         method:
//           options.method ||
//           "GET",

//         headers: {
//           ...(options.body
//             ? {
//                 "Content-Type":
//                   "application/json",
//               }
//             : {}),

//           ...(accessToken
//             ? {
//                 Authorization:
//                   `Bearer ${accessToken}`,
//               }
//             : {}),

//           ...(options.headers ||
//             {}),
//         },

//         body:
//           options.body
//             ? JSON.stringify(
//                 options.body
//               )
//             : undefined,
//       }
//     );

//   if (!response.ok) {
//     const message =
//       await parseErrorMessage(
//         response,
//         "Assistant request failed."
//       );

//     throw new Error(
//       message
//     );
//   }

//   const contentType =
//     response.headers.get(
//       "content-type"
//     ) || "";

//   if (
//     contentType.includes(
//       "application/json"
//     )
//   ) {
//     return response.json();
//   }

//   return response;
// };

// /* =========================================================
//    HEALTH CHECK
// ========================================================= */

// export const checkAssistantHealth =
//   async () => {
//     if (
//       !isAssistantConfigured()
//     ) {
//       return {
//         available: false,

//         configured: false,

//         status:
//           "not_configured",
//       };
//     }

//     try {
//       const data =
//         await assistantFetch(
//           "/health",
//           {
//             auth: false,
//           }
//         );

//       return {
//         available: true,

//         configured: true,

//         status:
//           "online",

//         data,
//       };
//     } catch (error) {
//       return {
//         available: false,

//         configured: true,

//         status:
//           "offline",

//         error:
//           error?.message ||
//           "Assistant backend unavailable.",
//       };
//     }
//   };

// /* =========================================================
//    CHAT / RAG
// ========================================================= */

// export const sendAssistantMessage =
//   async ({
//     message,
//     conversationId = null,
//     context = {},
//     locale = "en-IN",
//   } = {}) => {
//     const cleanMessage =
//       String(
//         message || ""
//       ).trim();

//     if (!cleanMessage) {
//       throw new Error(
//         "Message is required."
//       );
//     }

//     const response =
//       await assistantFetch(
//         "/chat",
//         {
//           method: "POST",

//           body: {
//             message:
//               cleanMessage,

//             conversation_id:
//               conversationId,

//             locale:
//               locale,

//             client_context:
//               context || {},
//           },
//         }
//       );

//     return {
//       ...response,

//       message:
//         response?.text ||
//         response?.message ||
//         response?.answer ||
//         response?.response ||
//         "",

//       text:
//         response?.text ||
//         response?.message ||
//         response?.answer ||
//         response?.response ||
//         "",

//       conversationId:
//         response?.conversation_id ||
//         response?.conversationId ||
//         conversationId ||
//         null,

//       clientContext:
//         response?.client_state ||
//         response?.clientContext ||
//         context ||
//         {},

//       responseType:
//         response?.response_type ||
//         response?.responseType ||
//         "text",

//       products:
//         Array.isArray(
//           response?.products
//         )
//           ? response.products
//           : [],

//       alternatives:
//         Array.isArray(
//           response?.alternatives
//         )
//           ? response.alternatives
//           : [],

//       recommendations:
//         Array.isArray(
//           response?.recommendations
//         )
//           ? response.recommendations
//           : [],

//       cart:
//         response?.cart ||
//         null,

//       orders:
//         Array.isArray(
//           response?.orders
//         )
//           ? response.orders
//           : [],

//       latestOrder:
//         response?.latest_order ||
//         response?.latestOrder ||
//         null,

//       action:
//         response?.action ||
//         null,
//     };
//   };

// /* =========================================================
//    PRODUCT QUERY
// ========================================================= */

// export const askProductAssistant =
//   async ({
//     query,
//     limit = 8,
//     filters = {},
//   } = {}) => {
//     const cleanQuery =
//       String(
//         query || ""
//       ).trim();

//     if (!cleanQuery) {
//       return {
//         answer: "",
//         products: [],
//       };
//     }

//     const response =
//       await assistantFetch(
//         "/products/search",
//         {
//           method: "POST",

//           body: {
//             query:
//               cleanQuery,

//             limit:
//               Number(limit),

//             filters:
//               filters || {},
//           },
//         }
//       );

//     return {
//       ...response,

//       answer:
//         response?.answer ||
//         response?.message ||
//         "",

//       products:
//         Array.isArray(
//           response?.products
//         )
//           ? response.products
//           : [],
//     };
//   };

// /* =========================================================
//    SHOPPING COMMAND
// ========================================================= */

// export const interpretShoppingCommand =
//   async ({
//     command,
//     cart = [],
//   } = {}) => {
//     const cleanCommand =
//       String(
//         command || ""
//       ).trim();

//     if (!cleanCommand) {
//       throw new Error(
//         "Shopping command is required."
//       );
//     }

//     const response =
//       await assistantFetch(
//         "/commands/interpret",
//         {
//           method: "POST",

//           body: {
//             command:
//               cleanCommand,

//             cart:
//               Array.isArray(
//                 cart
//               )
//                 ? cart
//                 : [],
//           },
//         }
//       );

//     return {
//       ...response,

//       action:
//         response?.action ||
//         null,

//       productId:
//         response?.product_id ||
//         response?.productId ||
//         null,

//       quantity:
//         response?.quantity ??
//         null,

//       message:
//         response?.message ||
//         "",
//     };
//   };

// /* =========================================================
//    LEGACY SPEECH TO TEXT

//    Retained for compatibility with any existing code that
//    sends an audio Blob/File directly to ASSISTANT_API_URL.
// ========================================================= */

// export const transcribeAudio =
//   async (
//     audioFile
//   ) => {
//     if (!audioFile) {
//       throw new Error(
//         "Audio file is required."
//       );
//     }

//     if (
//       !isAssistantConfigured()
//     ) {
//       throw new Error(
//         "Voice backend is not connected yet."
//       );
//     }

//     const formData =
//       new FormData();

//     formData.append(
//       "audio",
//       audioFile
//     );

//     const response =
//       await fetch(
//         `${ASSISTANT_API_URL}/stt`,
//         {
//           method: "POST",

//           body:
//             formData,
//         }
//       );

//     if (!response.ok) {
//       const message =
//         await parseErrorMessage(
//           response,
//           "Speech recognition failed."
//         );

//       throw new Error(
//         message
//       );
//     }

//     const data =
//       await response.json();

//     return {
//       ...data,

//       text:
//         data?.text ||
//         data?.transcript ||
//         "",
//     };
//   };

// /* =========================================================
//    LEGACY TEXT TO SPEECH
// ========================================================= */

// export const synthesizeSpeech =
//   async ({
//     text,
//     language = "en",
//   } = {}) => {
//     const cleanText =
//       String(
//         text || ""
//       ).trim();

//     if (!cleanText) {
//       throw new Error(
//         "Text is required."
//       );
//     }

//     if (
//       !isAssistantConfigured()
//     ) {
//       throw new Error(
//         "Voice backend is not connected yet."
//       );
//     }

//     const response =
//       await fetch(
//         `${ASSISTANT_API_URL}/tts`,
//         {
//           method: "POST",

//           headers: {
//             "Content-Type":
//               "application/json",
//           },

//           body:
//             JSON.stringify({
//               text:
//                 cleanText,

//               language,
//             }),
//         }
//       );

//     if (!response.ok) {
//       const message =
//         await parseErrorMessage(
//           response,
//           "Speech generation failed."
//         );

//       throw new Error(
//         message
//       );
//     }

//     return response.blob();
//   };

// /* =========================================================
//    CREATE LEGACY PLAYABLE AUDIO URL
// ========================================================= */

// export const createSpeechUrl =
//   async ({
//     text,
//     language = "en",
//   } = {}) => {
//     const blob =
//       await synthesizeSpeech({
//         text,
//         language,
//       });

//     return URL.createObjectURL(
//       blob
//     );
//   };

// /* =========================================================
//    CLEAN AUDIO URL
// ========================================================= */

// export const revokeSpeechUrl =
//   (url) => {
//     if (url) {
//       URL.revokeObjectURL(
//         url
//       );
//     }
//   };

// /* =========================================================
//    PHASE 4 — VOICE INTEGRATION

//    IMPORTANT:
//    - Typed chat uses ASSISTANT_API_URL.
//    - Voice/TTS uses VOICE_API_URL.
//    - Browser microphone capture happens in the browser.
// ========================================================= */

// const VOICE_API_URL =
//   String(
//     import.meta.env
//       .VITE_VOICE_API_URL ||
//       "http://localhost:5000"
//   )
//     .trim()
//     .replace(/\/+$/, "");

// const ASSISTANT_VOICE =
//   String(
//     import.meta.env
//       .VITE_ASSISTANT_VOICE ||
//       "en-IN-NeerjaNeural"
//   ).trim() ||
//   "en-IN-NeerjaNeural";

// const INPUT_LANGUAGE =
//   String(
//     import.meta.env
//       .VITE_INPUT_LANGUAGE ||
//       "en-IN"
//   ).trim() ||
//   "en-IN";

// /* =========================================================
//    VOICE CONFIG CHECK
// ========================================================= */

// export const isVoiceAssistantConfigured =
//   () =>
//     Boolean(
//       VOICE_API_URL
//     );

// /* =========================================================
//    VOICE SERVER REQUEST
// ========================================================= */

// const voiceFetch = async (
//   path,
//   options = {}
// ) => {
//   if (
//     !isVoiceAssistantConfigured()
//   ) {
//     throw new Error(
//       "Voice assistant server is not connected yet."
//     );
//   }

//   const requiresAuth =
//     options.auth === true;

//   const accessToken =
//     requiresAuth
//       ? await getSupabaseAccessToken()
//       : null;

//   const response =
//     await fetch(
//       `${VOICE_API_URL}${path}`,
//       {
//         method:
//           options.method ||
//           "GET",

//         headers: {
//           ...(options.body !== undefined
//             ? {
//                 "Content-Type":
//                   "application/json",
//               }
//             : {}),

//           ...(accessToken
//             ? {
//                 Authorization:
//                   `Bearer ${accessToken}`,
//               }
//             : {}),

//           ...(options.headers ||
//             {}),
//         },

//         body:
//           options.body !== undefined
//             ? JSON.stringify(
//                 options.body
//               )
//             : undefined,
//       }
//     );

//   if (!response.ok) {
//     const message =
//       await parseErrorMessage(
//         response,
//         options.fallbackMessage ||
//           "Voice assistant request failed."
//       );

//     throw new Error(
//       message
//     );
//   }

//   if (
//     options.responseType ===
//     "blob"
//   ) {
//     return response.blob();
//   }

//   if (
//     options.responseType ===
//     "response"
//   ) {
//     return response;
//   }

//   const contentType =
//     response.headers.get(
//       "content-type"
//     ) || "";

//   if (
//     contentType.includes(
//       "application/json"
//     )
//   ) {
//     return response.json();
//   }

//   return response;
// };

// /* =========================================================
//    VOICE SERVER HEALTH CHECK
// ========================================================= */

// export const checkVoiceAssistantHealth =
//   async () => {
//     if (
//       !isVoiceAssistantConfigured()
//     ) {
//       return {
//         available: false,
//         configured: false,
//         status:
//           "not_configured",
//       };
//     }

//     try {
//       const data =
//         await voiceFetch(
//           "/health",
//           {
//             auth: false,
//           }
//         );

//       return {
//         available: true,
//         configured: true,
//         status:
//           "online",
//         data,
//       };
//     } catch (error) {
//       return {
//         available: false,
//         configured: true,
//         status:
//           "offline",
//         error:
//           error?.message ||
//           "Voice assistant server unavailable.",
//       };
//     }
//   };

// /* =========================================================
//    BROWSER SPEECH RECOGNITION SUPPORT
// ========================================================= */

// let activeSpeechRecognition =
//   null;

// /*
//   Once microphone access succeeds, remember that state.

//   We intentionally DO NOT run getUserMedia() before every
//   recognition cycle because it adds startup delay.
// */

// let microphonePermissionGranted =
//   false;

// let microphonePermissionPromise =
//   null;

// export const isBrowserSpeechRecognitionSupported =
//   () => {
//     if (
//       typeof window ===
//       "undefined"
//     ) {
//       return false;
//     }

//     return Boolean(
//       window.SpeechRecognition ||
//       window.webkitSpeechRecognition
//     );
//   };

// /* =========================================================
//    REQUEST MICROPHONE PERMISSION

//    This function is retained for callers that want an
//    explicit permission check.

//    recognizeBrowserSpeech() does not call it by default,
//    allowing recognition to begin immediately.
// ========================================================= */

// export const requestMicrophonePermission =
//   async ({
//     force = false,
//   } = {}) => {
//     if (
//       typeof navigator ===
//         "undefined" ||
//       !navigator.mediaDevices ||
//       !navigator.mediaDevices
//         .getUserMedia
//     ) {
//       throw new Error(
//         "Microphone access is not supported in this browser."
//       );
//     }

//     if (
//       microphonePermissionGranted &&
//       !force
//     ) {
//       return true;
//     }

//     /*
//       Where supported, inspect browser permission state first.

//       This avoids opening a temporary stream when permission
//       is already granted.
//     */

//     if (
//       !force &&
//       navigator.permissions &&
//       typeof navigator.permissions
//         .query === "function"
//     ) {
//       try {
//         const permissionStatus =
//           await navigator.permissions
//             .query({
//               name:
//                 "microphone",
//             });

//         if (
//           permissionStatus?.state ===
//           "granted"
//         ) {
//           microphonePermissionGranted =
//             true;

//           return true;
//         }

//         if (
//           permissionStatus?.state ===
//           "denied"
//         ) {
//           throw new Error(
//             "Microphone permission was denied."
//           );
//         }
//       } catch (error) {
//         /*
//           Safari and some Chromium versions can reject
//           navigator.permissions.query({name:"microphone"}).

//           Ignore unsupported permission-query errors and
//           continue to getUserMedia().
//         */

//         if (
//           error?.message ===
//           "Microphone permission was denied."
//         ) {
//           throw error;
//         }
//       }
//     }

//     /*
//       If a permission request is already in progress,
//       share the same Promise.
//     */

//     if (
//       microphonePermissionPromise &&
//       !force
//     ) {
//       return microphonePermissionPromise;
//     }

//     microphonePermissionPromise =
//       navigator.mediaDevices
//         .getUserMedia({
//           audio: true,
//         })
//         .then((stream) => {
//           /*
//             We only requested the stream to establish
//             microphone permission.

//             SpeechRecognition opens its own microphone.
//           */

//           stream
//             .getTracks()
//             .forEach(
//               (track) =>
//                 track.stop()
//             );

//           microphonePermissionGranted =
//             true;

//           return true;
//         })
//         .catch((error) => {
//           const errorName =
//             String(
//               error?.name || ""
//             );

//           if (
//             errorName ===
//               "NotAllowedError" ||
//             errorName ===
//               "SecurityError"
//           ) {
//             throw new Error(
//               "Microphone permission was denied."
//             );
//           }

//           if (
//             errorName ===
//             "NotFoundError"
//           ) {
//             throw new Error(
//               "No microphone was detected."
//             );
//           }

//           throw error;
//         })
//         .finally(() => {
//           microphonePermissionPromise =
//             null;
//         });

//     return microphonePermissionPromise;
//   };

// /* =========================================================
//    START BROWSER SPEECH RECOGNITION

//    IMPORTANT FLOW:

//    mic click
//       ↓
//    recognition.start() immediately
//       ↓
//    "Listening…"
//       ↓
//    interim transcription
//       ↓
//    final transcript OR short silence
//       ↓
//    recognition.stop()
//       ↓
//    resolve exactly one query
// ========================================================= */

// export const recognizeBrowserSpeech =
//   async ({
//     language =
//       INPUT_LANGUAGE,

//     continuous = false,

//     interimResults = true,

//     /*
//       Maximum amount of time one microphone click may remain
//       active before we force it to stop.
//     */
//     maxListenMs = 12_000,

//     /*
//       If Chrome only gives interim results, stop after this
//       amount of silence after speech was detected.
//     */
//     silenceAfterSpeechMs = 1_100,

//     /*
//       Normally false for speed.

//       Set true only when a caller explicitly wants
//       getUserMedia permission verification first.
//     */
//     preflightPermission = false,

//     onStart = null,
//     onInterim = null,
//     onEnd = null,
//     onError = null,
//   } = {}) => {
//     if (
//       !isBrowserSpeechRecognitionSupported()
//     ) {
//       throw new Error(
//         "Speech recognition is not supported in this browser."
//       );
//     }

//     /*
//       FAST START.

//       Do not wait for getUserMedia before each microphone click.
//       SpeechRecognition itself handles microphone access.
//     */

//     if (
//       preflightPermission
//     ) {
//       await requestMicrophonePermission();
//     }

//     return new Promise(
//       (
//         resolve,
//         reject
//       ) => {
//         const Recognition =
//           window.SpeechRecognition ||
//           window.webkitSpeechRecognition;

//         const recognition =
//           new Recognition();

//         /*
//           Make sure two browser recognizers never stay open
//           simultaneously.
//         */

//         if (
//           activeSpeechRecognition &&
//           activeSpeechRecognition !==
//             recognition
//         ) {
//           try {
//             activeSpeechRecognition
//               .abort();
//           } catch {
//             // Safe browser cleanup only.
//           }
//         }

//         activeSpeechRecognition =
//           recognition;

//         recognition.lang =
//           language ||
//           INPUT_LANGUAGE;

//         recognition.continuous =
//           Boolean(
//             continuous
//           );

//         recognition.interimResults =
//           Boolean(
//             interimResults
//           );

//         recognition.maxAlternatives =
//           1;

//         let finalTranscript =
//           "";

//         /*
//           latestTranscript also contains interim text.

//           This is important because some Chrome versions stop
//           recognition before changing the final interim result
//           to result.isFinal.
//         */

//         let latestTranscript =
//           "";

//         let settled =
//           false;

//         let maxListenTimer =
//           null;

//         let silenceTimer =
//           null;

//         /* -----------------------------------------------------
//            CLEAR TIMERS
//         ----------------------------------------------------- */

//         const clearTimers =
//           () => {
//             if (
//               maxListenTimer
//             ) {
//               window.clearTimeout(
//                 maxListenTimer
//               );

//               maxListenTimer =
//                 null;
//             }

//             if (
//               silenceTimer
//             ) {
//               window.clearTimeout(
//                 silenceTimer
//               );

//               silenceTimer =
//                 null;
//             }
//           };

//         /* -----------------------------------------------------
//            CLEAR ACTIVE RECOGNITION
//         ----------------------------------------------------- */

//         const clearActiveRecognition =
//           () => {
//             if (
//               activeSpeechRecognition ===
//               recognition
//             ) {
//               activeSpeechRecognition =
//                 null;
//             }
//           };

//         /* -----------------------------------------------------
//            RESOLVE
//         ----------------------------------------------------- */

//         const finishResolve = (
//           transcript
//         ) => {
//           if (settled) {
//             return;
//           }

//           settled =
//             true;

//           clearTimers();
//           clearActiveRecognition();

//           const cleanTranscript =
//             String(
//               transcript || ""
//             ).trim();

//           if (!cleanTranscript) {
//             reject(
//               new Error(
//                 "No speech was detected."
//               )
//             );

//             return;
//           }

//           resolve(
//             cleanTranscript
//           );
//         };

//         /* -----------------------------------------------------
//            REJECT
//         ----------------------------------------------------- */

//         const finishReject = (
//           error
//         ) => {
//           if (settled) {
//             return;
//           }

//           settled =
//             true;

//           clearTimers();
//           clearActiveRecognition();

//           const normalizedError =
//             error instanceof Error
//               ? error
//               : new Error(
//                   String(
//                     error ||
//                     "Speech recognition failed."
//                   )
//                 );

//           if (
//             typeof onError ===
//             "function"
//           ) {
//             onError(
//               normalizedError
//             );
//           }

//           reject(
//             normalizedError
//           );
//         };

//         /* -----------------------------------------------------
//            STOP RECOGNITION
//         ----------------------------------------------------- */

//         const stopRecognition =
//           () => {
//             try {
//               recognition.stop();
//             } catch {
//               /*
//                 Browser may already have ended recognition.
//                 onend will complete the Promise.
//               */
//             }
//           };

//         /* -----------------------------------------------------
//            STOP AFTER SHORT SILENCE
//         ----------------------------------------------------- */

//         const scheduleSpeechEnd =
//           () => {
//             if (
//               continuous ||
//               !latestTranscript
//             ) {
//               return;
//             }

//             if (
//               silenceTimer
//             ) {
//               window.clearTimeout(
//                 silenceTimer
//               );
//             }

//             silenceTimer =
//               window.setTimeout(
//                 stopRecognition,

//                 Math.max(
//                   500,

//                   Number(
//                     silenceAfterSpeechMs
//                   ) ||
//                   1_100
//                 )
//               );
//           };

//         /* -----------------------------------------------------
//            START
//         ----------------------------------------------------- */

//         recognition.onstart =
//           () => {
//             /*
//               If recognition actually started, microphone access
//               is working. Cache that status.
//             */

//             microphonePermissionGranted =
//               true;

//             if (
//               typeof onStart ===
//               "function"
//             ) {
//               onStart();
//             }

//             /*
//               One query should never keep the microphone open
//               forever.
//             */

//             if (
//               !continuous &&
//               Number(
//                 maxListenMs
//               ) > 0
//             ) {
//               maxListenTimer =
//                 window.setTimeout(
//                   stopRecognition,

//                   Math.max(
//                     3_000,

//                     Number(
//                       maxListenMs
//                     ) ||
//                     12_000
//                   )
//                 );
//             }
//           };

//         /* -----------------------------------------------------
//            RESULTS
//         ----------------------------------------------------- */

//         recognition.onresult =
//           (event) => {
//             let interimTranscript =
//               "";

//             for (
//               let index =
//                 event.resultIndex;

//               index <
//               event.results.length;

//               index += 1
//             ) {
//               const result =
//                 event.results[
//                   index
//                 ];

//               const transcript =
//                 result?.[0]
//                   ?.transcript ||
//                 "";

//               if (
//                 result.isFinal
//               ) {
//                 finalTranscript +=
//                   `${transcript} `;
//               } else {
//                 interimTranscript +=
//                   `${transcript} `;
//               }
//             }

//             latestTranscript =
//               `${finalTranscript}${interimTranscript}`
//                 .trim();

//             /*
//               Show recognized words immediately in the textarea.
//             */

//             if (
//               latestTranscript &&
//               typeof onInterim ===
//                 "function"
//             ) {
//               onInterim(
//                 latestTranscript
//               );
//             }

//             if (
//               continuous
//             ) {
//               return;
//             }

//             /*
//               Chrome gave us a final result.

//               One query is complete, therefore stop immediately.
//             */

//             if (
//               finalTranscript.trim()
//             ) {
//               if (
//                 silenceTimer
//               ) {
//                 window.clearTimeout(
//                   silenceTimer
//                 );

//                 silenceTimer =
//                   null;
//               }

//               stopRecognition();

//               return;
//             }

//             /*
//               Chrome is still reporting interim text.

//               Stop automatically after a short silence.
//             */

//             scheduleSpeechEnd();
//           };

//         /* -----------------------------------------------------
//            ERROR
//         ----------------------------------------------------- */

//         recognition.onerror =
//           (event) => {
//             const errorCode =
//               String(
//                 event?.error ||
//                 ""
//               ).trim();

//             /*
//               Some browsers fire "aborted" after deliberate
//               stop/abort.

//               If we already captured text, keep that text.
//             */

//             if (
//               errorCode ===
//                 "aborted" &&
//               (
//                 finalTranscript.trim() ||
//                 latestTranscript.trim()
//               )
//             ) {
//               finishResolve(
//                 finalTranscript ||
//                 latestTranscript
//               );

//               return;
//             }

//             let message =
//               "Speech recognition failed.";

//             if (
//               errorCode ===
//                 "not-allowed" ||
//               errorCode ===
//                 "service-not-allowed"
//             ) {
//               microphonePermissionGranted =
//                 false;

//               message =
//                 "Microphone permission was denied.";
//             } else if (
//               errorCode ===
//               "no-speech"
//             ) {
//               message =
//                 "No speech was detected.";
//             } else if (
//               errorCode ===
//               "audio-capture"
//             ) {
//               message =
//                 "No microphone was detected.";
//             } else if (
//               errorCode ===
//               "network"
//             ) {
//               message =
//                 "Speech recognition network error.";
//             } else if (
//               errorCode ===
//               "aborted"
//             ) {
//               message =
//                 "Listening stopped.";
//             }

//             finishReject(
//               new Error(
//                 message
//               )
//             );
//           };

//         /* -----------------------------------------------------
//            END
//         ----------------------------------------------------- */

//         recognition.onend =
//           () => {
//             clearTimers();

//             if (
//               typeof onEnd ===
//               "function"
//             ) {
//               onEnd();
//             }

//             if (settled) {
//               return;
//             }

//             /*
//               Prefer Chrome's final transcript.

//               If only an interim transcript was available before
//               the microphone stopped, preserve it rather than
//               losing the user's query.
//             */

//             finishResolve(
//               finalTranscript.trim() ||
//               latestTranscript.trim()
//             );
//           };

//         /* -----------------------------------------------------
//            START IMMEDIATELY
//         ----------------------------------------------------- */

//         try {
//           recognition.start();
//         } catch (error) {
//           finishReject(
//             error
//           );
//         }
//       }
//     );
//   };

// /* =========================================================
//    STOP ACTIVE BROWSER SPEECH RECOGNITION

//    abort=true is used for a manual user cancellation because
//    abort() stops faster than stop().
// ========================================================= */

// export const stopBrowserSpeechRecognition =
//   ({
//     abort = true,
//   } = {}) => {
//     if (
//       !activeSpeechRecognition
//     ) {
//       return false;
//     }

//     const recognition =
//       activeSpeechRecognition;

//     /*
//       Clear immediately so another microphone click does not
//       need to wait for the previous onend event.
//     */

//     activeSpeechRecognition =
//       null;

//     try {
//       if (
//         abort &&
//         typeof recognition.abort ===
//           "function"
//       ) {
//         recognition.abort();
//       } else {
//         recognition.stop();
//       }

//       return true;
//     } catch {
//       return false;
//     }
//   };

// /* =========================================================
//    SEND BROWSER TRANSCRIPT TO NODE STT SERVICE

//    The actual microphone recording/recognition happens in
//    the user's browser.

//    Endpoint:
//        POST /api/voice/speech-to-text
// ========================================================= */

// export const submitSpeechTranscript =
//   async ({
//     transcript,
//     usePython = false,
//   } = {}) => {
//     const cleanTranscript =
//       String(
//         transcript || ""
//       ).trim();

//     if (
//       !cleanTranscript &&
//       !usePython
//     ) {
//       throw new Error(
//         "Speech transcript is required."
//       );
//     }

//     const response =
//       await voiceFetch(
//         "/api/voice/speech-to-text",
//         {
//           method:
//             "POST",

//           auth: false,

//           body: {
//             transcript:
//               cleanTranscript,

//             usePython:
//               Boolean(
//                 usePython
//               ),
//           },

//           fallbackMessage:
//             "Speech recognition failed.",
//         }
//       );

//     return {
//       ...response,

//       text:
//         response?.text ||
//         response?.transcript ||
//         cleanTranscript ||
//         "",

//       transcript:
//         response?.transcript ||
//         response?.text ||
//         cleanTranscript ||
//         "",
//     };
//   };

// /* =========================================================
//    COMPLETE BROWSER SPEECH TO TEXT

//    This is what AIAssistant.jsx uses.

//    IMPORTANT:
//    continuous/interimResults are now forwarded correctly.
// ========================================================= */

// export const transcribeBrowserSpeech =
//   async ({
//     language =
//       INPUT_LANGUAGE,

//     continuous = false,

//     interimResults = true,

//     maxListenMs = 12_000,

//     silenceAfterSpeechMs = 1_100,

//     preflightPermission = false,

//     useNodeNormalization = true,

//     onStart = null,

//     onInterim = null,

//     onEnd = null,

//     onError = null,
//   } = {}) => {
//     const transcript =
//       await recognizeBrowserSpeech({
//         language,

//         continuous,

//         interimResults,

//         maxListenMs,

//         silenceAfterSpeechMs,

//         preflightPermission,

//         onStart,

//         onInterim,

//         onEnd,

//         onError,
//       });

//     /*
//       Browser speech recognition already provides usable text.

//       We keep your existing Node speechToText.js normalization
//       enabled by default.

//       Set useNodeNormalization=false if you later want to remove
//       this extra localhost request.
//     */

//     if (
//       !useNodeNormalization
//     ) {
//       return {
//         success: true,

//         text:
//           transcript,

//         transcript,

//         source:
//           "browser",
//       };
//     }

//     return submitSpeechTranscript({
//       transcript,
//     });
//   };

// /* =========================================================
//    SEND VOICE TRANSCRIPT TO AI

//    Endpoint:
//        POST /api/voice/chat
// ========================================================= */

// export const sendVoiceAssistantMessage =
//   async ({
//     transcript,
//     message,
//     conversationId = null,
//     context = {},
//     locale =
//       INPUT_LANGUAGE,
//   } = {}) => {
//     const cleanTranscript =
//       String(
//         transcript ||
//         message ||
//         ""
//       ).trim();

//     if (!cleanTranscript) {
//       throw new Error(
//         "Voice transcript is required."
//       );
//     }

//     const response =
//       await voiceFetch(
//         "/api/voice/chat",
//         {
//           method:
//             "POST",

//           auth: true,

//           body: {
//             transcript:
//               cleanTranscript,

//             conversation_id:
//               conversationId,

//             locale:
//               locale ||
//               INPUT_LANGUAGE,

//             client_context:
//               context || {},
//           },

//           fallbackMessage:
//             "Voice assistant request failed.",
//         }
//       );

//     return {
//       ...response,

//       message:
//         response?.text ||
//         response?.message ||
//         response?.answer ||
//         response?.response ||
//         "",

//       text:
//         response?.text ||
//         response?.message ||
//         response?.answer ||
//         response?.response ||
//         "",

//       conversationId:
//         response?.conversation_id ||
//         response?.conversationId ||
//         conversationId ||
//         null,

//       clientContext:
//         response?.client_state ||
//         response?.clientContext ||
//         context ||
//         {},

//       responseType:
//         response?.response_type ||
//         response?.responseType ||
//         "text",

//       products:
//         Array.isArray(
//           response?.products
//         )
//           ? response.products
//           : [],

//       alternatives:
//         Array.isArray(
//           response?.alternatives
//         )
//           ? response.alternatives
//           : [],

//       recommendations:
//         Array.isArray(
//           response?.recommendations
//         )
//           ? response.recommendations
//           : [],

//       cart:
//         response?.cart ||
//         null,

//       orders:
//         Array.isArray(
//           response?.orders
//         )
//           ? response.orders
//           : [],

//       latestOrder:
//         response?.latest_order ||
//         response?.latestOrder ||
//         null,

//       action:
//         response?.action ||
//         null,
//     };
//   };

// /* =========================================================
//    TEXT TO SPEECH — NODE VOICE SERVER

//    Endpoint:
//        POST /api/voice/text-to-speech
// ========================================================= */

// export const synthesizeAssistantSpeech =
//   async ({
//     text,

//     voice =
//       ASSISTANT_VOICE,
//   } = {}) => {
//     const cleanText =
//       String(
//         text || ""
//       ).trim();

//     if (!cleanText) {
//       throw new Error(
//         "Text is required."
//       );
//     }

//     return voiceFetch(
//       "/api/voice/text-to-speech",
//       {
//         method:
//           "POST",

//         auth: false,

//         body: {
//           text:
//             cleanText,

//           voice:
//             voice ||
//             ASSISTANT_VOICE,
//         },

//         responseType:
//           "blob",

//         fallbackMessage:
//           "Speech generation failed.",
//       }
//     );
//   };

// /* =========================================================
//    CREATE PLAYABLE VOICE URL
// ========================================================= */

// export const createAssistantSpeechUrl =
//   async ({
//     text,

//     voice =
//       ASSISTANT_VOICE,
//   } = {}) => {
//     const blob =
//       await synthesizeAssistantSpeech({
//         text,
//         voice,
//       });

//     return URL.createObjectURL(
//       blob
//     );
//   };

// /* =========================================================
//    ASSISTANT AUDIO STATE
// ========================================================= */

// let activeAssistantAudio =
//   null;

// let activeAssistantAudioUrl =
//   null;

// /*
//   Every speech request receives a generation ID.

//   This fixes an important race condition:

//   "I am processing your request"
//            ↓
//   TTS generation is still running
//            ↓
//   actual backend response arrives
//            ↓
//   final TTS starts
//            ↓
//   OLD processing MP3 must NOT start later
// */

// let assistantSpeechRequestId =
//   0;

// /* =========================================================
//    STOP ASSISTANT SPEECH

//    This can cancel:
//    - currently playing audio
//    - a TTS request that is still being generated
// ========================================================= */

// export const stopAssistantSpeechPlayback =
//   () => {
//     /*
//       Invalidate pending TTS generation.
//     */

//     assistantSpeechRequestId +=
//       1;

//     const audio =
//       activeAssistantAudio;

//     activeAssistantAudio =
//       null;

//     if (audio) {
//       try {
//         audio.onplay =
//           null;

//         audio.onended =
//           null;

//         audio.onerror =
//           null;

//         audio.onpause =
//           null;

//         audio.pause();

//         audio.currentTime =
//           0;
//       } catch {
//         // Browser audio cleanup only.
//       }
//     }

//     if (
//       activeAssistantAudioUrl
//     ) {
//       try {
//         URL.revokeObjectURL(
//           activeAssistantAudioUrl
//         );
//       } catch {
//         // Object URL cleanup only.
//       }

//       activeAssistantAudioUrl =
//         null;
//     }

//     return Boolean(
//       audio
//     );
//   };

// /* =========================================================
//    PLAY ASSISTANT SPEECH

//    Prevents old audio from overlapping newer audio.
// ========================================================= */

// export const playAssistantSpeech =
//   async ({
//     text,

//     voice =
//       ASSISTANT_VOICE,

//     onStart = null,

//     onEnd = null,

//     onError = null,
//   } = {}) => {
//     const cleanText =
//       String(
//         text || ""
//       ).trim();

//     if (!cleanText) {
//       throw new Error(
//         "Text is required."
//       );
//     }

//     /*
//       A new request automatically invalidates any old
//       TTS generation still running.
//     */

//     const requestId =
//       assistantSpeechRequestId +
//       1;

//     assistantSpeechRequestId =
//       requestId;

//     /*
//       Generate MP3 using the Node/Python TTS server.
//     */

//     const audioUrl =
//       await createAssistantSpeechUrl({
//         text:
//           cleanText,

//         voice,
//       });

//     /*
//       If another speech request started while this MP3 was
//       being generated, this MP3 is stale.

//       Never play it.
//     */

//     if (
//       requestId !==
//       assistantSpeechRequestId
//     ) {
//       URL.revokeObjectURL(
//         audioUrl
//       );

//       return null;
//     }

//     /*
//       Stop old browser audio before starting new audio.
//     */

//     if (
//       activeAssistantAudio
//     ) {
//       try {
//         activeAssistantAudio
//           .pause();

//         activeAssistantAudio
//           .currentTime = 0;
//       } catch {
//         // Existing audio cleanup only.
//       }
//     }

//     if (
//       activeAssistantAudioUrl
//     ) {
//       try {
//         URL.revokeObjectURL(
//           activeAssistantAudioUrl
//         );
//       } catch {
//         // Existing URL cleanup only.
//       }
//     }

//     const audio =
//       new Audio(
//         audioUrl
//       );

//     activeAssistantAudio =
//       audio;

//     activeAssistantAudioUrl =
//       audioUrl;

//     let cleanedUp =
//       false;

//     /* ---------------------------------------------------------
//        CLEANUP
//     --------------------------------------------------------- */

//     const cleanup =
//       () => {
//         if (cleanedUp) {
//           return;
//         }

//         cleanedUp =
//           true;

//         if (
//           activeAssistantAudio ===
//           audio
//         ) {
//           activeAssistantAudio =
//             null;
//         }

//         if (
//           activeAssistantAudioUrl ===
//           audioUrl
//         ) {
//           activeAssistantAudioUrl =
//             null;
//         }

//         try {
//           URL.revokeObjectURL(
//             audioUrl
//           );
//         } catch {
//           // Object URL cleanup only.
//         }
//       };

//     /* ---------------------------------------------------------
//        PLAY
//     --------------------------------------------------------- */

//     audio.onplay =
//       () => {
//         /*
//           Never allow stale audio to speak.
//         */

//         if (
//           requestId !==
//           assistantSpeechRequestId
//         ) {
//           try {
//             audio.pause();
//           } catch {
//             // Stale playback cleanup only.
//           }

//           cleanup();

//           return;
//         }

//         if (
//           typeof onStart ===
//           "function"
//         ) {
//           onStart();
//         }
//       };

//     /* ---------------------------------------------------------
//        ENDED
//     --------------------------------------------------------- */

//     audio.onended =
//       () => {
//         cleanup();

//         if (
//           requestId !==
//           assistantSpeechRequestId
//         ) {
//           return;
//         }

//         if (
//           typeof onEnd ===
//           "function"
//         ) {
//           onEnd();
//         }
//       };

//     /* ---------------------------------------------------------
//        ERROR
//     --------------------------------------------------------- */

//     audio.onerror =
//       () => {
//         cleanup();

//         if (
//           requestId !==
//           assistantSpeechRequestId
//         ) {
//           return;
//         }

//         const error =
//           new Error(
//             "Unable to play assistant speech."
//           );

//         if (
//           typeof onError ===
//           "function"
//         ) {
//           onError(
//             error
//           );
//         }
//       };

//     /* ---------------------------------------------------------
//        MANUAL PAUSE
//     --------------------------------------------------------- */

//     audio.onpause =
//       () => {
//         /*
//           A deliberate pause from AIAssistant.jsx should release
//           the Blob URL immediately.
//         */

//         if (
//           !audio.ended
//         ) {
//           cleanup();
//         }
//       };

//     /* ---------------------------------------------------------
//        BEGIN PLAYBACK
//     --------------------------------------------------------- */

//     try {
//       await audio.play();
//     } catch (error) {
//       cleanup();

//       /*
//         If this became stale while play() was starting,
//         silently ignore it.
//       */

//       if (
//         requestId !==
//         assistantSpeechRequestId
//       ) {
//         return null;
//       }

//       throw error;
//     }

//     return audio;
//   };

// /* =========================================================
//    VOICE CONFIGURATION
// ========================================================= */

// export const getVoiceAssistantConfig =
//   () => ({
//     apiUrl:
//       VOICE_API_URL,

//     voice:
//       ASSISTANT_VOICE,

//     inputLanguage:
//       INPUT_LANGUAGE,

//     speechRecognitionSupported:
//       isBrowserSpeechRecognitionSupported(),
//   });






















// import {
//   getCurrentSession,
// } from "./authApi";

// /*
//   assistantApi.js

//   Grocery Voice Shopping Assistant

//   This file will connect the React frontend to the
//   future AI / RAG / Voice backend.

//   Future backend responsibilities:
//   - Grocery product discovery
//   - Natural-language product search
//   - Product recommendations
//   - Shopping/cart command understanding
//   - Speech-to-text
//   - Text-to-speech

//   The backend will be connected later, so this API is
//   written in a way that does NOT break the frontend
//   while the backend URL is still missing.
// */

// /* =========================================================
//    CONFIG
// ========================================================= */

// const ASSISTANT_API_URL =
//   String(
//     import.meta.env
//       .VITE_ASSISTANT_API_URL ||
//       "https://grocery-chatbot-api.onrender.com"
//   )
//     .trim()
//     .replace(/\/+$/, "");

// /* =========================================================
//    CONFIG CHECK
// ========================================================= */

// export const isAssistantConfigured =
//   () =>
//     Boolean(
//       ASSISTANT_API_URL
//     );

// /* =========================================================
//    ERROR PARSER
// ========================================================= */

// const parseErrorMessage = async (
//   response,
//   fallbackMessage
// ) => {
//   let data = null;

//   try {
//     data =
//       await response.json();
//   } catch {
//     data = null;
//   }

//   return (
//     data?.text ||
//     data?.detail ||
//     data?.message ||
//     data?.error ||
//     fallbackMessage
//   );
// };

// /* =========================================================
//    CLIENT CONTEXT NORMALIZATION

//    Backend state can appear in:

//    response.client_state
//    response.clientContext
//    response.metadata.client_state
//    response.metadata.clientContext

//    We prefer whichever actually contains useful context.

//    This is important for flows like:

//    "show maggi"
//         ↓
//    "32g"
//         ↓
//    "add to cart"

//    so the final short command does not forget the previously
//    selected product / variant.
// ========================================================= */

// const hasObjectKeys = (value) =>
//   Boolean(
//     value &&
//       typeof value === "object" &&
//       !Array.isArray(value) &&
//       Object.keys(value).length > 0
//   );

// const hasUsefulClientState = (
//   value
// ) => {
//   if (
//     !value ||
//     typeof value !== "object" ||
//     Array.isArray(value)
//   ) {
//     return false;
//   }

//   if (
//     Array.isArray(
//       value.chat_history
//     ) &&
//     value.chat_history.length >
//       0
//   ) {
//     return true;
//   }

//   if (
//     Array.isArray(
//       value.chatHistory
//     ) &&
//     value.chatHistory.length >
//       0
//   ) {
//     return true;
//   }

//   if (
//     hasObjectKeys(
//       value.conversation_context
//     ) ||
//     hasObjectKeys(
//       value.conversationContext
//     )
//   ) {
//     return true;
//   }

//   if (
//     value.last_product_context !=
//       null ||
//     value.lastProductContext !=
//       null
//   ) {
//     return true;
//   }

//   if (
//     value.pending_action !=
//       null ||
//     value.pendingAction !=
//       null
//   ) {
//     return true;
//   }

//   if (
//     value.selected_product !=
//       null ||
//     value.selectedProduct !=
//       null ||
//     value.selected_variant !=
//       null ||
//     value.selectedVariant !=
//       null
//   ) {
//     return true;
//   }

//   return Boolean(
//     value.conversation_id ||
//       value.conversationId
//   );
// };

// const resolveClientContext = (
//   response,
//   fallbackContext = {}
// ) => {
//   const candidates = [
//     response?.metadata
//       ?.client_state,

//     response?.metadata
//       ?.clientContext,

//     response?.client_state,

//     response?.clientContext,
//   ];

//   const usefulCandidate =
//     candidates.find(
//       hasUsefulClientState
//     );

//   if (
//     usefulCandidate
//   ) {
//     return usefulCandidate;
//   }

//   const objectCandidate =
//     candidates.find(
//       (
//         candidate
//       ) =>
//         candidate &&
//         typeof candidate ===
//           "object" &&
//         !Array.isArray(
//           candidate
//         )
//     );

//   if (
//     objectCandidate
//   ) {
//     return objectCandidate;
//   }

//   return (
//     fallbackContext &&
//     typeof fallbackContext ===
//       "object" &&
//     !Array.isArray(
//       fallbackContext
//     )
//       ? fallbackContext
//       : {}
//   );
// };

// /* =========================================================
//    SUPABASE ACCESS TOKEN
// ========================================================= */

// const getSupabaseAccessToken =
//   async () => {
//     const session =
//       await getCurrentSession();

//     const accessToken =
//       session?.access_token ||
//       null;

//     if (
//       !accessToken
//     ) {
//       throw new Error(
//         "Please sign in before using the AI assistant."
//       );
//     }

//     return accessToken;
//   };

// /* =========================================================
//    JSON REQUEST
// ========================================================= */

// const assistantFetch = async (
//   path,
//   options = {}
// ) => {
//   if (
//     !isAssistantConfigured()
//   ) {
//     throw new Error(
//       "AI Assistant backend is not connected yet."
//     );
//   }

//   const requiresAuth =
//     options.auth !== false;

//   const accessToken =
//     requiresAuth
//       ? await getSupabaseAccessToken()
//       : null;

//   const response =
//     await fetch(
//       `${ASSISTANT_API_URL}${path}`,
//       {
//         method:
//           options.method ||
//           "GET",

//         headers: {
//           ...(options.body
//             ? {
//                 "Content-Type":
//                   "application/json",
//               }
//             : {}),

//           ...(accessToken
//             ? {
//                 Authorization:
//                   `Bearer ${accessToken}`,
//               }
//             : {}),

//           ...(options.headers ||
//             {}),
//         },

//         body:
//           options.body
//             ? JSON.stringify(
//                 options.body
//               )
//             : undefined,
//       }
//     );

//   if (
//     !response.ok
//   ) {
//     const message =
//       await parseErrorMessage(
//         response,
//         "Assistant request failed."
//       );

//     throw new Error(
//       message
//     );
//   }

//   const contentType =
//     response.headers.get(
//       "content-type"
//     ) || "";

//   if (
//     contentType.includes(
//       "application/json"
//     )
//   ) {
//     return response.json();
//   }

//   return response;
// };

// /* =========================================================
//    HEALTH CHECK
// ========================================================= */

// export const checkAssistantHealth =
//   async () => {
//     if (
//       !isAssistantConfigured()
//     ) {
//       return {
//         available:
//           false,

//         configured:
//           false,

//         status:
//           "not_configured",
//       };
//     }

//     try {
//       const data =
//         await assistantFetch(
//           "/health",
//           {
//             auth:
//               false,
//           }
//         );

//       return {
//         available:
//           true,

//         configured:
//           true,

//         status:
//           "online",

//         data,
//       };
//     } catch (
//       error
//     ) {
//       return {
//         available:
//           false,

//         configured:
//           true,

//         status:
//           "offline",

//         error:
//           error?.message ||
//           "Assistant backend unavailable.",
//       };
//     }
//   };

// /* =========================================================
//    CHAT / RAG
// ========================================================= */

// export const sendAssistantMessage =
//   async ({
//     message,
//     conversationId = null,
//     context = {},
//     locale = "en-IN",
//   } = {}) => {
//     const cleanMessage =
//       String(
//         message ||
//           ""
//       ).trim();

//     if (
//       !cleanMessage
//     ) {
//       throw new Error(
//         "Message is required."
//       );
//     }

//     const response =
//       await assistantFetch(
//         "/chat",
//         {
//           method:
//             "POST",

//           body: {
//             message:
//               cleanMessage,

//             conversation_id:
//               conversationId,

//             locale,

//             client_context:
//               context ||
//               {},
//           },
//         }
//       );

//     return {
//       ...response,

//       message:
//         response?.text ||
//         response?.message ||
//         response?.answer ||
//         response?.response ||
//         "",

//       text:
//         response?.text ||
//         response?.message ||
//         response?.answer ||
//         response?.response ||
//         "",

//       conversationId:
//         response
//           ?.conversation_id ||
//         response
//           ?.conversationId ||
//         conversationId ||
//         null,

//       clientContext:
//         resolveClientContext(
//           response,
//           context
//         ),

//       responseType:
//         response
//           ?.response_type ||
//         response
//           ?.responseType ||
//         "text",

//       products:
//         Array.isArray(
//           response?.products
//         )
//           ? response.products
//           : [],

//       alternatives:
//         Array.isArray(
//           response
//             ?.alternatives
//         )
//           ? response.alternatives
//           : [],

//       recommendations:
//         Array.isArray(
//           response
//             ?.recommendations
//         )
//           ? response.recommendations
//           : [],

//       cart:
//         response?.cart ||
//         null,

//       orders:
//         Array.isArray(
//           response?.orders
//         )
//           ? response.orders
//           : [],

//       latestOrder:
//         response
//           ?.latest_order ||
//         response
//           ?.latestOrder ||
//         null,

//       action:
//         response?.action ||
//         null,
//     };
//   };

// /* =========================================================
//    PRODUCT QUERY
// ========================================================= */

// export const askProductAssistant =
//   async ({
//     query,
//     limit = 8,
//     filters = {},
//   } = {}) => {
//     const cleanQuery =
//       String(
//         query ||
//           ""
//       ).trim();

//     if (
//       !cleanQuery
//     ) {
//       return {
//         answer:
//           "",

//         products:
//           [],
//       };
//     }

//     const response =
//       await assistantFetch(
//         "/products/search",
//         {
//           method:
//             "POST",

//           body: {
//             query:
//               cleanQuery,

//             limit:
//               Number(
//                 limit
//               ),

//             filters:
//               filters ||
//               {},
//           },
//         }
//       );

//     return {
//       ...response,

//       answer:
//         response?.answer ||
//         response?.message ||
//         "",

//       products:
//         Array.isArray(
//           response?.products
//         )
//           ? response.products
//           : [],
//     };
//   };

// /* =========================================================
//    SHOPPING COMMAND
// ========================================================= */

// export const interpretShoppingCommand =
//   async ({
//     command,
//     cart = [],
//   } = {}) => {
//     const cleanCommand =
//       String(
//         command ||
//           ""
//       ).trim();

//     if (
//       !cleanCommand
//     ) {
//       throw new Error(
//         "Shopping command is required."
//       );
//     }

//     const response =
//       await assistantFetch(
//         "/commands/interpret",
//         {
//           method:
//             "POST",

//           body: {
//             command:
//               cleanCommand,

//             cart:
//               Array.isArray(
//                 cart
//               )
//                 ? cart
//                 : [],
//           },
//         }
//       );

//     return {
//       ...response,

//       action:
//         response?.action ||
//         null,

//       productId:
//         response
//           ?.product_id ||
//         response
//           ?.productId ||
//         null,

//       quantity:
//         response
//           ?.quantity ??
//         null,

//       message:
//         response?.message ||
//         "",
//     };
//   };

// /* =========================================================
//    SPEECH TO TEXT
// ========================================================= */

// export const transcribeAudio =
//   async (
//     audioFile
//   ) => {
//     if (
//       !audioFile
//     ) {
//       throw new Error(
//         "Audio file is required."
//       );
//     }

//     if (
//       !isAssistantConfigured()
//     ) {
//       throw new Error(
//         "Voice backend is not connected yet."
//       );
//     }

//     const formData =
//       new FormData();

//     formData.append(
//       "audio",
//       audioFile
//     );

//     const response =
//       await fetch(
//         `${ASSISTANT_API_URL}/stt`,
//         {
//           method:
//             "POST",

//           body:
//             formData,
//         }
//       );

//     if (
//       !response.ok
//     ) {
//       const message =
//         await parseErrorMessage(
//           response,
//           "Speech recognition failed."
//         );

//       throw new Error(
//         message
//       );
//     }

//     const data =
//       await response.json();

//     return {
//       ...data,

//       text:
//         data?.text ||
//         data?.transcript ||
//         "",
//     };
//   };

// /* =========================================================
//    TEXT TO SPEECH
// ========================================================= */

// export const synthesizeSpeech =
//   async ({
//     text,
//     language = "en",
//   } = {}) => {
//     const cleanText =
//       String(
//         text ||
//           ""
//       ).trim();

//     if (
//       !cleanText
//     ) {
//       throw new Error(
//         "Text is required."
//       );
//     }

//     if (
//       !isAssistantConfigured()
//     ) {
//       throw new Error(
//         "Voice backend is not connected yet."
//       );
//     }

//     const response =
//       await fetch(
//         `${ASSISTANT_API_URL}/tts`,
//         {
//           method:
//             "POST",

//           headers: {
//             "Content-Type":
//               "application/json",
//           },

//           body:
//             JSON.stringify({
//               text:
//                 cleanText,

//               language,
//             }),
//         }
//       );

//     if (
//       !response.ok
//     ) {
//       const message =
//         await parseErrorMessage(
//           response,
//           "Speech generation failed."
//         );

//       throw new Error(
//         message
//       );
//     }

//     return response.blob();
//   };

// /* =========================================================
//    CREATE PLAYABLE AUDIO URL
// ========================================================= */

// export const createSpeechUrl =
//   async ({
//     text,
//     language = "en",
//   } = {}) => {
//     const blob =
//       await synthesizeSpeech({
//         text,
//         language,
//       });

//     return URL.createObjectURL(
//       blob
//     );
//   };

// /* =========================================================
//    CLEAN AUDIO URL
// ========================================================= */

// export const revokeSpeechUrl =
//   (
//     url
//   ) => {
//     if (
//       url
//     ) {
//       URL.revokeObjectURL(
//         url
//       );
//     }
//   };

// /* =========================================================
//    PHASE 4 — VOICE INTEGRATION
// ========================================================= */

// const VOICE_API_URL =
//   String(
//     import.meta.env
//       .VITE_VOICE_API_URL ||
//       "http://localhost:5000"
//   )
//     .trim()
//     .replace(/\/+$/, "");

// const ASSISTANT_VOICE =
//   String(
//     import.meta.env
//       .VITE_ASSISTANT_VOICE ||
//       "en-IN-NeerjaNeural"
//   ).trim() ||
//   "en-IN-NeerjaNeural";

// const INPUT_LANGUAGE =
//   String(
//     import.meta.env
//       .VITE_INPUT_LANGUAGE ||
//       "en-IN"
//   ).trim() ||
//   "en-IN";

// /* =========================================================
//    VOICE CONFIG CHECK
// ========================================================= */

// export const isVoiceAssistantConfigured =
//   () =>
//     Boolean(
//       VOICE_API_URL
//     );

// /* =========================================================
//    VOICE SERVER REQUEST
// ========================================================= */

// const voiceFetch = async (
//   path,
//   options = {}
// ) => {
//   if (
//     !isVoiceAssistantConfigured()
//   ) {
//     throw new Error(
//       "Voice assistant server is not connected yet."
//     );
//   }

//   const requiresAuth =
//     options.auth ===
//     true;

//   const accessToken =
//     requiresAuth
//       ? await getSupabaseAccessToken()
//       : null;

//   const response =
//     await fetch(
//       `${VOICE_API_URL}${path}`,
//       {
//         method:
//           options.method ||
//           "GET",

//         headers: {
//           ...(options.body !==
//           undefined
//             ? {
//                 "Content-Type":
//                   "application/json",
//               }
//             : {}),

//           ...(accessToken
//             ? {
//                 Authorization:
//                   `Bearer ${accessToken}`,
//               }
//             : {}),

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

//   if (
//     !response.ok
//   ) {
//     const message =
//       await parseErrorMessage(
//         response,
//         options
//           .fallbackMessage ||
//           "Voice assistant request failed."
//       );

//     throw new Error(
//       message
//     );
//   }

//   if (
//     options.responseType ===
//     "blob"
//   ) {
//     return response.blob();
//   }

//   if (
//     options.responseType ===
//     "response"
//   ) {
//     return response;
//   }

//   const contentType =
//     response.headers.get(
//       "content-type"
//     ) || "";

//   if (
//     contentType.includes(
//       "application/json"
//     )
//   ) {
//     return response.json();
//   }

//   return response;
// };

// /* =========================================================
//    VOICE SERVER HEALTH CHECK
// ========================================================= */

// export const checkVoiceAssistantHealth =
//   async () => {
//     if (
//       !isVoiceAssistantConfigured()
//     ) {
//       return {
//         available:
//           false,

//         configured:
//           false,

//         status:
//           "not_configured",
//       };
//     }

//     try {
//       const data =
//         await voiceFetch(
//           "/health",
//           {
//             auth:
//               false,
//           }
//         );

//       return {
//         available:
//           true,

//         configured:
//           true,

//         status:
//           "online",

//         data,
//       };
//     } catch (
//       error
//     ) {
//       return {
//         available:
//           false,

//         configured:
//           true,

//         status:
//           "offline",

//         error:
//           error?.message ||
//           "Voice assistant server unavailable.",
//       };
//     }
//   };

// /* =========================================================
//    BROWSER SPEECH RECOGNITION SUPPORT
// ========================================================= */

// let activeSpeechRecognition =
//   null;

// export const isBrowserSpeechRecognitionSupported =
//   () => {
//     if (
//       typeof window ===
//       "undefined"
//     ) {
//       return false;
//     }

//     return Boolean(
//       window
//         .SpeechRecognition ||
//       window
//         .webkitSpeechRecognition
//     );
//   };

// /* =========================================================
//    REQUEST MICROPHONE PERMISSION
// ========================================================= */

// export const requestMicrophonePermission =
//   async () => {
//     if (
//       typeof navigator ===
//         "undefined" ||
//       !navigator.mediaDevices ||
//       !navigator.mediaDevices
//         .getUserMedia
//     ) {
//       throw new Error(
//         "Microphone access is not supported in this browser."
//       );
//     }

//     const stream =
//       await navigator
//         .mediaDevices
//         .getUserMedia({
//           audio:
//             true,
//         });

//     stream
//       .getTracks()
//       .forEach(
//         (
//           track
//         ) =>
//           track.stop()
//       );

//     return true;
//   };

// /* =========================================================
//    START BROWSER SPEECH RECOGNITION
// ========================================================= */

// export const recognizeBrowserSpeech =
//   async ({
//     language =
//       INPUT_LANGUAGE,

//     continuous =
//       false,

//     interimResults =
//       true,

//     onStart =
//       null,

//     onInterim =
//       null,

//     onEnd =
//       null,

//     onError =
//       null,
//   } = {}) => {
//     if (
//       !isBrowserSpeechRecognitionSupported()
//     ) {
//       throw new Error(
//         "Speech recognition is not supported in this browser."
//       );
//     }

//     await requestMicrophonePermission();

//     return new Promise(
//       (
//         resolve,
//         reject
//       ) => {
//         const Recognition =
//           window
//             .SpeechRecognition ||
//           window
//             .webkitSpeechRecognition;

//         const recognition =
//           new Recognition();

//         activeSpeechRecognition =
//           recognition;

//         recognition.lang =
//           language ||
//           INPUT_LANGUAGE;

//         recognition.continuous =
//           Boolean(
//             continuous
//           );

//         recognition.interimResults =
//           Boolean(
//             interimResults
//           );

//         recognition.maxAlternatives =
//           1;

//         let finalTranscript =
//           "";

//         let settled =
//           false;

//         const finishResolve =
//           (
//             transcript
//           ) => {
//             if (
//               settled
//             ) {
//               return;
//             }

//             settled =
//               true;

//             activeSpeechRecognition =
//               null;

//             const cleanTranscript =
//               String(
//                 transcript ||
//                   ""
//               ).trim();

//             if (
//               !cleanTranscript
//             ) {
//               reject(
//                 new Error(
//                   "No speech was detected."
//                 )
//               );

//               return;
//             }

//             resolve(
//               cleanTranscript
//             );
//           };

//         const finishReject =
//           (
//             error
//           ) => {
//             if (
//               settled
//             ) {
//               return;
//             }

//             settled =
//               true;

//             activeSpeechRecognition =
//               null;

//             const normalizedError =
//               error instanceof
//               Error
//                 ? error
//                 : new Error(
//                     String(
//                       error ||
//                         "Speech recognition failed."
//                     )
//                   );

//             if (
//               typeof onError ===
//               "function"
//             ) {
//               onError(
//                 normalizedError
//               );
//             }

//             reject(
//               normalizedError
//             );
//           };

//         recognition.onstart =
//           () => {
//             if (
//               typeof onStart ===
//               "function"
//             ) {
//               onStart();
//             }
//           };

//         recognition.onresult =
//           (
//             event
//           ) => {
//             let interimTranscript =
//               "";

//             for (
//               let index =
//                 event.resultIndex;
//               index <
//               event.results
//                 .length;
//               index +=
//               1
//             ) {
//               const result =
//                 event.results[
//                   index
//                 ];

//               const transcript =
//                 result?.[0]
//                   ?.transcript ||
//                 "";

//               if (
//                 result.isFinal
//               ) {
//                 finalTranscript +=
//                   `${transcript} `;
//               } else {
//                 interimTranscript +=
//                   `${transcript} `;
//               }
//             }

//             const visibleTranscript =
//               `${finalTranscript}${interimTranscript}`
//                 .trim();

//             if (
//               visibleTranscript &&
//               typeof onInterim ===
//                 "function"
//             ) {
//               onInterim(
//                 visibleTranscript
//               );
//             }

//             if (
//               !continuous &&
//               finalTranscript.trim()
//             ) {
//               try {
//                 recognition.stop();
//               } catch {
//                 // safe cleanup
//               }
//             }
//           };

//         recognition.onerror =
//           (
//             event
//           ) => {
//             const errorCode =
//               String(
//                 event?.error ||
//                   ""
//               ).trim();

//             let message =
//               "Speech recognition failed.";

//             if (
//               errorCode ===
//                 "not-allowed" ||
//               errorCode ===
//                 "service-not-allowed"
//             ) {
//               message =
//                 "Microphone permission was denied.";
//             } else if (
//               errorCode ===
//               "no-speech"
//             ) {
//               message =
//                 "No speech was detected.";
//             } else if (
//               errorCode ===
//               "audio-capture"
//             ) {
//               message =
//                 "No microphone was detected.";
//             } else if (
//               errorCode ===
//               "network"
//             ) {
//               message =
//                 "Speech recognition network error.";
//             }

//             finishReject(
//               new Error(
//                 message
//               )
//             );
//           };

//         recognition.onend =
//           () => {
//             if (
//               typeof onEnd ===
//               "function"
//             ) {
//               onEnd();
//             }

//             if (
//               settled
//             ) {
//               return;
//             }

//             finishResolve(
//               finalTranscript
//             );
//           };

//         try {
//           recognition.start();
//         } catch (
//           error
//         ) {
//           finishReject(
//             error
//           );
//         }
//       }
//     );
//   };

// /* =========================================================
//    STOP ACTIVE BROWSER SPEECH RECOGNITION
// ========================================================= */

// export const stopBrowserSpeechRecognition =
//   () => {
//     if (
//       !activeSpeechRecognition
//     ) {
//       return false;
//     }

//     try {
//       activeSpeechRecognition.stop();

//       return true;
//     } catch {
//       activeSpeechRecognition =
//         null;

//       return false;
//     }
//   };

// /* =========================================================
//    SEND BROWSER TRANSCRIPT TO NODE STT
// ========================================================= */

// export const submitSpeechTranscript =
//   async ({
//     transcript,
//     usePython = false,
//   } = {}) => {
//     const cleanTranscript =
//       String(
//         transcript ||
//           ""
//       ).trim();

//     if (
//       !cleanTranscript &&
//       !usePython
//     ) {
//       throw new Error(
//         "Speech transcript is required."
//       );
//     }

//     const response =
//       await voiceFetch(
//         "/api/voice/speech-to-text",
//         {
//           method:
//             "POST",

//           auth:
//             false,

//           body: {
//             transcript:
//               cleanTranscript,

//             usePython:
//               Boolean(
//                 usePython
//               ),
//           },

//           fallbackMessage:
//             "Speech recognition failed.",
//         }
//       );

//     return {
//       ...response,

//       text:
//         response?.text ||
//         response?.transcript ||
//         cleanTranscript ||
//         "",

//       transcript:
//         response
//           ?.transcript ||
//         response?.text ||
//         cleanTranscript ||
//         "",
//     };
//   };

// /* =========================================================
//    COMPLETE BROWSER SPEECH-TO-TEXT
// ========================================================= */

// export const transcribeBrowserSpeech =
//   async ({
//     language =
//       INPUT_LANGUAGE,

//     onStart =
//       null,

//     onInterim =
//       null,

//     onEnd =
//       null,

//     onError =
//       null,
//   } = {}) => {
//     const transcript =
//       await recognizeBrowserSpeech({
//         language,
//         onStart,
//         onInterim,
//         onEnd,
//         onError,
//       });

//     return submitSpeechTranscript({
//       transcript,
//     });
//   };

// /* =========================================================
//    SEND VOICE TRANSCRIPT TO AI
// ========================================================= */

// export const sendVoiceAssistantMessage =
//   async ({
//     transcript,
//     message,
//     conversationId = null,
//     context = {},
//     locale =
//       INPUT_LANGUAGE,
//   } = {}) => {
//     const cleanTranscript =
//       String(
//         transcript ||
//           message ||
//           ""
//       ).trim();

//     if (
//       !cleanTranscript
//     ) {
//       throw new Error(
//         "Voice transcript is required."
//       );
//     }

//     const response =
//       await voiceFetch(
//         "/api/voice/chat",
//         {
//           method:
//             "POST",

//           auth:
//             true,

//           body: {
//             transcript:
//               cleanTranscript,

//             conversation_id:
//               conversationId,

//             locale:
//               locale ||
//               INPUT_LANGUAGE,

//             client_context:
//               context ||
//               {},
//           },

//           fallbackMessage:
//             "Voice assistant request failed.",
//         }
//       );

//     return {
//       ...response,

//       message:
//         response?.text ||
//         response?.message ||
//         response?.answer ||
//         response?.response ||
//         "",

//       text:
//         response?.text ||
//         response?.message ||
//         response?.answer ||
//         response?.response ||
//         "",

//       conversationId:
//         response
//           ?.conversation_id ||
//         response
//           ?.conversationId ||
//         conversationId ||
//         null,

//       clientContext:
//         resolveClientContext(
//           response,
//           context
//         ),

//       responseType:
//         response
//           ?.response_type ||
//         response
//           ?.responseType ||
//         "text",

//       products:
//         Array.isArray(
//           response?.products
//         )
//           ? response.products
//           : [],

//       alternatives:
//         Array.isArray(
//           response
//             ?.alternatives
//         )
//           ? response.alternatives
//           : [],

//       recommendations:
//         Array.isArray(
//           response
//             ?.recommendations
//         )
//           ? response.recommendations
//           : [],

//       cart:
//         response?.cart ||
//         null,

//       orders:
//         Array.isArray(
//           response?.orders
//         )
//           ? response.orders
//           : [],

//       latestOrder:
//         response
//           ?.latest_order ||
//         response
//           ?.latestOrder ||
//         null,

//       action:
//         response?.action ||
//         null,
//     };
//   };

// /* =========================================================
//    TEXT TO SPEECH — NODE VOICE SERVER
// ========================================================= */

// export const synthesizeAssistantSpeech =
//   async ({
//     text,
//     voice =
//       ASSISTANT_VOICE,
//   } = {}) => {
//     const cleanText =
//       String(
//         text ||
//           ""
//       ).trim();

//     if (
//       !cleanText
//     ) {
//       throw new Error(
//         "Text is required."
//       );
//     }

//     return voiceFetch(
//       "/api/voice/text-to-speech",
//       {
//         method:
//           "POST",

//         auth:
//           false,

//         body: {
//           text:
//             cleanText,

//           voice:
//             voice ||
//             ASSISTANT_VOICE,
//         },

//         responseType:
//           "blob",

//         fallbackMessage:
//           "Speech generation failed.",
//       }
//     );
//   };

// /* =========================================================
//    CREATE PLAYABLE VOICE URL
// ========================================================= */

// export const createAssistantSpeechUrl =
//   async ({
//     text,
//     voice =
//       ASSISTANT_VOICE,
//   } = {}) => {
//     const blob =
//       await synthesizeAssistantSpeech({
//         text,
//         voice,
//       });

//     return URL.createObjectURL(
//       blob
//     );
//   };

// /* =========================================================
//    ACTIVE ASSISTANT SPEECH CONTROLLER

//    This is used by the new Stop Response button.

//    It also prevents stale loader speech from starting after
//    the actual answer has arrived.
// ========================================================= */

// let activeAssistantAudio =
//   null;

// let activeAssistantAudioUrl =
//   null;

// let assistantSpeechRequestId =
//   0;

// const clearActiveAssistantAudio =
//   ({
//     pause = true,
//   } = {}) => {
//     const audio =
//       activeAssistantAudio;

//     const audioUrl =
//       activeAssistantAudioUrl;

//     activeAssistantAudio =
//       null;

//     activeAssistantAudioUrl =
//       null;

//     if (
//       audio &&
//       pause
//     ) {
//       try {
//         audio.pause();

//         audio.currentTime =
//           0;
//       } catch {
//         // safe audio cleanup
//       }
//     }

//     if (
//       audioUrl
//     ) {
//       try {
//         URL.revokeObjectURL(
//           audioUrl
//         );
//       } catch {
//         // safe URL cleanup
//       }
//     }
//   };

// /* =========================================================
//    STOP ASSISTANT SPEECH

//    AIAssistant.jsx will call this when the user presses the
//    visible "Stop response" button.
// ========================================================= */

// export const stopAssistantSpeechPlayback =
//   () => {
//     assistantSpeechRequestId +=
//       1;

//     const hadActiveAudio =
//       Boolean(
//         activeAssistantAudio
//       );

//     clearActiveAssistantAudio({
//       pause:
//         true,
//     });

//     return hadActiveAudio;
//   };

// /* =========================================================
//    PLAY ASSISTANT SPEECH
// ========================================================= */

// export const playAssistantSpeech =
//   async ({
//     text,
//     voice =
//       ASSISTANT_VOICE,

//     onStart =
//       null,

//     onEnd =
//       null,

//     onError =
//       null,
//   } = {}) => {
//     const cleanText =
//       String(
//         text ||
//           ""
//       ).trim();

//     if (
//       !cleanText
//     ) {
//       throw new Error(
//         "Text is required."
//       );
//     }

//     /*
//       Every new speech request makes older pending TTS stale.
//     */

//     const requestId =
//       assistantSpeechRequestId +
//       1;

//     assistantSpeechRequestId =
//       requestId;

//     /*
//       Stop any audio already playing.
//     */

//     clearActiveAssistantAudio({
//       pause:
//         true,
//     });

//     /*
//       Generate MP3.
//     */

//     const audioUrl =
//       await createAssistantSpeechUrl({
//         text:
//           cleanText,

//         voice,
//       });

//     /*
//       User may have clicked Stop Response while MP3 was being
//       generated.

//       In that case do not start it.
//     */

//     if (
//       requestId !==
//       assistantSpeechRequestId
//     ) {
//       try {
//         URL.revokeObjectURL(
//           audioUrl
//         );
//       } catch {
//         // safe cleanup
//       }

//       return null;
//     }

//     const audio =
//       new Audio(
//         audioUrl
//       );

//     activeAssistantAudio =
//       audio;

//     activeAssistantAudioUrl =
//       audioUrl;

//     let cleanedUp =
//       false;

//     const cleanup =
//       () => {
//         if (
//           cleanedUp
//         ) {
//           return;
//         }

//         cleanedUp =
//           true;

//         if (
//           activeAssistantAudio ===
//           audio
//         ) {
//           activeAssistantAudio =
//             null;
//         }

//         if (
//           activeAssistantAudioUrl ===
//           audioUrl
//         ) {
//           activeAssistantAudioUrl =
//             null;
//         }

//         try {
//           URL.revokeObjectURL(
//             audioUrl
//           );
//         } catch {
//           // safe cleanup
//         }
//       };

//     audio.onplay =
//       () => {
//         if (
//           requestId !==
//           assistantSpeechRequestId
//         ) {
//           try {
//             audio.pause();

//             audio.currentTime =
//               0;
//           } catch {
//             // safe cleanup
//           }

//           cleanup();

//           return;
//         }

//         if (
//           typeof onStart ===
//           "function"
//         ) {
//           onStart();
//         }
//       };

//     audio.onended =
//       () => {
//         cleanup();

//         if (
//           requestId !==
//           assistantSpeechRequestId
//         ) {
//           return;
//         }

//         if (
//           typeof onEnd ===
//           "function"
//         ) {
//           onEnd();
//         }
//       };

//     audio.onerror =
//       () => {
//         cleanup();

//         if (
//           requestId !==
//           assistantSpeechRequestId
//         ) {
//           return;
//         }

//         const error =
//           new Error(
//             "Unable to play assistant speech."
//           );

//         if (
//           typeof onError ===
//           "function"
//         ) {
//           onError(
//             error
//           );
//         }
//       };

//     audio.onpause =
//       () => {
//         if (
//           requestId !==
//           assistantSpeechRequestId
//         ) {
//           cleanup();
//         }
//       };

//     try {
//       await audio.play();
//     } catch (
//       error
//     ) {
//       cleanup();

//       if (
//         requestId !==
//         assistantSpeechRequestId
//       ) {
//         return null;
//       }

//       throw error;
//     }

//     return audio;
//   };

// /* =========================================================
//    VOICE CONFIGURATION
// ========================================================= */

// export const getVoiceAssistantConfig =
//   () => ({
//     apiUrl:
//       VOICE_API_URL,

//     voice:
//       ASSISTANT_VOICE,

//     inputLanguage:
//       INPUT_LANGUAGE,

//     speechRecognitionSupported:
//       isBrowserSpeechRecognitionSupported(),
//   });


import {
  getCurrentSession,
} from "./authApi";

/*
  assistantApi.js

  Grocery Voice Shopping Assistant

  This file will connect the React frontend to the
  future AI / RAG / Voice backend.

  Future backend responsibilities:
  - Grocery product discovery
  - Natural-language product search
  - Product recommendations
  - Shopping/cart command understanding
  - Speech-to-text
  - Text-to-speech

  The backend will be connected later, so this API is
  written in a way that does NOT break the frontend
  while the backend URL is still missing.
*/

/* =========================================================
   CONFIG
========================================================= */

const ASSISTANT_API_URL =
  String(
    import.meta.env
      .VITE_ASSISTANT_API_URL ||
      "https://grocery-chatbot-api.onrender.com"
  )
    .trim()
    .replace(/\/+$/, "");

/* =========================================================
   CONFIG CHECK
========================================================= */

export const isAssistantConfigured =
  () =>
    Boolean(
      ASSISTANT_API_URL
    );

/* =========================================================
   ERROR PARSER
========================================================= */

const parseErrorMessage = async (
  response,
  fallbackMessage
) => {
  let data = null;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }

  return (
    data?.text ||
    data?.detail ||
    data?.message ||
    data?.error ||
    fallbackMessage
  );
};

/* =========================================================
   CLIENT CONTEXT NORMALIZATION

   Backend state can appear in:

   response.client_state
   response.clientContext
   response.metadata.client_state
   response.metadata.clientContext

   We prefer whichever actually contains useful context.

   This is important for flows like:

   "show maggi"
        ↓
   "32g"
        ↓
   "add to cart"

   so the final short command does not forget the previously
   selected product / variant.
========================================================= */

const hasObjectKeys = (value) =>
  Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length > 0
  );

const hasUsefulClientState = (
  value
) => {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  if (
    Array.isArray(
      value.chat_history
    ) &&
    value.chat_history.length >
      0
  ) {
    return true;
  }

  if (
    Array.isArray(
      value.chatHistory
    ) &&
    value.chatHistory.length >
      0
  ) {
    return true;
  }

  if (
    hasObjectKeys(
      value.conversation_context
    ) ||
    hasObjectKeys(
      value.conversationContext
    )
  ) {
    return true;
  }

  if (
    value.last_product_context !=
      null ||
    value.lastProductContext !=
      null
  ) {
    return true;
  }

  if (
    value.pending_action !=
      null ||
    value.pendingAction !=
      null
  ) {
    return true;
  }

  if (
    value.selected_product !=
      null ||
    value.selectedProduct !=
      null ||
    value.selected_variant !=
      null ||
    value.selectedVariant !=
      null
  ) {
    return true;
  }

  return Boolean(
    value.conversation_id ||
      value.conversationId
  );
};

const resolveClientContext = (
  response,
  fallbackContext = {}
) => {
  const candidates = [
    response?.metadata
      ?.client_state,

    response?.metadata
      ?.clientContext,

    response?.client_state,

    response?.clientContext,
  ];

  const usefulCandidate =
    candidates.find(
      hasUsefulClientState
    );

  if (
    usefulCandidate
  ) {
    return usefulCandidate;
  }

  const objectCandidate =
    candidates.find(
      (
        candidate
      ) =>
        candidate &&
        typeof candidate ===
          "object" &&
        !Array.isArray(
          candidate
        )
    );

  if (
    objectCandidate
  ) {
    return objectCandidate;
  }

  return (
    fallbackContext &&
    typeof fallbackContext ===
      "object" &&
    !Array.isArray(
      fallbackContext
    )
      ? fallbackContext
      : {}
  );
};

/* =========================================================
   SUPABASE ACCESS TOKEN
========================================================= */

const getSupabaseAccessToken =
  async () => {
    const session =
      await getCurrentSession();

    const accessToken =
      session?.access_token ||
      null;

    if (
      !accessToken
    ) {
      throw new Error(
        "Please sign in before using the AI assistant."
      );
    }

    return accessToken;
  };

/* =========================================================
   JSON REQUEST
========================================================= */

const assistantFetch = async (
  path,
  options = {}
) => {
  if (
    !isAssistantConfigured()
  ) {
    throw new Error(
      "AI Assistant backend is not connected yet."
    );
  }

  const requiresAuth =
    options.auth !== false;

  const accessToken =
    requiresAuth
      ? await getSupabaseAccessToken()
      : null;

  const response =
    await fetch(
      `${ASSISTANT_API_URL}${path}`,
      {
        method:
          options.method ||
          "GET",

        headers: {
          ...(options.body
            ? {
                "Content-Type":
                  "application/json",
              }
            : {}),

          ...(accessToken
            ? {
                Authorization:
                  `Bearer ${accessToken}`,
              }
            : {}),

          ...(options.headers ||
            {}),
        },

        body:
          options.body
            ? JSON.stringify(
                options.body
              )
            : undefined,
      }
    );

  if (
    !response.ok
  ) {
    const message =
      await parseErrorMessage(
        response,
        "Assistant request failed."
      );

    throw new Error(
      message
    );
  }

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    return response.json();
  }

  return response;
};

/* =========================================================
   HEALTH CHECK
========================================================= */

export const checkAssistantHealth =
  async () => {
    if (
      !isAssistantConfigured()
    ) {
      return {
        available:
          false,

        configured:
          false,

        status:
          "not_configured",
      };
    }

    try {
      const data =
        await assistantFetch(
          "/health",
          {
            auth:
              false,
          }
        );

      return {
        available:
          true,

        configured:
          true,

        status:
          "online",

        data,
      };
    } catch (
      error
    ) {
      return {
        available:
          false,

        configured:
          true,

        status:
          "offline",

        error:
          error?.message ||
          "Assistant backend unavailable.",
      };
    }
  };

/* =========================================================
   CHAT / RAG
========================================================= */

export const sendAssistantMessage =
  async ({
    message,
    conversationId = null,
    context = {},
    locale = "en-IN",
  } = {}) => {
    const cleanMessage =
      String(
        message ||
          ""
      ).trim();

    if (
      !cleanMessage
    ) {
      throw new Error(
        "Message is required."
      );
    }

    const response =
      await assistantFetch(
        "/chat",
        {
          method:
            "POST",

          body: {
            message:
              cleanMessage,

            conversation_id:
              conversationId,

            locale,

            client_context:
              context ||
              {},
          },
        }
      );

    return {
      ...response,

      message:
        response?.text ||
        response?.message ||
        response?.answer ||
        response?.response ||
        "",

      text:
        response?.text ||
        response?.message ||
        response?.answer ||
        response?.response ||
        "",

      conversationId:
        response
          ?.conversation_id ||
        response
          ?.conversationId ||
        conversationId ||
        null,

      clientContext:
        resolveClientContext(
          response,
          context
        ),

      responseType:
        response
          ?.response_type ||
        response
          ?.responseType ||
        "text",

      products:
        Array.isArray(
          response?.products
        )
          ? response.products
          : [],

      alternatives:
        Array.isArray(
          response
            ?.alternatives
        )
          ? response.alternatives
          : [],

      recommendations:
        Array.isArray(
          response
            ?.recommendations
        )
          ? response.recommendations
          : [],

      cart:
        response?.cart ||
        null,

      orders:
        Array.isArray(
          response?.orders
        )
          ? response.orders
          : [],

      latestOrder:
        response
          ?.latest_order ||
        response
          ?.latestOrder ||
        null,

      action:
        response?.action ||
        null,
    };
  };

/* =========================================================
   PRODUCT QUERY
========================================================= */

export const askProductAssistant =
  async ({
    query,
    limit = 8,
    filters = {},
  } = {}) => {
    const cleanQuery =
      String(
        query ||
          ""
      ).trim();

    if (
      !cleanQuery
    ) {
      return {
        answer:
          "",

        products:
          [],
      };
    }

    const response =
      await assistantFetch(
        "/products/search",
        {
          method:
            "POST",

          body: {
            query:
              cleanQuery,

            limit:
              Number(
                limit
              ),

            filters:
              filters ||
              {},
          },
        }
      );

    return {
      ...response,

      answer:
        response?.answer ||
        response?.message ||
        "",

      products:
        Array.isArray(
          response?.products
        )
          ? response.products
          : [],
    };
  };

/* =========================================================
   SHOPPING COMMAND
========================================================= */

export const interpretShoppingCommand =
  async ({
    command,
    cart = [],
  } = {}) => {
    const cleanCommand =
      String(
        command ||
          ""
      ).trim();

    if (
      !cleanCommand
    ) {
      throw new Error(
        "Shopping command is required."
      );
    }

    const response =
      await assistantFetch(
        "/commands/interpret",
        {
          method:
            "POST",

          body: {
            command:
              cleanCommand,

            cart:
              Array.isArray(
                cart
              )
                ? cart
                : [],
          },
        }
      );

    return {
      ...response,

      action:
        response?.action ||
        null,

      productId:
        response
          ?.product_id ||
        response
          ?.productId ||
        null,

      quantity:
        response
          ?.quantity ??
        null,

      message:
        response?.message ||
        "",
    };
  };

/* =========================================================
   SPEECH TO TEXT
========================================================= */

export const transcribeAudio =
  async (
    audioFile
  ) => {
    if (
      !audioFile
    ) {
      throw new Error(
        "Audio file is required."
      );
    }

    if (
      !isAssistantConfigured()
    ) {
      throw new Error(
        "Voice backend is not connected yet."
      );
    }

    const formData =
      new FormData();

    formData.append(
      "audio",
      audioFile
    );

    const response =
      await fetch(
        `${ASSISTANT_API_URL}/stt`,
        {
          method:
            "POST",

          body:
            formData,
        }
      );

    if (
      !response.ok
    ) {
      const message =
        await parseErrorMessage(
          response,
          "Speech recognition failed."
        );

      throw new Error(
        message
      );
    }

    const data =
      await response.json();

    return {
      ...data,

      text:
        data?.text ||
        data?.transcript ||
        "",
    };
  };

/* =========================================================
   TEXT TO SPEECH
========================================================= */

export const synthesizeSpeech =
  async ({
    text,
    language = "en",
  } = {}) => {
    const cleanText =
      String(
        text ||
          ""
      ).trim();

    if (
      !cleanText
    ) {
      throw new Error(
        "Text is required."
      );
    }

    if (
      !isAssistantConfigured()
    ) {
      throw new Error(
        "Voice backend is not connected yet."
      );
    }

    const response =
      await fetch(
        `${ASSISTANT_API_URL}/tts`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              text:
                cleanText,

              language,
            }),
        }
      );

    if (
      !response.ok
    ) {
      const message =
        await parseErrorMessage(
          response,
          "Speech generation failed."
        );

      throw new Error(
        message
      );
    }

    return response.blob();
  };

/* =========================================================
   CREATE PLAYABLE AUDIO URL
========================================================= */

export const createSpeechUrl =
  async ({
    text,
    language = "en",
  } = {}) => {
    const blob =
      await synthesizeSpeech({
        text,
        language,
      });

    return URL.createObjectURL(
      blob
    );
  };

/* =========================================================
   CLEAN AUDIO URL
========================================================= */

export const revokeSpeechUrl =
  (
    url
  ) => {
    if (
      url
    ) {
      URL.revokeObjectURL(
        url
      );
    }
  };

/* =========================================================
   PHASE 4 — VOICE INTEGRATION
========================================================= */

const VOICE_API_URL =
  String(
    import.meta.env
      .VITE_VOICE_API_URL ||
      (
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:5000"
      )
  )
    .trim()
    .replace(/\/+$/, "");

const ASSISTANT_VOICE =
  String(
    import.meta.env
      .VITE_ASSISTANT_VOICE ||
      "en-IN-NeerjaNeural"
  ).trim() ||
  "en-IN-NeerjaNeural";

const INPUT_LANGUAGE =
  String(
    import.meta.env
      .VITE_INPUT_LANGUAGE ||
      "en-IN"
  ).trim() ||
  "en-IN";

/* =========================================================
   VOICE CONFIG CHECK
========================================================= */

export const isVoiceAssistantConfigured =
  () =>
    Boolean(
      VOICE_API_URL
    );

/* =========================================================
   VOICE SERVER REQUEST
========================================================= */

const voiceFetch = async (
  path,
  options = {}
) => {
  if (
    !isVoiceAssistantConfigured()
  ) {
    throw new Error(
      "Voice assistant server is not connected yet."
    );
  }

  const requiresAuth =
    options.auth ===
    true;

  const accessToken =
    requiresAuth
      ? await getSupabaseAccessToken()
      : null;

  const response =
    await fetch(
      `${VOICE_API_URL}${path}`,
      {
        method:
          options.method ||
          "GET",

        headers: {
          ...(options.body !==
          undefined
            ? {
                "Content-Type":
                  "application/json",
              }
            : {}),

          ...(accessToken
            ? {
                Authorization:
                  `Bearer ${accessToken}`,
              }
            : {}),

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
      }
    );

  if (
    !response.ok
  ) {
    const message =
      await parseErrorMessage(
        response,
        options
          .fallbackMessage ||
          "Voice assistant request failed."
      );

    throw new Error(
      message
    );
  }

  if (
    options.responseType ===
    "blob"
  ) {
    return response.blob();
  }

  if (
    options.responseType ===
    "response"
  ) {
    return response;
  }

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    return response.json();
  }

  return response;
};

/* =========================================================
   VOICE SERVER HEALTH CHECK
========================================================= */

export const checkVoiceAssistantHealth =
  async () => {
    if (
      !isVoiceAssistantConfigured()
    ) {
      return {
        available:
          false,

        configured:
          false,

        status:
          "not_configured",
      };
    }

    try {
      const data =
        await voiceFetch(
          "/health",
          {
            auth:
              false,
          }
        );

      return {
        available:
          true,

        configured:
          true,

        status:
          "online",

        data,
      };
    } catch (
      error
    ) {
      return {
        available:
          false,

        configured:
          true,

        status:
          "offline",

        error:
          error?.message ||
          "Voice assistant server unavailable.",
      };
    }
  };

/* =========================================================
   BROWSER SPEECH RECOGNITION SUPPORT
========================================================= */

let activeSpeechRecognition =
  null;

export const isBrowserSpeechRecognitionSupported =
  () => {
    if (
      typeof window ===
      "undefined"
    ) {
      return false;
    }

    return Boolean(
      window
        .SpeechRecognition ||
      window
        .webkitSpeechRecognition
    );
  };

/* =========================================================
   REQUEST MICROPHONE PERMISSION
========================================================= */

export const requestMicrophonePermission =
  async () => {
    if (
      typeof navigator ===
        "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices
        .getUserMedia
    ) {
      throw new Error(
        "Microphone access is not supported in this browser."
      );
    }

    const stream =
      await navigator
        .mediaDevices
        .getUserMedia({
          audio:
            true,
        });

    stream
      .getTracks()
      .forEach(
        (
          track
        ) =>
          track.stop()
      );

    return true;
  };

/* =========================================================
   START BROWSER SPEECH RECOGNITION
========================================================= */

export const recognizeBrowserSpeech =
  async ({
    language =
      INPUT_LANGUAGE,

    continuous =
      false,

    interimResults =
      true,

    onStart =
      null,

    onInterim =
      null,

    onEnd =
      null,

    onError =
      null,
  } = {}) => {
    if (
      !isBrowserSpeechRecognitionSupported()
    ) {
      throw new Error(
        "Speech recognition is not supported in this browser."
      );
    }

    return new Promise(
      (
        resolve,
        reject
      ) => {
        const Recognition =
          window
            .SpeechRecognition ||
          window
            .webkitSpeechRecognition;

        const recognition =
          new Recognition();

        activeSpeechRecognition =
          recognition;

        recognition.lang =
          language ||
          INPUT_LANGUAGE;

        recognition.continuous =
          Boolean(
            continuous
          );

        recognition.interimResults =
          Boolean(
            interimResults
          );

        recognition.maxAlternatives =
          1;

        let finalTranscript =
          "";

        let settled =
          false;

        const finishResolve =
          (
            transcript
          ) => {
            if (
              settled
            ) {
              return;
            }

            settled =
              true;

            activeSpeechRecognition =
              null;

            const cleanTranscript =
              String(
                transcript ||
                  ""
              ).trim();

            if (
              !cleanTranscript
            ) {
              reject(
                new Error(
                  "No speech was detected."
                )
              );

              return;
            }

            resolve(
              cleanTranscript
            );
          };

        const finishReject =
          (
            error
          ) => {
            if (
              settled
            ) {
              return;
            }

            settled =
              true;

            activeSpeechRecognition =
              null;

            const normalizedError =
              error instanceof
              Error
                ? error
                : new Error(
                    String(
                      error ||
                        "Speech recognition failed."
                    )
                  );

            if (
              typeof onError ===
              "function"
            ) {
              onError(
                normalizedError
              );
            }

            reject(
              normalizedError
            );
          };

        recognition.onstart =
          () => {
            if (
              typeof onStart ===
              "function"
            ) {
              onStart();
            }
          };

        recognition.onresult =
          (
            event
          ) => {
            let interimTranscript =
              "";

            for (
              let index =
                event.resultIndex;
              index <
              event.results
                .length;
              index +=
              1
            ) {
              const result =
                event.results[
                  index
                ];

              const transcript =
                result?.[0]
                  ?.transcript ||
                "";

              if (
                result.isFinal
              ) {
                finalTranscript +=
                  `${transcript} `;
              } else {
                interimTranscript +=
                  `${transcript} `;
              }
            }

            const visibleTranscript =
              `${finalTranscript}${interimTranscript}`
                .trim();

            if (
              visibleTranscript &&
              typeof onInterim ===
                "function"
            ) {
              onInterim(
                visibleTranscript
              );
            }

            if (
              !continuous &&
              finalTranscript.trim()
            ) {
              try {
                recognition.stop();
              } catch {
                // safe cleanup
              }
            }
          };

        recognition.onerror =
          (
            event
          ) => {
            const errorCode =
              String(
                event?.error ||
                  ""
              ).trim();

            let message =
              "Speech recognition failed.";

            if (
              errorCode ===
                "not-allowed" ||
              errorCode ===
                "service-not-allowed"
            ) {
              message =
                "Microphone permission was denied.";
            } else if (
              errorCode ===
              "no-speech"
            ) {
              message =
                "No speech was detected.";
            } else if (
              errorCode ===
              "audio-capture"
            ) {
              message =
                "No microphone was detected.";
            } else if (
              errorCode ===
              "network"
            ) {
              message =
                "Speech recognition network error.";
            }

            finishReject(
              new Error(
                message
              )
            );
          };

        recognition.onend =
          () => {
            if (
              typeof onEnd ===
              "function"
            ) {
              onEnd();
            }

            if (
              settled
            ) {
              return;
            }

            finishResolve(
              finalTranscript
            );
          };

        try {
          recognition.start();
        } catch (
          error
        ) {
          finishReject(
            error
          );
        }
      }
    );
  };

/* =========================================================
   STOP ACTIVE BROWSER SPEECH RECOGNITION
========================================================= */

export const stopBrowserSpeechRecognition =
  () => {
    if (
      !activeSpeechRecognition
    ) {
      return false;
    }

    try {
      activeSpeechRecognition.stop();

      return true;
    } catch {
      activeSpeechRecognition =
        null;

      return false;
    }
  };

/* =========================================================
   SEND BROWSER TRANSCRIPT TO NODE STT
========================================================= */

export const submitSpeechTranscript =
  async ({
    transcript,
    usePython = false,
  } = {}) => {
    const cleanTranscript =
      String(
        transcript ||
          ""
      ).trim();

    if (
      !cleanTranscript &&
      !usePython
    ) {
      throw new Error(
        "Speech transcript is required."
      );
    }

    const response =
      await voiceFetch(
        "/api/voice/speech-to-text",
        {
          method:
            "POST",

          auth:
            false,

          body: {
            transcript:
              cleanTranscript,

            usePython:
              Boolean(
                usePython
              ),
          },

          fallbackMessage:
            "Speech recognition failed.",
        }
      );

    return {
      ...response,

      text:
        response?.text ||
        response?.transcript ||
        cleanTranscript ||
        "",

      transcript:
        response
          ?.transcript ||
        response?.text ||
        cleanTranscript ||
        "",
    };
  };

/* =========================================================
   COMPLETE BROWSER SPEECH-TO-TEXT
========================================================= */

export const transcribeBrowserSpeech =
  async ({
    language =
      INPUT_LANGUAGE,

    onStart =
      null,

    onInterim =
      null,

    onEnd =
      null,

    onError =
      null,
  } = {}) => {
    const transcript =
      await recognizeBrowserSpeech({
        language,
        onStart,
        onInterim,
        onEnd,
        onError,
      });

    return submitSpeechTranscript({
      transcript,
    });
  };

/* =========================================================
   SEND VOICE TRANSCRIPT TO AI
========================================================= */

export const sendVoiceAssistantMessage =
  async ({
    transcript,
    message,
    conversationId = null,
    context = {},
    locale =
      INPUT_LANGUAGE,
  } = {}) => {
    const cleanTranscript =
      String(
        transcript ||
          message ||
          ""
      ).trim();

    if (
      !cleanTranscript
    ) {
      throw new Error(
        "Voice transcript is required."
      );
    }

    const response =
      await voiceFetch(
        "/api/voice/chat",
        {
          method:
            "POST",

          auth:
            true,

          body: {
            transcript:
              cleanTranscript,

            conversation_id:
              conversationId,

            locale:
              locale ||
              INPUT_LANGUAGE,

            client_context:
              context ||
              {},
          },

          fallbackMessage:
            "Voice assistant request failed.",
        }
      );

    return {
      ...response,

      message:
        response?.text ||
        response?.message ||
        response?.answer ||
        response?.response ||
        "",

      text:
        response?.text ||
        response?.message ||
        response?.answer ||
        response?.response ||
        "",

      conversationId:
        response
          ?.conversation_id ||
        response
          ?.conversationId ||
        conversationId ||
        null,

      clientContext:
        resolveClientContext(
          response,
          context
        ),

      responseType:
        response
          ?.response_type ||
        response
          ?.responseType ||
        "text",

      products:
        Array.isArray(
          response?.products
        )
          ? response.products
          : [],

      alternatives:
        Array.isArray(
          response
            ?.alternatives
        )
          ? response.alternatives
          : [],

      recommendations:
        Array.isArray(
          response
            ?.recommendations
        )
          ? response.recommendations
          : [],

      cart:
        response?.cart ||
        null,

      orders:
        Array.isArray(
          response?.orders
        )
          ? response.orders
          : [],

      latestOrder:
        response
          ?.latest_order ||
        response
          ?.latestOrder ||
        null,

      action:
        response?.action ||
        null,
    };
  };

/* =========================================================
   TEXT TO SPEECH — NODE VOICE SERVER
========================================================= */

export const synthesizeAssistantSpeech =
  async ({
    text,
    voice =
      ASSISTANT_VOICE,
  } = {}) => {
    const cleanText =
      String(
        text ||
          ""
      ).trim();

    if (
      !cleanText
    ) {
      throw new Error(
        "Text is required."
      );
    }

    return voiceFetch(
      "/api/voice/text-to-speech",
      {
        method:
          "POST",

        auth:
          false,

        body: {
          text:
            cleanText,

          voice:
            voice ||
            ASSISTANT_VOICE,
        },

        responseType:
          "blob",

        fallbackMessage:
          "Speech generation failed.",
      }
    );
  };

/* =========================================================
   CREATE PLAYABLE VOICE URL
========================================================= */

export const createAssistantSpeechUrl =
  async ({
    text,
    voice =
      ASSISTANT_VOICE,
  } = {}) => {
    const blob =
      await synthesizeAssistantSpeech({
        text,
        voice,
      });

    return URL.createObjectURL(
      blob
    );
  };

/* =========================================================
   ACTIVE ASSISTANT SPEECH CONTROLLER

   This is used by the new Stop Response button.

   It also prevents stale loader speech from starting after
   the actual answer has arrived.
========================================================= */

let activeAssistantAudio =
  null;

let activeAssistantAudioUrl =
  null;

let assistantSpeechRequestId =
  0;

const clearActiveAssistantAudio =
  ({
    pause = true,
  } = {}) => {
    const audio =
      activeAssistantAudio;

    const audioUrl =
      activeAssistantAudioUrl;

    activeAssistantAudio =
      null;

    activeAssistantAudioUrl =
      null;

    if (
      audio &&
      pause
    ) {
      try {
        audio.pause();

        audio.currentTime =
          0;
      } catch {
        // safe audio cleanup
      }
    }

    if (
      audioUrl
    ) {
      try {
        URL.revokeObjectURL(
          audioUrl
        );
      } catch {
        // safe URL cleanup
      }
    }
  };

/* =========================================================
   STOP ASSISTANT SPEECH

   AIAssistant.jsx will call this when the user presses the
   visible "Stop response" button.
========================================================= */

export const stopAssistantSpeechPlayback =
  () => {
    assistantSpeechRequestId +=
      1;

    const hadActiveAudio =
      Boolean(
        activeAssistantAudio
      );

    clearActiveAssistantAudio({
      pause:
        true,
    });

    return hadActiveAudio;
  };

/* =========================================================
   PLAY ASSISTANT SPEECH
========================================================= */

export const playAssistantSpeech =
  async ({
    text,
    voice =
      ASSISTANT_VOICE,

    onStart =
      null,

    onEnd =
      null,

    onError =
      null,
  } = {}) => {
    const cleanText =
      String(
        text ||
          ""
      ).trim();

    if (
      !cleanText
    ) {
      throw new Error(
        "Text is required."
      );
    }

    /*
      Every new speech request makes older pending TTS stale.
    */

    const requestId =
      assistantSpeechRequestId +
      1;

    assistantSpeechRequestId =
      requestId;

    /*
      Stop any audio already playing.
    */

    clearActiveAssistantAudio({
      pause:
        true,
    });

    /*
      Generate MP3.
    */

    const audioUrl =
      await createAssistantSpeechUrl({
        text:
          cleanText,

        voice,
      });

    /*
      User may have clicked Stop Response while MP3 was being
      generated.

      In that case do not start it.
    */

    if (
      requestId !==
      assistantSpeechRequestId
    ) {
      try {
        URL.revokeObjectURL(
          audioUrl
        );
      } catch {
        // safe cleanup
      }

      return null;
    }

    const audio =
      new Audio(
        audioUrl
      );

    activeAssistantAudio =
      audio;

    activeAssistantAudioUrl =
      audioUrl;

    let cleanedUp =
      false;

    const cleanup =
      () => {
        if (
          cleanedUp
        ) {
          return;
        }

        cleanedUp =
          true;

        if (
          activeAssistantAudio ===
          audio
        ) {
          activeAssistantAudio =
            null;
        }

        if (
          activeAssistantAudioUrl ===
          audioUrl
        ) {
          activeAssistantAudioUrl =
            null;
        }

        try {
          URL.revokeObjectURL(
            audioUrl
          );
        } catch {
          // safe cleanup
        }
      };

    audio.onplay =
      () => {
        if (
          requestId !==
          assistantSpeechRequestId
        ) {
          try {
            audio.pause();

            audio.currentTime =
              0;
          } catch {
            // safe cleanup
          }

          cleanup();

          return;
        }

        if (
          typeof onStart ===
          "function"
        ) {
          onStart();
        }
      };

    audio.onended =
      () => {
        cleanup();

        if (
          requestId !==
          assistantSpeechRequestId
        ) {
          return;
        }

        if (
          typeof onEnd ===
          "function"
        ) {
          onEnd();
        }
      };

    audio.onerror =
      () => {
        cleanup();

        if (
          requestId !==
          assistantSpeechRequestId
        ) {
          return;
        }

        const error =
          new Error(
            "Unable to play assistant speech."
          );

        if (
          typeof onError ===
          "function"
        ) {
          onError(
            error
          );
        }
      };

    audio.onpause =
      () => {
        if (
          requestId !==
          assistantSpeechRequestId
        ) {
          cleanup();
        }
      };

    try {
      await audio.play();
    } catch (
      error
    ) {
      cleanup();

      if (
        requestId !==
        assistantSpeechRequestId
      ) {
        return null;
      }

      throw error;
    }

    return audio;
  };

/* =========================================================
   VOICE CONFIGURATION
========================================================= */

export const getVoiceAssistantConfig =
  () => ({
    apiUrl:
      VOICE_API_URL,

    voice:
      ASSISTANT_VOICE,

    inputLanguage:
      INPUT_LANGUAGE,

    speechRecognitionSupported:
      isBrowserSpeechRecognitionSupported(),
  });