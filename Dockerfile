# ============================================
# Stage 1: Build the React frontend
# ============================================
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files and install dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# Copy frontend source and build
COPY frontend/ ./

# Set the API URL to use relative paths in production
# (frontend and backend served from same origin)
ENV REACT_APP_API_URL=/api

RUN npm run build

# ============================================
# Stage 2: Production backend + built frontend
# ============================================
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy backend package files and install production dependencies only
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend from stage 1
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Create uploads directory
RUN mkdir -p /app/backend/uploads && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5001

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/api/health || exit 1

# Start the server
WORKDIR /app/backend
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
