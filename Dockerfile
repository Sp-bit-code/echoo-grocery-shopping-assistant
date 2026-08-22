# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app


# =========================================================
# SYSTEM + PYTHON
# =========================================================

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        python3-venv \
        libgomp1 \
        curl \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*


# =========================================================
# PYTHON VIRTUAL ENVIRONMENT
# =========================================================

RUN python3 -m venv /opt/venv

ENV PATH="/opt/venv/bin:$PATH"


# =========================================================
# PYTHON DEPENDENCIES
# =========================================================

COPY requirements.txt ./requirements.txt

RUN python -m pip install --upgrade pip \
    && python -m pip install -r requirements.txt


# =========================================================
# SERVER NODE DEPENDENCIES
# =========================================================

COPY server/package*.json ./server/

RUN cd server \
    && if [ -f package-lock.json ]; then \
         npm ci --omit=dev; \
       else \
         npm install --omit=dev; \
       fi


# =========================================================
# CLIENT NODE DEPENDENCIES
# =========================================================

COPY client/package*.json ./client/

RUN cd client \
    && if [ -f package-lock.json ]; then \
         npm ci; \
       else \
         npm install; \
       fi


# =========================================================
# COPY PROJECT
# =========================================================

COPY . .


# =========================================================
# VITE BUILD VARIABLES
#
# Render converts environment variables into Docker build
# arguments automatically.
#
# Only browser-safe VITE_* values should be used here.
# NEVER add GROQ / COHERE / SUPABASE SECRET KEY here.
# =========================================================

ARG VITE_ASSISTANT_API_URL
ARG VITE_VOICE_API_URL
ARG VITE_ASSISTANT_VOICE
ARG VITE_INPUT_LANGUAGE

ENV VITE_ASSISTANT_API_URL=${VITE_ASSISTANT_API_URL} \
    VITE_VOICE_API_URL=${VITE_VOICE_API_URL} \
    VITE_ASSISTANT_VOICE=${VITE_ASSISTANT_VOICE} \
    VITE_INPUT_LANGUAGE=${VITE_INPUT_LANGUAGE}


# =========================================================
# BUILD REACT CLIENT
# =========================================================

RUN cd client \
    && npm run build


# =========================================================
# RUNTIME
#
# Render provides PORT automatically.
# server/src/index.js uses:
#
# process.env.PORT || 5000
#
# Express serves client/dist on the same port.
# =========================================================

EXPOSE 10000


# =========================================================
# HEALTH CHECK
# =========================================================

HEALTHCHECK --interval=30s \
    --timeout=5s \
    --start-period=60s \
    --retries=3 \
    CMD sh -c 'curl -fsS "http://127.0.0.1:${PORT:-10000}/health" || exit 1'


# =========================================================
# START NODE SERVER
# =========================================================

CMD ["sh", "-c", "cd /app/server && exec npm start"]