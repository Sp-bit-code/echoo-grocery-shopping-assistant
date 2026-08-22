import {
  spawn,
} from "node:child_process";

import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
} from "node:fs";

import path from "node:path";

import {
  fileURLToPath,
} from "node:url";


/* =========================================================
   TEXT TO SPEECH SERVICE

   Purpose:
   - Keep original Python TextToSpeech.py untouched
   - Reuse its existing edge_tts generation
   - Do NOT rely on pygame for browser playback
   - Generate MP3 using Python
   - Return MP3 bytes to Node
   - Browser will play the returned audio

   Original Python file:

       server/python/TextToSpeech.py
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
   SERVER PATHS
========================================================= */

const SERVER_ROOT =
  path.resolve(
    __dirname,
    "../.."
  );

const PYTHON_DIRECTORY =
  path.resolve(
    SERVER_ROOT,
    "python"
  );

const TEXT_TO_SPEECH_PYTHON_FILE =
  path.resolve(
    PYTHON_DIRECTORY,
    "TextToSpeech.py"
  );


/* =========================================================
   ORIGINAL PYTHON AUDIO PATH

   Your Python file uses:

       Data\speech.mp3

   On Windows:
       server/Data/speech.mp3

   The service also checks the Linux interpretation of
   the original backslash path so the Python source can
   remain unchanged.
========================================================= */

const DATA_DIRECTORY =
  path.resolve(
    SERVER_ROOT,
    "Data"
  );

const WINDOWS_STYLE_AUDIO_FILE =
  path.resolve(
    DATA_DIRECTORY,
    "speech.mp3"
  );

const LINUX_ORIGINAL_AUDIO_FILE =
  path.resolve(
    SERVER_ROOT,
    "Data\\speech.mp3"
  );


/* =========================================================
   DEFAULT VOICE

   This is NOT a secret.

   Frontend may send:

       VITE_ASSISTANT_VOICE=en-IN-NeerjaNeural

   If it does not, this safe default is used.
========================================================= */

const DEFAULT_ASSISTANT_VOICE =
  "en-IN-NeerjaNeural";


/* =========================================================
   PYTHON COMMAND
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
   ENSURE DATA DIRECTORY EXISTS
========================================================= */

const ensureDataDirectory = () => {
  if (
    !existsSync(
      DATA_DIRECTORY
    )
  ) {
    mkdirSync(
      DATA_DIRECTORY,
      {
        recursive: true,
      }
    );
  }
};


/* =========================================================
   VALIDATE TEXT
========================================================= */

const normalizeText = (
  text
) => {
  const value =
    String(
      text || ""
    ).trim();

  if (!value) {
    throw new Error(
      "Text is required for speech generation."
    );
  }

  /*
    Protect the voice service from accidentally trying
    to generate extremely large audio responses.

    The full response can still remain visible in chat.
  */

  const MAX_TEXT_LENGTH =
    3000;

  return value.slice(
    0,
    MAX_TEXT_LENGTH
  );
};


/* =========================================================
   VALIDATE VOICE
========================================================= */

const normalizeVoice = (
  voice
) => {
  const value =
    String(
      voice ||
        DEFAULT_ASSISTANT_VOICE
    ).trim();

  /*
    Edge TTS voice names normally look like:

       en-IN-NeerjaNeural
       en-US-AriaNeural

    Keep only safe characters.
  */

  if (
    !/^[A-Za-z0-9-]+$/.test(
      value
    )
  ) {
    return DEFAULT_ASSISTANT_VOICE;
  }

  return value;
};


/* =========================================================
   REMOVE OLD AUDIO
========================================================= */

const cleanupAudioFiles = () => {
  const candidates = [
    WINDOWS_STYLE_AUDIO_FILE,
    LINUX_ORIGINAL_AUDIO_FILE,
  ];

  for (
    const filePath
    of candidates
  ) {
    try {
      if (
        existsSync(
          filePath
        )
      ) {
        unlinkSync(
          filePath
        );
      }
    } catch {
      /*
        Cleanup failure should not break
        the entire voice request.
      */
    }
  }
};


