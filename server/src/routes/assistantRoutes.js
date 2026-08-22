import express from "express";

import {
  sendRagQuery,
  sendVoiceRagQuery,
} from "../services/ragService.js";


/* =========================================================
   ASSISTANT ROUTES

   Mounted in index.js as:

       app.use("/api/assistant", assistantRoutes)

   Available endpoints:

       POST /api/assistant/chat
       POST /api/assistant/voice-chat

   Both ultimately use the SAME Grocery Chatbot API.

   Typed:
       text → RAG/backend

   Voice:
       microphone → transcript → RAG/backend
========================================================= */


const router =
  express.Router();


/* =========================================================
   GET SUPABASE ACCESS TOKEN

   Expected:

       Authorization: Bearer <ACCESS_TOKEN>

   We NEVER accept user_id from the browser.
   Backend determines user identity from verified token.
========================================================= */

const getAccessToken = (
  req
) => {
  const authorization =
    String(
      req.headers
        .authorization ||
        ""
    ).trim();


  if (
    !authorization
      .toLowerCase()
      .startsWith(
        "bearer "
      )
  ) {
    return "";
  }


  return authorization
    .slice(7)
    .trim();
};


/* =========================================================
   SAFE CLIENT CONTEXT
========================================================= */

const getClientContext = (
  body = {}
) => {
  const snakeContext =
    body?.client_context;

  const camelContext =
    body?.clientContext;


  if (
    snakeContext &&
    typeof snakeContext ===
      "object" &&
    !Array.isArray(
      snakeContext
    )
  ) {
    return snakeContext;
  }


  if (
    camelContext &&
    typeof camelContext ===
      "object" &&
    !Array.isArray(
      camelContext
    )
  ) {
    return camelContext;
  }


  return {};
};


/* =========================================================
   GET CONVERSATION ID
========================================================= */

const getConversationId = (
  body = {}
) =>
  body?.conversation_id ||
  body?.conversationId ||
  null;


/* =========================================================
   GET LOCALE
========================================================= */

const getLocale = (
  body = {}
) =>
  String(
    body?.locale ||
    body?.language ||
    "en-IN"
  ).trim() ||
  "en-IN";


/* =========================================================
   PUBLIC ERROR RESPONSE
========================================================= */

const sendError = (
  res,
  error,
  fallbackMessage
) => {
  console.error(
    "[ASSISTANT ROUTE ERROR]",
    error
  );


  const status =
    Number(
      error?.status
    ) || 500;


  return res
    .status(
      status
    )
    .json({
      success: false,

      message:
        error?.message ||
        fallbackMessage,

      code:
        error?.code ||
        "ASSISTANT_ERROR",
    });
};


/* =========================================================
   ROUTE HEALTH CHECK

   GET /api/assistant
========================================================= */

router.get(
  "/",

  (
    req,
    res
  ) => {
    return res
      .status(200)
      .json({
        success: true,

        service:
          "EchOo Assistant",

        status:
          "ready",

        typed:
          true,

        voice:
          true,
      });
  }
);


/* =========================================================
   NORMAL TEXT CHAT

   POST /api/assistant/chat

   Headers:

       Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

   Body example:

       {
         "message": "Show me milk under ₹100",
         "conversation_id": "...",
         "client_context": {},
         "locale": "en-IN"
       }

   Flow:

       AIAssistant.jsx
            ↓
       assistantRoutes.js
            ↓
       ragService.js
            ↓
       Render /chat
            ↓
       Cohere + tools + Supabase + RAG
            ↓
       Groq
            ↓
       structured response
========================================================= */

router.post(
  "/chat",

  async (
    req,
    res
  ) => {
    try {
      /* ===================================================
         AUTH TOKEN
      =================================================== */

      const accessToken =
        getAccessToken(
          req
        );


      if (!accessToken) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication is required.",

            code:
              "AUTHORIZATION_REQUIRED",
          });
      }


      /* ===================================================
         MESSAGE
      =================================================== */

      const message =
        String(
          req.body
            ?.message ||
          req.body
            ?.text ||
          ""
        ).trim();


      if (!message) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Message is required.",

            code:
              "MESSAGE_REQUIRED",
          });
      }


      /* ===================================================
         SEND TO EXISTING AI BACKEND
      =================================================== */

      const result =
        await sendRagQuery({
          message,

          accessToken,

          conversationId:
            getConversationId(
              req.body
            ),

          clientContext:
            getClientContext(
              req.body
            ),

          locale:
            getLocale(
              req.body
            ),
        });


      /* ===================================================
         RETURN FULL STRUCTURED RESULT

         Includes where available:

         text
         products
         alternatives
         recommendations
         cart
         orders
         latestOrder
         responseType
         conversationId
         clientContext
      =================================================== */

      return res
        .status(200)
        .json(
          result
        );
    } catch (error) {
      return sendError(
        res,
        error,
        "Assistant request failed."
      );
    }
  }
);


/* =========================================================
   VOICE CHAT

   POST /api/assistant/voice-chat

   Browser microphone recognition happens BEFORE this.

   Body:

       {
         "transcript": "show me dairy products",
         "conversation_id": "...",
         "client_context": {},
         "locale": "en-IN"
       }

   The transcript enters the SAME AI backend as typed text.
========================================================= */

router.post(
  "/voice-chat",

  async (
    req,
    res
  ) => {
    try {
      /* ===================================================
         AUTH
      =================================================== */

      const accessToken =
        getAccessToken(
          req
        );


      if (!accessToken) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication is required.",

            code:
              "AUTHORIZATION_REQUIRED",
          });
      }


      /* ===================================================
         TRANSCRIPT
      =================================================== */

      const transcript =
        String(
          req.body
            ?.transcript ||
          req.body
            ?.message ||
          req.body
            ?.text ||
          ""
        ).trim();


      if (!transcript) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Voice transcript is required.",

            code:
              "TRANSCRIPT_REQUIRED",
          });
      }


      /* ===================================================
         SAME RAG / SHOPPING BACKEND
      =================================================== */

      const result =
        await sendVoiceRagQuery({
          transcript,

          accessToken,

          conversationId:
            getConversationId(
              req.body
            ),

          clientContext:
            getClientContext(
              req.body
            ),

          locale:
            getLocale(
              req.body
            ),
        });


      return res
        .status(200)
        .json(
          result
        );
    } catch (error) {
      return sendError(
        res,
        error,
        "Voice assistant request failed."
      );
    }
  }
);


/* =========================================================
   COMPATIBILITY ROUTE

   POST /api/assistant

   If any existing frontend code currently sends directly to:

       /api/assistant

   instead of:

       /api/assistant/chat

   this keeps it working.
========================================================= */

router.post(
  "/",

  async (
    req,
    res
  ) => {
    try {
      const accessToken =
        getAccessToken(
          req
        );


      if (!accessToken) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication is required.",

            code:
              "AUTHORIZATION_REQUIRED",
          });
      }


      const message =
        String(
          req.body
            ?.message ||
          req.body
            ?.transcript ||
          req.body
            ?.text ||
          ""
        ).trim();


      if (!message) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Message is required.",

            code:
              "MESSAGE_REQUIRED",
          });
      }


      const result =
        await sendRagQuery({
          message,

          accessToken,

          conversationId:
            getConversationId(
              req.body
            ),

          clientContext:
            getClientContext(
              req.body
            ),

          locale:
            getLocale(
              req.body
            ),
        });


      return res
        .status(200)
        .json(
          result
        );
    } catch (error) {
      return sendError(
        res,
        error,
        "Assistant request failed."
      );
    }
  }
);


/* =========================================================
   EXPORT
========================================================= */

export default router;