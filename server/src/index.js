import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import assistantRoutes from "./routes/assistantRoutes.js";

import {
  speechToText,
} from "./services/speechToText.js";

import {
  textToSpeech,
} from "./services/textToSpeech.js";

import {
  sendVoiceRagQuery,
} from "./services/ragService.js";


/* =========================================================
   SERVER
========================================================= */

const app = express();

const PORT =
  Number(
    process.env.PORT
  ) || 5000;

const HOST =
  "0.0.0.0";

const __filename =
  fileURLToPath(
    import.meta.url
  );

const __dirname =
  path.dirname(
    __filename
  );

const CLIENT_DIST_PATH =
  path.resolve(
    __dirname,
    "../../client/dist"
  );

const CLIENT_INDEX_PATH =
  path.join(
    CLIENT_DIST_PATH,
    "index.html"
  );

const CLIENT_BUILD_EXISTS =
  fs.existsSync(
    CLIENT_INDEX_PATH
  );


/* =========================================================
   MIDDLEWARE
========================================================= */

/*
  Allow frontend browser to communicate with this server.

  Local frontend:
      http://localhost:5173
*/

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);


/*
  JSON requests.

  Used for:
  - assistant messages
  - browser speech transcript
  - TTS text
*/

app.use(
  express.json({
    limit: "5mb",
  })
);


app.use(
  express.urlencoded({
    extended: true,
    limit: "5mb",
  })
);


/* =========================================================
   HEALTH
========================================================= */

app.get(
  "/",
  (req, res) => {
    if (
      CLIENT_BUILD_EXISTS
    ) {
      return res.sendFile(
        CLIENT_INDEX_PATH
      );
    }

    return res
      .status(200)
      .json({
        success: true,
        service:
          "EchOo Grocery Voice Server",
        status:
          "running",
      });
  }
);


app.get(
  "/health",
  (req, res) => {
    res.status(200).json({
      success: true,
      status:
        "healthy",
      service:
        "EchOo Voice Server",
      voice:
        "en-IN-NeerjaNeural",
    });
  }
);


/* =========================================================
   EXISTING ASSISTANT ROUTES

   We keep your existing assistant system.
========================================================= */

app.use(
  "/api/assistant",
  assistantRoutes
);


/* =========================================================
   GET BEARER TOKEN
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
   SPEECH TO TEXT

   POST:
       /api/voice/speech-to-text

   Browser sends:

       {
           "transcript": "show me milk"
       }

   Browser itself requests microphone permission.

   This endpoint then normalizes the recognized text.

   Optional original Python mode:

       {
           "usePython": true
       }
========================================================= */

app.post(
  "/api/voice/speech-to-text",

  async (
    req,
    res
  ) => {
    try {
      const {
        transcript = "",
        usePython = false,
      } =
        req.body || {};

      const result =
        await speechToText({
          transcript,
          usePython,
        });

      return res
        .status(200)
        .json({
          success: true,

          text:
            result.text,

          transcript:
            result.text,

          source:
            result.source,
        });
    } catch (error) {
      console.error(
        "[VOICE STT ERROR]",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error?.message ||
            "Speech recognition failed.",
        });
    }
  }
);


/* =========================================================
   VOICE → AI

   POST:
       /api/voice/chat

   After microphone recognition, frontend can send the
   transcript here.

   Example:

       {
           "transcript": "show me milk under 100",
           "conversation_id": "...",
           "client_context": {},
           "locale": "en-IN"
       }

   Authorization:

       Bearer <SUPABASE_ACCESS_TOKEN>

   Flow:

       transcript
          ↓
       RAG service
          ↓
       Render FastAPI
          ↓
       Cohere
          ↓
       Supabase / RAG / tools
          ↓
       Groq
          ↓
       structured result
========================================================= */

app.post(
  "/api/voice/chat",

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
          });
      }


      const {
        transcript = "",
        message = "",
        conversation_id =
          null,
        conversationId =
          null,
        client_context = {},
        clientContext = {},
        locale = "en-IN",
      } =
        req.body || {};


      /*
        Accept transcript from microphone.

        We also support message so the same endpoint
        remains flexible.
      */

      const voiceText =
        String(
          transcript ||
          message ||
          ""
        ).trim();


      if (!voiceText) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "No voice transcript was provided.",
          });
      }


      const result =
        await sendVoiceRagQuery({
          transcript:
            voiceText,

          accessToken,

          conversationId:
            conversation_id ||
            conversationId,

          clientContext:
            Object.keys(
              client_context ||
              {}
            ).length
              ? client_context
              : clientContext,

          locale,
        });


      return res
        .status(200)
        .json(
          result
        );
    } catch (error) {
      console.error(
        "[VOICE AI ERROR]",
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
            "Voice assistant request failed.",

          code:
            error?.code ||
            "VOICE_ASSISTANT_ERROR",
        });
    }
  }
);


