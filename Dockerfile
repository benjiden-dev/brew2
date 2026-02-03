# Build Stage
FROM node:20-alpine as builder

WORKDIR /app

# Install dependencies strictly
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production Stage - Hardened
# Use unprivileged alpine image to run as non-root user (nginx user: 101)
FROM nginxinc/nginx-unprivileged:alpine

# Metadata
LABEL maintainer="Ben"
LABEL description="Brew2 - Secure Coffee Timer PWA"

# Copy hardened config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy build artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose unprivileged port
EXPOSE 8080

# Health check (requires curl installed in alpine, but nginx-unprivileged based on alpine might wait.. 
# actually let's skip complex healthcheck instruction inside Dockerfile to keep it light, 
# or use wget which comes with alpine)
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/health || exit 1

# Run as non-root is default in this image, but being explicit doesn't hurt
USER 101

CMD ["nginx", "-g", "daemon off;"]
