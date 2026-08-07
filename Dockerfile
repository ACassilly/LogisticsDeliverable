# Portlandia Logistics — Next.js 16 standalone Docker image
# Multi-stage build: deps → build → runner

# ── Stage 1: Dependencies ──────────────────────────────────────────
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# ── Stage 2: Build ──────────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* vars are baked at build time
ARG NEXT_PUBLIC_APP_URL=https://portlandialogistics.com
ARG NEXT_PUBLIC_CARRIER_BOOKING_ENABLED=false
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_CARRIER_BOOKING_ENABLED=$NEXT_PUBLIC_CARRIER_BOOKING_ENABLED
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ── Stage 3: Runner ─────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs

# Copy standalone build output + static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
