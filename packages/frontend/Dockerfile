# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configuration files first (for layer caching)
COPY package.json package-lock.json ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/backend/package.json ./packages/backend/

# Install ALL dependencies (workspaces, devDependencies for building)
RUN npm ci

# Copy frontend source code
COPY packages/frontend ./packages/frontend

# Build the frontend (runs tsc + vite build via npm script)
RUN cd packages/frontend && npm run build

# ---- Nginx Stage ----
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Copy custom nginx config
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
