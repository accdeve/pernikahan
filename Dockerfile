# ============================================================
# Stage 1: Install dependencies (shared between dev & prod)
# ============================================================
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ============================================================
# Stage 2: Development — Vite dev server with HMR
# ============================================================
FROM node:24-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
# Default command is overridden in docker-compose.yml
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ============================================================
# Stage 3: Production build
# ============================================================
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ============================================================
# Stage 4: Production — nginx serves static SPA
# ============================================================
FROM nginx:stable-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
