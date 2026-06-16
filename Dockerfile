# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package configurations first to leverage build caching
COPY package*.json ./

# Install all dependencies (including devDependencies required for building)
RUN npm ci

# Copy the rest of the source files
COPY . .

# Build both the React frontend (Vite) and the compiled Express server (esbuild)
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Inform Node and other libraries that we are in production mode
ENV NODE_ENV=production
ENV PORT=3000

# Copy package files to install production dependencies
COPY package*.json ./

# Install only production-level dependencies to minimize image size
RUN npm ci --only=production

# Copy the compiled distribution files (contains frontend public assets and dist/server.cjs bundle)
COPY --from=builder /app/dist ./dist

# Expose port 3000 as configured in server.ts
EXPOSE 3000

# Run the backend production server
CMD ["npm", "run", "start"]
