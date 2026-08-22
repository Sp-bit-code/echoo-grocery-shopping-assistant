import {
  spawn,
} from "node:child_process";

import path from "node:path";

import {
  fileURLToPath,
} from "node:url";

/* =========================================================
   SPEECH TO TEXT SERVICE

   Purpose:
   - Keep original Python SpeechToText.py untouched
   - Allow Node server to execute the Python STT file
   - Read recognized speech from Python stdout
   - Return recognized text back to the application

   Original Python file:
   server/python/SpeechToText.py
========================================================= */


/* =========================================================
   CURRENT FILE PATH
========================================================= */

const __filename =
  fileURLToPath(
    import.meta.url
  );

const __dirname =
  path.dirname(
    __filename
  );


/* =========================================================
   PYTHON FILE PATH

   Current file:
   server/src/services/speechToText.js

   Python file:
   server/python/SpeechToText.py
========================================================= */

const SPEECH_TO_TEXT_PYTHON_FILE =
  path.resolve(
    __dirname,
    "../../python/SpeechToText.py"
  );


/* =========================================================
   PYTHON COMMAND

   Windows:
       python

   Render / Linux:
       python3

   No server .env required.
========================================================= */

const getPythonCommand = () => {
  if (
    process.platform ===
    "win32"
  ) {
    return "python";
  }

  return "python3";
};


/* =========================================================
   CLEAN TRANSCRIPT
========================================================= */

const cleanTranscript = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replace(/\r/g, "")
    .trim();
};


/* =========================================================
   BROWSER TRANSCRIPT NORMALIZER

   When Chrome / Edge / browser recognition gives us
   text directly, we can pass it through here.

   This means the frontend microphone can later send:

       "show me milk"

   and we return:

       "show me milk"

   No unnecessary modification is done.
========================================================= */

export const normalizeSpeechTranscript = (
  transcript
) => {
  const cleaned =
    cleanTranscript(
      transcript
    );

  if (!cleaned) {
    throw new Error(
      "No speech was detected."
    );
  }

  return cleaned;
};


/* =========================================================
   RUN ORIGINAL PYTHON SPEECH RECOGNITION

   IMPORTANT:

   Your original Python file contains:

       while True:
           Text = SpeechRecognition()
           print(Text)

   Because it continuously listens, Node reads the first
   recognized result and then stops that Python process.

   The original Python file itself does NOT need changing.
========================================================= */

export const recognizeSpeechWithPython =
  ({
    timeoutMs = 60_000,
  } = {}) =>
    new Promise(
      (
        resolve,
        reject
      ) => {
        const pythonCommand =
          getPythonCommand();

        let finished =
          false;

        let stdoutBuffer =
          "";

        let stderrBuffer =
          "";

        let timeoutId =
          null;

        let pythonProcess;

        try {
          pythonProcess =
            spawn(
              pythonCommand,
              [
                SPEECH_TO_TEXT_PYTHON_FILE,
              ],
              {
                cwd:
                  path.dirname(
                    SPEECH_TO_TEXT_PYTHON_FILE
                  ),

                windowsHide:
                  true,

                stdio: [
                  "ignore",
                  "pipe",
                  "pipe",
                ],
              }
            );
        } catch (error) {
          reject(
            new Error(
              `Unable to start speech recognition: ${
                error?.message ||
                "Python process failed."
              }`
            )
          );

          return;
        }


        /* =================================================
           FINISH HELPER
        ================================================= */

        const finish = (
          error,
          transcript = ""
        ) => {
          if (finished) {
            return;
          }

          finished =
            true;

          if (timeoutId) {
            clearTimeout(
              timeoutId
            );
          }

          /*
            Original Python script runs continuously.

            Once we receive one recognized sentence,
            we stop the process.
          */

          if (
            pythonProcess &&
            !pythonProcess.killed
          ) {
            try {
              pythonProcess.kill();
            } catch {
              // Safe cleanup only.
            }
          }

          if (error) {
            reject(error);

            return;
          }

          resolve(
            normalizeSpeechTranscript(
              transcript
            )
          );
        };


        /* =================================================
           TIMEOUT
        ================================================= */

        timeoutId =
          setTimeout(
            () => {
              finish(
                new Error(
                  "Speech recognition timed out. Please try again."
                )
              );
            },
            timeoutMs
          );


        /* =================================================
           PYTHON STDOUT

           Python:

               print(Text)

           Node receives that text here.
        ================================================= */

        pythonProcess.stdout.on(
          "data",
          (chunk) => {
            stdoutBuffer +=
              chunk.toString(
                "utf8"
              );

            const lines =
              stdoutBuffer
                .replace(
                  /\r/g,
                  ""
                )
                .split("\n");

            /*
              Keep incomplete final line for next chunk.
            */

            stdoutBuffer =
              lines.pop() || "";

            for (
              const line
              of lines
            ) {
              const transcript =
                cleanTranscript(
                  line
                );

              if (
                transcript
              ) {
                finish(
                  null,
                  transcript
                );

                return;
              }
            }
          }
        );


        /* =================================================
           PYTHON STDERR
        ================================================= */

        pythonProcess.stderr.on(
          "data",
          (chunk) => {
            stderrBuffer +=
              chunk.toString(
                "utf8"
              );
          }
        );


        /* =================================================
           PROCESS ERROR
        ================================================= */

        pythonProcess.on(
          "error",
          (error) => {
            finish(
              new Error(
                `Speech recognition could not start: ${
                  error?.message ||
                  "Unknown Python error."
                }`
              )
            );
          }
        );


        /* =================================================
           PROCESS CLOSE
        ================================================= */

        pythonProcess.on(
          "close",
          (code) => {
            if (finished) {
              return;
            }

            /*
              Sometimes Python may print the result without
              a newline before terminating.
            */

            const remainingText =
              cleanTranscript(
                stdoutBuffer
              );

            if (
              remainingText
            ) {
              finish(
                null,
                remainingText
              );

              return;
            }

            const pythonError =
              cleanTranscript(
                stderrBuffer
              );

            if (
              pythonError
            ) {
              finish(
                new Error(
                  `Speech recognition failed: ${pythonError}`
                )
              );

              return;
            }

            finish(
              new Error(
                `Speech recognition stopped without returning text${
                  code !== null
                    ? ` (exit code ${code})`
                    : ""
                }.`
              )
            );
          }
        );
      }
    );


/* =========================================================
   MAIN SERVICE FUNCTION

   Supports two modes.

   1. Browser transcript:

       speechToText({
           transcript: "show me milk"
       })

   2. Original Python recognition:

       speechToText({
           usePython: true
       })

========================================================= */

export const speechToText =
  async ({
    transcript = "",
    usePython = false,
  } = {}) => {
    /*
      Browser microphone path.

      This will be the preferred website path because
      microphone permission belongs to the user's browser.
    */

    if (
      transcript &&
      String(
        transcript
      ).trim()
    ) {
      return {
        success: true,

        text:
          normalizeSpeechTranscript(
            transcript
          ),

        source:
          "browser",
      };
    }

    /*
      Original Python path.

      This keeps your existing SpeechToText.py usable.
    */

    if (usePython) {
      const text =
        await recognizeSpeechWithPython();

      return {
        success: true,

        text,

        source:
          "python",
      };
    }

    throw new Error(
      "No speech transcript was provided."
    );
  };


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  speechToText,
  recognizeSpeechWithPython,
  normalizeSpeechTranscript,
};