import {
  sendRagQuery,
  sendVoiceRagQuery,
} from "../services/ragService.js";


/* =========================================================
   ASSISTANT CONTROLLER

   Responsibilities:
   - Receive typed assistant requests
   - Receive voice-transcribed requests
   - Read Supabase Bearer access token
   - Preserve conversation state
   - Send query to existing Grocery Chatbot backend
   - Return complete structured response

   This controller does NOT:
   - perform speech recognition
   - generate speech
   - run its own RAG
   - trust user_id from frontend

   User identity always comes from the Supabase access token.
========================================================= */


/* =========================================================
   GET ACCESS TOKEN
========================================================= */

const getAccessToken = (
  req
) => {
  const authorization =
    String(
      req.headers
        ?.authorization ||
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
   GET CONVERSATION ID

   Support both:

       conversation_id
       conversationId
========================================================= */

const getConversationId = (
  body = {}
) => {
  return (
    body?.conversation_id ||
    body?.conversationId ||
    null
  );
};


/* =========================================================
   GET CLIENT CONTEXT

   Support both:

       client_context
       clientContext
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
   GET LOCALE
========================================================= */

const getLocale = (
  body = {}
) => {
  const locale =
    String(
      body?.locale ||
      body?.language ||
      "en-IN"
    ).trim();

  return (
    locale ||
    "en-IN"
  );
};


/* =========================================================
   ERROR RESPONSE
========================================================= */

const sendControllerError = (
  res,
  error,
  fallbackMessage =
    "Assistant request failed."
) => {
  console.error(
    "[ASSISTANT CONTROLLER ERROR]",
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
   ASSISTANT STATUS

   GET /api/assistant
========================================================= */

export const getAssistantStatus =
  async (
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

        locale:
          "en-IN",

        assistantVoice:
          "en-IN-NeerjaNeural",
      });
  };


/* =========================================================
   NORMAL TYPED CHAT

   Example body:

       {
         "message": "Show me milk under ₹100",
         "conversation_id": "...",
         "client_context": {},
         "locale": "en-IN"
       }

   Authorization:

       Bearer <SUPABASE_ACCESS_TOKEN>
========================================================= */

export const chatAssistant =
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
         SEND TO REAL GROCERY CHATBOT BACKEND
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
         RETURN COMPLETE STRUCTURED RESULT

         This may contain:

         text
         products
         variants
         SKUs
         alternatives
         recommendations
         cart
         orders
         latestOrder
         conversationId
         clientContext
      =================================================== */

      return res
        .status(200)
        .json(
          result
        );
    } catch (error) {
      return sendControllerError(
        res,
        error,
        "Assistant request failed."
      );
    }
  };


/* =========================================================
   VOICE CHAT

   IMPORTANT:

   Microphone permission happens in the USER'S browser.

   Browser speech recognition produces:

       "show me healthy snacks"

   Then frontend sends:

       {
         "transcript": "show me healthy snacks"
       }

   This controller sends that transcript into the SAME
   backend used by typed chat.
========================================================= */

export const voiceChatAssistant =
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
         VOICE TRANSCRIPT
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
         SAME AI / RAG BACKEND
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
      return sendControllerError(
        res,
        error,
        "Voice assistant request failed."
      );
    }
  };


/* =========================================================
   COMPATIBILITY HANDLER

   Useful if older code calls:

       POST /api/assistant

   It accepts either:

       message
       text
       transcript
========================================================= */

export const assistantRequest =
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
      return sendControllerError(
        res,
        error,
        "Assistant request failed."
      );
    }
  };


/* =========================================================
   ALIASES

   These are included so if your previous routes used
   slightly different controller names, you have compatible
   exports available.
========================================================= */

export const assistantChat =
  chatAssistant;

export const handleAssistantChat =
  chatAssistant;

export const handleChat =
  chatAssistant;

export const voiceAssistant =
  voiceChatAssistant;

export const handleVoiceChat =
  voiceChatAssistant;


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  getAssistantStatus,

  chatAssistant,

  assistantChat,

  handleAssistantChat,

  handleChat,

  voiceChatAssistant,

  voiceAssistant,

  handleVoiceChat,

  assistantRequest,
};