/* =========================================================
   FIND GENERATED AUDIO
========================================================= */

const findGeneratedAudioFile =
  () => {
    const candidates = [
      WINDOWS_STYLE_AUDIO_FILE,
      LINUX_ORIGINAL_AUDIO_FILE,
    ];

    for (
      const filePath
      of candidates
    ) {
      if (
        existsSync(
          filePath
        )
      ) {
        return filePath;
      }
    }

    return null;
  };


/* =========================================================
   TTS QUEUE

   The original Python file always writes to:

       Data/speech.mp3

   Therefore two simultaneous requests could overwrite
   each other.

   We serialize Python TTS generation so the ORIGINAL
   Python file does not need to be modified.
========================================================= */

let ttsQueue =
  Promise.resolve();

const queueTTSJob = (
  task
) => {
  const job =
    ttsQueue.then(
      task,
      task
    );

  /*
    Keep queue alive even when one request fails.
  */

  ttsQueue =
    job.catch(
      () => undefined
    );

  return job;
};


/* =========================================================
   RUN ORIGINAL PYTHON EDGE-TTS GENERATION

   We import:

       server/python/TextToSpeech.py

   Then call its ORIGINAL:

       TextToAudioFile(text)

   We override:

       module.AssistantVoice

   at runtime because you want voice configuration on
   the client side rather than a server .env file.

   The Python source itself remains unchanged.
========================================================= */

