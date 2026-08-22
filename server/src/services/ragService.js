/* =========================================================
   RAG / ASSISTANT SERVICE

   Grocery Voice Shopping Assistant

   Responsibility:
   - Send user query to the deployed Grocery Chatbot API
   - Forward Supabase access token
   - Preserve conversation_id
   - Preserve client_context
   - Return structured products / SKUs / cart / orders
   - Work for BOTH:
       1. normal typed queries
       2. speech-to-text queries

   IMPORTANT:

   The real RAG implementation already exists in the
   deployed Python backend.

   Therefore this Node service does NOT:
   - run embeddings
   - load sentence-transformers
   - run another vector database
   - classify intents
   - invent products
   - duplicate Cohere / Groq logic

   Flow:

   Browser text / microphone
           ↓
   speechToText.js (only for voice)
           ↓
   ragService.js
           ↓
   Render FastAPI /chat
           ↓
   Cohere brain
           ↓
   Tools / Supabase / RAG
           ↓
   Groq response
           ↓
   structured JSON
========================================================= */


/* =========================================================
   BACKEND URL

   No server .env is required.

   Your main deployed backend:
========================================================= */

const GROCERY_API_URL =
  "https://grocery-chatbot-api.onrender.com";


/* =========================================================
   CHAT ENDPOINT
========================================================= */

const CHAT_ENDPOINT =
  `${GROCERY_API_URL}/chat`;


/* =========================================================
   DEFAULT REQUEST SETTINGS
========================================================= */

const DEFAULT_LOCALE =
  "en-IN";

const DEFAULT_TIMEOUT_MS =
  90_000;


/* =========================================================
   ERROR CLASS
========================================================= */

export class RagServiceError extends Error {
  constructor(
    message,
    {
      status = 500,
      code = "RAG_SERVICE_ERROR",
      details = null,
    } = {}
  ) {
    super(message);

    this.name =
      "RagServiceError";

    this.status =
      status;

    this.code =
      code;

    this.details =
      details;
  }
}


/* =========================================================
   STRING NORMALIZER
========================================================= */

const normalizeString = (
  value
) =>
  String(
    value ?? ""
  ).trim();


/* =========================================================
   ACCESS TOKEN NORMALIZER

   Accept either:

       eyJ...

   OR:

       Bearer eyJ...

   Internally always return only the token.
========================================================= */

const normalizeAccessToken = (
  token
) => {
  const value =
    normalizeString(
      token
    );

  if (!value) {
    return "";
  }

  if (
    value
      .toLowerCase()
      .startsWith(
        "bearer "
      )
  ) {
    return value
      .slice(7)
      .trim();
  }

  return value;
};


/* =========================================================
   MESSAGE VALIDATION
========================================================= */

const normalizeMessage = (
  message
) => {
  const value =
    normalizeString(
      message
    );

  if (!value) {
    throw new RagServiceError(
      "A message is required.",
      {
        status: 400,
        code:
          "MESSAGE_REQUIRED",
      }
    );
  }

  return value;
};


/* =========================================================
   CONVERSATION ID
========================================================= */

