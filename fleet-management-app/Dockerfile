# ===============================
# Dependencies Stage
# ===============================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# ===============================
# Builder Stage
# ===============================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PHASE=phase-production-build

# Build arguments for public environment variables (baked into client bundle)
ARG NEXT_PUBLIC_VEHICLE_SERVICE_URL
ARG NEXT_PUBLIC_MAINTENANCE_SERVICE_URL
ARG NEXT_PUBLIC_DRIVER_SERVICE_URL
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_VEHICLE_SERVICE_URL=$NEXT_PUBLIC_VEHICLE_SERVICE_URL
ENV NEXT_PUBLIC_MAINTENANCE_SERVICE_URL=$NEXT_PUBLIC_MAINTENANCE_SERVICE_URL
ENV NEXT_PUBLIC_DRIVER_SERVICE_URL=$NEXT_PUBLIC_DRIVER_SERVICE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Set values for auth variables during build (from .env.local)
# These are overridden by runtime environment variables in docker-compose
ENV KEYCLOAK_ID=fleet-management-frontend
ENV KEYCLOAK_SECRET=SAbDvDUa4Mta8ZGaHq9t8bFYSBAaE7oQ
ENV KEYCLOAK_ISSUER=http://localhost:8080/realms/fleet-management-app
ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXTAUTH_SECRET=12345678901234567890123456789012

# Build the Next.js application
RUN npm run build

# ===============================
# Runtime Stage
# ===============================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check (K8s will use /api/health endpoint)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the application with graceful shutdown support
CMD ["node", "server.js"]