const generateAudioWithPython =
  ({
    text,
    voice,
    timeoutMs = 45_000,
  }) =>
    new Promise(
      (
        resolve,
        reject
      ) => {
        ensureDataDirectory();
        cleanupAudioFiles();

        const pythonCommand =
          getPythonCommand();

        /*
          Text and voice are passed through stdin as JSON.

          This avoids shell escaping problems with:

          quotes
          ₹
          apostrophes
          Unicode
          Hindi text
          punctuation
        */

        const pythonBridgeCode = `
import sys
import json
import asyncio
import importlib.util

payload = json.loads(sys.stdin.read())

text = str(payload.get("text", "")).strip()
voice = str(payload.get("voice", "en-IN-NeerjaNeural")).strip()

spec = importlib.util.spec_from_file_location(
    "echoo_original_tts",
    r"""${TEXT_TO_SPEECH_PYTHON_FILE.replace(
      /\\/g,
      "\\\\"
    )}"""
)

module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

module.AssistantVoice = voice

asyncio.run(
    module.TextToAudioFile(text)
)

print("ECHOO_TTS_COMPLETE", flush=True)
`;

        let completed =
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
                "-c",
                pythonBridgeCode,
              ],
              {
                cwd:
                  SERVER_ROOT,

                windowsHide:
                  true,

                stdio: [
                  "pipe",
                  "pipe",
                  "pipe",
                ],
              }
            );
        } catch (error) {
          reject(
            new Error(
              `Unable to start text-to-speech: ${
                error?.message ||
                "Python process could not start."
              }`
            )
          );

          return;
        }


        /* =================================================
           FINISH HELPER
        ================================================= */

        const finish = (
          error
        ) => {
          if (completed) {
            return;
          }

          completed =
            true;

          if (timeoutId) {
            clearTimeout(
              timeoutId
            );
          }

          if (
            error &&
            pythonProcess &&
            !pythonProcess.killed
          ) {
            try {
              pythonProcess.kill();
            } catch {
              // Safe cleanup.
            }
          }

          if (error) {
            reject(error);

            return;
          }

          const audioFile =
            findGeneratedAudioFile();

          if (!audioFile) {
            reject(
              new Error(
                "Text-to-speech completed but no audio file was generated."
              )
            );

            return;
          }

          try {
            const audioBuffer =
              readFileSync(
                audioFile
              );

            /*
              Remove temporary file after loading
              it into memory.
            */

            try {
              unlinkSync(
                audioFile
              );
            } catch {
              // Safe cleanup only.
            }

            resolve(
              audioBuffer
            );
          } catch (readError) {
            reject(
              new Error(
                `Unable to read generated speech audio: ${
                  readError?.message ||
                  "Unknown file error."
                }`
              )
            );
          }
        };


        /* =================================================
           TIMEOUT
        ================================================= */

        timeoutId =
          setTimeout(
            () => {
              finish(
                new Error(
                  "Text-to-speech generation timed out."
                )
              );
            },
            timeoutMs
          );


        /* =================================================
           SEND PAYLOAD TO PYTHON
        ================================================= */

        try {
          pythonProcess.stdin.write(
            JSON.stringify({
              text,
              voice,
            })
          );

          pythonProcess.stdin.end();
        } catch (error) {
          finish(
            new Error(
              `Unable to send text to Python: ${
                error?.message ||
                "Unknown error."
              }`
            )
          );

          return;
        }


        /* =================================================
           STDOUT
        ================================================= */

        pythonProcess.stdout.on(
          "data",
          (chunk) => {
            stdoutBuffer +=
              chunk.toString(
                "utf8"
              );
          }
        );


        /* =================================================
           STDERR
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
           PYTHON PROCESS ERROR
        ================================================= */

        pythonProcess.on(
          "error",
          (error) => {
            finish(
              new Error(
                `Text-to-speech process failed: ${
                  error?.message ||
                  "Unknown Python error."
                }`
              )
            );
          }
        );


        /* =================================================
           PYTHON PROCESS CLOSED
        ================================================= */

        pythonProcess.on(
          "close",
          (code) => {
            if (completed) {
              return;
            }

            const generatedFile =
              findGeneratedAudioFile();

            if (
              code === 0 &&
              generatedFile
            ) {
              finish(null);

              return;
            }

            const cleanError =
              String(
                stderrBuffer || ""
              ).trim();

            if (cleanError) {
              finish(
                new Error(
                  `Text-to-speech failed: ${cleanError}`
                )
              );

              return;
            }

            if (
              stdoutBuffer.includes(
                "ECHOO_TTS_COMPLETE"
              ) &&
              generatedFile
            ) {
              finish(null);

              return;
            }

            finish(
              new Error(
                `Text-to-speech stopped without generating audio${
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
   PUBLIC TEXT-TO-SPEECH FUNCTION
========================================================= */

export const textToSpeech =
  async ({
    text = "",
    voice =
      DEFAULT_ASSISTANT_VOICE,
  } = {}) => {
    const normalizedText =
      normalizeText(
        text
      );

    const normalizedVoice =
      normalizeVoice(
        voice
      );

    /*
      Queue generation because your original
      Python code writes one fixed speech.mp3.
    */

    const audioBuffer =
      await queueTTSJob(
        () =>
          generateAudioWithPython({
            text:
              normalizedText,

            voice:
              normalizedVoice,
          })
      );

    return {
      success: true,

      audio:
        audioBuffer,

      contentType:
        "audio/mpeg",

      voice:
        normalizedVoice,
    };
  };


/* =========================================================
   GENERATE ONLY AUDIO BUFFER

   Useful directly from an Express route:

       const audio = await generateSpeechBuffer(...)

       res.type("audio/mpeg")
       res.send(audio)
========================================================= */

export const generateSpeechBuffer =
  async ({
    text,
    voice =
      DEFAULT_ASSISTANT_VOICE,
  } = {}) => {
    const result =
      await textToSpeech({
        text,
        voice,
      });

    return result.audio;
  };


/* =========================================================
   PUBLIC VOICE INFORMATION
========================================================= */

export const getDefaultAssistantVoice =
  () =>
    DEFAULT_ASSISTANT_VOICE;


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  textToSpeech,
  generateSpeechBuffer,
  getDefaultAssistantVoice,
};