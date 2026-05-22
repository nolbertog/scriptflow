# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configuration files first (for layer caching)
COPY package.json package-lock.json ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

# Install ALL dependencies (workspaces, devDependencies for building)
RUN npm ci

# Copy backend source code
COPY packages/backend ./packages/backend

# Generate Prisma client and build TypeScript
RUN cd packages/backend && npx prisma generate && npx tsc

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

# Install SQLite runtime dependency
RUN apk add --no-cache sqlite

# Copy only production-necessary artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/package.json ./packages/backend/
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma
COPY --from=builder /app/package.json ./

EXPOSE 3001

# Run migrations, generate Prisma client, and start server
CMD cd packages/backend && \
    npx prisma migrate deploy && \
    npx prisma generate && \
    node dist/index.js