/* =========================================================
   TEXT TO SPEECH

   POST:
       /api/voice/text-to-speech

   Body:

       {
           "text": "Here are some dairy products.",
           "voice": "en-IN-NeerjaNeural"
       }

   Flow:

       AI text
          ↓
       textToSpeech.js
          ↓
       original TextToSpeech.py
          ↓
       edge_tts
          ↓
       MP3
          ↓
       browser
========================================================= */

app.post(
  "/api/voice/text-to-speech",

  async (
    req,
    res
  ) => {
    try {
      const {
        text = "",
        voice =
          "en-IN-NeerjaNeural",
      } =
        req.body || {};


      if (
        !String(
          text
        ).trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Text is required.",
          });
      }


      const result =
        await textToSpeech({
          text,
          voice,
        });


      /*
        IMPORTANT:

        Do NOT return MP3 as JSON.

        Send actual audio bytes so:

            new Audio(...)
        
        can play it in the browser.
      */

      res.setHeader(
        "Content-Type",
        "audio/mpeg"
      );

      res.setHeader(
        "Content-Length",
        result.audio.length
      );

      res.setHeader(
        "Cache-Control",
        "no-store"
      );

      res.setHeader(
        "X-Assistant-Voice",
        result.voice
      );


      return res.send(
        result.audio
      );
    } catch (error) {
      console.error(
        "[VOICE TTS ERROR]",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error?.message ||
            "Text-to-speech generation failed.",
        });
    }
  }
);


/* =========================================================
   REACT PRODUCTION BUILD

   Render uses one public port.

   Production flow:
       browser
          ↓
       Node / Express
          ↓
       client/dist

   The React/Vite development server is NOT started on Render.
   The client is built during deployment and served by this
   Express process on the same Render port.

   API and health routes above keep their existing behavior.
========================================================= */

if (
  CLIENT_BUILD_EXISTS
) {
  app.use(
    express.static(
      CLIENT_DIST_PATH
    )
  );

  /*
    SPA fallback.

    React Router routes such as:
      /sign_in
      /products
      /assistant

    must return index.html when opened/refreshed directly.

    API paths are intentionally excluded so unknown API routes
    still reach the existing JSON 404 handler below.
  */

  app.use(
    (
      req,
      res,
      next
    ) => {
      const isClientGetRequest =
        req.method ===
          "GET" &&
        !req.path.startsWith(
          "/api/"
        ) &&
        req.path !==
          "/health";

      if (
        !isClientGetRequest
      ) {
        return next();
      }

      return res.sendFile(
        CLIENT_INDEX_PATH
      );
    }
  );
}


/* =========================================================
   404
========================================================= */

app.use(
  (
    req,
    res
  ) => {
    return res
      .status(404)
      .json({
        success: false,

        message:
          "Route not found.",
      });
  }
);


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "[SERVER ERROR]",
      error
    );

    if (
      res.headersSent
    ) {
      return next(
        error
      );
    }

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Internal server error.",
      });
  }
);


/* =========================================================
   START SERVER
========================================================= */

app.listen(
  PORT,
  HOST,
  () => {
    console.log(
      ""
    );

    console.log(
      "========================================="
    );

    console.log(
      "  EchOo Grocery Voice Server"
    );

    console.log(
      "========================================="
    );

    console.log(
      `Server: http://${HOST}:${PORT}`
    );

    console.log(
      `Health: http://${HOST}:${PORT}/health`
    );

    console.log(
      CLIENT_BUILD_EXISTS
        ? "Client: serving client/dist"
        : "Client: build not found (API/voice server only)"
    );

    console.log(
      ""
    );

    console.log(
      "Voice endpoints:"
    );

    console.log(
      `POST http://localhost:${PORT}/api/voice/speech-to-text`
    );

    console.log(
      `POST http://localhost:${PORT}/api/voice/chat`
    );

    console.log(
      `POST http://localhost:${PORT}/api/voice/text-to-speech`
    );

    console.log(
      ""
    );

    console.log(
      "Assistant voice: en-IN-NeerjaNeural"
    );

    console.log(
      "========================================="
    );

    console.log(
      ""
    );
  }
);


/* =========================================================
   EXPORT

   Useful later for testing.
========================================================= */

export default app;