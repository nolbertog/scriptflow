# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package.json ./
COPY packages/backend ./packages/backend

# Install dependencies
RUN npm install

# Generate Prisma client
RUN cd packages/backend && npx prisma generate

# Build TypeScript
RUN cd packages/backend && npx tsc

# ---- Production Stage ----
FROM node:20-alpine

WORKDIR /app

# Install SQLite runtime dependency
RUN apk add --no-cache sqlite

# Copy built artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/package.json ./packages/backend/
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3001

# Run migrations and start server
CMD cd packages/backend && \
    npx prisma migrate deploy && \
    npx prisma generate && \
    node dist/index.js
