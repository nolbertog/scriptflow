# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package.json ./
COPY packages/frontend ./packages/frontend

# Install dependencies
RUN npm install

# Build the frontend
RUN cd packages/frontend && npx vite build

# ---- Nginx Stage ----
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Copy custom nginx config
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