const createConversationId =
  () => {
    if (
      globalThis.crypto
        ?.randomUUID
    ) {
      return globalThis
        .crypto
        .randomUUID();
    }

    return `conversation-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;
  };


const normalizeConversationId = (
  conversationId
) => {
  const value =
    normalizeString(
      conversationId
    );

  return (
    value ||
    createConversationId()
  );
};


/* =========================================================
   CLIENT CONTEXT

   This is conversational state only.

   It must NOT be trusted for:
   - user identity
   - price
   - stock
   - cart ownership
   - order ownership

   Authoritative values always come from backend/Supabase.
========================================================= */

const normalizeClientContext = (
  context
) => {
  if (
    !context ||
    typeof context !==
      "object" ||
    Array.isArray(
      context
    )
  ) {
    return {};
  }

  return context;
};


/* =========================================================
   LOCALE
========================================================= */

const normalizeLocale = (
  locale
) => {
  const value =
    normalizeString(
      locale
    );

  return (
    value ||
    DEFAULT_LOCALE
  );
};


/* =========================================================
   SAFE JSON PARSER
========================================================= */

const readJsonResponse =
  async (
    response
  ) => {
    const rawText =
      await response.text();

    if (!rawText) {
      return {};
    }

    try {
      return JSON.parse(
        rawText
      );
    } catch {
      throw new RagServiceError(
        "The grocery assistant returned an invalid response.",
        {
          status:
            response.status ||
            502,

          code:
            "INVALID_BACKEND_RESPONSE",

          details:
            rawText.slice(
              0,
              500
            ),
        }
      );
    }
  };


/* =========================================================
   BACKEND ERROR MESSAGE
========================================================= */

const getBackendErrorMessage = (
  data,
  status
) => {
  if (
    data?.text &&
    typeof data.text ===
      "string"
  ) {
    return data.text;
  }

  if (
    data?.message &&
    typeof data.message ===
      "string"
  ) {
    return data.message;
  }

  if (
    status === 401
  ) {
    return (
      "Your session is no longer valid. " +
      "Please sign in again."
    );
  }

  if (
    status === 422
  ) {
    return (
      "The assistant request was invalid."
    );
  }

  if (
    status >= 500
  ) {
    return (
      "The grocery assistant is temporarily unavailable."
    );
  }

  return (
    "The grocery assistant could not process the request."
  );
};


/* =========================================================
   STRUCTURED RESPONSE NORMALIZER

   Backend currently returns snake_case fields such as:

       response_type
       conversation_id
       client_state
       latest_order

   Frontend code prefers camelCase.

   We return BOTH where useful so old code does not break.
========================================================= */

const normalizeAssistantResponse = (
  data
) => {
  const products =
    Array.isArray(
      data?.products
    )
      ? data.products
      : [];

  const alternatives =
    Array.isArray(
      data?.alternatives
    )
      ? data.alternatives
      : [];

  const recommendations =
    Array.isArray(
      data?.recommendations
    )
      ? data.recommendations
      : [];

  const orders =
    Array.isArray(
      data?.orders
    )
      ? data.orders
      : [];

  const clientState =
    data?.client_state &&
    typeof data.client_state ===
      "object"
      ? data.client_state
      : {};

  const conversationId =
    data?.conversation_id ||
    clientState
      ?.conversation_id ||
    null;

  const latestOrder =
    data?.latest_order ||
    null;

  const responseType =
    data?.response_type ||
    null;

  const text =
    data?.text ||
    data?.message ||
    "";

  return {
    /* ===============================================
       MAIN RESULT
    =============================================== */

    success:
      data?.success !==
      false,

    text,

    message:
      text,


    /* ===============================================
       RESPONSE TYPE
    =============================================== */

    responseType,

    response_type:
      responseType,


    /* ===============================================
       CONVERSATION
    =============================================== */

    conversationId,

    conversation_id:
      conversationId,


    /* ===============================================
       STATE
    =============================================== */

    clientContext:
      clientState,

    clientState,

    client_state:
      clientState,


    /* ===============================================
       PRODUCTS
    =============================================== */

    products,

    alternatives,

    recommendations,


    /* ===============================================
       SHOPPING
    =============================================== */

    cart:
      data?.cart ||
      null,

    orders,

    latestOrder,

    latest_order:
      latestOrder,


    /* ===============================================
       ERRORS / METADATA
    =============================================== */

    errorCode:
      data?.error_code ||
      null,

    error_code:
      data?.error_code ||
      null,

    metadata:
      data?.metadata &&
      typeof data.metadata ===
        "object"
        ? data.metadata
        : {},


    /* ===============================================
       API VERSION
    =============================================== */

    apiVersion:
      data?.api_version ||
      null,

    api_version:
      data?.api_version ||
      null,


    /* ===============================================
       ORIGINAL BACKEND RESULT

       Useful if another service needs a backend
       field that is not yet normalized here.
    =============================================== */

    raw:
      data,
  };
};


/* =========================================================
   SEND QUERY TO REAL AI BACKEND
========================================================= */

export const sendRagQuery =
  async ({
    message,
    accessToken,
    conversationId,
    clientContext = {},
    context,
    locale =
      DEFAULT_LOCALE,
    timeoutMs =
      DEFAULT_TIMEOUT_MS,
  } = {}) => {
    const cleanMessage =
      normalizeMessage(
        message
      );

    const token =
      normalizeAccessToken(
        accessToken
      );

    if (!token) {
      throw new RagServiceError(
        "You must be signed in to use the shopping assistant.",
        {
          status: 401,

          code:
            "AUTHORIZATION_REQUIRED",
        }
      );
    }

    const cleanConversationId =
      normalizeConversationId(
        conversationId
      );

    /*
      Support both names:

          clientContext
          context

      so existing server code can continue working.
    */

    const cleanContext =
      normalizeClientContext(
        clientContext &&
        Object.keys(
          clientContext
        ).length
          ? clientContext
          : context
      );

    const cleanLocale =
      normalizeLocale(
        locale
      );


    /* =====================================================
       REQUEST BODY

       IMPORTANT:

       We never send user_id.

       Backend derives the authenticated user ID from
       the verified Supabase access token.
    ===================================================== */

    const body = {
      message:
        cleanMessage,

      conversation_id:
        cleanConversationId,

      locale:
        cleanLocale,

      client_context:
        cleanContext,
    };


    /* =====================================================
       TIMEOUT
    ===================================================== */

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () => {
          controller.abort();
        },
        Math.max(
          10_000,
          Number(
            timeoutMs
          ) ||
            DEFAULT_TIMEOUT_MS
        )
      );


    try {
      const response =
        await fetch(
          CHAT_ENDPOINT,
          {
            method:
              "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body:
              JSON.stringify(
                body
              ),

            signal:
              controller.signal,
          }
        );


      /* ===================================================
         PARSE RESPONSE
      =================================================== */

      const data =
        await readJsonResponse(
          response
        );


      /* ===================================================
         HTTP ERROR
      =================================================== */

      if (!response.ok) {
        throw new RagServiceError(
          getBackendErrorMessage(
            data,
            response.status
          ),
          {
            status:
              response.status,

            code:
              data?.error_code ||
              `HTTP_${response.status}`,

            details:
              data,
          }
        );
      }


      /* ===================================================
         BACKEND MAY RETURN HTTP 200 + success:false

         The API intentionally returns structured chat
         errors in some cases.

         Preserve those instead of throwing away useful
         backend information.
      =================================================== */

      return (
        normalizeAssistantResponse(
          data
        )
      );
    } catch (error) {
      if (
        error?.name ===
        "AbortError"
      ) {
        throw new RagServiceError(
          "The grocery assistant is taking too long to respond. Please try again.",
          {
            status: 504,

            code:
              "ASSISTANT_TIMEOUT",
          }
        );
      }

      if (
        error instanceof
        RagServiceError
      ) {
        throw error;
      }


      /* ===================================================
         FETCH / NETWORK FAILURE
      =================================================== */

      if (
        error instanceof
        TypeError
      ) {
        throw new RagServiceError(
          "Unable to connect to the grocery assistant right now.",
          {
            status: 503,

            code:
              "ASSISTANT_CONNECTION_ERROR",
          }
        );
      }

      throw new RagServiceError(
        error?.message ||
          "The grocery assistant request failed.",
        {
          status: 500,

          code:
            "ASSISTANT_REQUEST_FAILED",
        }
      );
    } finally {
      clearTimeout(
        timeout
      );
    }
  };


/* =========================================================
   VOICE QUERY

   Speech recognition gives us normal text.

   Example:

       "show me dairy products"

   It then enters exactly the SAME AI backend flow.

   No separate voice intelligence is created.
========================================================= */

export const sendVoiceRagQuery =
  async ({
    transcript,
    message,
    accessToken,
    conversationId,
    clientContext = {},
    context,
    locale =
      DEFAULT_LOCALE,
  } = {}) => {
    const voiceMessage =
      normalizeMessage(
        transcript ||
          message
      );

    return sendRagQuery({
      message:
        voiceMessage,

      accessToken,

      conversationId,

      clientContext,

      context,

      locale,
    });
  };


/* =========================================================
   COMPATIBILITY ALIASES

   These aliases are intentionally provided so older
   controller/service code can use familiar names without
   forcing another rewrite.
========================================================= */

export const queryRag =
  sendRagQuery;

export const queryRAG =
  sendRagQuery;

export const askRag =
  sendRagQuery;

export const askRAG =
  sendRagQuery;

export const getRagResponse =
  sendRagQuery;

export const getRAGResponse =
  sendRagQuery;

export const sendAssistantQuery =
  sendRagQuery;

export const processAssistantMessage =
  sendRagQuery;


/* =========================================================
   HEALTH CHECK

   Does not require authentication.
========================================================= */

export const checkRagServiceHealth =
  async ({
    timeoutMs = 15_000,
  } = {}) => {
    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        timeoutMs
      );

    try {
      const response =
        await fetch(
          `${GROCERY_API_URL}/health`,
          {
            method:
              "GET",

            headers: {
              Accept:
                "application/json",
            },

            signal:
              controller.signal,
          }
        );

      if (!response.ok) {
        return {
          success: false,

          status:
            response.status,

          backend:
            "unavailable",
        };
      }

      const data =
        await readJsonResponse(
          response
        );

      return {
        success: true,

        status:
          response.status,

        backend:
          data,
      };
    } catch {
      return {
        success: false,

        status: null,

        backend:
          "unavailable",
      };
    } finally {
      clearTimeout(
        timeout
      );
    }
  };


/* =========================================================
   PUBLIC INFO
========================================================= */

export const getRagServiceInfo =
  () => ({
    backendUrl:
      GROCERY_API_URL,

    chatEndpoint:
      CHAT_ENDPOINT,

    locale:
      DEFAULT_LOCALE,

    authentication:
      "Supabase Bearer access token",

    voiceCompatible:
      true,

    structuredResponses:
      true,
  });


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  sendRagQuery,

  sendVoiceRagQuery,

  queryRag,

  queryRAG,

  askRag,

  askRAG,

  getRagResponse,

  getRAGResponse,

  sendAssistantQuery,

  processAssistantMessage,

  checkRagServiceHealth,

  getRagServiceInfo,
};