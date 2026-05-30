# Stage 1: Build the application
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the application for production (compiles TS to JS under build/ and builds Vite assets)
RUN npm run build

# Stage 2: Production release
FROM node:24-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# Copy the build artifacts from the builder stage
COPY --from=builder /app/build ./

# Install production-only dependencies
RUN npm ci --omit=dev

# Expose port 3333 (AdonisJS default)
EXPOSE 3333

# Start the server
CMD ["node", "bin/server.js"]
