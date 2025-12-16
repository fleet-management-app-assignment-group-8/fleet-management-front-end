# =========================
# Base image
# =========================
FROM node:20-alpine AS base
WORKDIR /app

# =========================
# Install dependencies
# =========================
FROM base AS deps

# Copy only package files
COPY package*.json ./

# Install dependencies
RUN npm install

# =========================
# Build the Next.js app
# =========================
FROM deps AS build

# Copy the rest of the app source
COPY . .

# Disable Next telemetry (optional)
ENV NEXT_TELEMETRY_DISABLED=1

# Build for production (uses Turbopack under the hood in Next 15)
RUN npm run build

# =========================
# Production runtime image
# =========================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup -g 1001 nodejs \
  && adduser -D -G nodejs nextjs

# Copy only the standalone output and static files
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs

# Next.js default port
EXPOSE 3000

# Start the production server using standalone output
CMD ["node", "server.js"]
