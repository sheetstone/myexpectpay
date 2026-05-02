# ── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

RUN npm run build

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
# Store as template — envsubst fills in BACKEND_URL at container start
COPY nginx.conf /etc/nginx/templates/nginx.conf.template

EXPOSE 80

# envsubst replaces ${BACKEND_URL} at runtime before nginx starts
# BACKEND_URL defaults to local dev value if not set (for docker compose compatibility)
ENV BACKEND_URL=http://backend:3001
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
